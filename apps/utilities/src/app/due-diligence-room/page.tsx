'use client'
import { useState, useRef, useCallback } from 'react'
import TooltipTour from '@/components/TooltipTour'
import { tourSteps } from '@/lib/tourSteps'

type Section = 'Corporate' | 'Financial' | 'Legal' | 'IP' | 'HR' | 'Regulatory' | 'Other'
type TxType = 'M&A' | 'Fundraising' | 'IPO' | 'Joint Venture' | 'Other'
type DocEntry = { id: string; file: File; section: Section; recipient: string }

const SECTIONS: Section[] = ['Corporate', 'Financial', 'Legal', 'IP', 'HR', 'Regulatory', 'Other']
const TX_TYPES: TxType[] = ['M&A', 'Fundraising', 'IPO', 'Joint Venture', 'Other']

export default function DueDiligenceRoomPage() {
  const [txName, setTxName] = useState('')
  const [txType, setTxType] = useState<TxType>('M&A')
  const [expiryDate, setExpiryDate] = useState('')
  const [docs, setDocs] = useState<DocEntry[]>([])
  const [dragging, setDragging] = useState(false)
  const [result, setResult] = useState<{ url: string; name: string } | null>(null)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const addFiles = useCallback((files: FileList) => {
    const newDocs: DocEntry[] = Array.from(files).map((f, i) => ({
      id: `doc-${Date.now()}-${i}`,
      file: f,
      section: 'Corporate' as Section,
      recipient: '',
    }))
    setDocs(prev => [...prev, ...newDocs])
    setResult(null)
  }, [])

  const updateDoc = (id: string, field: keyof DocEntry, value: string) => {
    setDocs(prev => prev.map(d => d.id === id ? { ...d, [field]: value } : d))
  }

  const removeDoc = (id: string) => setDocs(prev => prev.filter(d => d.id !== id))

  const generate = async () => {
    setError('')
    setResult(null)

    if (!txName.trim()) { setError('Transaction name is required.'); return }
    if (!expiryDate) { setError('Deal closing date is required.'); return }
    if (docs.length === 0) { setError('Upload at least one document.'); return }

    const now = new Date().toISOString()
    const expiryISO = new Date(expiryDate).toISOString()
    const roomId = `VDR-${Date.now().toString(36).toUpperCase()}`

    const { default: JSZip } = await import('jszip')
    const zip = new JSZip()

    const docManifest: { title: string; section: string; fileName: string; watermark?: string }[] = []

    await Promise.all(docs.map(async (d) => {
      const text = await d.file.text().catch(() => `Document: ${d.file.name}`)
      const title = d.file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ')
      const watermarkText = d.recipient ? `CONFIDENTIAL — ${d.recipient} — ${now.split('T')[0]} — ${roomId}` : `CONFIDENTIAL — ${txName} — ${roomId}`

      const doc = {
        format: 'UDS',
        version: '1.0',
        status: 'sealed',
        metadata: {
          title,
          created: now,
          document_type: 'due_diligence_document',
          classification: 'Restricted',
          section: d.section,
          transaction: txName.trim(),
          transaction_type: txType,
          room_id: roomId,
          expiry: expiryISO,
          watermark: watermarkText,
          recipient: d.recipient || undefined,
          language: 'en',
          audit_trail: true,
        },
        content: {
          blocks: text.slice(0, 3000).split('\n\n').filter(Boolean).slice(0, 15).map((para, i) => ({
            id: `b${i + 1}`,
            type: i === 0 ? 'heading' : 'paragraph',
            text: para.trim().slice(0, 400),
          })),
        },
        provenance: {
          created: now,
          source: `file:${d.file.name}`,
          room_id: roomId,
          expiry: expiryISO,
          watermark: watermarkText,
        },
      }

      const fileName = `${d.section.toLowerCase()}-${title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase().slice(0, 40)}.uds`
      zip.file(fileName, JSON.stringify(doc, null, 2))
      docManifest.push({ title, section: d.section, fileName, watermark: d.recipient || undefined })
    }))

    const indexDoc = {
      format: 'UDS',
      version: '1.0',
      status: 'sealed',
      metadata: {
        title: `Data Room Index: ${txName}`,
        created: now,
        document_type: 'data_room_index',
        classification: 'Restricted',
        transaction: txName.trim(),
        transaction_type: txType,
        room_id: roomId,
        expiry: expiryISO,
      },
      content: {
        blocks: [
          { id: 'h1', type: 'heading', text: `Due Diligence Room: ${txName}` },
          { id: 'b1', type: 'paragraph', text: `Transaction type: ${txType}` },
          { id: 'b2', type: 'paragraph', text: `Room ID: ${roomId}` },
          { id: 'b3', type: 'paragraph', text: `Created: ${now}` },
          { id: 'b4', type: 'paragraph', text: `Expiry: ${expiryDate}` },
          { id: 'b5', type: 'heading', text: 'Document Index' },
          ...docManifest.map((d, i) => ({
            id: `idx-${i}`,
            type: 'paragraph',
            text: `[${d.section}] ${d.title}${d.watermark ? ` — Recipient: ${d.watermark}` : ''}`,
          })),
        ],
      },
      provenance: { created: now, room_id: roomId, document_count: docs.length },
    }
    zip.file('00-index.uds', JSON.stringify(indexDoc, null, 2))

    const bundle = {
      format: 'UDZ',
      version: '1.0',
      metadata: {
        title: `Due Diligence Room: ${txName}`,
        transaction_type: txType,
        room_id: roomId,
        created: now,
        expiry: expiryISO,
        classification: 'Restricted',
        document_count: docs.length,
        files: ['00-index.uds', ...docManifest.map(d => d.fileName)],
      },
      chain_of_custody: [{ event: 'data_room_created', timestamp: now, room_id: roomId, documents: docs.length }],
    }
    zip.file('bundle.json', JSON.stringify(bundle, null, 2))

    const zipBlob = await zip.generateAsync({ type: 'blob', mimeType: 'application/octet-stream' })
    const safeName = txName.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase().slice(0, 40)
    setResult({ url: URL.createObjectURL(zipBlob), name: `vdr-${safeName}.udz` })
  }

  const inp: React.CSSProperties = { width: '100%', padding: '10px 14px', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ud-ink)', background: '#fff', boxSizing: 'border-box' }
  const lbl: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }
  const card: React.CSSProperties = { padding: '16px 20px', background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius-lg)' }
  const h3s: React.CSSProperties = { fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--ud-ink)', marginBottom: 4 }
  const p13: React.CSSProperties = { fontSize: 13, fontFamily: 'var(--font-body)', color: 'var(--ud-muted)', lineHeight: 1.5, margin: 0 }
  const ready = !!txName.trim() && !!expiryDate && docs.length > 0

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px' }}>
      <a href="/" style={{ fontSize: 13, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 32 }}>← All tools</a>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10, flexWrap: 'wrap' }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--ud-ink)', fontFamily: 'var(--font-display)' }}>UD Due Diligence Room</h1>
        <span style={{ fontSize: 13, fontWeight: 600, padding: '3px 10px', borderRadius: 99, background: '#1e2d3d', color: '#fff', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Enterprise · Free during beta</span>
      </div>

      <p style={{ fontSize: 16, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', marginBottom: 8, lineHeight: 1.6 }}>
        A virtual data room built on .udz bundles. Documents organised by section, dynamically watermarked per recipient, with auto-expiry on deal closing date. Datasite charges $10,000/month. This is free during beta.
      </p>

      <div style={{ fontSize: 13, color: 'var(--ud-teal)', marginBottom: 28, padding: '8px 12px', background: 'var(--ud-teal-2)', border: '1px solid var(--ud-teal)', borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)' }}>
        ✦ Enterprise · Free during beta — Datasite/Intralinks alternative
      </div>

      {/* Transaction details */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>
        <div style={{ gridColumn: '1/-1' }}>
          <label style={lbl}>Transaction name or code *</label>
          <input style={inp} value={txName} onChange={e => setTxName(e.target.value)} placeholder="e.g. Project Aurora, Series A Fundraise" />
        </div>
        <div>
          <label style={lbl}>Transaction type</label>
          <select value={txType} onChange={e => setTxType(e.target.value as TxType)} style={inp}>
            {TX_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label style={lbl}>Deal closing date (expiry) *</label>
          <input type="date" style={inp} value={expiryDate} onChange={e => setExpiryDate(e.target.value)} />
        </div>
      </div>

      {/* Document uploads */}
      <div style={{ marginBottom: 20 }}>
        <label style={lbl}>Due diligence documents</label>
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => { e.preventDefault(); setDragging(false); if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files) }}
          onClick={() => inputRef.current?.click()}
          style={{ border: `1.5px dashed ${dragging ? 'var(--ud-teal)' : 'var(--ud-border)'}`, borderRadius: 'var(--ud-radius-lg)', padding: '24px', textAlign: 'center', cursor: 'pointer', background: dragging ? 'var(--ud-teal-2)' : '#fafaf8', marginBottom: 12 }}
        >
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ud-muted)' }}>Drop documents (multiple files) · or click to browse</div>
          <input ref={inputRef} type="file" multiple style={{ display: 'none' }} onChange={e => e.target.files && addFiles(e.target.files)} />
        </div>

        {docs.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {docs.map(d => (
              <div key={d.id} style={{ ...card, display: 'grid', gridTemplateColumns: '1fr 160px 1fr auto', gap: 10, alignItems: 'center' }}>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ud-ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.file.name}</div>
                <select value={d.section} onChange={e => updateDoc(d.id, 'section', e.target.value)} style={{ ...inp, padding: '6px 10px' }}>
                  {SECTIONS.map(s => <option key={s}>{s}</option>)}
                </select>
                <input style={{ ...inp, padding: '6px 10px' }} value={d.recipient} onChange={e => updateDoc(d.id, 'recipient', e.target.value)} placeholder="Recipient name (for watermark)" />
                <button onClick={() => removeDoc(d.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ud-muted)', fontSize: 16, padding: '4px 6px' }}>✕</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div style={{ padding: '12px 16px', background: 'rgba(226,75,74,0.08)', border: '1px solid rgba(226,75,74,0.2)', borderRadius: 'var(--ud-radius)', fontSize: 13, color: 'var(--ud-danger)', fontFamily: 'var(--font-body)', marginBottom: 20 }}>{error}</div>
      )}

      {result && (
        <div style={{ padding: '14px 18px', background: 'var(--ud-teal-2)', border: '1px solid var(--ud-teal)', borderRadius: 'var(--ud-radius-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ud-teal)', fontFamily: 'var(--font-body)' }}>Data room created ✓</div>
            <div style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)' }}>{docs.length} documents · expires {expiryDate}</div>
          </div>
          <a href={result.url} download={result.name} style={{ padding: '10px 18px', background: 'var(--ud-ink)', color: '#fff', fontWeight: 600, fontSize: 13, borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)', textDecoration: 'none', flexShrink: 0 }}>Download .udz →</a>
        </div>
      )}

      <button
        onClick={generate}
        disabled={!ready}
        style={{ width: '100%', padding: '14px', background: !ready ? 'var(--ud-border)' : 'var(--ud-ink)', color: !ready ? 'var(--ud-muted)' : '#fff', border: 'none', borderRadius: 'var(--ud-radius)', fontSize: 15, fontWeight: 600, fontFamily: 'var(--font-body)', cursor: !ready ? 'not-allowed' : 'pointer' }}>
        Create data room →
      </button>

      {/* Features */}
      <div style={{ marginTop: 48, marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--ud-ink)', marginBottom: 16 }}>Built for M&A and fundraising</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
          {[
            { title: 'Dynamic watermarking', body: 'Each document watermarked with recipient name, room ID, and date — embedded in metadata.' },
            { title: 'Auto-expiry', body: 'All documents expire on the deal closing date. No manual cleanup after the transaction.' },
            { title: 'Audit trail', body: 'Chain of custody on every document. Know what was in the room when it was created.' },
            { title: 'Section organisation', body: 'Corporate, Financial, Legal, IP, HR, Regulatory — standard due diligence sections.' },
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
        <h2 style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--ud-ink)', marginBottom: 6 }}>UD Due Diligence Room vs Datasite</h2>
        <p style={{ fontSize: 14, fontFamily: 'var(--font-body)', color: 'var(--ud-muted)', marginBottom: 20, lineHeight: 1.6 }}>
          Datasite and Intralinks built their businesses on charging 1–5% of deal value for access to a secure folder. UD replaces the folder with a governed archive.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
          {[
            { icon: '💰', title: 'Datasite', body: '$2,000–10,000/month minimum. Complex setup. Per-page viewing fees. 1–5% of deal value for large transactions.' },
            { icon: '🗂', title: 'Intralinks', body: 'Similar pricing. Legacy infrastructure. PDF-based. No tamper evidence in the files themselves.' },
            { icon: '📁', title: 'SharePoint', body: 'No tamper evidence. No dynamic watermarking. No per-document expiry. IT setup required.' },
            { icon: '🔍', title: 'UD Due Diligence Room', body: 'Enterprise tier. Governed .udz. Dynamic watermarks embedded in metadata. Audit trail. Auto-expiry on deal close.' },
          ].map(item => (
            <div key={item.title} style={{ ...card, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 20, lineHeight: '1', flexShrink: 0, marginTop: 2 }}>{item.icon}</span>
              <div>
                <div style={h3s}>{item.title}</div>
                <p style={p13}>{item.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 40, padding: '16px', background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', fontSize: 13, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', textAlign: 'center' }}>
        Processed in your browser. No files stored on our servers. Part of the <a href="https://ud.hive.baby" style={{ color: 'var(--ud-teal)' }}>Universal Document™</a> ecosystem.
      </div>

      <TooltipTour engineId="due-diligence-room" tips={tourSteps['due-diligence-room']} />
    </div>
  )
}
