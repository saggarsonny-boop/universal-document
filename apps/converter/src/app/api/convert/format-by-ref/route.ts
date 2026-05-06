// /api/convert/format-by-ref — converts a file already uploaded to Vercel
// Blob storage (via /api/upload-url + @vercel/blob/client `upload()`).
//
// Why a separate route from /api/convert/format:
//   - The legacy route accepts multipart/form-data; the request body IS
//     the file. That hits Vercel's edge proxy ~4.5 MB body cap.
//   - This route accepts JSON with `{ blobUrl, fromFormat, toFormat,
//     fileName, turnstileToken }`; the function fetches the blob from
//     Vercel Blob storage, never reading user bytes through the edge
//     proxy. Plus and Pro tier file size caps (25 / 50 MB) actually
//     deliver here.
//
// Tier caps + Turnstile gating mirror /api/upload-url and the legacy
// /api/convert/format route. We re-validate at conversion time as defense
// in depth — a stale token is harmless on its own but we want consistent
// gating semantics if the token TTL ever lengthens.
//
// Cleanup: the source blob is `del()`'d in the finally block, eagerly
// on both success and failure paths. If the function dies before reaching
// the finally (timeout, OOM), an orphan blob lingers in storage. Tracked
// in the v0.2 sweeper follow-up issue.

import { NextRequest, NextResponse } from 'next/server'
import { del } from '@vercel/blob'
import { ensureSchema, logConversionCost, getFreeTierState, recordOperatorAudit } from '@/lib/db'
import { orchestrate, type UserTier } from '@/lib/orchestrator'
import { checkRateLimit, recordFreeConversionFromCheck } from '@/lib/rate-limit'
import { verifyTurnstileToken } from '@/lib/turnstile'
import type { OutputFormat } from '@/lib/router'

export const runtime = 'nodejs'
// 50 MB conversions can run long, especially OCR + LLM extraction. The
// orchestrator carries its own SOFT_TIMEOUT_MS = 25s; we give the route
// the platform max so the orchestrator's structured timeout fires first.
export const maxDuration = 60

const FREE_MAX_BYTES = 4 * 1024 * 1024
const PLUS_MAX_BYTES = 25 * 1024 * 1024
const PRO_MAX_BYTES = 50 * 1024 * 1024

const VALID_OUTPUT_FORMATS: OutputFormat[] = [
  'uds', 'pdf', 'docx', 'xlsx', 'csv', 'json', 'xml',
  'html', 'md', 'txt', 'png', 'jpg', 'webp',
]

function isOutputFormat(s: string): s is OutputFormat {
  return (VALID_OUTPUT_FORMATS as string[]).includes(s)
}

function tierMaxBytes(tier: UserTier): number {
  switch (tier) {
    case 'free': return FREE_MAX_BYTES
    case 'plus': return PLUS_MAX_BYTES
    case 'pro':  return PRO_MAX_BYTES
    case 'unknown': return FREE_MAX_BYTES
  }
}

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

function getIp(req: NextRequest) {
  return req.headers.get('x-forwarded-for')?.split(',')[0].trim()
    ?? req.headers.get('x-real-ip')
    ?? 'unknown'
}

type RequestBody = {
  blobUrl?: string
  fileName?: string
  outputFormat?: string
  turnstileToken?: string | null
}

// Vercel Blob URLs all start with this host pattern. We narrow to it before
// hitting `del()` so a malicious caller can't make us delete arbitrary URLs
// (defense in depth — del() itself rejects non-Blob URLs but failing fast
// at the edge of the route is cheaper).
const BLOB_HOST_RE = /^https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\//

export async function POST(req: NextRequest) {
  let blobUrlForCleanup: string | null = null
  try {
    try { await ensureSchema() } catch (dbErr) {
      console.warn('DB unavailable, proceeding without rate limiting:', dbErr)
    }

    const decision = await checkRateLimit(req)
    if (!decision.allow) {
      return NextResponse.json(decision.body, { status: decision.status })
    }

    let body: RequestBody = {}
    try {
      body = await req.json() as RequestBody
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body', recoverable: true }, { status: 400 })
    }

    const { blobUrl, fileName, outputFormat: outputFormatRaw, turnstileToken } = body

    if (!blobUrl || !BLOB_HOST_RE.test(blobUrl)) {
      return NextResponse.json(
        { error: 'Missing or invalid blobUrl', recoverable: true },
        { status: 400 },
      )
    }
    blobUrlForCleanup = blobUrl

    if (!fileName) {
      return NextResponse.json(
        { error: 'Missing fileName', recoverable: true },
        { status: 400 },
      )
    }

    const outputFormat = outputFormatRaw ?? 'uds'
    if (!isOutputFormat(outputFormat)) {
      return NextResponse.json(
        { error: `Unsupported output format: ${outputFormat}`, recoverable: true },
        { status: 400 },
      )
    }

    // Turnstile re-check for free users past their first conversion.
    // Mirrors /api/convert/format and /api/upload-url. Defense-in-depth
    // even though the token was already validated at upload-url issuance.
    if (decision.tier === 'free' && decision.ipHash) {
      const state = await getFreeTierState(decision.ipHash).catch(
        () => ({ lifetimeCount: 0, lastConversionAt: null as Date | null }),
      )
      if (state.lifetimeCount >= 1) {
        const v = await verifyTurnstileToken(turnstileToken ?? null, getIp(req))
        if (!v.ok) {
          return NextResponse.json(
            {
              error: 'captcha_required',
              message: 'Please complete the captcha to continue. (' + (v.reason ?? 'unknown') + ')',
              captchaRequired: true,
              recoverable: true,
            },
            { status: 401 },
          )
        }
      }
    }

    // Fetch the blob into memory. 50 MB into a Node Buffer is fine on
    // Vercel functions (default heap is 1 GB on Pro, 256 MB on Hobby);
    // OCR + LLM passes don't materially grow the working set beyond the
    // input size. If we ever raise Pro to 200 MB+ this becomes a stream-
    // through-the-orchestrator job.
    const blobRes = await fetch(blobUrl)
    if (!blobRes.ok) {
      return NextResponse.json(
        { error: 'Could not fetch the uploaded file from storage. It may have expired.', recoverable: true },
        { status: 500 },
      )
    }

    const blobBytes = await blobRes.arrayBuffer()
    const buffer = Buffer.from(blobBytes)

    // Re-check tier cap on the fetched bytes (defense-in-depth — the
    // token was bound to a maximumSizeInBytes by handleUpload, but a
    // malicious or stale path could still get here with a too-big blob).
    const max = tierMaxBytes(decision.tier)
    if (buffer.byteLength > max) {
      return NextResponse.json(
        {
          error: `File exceeds the ${Math.round(max / (1024 * 1024))} MB cap for the ${decision.tier} tier.`,
          tooLarge: true,
          tier: decision.tier,
          limitMb: Math.round(max / (1024 * 1024)),
          actualBytes: buffer.byteLength,
          recoverable: false,
          upgrade: decision.tier === 'free',
        },
        { status: 413 },
      )
    }

    const result = await orchestrate({
      buffer,
      fileName,
      outputFormat,
      userTier: decision.tier,
    })

    if (!result.success || !result.buffer) {
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

    if (decision.tier === 'free' && decision.ipHash) {
      void recordFreeConversionFromCheck(decision.ipHash)
    }

    // Operator audit (direct-to-blob path).
    if (decision.operator) {
      void recordOperatorAudit({
        userIdentity: decision.operator.identity,
        action: 'conversion',
        fileSize: buffer.byteLength,
        fileType: outputFormat,
      })
    }

    const baseName = fileName.replace(/\.[^.]+$/, '')
    const outputName = `${baseName}.${outputFormat === 'uds' ? 'uds' : outputFormat}`
    const responseBody = new Uint8Array(result.buffer)
    return new NextResponse(responseBody, {
      status: 200,
      headers: {
        'Content-Type': mimeForOutput(outputFormat),
        'Content-Disposition': `attachment; filename="${outputName}"`,
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
    console.error('format-by-ref error:', e)
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
  } finally {
    // Eager delete on every exit path (success, conversion-failed,
    // exception). `del()` is idempotent — a second call after the blob
    // has been removed is a no-op. The `void` swallows any cleanup
    // error so it can't mask the actual response.
    if (blobUrlForCleanup) {
      void del(blobUrlForCleanup).catch((err) => {
        console.warn('Failed to delete source blob (will orphan in storage):', err)
      })
    }
  }
}
