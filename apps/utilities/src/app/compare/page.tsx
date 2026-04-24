'use client'
import { useState, useRef, useCallback } from 'react'
import TooltipTour from '@/components/TooltipTour'
import { tourSteps } from '@/lib/tourSteps'

function DropSlot({
  label, file, onFile, hint,
}: {
  label: string
  file: File | null
  onFile: (f: File) => void
  hint: string
}) {
  const [dragging, setDragging] = useState(false)
  const ref = useRef<HTMLInputElement>(null)

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) onFile(f)
  }, [onFile])

  return (
    <div
      onDragOver={e => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      onClick={() => ref.current?.click()}
      style={{
        flex: 1, minWidth: 200, minHeight: 200,
        border: `2px dashed ${dragging ? 'var(--ud-teal)' : file ? 'var(--ud-gold)' : 'var(--ud-border-2)'}`,
        borderRadius: 'var(--ud-radius-xl)',
        background: dragging ? 'var(--ud-teal-2)' : file ? 'var(--ud-gold-3)' : 'var(--ud-paper-2)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: 24, cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center',
      }}
    >
      <input ref={ref} type="file" accept=".pdf" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f) }} />
      <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ud-muted)', marginBottom: 12 }}>{label}</div>
      {file ? (
        <>
          <div style={{ fontSize: 28, marginBottom: 8 }}>📄</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ud-ink)', marginBottom: 4, wordBreak: 'break-word', maxWidth: 180 }}>{file.name}</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ud-muted)' }}>{(file.size / 1024).toFixed(0)} KB · click to replace</div>
        </>
      ) : (
        <>
          <div style={{ fontSize: 40, marginBottom: 12, animation: 'ud-bounce 2.4s ease-in-out infinite' }}>📄</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ud-ink)', marginBottom: 4 }}>Drop PDF here</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ud-muted)' }}>{hint}</div>
        </>
      )}
    </div>
  )
}

export default function ComparePage() {
  const [fileA, setFileA] = useState<File | null>(null)
  const [fileB, setFileB] = useState<File | null>(null)
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [diff, setDiff] = useState('')
  const [error, setError] = useState('')

  const ready = fileA && fileB

  const run = async () => {
    if (!fileA || !fileB) return
    setProcessing(true); setProgress(20); setError(''); setDiff('')
    try {
      const form = new FormData()
      form.append('tool', 'compare')
      form.append('files', fileA)
      form.append('files', fileB)
      setProgress(50)
      const res = await fetch('/api/process', { method: 'POST', body: form })
      setProgress(90)
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Compare failed') }
      const json = await res.json()
      setDiff(json.diff || json.text || 'No differences found.')
      setProgress(100)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px' }}>
      <a href="/" style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ud-muted)', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 32, textDecoration: 'none' }}>
        ← All tools
      </a>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700, color: 'var(--ud-ink)', marginBottom: 10, letterSpacing: '-0.02em' }}>
        UD Compare
      </h1>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--ud-muted)', marginBottom: 8 }}>
        AI-powered comparison. Upload the original and the revised version — see exactly what changed.
      </p>
      <span className="ud-badge ud-badge-gold" style={{ marginBottom: 32, display: 'inline-block' }}>AI · Free tier: 3/day</span>

      {/* Two drop zones with VS divider */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'stretch', marginBottom: 24 }}>
        <DropSlot label="Document A — Original" file={fileA} onFile={setFileA} hint="the baseline" />
        <div style={{ display: 'flex', alignItems: 'center', padding: '0 4px', flexShrink: 0 }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700,
            color: 'var(--ud-border-2)', letterSpacing: '0.05em',
            writingMode: 'vertical-rl' as const, textOrientation: 'mixed' as const,
          }}>VS</div>
        </div>
        <DropSlot label="Document B — Revised" file={fileB} onFile={setFileB} hint="the updated version" />
      </div>

      {error && (
        <div style={{ padding: '12px 16px', background: 'rgba(226,75,74,0.08)', border: '1px solid rgba(226,75,74,0.2)', borderRadius: 8, fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ud-danger)', marginBottom: 20 }}>
          {error}
        </div>
      )}

      {processing && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ height: 3, background: 'var(--ud-paper-3)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ height: '100%', background: 'var(--ud-ink)', width: `${progress}%`, transition: 'width 0.4s ease', borderRadius: 4 }} />
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ud-muted)', marginTop: 6 }}>Comparing documents…</div>
        </div>
      )}

      {diff && (
        <div className="ud-card" style={{ marginBottom: 24 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, color: 'var(--ud-teal)', marginBottom: 12, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Comparison result
          </div>
          <pre style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ud-ink)', lineHeight: 1.7, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {diff}
          </pre>
        </div>
      )}

      <button
        className="ud-btn-primary"
        onClick={run}
        disabled={!ready || processing}
        style={{ width: '100%', justifyContent: 'center', padding: '14px', opacity: ready ? 1 : 0.45, cursor: ready ? 'pointer' : 'not-allowed' }}
      >
        {processing ? 'Comparing…' : ready ? 'Compare documents →' : 'Upload both documents above to compare'}
      </button>

      <div style={{ marginTop: 32, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ud-muted)', textAlign: 'center' }}>
        Files processed in memory only. Not stored. ·{' '}
        <a href="https://ud.hive.baby" style={{ color: 'var(--ud-muted)' }}>Universal Document™</a>
      </div>
      <TooltipTour engineId="compare" tips={tourSteps['compare']} />
    </div>
  )
}
