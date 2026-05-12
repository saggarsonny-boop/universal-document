'use client'

// UD Converter v2 — universal "any to any" UI.
//
// State machine:
//   idle       — file may or may not be selected; convert button enabled
//                iff a file is selected AND the selected format pair is
//                supported AND the user is below their free-tier cap
//   converting — POST in flight; ProgressIndicator visible
//   done       — SharePage visible with download CTA + share row + related-
//                engines cards + bookmark hint
//   error      — error card with the structured server message + Try Again
//
// Routing (PR D + direct-to-blob amendment):
//   File ≤ 4 MB         → FAST PATH: legacy multipart POST direct to
//                         /api/convert (uds output) or /api/convert/format
//                         (any other output). One round-trip, no blob hop.
//   File > 4 MB         → SLOW PATH: 3-step direct-to-blob upload.
//                            (1) /api/upload-url issues a Vercel Blob
//                                client-upload token (validates tier,
//                                size, mime, captcha).
//                            (2) Browser PUTs the file directly to
//                                Vercel Blob, bypassing the function and
//                                edge proxy (which kills bodies > ~4.5 MB).
//                                Real upload progress observable.
//                            (3) /api/convert/format-by-ref fetches the
//                                blob, runs the orchestrator, eagerly
//                                deletes the source blob, returns the
//                                converted file.
//                         Free tier never hits this path (4 MB cap = fast
//                         path always); Plus (25 MB) and Pro (50 MB) do.
//
import { useEffect, useMemo, useState } from 'react'
import { upload } from '@vercel/blob/client'
import { FileUpload } from './components/v2/FileUpload'
import { FormatDropdowns } from './components/v2/FormatDropdowns'
import { ProgressIndicator } from './components/v2/ProgressIndicator'
import { SharePage } from './components/v2/SharePage'
import { TierIndicator } from './components/v2/TierIndicator'
import { PaywallModal } from './components/v2/PaywallModal'
import { TurnstileWidget } from './components/v2/TurnstileWidget'
import { HiveInstallHint, HiveFirstVisitExplainer } from '@hive/onboarding'
import TooltipTour from '@/components/TooltipTour'
import {
  detectClientFormat,
  isPairSupported,
  type ClientInputFormat,
  type ClientOutputFormat,
} from '@/lib/client-formats'
import { useStrings } from '@/lib/strings'

const GOLD = '#D4AF37'

// Engine identity for the shared @hive/onboarding components. UD Converter
// uses the slug "ud-converter" externally for the localStorage isolation
// (hive_install_hint_dismissed_ud-converter, etc.), even though the
// engine root directory is apps/converter — the slug is the user-facing
// identifier for the engine, not the internal directory name.
const ENGINE_NAME = 'UD Converter'
const ENGINE_SLUG = 'ud-converter'

type ConvertState = 'idle' | 'uploading' | 'converting' | 'done' | 'error'

// Direct-to-blob threshold. Files at or below this go through the legacy
// multipart fast path (no blob hop, no upload-url round-trip). Files above
// need the slow path because Vercel's edge proxy kills request bodies
// over ~4.5 MB before the function runs.
const FAST_PATH_BYTES = 4 * 1024 * 1024

// Per-tier file size caps.
const TIER_MAX_BYTES: Record<'free' | 'plus' | 'pro', number> = {
  free: 4 * 1024 * 1024,
  plus: 25 * 1024 * 1024,
  pro:  50 * 1024 * 1024,
}

type ConvertError = {
  message: string
  recoverable: boolean
  upgrade?: boolean
  used?: number
  limit?: number
  // PR D — structured fields from rate-limit gate
  lifetimeUsed?: number
  lifetimeLimit?: number
  dailyUsed?: number
  dailyLimit?: number
  retryAfterHours?: number
  upgradeUrl?: string
  captchaRequired?: boolean
}

// Server response shape for failed conversions. Both /api/convert and
// /api/convert/format use the same error JSON: { error, recoverable, ... }.
type ServerErrorBody = {
  error?: string
  message?: string
  recoverable?: boolean
  upgrade?: boolean
  used?: number
  limit?: number
  lifetime_used?: number
  lifetime_limit?: number
  daily_used?: number
  daily_limit?: number
  retry_after_hours?: number
  upgrade_url?: string
  captchaRequired?: boolean
  /** 4 MB pre-flight gate (defense-in-depth): server confirms file too large. */
  tooLarge?: boolean
  maxMb?: number
}

export default function ConverterPage() {
  const s = useStrings()
  const [file, setFile] = useState<File | null>(null)
  const [inputFormat, setInputFormat] = useState<ClientInputFormat>('pdf')
  const [outputFormat, setOutputFormat] = useState<ClientOutputFormat>('uds')

  const [state, setState] = useState<ConvertState>('idle')
  const [error, setError] = useState<ConvertError | null>(null)
  const [downloadBlob, setDownloadBlob] = useState<{ blob: Blob; name: string } | null>(null)
  const [warnings, setWarnings] = useState<string[]>([])
  const [showPaywall, setShowPaywall] = useState(false)
  // Bumped after each successful conversion so the TierIndicator re-fetches the count.
  const [usageReloadNonce, setUsageReloadNonce] = useState(0)

  // PR D — Turnstile + tier state.
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [needsCaptcha, setNeedsCaptcha] = useState(false)
  // Tier snapshot from /api/usage; drives needsCaptcha + the disabled-state of the convert button.
  const [tierSnapshot, setTierSnapshot] = useState<{ tier: 'free' | 'plus' | 'pro'; lifetimeUsed: number; dailyUsed: number } | null>(null)
  // Plus signup confirmation message (set after exchanging plus_session_id → cookie).
  const [plusConfirmation, setPlusConfirmation] = useState<string | null>(null)
  // Direct-to-blob upload progress, 0–100. Only set during the slow path's
  // upload phase; null during fast path or once conversion starts.
  const [uploadPercent, setUploadPercent] = useState<number | null>(null)

  // Tier-derived file size cap. Default to free until /api/usage resolves;
  // FileUpload re-renders with the right cap once tierSnapshot lands.
  const currentTier: 'free' | 'plus' | 'pro' = tierSnapshot?.tier ?? 'free'
  const currentMaxBytes = TIER_MAX_BYTES[currentTier]

  // PR D — Plus tier session-exchange. When the user lands on
  // /?plus_session_id=cs_..., POST it to /api/auth/plus-session to set
  // the signed cookie. Strip the query param and refresh the tier
  // indicator so the UI reflects the new Plus subscription.
  useEffect(() => {
    if (typeof window === 'undefined') return
    const url = new URL(window.location.href)
    const plusSid = url.searchParams.get('plus_session_id')
    if (!plusSid) return
    fetch(`/api/auth/plus-session?id=${encodeURIComponent(plusSid)}`)
      .then(r => r.json())
      .then((data: { ok?: boolean; tier?: string; error?: string }) => {
        if (data.ok && data.tier === 'plus') {
          setPlusConfirmation('Welcome to UD Converter Plus. Unlimited single-file conversions are now active.')
          setUsageReloadNonce(n => n + 1)
        } else if (data.error) {
          setPlusConfirmation(`Could not activate Plus: ${data.error}. If you completed payment, please contact support.`)
        }
      })
      .catch(err => setPlusConfirmation(`Could not confirm Plus activation: ${err instanceof Error ? err.message : String(err)}`))
      .finally(() => {
        // Strip the query param so the user can refresh without re-firing the exchange.
        url.searchParams.delete('plus_session_id')
        window.history.replaceState({}, '', url.toString())
      })
  }, [])

  // Fetch tier snapshot to know whether captcha is required.
  useEffect(() => {
    const apiKey = typeof window !== 'undefined' ? localStorage.getItem('converter_api_key') : null
    fetch('/api/usage', { headers: apiKey ? { 'X-API-Key': apiKey } : {} })
      .then(r => r.json())
      .then((data: { tier?: 'free' | 'plus' | 'pro'; lifetimeUsed?: number; dailyUsed?: number }) => {
        if (data.tier) {
          setTierSnapshot({
            tier: data.tier,
            lifetimeUsed: data.lifetimeUsed ?? 0,
            dailyUsed: data.dailyUsed ?? 0,
          })
          // Captcha required for free users past their first conversion.
          setNeedsCaptcha(data.tier === 'free' && (data.lifetimeUsed ?? 0) >= 1)
        }
      })
      .catch(() => {/* ignore — non-critical UI data */})
  }, [usageReloadNonce])

  // Auto-detect input format when a file is selected. The user can
  // override afterward via the From dropdown.
  useEffect(() => {
    if (!file) return
    const detected = detectClientFormat(file)
    if (detected !== 'unknown') setInputFormat(detected)
  }, [file])

  // If the current outputFormat becomes incompatible after the input
  // changes, snap back to UDS (which is universally supported).
  useEffect(() => {
    if (!isPairSupported(inputFormat, outputFormat)) {
      setOutputFormat('uds')
    }
  }, [inputFormat, outputFormat])

  const pairSupported = useMemo(
    () => isPairSupported(inputFormat, outputFormat),
    [inputFormat, outputFormat],
  )

  // PR D — Convert is disabled if free user needs a captcha but hasn't
  // produced a token yet. Plus + Pro skip the captcha gate. Also disabled
  // during upload to prevent double-fire.
  const captchaSatisfied = !needsCaptcha || !!turnstileToken
  const canConvert = !!file && pairSupported && state !== 'converting' && state !== 'uploading' && captchaSatisfied

  // Process a fetch Response into success state or structured error. Shared
  // between fast and slow paths since both routes return the same shape.
  async function handleConvertResponse(res: Response) {
    if (!res.ok) {
      const data: ServerErrorBody = await res.json().catch(() => ({}) as ServerErrorBody)
      const serverMessage = data.error ?? data.message
      if (res.status === 401 && data.captchaRequired) {
        setError({
          message: serverMessage ?? 'Captcha required.',
          recoverable: true,
          captchaRequired: true,
        })
        setNeedsCaptcha(true)
        setTurnstileToken(null)
        setState('error')
        return
      }
      if (res.status === 429 || data.upgrade) {
        setShowPaywall(true)
        setError({
          message: serverMessage ?? s.errors.limitReached,
          recoverable: false,
          upgrade: true,
          used: data.used,
          limit: data.limit,
          lifetimeUsed: data.lifetime_used,
          lifetimeLimit: data.lifetime_limit,
          dailyUsed: data.daily_used,
          dailyLimit: data.daily_limit,
          retryAfterHours: data.retry_after_hours,
          upgradeUrl: data.upgrade_url ?? '/pricing',
        })
        setState('error')
        return
      }
      setError({
        message: serverMessage ?? s.errors.generic,
        recoverable: data.recoverable ?? true,
      })
      setState('error')
      return
    }

    const blob = await res.blob()
    const disp = res.headers.get('Content-Disposition') ?? ''
    const match = disp.match(/filename="([^"]+)"/)
    const name = match?.[1] ?? (file ? file.name.replace(/\.[^.]+$/, `.${outputFormat}`) : `output.${outputFormat}`)

    const wHeader = res.headers.get('X-UD-Warnings') ?? res.headers.get('X-UD-Page-Warnings')
    if (wHeader) {
      try {
        const decoded = JSON.parse(atob(wHeader))
        if (Array.isArray(decoded)) {
          setWarnings(
            decoded
              .map((w: unknown) => typeof w === 'string'
                ? w
                : (w && typeof w === 'object' && 'detail' in w
                  ? (w as { detail?: string; reason?: string; page?: number }).detail
                    ?? `${(w as { reason?: string }).reason ?? 'note'} (page ${(w as { page?: number }).page ?? '—'})`
                  : ''))
              .filter((s): s is string => typeof s === 'string' && s.length > 0),
          )
        }
      } catch { /* ignore */ }
    }

    setDownloadBlob({ blob, name })
    triggerDownload(blob, name)
    setUsageReloadNonce(n => n + 1)
    setState('done')
  }

  async function convert() {
    if (!file) return
    setError(null)
    setDownloadBlob(null)
    setWarnings([])
    setUploadPercent(null)

    const useFastPath = file.size <= FAST_PATH_BYTES

    try {
      if (useFastPath) {
        // ─── FAST PATH ── multipart POST direct to /api/convert(/format) ──
        setState('converting')
        const apiKey = typeof window !== 'undefined' ? localStorage.getItem('converter_api_key') : null
        const headers: Record<string, string> = {}
        if (apiKey) headers['X-API-Key'] = apiKey
        const form = new FormData()
        form.append('file', file)
        if (turnstileToken) form.append('turnstileToken', turnstileToken)
        const url = outputFormat === 'uds' ? '/api/convert' : '/api/convert/format'
        if (outputFormat !== 'uds') form.append('outputFormat', outputFormat)
        const res = await fetch(url, { method: 'POST', body: form, headers })
        await handleConvertResponse(res)
        return
      }

      // ─── SLOW PATH ── upload-to-blob then convert-by-ref ──
      // Step 1+2: upload directly to Vercel Blob via /api/upload-url's
      // client-token flow. The browser does the PUT to blob storage
      // itself; the function only sees metadata.
      setState('uploading')
      setUploadPercent(0)
      const uploaded = await upload(file.name, file, {
        access: 'public',
        handleUploadUrl: '/api/upload-url',
        clientPayload: JSON.stringify({
          fileSize: file.size,
          mimeType: file.type,
          turnstileToken: turnstileToken ?? null,
          fromFormat: inputFormat,
        }),
        onUploadProgress: ({ percentage }: any) => setUploadPercent(Math.round(percentage)),
      })

      // Step 3: tell the function to convert the just-uploaded blob.
      setState('converting')
      setUploadPercent(null)
      const apiKey = typeof window !== 'undefined' ? localStorage.getItem('converter_api_key') : null
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (apiKey) headers['X-API-Key'] = apiKey
      const res = await fetch('/api/convert/format-by-ref', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          blobUrl: uploaded.url,
          fileName: file.name,
          outputFormat,
          turnstileToken: turnstileToken ?? null,
        }),
      })
      await handleConvertResponse(res)
    } catch (e) {
      // Both paths funnel network / SDK errors through here. The
      // @vercel/blob/client `upload()` throws on validation failures
      // (e.g. tier cap exceeded server-side); surface the raw message.
      setError({
        message: e instanceof Error ? e.message : s.errors.network,
        recoverable: true,
      })
      setState('error')
    } finally {
      setUploadPercent(null)
    }
  }

  function reset() {
    setFile(null)
    setInputFormat('pdf')
    setOutputFormat('uds')
    setState('idle')
    setError(null)
    setDownloadBlob(null)
    setWarnings([])
  }

  function downloadAgain() {
    if (downloadBlob) triggerDownload(downloadBlob.blob, downloadBlob.name)
  }

  return (
    <main style={{ maxWidth: 640, margin: '0 auto', padding: '32px 16px 64px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <TooltipTour />
      {/* Header */}
      <header style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 4 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--ud-ink)', margin: 0, letterSpacing: '-0.02em' }}>
          {s.header.title}
        </h1>
        <p style={{ fontSize: 14, color: 'var(--ud-muted)', margin: 0, lineHeight: 1.5 }}>
          {s.header.subtitle}
        </p>
      </header>

      <HiveInstallHint engineName={ENGINE_NAME} engineSlug={ENGINE_SLUG} />
      <HiveFirstVisitExplainer engineName={ENGINE_NAME} engineSlug={ENGINE_SLUG} />

      <TierIndicator reloadNonce={usageReloadNonce} />

      {plusConfirmation && (
        <div style={{
          padding: '12px 16px',
          background: 'rgba(212, 175, 55, 0.1)',
          border: '1px solid rgba(212, 175, 55, 0.3)',
          borderRadius: 10,
          fontSize: 14,
          color: 'var(--ud-ink)',
        }}>
          {plusConfirmation}
        </div>
      )}

      {state === 'done' && downloadBlob ? (
        <SharePage
          outputName={downloadBlob.name}
          outputFormatLabel={outputFormat.toUpperCase()}
          warnings={warnings}
          onDownload={downloadAgain}
          onConvertAnother={reset}
        />
      ) : (state === 'converting' || state === 'uploading') && file ? (
        <ProgressIndicator
          fileName={file.name}
          fileSizeBytes={file.size}
          uploadPercent={state === 'uploading' ? uploadPercent : null}
        />
      ) : (
        <>
          <div id="tour-file-dropzone">
            <FileUpload
              onFileSelected={setFile}
              selectedFile={file}
              disabled={state === 'converting' || state === 'uploading'}
              tier={currentTier}
              maxBytes={currentMaxBytes}
            />
          </div>

          <div id="tour-output-format">
            <FormatDropdowns
              inputFormat={inputFormat}
              outputFormat={outputFormat}
              onInputChange={setInputFormat}
              onOutputChange={setOutputFormat}
              disabled={state === 'converting' || state === 'uploading'}
            />
          </div>

          {/* PR D — Captcha gate. Free users on their 2nd+ conversion
              must complete the Turnstile widget before the convert
              button enables. Plus + Pro skip this entirely. */}
          {needsCaptcha && file && (
            <div>
              <p style={{ fontSize: 13, color: 'var(--ud-muted)', marginBottom: 8 }}>
                Quick check — please complete the captcha to continue:
              </p>
              <TurnstileWidget onToken={setTurnstileToken} />
            </div>
          )}

          <button
            id="tour-convert-button"
            type="button"
            onClick={convert}
            disabled={!canConvert}
            style={{
              background: canConvert ? GOLD : 'var(--ud-paper-2, #f2f1ee)',
              color: canConvert ? '#1e2d3d' : 'var(--ud-muted)',
              border: 'none',
              borderRadius: 12,
              padding: '16px 24px',
              fontSize: 16,
              fontWeight: 700,
              cursor: canConvert ? 'pointer' : 'not-allowed',
              minHeight: 56,
              transition: 'background 0.15s, color 0.15s',
              boxShadow: canConvert ? '0 4px 14px rgba(212,175,55,0.35)' : 'none',
            }}
            aria-label={
              !file
                ? s.convertButton.selectFirst
                : !pairSupported
                  ? s.convertButton.comingSoonAriaTemplate.replace('{{from}}', inputFormat).replace('{{to}}', outputFormat)
                  : s.convertButton.convertAriaTemplate.replace('{{from}}', inputFormat).replace('{{to}}', outputFormat)
            }
          >
            {!file
              ? s.convertButton.selectFirst
              : !pairSupported
                ? s.convertButton.comingSoonTemplate.replace('{{from}}', inputFormat.toUpperCase()).replace('{{to}}', outputFormat.toUpperCase())
                : s.convertButton.convertToTemplate.replace('{{format}}', outputFormat.toUpperCase())}
          </button>

          {state === 'error' && error && (
            <div style={{
              background: 'rgba(226,75,74,0.06)',
              border: '1px solid rgba(226,75,74,0.25)',
              borderRadius: 10,
              padding: '14px 16px',
              fontSize: 14,
            }}>
              <div style={{ color: 'var(--ud-danger, #c0392b)', lineHeight: 1.5 }}>
                {error.message}
              </div>
              {error.recoverable && (
                <button
                  onClick={reset}
                  style={{
                    marginTop: 8,
                    color: 'var(--ud-teal, #0a7a6a)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 13,
                    padding: 0,
                  }}
                >
                  {s.errors.tryAgain}
                </button>
              )}
            </div>
          )}
        </>
      )}

      <PaywallModal
        open={showPaywall}
        onClose={() => setShowPaywall(false)}
        used={error?.lifetimeUsed ?? error?.used}
        limit={error?.lifetimeLimit ?? error?.limit}
      />

      {/* Suppress unused-var warning — tierSnapshot is read implicitly via
          the needsCaptcha branch + reload effect. */}
      <span style={{ display: 'none' }}>{tierSnapshot ? '' : ''}</span>
    </main>
  )
}

function triggerDownload(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
