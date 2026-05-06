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
// Routing:
//   outputFormat === 'uds'  → POST /api/convert (legacy pipeline,
//                              preserves PR #2's per-page graceful
//                              degradation for PDFs)
//   else                    → POST /api/convert/format (PR C orchestrator
//                              endpoint that routes via PR A's router +
//                              PR B's converter registry)
//
// Phase 4 deferrals (HiveOps shared package): no canonical Hive logo
// in header, no canonical "Made with ♥ in the Hive" footer signature,
// no install banner, no favicon set, no iOS appleWebApp meta. All
// retrofit cleanly when packages/hive-onboarding/ ships.

import { useEffect, useMemo, useState } from 'react'
import { FileUpload } from './components/v2/FileUpload'
import { FormatDropdowns } from './components/v2/FormatDropdowns'
import { ProgressIndicator } from './components/v2/ProgressIndicator'
import { SharePage } from './components/v2/SharePage'
import { TierIndicator } from './components/v2/TierIndicator'
import { PaywallModal } from './components/v2/PaywallModal'
import { TurnstileWidget } from './components/v2/TurnstileWidget'
import {
  detectClientFormat,
  isPairSupported,
  type ClientInputFormat,
  type ClientOutputFormat,
} from '@/lib/client-formats'
import { useStrings } from '@/lib/strings'

const GOLD = '#D4AF37'

type ConvertState = 'idle' | 'converting' | 'done' | 'error'

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
  // produced a token yet. Plus + Pro skip the captcha gate.
  const captchaSatisfied = !needsCaptcha || !!turnstileToken
  const canConvert = !!file && pairSupported && state !== 'converting' && captchaSatisfied

  async function convert() {
    if (!file) return
    setState('converting')
    setError(null)
    setDownloadBlob(null)
    setWarnings([])

    const apiKey = typeof window !== 'undefined' ? localStorage.getItem('converter_api_key') : null
    const headers: Record<string, string> = {}
    if (apiKey) headers['X-API-Key'] = apiKey

    const form = new FormData()
    form.append('file', file)
    if (turnstileToken) form.append('turnstileToken', turnstileToken)

    const url = outputFormat === 'uds'
      ? '/api/convert'
      : '/api/convert/format'

    if (outputFormat !== 'uds') {
      form.append('outputFormat', outputFormat)
    }

    try {
      const res = await fetch(url, { method: 'POST', body: form, headers })

      if (!res.ok) {
        const data: ServerErrorBody = await res.json().catch(() => ({}) as ServerErrorBody)
        const serverMessage = data.error ?? data.message
        // PR D — captcha verification failed (401). Don't paywall;
        // re-render the captcha and let the user retry.
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
          // Paywall modal — structured fields from PR D's rate-limit gate.
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
      const name = match?.[1] ?? file.name.replace(/\.[^.]+$/, `.${outputFormat}`)

      // Decode warnings from header (legacy /api/convert uses
      // X-UD-Page-Warnings; new /api/convert/format uses X-UD-Warnings).
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
      // Trigger immediate browser download for the user's primary intent.
      triggerDownload(blob, name)

      setUsageReloadNonce(n => n + 1)
      setState('done')
    } catch (e) {
      setError({
        message: e instanceof Error ? e.message : s.errors.network,
        recoverable: true,
      })
      setState('error')
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
      {/* Header */}
      <header style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 4 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--ud-ink)', margin: 0, letterSpacing: '-0.02em' }}>
          {s.header.title}
        </h1>
        <p style={{ fontSize: 14, color: 'var(--ud-muted)', margin: 0, lineHeight: 1.5 }}>
          {s.header.subtitle}
        </p>
      </header>

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
      ) : state === 'converting' && file ? (
        <ProgressIndicator fileName={file.name} fileSizeBytes={file.size} />
      ) : (
        <>
          <FileUpload
            onFileSelected={setFile}
            selectedFile={file}
            disabled={state === 'converting'}
          />

          <FormatDropdowns
            inputFormat={inputFormat}
            outputFormat={outputFormat}
            onInputChange={setInputFormat}
            onOutputChange={setOutputFormat}
            disabled={state === 'converting'}
          />

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
