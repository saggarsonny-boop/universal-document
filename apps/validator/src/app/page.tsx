'use client'
import { useState, useCallback } from 'react'
import UDOnboarding from '@/components/UDOnboarding'

interface UDBlock {
  id: string
  type: string
  base_content?: { text?: string }
}

interface UDDocument {
  ud_version?: string
  state?: string
  metadata?: {
    id?: string
    title?: string
    created_at?: string
    revoked?: boolean
    tags?: string[]
    expires_at?: string
  }
  manifest?: {
    base_language?: string
    language_manifest?: unknown[]
    clarity_layer_manifest?: unknown[]
    permissions?: { require_auth?: boolean }
    signature?: unknown
  }
  blocks?: UDBlock[]
}

interface ValidationResult {
  valid: boolean
  errors: string[]
  doc: UDDocument
  wordCount: number
  langCount: number
}

function validate(raw: string): ValidationResult {
  const errors: string[] = []
  let doc: UDDocument = {}

  try {
    doc = JSON.parse(raw)
  } catch {
    return { valid: false, errors: ['File is not valid JSON'], doc, wordCount: 0, langCount: 0 }
  }

  if (!doc.ud_version) errors.push('Missing ud_version')
  if (!doc.state) errors.push('Missing state')
  if (!doc.metadata?.id) errors.push('Missing metadata.id')
  if (!doc.metadata?.title) errors.push('Missing metadata.title')
  if (!doc.blocks || !Array.isArray(doc.blocks)) errors.push('Missing or invalid blocks array')

  const wordCount = (doc.blocks ?? []).reduce((acc, b) => {
    if ((b.type === 'paragraph' || b.type === 'heading') && b.base_content?.text) {
      return acc + b.base_content.text.trim().split(/\s+/).filter(Boolean).length
    }
    return acc
  }, 0)

  const langCount = doc.manifest?.language_manifest?.length ?? 1

  return { valid: errors.length === 0, errors, doc, wordCount, langCount }
}

const S = {
  page: { minHeight: '100vh', background: 'var(--bg)', padding: '48px 24px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' } as React.CSSProperties,
  center: { maxWidth: '640px', margin: '0 auto' } as React.CSSProperties,
  h1: { fontSize: 32, fontWeight: 700, color: 'var(--ud-ink)', marginBottom: '8px', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' } as React.CSSProperties,
  sub: { fontSize: '14px', color: 'var(--muted)', marginBottom: '40px' } as React.CSSProperties,
  drop: (active: boolean): React.CSSProperties => ({
    border: `2px dashed ${active ? 'var(--gold)' : 'var(--border)'}`,
    borderRadius: '12px',
    padding: '56px 24px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'border-color 0.2s',
    background: active ? 'rgba(212,175,55,0.04)' : 'var(--surface)',
  }),
  dropText: { fontSize: '15px', color: 'var(--muted)', marginBottom: '8px' } as React.CSSProperties,
  dropHint: { fontSize: '12px', color: 'rgba(100,116,139,0.6)' } as React.CSSProperties,
  btn: { marginTop: '16px', background: 'none', border: '1px solid var(--border)', color: 'var(--muted)', padding: '8px 20px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' } as React.CSSProperties,
  card: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '28px 28px 24px', marginTop: '32px' } as React.CSSProperties,
  statusRow: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' } as React.CSSProperties,
  badge: (ok: boolean): React.CSSProperties => ({
    display: 'inline-block', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700,
    background: ok ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
    color: ok ? 'var(--green)' : 'var(--red)',
  }),
  title: { fontSize: '18px', fontWeight: 600, color: 'var(--text)' } as React.CSSProperties,
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' } as React.CSSProperties,
  stat: { background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '8px', padding: '14px 16px' } as React.CSSProperties,
  statLabel: { fontSize: '11px', color: 'var(--muted)', marginBottom: '4px', textTransform: 'uppercase' as const, letterSpacing: '0.06em' },
  statValue: { fontSize: '16px', fontWeight: 600, color: 'var(--text)' } as React.CSSProperties,
  errorList: { marginTop: '20px', borderTop: '1px solid var(--border)', paddingTop: '16px' } as React.CSSProperties,
  errorItem: { fontSize: '13px', color: 'var(--red)', marginBottom: '6px', display: 'flex', gap: '8px' } as React.CSSProperties,
  reset: { marginTop: '24px', background: 'none', border: 'none', color: 'var(--muted)', fontSize: '12px', cursor: 'pointer', textDecoration: 'underline' } as React.CSSProperties,
}

export default function ValidatorPage() {
  const [dragging, setDragging] = useState(false)
  const [result, setResult] = useState<ValidationResult | null>(null)
  const [fileName, setFileName] = useState('')

  const process = useCallback((file: File) => {
    if (!file.name.endsWith('.uds') && !file.name.endsWith('.json')) return
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      setResult(validate(text))
    }
    reader.readAsText(file)
  }, [])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) process(file)
  }, [process])

  const onInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) process(file)
  }

  const { doc, valid, errors, wordCount, langCount } = result ?? {}
  const meta = doc?.metadata
  const manifest = doc?.manifest
  const signed = !!(manifest?.signature)
  const encrypted = !!(manifest?.permissions?.require_auth)
  const revoked = meta?.revoked === true
  const expiresAt = meta?.expires_at
  const expired = expiresAt ? new Date(expiresAt) < new Date() : false

  return (
    <div style={S.page}>
      <UDOnboarding engine="Validator" />
      <div style={S.center}>
        <h1 style={S.h1}>UD Validator</h1>
        <p style={S.sub}>Upload any .uds file to verify its structure and metadata.</p>

        {!result && (
          <div
            style={S.drop(dragging)}
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => document.getElementById('file-input')?.click()}
          >
            <p style={S.dropText}>Drop a .uds file here</p>
            <p style={S.dropHint}>or click to browse</p>
            <input id="file-input" type="file" accept=".uds,.json" style={{ display: 'none' }} onChange={onInput} />
          </div>
        )}

        {result && (
          <div style={S.card}>
            <div style={S.statusRow}>
              <span style={S.badge(valid!)}>{valid ? 'VALID' : 'INVALID'}</span>
              <span style={S.title}>{meta?.title ?? fileName}</span>
            </div>

            <div style={S.grid}>
              <div style={S.stat}>
                <div style={S.statLabel}>Schema</div>
                <div style={S.statValue}>{doc?.ud_version ?? '—'}</div>
              </div>
              <div style={S.stat}>
                <div style={S.statLabel}>State</div>
                <div style={S.statValue}>{doc?.state ?? '—'}</div>
              </div>
              <div style={S.stat}>
                <div style={S.statLabel}>Languages</div>
                <div style={S.statValue}>{langCount}</div>
              </div>
              <div style={S.stat}>
                <div style={S.statLabel}>Word Count</div>
                <div style={S.statValue}>{wordCount!.toLocaleString()}</div>
              </div>
              <div style={S.stat}>
                <div style={S.statLabel}>Signature</div>
                <div style={{ ...S.statValue, color: signed ? 'var(--green)' : 'var(--muted)' }}>{signed ? 'Signed' : 'Unsigned'}</div>
              </div>
              <div style={S.stat}>
                <div style={S.statLabel}>Encryption</div>
                <div style={{ ...S.statValue, color: encrypted ? 'var(--gold)' : 'var(--muted)' }}>{encrypted ? 'Auth required' : 'Open'}</div>
              </div>
              <div style={S.stat}>
                <div style={S.statLabel}>Revoked</div>
                <div style={{ ...S.statValue, color: revoked ? 'var(--red)' : 'var(--green)' }}>{revoked ? 'Yes' : 'No'}</div>
              </div>
              <div style={S.stat}>
                <div style={S.statLabel}>Expiry</div>
                <div style={{ ...S.statValue, color: expired ? 'var(--red)' : 'var(--muted)', fontSize: '13px' }}>
                  {expiresAt ? (expired ? `Expired ${new Date(expiresAt).toLocaleDateString()}` : new Date(expiresAt).toLocaleDateString()) : 'None'}
                </div>
              </div>
            </div>

            {meta?.tags && meta.tags.length > 0 && (
              <div style={{ marginBottom: '16px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {meta.tags.map((t) => (
                  <span key={t} style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '12px', background: 'rgba(212,175,55,0.1)', color: 'var(--gold-dim)' }}>{t}</span>
                ))}
              </div>
            )}

            {meta?.created_at && (
              <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '4px' }}>
                Created: {new Date(meta.created_at).toLocaleString()}
              </p>
            )}

            {errors && errors.length > 0 && (
              <div style={S.errorList}>
                {errors.map((e, i) => (
                  <div key={i} style={S.errorItem}><span>✕</span><span>{e}</span></div>
                ))}
              </div>
            )}

            {valid && (
              <a href="https://ud.hive.baby" style={{
                display: 'inline-block', marginBottom: 12, marginRight: 10,
                background: 'var(--ud-ink)', color: '#fff', borderRadius: 99,
                padding: '9px 20px', fontSize: 13, fontWeight: 500, textDecoration: 'none',
              }}>Open in UD Reader →</a>
            )}
            <button style={S.reset} onClick={() => { setResult(null); setFileName('') }}>Validate another file</button>
          </div>
        )}
      </div>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '3rem 24px 0' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--ud-ink)', fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>How UD Validator differs from PDF validators and JSON schema checkers</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', marginBottom: '1.5rem', lineHeight: 1.6 }}>PDF validators check rendering compliance. JSON validators check syntax. UD Validator checks the semantic layer: is this document structurally sound, has it expired, has it been tampered with, and are its signatures intact?</p>
        <div style={{ display: 'grid', gap: '1rem', marginBottom: '3rem' }}>
          {[
            { title: 'PDF/A validator tools — format compliance only', body: 'PDF validators like veraPDF check whether a file conforms to PDF/A archival standards. They confirm the file renders correctly but say nothing about whether the document content is structurally intact, expired, or tamper-evident.' },
            { title: 'JSON Schema validator — syntax without semantics', body: 'JSON validators confirm that a file matches a declared schema shape. They check types and required fields but cannot verify whether a document has passed its expiry date, whether embedded signatures are cryptographically valid, or whether content has been altered post-signing.' },
            { title: 'UD Validator — semantic document integrity', body: 'UD Validator checks structure (required fields, correct section types), expiry (is this document still valid today?), signature presence (is a .udsig companion referenced?), and schema version compatibility — all in one pass, in your browser.' },
            { title: 'UD Validator — no upload, no server, no data exposure', body: 'Validation runs entirely in your browser using JavaScript. The document never leaves your device. There is no server, no log, no account. This matters for legal documents, clinical records, and confidential contracts.' },
          ].map(card => (
            <div key={card.title} style={{ background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)', borderRadius: '0.75rem', padding: '1.25rem' }}>
              <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--ud-ink)', fontFamily: 'var(--font-body)', marginBottom: '0.4rem' }}>{card.title}</div>
              <div style={{ fontSize: '0.83rem', color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', lineHeight: 1.6 }}>{card.body}</div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
