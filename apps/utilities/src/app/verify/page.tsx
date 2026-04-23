'use client'
import { useState, useRef, useCallback } from 'react'

interface VerifyResult {
  valid: boolean
  format: string
  status: string
  title: string
  expired: boolean
  revoked: boolean
  expiresAt?: string
  revokedAt?: string
  hasProvenance: boolean
  hasIntegrity: boolean
  hasClarityLayers: boolean
  layerNames: string[]
  documentType?: string
  checks: { label: string; pass: boolean; detail?: string }[]
}

export default function Verify() {
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [result, setResult] = useState<VerifyResult | null>(null)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback((f: File | null) => { if (!f) return; setFile(f); setResult(null); setError('') }, [])
  const onDrop = useCallback((e: React.DragEvent) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]) }, [handleFile])

  const run = async () => {
    if (!file) return
    setError(''); setResult(null)
    try {
      const text = await file.text()
      let doc: Record<string, unknown>
      try { doc = JSON.parse(text) } catch { throw new Error('File is not valid JSON — cannot verify.') }

      const now = new Date()
      const fmt = (doc.format as string) || 'UNKNOWN'
      const status = (doc.status as string) || 'unknown'
      const title = (doc.title as string) || '(untitled)'
      const expiresAt = doc.expires_at as string | undefined
      const expired = !!expiresAt && new Date(expiresAt) < now
      const revoked = !!(doc.revocation as Record<string,unknown>)?.revoked_at || status === 'revoked'
      const revokedAt = (doc.revocation as Record<string,unknown>)?.revoked_at as string | undefined
      const hasProvenance = !!doc.provenance
      const hasIntegrity = !!(doc._manifest as Record<string,unknown>)?.integrity
      const layers = doc.clarity_layers ? Object.keys(doc.clarity_layers as object) : []

      const checks = [
        { label: 'Valid JSON', pass: true },
        { label: 'Known UD format (UDS/UDR/UDZ)', pass: ['UDS','UDR','UDZ'].includes(fmt), detail: fmt },
        { label: 'Status field present', pass: !!doc.status, detail: status },
        { label: 'Not expired', pass: !expired, detail: expiresAt ? `Expires ${new Date(expiresAt).toLocaleDateString()}` : 'No expiry set' },
        { label: 'Not revoked', pass: !revoked, detail: revokedAt ? `Revoked ${new Date(revokedAt).toLocaleDateString()}` : undefined },
        { label: 'Provenance block present', pass: hasProvenance },
        { label: 'Integrity manifest present', pass: hasIntegrity },
        { label: 'Title present', pass: !!doc.title, detail: title },
      ]

      setResult({ valid: checks.filter(c=>!c.pass).length <= 1, format: fmt, status, title, expired, revoked, expiresAt, revokedAt, hasProvenance, hasIntegrity, hasClarityLayers: layers.length > 0, layerNames: layers, documentType: doc.document_type as string | undefined, checks })
    } catch (err: unknown) { setError(err instanceof Error ? err.message : 'Verification failed') }
  }

  const statusColor = (pass: boolean) => pass ? 'var(--ud-teal)' : 'var(--ud-danger)'
  const statusBg = (pass: boolean) => pass ? 'var(--ud-teal-2)' : 'rgba(226,75,74,0.08)'
  const statusBorder = (pass: boolean) => pass ? 'var(--ud-teal)' : 'rgba(226,75,74,0.3)'

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
      <a href="/" style={{ fontSize: 13, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 32 }}>← All tools</a>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--ud-ink)', fontFamily: 'var(--font-display)' }}>UD Verify</h1>
        <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 99, background: 'var(--ud-teal-2)', color: 'var(--ud-teal)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Free</span>
      </div>
      <p style={{ fontSize: 16, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', marginBottom: 32, lineHeight: 1.6 }}>Verify any Universal Document™ file. Checks format, expiry, revocation status, provenance, integrity manifest, and clarity layers. Runs entirely in your browser.</p>

      <div style={{ border: `1.5px dashed ${dragging ? 'var(--ud-teal)' : 'var(--ud-border-2)'}`, borderRadius: 'var(--ud-radius-xl)', padding: '36px 24px', textAlign: 'center', cursor: 'pointer', background: dragging ? 'var(--ud-teal-2)' : 'var(--ud-paper-2)', transition: 'all 0.2s', marginBottom: 24 }}
        onDragOver={e => { e.preventDefault(); setDragging(true) }} onDragLeave={() => setDragging(false)} onDrop={onDrop} onClick={() => inputRef.current?.click()}>
        <input ref={inputRef} type="file" accept=".uds,.udr,.udz,.json" style={{ display: 'none' }} onChange={e => handleFile(e.target.files?.[0] ?? null)} />
        {file ? <div style={{ fontSize: 14, color: 'var(--ud-ink)', fontFamily: 'var(--font-body)' }}>📄 {file.name} · <span style={{ color: 'var(--ud-teal)' }}>Click to replace</span></div>
          : <><div style={{ fontSize: 28, marginBottom: 8 }}>✔</div><div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ud-ink)', fontFamily: 'var(--font-body)' }}>Drop a .uds, .udr, or .udz file</div><div style={{ fontSize: 12, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', marginTop: 4 }}>Verified locally — nothing uploaded</div></>}
      </div>

      {error && <div style={{ padding: '12px 16px', background: 'rgba(226,75,74,0.08)', border: '1px solid rgba(226,75,74,0.2)', borderRadius: 'var(--ud-radius)', fontSize: 13, color: 'var(--ud-danger)', fontFamily: 'var(--font-body)', marginBottom: 20 }}>{error}</div>}

      {result && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ padding: '18px 20px', background: statusBg(result.valid && !result.expired && !result.revoked), border: `1.5px solid ${statusBorder(result.valid && !result.expired && !result.revoked)}`, borderRadius: 'var(--ud-radius-lg)', marginBottom: 16 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: statusColor(result.valid && !result.expired && !result.revoked), fontFamily: 'var(--font-display)', marginBottom: 4 }}>
              {result.revoked ? '✗ Document revoked' : result.expired ? '✗ Document expired' : result.valid ? '✓ Document valid' : '⚠ Issues found'}
            </div>
            <div style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)' }}>{result.format} · {result.status}{result.documentType ? ` · ${result.documentType}` : ''}</div>
            <div style={{ fontSize: 14, fontFamily: 'var(--font-body)', color: 'var(--ud-ink)', marginTop: 6 }}>{result.title}</div>
          </div>

          <div style={{ display: 'grid', gap: 8 }}>
            {result.checks.map((c, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#fff', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 14, color: statusColor(c.pass) }}>{c.pass ? '✓' : '✗'}</span>
                  <span style={{ fontSize: 13, fontFamily: 'var(--font-body)', color: 'var(--ud-ink)' }}>{c.label}</span>
                </div>
                {c.detail && <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)' }}>{c.detail}</span>}
              </div>
            ))}
            {result.hasClarityLayers && (
              <div style={{ padding: '10px 14px', background: '#fff', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', fontSize: 13, fontFamily: 'var(--font-body)', color: 'var(--ud-ink)' }}>
                <span style={{ color: 'var(--ud-teal)', marginRight: 8 }}>✓</span>Clarity layers: <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ud-muted)' }}>{result.layerNames.join(' · ')}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <button onClick={run} disabled={!file} style={{ width: '100%', padding: '14px', background: !file ? 'var(--ud-border)' : 'var(--ud-ink)', color: !file ? 'var(--ud-muted)' : '#fff', border: 'none', borderRadius: 'var(--ud-radius)', fontSize: 15, fontWeight: 600, fontFamily: 'var(--font-body)', cursor: !file ? 'not-allowed' : 'pointer' }}>Verify Document</button>
      <div style={{ marginTop: 40, padding: '16px', background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', fontSize: 12, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', textAlign: 'center' }}>
        Runs in your browser. No data sent to any server. Part of the <a href="https://ud.hive.baby" style={{ color: 'var(--ud-teal)' }}>Universal Document™</a> ecosystem.
      </div>
    </div>
  )
}
