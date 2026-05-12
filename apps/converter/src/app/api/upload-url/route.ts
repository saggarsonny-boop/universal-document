// /api/upload-url — issues a Vercel Blob client-upload token so files
// > 4 MB can be uploaded direct-to-storage, bypassing Vercel's edge proxy
// (which kills request bodies above ~4.5 MB before the function runs).
//
// Flow:
//   1. Client calls `upload()` from @vercel/blob/client; that wraps a POST
//      to this route with a typed body. handleUpload() routes the request
//      to onBeforeGenerateToken (token issuance) or onUploadCompleted
//      (server-side notification after the upload finishes).
//   2. We validate tier, file size, mime type, and Turnstile (free users
//      past their first conversion) BEFORE issuing the token. Caller
//      passes file metadata via `clientPayload` (a JSON string).
//   3. Client uses the token to PUT the file directly to Vercel Blob.
//      The function never sees the bytes — only the metadata.
//
// Tier-based size caps:
//   - free: 4 MB   (matches the legacy /api/convert fast-path; the only
//                   reason a free user hits this route is if their client
//                   somehow targeted the slow path for a tiny file)
//   - plus: 25 MB
//   - pro:  50 MB
//
// Conversion itself happens in /api/convert/format-by-ref which fetches
// the blob by URL, runs the orchestrator, and eagerly deletes the blob.

import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
import { NextRequest, NextResponse } from 'next/server'
import { ensureSchema, getFreeTierState } from '@/lib/db'
import { checkRateLimit } from '@/lib/rate-limit'
import { verifyTurnstileToken } from '@/lib/turnstile'

export const runtime = 'nodejs'
export const maxDuration = 10

const FREE_MAX_BYTES = 4 * 1024 * 1024
const PLUS_MAX_BYTES = 25 * 1024 * 1024
const PRO_MAX_BYTES = 50 * 1024 * 1024

function tierMaxBytes(tier: 'free' | 'plus' | 'pro'): number {
  switch (tier) {
    case 'free': return FREE_MAX_BYTES
    case 'plus': return PLUS_MAX_BYTES
    case 'pro':  return PRO_MAX_BYTES
  }
}

function tierMaxMb(tier: 'free' | 'plus' | 'pro'): number {
  return Math.round(tierMaxBytes(tier) / (1024 * 1024))
}

// Mime allowlist mirrors the input formats the client-side detector
// recognises. `application/octet-stream` is allowed because some browsers
// fall back to it for less-common extensions; we re-detect server-side
// from the file content in the conversion route.
const ALLOWED_CONTENT_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',  // docx
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',         // xlsx
  'application/vnd.oasis.opendocument.text',                                   // odt
  'text/csv',
  'text/tab-separated-values',
  'application/json',
  'application/xml',
  'text/xml',
  'application/x-yaml',
  'text/yaml',
  'text/html',
  'text/markdown',
  'text/plain',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'application/octet-stream',
]

type ClientPayload = {
  fileSize?: number
  mimeType?: string
  turnstileToken?: string | null
  fromFormat?: string
}

function getIp(req: NextRequest) {
  return req.headers.get('x-forwarded-for')?.split(',')[0].trim()
    ?? req.headers.get('x-real-ip')
    ?? 'unknown'
}

export async function POST(req: NextRequest) {
  try { await ensureSchema() } catch (dbErr) {
    console.warn('DB unavailable, proceeding without rate limiting:', dbErr)
  }

  const body = (await req.json()) as HandleUploadBody

  try {
    const jsonResponse = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (_pathname: string, clientPayloadRaw: any) => {
        // 1. Tier check (free-tier lifetime/daily caps run here too).
        const decision = await checkRateLimit(req)
        if (!decision.allow) {
          // Throwing inside this callback surfaces as a 400 response
          // with the message; that's the contract handleUpload exposes.
          // We encode the structured paywall body as JSON so the client
          // can parse + show the modal.
          throw new Error('rate_limited:' + JSON.stringify(decision.body))
        }

        // 2. Decode client payload — file size + mime + Turnstile token.
        let payload: ClientPayload = {}
        try {
          if (clientPayloadRaw) payload = JSON.parse(clientPayloadRaw) as ClientPayload
        } catch {
          throw new Error('invalid_client_payload')
        }

        // 3. Per-tier file size cap.
        const max = tierMaxBytes(decision.tier)
        if (typeof payload.fileSize === 'number' && payload.fileSize > max) {
          throw new Error(
            `file_too_large:${JSON.stringify({
              tier: decision.tier,
              limitMb: tierMaxMb(decision.tier),
              actualBytes: payload.fileSize,
            })}`,
          )
        }

        // 4. Free-tier Turnstile gate (matches /api/convert/format).
        // First lifetime conversion is captcha-free; subsequent uploads
        // need a verified token.
        if (decision.tier === 'free' && decision.ipHash) {
          const state = await getFreeTierState(decision.ipHash).catch(
            () => ({ lifetimeCount: 0, lastConversionAt: null as Date | null }),
          )
          if (state.lifetimeCount >= 1) {
            const v = await verifyTurnstileToken(payload.turnstileToken ?? null, getIp(req))
            if (!v.ok) {
              throw new Error('captcha_required:' + (v.reason ?? 'unknown'))
            }
          }
        }

        // 5. Mime allowlist.
        return {
          allowedContentTypes: ALLOWED_CONTENT_TYPES,
          maximumSizeInBytes: max,
          tokenPayload: JSON.stringify({
            tier: decision.tier,
            ipHash: decision.ipHash ?? null,
            fromFormat: payload.fromFormat ?? null,
            issuedAt: Date.now(),
          }),
        }
      },
      onUploadCompleted: async () => {
        // Intentionally no-op. The conversion route fetches the blob by
        // URL and eagerly deletes it after; we don't need a webhook hook
        // to fire on upload completion.
      },
    })

    return NextResponse.json(jsonResponse)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)

    // Surface the structured rate-limit body so the client can show the
    // paywall modal exactly the way /api/convert/format does.
    if (msg.startsWith('rate_limited:')) {
      const bodyJson = msg.slice('rate_limited:'.length)
      try {
        return NextResponse.json(JSON.parse(bodyJson), { status: 429 })
      } catch { /* fall through */ }
    }

    if (msg.startsWith('file_too_large:')) {
      const detail = msg.slice('file_too_large:'.length)
      try {
        const d = JSON.parse(detail) as { tier: string; limitMb: number; actualBytes: number }
        return NextResponse.json(
          {
            error: `File exceeds the ${d.limitMb} MB cap for the ${d.tier} tier.`,
            tooLarge: true,
            tier: d.tier,
            limitMb: d.limitMb,
            actualBytes: d.actualBytes,
            recoverable: false,
            upgrade: d.tier === 'free',
          },
          { status: 413 },
        )
      } catch { /* fall through */ }
    }

    if (msg.startsWith('captcha_required:')) {
      const reason = msg.slice('captcha_required:'.length)
      return NextResponse.json(
        {
          error: 'captcha_required',
          message: 'Please complete the captcha to continue. (' + reason + ')',
          captchaRequired: true,
          recoverable: true,
        },
        { status: 401 },
      )
    }

    console.warn('/api/upload-url error:', err)
    return NextResponse.json(
      { error: msg, recoverable: true },
      { status: 400 },
    )
  }
}
