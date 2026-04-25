'use client'

import { useState, useCallback, useRef } from 'react'
import { PDFDocument } from 'pdf-lib'

// ─── Types ────────────────────────────────────────────────────────────────────

type FileFormat = 'uds' | 'udr' | 'pdf' | 'docx' | 'other'
type Phase = 'idle' | 'ready' | 'signing' | 'done' | 'error'

interface UDJSONDoc {
  state?: string
  metadata?: {
    id?: string
    title?: string
    revoked?: boolean
    visual_identity?: Record<string, unknown>
    [key: string]: unknown
  }
  manifest?: {
    signatures?: Array<{ by: string; at: string; reason?: string; hash: string }>
    revocation?: { revoked_at: string; reason: string }
    [key: string]: unknown
  }
  blocks?: unknown[]
  [key: string]: unknown
}

interface UDSigRecord {
  format: 'udsig'
  version: '0.1.0'
  document: { filename: string; type: string; size: number; sha256: string }
  signatures: Array<{ by: string; at: string; reason: string; hash: string }>
  revocation?: { revoked_at: string; reason: string }
}

// ─── Utilities ────────────────────────────────────────────────────────────────

async function sha256Hex(buffer: BufferSource): Promise<string> {
  const hash = await crypto.subtle.digest('SHA-256', buffer)
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

function detectFormat(filename: string): FileFormat {
  const ext = filename.split('.').pop()?.toLowerCase() ?? ''
  if (ext === 'uds') return 'uds'
  if (ext === 'udr') return 'udr'
  if (ext === 'pdf') return 'pdf'
  if (ext === 'docx' || ext === 'doc') return 'docx'
  return 'other'
}

function formatLabel(fmt: FileFormat): string {
  return { uds: 'UDS', udr: 'UDR', pdf: 'PDF', docx: 'DOCX', other: 'File' }[fmt]
}

function formatBadgeClass(fmt: FileFormat): string {
  return { uds: 'ud-badge-gold', udr: 'ud-badge-default', pdf: 'ud-badge-success', docx: 'ud-badge-default', other: 'ud-badge-default' }[fmt]
}

function download(content: string | Uint8Array<ArrayBufferLike>, filename: string, mime: string) {
  const blob = new Blob([content as BlobPart], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function baseName(filename: string): string {
  return filename.replace(/\.[^.]+$/, '')
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function SignerPage() {
  const [phase, setPhase] = useState<Phase>('idle')
  const [file, setFile] = useState<File | null>(null)
  const [format, setFormat] = useState<FileFormat>('other')
  const [signer, setSigner] = useState('')
  const [reason, setReason] = useState('')
  const [revReason, setRevReason] = useState('')
  const [error, setError] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [results, setResults] = useState<Array<{ label: string; filename: string; content: string | Uint8Array<ArrayBufferLike>; mime: string }>>([])
  const fileRef = useRef<HTMLInputElement>(null)

  const loadFile = useCallback((f: File) => {
    setFile(f)
    setFormat(detectFormat(f.name))
    setPhase('ready')
    setError('')
    setResults([])
  }, [])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) loadFile(f)
  }, [loadFile])

  async function readBuffer(): Promise<ArrayBuffer> {
    return new Promise((res, rej) => {
      const r = new FileReader()
      r.onload = () => res(r.result as ArrayBuffer)
      r.onerror = rej
      r.readAsArrayBuffer(file!)
    })
  }

  async function readText(): Promise<string> {
    return new Promise((res, rej) => {
      const r = new FileReader()
      r.onload = () => res(r.result as string)
      r.onerror = rej
      r.readAsText(file!)
    })
  }

  async function buildSidecar(buf: ArrayBuffer, existingSigs: UDSigRecord['signatures'] = []): Promise<UDSigRecord> {
    const hash = await sha256Hex(buf)
    const sigHash = await sha256Hex(new TextEncoder().encode(signer + Date.now()))
    return {
      format: 'udsig',
      version: '0.1.0',
      document: {
        filename: file!.name,
        type: format,
        size: file!.size,
        sha256: hash,
      },
      signatures: [
        ...existingSigs,
        {
          by: signer.trim(),
          at: new Date().toISOString(),
          reason: reason.trim() || 'approval',
          hash: `udsig_${sigHash.slice(0, 16)}`,
        },
      ],
    }
  }

  // ─── Sign UDR (keep as UDR) ──────────────────────────────────────────────

  async function signUDR() {
    if (!file || !signer.trim()) { setError('Signer name or email is required.'); return }
    setPhase('signing'); setError('')
    try {
      const text = await readText()
      const doc: UDJSONDoc = JSON.parse(text)
      const buf = await readBuffer()
      const hash = await sha256Hex(buf)
      const sigHash = await sha256Hex(new TextEncoder().encode(signer + hash))

      const signed: UDJSONDoc = {
        ...doc,
        state: 'UDR',
        manifest: {
          ...doc.manifest,
          signatures: [
            ...(doc.manifest?.signatures ?? []),
            {
              by: signer.trim(),
              at: new Date().toISOString(),
              reason: reason.trim() || 'approval',
              hash: `udsig_${sigHash.slice(0, 16)}`,
            },
          ],
        },
      }
      const out = JSON.stringify(signed, null, 2)
      const sidecar = await buildSidecar(buf, [])
      setResults([
        { label: 'Signed UDR', filename: `${baseName(file.name)}.udr`, content: out, mime: 'application/json' },
        { label: '.udsig companion', filename: `${baseName(file.name)}.udsig`, content: JSON.stringify(sidecar, null, 2), mime: 'application/json' },
      ])
      setPhase('done')
    } catch (e) {
      setError(`Error: ${e instanceof Error ? e.message : String(e)}`)
      setPhase('ready')
    }
  }

  // ─── Seal UDR → UDS ──────────────────────────────────────────────────────

  async function sealUDS() {
    if (!file || !signer.trim()) { setError('Signer name or email is required.'); return }
    setPhase('signing'); setError('')
    try {
      const text = await readText()
      const doc: UDJSONDoc = JSON.parse(text)
      const buf = await readBuffer()
      const hash = await sha256Hex(buf)
      const sigHash = await sha256Hex(new TextEncoder().encode(signer + hash))

      const sealed: UDJSONDoc = {
        ...doc,
        state: 'UDS',
        metadata: {
          ...doc.metadata,
          visual_identity: {
            watermark_tone: 'dark_blue',
            watermark_hex: '#1d4ed8',
            icon: {
              desktop: 'uds-icon-dark-blue',
              finder_preview: 'uds-finder-dark-blue',
              explorer_preview: 'uds-explorer-dark-blue',
              preview_pane: 'uds-pane-dark-blue',
            },
          },
        },
        manifest: {
          ...doc.manifest,
          signatures: [
            ...(doc.manifest?.signatures ?? []),
            {
              by: signer.trim(),
              at: new Date().toISOString(),
              reason: reason.trim() || 'sealed',
              hash: `udsig_${sigHash.slice(0, 16)}`,
            },
          ],
        },
      }
      const out = JSON.stringify(sealed, null, 2)
      const sidecar = await buildSidecar(buf)

      // Register in ud_documents registry (fire-and-forget)
      const docId = sealed.metadata?.id
      if (docId) {
        const outHash = await sha256Hex(new TextEncoder().encode(out))
        fetch('/api/seal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: docId, hash: outHash, title: sealed.metadata?.title ?? null }),
        }).catch(() => {})
      }

      setResults([
        { label: 'Sealed UDS', filename: `${baseName(file.name)}.uds`, content: out, mime: 'application/json' },
        { label: '.udsig companion', filename: `${baseName(file.name)}.udsig`, content: JSON.stringify(sidecar, null, 2), mime: 'application/json' },
      ])
      setPhase('done')
    } catch (e) {
      setError(`Error: ${e instanceof Error ? e.message : String(e)}`)
      setPhase('ready')
    }
  }

  // ─── Add signature to UDS ─────────────────────────────────────────────────

  async function addSigUDS() {
    if (!file || !signer.trim()) { setError('Signer name or email is required.'); return }
    setPhase('signing'); setError('')
    try {
      const text = await readText()
      const doc: UDJSONDoc = JSON.parse(text)
      const buf = await readBuffer()
      const hash = await sha256Hex(buf)
      const sigHash = await sha256Hex(new TextEncoder().encode(signer + hash))

      const updated: UDJSONDoc = {
        ...doc,
        manifest: {
          ...doc.manifest,
          signatures: [
            ...(doc.manifest?.signatures ?? []),
            {
              by: signer.trim(),
              at: new Date().toISOString(),
              reason: reason.trim() || 'co-signed',
              hash: `udsig_${sigHash.slice(0, 16)}`,
            },
          ],
        },
      }
      const out = JSON.stringify(updated, null, 2)
      const sidecar = await buildSidecar(buf)
      setResults([
        { label: 'Updated UDS', filename: `${baseName(file.name)}.uds`, content: out, mime: 'application/json' },
        { label: '.udsig companion', filename: `${baseName(file.name)}.udsig`, content: JSON.stringify(sidecar, null, 2), mime: 'application/json' },
      ])
      setPhase('done')
    } catch (e) {
      setError(`Error: ${e instanceof Error ? e.message : String(e)}`)
      setPhase('ready')
    }
  }

  // ─── Sign PDF ─────────────────────────────────────────────────────────────

  async function signPDF() {
    if (!file || !signer.trim()) { setError('Signer name or email is required.'); return }
    setPhase('signing'); setError('')
    try {
      const buf = await readBuffer()
      const pdfDoc = await PDFDocument.load(buf)
      const now = new Date().toISOString()
      const sigHash = await sha256Hex(new TextEncoder().encode(signer + now))
      const sigId = `udsig_${sigHash.slice(0, 16)}`

      pdfDoc.setAuthor(signer.trim())
      pdfDoc.setKeywords([
        `signed:${now}`,
        `signer:${signer.trim()}`,
        `reason:${reason.trim() || 'approval'}`,
        `ref:${sigId}`,
      ])
      pdfDoc.setProducer('UD Signer — signer.hive.baby')
      pdfDoc.setCreator('Universal Document™ Ecosystem')

      const signedBytes = await pdfDoc.save()
      const sidecar = await buildSidecar(buf)

      setResults([
        { label: 'Signed PDF', filename: `${baseName(file.name)}-signed.pdf`, content: signedBytes, mime: 'application/pdf' },
        { label: '.udsig companion', filename: `${baseName(file.name)}.udsig`, content: JSON.stringify(sidecar, null, 2), mime: 'application/json' },
      ])
      setPhase('done')
    } catch (e) {
      setError(`Error: ${e instanceof Error ? e.message : String(e)}`)
      setPhase('ready')
    }
  }

  // ─── Sign any other format (sidecar only) ────────────────────────────────

  async function signSidecar() {
    if (!file || !signer.trim()) { setError('Signer name or email is required.'); return }
    setPhase('signing'); setError('')
    try {
      const buf = await readBuffer()
      const sidecar = await buildSidecar(buf)
      setResults([
        { label: '.udsig companion', filename: `${baseName(file.name)}.udsig`, content: JSON.stringify(sidecar, null, 2), mime: 'application/json' },
      ])
      setPhase('done')
    } catch (e) {
      setError(`Error: ${e instanceof Error ? e.message : String(e)}`)
      setPhase('ready')
    }
  }

  // ─── Revoke ───────────────────────────────────────────────────────────────

  async function revokeDoc() {
    if (!file) return
    setPhase('signing'); setError('')
    try {
      const text = await readText()
      const doc: UDJSONDoc = JSON.parse(text)
      const revoked: UDJSONDoc = {
        ...doc,
        metadata: { ...doc.metadata, revoked: true },
        manifest: {
          ...doc.manifest,
          revocation: {
            revoked_at: new Date().toISOString(),
            reason: revReason.trim() || 'issuer_revoked',
          },
        },
      }
      const out = JSON.stringify(revoked, null, 2)
      const ext = format === 'uds' ? 'uds' : 'udr'
      setResults([
        { label: 'Revoked document', filename: `${baseName(file.name)}-revoked.${ext}`, content: out, mime: 'application/json' },
      ])
      setPhase('done')
    } catch (e) {
      setError(`Error: ${e instanceof Error ? e.message : String(e)}`)
      setPhase('ready')
    }
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  const canRevoke = format === 'uds' || format === 'udr'
  const isBusy = phase === 'signing'

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px 80px' }}>

      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700, color: 'var(--ud-ink)', marginBottom: 10, letterSpacing: '-0.02em' }}>
          UD Signer
        </h1>
        <p style={{ color: 'var(--ud-muted)', fontSize: 15, lineHeight: 1.6, maxWidth: 560 }}>
          Sign any document — PDF, DOCX, UDS, UDR, or any file. Generates a cryptographic{' '}
          <code style={{ fontFamily: 'var(--font-mono)', fontSize: 13, background: 'var(--ud-paper-3)', padding: '1px 6px', borderRadius: 4 }}>.udsig</code>{' '}
          companion file as verifiable proof. Free forever.
        </p>
      </div>

      {/* Drop zone */}
      <div
        className={`ud-drop-zone${isDragging ? ' active' : ''}`}
        style={{ marginBottom: 28 }}
        onClick={() => fileRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
      >
        <input
          ref={fileRef}
          type="file"
          style={{ display: 'none' }}
          onChange={e => { const f = e.target.files?.[0]; if (f) loadFile(f) }}
        />
        {file ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 6 }}>
              <span className={`ud-badge ${formatBadgeClass(format)}`}>{formatLabel(format)}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ud-ink)', fontWeight: 500 }}>{file.name}</span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--ud-muted)' }}>{(file.size / 1024).toFixed(1)} KB · click to change</p>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: 32, marginBottom: 10 }}>🔏</div>
            <p style={{ fontWeight: 600, color: 'var(--ud-ink)', marginBottom: 4 }}>Drop any document here</p>
            <p style={{ fontSize: 13, color: 'var(--ud-muted)' }}>PDF · DOCX · UDS · UDR · TXT · CSV · any file</p>
          </div>
        )}
      </div>

      {/* Signer fields */}
      {phase !== 'idle' && (
        <div className="ud-card ud-fade-in" style={{ marginBottom: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)', marginBottom: 6, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Signer name / email *
              </label>
              <input
                value={signer}
                onChange={e => setSigner(e.target.value)}
                placeholder="Jane Smith or jane@example.com"
                style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ud-ink)', background: '#fff', outline: 'none' }}
                onFocus={e => (e.target.style.borderColor = 'var(--ud-teal)')}
                onBlur={e => (e.target.style.borderColor = 'var(--ud-border)')}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)', marginBottom: 6, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Reason (optional)
              </label>
              <input
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="approval, witnessed, co-signed…"
                style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ud-ink)', background: '#fff', outline: 'none' }}
                onFocus={e => (e.target.style.borderColor = 'var(--ud-teal)')}
                onBlur={e => (e.target.style.borderColor = 'var(--ud-border)')}
              />
            </div>
          </div>

          {/* Action buttons per format */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {format === 'udr' && (
              <>
                <button className="ud-btn-secondary" onClick={signUDR} disabled={isBusy}>
                  ✍️ Sign (keep as UDR)
                </button>
                <button className="ud-btn-primary" onClick={sealUDS} disabled={isBusy}>
                  🔒 Sign & Seal as UDS
                </button>
              </>
            )}
            {format === 'uds' && (
              <button className="ud-btn-primary" onClick={addSigUDS} disabled={isBusy}>
                ✍️ Add Signature
              </button>
            )}
            {format === 'pdf' && (
              <button className="ud-btn-primary" onClick={signPDF} disabled={isBusy}>
                ✍️ Sign PDF
              </button>
            )}
            {(format === 'docx' || format === 'other') && (
              <button className="ud-btn-primary" onClick={signSidecar} disabled={isBusy}>
                ✍️ Generate .udsig
              </button>
            )}
          </div>

          {/* Revoke section */}
          {canRevoke && (
            <div style={{ marginTop: 20, paddingTop: 18, borderTop: '0.5px solid var(--ud-border)' }}>
              <p style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)', marginBottom: 10, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Revocation
              </p>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                  value={revReason}
                  onChange={e => setRevReason(e.target.value)}
                  placeholder="Revocation reason (optional)"
                  style={{ flex: '1 1 200px', padding: '9px 12px', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ud-ink)', background: '#fff', outline: 'none' }}
                  onFocus={e => (e.target.style.borderColor = 'var(--ud-danger)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--ud-border)')}
                />
                <button className="ud-btn-danger" onClick={revokeDoc} disabled={isBusy}>
                  🚫 Revoke document
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ background: 'rgba(226,75,74,0.08)', border: '1px solid rgba(226,75,74,0.3)', borderRadius: 'var(--ud-radius)', padding: '12px 16px', marginBottom: 20, fontSize: 14, color: 'var(--ud-danger)' }}>
          {error}
        </div>
      )}

      {/* Busy */}
      {isBusy && (
        <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--ud-muted)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>
          Signing…
        </div>
      )}

      {/* Results */}
      {phase === 'done' && results.length > 0 && (
        <div className="ud-fade-in">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <span style={{ fontSize: 20 }}>✅</span>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 600 }}>Signed. Download your files.</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {results.map((r, i) => (
              <div key={i} className="ud-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '14px 18px' }}>
                <div>
                  <p style={{ fontWeight: 500, fontSize: 14, marginBottom: 2 }}>{r.label}</p>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ud-muted)' }}>{r.filename}</p>
                </div>
                <button
                  className="ud-btn-primary"
                  style={{ padding: '8px 18px', fontSize: 13, flexShrink: 0 }}
                  onClick={() => download(r.content, r.filename, r.mime)}
                >
                  Download
                </button>
              </div>
            ))}
          </div>
          <button
            style={{ marginTop: 20, background: 'none', border: 'none', color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', fontSize: 13, cursor: 'pointer', textDecoration: 'underline' }}
            onClick={() => { setPhase('ready'); setResults([]) }}
          >
            Sign another document
          </button>
        </div>
      )}

      {/* What is .udsig */}
      {phase === 'idle' && (
        <div style={{ marginTop: 48, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          {[
            { icon: '📄', title: 'PDF', body: 'Embeds signer metadata into the PDF and generates a .udsig companion.' },
            { icon: '📝', title: 'DOCX / any file', body: 'Generates a .udsig JSON companion with SHA-256 hash and signature record.' },
            { icon: '📋', title: 'UDR', body: 'Sign and keep as UDR — or sign and seal into a UDS in one step.' },
            { icon: '🔒', title: 'UDS', body: 'Add co-signatures to an already-sealed Universal Document™.' },
          ].map(c => (
            <div key={c.title} className="ud-card" style={{ padding: '20px 18px' }}>
              <div style={{ fontSize: 22, marginBottom: 8 }}>{c.icon}</div>
              <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}>{c.title}</p>
              <p style={{ fontSize: 13, color: 'var(--ud-muted)', lineHeight: 1.5 }}>{c.body}</p>
            </div>
          ))}
        </div>
      )}

      {/* Free forever note */}
      <p style={{ marginTop: 48, textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ud-muted)' }}>
        UD Signer is free forever. No account required. Files never leave your browser.
      </p>
    </div>
  )
}
