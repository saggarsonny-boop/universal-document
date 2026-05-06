// /api/convert/format — UD Converter v2 orchestrator-driven endpoint.
//
// Distinct from the legacy /api/convert which always emits .uds. This
// endpoint accepts an explicit `outputFormat` form field and routes the
// conversion through the v2 orchestrator (router → registry → converter).
// Pure-lib + tesseract paths run real conversions; groq-llama paths call
// Groq Llama 3.1 8B Instant.
//
// Same auth + rate-limit pattern as legacy /api/convert: x-api-key for
// Pro tier (validated against converter_api_keys), IP-hash usage counter
// for free tier. Plus tier auth lands in PR D — for now Plus users
// degrade to Free behaviour from this endpoint's perspective.

import { NextRequest, NextResponse } from 'next/server'
import { ensureSchema, logConversionCost, getFreeTierState } from '@/lib/db'
import { orchestrate, type UserTier } from '@/lib/orchestrator'
import { checkRateLimit, recordFreeConversionFromCheck } from '@/lib/rate-limit'
import { verifyTurnstileToken } from '@/lib/turnstile'
import type { OutputFormat } from '@/lib/router'

export const runtime = 'nodejs'
export const maxDuration = 30

// See header comment in /api/convert/route.ts. 4 MB defense-in-depth gate
// mirrors the client-side gate in FileUpload.tsx; the existing 10 MB
// free-tier cap is unreachable on Hobby because Vercel's edge proxy
// rejects bodies > ~4.5 MB before this function ever runs.
const MAX_PREFLIGHT_BYTES = 4 * 1024 * 1024
const MAX_PREFLIGHT_MB = 4
const MAX_FREE_BYTES = 10 * 1024 * 1024
const VALID_OUTPUT_FORMATS: OutputFormat[] = [
  'uds', 'pdf', 'docx', 'xlsx', 'csv', 'json', 'xml',
  'html', 'md', 'txt', 'png', 'jpg', 'webp',
]

function getIp(req: NextRequest) {
  return req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? req.headers.get('x-real-ip') ?? 'unknown'
}

function isOutputFormat(s: string): s is OutputFormat {
  return (VALID_OUTPUT_FORMATS as string[]).includes(s)
}

// Map an output format to a sensible MIME type for the response.
function mimeForOutput(fmt: OutputFormat): string {
  switch (fmt) {
    case 'json': return 'application/json'
    case 'xml':  return 'application/xml'
    case 'html': return 'text/html'
    case 'md':   return 'text/markdown'
    case 'txt':  return 'text/plain'
    case 'csv':  return 'text/csv'
    case 'xlsx': return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    case 'docx': return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    case 'pdf':  return 'application/pdf'
    case 'png':  return 'image/png'
    case 'jpg':  return 'image/jpeg'
    case 'webp': return 'image/webp'
    case 'uds':  return 'application/json'
  }
}

export async function POST(req: NextRequest) {
  try {
    try { await ensureSchema() } catch (dbErr) {
      console.warn('DB unavailable, proceeding without rate limiting:', dbErr)
    }

    // PR D — rate-limit gate. Pro x-api-key → Plus signed cookie →
    // free-tier lifetime + daily check. Returns structured 429 on cap.
    const decision = await checkRateLimit(req)
    if (!decision.allow) {
      return NextResponse.json(decision.body, { status: decision.status })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const outputFormatRaw = formData.get('outputFormat')?.toString() ?? 'uds'
    const turnstileToken = formData.get('turnstileToken')?.toString() ?? null

    if (!file) {
      return NextResponse.json({ error: 'No file provided', recoverable: true }, { status: 400 })
    }
    if (!isOutputFormat(outputFormatRaw)) {
      return NextResponse.json(
        { error: `Unsupported output format: ${outputFormatRaw}`, recoverable: true },
        { status: 400 },
      )
    }
    const outputFormat: OutputFormat = outputFormatRaw

    // Pre-flight 4 MB cap (defense-in-depth — see header comment).
    if (file.size > MAX_PREFLIGHT_BYTES) {
      return NextResponse.json(
        {
          error: `Files over ${MAX_PREFLIGHT_MB} MB aren't supported on free tier yet. We're working on direct upload for larger files.`,
          tooLarge: true,
          maxMb: MAX_PREFLIGHT_MB,
          recoverable: false,
        },
        { status: 413 },
      )
    }

    // Free-tier file-size cap (Plus + Pro have higher caps managed
    // server-side; PR D's spec keeps the legacy 10 MB cap for free).
    if (decision.tier === 'free') {
      if (file.size > MAX_FREE_BYTES) {
        return NextResponse.json(
          { error: 'File exceeds 10 MB free tier limit. Upgrade to Plus or Pro for larger files.', recoverable: false, upgrade: true },
          { status: 413 },
        )
      }
      // PR D — Cloudflare Turnstile captcha gate. First conversion of a
      // user's lifetime is captcha-free (zero-friction first interaction);
      // subsequent free conversions require a verified Turnstile token.
      const state = await getFreeTierState(decision.ipHash!).catch(() => ({ lifetimeCount: 0, lastConversionAt: null as Date | null }))
      const requireCaptcha = state.lifetimeCount >= 1
      if (requireCaptcha) {
        const v = await verifyTurnstileToken(turnstileToken, getIp(req))
        if (!v.ok) {
          return NextResponse.json(
            {
              error: 'captcha_required',
              message: 'Please complete the captcha to continue. (Turnstile verification failed: ' + (v.reason ?? 'unknown') + ')',
              recoverable: true,
              captchaRequired: true,
            },
            { status: 401 },
          )
        }
      }
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const userTier: UserTier = decision.tier

    // Orchestrator never throws — returns structured result.
    const result = await orchestrate({
      buffer,
      fileName: file.name,
      outputFormat,
      userTier,
    })

    if (!result.success || !result.buffer) {
      // Cost telemetry already logged inside orchestrate(). Just surface
      // the structured error to the client. Free-tier counter is NOT
      // burned on a failed conversion — we only record on success below.
      return NextResponse.json(
        {
          error: result.errorMessage ?? 'Conversion failed.',
          recoverable: true,
          route: result.routeUsed,
          inputFormat: result.inputFormat,
          outputFormat: result.outputFormat,
          warnings: result.warnings,
          upgradeHint: result.upgradeHint,
        },
        { status: 500 },
      )
    }

    // PR D — record the conversion against the free-tier counter only
    // on success. Plus + Pro skip (their tier was confirmed in the
    // checkRateLimit decision; recording would be a no-op anyway since
    // their cookies/keys aren't tied to the IP-hash counter).
    if (decision.tier === 'free' && decision.ipHash) {
      void recordFreeConversionFromCheck(decision.ipHash)
    }

    const baseName = file.name.replace(/\.[^.]+$/, '')
    const outputName = `${baseName}.${outputFormat === 'uds' ? 'uds' : outputFormat}`
    // Convert Node Buffer → Uint8Array for NextResponse's BodyInit type.
    const responseBody = new Uint8Array(result.buffer)
    return new NextResponse(responseBody, {
      status: 200,
      headers: {
        'Content-Type': mimeForOutput(outputFormat),
        'Content-Disposition': `attachment; filename="${outputName}"`,
        // Surface route + warnings in headers so the client can render
        // "Processed via X" + per-stage notices alongside the download.
        // (pageCount is per-converter — not in OrchestratorResult yet;
        // future PR can lift it through if needed for UI page-progress.)
        'X-UD-Route': result.routeUsed,
        'X-UD-Input-Format': result.inputFormat,
        'X-UD-Output-Format': result.outputFormat,
        'X-UD-Warnings': Buffer.from(JSON.stringify(result.warnings)).toString('base64'),
        'X-UD-May-Be-Incomplete': result.mayBeIncomplete ? 'true' : 'false',
        ...(result.upgradeHint ? { 'X-UD-Upgrade-Hint': Buffer.from(result.upgradeHint).toString('base64') } : {}),
        ...(decision.tier === 'pro' ? { 'X-Pro': 'true' } : {}),
        ...(decision.tier === 'plus' ? { 'X-Plus': 'true' } : {}),
      },
    })
  } catch (e) {
    console.error('Convert/format error:', e)
    void logConversionCost({
      userTier: 'unknown',
      route: 'unknown',
      success: false,
      errorMessage: e instanceof Error ? e.message : String(e),
    })
    return NextResponse.json(
      {
        error: e instanceof Error ? e.message : 'Conversion failed.',
        recoverable: true,
      },
      { status: 500 },
    )
  }
}
