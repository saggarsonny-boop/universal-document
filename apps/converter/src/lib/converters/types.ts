// UD Converter v2 — converter module contract.
//
// Every pure-library / tesseract converter exports a function matching the
// `Converter` signature. The orchestrator looks up the converter for a
// given (input, output) pair via the registry and invokes it. Errors are
// structured (not thrown) so the orchestrator can map them to the
// user-facing JSON shape that the route handler returns to the client.

import type { InputFormat, OutputFormat } from '../router'

export type UserTier = 'free' | 'plus' | 'pro' | 'unknown'

export type ConverterOptions = {
  fileName: string
  userTier: UserTier
  /** Soft timeout in ms — converters should bail before this if they can. Vercel hard-kills at 30s. */
  softTimeoutMs?: number
}

export type ConverterErrorCode =
  | 'invalid_input'         // file didn't parse as the declared format
  | 'conversion_failed'     // upstream library threw
  | 'feature_unsupported'   // format pair recognized but not implemented yet
  | 'rate_limit_or_resource'// transient resource issue (e.g. WASM out of memory)
  | 'timeout'               // soft timeout hit before completion

export type ConverterError = {
  code: ConverterErrorCode
  message: string
  recoverable: boolean
  page?: number
  detail?: string
}

export type ConverterSuccess = {
  ok: true
  buffer: Buffer
  contentType?: string
  warnings?: string[]
  pageCount?: number
}

export type ConverterFailure = {
  ok: false
  error: ConverterError
}

export type ConverterResult = ConverterSuccess | ConverterFailure

export type Converter = (
  input: Buffer,
  options: ConverterOptions,
) => Promise<ConverterResult>

/** Convenience for converter authors — wraps a thrown Error into the structured shape. */
export function thrownToFailure(err: unknown, opts?: { code?: ConverterErrorCode; recoverable?: boolean }): ConverterFailure {
  const message = err instanceof Error ? err.message : String(err)
  return {
    ok: false,
    error: {
      code: opts?.code ?? 'conversion_failed',
      message,
      recoverable: opts?.recoverable ?? false,
      detail: err instanceof Error ? err.stack : undefined,
    },
  }
}

export function notImplemented(input: InputFormat, output: OutputFormat): ConverterFailure {
  return {
    ok: false,
    error: {
      code: 'feature_unsupported',
      message: `${input} → ${output} is not yet implemented in this version.`,
      recoverable: false,
    },
  }
}
