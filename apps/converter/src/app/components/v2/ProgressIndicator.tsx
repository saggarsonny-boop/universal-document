'use client'

// Three-stage progress indicator.
//   <3s   : spinner + elapsed-second counter
//   3-10s : "Processing page X of Y..." with percentage (synthetic — we
//           don't yet stream real per-page progress; the X/Y is faked
//           from a page-count estimate)
//   10+s  : graphical fuel-tank-style gauge filling toward an estimated
//           ceiling (file-size-derived)
//
// Real streaming progress would need server-sent events from the route
// handler — out of scope for v0.1 per Sonny's spec ("fake progress
// estimate based on file size and page count is acceptable").

import { useEffect, useState } from 'react'
import { useStrings } from '@/lib/strings'

const GOLD = '#D4AF37'
const GOLD_DIM = '#8a6f1f'

type Props = {
  fileName: string
  fileSizeBytes: number
  /** Upload progress 0–100 during direct-to-blob upload phase. When null,
   *  the indicator renders the standard converting state. When non-null,
   *  the upload header replaces the "Converting…" line and the elapsed/
   *  page-progress sub-line shows the upload percentage. */
  uploadPercent?: number | null
}

export function ProgressIndicator({ fileName, fileSizeBytes, uploadPercent = null }: Props) {
  const s = useStrings()
  const [elapsed, setElapsed] = useState(0)
  const isUploading = uploadPercent !== null

  useEffect(() => {
    const start = Date.now()
    const id = window.setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 200)
    return () => window.clearInterval(id)
  }, [])

  // Estimated total runtime, in seconds, from file size. 1s baseline +
  // 1s per MB. For a 9-page legal PDF (~1MB), this gives ~2s, which is
  // typical for the post-PR#5 pdfjs path. Larger files extend the gauge
  // ceiling.
  const sizeMB = fileSizeBytes / (1024 * 1024)
  const estimatedTotal = Math.max(2, Math.min(25, 1 + sizeMB * 1.0))
  const fakedPagesTotal = Math.max(1, Math.round(estimatedTotal))
  const fakedPageNow = Math.min(fakedPagesTotal, Math.max(1, Math.floor((elapsed / estimatedTotal) * fakedPagesTotal)))
  const percent = Math.min(99, Math.floor((elapsed / estimatedTotal) * 100))

  return (
    <div style={{
      border: '1px solid var(--ud-border)',
      borderRadius: 16,
      padding: '32px 24px',
      textAlign: 'center',
      background: '#fff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 14,
    }} role="status" aria-live="polite">
      <Spinner />
      <p style={{ fontSize: 15, color: 'var(--ud-ink)', fontWeight: 500, margin: 0, wordBreak: 'break-all' }}>
        {isUploading
          ? s.progress.uploadingTemplate.replace('{{percent}}', String(uploadPercent ?? 0))
          : s.progress.convertingTemplate.replace('{{fileName}}', fileName)}
      </p>

      {isUploading ? (
        <p style={{ fontSize: 13, color: 'var(--ud-muted)', margin: 0, wordBreak: 'break-all' }}>
          {fileName}
        </p>
      ) : elapsed < 3 ? (
        <p style={{ fontSize: 13, color: 'var(--ud-muted)', margin: 0 }}>
          {s.progress.elapsedTemplate.replace('{{seconds}}', String(elapsed))}
        </p>
      ) : elapsed < 10 ? (
        <>
          <p style={{ fontSize: 13, color: 'var(--ud-muted)', margin: 0 }}>
            {s.progress.pageProgressTemplate.replace('{{now}}', String(fakedPageNow)).replace('{{total}}', String(fakedPagesTotal))}
          </p>
          <p style={{ fontSize: 12, color: 'var(--ud-muted)', margin: 0 }}>
            {s.progress.percentElapsedTemplate.replace('{{percent}}', String(percent)).replace('{{seconds}}', String(elapsed))}
          </p>
        </>
      ) : (
        <Gauge percent={percent} elapsed={elapsed} estimatedTotal={Math.ceil(estimatedTotal)} />
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      {/* Suppress unused-const warning for GOLD_DIM (referenced inline below) */}
      <span style={{ display: 'none' }} aria-hidden="true">{GOLD_DIM}</span>
    </div>
  )
}

function Spinner() {
  return (
    <div aria-hidden="true" style={{
      width: 36,
      height: 36,
      border: '3px solid var(--ud-border)',
      borderTopColor: GOLD,
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
    }} />
  )
}

// Fuel-tank-style horizontal gauge. Fills left-to-right from 0% toward
// the percent value, with a thin gold border + dim-gold scale ticks.
// Width-responsive — scales to container.
function Gauge({ percent, elapsed, estimatedTotal }: { percent: number; elapsed: number; estimatedTotal: number }) {
  const s = useStrings()
  return (
    <div style={{ width: '100%', maxWidth: 360, display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{
        position: 'relative',
        height: 24,
        background: 'var(--ud-paper-2, #f2f1ee)',
        border: `1px solid ${GOLD_DIM}`,
        borderRadius: 6,
        overflow: 'hidden',
      }} aria-label={s.progress.gaugeProgressAria.replace('{{percent}}', String(percent))}>
        <div style={{
          position: 'absolute',
          inset: 0,
          width: `${percent}%`,
          background: `linear-gradient(90deg, ${GOLD_DIM} 0%, ${GOLD} 100%)`,
          transition: 'width 0.4s ease-out',
        }} />
        {/* tick marks at 25/50/75 */}
        {[25, 50, 75].map(t => (
          <div key={t} style={{
            position: 'absolute',
            top: 4,
            bottom: 4,
            left: `${t}%`,
            width: 1,
            background: 'rgba(0,0,0,0.18)',
          }} />
        ))}
      </div>
      <p style={{ fontSize: 13, color: 'var(--ud-muted)', margin: 0, textAlign: 'center' }}>
        {s.progress.gaugePercentTemplate
          .replace('{{percent}}', String(percent))
          .replace('{{seconds}}', String(elapsed))
          .replace('{{total}}', String(estimatedTotal))}
      </p>
      <p style={{ fontSize: 12, color: 'var(--ud-muted)', margin: 0, textAlign: 'center', fontStyle: 'italic' }}>
        {s.progress.gaugeWaitNote}
      </p>
    </div>
  )
}
