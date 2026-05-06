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

import { useEffect, useMemo, useRef, useState } from 'react'
import { FileUpload } from './components/v2/FileUpload'
import { FormatDropdowns } from './components/v2/FormatDropdowns'
import { ProgressIndicator } from './components/v2/ProgressIndicator'
import { SharePage } from './components/v2/SharePage'
import { TierIndicator } from './components/v2/TierIndicator'
import { PaywallModal } from './components/v2/PaywallModal'
import {
  detectClientFormat,
  isPairSupported,
  type ClientInputFormat,
  type ClientOutputFormat,
} from '@/lib/client-formats'

const GOLD = '#D4AF37'

type ConvertState = 'idle' | 'converting' | 'done' | 'error'

type ConvertError = {
  message: string
  recoverable: boolean
  upgrade?: boolean
  used?: number
  limit?: number
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
}

export default function ConverterPage() {
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

  const canConvert = !!file && pairSupported && state !== 'converting'

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
        if (res.status === 429 || data.upgrade) {
          // Show the paywall modal instead of just an error toast.
          setShowPaywall(true)
          setError({
            message: serverMessage ?? 'Free tier limit reached.',
            recoverable: false,
            upgrade: true,
            used: data.used,
            limit: data.limit,
          })
          setState('error')
          return
        }
        setError({
          message: serverMessage ?? 'Could not process this file.',
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
        message: e instanceof Error ? e.message : 'Could not reach the converter.',
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
          Convert anything
        </h1>
        <p style={{ fontSize: 14, color: 'var(--ud-muted)', margin: 0, lineHeight: 1.5 }}>
          PDF, DOCX, CSV, JSON, XLSX, images, and more. Free, no signup, your file never leaves the request lifecycle.
        </p>
      </header>

      <TierIndicator reloadNonce={usageReloadNonce} />

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
                ? 'Select a file first'
                : !pairSupported
                  ? `${inputFormat} → ${outputFormat} not yet supported — pick another target format`
                  : `Convert ${inputFormat} to ${outputFormat}`
            }
          >
            {!file
              ? 'Select a file first'
              : !pairSupported
                ? `${inputFormat.toUpperCase()} → ${outputFormat.toUpperCase()} — coming soon`
                : `Convert to ${outputFormat.toUpperCase()}`}
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
                  Try again
                </button>
              )}
            </div>
          )}
        </>
      )}

      <PaywallModal
        open={showPaywall}
        onClose={() => setShowPaywall(false)}
        used={error?.used}
        limit={error?.limit}
      />
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
