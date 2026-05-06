import { NextRequest, NextResponse } from 'next/server'
import { convertCsv, convertDocx, convertHtml, convertImage, convertPdf, convertTxt, convertXlsx, type PageWarning } from '@/lib/convert'
import { ensureSchema, validateApiKey, logCustody, logConversionCost, getFreeTierState } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'
import { isUDUtility, preprocessForUD, UDUtilityId } from '@/lib/preprocess'
import { ensureRegistrySchema, sealDocument as registrySeal } from '@shared/lib/registry'
import { decideRoute, type UserTier } from '@/lib/orchestrator'
import { checkRateLimit, recordFreeConversionFromCheck } from '@/lib/rate-limit'
import { verifyTurnstileToken } from '@/lib/turnstile'

export const runtime = 'nodejs'
export const maxDuration = 30

const MAX_FREE_BYTES = 10 * 1024 * 1024

// Map raw thrown errors to user-facing copy + machine-readable hints. The
// generic "Conversion failed. Try again." message used to be the catch-all;
// it told users nothing about whether retrying would help. Now every known
// failure mode gets a specific message + a `recoverable` flag the client
// uses to decide whether to offer a Try Again button.
function classifyError(err: unknown): {
  status: number
  message: string
  recoverable: boolean
  page?: number
  technical: string
} {
  const technical = err instanceof Error ? err.message : String(err)
  const lower = technical.toLowerCase()

  // Vercel function timeout — surfaces as the function being killed mid-request.
  if (lower.includes('timeout') || lower.includes('function_invocation_timeout')) {
    return {
      status: 504,
      message: 'This file took longer than 30 seconds to process. Try splitting it into smaller documents (under 5 pages each) or use the Pro tier for longer-running conversions.',
      recoverable: true,
      technical,
    }
  }
  // Encrypted PDFs — pdfjs throws PasswordException
  if (lower.includes('passwordexception') || lower.includes('password')) {
    return {
      status: 422,
      message: 'This PDF is password-protected. Remove the password (File > Print > Save as PDF in your browser, or use a PDF tool to unlock it) and try again.',
      recoverable: true,
      technical,
    }
  }
  // Anthropic auth / model availability
  if (lower.includes('anthropic') || lower.includes('401') || lower.includes('403')) {
    return {
      status: 503,
      message: 'AI extraction is temporarily unavailable. Try again in a minute — pdfjs fallback should still produce a result for text-based documents.',
      recoverable: true,
      technical,
    }
  }
  // Anything else — generic but still informative
  return {
    status: 500,
    message: `Could not process this file. Technical detail: ${technical.slice(0, 200)}`,
    recoverable: true,
    technical,
  }
}

function getIp(req: NextRequest) {
  return req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? req.headers.get('x-real-ip') ?? 'unknown'
}

export async function POST(req: NextRequest) {
  try {
    // DB is optional — if unavailable, conversion still works without rate limiting
    try {
      await ensureSchema()
    } catch (dbErr) {
      console.warn('DB unavailable, proceeding without rate limiting:', dbErr)
    }

    // PR D — rate-limit gate. Pro x-api-key → Plus signed cookie →
    // free-tier lifetime + daily check. Returns structured 429 on cap.
    const decision = await checkRateLimit(req)
    if (!decision.allow) {
      return NextResponse.json(decision.body, { status: decision.status })
    }
    const proUser: { email: string; prefix: string } | null = decision.tier === 'pro'
      ? (await validateApiKey(req.headers.get('x-api-key') ?? '').catch(() => null))
      : null

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const turnstileToken = formData.get('turnstileToken')?.toString() ?? null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const fileName = file.name
    const ext = fileName.split('.').pop()?.toLowerCase()
    const allowedTypes = ['pdf', 'docx', 'xlsx', 'txt', 'md', 'csv', 'html', 'png', 'jpg', 'jpeg', 'webp', 'gif']

    if (!ext || !allowedTypes.includes(ext)) {
      return NextResponse.json(
        { error: `Unsupported file type .${ext}. Supported: ${allowedTypes.join(', ')}` },
        { status: 422 }
      )
    }

    const utilityInput = formData.get('utility')?.toString() ?? 'optimize'
    const utility: UDUtilityId = isUDUtility(utilityInput) ? utilityInput : 'optimize'

    // Free-tier file-size cap + Turnstile captcha gate (skip for Plus + Pro).
    if (decision.tier === 'free') {
      if (file.size > MAX_FREE_BYTES) {
        return NextResponse.json(
          { error: 'File exceeds 10 MB free tier limit. Upgrade to Plus or Pro for larger files.', upgrade: true },
          { status: 413 },
        )
      }
      const state = await getFreeTierState(decision.ipHash!).catch(() => ({ lifetimeCount: 0, lastConversionAt: null as Date | null }))
      const requireCaptcha = state.lifetimeCount >= 1
      if (requireCaptcha) {
        const v = await verifyTurnstileToken(turnstileToken, getIp(req))
        if (!v.ok) {
          return NextResponse.json(
            {
              error: 'captcha_required',
              message: 'Please complete the captcha to continue. (Turnstile verification failed: ' + (v.reason ?? 'unknown') + ')',
              captchaRequired: true,
              recoverable: true,
            },
            { status: 401 },
          )
        }
      }
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    let doc
    // Per-page warnings collected during extraction (currently only
    // populated by convertPdf; other formats append nothing). Surfaced
    // to the client via the X-UD-Page-Warnings response header.
    let pageWarnings: PageWarning[] = []

    // ─── UD Converter v2 telemetry (PR A — feature-flagged) ──────────────
    // When UD_CONVERTER_V2 env var is "true", we call the v2 orchestrator's
    // route-selection function in parallel with the existing PDF→UDS path
    // so cost telemetry starts flowing into the conversion_costs table
    // immediately. This is observation-only in PR A — the actual conversion
    // continues to run through the existing convert.ts code below. PR B
    // wires the orchestrator into the actual conversion path for new
    // format pairs; the existing PDF→UDS path stays where it is.
    const v2TelemetryEnabled = process.env.UD_CONVERTER_V2 === 'true'
    const userTier: UserTier = decision.tier
    let v2RouteUsed: string = 'existing-uds-pipeline'
    let v2InputFormat: string | undefined
    if (v2TelemetryEnabled) {
      try {
        const decision = decideRoute({
          buffer,
          fileName,
          outputFormat: 'uds',  // existing pipeline only emits UDS today
          userTier,
        })
        v2RouteUsed = decision.route
        v2InputFormat = decision.inputFormat
      } catch (decideErr) {
        // Telemetry must not block conversion. Fall through silently.
        console.warn('[ud-converter-v2] decideRoute failed:', decideErr)
      }
    }

    if (ext === 'docx') {
      doc = await convertDocx(buffer, fileName)
    } else if (ext === 'xlsx') {
      doc = await convertXlsx(buffer, fileName)
    } else if (ext === 'html') {
      const rawHtml = buffer.toString('utf-8')
      const pre = preprocessForUD({ fileName, baseText: rawHtml.replace(/<[^>]+>/g, ' '), utility })
      doc = await convertHtml(pre.normalizedText, fileName)
      doc.metadata.tags.push('utility:' + utility)
      doc.metadata.tags.push('html-normalized')
    } else if (ext === 'csv') {
      const pre = preprocessForUD({ fileName, baseText: buffer.toString('utf-8'), utility })
      doc = await convertCsv(pre.normalizedText, fileName)
      doc.metadata.tags.push('utility:' + utility)
      doc.metadata.tags.push('preprocessed')
    } else if (ext === 'pdf') {
      const pdfResult = await convertPdf(buffer, fileName)
      doc = pdfResult.doc
      pageWarnings = pdfResult.warnings
      const joined = doc.blocks
        .map((block) => String(block.base_content?.text ?? block.base_content?.html ?? ''))
        .filter(Boolean)
        .join('\n')
      const pre = preprocessForUD({ fileName, baseText: joined, utility })
      doc.blocks = await convertTxt(pre.normalizedText, fileName).then((d) => d.blocks)
      doc.metadata.tags.push('utility:' + utility)
      doc.metadata.tags.push('pdf-normalized')
    } else if (['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(ext)) {
      doc = await convertImage(fileName)
      const pre = preprocessForUD({
        fileName,
        baseText: `Image imported for UD preprocessing. OCR utility: ${utility === 'ocr' ? 'enabled' : 'disabled'}.`,
        utility,
      })
      doc.blocks = await convertTxt(pre.normalizedText, fileName).then((d) => d.blocks)
      doc.metadata.tags.push('utility:' + utility)
      doc.metadata.tags.push('image-normalized')
    } else {
      const text = buffer.toString('utf-8')
      const pre = preprocessForUD({ fileName, baseText: text, utility })
      doc = await convertTxt(pre.normalizedText, fileName)
      doc.metadata.tags.push('utility:' + utility)
      doc.metadata.tags.push('preprocessed')
    }

    if (proUser) {
      const outputId = uuidv4()
      doc.metadata.id = outputId
      logCustody({ email: proUser.email, apiKeyPrefix: proUser.prefix, fileName, fileSize: file.size, outputId }).catch(err =>
        console.warn('Custody log failed:', err)
      )
    }

    // ─── UD Converter v2 cost telemetry (PR A — fire-and-forget) ─────────
    // Logged AFTER successful conversion. Cost is 0 for the existing-uds-
    // pipeline route since PR #2's path bills against ANTHROPIC_API_KEY at
    // a global level rather than per-conversion. PR B will populate
    // input/output token counts from the actual extractor and surface the
    // estimated cost per call.
    if (v2TelemetryEnabled) {
      void logConversionCost({
        userTier,
        route: v2RouteUsed,
        inputFormat: v2InputFormat,
        outputFormat: 'uds',
        fileName,
        success: true,
      })
    }

    // PR D — record the conversion against the free-tier counter only on
    // success. Plus + Pro tiers skip (their auth path doesn't go through
    // the IP-hash lifetime counter).
    if (decision.tier === 'free' && decision.ipHash) {
      void recordFreeConversionFromCheck(decision.ipHash)
    }

    // Register in provenance registry (fire-and-forget — conversion succeeds regardless)
    if (doc.seal?.hash && doc.metadata.id) {
      const docId = doc.metadata.id
      const docHash = doc.seal.hash
      const docTitle = doc.metadata.title
      const issuerIp = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? req.headers.get('x-real-ip') ?? 'unknown'
      ensureRegistrySchema()
        .then(() => registrySeal({ id: docId, hash: docHash, title: docTitle, issuerIp }))
        .catch(err => console.warn('Registry seal failed (non-fatal):', err))

      // Embed verification URL in seal
      doc.seal.verification_url = `https://ud.hive.baby/verify/${docId}`
    }

    const outputName = fileName.replace(/\.[^.]+$/, '.uds')
    const json = JSON.stringify(doc, null, 2)

    return new NextResponse(json, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${outputName}"`,
        'X-UD-Identity': doc.state === 'UDS' ? 'dark_blue' : 'light_blue',
        // Page-level warnings travel as a base64-encoded JSON header so the
        // client can render "Page 8 was image-only — re-OCR to capture"
        // alongside the successful download. Empty array when the
        // conversion was clean. Base64 because some warning detail strings
        // contain characters HTTP headers don't allow raw.
        'X-UD-Page-Warnings': Buffer.from(JSON.stringify(pageWarnings)).toString('base64'),
        ...(proUser ? { 'X-Pro': 'true' } : {}),
      },
    })
  } catch (e) {
    console.error('Convert error:', e)
    const cls = classifyError(e)
    // Telemetry on failure path too — best effort, non-blocking.
    if (process.env.UD_CONVERTER_V2 === 'true') {
      void logConversionCost({
        userTier: 'unknown',
        route: 'existing-uds-pipeline',
        outputFormat: 'uds',
        success: false,
        errorMessage: cls.technical,
      })
    }
    return NextResponse.json(
      {
        error: cls.message,
        recoverable: cls.recoverable,
        page: cls.page,
        technical: cls.technical,
      },
      { status: cls.status },
    )
  }
}
