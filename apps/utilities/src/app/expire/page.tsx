'use client'
import { useState, useRef, useCallback } from 'react'
import TooltipTour from '@/components/TooltipTour'
import { tourSteps } from '@/lib/tourSteps'

export default function Expire() {
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [expiryDate, setExpiryDate] = useState('')
  const [expiryReason, setExpiryReason] = useState('')
  const [result, setResult] = useState<{ url: string; name: string; existing?: string } | null>(null)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback((f: File | null) => {
    if (!f) return
    setFile(f); setResult(null); setError('')
    f.text().then(text => {
      try {
        const doc = JSON.parse(text)
        const existing = doc.expires_at || doc.expiry || doc.provenance?.expires_at
        if (existing) setExpiryDate(existing.slice(0, 10))
      } catch { /* not JSON */ }
    })
  }, [])

  const onDrop = useCallback((e: React.DragEvent) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]) }, [handleFile])

  const run = async () => {
    if (!file || !expiryDate) return
    setError(''); setResult(null)
    try {
      const text = await file.text()
      let doc: Record<string, unknown>
      try { doc = JSON.parse(text) } catch { throw new Error('File does not appear to be a valid .uds or .udr file.') }

      const now = new Date().toISOString()
      const expiresAt = new Date(expiryDate).toISOString()

      const updated = {
        ...doc,
        expires_at: expiresAt,
        provenance: {
          ...(typeof doc.provenance === 'object' && doc.provenance ? doc.provenance as Record<string, unknown> : {}),
          expires_at: expiresAt,
          expiry_set_at: now,
          ...(expiryReason ? { expiry_reason: expiryReason } : {}),
        },
      }

      const blob = new Blob([JSON.stringify(updated, null, 2)], { type: 'application/json' })
      const name = file.name.replace(/\.(uds|udr)$/, '') + '-expires.uds'
      setResult({ url: URL.createObjectURL(blob), name, existing: doc.expires_at as string | undefined })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to set expiry')
    }
  }

  const minDate = new Date().toISOString().slice(0, 10)

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
      <a href="/" style={{ fontSize: 13, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 32 }}>← All tools</a>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--ud-ink)', fontFamily: 'var(--font-display)' }}>UD Expire</h1>
        <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 99, background: 'var(--ud-teal-2)', color: 'var(--ud-teal)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>FREE</span>
      </div>
      <p style={{ fontSize: 16, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', marginBottom: 32, lineHeight: 1.6 }}>
        Add or update an expiration date on any Universal Document™. After the expiry date, compliant readers will block access. The expiry is encoded in the document metadata — tamper-evident and verifiable.
      </p>

      <div style={{ border: `1.5px dashed ${dragging ? 'var(--ud-teal)' : 'var(--ud-border-2)'}`, borderRadius: 'var(--ud-radius-xl)', padding: '40px 24px', textAlign: 'center', cursor: 'pointer', background: dragging ? 'var(--ud-teal-2)' : 'var(--ud-paper-2)', transition: 'all 0.2s', marginBottom: 24 }}
        onDragOver={e => { e.preventDefault(); setDragging(true) }} onDragLeave={() => setDragging(false)} onDrop={onDrop} onClick={() => inputRef.current?.click()}>
        <input ref={inputRef} type="file" accept=".uds,.udr" style={{ display: 'none' }} onChange={e => handleFile(e.target.files?.[0] ?? null)} />
        {file
          ? <div><div style={{ fontSize: 14, color: 'var(--ud-ink)', fontFamily: 'var(--font-body)' }}>⏳ {file.name}</div><div style={{ fontSize: 12, color: 'var(--ud-teal)', marginTop: 8, fontFamily: 'var(--font-body)' }}>Click or drop to replace</div></div>
          : <div><div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div><div style={{ fontSize: 15, color: 'var(--ud-ink)', fontWeight: 600, marginBottom: 6, fontFamily: 'var(--font-body)' }}>Drop your .uds or .udr file here</div><div style={{ fontSize: 13, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)' }}>or click to browse</div></div>}
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
          Expiry date <span style={{ color: 'var(--ud-danger)' }}>*</span>
        </label>
        <input
          type="date"
          value={expiryDate}
          min={minDate}
          onChange={e => setExpiryDate(e.target.value)}
          style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--ud-ink)', background: '#fff', boxSizing: 'border-box' }}
        />
      </div>

      <div style={{ marginBottom: 24 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
          Reason <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
        </label>
        <input
          type="text"
          value={expiryReason}
          onChange={e => setExpiryReason(e.target.value)}
          placeholder="e.g. Contract term ended, superseded by v2..."
          style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ud-ink)', background: '#fff', boxSizing: 'border-box' }}
        />
      </div>

      {error && <div style={{ padding: '12px 16px', background: 'rgba(226,75,74,0.08)', border: '1px solid rgba(226,75,74,0.2)', borderRadius: 'var(--ud-radius)', fontSize: 13, color: 'var(--ud-danger)', fontFamily: 'var(--font-body)', marginBottom: 20 }}>{error}</div>}

      {result && (
        <div style={{ padding: '14px 18px', background: 'var(--ud-teal-2)', border: '1px solid var(--ud-teal)', borderRadius: 'var(--ud-radius-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ud-teal)', fontFamily: 'var(--font-body)', marginBottom: 2 }}>
              {result.existing ? 'Expiry date updated ✓' : 'Expiry date set ✓'}
            </div>
            <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)' }}>
              Expires: {new Date(expiryDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} · {result.name}
            </div>
          </div>
          <a href={result.url} download={result.name} style={{ padding: '10px 18px', background: 'var(--ud-ink)', color: '#fff', fontWeight: 600, fontSize: 13, borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)', textDecoration: 'none', flexShrink: 0 }}>Download .uds →</a>
        </div>
      )}

      <button onClick={run} disabled={!file || !expiryDate} style={{ width: '100%', padding: '14px', background: !file || !expiryDate ? 'var(--ud-border)' : 'var(--ud-ink)', color: !file || !expiryDate ? 'var(--ud-muted)' : '#fff', border: 'none', borderRadius: 'var(--ud-radius)', fontSize: 15, fontWeight: 600, fontFamily: 'var(--font-body)', cursor: !file || !expiryDate ? 'not-allowed' : 'pointer' }}>
        Set Expiry Date
      </button>

      <div style={{ marginTop: 40, padding: '16px', background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', fontSize: 12, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', textAlign: 'center' }}>
        Runs entirely in your browser. No data is sent to any server. Part of the <a href="https://ud.hive.baby" style={{ color: 'var(--ud-teal)' }}>Universal Document™</a> ecosystem.
      </div>
      <TooltipTour engineId="expire" tips={tourSteps['expire']} />
    </div>
  )
}
