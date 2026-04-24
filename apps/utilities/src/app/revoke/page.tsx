'use client'
import { useState, useRef, useCallback } from 'react'
import TooltipTour from '@/components/TooltipTour'
import { tourSteps } from '@/lib/tourSteps'

async function sha256Hex(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

export default function Revoke() {
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [reason, setReason] = useState('')
  const [revokedBy, setRevokedBy] = useState('')
  const [result, setResult] = useState<{ url: string; name: string; hash: string; alreadyRevoked: boolean } | null>(null)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback((f: File | null) => {
    if (!f) return
    setFile(f); setResult(null); setError('')
  }, [])

  const onDrop = useCallback((e: React.DragEvent) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]) }, [handleFile])

  const run = async () => {
    if (!file) return
    setError(''); setResult(null)
    try {
      const text = await file.text()
      let doc: Record<string, unknown>
      try { doc = JSON.parse(text) } catch { throw new Error('File does not appear to be a valid .uds file.') }

      const alreadyRevoked = !!(doc.revocation || (typeof doc.provenance === 'object' && doc.provenance && (doc.provenance as Record<string, unknown>).revoked_at))

      const now = new Date().toISOString()
      const revocationPayload = JSON.stringify({ revoked_at: now, reason: reason || 'Revoked', by: revokedBy || undefined })
      const hash = await sha256Hex(revocationPayload)

      const updated = {
        ...doc,
        status: 'revoked',
        revocation: {
          revoked_at: now,
          reason: reason || 'Revoked',
          by: revokedBy || undefined,
          hash,
        },
        provenance: {
          ...(typeof doc.provenance === 'object' && doc.provenance ? doc.provenance as Record<string, unknown> : {}),
          revoked_at: now,
        },
      }

      const blob = new Blob([JSON.stringify(updated, null, 2)], { type: 'application/json' })
      const name = file.name.replace(/\.(uds|udr)$/, '') + '-revoked.uds'
      setResult({ url: URL.createObjectURL(blob), name, hash, alreadyRevoked })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Revocation failed')
    }
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
      <a href="/" style={{ fontSize: 13, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 32 }}>← All tools</a>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--ud-ink)', fontFamily: 'var(--font-display)' }}>UD Revoke</h1>
        <span style={{ fontSize: 13, fontWeight: 600, padding: '3px 10px', borderRadius: 99, background: 'var(--ud-teal-2)', color: 'var(--ud-teal)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>FREE</span>
      </div>
      <p style={{ fontSize: 16, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', marginBottom: 12, lineHeight: 1.6 }}>
        Mark any Universal Document™ as revoked. Generates a revocation hash and embeds it in the document metadata. Compliant readers will display a revocation notice.
      </p>
      <div style={{ fontSize: 13, color: 'var(--ud-danger)', fontFamily: 'var(--font-body)', marginBottom: 32, padding: '8px 12px', background: 'rgba(226,75,74,0.06)', border: '1px solid rgba(226,75,74,0.2)', borderRadius: 'var(--ud-radius)' }}>
        This action sets the document status to "revoked". It cannot be undone within the .uds file itself.
      </div>

      <div style={{ border: `1.5px dashed ${dragging ? 'var(--ud-danger)' : 'var(--ud-border-2)'}`, borderRadius: 'var(--ud-radius-xl)', padding: '40px 24px', textAlign: 'center', cursor: 'pointer', background: dragging ? 'rgba(226,75,74,0.05)' : 'var(--ud-paper-2)', transition: 'all 0.2s', marginBottom: 24 }}
        onDragOver={e => { e.preventDefault(); setDragging(true) }} onDragLeave={() => setDragging(false)} onDrop={onDrop} onClick={() => inputRef.current?.click()}>
        <input ref={inputRef} type="file" accept=".uds,.udr" style={{ display: 'none' }} onChange={e => handleFile(e.target.files?.[0] ?? null)} />
        {file
          ? <div><div style={{ fontSize: 14, color: 'var(--ud-ink)', fontFamily: 'var(--font-body)' }}>🚫 {file.name}</div><div style={{ fontSize: 13, color: 'var(--ud-teal)', marginTop: 8, fontFamily: 'var(--font-body)' }}>Click or drop to replace</div></div>
          : <div><div style={{ fontSize: 32, marginBottom: 12 }}>🚫</div><div style={{ fontSize: 15, color: 'var(--ud-ink)', fontWeight: 600, marginBottom: 6, fontFamily: 'var(--font-body)' }}>Drop your .uds file here</div><div style={{ fontSize: 13, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)' }}>or click to browse · .uds .udr</div></div>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
            Revocation reason <span style={{ color: 'var(--ud-danger)' }}>*</span>
          </label>
          <input
            type="text"
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="e.g. Superseded by v2, Error found..."
            style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ud-ink)', background: '#fff', boxSizing: 'border-box' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
            Revoked by <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
          </label>
          <input
            type="text"
            value={revokedBy}
            onChange={e => setRevokedBy(e.target.value)}
            placeholder="e.g. Dr J. Smith, Legal dept..."
            style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ud-ink)', background: '#fff', boxSizing: 'border-box' }}
          />
        </div>
      </div>

      {error && <div style={{ padding: '12px 16px', background: 'rgba(226,75,74,0.08)', border: '1px solid rgba(226,75,74,0.2)', borderRadius: 'var(--ud-radius)', fontSize: 13, color: 'var(--ud-danger)', fontFamily: 'var(--font-body)', marginBottom: 20 }}>{error}</div>}

      {result && (
        <div style={{ padding: '16px 18px', background: 'rgba(226,75,74,0.06)', border: '1px solid rgba(226,75,74,0.3)', borderRadius: 'var(--ud-radius-lg)', marginBottom: 24 }}>
          {result.alreadyRevoked && <div style={{ fontSize: 13, color: 'var(--ud-gold)', fontFamily: 'var(--font-mono)', marginBottom: 10 }}>⚠ Document was already revoked — revocation record updated.</div>}
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ud-danger)', fontFamily: 'var(--font-body)', marginBottom: 8 }}>Document revoked ✓</div>
          <div style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)', marginBottom: 14, wordBreak: 'break-all' }}>Revocation hash: {result.hash}</div>
          <a href={result.url} download={result.name} style={{ display: 'inline-block', padding: '10px 18px', background: 'var(--ud-ink)', color: '#fff', fontWeight: 600, fontSize: 13, borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)', textDecoration: 'none' }}>Download revoked .uds →</a>
        </div>
      )}

      <button onClick={run} disabled={!file || !reason} style={{ width: '100%', padding: '14px', background: !file || !reason ? 'var(--ud-border)' : 'rgba(226,75,74,0.85)', color: !file || !reason ? 'var(--ud-muted)' : '#fff', border: 'none', borderRadius: 'var(--ud-radius)', fontSize: 15, fontWeight: 600, fontFamily: 'var(--font-body)', cursor: !file || !reason ? 'not-allowed' : 'pointer' }}>
        Revoke Document
      </button>

      <div style={{ marginTop: 40, padding: '16px', background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', fontSize: 13, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', textAlign: 'center' }}>
        Runs entirely in your browser. No data is sent to any server. Part of the <a href="https://ud.hive.baby" style={{ color: 'var(--ud-teal)' }}>Universal Document™</a> ecosystem.
      </div>
      <TooltipTour engineId="revoke" tips={tourSteps['revoke']} />
    </div>
  )
}
