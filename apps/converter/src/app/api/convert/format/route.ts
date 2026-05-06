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
import { ensureSchema, validateApiKey, hashIp, getFreeUsage, incrementFreeUsage, logConversionCost } from '@/lib/db'
import { orchestrate, type UserTier } from '@/lib/orchestrator'
import type { OutputFormat } from '@/lib/router'

export const runtime = 'nodejs'
export const maxDuration = 30

const FREE_DAILY_LIMIT = 5
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
    let dbAvailable = true
    try { await ensureSchema() } catch (dbErr) {
      console.warn('DB unavailable, proceeding without rate limiting:', dbErr)
      dbAvailable = false
    }

    const apiKey = req.headers.get('x-api-key')
    let proUser: { email: string; prefix: string } | null = null
    if (apiKey && dbAvailable) {
      proUser = await validateApiKey(apiKey).catch(() => null)
      if (proUser === null) {
        return NextResponse.json({ error: 'Invalid or expired API key', recoverable: false }, { status: 403 })
      }
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const outputFormatRaw = formData.get('outputFormat')?.toString() ?? 'uds'

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

    // Free-tier gates
    if (!proUser && dbAvailable) {
      if (file.size > MAX_FREE_BYTES) {
        return NextResponse.json(
          { error: 'File exceeds 10 MB free tier limit. Upgrade for larger files.', recoverable: false, upgrade: true },
          { status: 413 },
        )
      }
      try {
        const ipHash = hashIp(getIp(req))
        const usage = await getFreeUsage(ipHash)
        if (usage >= FREE_DAILY_LIMIT) {
          return NextResponse.json(
            {
              error: `Free tier limit: ${FREE_DAILY_LIMIT} files per day. Upgrade to Plus for $0.97/month for unlimited conversions, or Pro for $29/month for batch + API + chain of custody.`,
              recoverable: false,
              upgrade: true,
              used: usage,
              limit: FREE_DAILY_LIMIT,
            },
            { status: 429 },
          )
        }
        await incrementFreeUsage(ipHash)
      } catch (usageErr) {
        console.warn('Rate limiting unavailable:', usageErr)
      }
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const userTier: UserTier = proUser ? 'pro' : 'free'

    // Orchestrator never throws — returns structured result.
    const result = await orchestrate({
      buffer,
      fileName: file.name,
      outputFormat,
      userTier,
    })

    if (!result.success || !result.buffer) {
      // Cost telemetry already logged inside orchestrate(). Just surface
      // the structured error to the client.
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
        ...(proUser ? { 'X-Pro': 'true' } : {}),
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
