// Groq Llama 3.1 8B Instant client for UD Converter v2.
//
// Sole LLM for Free + Plus tiers (per Sonny's amendment: cheapest is the
// goal; quality secondary). Uses plain fetch — no SDK dep — to keep the
// serverless bundle small.
//
// Rate-limit tiers (Llama 3.1 8B Instant on the Free plan, Groq pricing
// page as of today):
//   RPM: 30  ·  RPD: 14,400  ·  TPM: 6,000  ·  TPD: 500,000
//
// Paid tier: $0.05/MTok input · $0.08/MTok output (no separate Developer
// plan; once you upgrade the Groq account, the same key bills at paid
// rates). This module supports an optional GROQ_API_KEY_PAID env var so
// teams that maintain a free account + a paid account can fall back from
// free → paid on a 429. With only GROQ_API_KEY set, a 429 surfaces to the
// orchestrator as a rate-limit error.

const GROQ_BASE = 'https://api.groq.com/openai/v1'
const GROQ_MODEL = 'llama-3.1-8b-instant'

// Pricing per million tokens — verified against Groq pricing page.
const GROQ_PRICING_PER_MILLION = {
  input_usd: 0.05,
  output_usd: 0.08,
}

// Confidence heuristic. Groq doesn't return a quality score, so we infer
// from the response shape:
//   - 'high'   = response is non-empty, doesn't look like a refusal/apology,
//                and the output token count is at least 5% of input tokens
//                (i.e. the model actually engaged with the content).
//   - 'medium' = non-empty but short relative to input (could be partial).
//   - 'low'    = empty, refusal-like, or extraction returned nothing useful.
//                Orchestrator surfaces a "may be incomplete" message to the
//                user when confidence is low.
export type GroqConfidence = 'high' | 'medium' | 'low'

export type GroqResult = {
  ok: true
  text: string
  confidence: GroqConfidence
  input_tokens: number
  output_tokens: number
  estimated_cost_usd: number
  tier_used: 'free' | 'paid'
  model: string
}

export type GroqError = {
  ok: false
  reason: 'rate-limited' | 'auth-failed' | 'no-api-key' | 'network' | 'other'
  message: string
  status?: number
}

type ChatCompletion = {
  choices?: Array<{
    message?: { content?: string }
    finish_reason?: string
  }>
  usage?: {
    prompt_tokens?: number
    completion_tokens?: number
  }
}

const REFUSAL_MARKERS = [
  "i can't",
  "i cannot",
  "i'm sorry",
  "i am sorry",
  "i'm unable",
  "i am unable",
  "as an ai",
]

function inferConfidence(text: string, inputTokens: number, outputTokens: number): GroqConfidence {
  const trimmed = text.trim()
  if (trimmed.length === 0) return 'low'
  const lower = trimmed.slice(0, 200).toLowerCase()
  if (REFUSAL_MARKERS.some(m => lower.startsWith(m))) return 'low'
  if (outputTokens === 0) return 'low'
  // If the model returned far less than input would suggest is reasonable,
  // call it medium. The 5% floor is a coarse signal — a true extraction of
  // a 1k-token PDF should produce hundreds of tokens of output, not 10.
  const ratio = outputTokens / Math.max(1, inputTokens)
  if (ratio < 0.05) return 'medium'
  return 'high'
}

async function callGroq(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number,
): Promise<{ status: number; body: ChatCompletion | null; raw: string }> {
  const res = await fetch(`${GROQ_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userPrompt },
      ],
      max_tokens: maxTokens,
      temperature: 0,  // deterministic extraction — no creativity needed
    }),
  })
  const raw = await res.text()
  let body: ChatCompletion | null = null
  try { body = raw ? JSON.parse(raw) as ChatCompletion : null } catch { body = null }
  return { status: res.status, body, raw }
}

/**
 * Run text extraction / transformation through Groq Llama 3.1 8B Instant.
 *
 * Try free key first (GROQ_API_KEY). On 429 (rate-limited), fall back to
 * paid key (GROQ_API_KEY_PAID) if configured. Returns either a
 * `GroqResult` (success) or `GroqError` (caller decides whether to escalate
 * or surface to user — orchestrator-level concern).
 *
 * Cost is calculated only on the paid tier; free tier is logged at $0
 * since Groq doesn't bill free-plan calls.
 */
export async function groqExtract(opts: {
  systemPrompt: string
  userPrompt: string
  maxTokens?: number
}): Promise<GroqResult | GroqError> {
  const maxTokens = opts.maxTokens ?? 4096
  const freeKey = process.env.GROQ_API_KEY
  const paidKey = process.env.GROQ_API_KEY_PAID

  if (!freeKey && !paidKey) {
    return {
      ok: false,
      reason: 'no-api-key',
      message: 'GROQ_API_KEY is not configured. Conversion route requires Groq for non-pure-library paths.',
    }
  }

  // Try free first if available, else go straight to paid.
  const firstKey = freeKey ?? paidKey!
  const firstTier: 'free' | 'paid' = freeKey ? 'free' : 'paid'

  const first = await callGroq(firstKey, opts.systemPrompt, opts.userPrompt, maxTokens)

  if (first.status === 429 && firstTier === 'free' && paidKey) {
    // Free-tier rate-limited; retry on paid.
    const second = await callGroq(paidKey, opts.systemPrompt, opts.userPrompt, maxTokens)
    return interpretResponse(second.status, second.body, second.raw, 'paid')
  }

  return interpretResponse(first.status, first.body, first.raw, firstTier)
}

function interpretResponse(
  status: number,
  body: ChatCompletion | null,
  raw: string,
  tier: 'free' | 'paid',
): GroqResult | GroqError {
  if (status === 429) {
    return {
      ok: false,
      reason: 'rate-limited',
      message: 'Groq rate limit exceeded. Conversion may be incomplete on complex documents. Upgrade to Pro for higher accuracy on hard PDFs.',
      status,
    }
  }
  if (status === 401 || status === 403) {
    return {
      ok: false,
      reason: 'auth-failed',
      message: 'Groq authentication failed. Check GROQ_API_KEY env var.',
      status,
    }
  }
  if (status < 200 || status >= 300 || !body) {
    return {
      ok: false,
      reason: 'other',
      message: `Groq returned ${status}: ${raw.slice(0, 200)}`,
      status,
    }
  }

  const text = body.choices?.[0]?.message?.content ?? ''
  const inputTokens = body.usage?.prompt_tokens ?? 0
  const outputTokens = body.usage?.completion_tokens ?? 0

  const cost =
    tier === 'paid'
      ? (inputTokens * GROQ_PRICING_PER_MILLION.input_usd
          + outputTokens * GROQ_PRICING_PER_MILLION.output_usd) / 1_000_000
      : 0

  return {
    ok: true,
    text,
    confidence: inferConfidence(text, inputTokens, outputTokens),
    input_tokens: inputTokens,
    output_tokens: outputTokens,
    estimated_cost_usd: cost,
    tier_used: tier,
    model: GROQ_MODEL,
  }
}
