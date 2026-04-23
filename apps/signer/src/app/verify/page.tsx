'use client'
import { useState, useRef, useCallback } from 'react'

interface UDSigRecord {
  format?: string
  version?: string
  document?: { filename?: string; type?: string; size?: number; sha256?: string }
  signatures?: Array<{ by?: string; at?: string; reason?: string; hash?: string }>
  revocation?: { revoked_at?: string; reason?: string }
}

async function sha256Hex(buffer: ArrayBuffer): Promise<string> {
  const hash = await crypto.subtle.digest('SHA-256', buffer)
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('')
}

function fmt(ts?: string) {
  if (!ts) return '—'
  try { return new Date(ts).toLocaleString('en-GB', { dateStyle: 'long', timeStyle: 'short' }) } catch { return ts }
}

export default function Verify() {
  const [sigFile, setSigFile] = useState<File | null>(null)
  const [docFile, setDocFile] = useState<File | null>(null)
  const [draggingSig, setDraggingSig] = useState(false)
  const [draggingDoc, setDraggingDoc] = useState(false)
  const [result, setResult] = useState<{
    record: UDSigRecord
    hashMatch?: boolean
    revoked: boolean
  } | null>(null)
  const [error, setError] = useState('')

  const sigRef = useRef<HTMLInputElement>(null)
  const docRef = useRef<HTMLInputElement>(null)

  const verify = async () => {
    if (!sigFile) return
    setError('')
    setResult(null)
    try {
      const text = await sigFile.text()
      let record: UDSigRecord
      try { record = JSON.parse(text) } catch { throw new Error('File does not appear to be a valid .udsig file.') }
      if (record.format !== 'udsig') throw new Error('File format is not udsig. Expected "format": "udsig".')

      let hashMatch: boolean | undefined
      if (docFile && record.document?.sha256) {
        const buf = await docFile.arrayBuffer()
        const computed = await sha256Hex(buf)
        hashMatch = computed === record.document.sha256
      }

      setResult({ record, hashMatch, revoked: !!record.revocation })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Verification failed')
    }
  }

  const onDropSig = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDraggingSig(false)
    const f = e.dataTransfer.files[0]; if (f) setSigFile(f)
  }, [])
  const onDropDoc = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDraggingDoc(false)
    const f = e.dataTransfer.files[0]; if (f) setDocFile(f)
  }, [])

  const pass = result && !result.revoked && result.hashMatch !== false
  const overallStatus = !result ? null : result.revoked ? 'REVOKED' : result.hashMatch === false ? 'TAMPERED' : result.hashMatch === true ? 'VERIFIED' : 'SIGNATURE FOUND'

  const statusColors: Record<string, { bg: string; border: string; text: string; emoji: string }> = {
    'VERIFIED':        { bg: 'var(--ud-teal-2)',      border: 'var(--ud-teal)',    text: 'var(--ud-teal)',    emoji: '✓' },
    'SIGNATURE FOUND': { bg: 'var(--ud-teal-2)',      border: 'var(--ud-teal)',    text: 'var(--ud-teal)',    emoji: '✓' },
    'TAMPERED':        { bg: 'rgba(226,75,74,0.08)',  border: 'rgba(226,75,74,0.3)', text: 'var(--ud-danger)', emoji: '✗' },
    'REVOKED':         { bg: 'rgba(226,75,74,0.08)',  border: 'rgba(226,75,74,0.3)', text: 'var(--ud-danger)', emoji: '⊘' },
  }
  const sc = overallStatus ? statusColors[overallStatus] : null

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
      <a href="/" style={{ fontSize: 13, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 32 }}>
        ← Back
      </a>
      <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--ud-ink)', fontFamily: 'var(--font-display)', marginBottom: 10 }}>
        Verify a Signature
      </h1>
      <p style={{ fontSize: 16, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', marginBottom: 36, lineHeight: 1.6 }}>
        Upload a <code style={{ fontFamily: 'var(--font-mono)', fontSize: 13, background: 'var(--ud-paper-2)', padding: '1px 6px', borderRadius: 4 }}>.udsig</code> companion file to inspect its signature records.
        Optionally upload the original document to verify the hash has not changed.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        {/* .udsig file */}
        <div>
          <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8, fontWeight: 600 }}>
            .udsig file <span style={{ color: 'var(--ud-danger)' }}>*</span>
          </div>
          <div
            style={{ border: `1.5px dashed ${draggingSig ? 'var(--ud-teal)' : 'var(--ud-border-2)'}`, borderRadius: 'var(--ud-radius-lg)', padding: '28px 16px', textAlign: 'center', cursor: 'pointer', background: draggingSig ? 'var(--ud-teal-2)' : 'var(--ud-paper-2)', transition: 'all 0.2s' }}
            onDragOver={e => { e.preventDefault(); setDraggingSig(true) }}
            onDragLeave={() => setDraggingSig(false)}
            onDrop={onDropSig}
            onClick={() => sigRef.current?.click()}
          >
            <input ref={sigRef} type="file" accept=".udsig" style={{ display: 'none' }} onChange={e => setSigFile(e.target.files?.[0] ?? null)} />
            {sigFile ? <div style={{ fontSize: 13, color: 'var(--ud-ink)', fontFamily: 'var(--font-body)' }}>📋 {sigFile.name}</div> : <div style={{ fontSize: 12, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)' }}>Drop .udsig here<br />or click to browse</div>}
          </div>
        </div>

        {/* Original document (optional) */}
        <div>
          <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8, fontWeight: 600 }}>
            Original document <span style={{ color: 'var(--ud-muted)' }}>(optional)</span>
          </div>
          <div
            style={{ border: `1.5px dashed ${draggingDoc ? 'var(--ud-teal)' : 'var(--ud-border-2)'}`, borderRadius: 'var(--ud-radius-lg)', padding: '28px 16px', textAlign: 'center', cursor: 'pointer', background: draggingDoc ? 'var(--ud-teal-2)' : 'var(--ud-paper-2)', transition: 'all 0.2s' }}
            onDragOver={e => { e.preventDefault(); setDraggingDoc(true) }}
            onDragLeave={() => setDraggingDoc(false)}
            onDrop={onDropDoc}
            onClick={() => docRef.current?.click()}
          >
            <input ref={docRef} type="file" style={{ display: 'none' }} onChange={e => setDocFile(e.target.files?.[0] ?? null)} />
            {docFile ? <div style={{ fontSize: 13, color: 'var(--ud-ink)', fontFamily: 'var(--font-body)' }}>📄 {docFile.name}</div> : <div style={{ fontSize: 12, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)' }}>Drop original doc here<br />to verify hash</div>}
          </div>
        </div>
      </div>

      {error && <div style={{ padding: '12px 16px', background: 'rgba(226,75,74,0.08)', border: '1px solid rgba(226,75,74,0.2)', borderRadius: 'var(--ud-radius)', fontSize: 13, color: 'var(--ud-danger)', fontFamily: 'var(--font-body)', marginBottom: 20 }}>{error}</div>}

      {/* Result */}
      {result && sc && (
        <div style={{ background: sc.bg, border: `1px solid ${sc.border}`, borderRadius: 'var(--ud-radius-lg)', padding: '24px 24px 20px', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: sc.text, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: '#fff', fontWeight: 700, flexShrink: 0 }}>{sc.emoji}</div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: sc.text }}>{overallStatus}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ud-muted)', marginTop: 2 }}>
                {result.hashMatch === true ? 'Document hash matches — no tampering detected' :
                 result.hashMatch === false ? 'Document hash does not match — file may have been modified' :
                 'No original document provided — signature records only'}
              </div>
            </div>
          </div>

          {/* Signature records */}
          {(result.record.signatures ?? []).length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10, fontWeight: 600 }}>Signatures</div>
              {result.record.signatures!.map((sig, i) => (
                <div key={i} style={{ background: '#fff', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', padding: '12px 14px', marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: 'var(--ud-ink)' }}>{sig.by ?? '—'}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ud-muted)' }}>{fmt(sig.at)}</span>
                  </div>
                  {sig.reason && <div style={{ fontSize: 12, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', marginTop: 4 }}>Reason: {sig.reason}</div>}
                  {sig.hash && <div style={{ fontSize: 10, color: 'var(--ud-muted)', fontFamily: 'var(--font-mono)', marginTop: 6, wordBreak: 'break-all', opacity: 0.7 }}>{sig.hash}</div>}
                </div>
              ))}
            </div>
          )}

          {/* Document details */}
          {result.record.document && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                ['Filename', result.record.document.filename],
                ['Format', result.record.document.type?.toUpperCase()],
                ['Size', result.record.document.size != null ? `${(result.record.document.size / 1024).toFixed(1)} KB` : undefined],
                ['SHA-256', result.record.document.sha256?.slice(0, 20) + '…'],
              ].filter(([,v]) => v).map(([label, value]) => (
                <div key={label as string}>
                  <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>{label}</div>
                  <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--ud-ink)', wordBreak: 'break-all' }}>{value}</div>
                </div>
              ))}
            </div>
          )}

          {result.revoked && result.record.revocation && (
            <div style={{ marginTop: 16, padding: '12px 14px', background: 'rgba(226,75,74,0.12)', border: '1px solid rgba(226,75,74,0.3)', borderRadius: 'var(--ud-radius)' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ud-danger)', marginBottom: 4 }}>Document revoked</div>
              <div style={{ fontSize: 12, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)' }}>
                Revoked at: {fmt(result.record.revocation.revoked_at)}<br />
                Reason: {result.record.revocation.reason}
              </div>
            </div>
          )}
        </div>
      )}

      <button onClick={verify} disabled={!sigFile} style={{ width: '100%', padding: '14px', background: !sigFile ? 'var(--ud-border)' : 'var(--ud-ink)', color: !sigFile ? 'var(--ud-muted)' : '#fff', border: 'none', borderRadius: 'var(--ud-radius)', fontSize: 15, fontWeight: 600, fontFamily: 'var(--font-body)', cursor: !sigFile ? 'not-allowed' : 'pointer', transition: 'background 0.15s' }}>
        {pass === null ? 'Verify Signature' : 'Verify Again'}
      </button>

      <div style={{ marginTop: 40, padding: '16px', background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', fontSize: 12, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', textAlign: 'center' }}>
        Verification runs entirely in your browser. No data is sent to any server.
        Part of the <a href="https://ud.hive.baby" style={{ color: 'var(--ud-teal)' }}>Universal Document™</a> ecosystem.
      </div>
    </div>
  )
}
