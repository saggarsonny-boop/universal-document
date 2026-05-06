// UD Converter v2 — orchestrator. Foundation for the smart-routing rebuild.
//
// PR A scope (this PR): the orchestrator decides routes via router.ts and
// records cost telemetry via db.logConversionCost. It does NOT yet hijack
// the existing /api/convert PDF→UDS path — PR #2's per-page graceful
// degradation in convert.ts is preserved. New format pairs (pure-lib /
// tesseract / groq-llama / anthropic-haiku) are recognized but their
// converter implementations land in PR B.
//
// Per Sonny's amendment (cheapest stack, quality secondary):
//   - Free + Plus tiers use Groq exclusively; no auto-cascade to Anthropic.
//   - On Groq low-confidence or rate-limit, return result with a
//     `mayBeIncomplete` flag and a user-facing upgrade hint.
//   - Pro tier ($29/mo) MAY opt into Anthropic Haiku as a higher-quality
//     fallback (caller decides; orchestrator gates the call).
//
// The orchestrator never throws on a recoverable conversion error — it
// returns a structured `OrchestratorResult` with `success: false` and a
// human-readable `errorMessage` so route handlers can surface specifics
// (PR #2's pattern, generalised).

import { logConversionCost } from './db'
import { chooseRoute, detectFormat, type Complexity, type InputFormat, type OutputFormat, type Route } from './router'
import { groqExtract, type GroqResult, type GroqError } from './llm/groq'
import { anthropicExtractFromPdf, type AnthropicResult, type AnthropicError } from './llm/anthropic'

export type UserTier = 'free' | 'plus' | 'pro' | 'unknown'

export type OrchestratorInput = {
  buffer: Buffer
  fileName: string
  outputFormat: OutputFormat
  userTier: UserTier
  /** When true and userTier === 'pro', orchestrator may use Anthropic for low-confidence Groq results. Default: false. */
  proAnthropicOptIn?: boolean
  /** Hint about input difficulty. Orchestrator may upgrade simple→complex internally after a first-attempt parse. */
  complexity?: Complexity
}

export type OrchestratorResult = {
  success: boolean
  /** Set when success === true. The converted file (or extracted text wrapped in the format-appropriate container). */
  buffer?: Buffer
  /** Always set — telemetry. */
  routeUsed: Route
  inputFormat: InputFormat
  outputFormat: OutputFormat
  /** Estimated cost of THIS conversion in USD. Pure-lib + tesseract = 0; LLM routes have non-zero only when paid-tier was used. */
  estimatedCostUsd: number
  inputTokens: number
  outputTokens: number
  processingTimeMs: number
  /** Per-page or per-stage warnings (PR #2's pattern, generalised). */
  warnings: string[]
  /** Set when the LLM returned low-confidence output. Free/Plus tier callers should surface this to users. */
  mayBeIncomplete?: boolean
  /** Set when success === false. Human-readable reason. */
  errorMessage?: string
  /** Set when an upgrade message is appropriate (free/plus user hit Groq's accuracy ceiling on a hard doc). */
  upgradeHint?: string
}

// Soft timeout marker. Vercel kills serverless functions at 30s; we leave
// a 5s safety buffer so the orchestrator returns a structured timeout
// error before Vercel returns a generic 504. Callers should pass this
// into long-running converters (PR B) as a budget.
export const SOFT_TIMEOUT_MS = 25_000

const FREE_PLUS_UPGRADE_HINT =
  'Conversion may be incomplete on complex documents. Upgrade to Pro for higher accuracy on hard PDFs.'

/**
 * Decide the route for an (input, output, userTier) tuple WITHOUT executing
 * the conversion. Used by the route handler to log telemetry early and to
 * present the user with a meaningful "Processing via X" status when PR
 * C's UI lands. Pure function — no side effects, no DB writes.
 */
export function decideRoute(input: OrchestratorInput): {
  route: Route
  inputFormat: InputFormat
} {
  const inputFormat = detectFormat({
    name: input.fileName,
    bytes: input.buffer.subarray(0, 32),
  })
  const route = chooseRoute(inputFormat, input.outputFormat, input.complexity ?? 'simple')
  return { route, inputFormat }
}

/**
 * Run a conversion through the orchestrator. PR A delivers the route-
 * selection + cost-telemetry skeleton; the actual converter implementations
 * for pure-lib / tesseract paths land in PR B. Today, calling this with a
 * route other than `existing-uds-pipeline` returns a `success: false`
 * result with a "not yet implemented in this version" error so PR A can
 * ship without behaviour regressions.
 *
 * The route handler in /api/convert continues to call its existing
 * convert.ts functions for the PDF→UDS path; this orchestrator runs in
 * parallel as a feature-flagged telemetry layer (see `UD_CONVERTER_V2`
 * env var). When PR B wires up real converters, the route handler will
 * delegate primary execution to this function for new format pairs.
 */
export async function orchestrate(input: OrchestratorInput): Promise<OrchestratorResult> {
  const start = Date.now()
  const { route, inputFormat } = decideRoute(input)

  // Hard fail — audio/video/unknown.
  if (route === 'unsupported') {
    const result: OrchestratorResult = {
      success: false,
      routeUsed: route,
      inputFormat,
      outputFormat: input.outputFormat,
      estimatedCostUsd: 0,
      inputTokens: 0,
      outputTokens: 0,
      processingTimeMs: Date.now() - start,
      warnings: [],
      errorMessage: `Cannot convert ${inputFormat} → ${input.outputFormat}. This format pair is not supported.`,
    }
    void logConversionCost({
      userTier: input.userTier,
      route,
      inputFormat,
      outputFormat: input.outputFormat,
      fileName: input.fileName,
      success: false,
      errorMessage: result.errorMessage,
    })
    return result
  }

  // Existing-UDS-pipeline — orchestrator stays out of the way. The route
  // handler runs PR #2's convertPdf and calls logConversionCost separately.
  // We return a stub that telemetry-only callers can use; if the route
  // handler is the caller, it ignores this return path entirely.
  if (route === 'existing-uds-pipeline') {
    return {
      success: true,
      routeUsed: route,
      inputFormat,
      outputFormat: input.outputFormat,
      estimatedCostUsd: 0,
      inputTokens: 0,
      outputTokens: 0,
      processingTimeMs: Date.now() - start,
      warnings: [],
    }
  }

  // PR A: actual conversion implementations for pure-lib / tesseract /
  // groq-llama / anthropic-haiku land in PR B. For now, return a clear
  // not-yet-implemented error so the route handler surfaces it as a
  // structured response instead of a 500.
  if (route === 'pure-lib' || route === 'tesseract') {
    const errorMessage = `${route} conversion is not yet implemented in UD Converter v2 (lands in PR B).`
    void logConversionCost({
      userTier: input.userTier,
      route,
      inputFormat,
      outputFormat: input.outputFormat,
      fileName: input.fileName,
      success: false,
      errorMessage,
    })
    return {
      success: false,
      routeUsed: route,
      inputFormat,
      outputFormat: input.outputFormat,
      estimatedCostUsd: 0,
      inputTokens: 0,
      outputTokens: 0,
      processingTimeMs: Date.now() - start,
      warnings: [],
      errorMessage,
    }
  }

  // ─── Groq Llama 3.1 8B — primary LLM path for Free + Plus + Pro ────────
  if (route === 'groq-llama') {
    const groqRes: GroqResult | GroqError = await groqExtract({
      systemPrompt: 'You are a precise document-extraction assistant. Output extracted text only, no commentary.',
      userPrompt: `Extract all text from this ${inputFormat} content. Preserve paragraph structure. Mark page boundaries with "--- Page N ---" lines if applicable.`,
      maxTokens: 4096,
    })

    if (!groqRes.ok) {
      // Pro tier with opt-in MAY escalate to Anthropic Haiku.
      const eligibleForAnthropicEscalation =
        input.userTier === 'pro' && (input.proAnthropicOptIn ?? false)

      if (eligibleForAnthropicEscalation && inputFormat === 'pdf') {
        return await runAnthropicEscalation(input, inputFormat, route, start, [
          `Groq returned ${groqRes.reason}. Escalating to Anthropic Haiku (Pro tier opt-in).`,
        ])
      }

      // Free / Plus / Pro-without-opt-in — surface the failure with the
      // upgrade hint when relevant.
      const errorMessage = groqRes.message
      const upgradeHint = input.userTier === 'free' || input.userTier === 'plus'
        ? FREE_PLUS_UPGRADE_HINT
        : undefined
      void logConversionCost({
        userTier: input.userTier,
        route,
        inputFormat,
        outputFormat: input.outputFormat,
        fileName: input.fileName,
        success: false,
        errorMessage,
      })
      return {
        success: false,
        routeUsed: route,
        inputFormat,
        outputFormat: input.outputFormat,
        estimatedCostUsd: 0,
        inputTokens: 0,
        outputTokens: 0,
        processingTimeMs: Date.now() - start,
        warnings: [],
        errorMessage,
        upgradeHint,
      }
    }

    // Groq succeeded. If confidence is low, surface the upgrade hint to
    // Free/Plus, or escalate to Anthropic for Pro-with-opt-in.
    const isLowConfidence = groqRes.confidence === 'low' || groqRes.confidence === 'medium'
    const eligibleForAnthropicEscalation =
      input.userTier === 'pro' && (input.proAnthropicOptIn ?? false)

    if (isLowConfidence && eligibleForAnthropicEscalation && inputFormat === 'pdf') {
      return await runAnthropicEscalation(input, inputFormat, route, start, [
        `Groq returned ${groqRes.confidence} confidence. Escalating to Anthropic Haiku (Pro tier opt-in).`,
      ], { groqRes })
    }

    void logConversionCost({
      userTier: input.userTier,
      route,
      inputFormat,
      outputFormat: input.outputFormat,
      inputTokens: groqRes.input_tokens,
      outputTokens: groqRes.output_tokens,
      estimatedCostUsd: groqRes.estimated_cost_usd,
      fileName: input.fileName,
      success: true,
    })
    return {
      success: true,
      buffer: Buffer.from(groqRes.text, 'utf-8'),
      routeUsed: route,
      inputFormat,
      outputFormat: input.outputFormat,
      estimatedCostUsd: groqRes.estimated_cost_usd,
      inputTokens: groqRes.input_tokens,
      outputTokens: groqRes.output_tokens,
      processingTimeMs: Date.now() - start,
      warnings: [],
      mayBeIncomplete: isLowConfidence,
      upgradeHint: isLowConfidence && (input.userTier === 'free' || input.userTier === 'plus')
        ? FREE_PLUS_UPGRADE_HINT
        : undefined,
    }
  }

  // ─── Anthropic Haiku — Pro-tier opt-in only ────────────────────────────
  if (route === 'anthropic-haiku') {
    return await runAnthropicEscalation(input, inputFormat, route, start, [])
  }

  // Exhaustiveness — TS will flag if a new Route variant is added without a branch above.
  const _exhaustive: never = route
  throw new Error(`Unhandled route: ${String(_exhaustive)}`)
}

async function runAnthropicEscalation(
  input: OrchestratorInput,
  inputFormat: InputFormat,
  routeUsed: Route,
  start: number,
  warnings: string[],
  context?: { groqRes?: GroqResult },
): Promise<OrchestratorResult> {
  // Anthropic only supports PDF in this PR (mirrors PR #2's path). Other
  // input formats fall back to the Groq result if available.
  if (inputFormat !== 'pdf') {
    if (context?.groqRes) {
      void logConversionCost({
        userTier: input.userTier,
        route: routeUsed,
        inputFormat,
        outputFormat: input.outputFormat,
        inputTokens: context.groqRes.input_tokens,
        outputTokens: context.groqRes.output_tokens,
        estimatedCostUsd: context.groqRes.estimated_cost_usd,
        fileName: input.fileName,
        success: true,
      })
      return {
        success: true,
        buffer: Buffer.from(context.groqRes.text, 'utf-8'),
        routeUsed,
        inputFormat,
        outputFormat: input.outputFormat,
        estimatedCostUsd: context.groqRes.estimated_cost_usd,
        inputTokens: context.groqRes.input_tokens,
        outputTokens: context.groqRes.output_tokens,
        processingTimeMs: Date.now() - start,
        warnings: [...warnings, 'Anthropic escalation only supports PDF input; using Groq result.'],
      }
    }
    return {
      success: false,
      routeUsed,
      inputFormat,
      outputFormat: input.outputFormat,
      estimatedCostUsd: 0,
      inputTokens: 0,
      outputTokens: 0,
      processingTimeMs: Date.now() - start,
      warnings,
      errorMessage: 'Anthropic escalation is supported for PDF inputs only in this version.',
    }
  }

  const anth: AnthropicResult | AnthropicError = await anthropicExtractFromPdf({
    buffer: input.buffer,
    userTier: input.userTier,
  })

  if (!anth.ok) {
    // Anthropic refused/failed — fall back to Groq result if available.
    if (context?.groqRes) {
      void logConversionCost({
        userTier: input.userTier,
        route: routeUsed,
        inputFormat,
        outputFormat: input.outputFormat,
        inputTokens: context.groqRes.input_tokens,
        outputTokens: context.groqRes.output_tokens,
        estimatedCostUsd: context.groqRes.estimated_cost_usd,
        fileName: input.fileName,
        success: true,
      })
      return {
        success: true,
        buffer: Buffer.from(context.groqRes.text, 'utf-8'),
        routeUsed,
        inputFormat,
        outputFormat: input.outputFormat,
        estimatedCostUsd: context.groqRes.estimated_cost_usd,
        inputTokens: context.groqRes.input_tokens,
        outputTokens: context.groqRes.output_tokens,
        processingTimeMs: Date.now() - start,
        warnings: [...warnings, `Anthropic escalation failed (${anth.reason}); falling back to Groq result.`],
        mayBeIncomplete: true,
      }
    }
    void logConversionCost({
      userTier: input.userTier,
      route: routeUsed,
      inputFormat,
      outputFormat: input.outputFormat,
      fileName: input.fileName,
      success: false,
      errorMessage: anth.message,
    })
    return {
      success: false,
      routeUsed,
      inputFormat,
      outputFormat: input.outputFormat,
      estimatedCostUsd: 0,
      inputTokens: 0,
      outputTokens: 0,
      processingTimeMs: Date.now() - start,
      warnings,
      errorMessage: anth.message,
    }
  }

  void logConversionCost({
    userTier: input.userTier,
    route: routeUsed,
    inputFormat,
    outputFormat: input.outputFormat,
    inputTokens: anth.input_tokens,
    outputTokens: anth.output_tokens,
    estimatedCostUsd: anth.estimated_cost_usd,
    fileName: input.fileName,
    success: true,
  })
  return {
    success: true,
    buffer: Buffer.from(anth.text, 'utf-8'),
    routeUsed,
    inputFormat,
    outputFormat: input.outputFormat,
    estimatedCostUsd: anth.estimated_cost_usd,
    inputTokens: anth.input_tokens,
    outputTokens: anth.output_tokens,
    processingTimeMs: Date.now() - start,
    warnings,
  }
}
