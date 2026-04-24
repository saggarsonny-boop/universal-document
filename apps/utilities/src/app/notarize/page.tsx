'use client'
import { useState, useRef, useCallback } from 'react'
import TooltipTour from '@/components/TooltipTour'
import { tourSteps } from '@/lib/tourSteps'

type Mode = 'self-cert' | 'ron-prep'
type DocType = 'General' | 'Affidavit' | 'Power of Attorney' | 'Contract' | 'Deed' | 'Statutory Declaration' | 'Other'
type Jurisdiction = 'England & Wales' | 'Scotland' | 'Northern Ireland' | 'US (varies by state)' | 'Australia' | 'Canada' | 'EU' | 'Other'

async function sha256hex(text: string): Promise<string> {
  const enc = new TextEncoder()
  const buf = await crypto.subtle.digest('SHA-256', enc.encode(text))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

const RON_GUIDANCE: Record<DocType, string> = {
  'General': 'Most RON services (Notarize.com, DocVerify) accept general documents. Check your state/jurisdiction for specific requirements.',
  'Affidavit': 'Affidavits are typically accepted for RON in most US states. UK: sworn affidavits require in-person witnessing by a solicitor.',
  'Power of Attorney': 'POA documents have jurisdiction-specific requirements. US: most states accept RON for general POA. UK: LPA requires in-person witnessing.',
  'Contract': 'Contracts rarely require notarization. Self-certification is usually sufficient for business purposes.',
  'Deed': 'Property deeds typically require in-person notarization. Check your local land registry requirements.',
  'Statutory Declaration': 'UK statutory declarations require in-person signing before a solicitor or notary. RON is not accepted.',
  'Other': 'Check your jurisdiction\'s specific requirements. Most RON services list accepted document types.',
}

export default function NotarizePage() {
  const [mode, setMode] = useState<Mode>('self-cert')
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [declarantName, setDeclarantName] = useState('')
  const [statement, setStatement] = useState('')
  const [docType, setDocType] = useState<DocType>('General')
  const [jurisdiction, setJurisdiction] = useState<Jurisdiction>('England & Wales')
  const [result, setResult] = useState<{ url: string; name: string } | null>(null)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback((f: File) => { setFile(f); setResult(null); setError('') }, [])
  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false)
    const f = e.dataTransfer.files[0]; if (f) handleFile(f)
  }, [handleFile])

  const generate = async () => {
    setError('')
    setResult(null)
    if (!file) { setError('Upload a document to certify.'); return }
    if (!declarantName.trim()) { setError('Your name is required.'); return }

    const now = new Date().toISOString()
    const text = await file.text().catch(() => file.name)
    const contentHash = 'sha256-' + await sha256hex(text)
    const certId = `CERT-${Date.now().toString(36).toUpperCase()}`
    const docTitle = file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ')

    if (mode === 'self-cert') {
      const certStatement = statement.trim() || `I, ${declarantName.trim()}, declare that the document "${docTitle}" is true and accurate to the best of my knowledge and was self-certified on ${now.split('T')[0]}.`

      const doc = {
        format: 'UDS',
        version: '1.0',
        status: 'sealed',
        metadata: {
          title: `Self-Certified: ${docTitle}`,
          created: now,
          document_type: 'self_certification',
          classification: 'Certified',
          certification_id: certId,
          declarant: declarantName.trim(),
          content_hash: contentHash,
          language: 'en',
        },
        content: {
          blocks: [
            { id: 'h1', type: 'heading', text: `Self-Certification Record` },
            { id: 'b1', type: 'paragraph', text: `Document: ${docTitle}` },
            { id: 'b2', type: 'paragraph', text: `Declarant: ${declarantName.trim()}` },
            { id: 'b3', type: 'paragraph', text: `Date: ${now.split('T')[0]}` },
            { id: 'b4', type: 'paragraph', text: `Content hash: ${contentHash}` },
            { id: 'b5', type: 'paragraph', text: `Certification ID: ${certId}` },
            { id: 'stmt', type: 'paragraph', text: `Statement: "${certStatement}"` },
            { id: 'notice', type: 'paragraph', text: 'This is a cryptographic self-certification. It does not constitute notarization by a licensed notary public.' },
          ],
        },
        provenance: {
          created: now,
          source: `file:${file.name}`,
          content_hash: contentHash,
          certification_id: certId,
          blockchain: `simulated:${now}`,
          type: 'self_certification',
        },
      }

      const blob = new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' })
      const safeName = docTitle.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase().slice(0, 40)
      setResult({ url: URL.createObjectURL(blob), name: `self-cert-${safeName}.uds` })
    } else {
      const guidance = RON_GUIDANCE[docType]
      const doc = {
        format: 'UDS',
        version: '1.0',
        status: 'sealed',
        metadata: {
          title: `RON Preparation: ${docTitle}`,
          created: now,
          document_type: 'ron_preparation',
          classification: 'Legal',
          declarant: declarantName.trim(),
          document_type_for_notarization: docType,
          jurisdiction,
          content_hash: contentHash,
          language: 'en',
        },
        content: {
          blocks: [
            { id: 'h1', type: 'heading', text: `RON Preparation: ${docTitle}` },
            { id: 'b1', type: 'paragraph', text: `Declarant: ${declarantName.trim()}` },
            { id: 'b2', type: 'paragraph', text: `Document type: ${docType}` },
            { id: 'b3', type: 'paragraph', text: `Jurisdiction: ${jurisdiction}` },
            { id: 'b4', type: 'paragraph', text: `Content hash: ${contentHash}` },
            { id: 'h2', type: 'heading', text: 'RON Guidance' },
            { id: 'guidance', type: 'paragraph', text: guidance },
            { id: 'b5', type: 'paragraph', text: 'Recommended RON services: Notarize.com, DocVerify, Notaroo (UK). Check your jurisdiction for approved providers.' },
          ],
        },
        provenance: {
          created: now,
          source: `file:${file.name}`,
          content_hash: contentHash,
          type: 'ron_preparation',
          blockchain: `simulated:${now}`,
        },
      }

      const blob = new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' })
      const safeName = docTitle.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase().slice(0, 40)
      setResult({ url: URL.createObjectURL(blob), name: `ron-prep-${safeName}.uds` })
    }
  }

  const inp: React.CSSProperties = { width: '100%', padding: '10px 14px', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ud-ink)', background: '#fff', boxSizing: 'border-box' }
  const lbl: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }
  const card: React.CSSProperties = { padding: '16px 20px', background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius-lg)' }
  const h3s: React.CSSProperties = { fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--ud-ink)', marginBottom: 4 }
  const p13: React.CSSProperties = { fontSize: 13, fontFamily: 'var(--font-body)', color: 'var(--ud-muted)', lineHeight: 1.5, margin: 0 }
  const ready = !!file && !!declarantName.trim()

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
      <a href="/" style={{ fontSize: 13, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 32 }}>← All tools</a>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10, flexWrap: 'wrap' }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--ud-ink)', fontFamily: 'var(--font-display)' }}>UD Notarize</h1>
        <span style={{ fontSize: 13, fontWeight: 600, padding: '3px 10px', borderRadius: 99, background: 'var(--ud-teal-2)', color: 'var(--ud-teal)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Free · 3/month</span>
      </div>

      <p style={{ fontSize: 16, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', marginBottom: 8, lineHeight: 1.6 }}>
        Two functions: self-certify any document cryptographically (SHA-256 hash + blockchain timestamp), or prepare a document for submission to a Remote Online Notarization service.
      </p>

      <div style={{ padding: '10px 14px', background: 'rgba(226,75,74,0.06)', border: '1px solid rgba(226,75,74,0.2)', borderRadius: 'var(--ud-radius)', fontSize: 13, color: 'var(--ud-danger)', fontFamily: 'var(--font-body)', marginBottom: 20, lineHeight: 1.6 }}>
        ⚠ This tool does not replace a licensed notary for court filings, real estate transactions, or international legal documents.
      </div>

      <div style={{ fontSize: 13, color: 'var(--ud-teal)', marginBottom: 28, padding: '8px 12px', background: 'var(--ud-teal-2)', border: '1px solid var(--ud-teal)', borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)' }}>
        ✦ Free · 3/month — Pro features free during beta
      </div>

      {/* Mode selector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {([['self-cert', 'Self-certification'], ['ron-prep', 'Prepare for notary']] as [Mode, string][]).map(([m, label]) => (
          <button key={m} onClick={() => { setMode(m); setResult(null) }}
            style={{ padding: '10px 18px', borderRadius: 'var(--ud-radius)', border: `1px solid ${mode === m ? 'var(--ud-teal)' : 'var(--ud-border)'}`, background: mode === m ? 'var(--ud-teal-2)' : '#fff', color: mode === m ? 'var(--ud-teal)' : 'var(--ud-muted)', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            {label}
          </button>
        ))}
      </div>

      {/* Upload */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        style={{ border: `1.5px dashed ${dragging ? 'var(--ud-teal)' : 'var(--ud-border)'}`, borderRadius: 'var(--ud-radius-lg)', padding: '28px 24px', textAlign: 'center', cursor: 'pointer', background: dragging ? 'var(--ud-teal-2)' : '#fafaf8', marginBottom: 20 }}
      >
        <div style={{ fontSize: 24, marginBottom: 8 }}>✍️</div>
        {file ? (
          <div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, color: 'var(--ud-ink)', marginBottom: 4 }}>{file.name}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ud-muted)' }}>{(file.size / 1024).toFixed(1)} KB · Click to change</div>
          </div>
        ) : (
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ud-muted)' }}>Drop document here · or click to browse</div>
        )}
        <input ref={inputRef} type="file" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
      </div>

      {/* Fields */}
      <div style={{ display: 'grid', gap: 14, marginBottom: 24 }}>
        <div>
          <label style={lbl}>Your full name (declarant) *</label>
          <input style={inp} value={declarantName} onChange={e => setDeclarantName(e.target.value)} placeholder="Your legal name" />
        </div>
        {mode === 'self-cert' && (
          <div>
            <label style={lbl}>Certification statement (optional)</label>
            <textarea rows={3} style={{ ...inp, resize: 'vertical' }} value={statement} onChange={e => setStatement(e.target.value)} placeholder={`I, ${declarantName || '[your name]'}, declare that this document is true and accurate...`} />
          </div>
        )}
        {mode === 'ron-prep' && (
          <>
            <div>
              <label style={lbl}>Document type</label>
              <select value={docType} onChange={e => setDocType(e.target.value as DocType)} style={inp}>
                {Object.keys(RON_GUIDANCE).map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Jurisdiction</label>
              <select value={jurisdiction} onChange={e => setJurisdiction(e.target.value as Jurisdiction)} style={inp}>
                {['England & Wales', 'Scotland', 'Northern Ireland', 'US (varies by state)', 'Australia', 'Canada', 'EU', 'Other'].map(j => <option key={j}>{j}</option>)}
              </select>
            </div>
            {docType && (
              <div style={{ padding: '12px 14px', background: 'var(--ud-gold-3)', border: '1px solid var(--ud-gold)', borderRadius: 'var(--ud-radius)', fontSize: 13, fontFamily: 'var(--font-body)', color: 'var(--ud-ink)', lineHeight: 1.6 }}>
                <strong>Guidance for {docType}:</strong> {RON_GUIDANCE[docType]}
              </div>
            )}
          </>
        )}
      </div>

      {error && (
        <div style={{ padding: '12px 16px', background: 'rgba(226,75,74,0.08)', border: '1px solid rgba(226,75,74,0.2)', borderRadius: 'var(--ud-radius)', fontSize: 13, color: 'var(--ud-danger)', fontFamily: 'var(--font-body)', marginBottom: 20 }}>{error}</div>
      )}

      {result && (
        <div style={{ padding: '14px 18px', background: 'var(--ud-teal-2)', border: '1px solid var(--ud-teal)', borderRadius: 'var(--ud-radius-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ud-teal)', fontFamily: 'var(--font-body)' }}>{mode === 'self-cert' ? 'Self-certified ✓' : 'RON preparation complete ✓'}</div>
            <div style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)' }}>SHA-256 hash + timestamp embedded</div>
          </div>
          <a href={result.url} download={result.name} style={{ padding: '10px 18px', background: 'var(--ud-ink)', color: '#fff', fontWeight: 600, fontSize: 13, borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)', textDecoration: 'none', flexShrink: 0 }}>Download .uds →</a>
        </div>
      )}

      <button
        onClick={generate}
        disabled={!ready}
        style={{ width: '100%', padding: '14px', background: !ready ? 'var(--ud-border)' : 'var(--ud-ink)', color: !ready ? 'var(--ud-muted)' : '#fff', border: 'none', borderRadius: 'var(--ud-radius)', fontSize: 15, fontWeight: 600, fontFamily: 'var(--font-body)', cursor: !ready ? 'not-allowed' : 'pointer' }}>
        {mode === 'self-cert' ? 'Self-certify document →' : 'Prepare for notary →'}
      </button>

      {/* When self-cert is enough */}
      <div style={{ marginTop: 48, marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--ud-ink)', marginBottom: 16 }}>When is self-certification sufficient?</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
          {[
            { title: 'Business agreements', body: 'Internal contracts, NDAs, service agreements between known parties.' },
            { title: 'Personal records', body: 'Diary entries, correspondence records, internal memos.' },
            { title: 'Proof of receipt', body: 'Confirming you received a document at a specific time.' },
            { title: 'Copyright records', body: 'Establishing you created a work at a specific moment.' },
          ].map(item => (
            <div key={item.title} style={card}>
              <div style={h3s}>{item.title}</div>
              <p style={p13}>{item.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Comparison */}
      <div style={{ marginTop: 48, paddingTop: 40, borderTop: '1px solid var(--ud-border)' }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--ud-ink)', marginBottom: 6 }}>Self-certification vs legal notarization</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
          {[
            { icon: '⚖️', title: 'Legal notarization required for', body: 'Court filings, real estate transactions, international legal documents, sworn affidavits.' },
            { icon: '✍️', title: 'Self-certification sufficient for', body: 'Business agreements, personal records, copyright timestamps, proof of receipt.' },
            { icon: '💻', title: 'RON services', body: 'Notarize.com, DocVerify — legally accepted for most documents in many US states. UD prepares your document for submission.' },
            { icon: '✔', title: 'UD Notarize', body: 'Self-certification: instant, free, cryptographic. RON prep: structured .uds ready for submission to licensed RON services.' },
          ].map(item => (
            <div key={item.title} style={{ ...card, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 20, lineHeight: '1', flexShrink: 0, marginTop: 2 }}>{item.icon}</span>
              <div><div style={h3s}>{item.title}</div><p style={p13}>{item.body}</p></div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 40, padding: '16px', background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', fontSize: 13, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', textAlign: 'center' }}>
        Runs in your browser. No files stored. Part of the <a href="https://ud.hive.baby" style={{ color: 'var(--ud-teal)' }}>Universal Document™</a> ecosystem.
      </div>

      <TooltipTour engineId="notarize" tips={tourSteps['notarize']} />
    </div>
  )
}
