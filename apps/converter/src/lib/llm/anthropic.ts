// Anthropic Claude Haiku 4.5 client for UD Converter v2.
//
// Per Sonny's amendment: Anthropic is gated to Pro tier ($29/month) only.
// Free + Plus tiers exclusively use Groq. This module exposes a single
// extraction function; the orchestrator gates calls by `userTier === 'pro'`
// before invoking it.
//
// The actual extraction logic mirrors PR #2's `extractPdfViaAnthropic` —
// `claude-haiku-4-5-20251001`, base64 PDF payload, max_tokens 16384 to
// avoid silent truncation on multi-page documents. Refactored out of
// convert.ts so the orchestrator can call it as a standalone module.

import Anthropic from '@anthropic-ai/sdk'

const ANTHROPIC_MODEL = 'claude-haiku-4-5-20251001'
const ANTHROPIC_MAX_TOKENS = 16384

// Pricing per million tokens — verified against Anthropic pricing page.
const ANTHROPIC_PRICING_PER_MILLION = {
  input_usd: 1.0,
  output_usd: 5.0,
}

export type AnthropicResult = {
  ok: true
  text: string
  input_tokens: number
  output_tokens: number
  estimated_cost_usd: number
  model: string
}

export type AnthropicError = {
  ok: false
  reason: 'no-api-key' | 'auth-failed' | 'tier-not-allowed' | 'network' | 'other'
  message: string
}

/**
 * Run Anthropic Haiku 4.5 PDF extraction. Pro-tier-only path: callers MUST
 * verify the user's tier before invoking this. If `userTier !== 'pro'`,
 * returns `tier-not-allowed` instead of making the API call so a billing
 * accident on the Free/Plus path can't accidentally rack up costs.
 *
 * Same prompt as PR #2's existing path: extract all text, preserve heading
 * + paragraph structure, mark page boundaries, plain text only.
 */
export async function anthropicExtractFromPdf(opts: {
  buffer: Buffer
  userTier: 'free' | 'plus' | 'pro' | 'unknown'
}): Promise<AnthropicResult | AnthropicError> {
  if (opts.userTier !== 'pro') {
    return {
      ok: false,
      reason: 'tier-not-allowed',
      message: 'Anthropic Haiku extraction is a Pro-tier feature. Free and Plus tiers use Groq exclusively.',
    }
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return {
      ok: false,
      reason: 'no-api-key',
      message: 'ANTHROPIC_API_KEY is not configured.',
    }
  }

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await (client.messages.create as any)({
      model: ANTHROPIC_MODEL,
      max_tokens: ANTHROPIC_MAX_TOKENS,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'document',
            source: {
              type: 'base64',
              media_type: 'application/pdf',
              data: opts.buffer.toString('base64'),
            },
          },
          {
            type: 'text',
            text: 'Extract all text from this PDF. Preserve headings and paragraph structure. Mark page boundaries with "--- Page N ---" lines. Output plain text only, no commentary.',
          },
        ],
      }],
    })

    const text = (response.content as Anthropic.ContentBlock[])
      .filter(b => b.type === 'text')
      .map(b => (b as Anthropic.TextBlock).text)
      .join('\n')

    const inputTokens = response.usage?.input_tokens ?? 0
    const outputTokens = response.usage?.output_tokens ?? 0
    const cost =
      (inputTokens * ANTHROPIC_PRICING_PER_MILLION.input_usd
        + outputTokens * ANTHROPIC_PRICING_PER_MILLION.output_usd) / 1_000_000

    return {
      ok: true,
      text,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      estimated_cost_usd: cost,
      model: ANTHROPIC_MODEL,
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    const lower = msg.toLowerCase()
    if (lower.includes('401') || lower.includes('403') || lower.includes('auth')) {
      return { ok: false, reason: 'auth-failed', message: msg }
    }
    return { ok: false, reason: 'other', message: msg }
  }
}
