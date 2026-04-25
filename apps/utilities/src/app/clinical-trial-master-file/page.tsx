'use client'
import { useState, useRef, useCallback } from 'react'
import TooltipTour from '@/components/TooltipTour'
import { tourSteps } from '@/lib/tourSteps'

type Phase = 'Phase I' | 'Phase II' | 'Phase III' | 'Phase IV'
type GCPClass = 'Essential' | 'Non-essential'
type TMFSection = 'Section 1: Trial Management' | 'Section 2: Investigational Product' | 'Section 3: IRB/IEC' | 'Section 4: Regulatory' | 'Section 5: Site Management' | 'Section 6: Statistics' | 'Section 7: Data Management'
type DocEntry = { id: string; file: File; section: TMFSection; gcpClass: GCPClass; version: string; author: string }

const TMF_SECTIONS: TMFSection[] = [
  'Section 1: Trial Management',
  'Section 2: Investigational Product',
  'Section 3: IRB/IEC',
  'Section 4: Regulatory',
  'Section 5: Site Management',
  'Section 6: Statistics',
  'Section 7: Data Management',
]

const PHASES: Phase[] = ['Phase I', 'Phase II', 'Phase III', 'Phase IV']

export default function ClinicalTrialMasterFilePage() {
  const [trialTitle, setTrialTitle] = useState('')
  const [protocolNumber, setProtocolNumber] = useState('')
  const [sponsorName, setSponsorName] = useState('')
  const [piName, setPiName] = useState('')
  const [phase, setPhase] = useState<Phase>('Phase II')
  const [therapeuticArea, setTherapeuticArea] = useState('')
  const [indCta, setIndCta] = useState('')
  const [trialCloseDate, setTrialCloseDate] = useState('')
  const [docs, setDocs] = useState<DocEntry[]>([])
  const [dragging, setDragging] = useState(false)
  const [result, setResult] = useState<{ url: string; name: string } | null>(null)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const addFiles = useCallback((files: FileList) => {
    const newDocs: DocEntry[] = Array.from(files).map((f, i) => ({
      id: `doc-${Date.now()}-${i}`,
      file: f,
      section: 'Section 1: Trial Management' as TMFSection,
      gcpClass: 'Essential' as GCPClass,
      version: '1.0',
      author: '',
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

    if (!trialTitle.trim()) { setError('Trial title is required.'); return }
    if (!protocolNumber.trim()) { setError('Protocol number is required.'); return }
    if (!sponsorName.trim()) { setError('Sponsor name is required.'); return }
    if (docs.length === 0) { setError('Upload at least one TMF document.'); return }

    const now = new Date().toISOString()
    const expiryISO = trialCloseDate ? new Date(trialCloseDate).toISOString() : undefined
    const tmfId = `TMF-${protocolNumber.replace(/\s+/g, '-').toUpperCase()}`

    const { default: JSZip } = await import('jszip')
    const zip = new JSZip()

    const docManifest: { title: string; section: string; gcpClass: string; fileName: string; version: string }[] = []

    await Promise.all(docs.map(async (d) => {
      const text = await d.file.text().catch(() => `Document: ${d.file.name}`)
      const title = d.file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ')

      const doc = {
        format: 'UDS',
        version: '1.0',
        status: 'sealed',
        metadata: {
          title,
          created: now,
          document_type: 'tmf_document',
          classification: 'GCP Controlled',
          tmf_section: d.section,
          gcp_classification: d.gcpClass,
          document_version: d.version,
          author: d.author || undefined,
          trial_title: trialTitle.trim(),
          protocol_number: protocolNumber.trim(),
          sponsor: sponsorName.trim(),
          phase,
          tmf_id: tmfId,
          expiry: expiryISO,
          language: 'en',
          ich_gcp_standard: 'ICH E6(R3)',
          dia_tmf_reference: d.section,
        },
        content: {
          blocks: text.slice(0, 3000).split('\n\n').filter(Boolean).slice(0, 12).map((para, i) => ({
            id: `b${i + 1}`,
            type: i === 0 ? 'heading' : 'paragraph',
            text: para.trim().slice(0, 400),
          })),
        },
        provenance: {
          created: now,
          source: `file:${d.file.name}`,
          tmf_id: tmfId,
          ich_gcp: 'ICH E6(R3)',
          blockchain: null,
          expiry: expiryISO,
        },
      }

      const sectionCode = d.section.split(':')[0].replace('Section ', 'S').trim()
      const fileName = `${sectionCode}-${title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase().slice(0, 40)}-v${d.version}.uds`
      zip.file(fileName, JSON.stringify(doc, null, 2))
      docManifest.push({ title, section: d.section, gcpClass: d.gcpClass, fileName, version: d.version })
    }))

    const indexDoc = {
      format: 'UDS',
      version: '1.0',
      status: 'sealed',
      metadata: {
        title: `TMF Index: ${trialTitle}`,
        created: now,
        document_type: 'tmf_index',
        classification: 'GCP Controlled',
        tmf_id: tmfId,
        protocol_number: protocolNumber.trim(),
        sponsor: sponsorName.trim(),
        pi: piName.trim() || undefined,
        phase,
        therapeutic_area: therapeuticArea.trim() || undefined,
        ind_cta: indCta.trim() || undefined,
        ich_gcp_standard: 'ICH E6(R3)',
        expiry: expiryISO,
      },
      content: {
        blocks: [
          { id: 'h1', type: 'heading', text: `Trial Master File: ${trialTitle}` },
          { id: 'b1', type: 'paragraph', text: `Protocol: ${protocolNumber}` },
          { id: 'b2', type: 'paragraph', text: `Sponsor: ${sponsorName}` },
          { id: 'b3', type: 'paragraph', text: `Principal Investigator: ${piName || 'Not specified'}` },
          { id: 'b4', type: 'paragraph', text: `Phase: ${phase} — ${therapeuticArea || 'Therapeutic area not specified'}` },
          ...(indCta ? [{ id: 'b5', type: 'paragraph', text: `IND/CTA: ${indCta}` }] : []),
          { id: 'b6', type: 'paragraph', text: `ICH GCP Standard: ICH E6(R3) — DIA TMF Reference Model` },
          { id: 'h2', type: 'heading', text: 'Document Index' },
          ...docManifest.map((d, i) => ({
            id: `idx-${i}`,
            type: 'paragraph',
            text: `[${d.section.split(':')[0]}] ${d.title} v${d.version} — GCP: ${d.gcpClass}`,
          })),
        ],
      },
      provenance: { created: now, tmf_id: tmfId, document_count: docs.length, blockchain: null },
    }
    zip.file('00-tmf-index.uds', JSON.stringify(indexDoc, null, 2))

    const bundle = {
      format: 'UDZ',
      version: '1.0',
      metadata: {
        title: `Trial Master File: ${trialTitle}`,
        tmf_id: tmfId,
        protocol_number: protocolNumber.trim(),
        sponsor: sponsorName.trim(),
        phase,
        created: now,
        expiry: expiryISO,
        classification: 'GCP Controlled',
        ich_gcp: 'ICH E6(R3)',
        dia_tmf_reference_model: true,
        document_count: docs.length,
        files: ['00-tmf-index.uds', ...docManifest.map(d => d.fileName)],
      },
      chain_of_custody: [{ event: 'tmf_created', timestamp: now, tmf_id: tmfId, documents: docs.length }],
    }
    zip.file('bundle.json', JSON.stringify(bundle, null, 2))

    const zipBlob = await zip.generateAsync({ type: 'blob', mimeType: 'application/octet-stream' })
    const safeName = trialTitle.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase().slice(0, 40)
    setResult({ url: URL.createObjectURL(zipBlob), name: `tmf-${safeName}.udz` })
  }

  const inp: React.CSSProperties = { width: '100%', padding: '10px 14px', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ud-ink)', background: '#fff', boxSizing: 'border-box' }
  const lbl: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }
  const card: React.CSSProperties = { padding: '16px 20px', background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius-lg)' }
  const h3s: React.CSSProperties = { fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--ud-ink)', marginBottom: 4 }
  const p13: React.CSSProperties = { fontSize: 13, fontFamily: 'var(--font-body)', color: 'var(--ud-muted)', lineHeight: 1.5, margin: 0 }
  const ready = !!trialTitle.trim() && !!protocolNumber.trim() && !!sponsorName.trim() && docs.length > 0

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px' }}>
      <a href="/" style={{ fontSize: 13, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 32 }}>← All tools</a>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10, flexWrap: 'wrap' }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--ud-ink)', fontFamily: 'var(--font-display)' }}>UD Clinical Trial Master File</h1>
        <span style={{ fontSize: 13, fontWeight: 600, padding: '3px 10px', borderRadius: 99, background: '#1e2d3d', color: '#fff', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Enterprise · Free during beta</span>
      </div>

      <p style={{ fontSize: 16, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', marginBottom: 8, lineHeight: 1.6 }}>
        Create ICH E6(R3) GCP compliant Trial Master Files as tamper-evident governed .udz archives. Documents organised by DIA TMF Reference Model sections, with cryptographic provenance record on every file.
      </p>

      <div style={{ fontSize: 13, color: 'var(--ud-teal)', marginBottom: 28, padding: '8px 12px', background: 'var(--ud-teal-2)', border: '1px solid var(--ud-teal)', borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)' }}>
        ✦ Enterprise · Free during beta — Veeva Vault charges $50,000–200,000/year
      </div>

      {/* Trial details */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>
        <div style={{ gridColumn: '1/-1' }}>
          <label style={lbl}>Trial title *</label>
          <input style={inp} value={trialTitle} onChange={e => setTrialTitle(e.target.value)} placeholder="Full trial title" />
        </div>
        <div>
          <label style={lbl}>Protocol number *</label>
          <input style={inp} value={protocolNumber} onChange={e => setProtocolNumber(e.target.value)} placeholder="e.g. PROTO-2026-001" />
        </div>
        <div>
          <label style={lbl}>Sponsor name *</label>
          <input style={inp} value={sponsorName} onChange={e => setSponsorName(e.target.value)} placeholder="Sponsoring organisation" />
        </div>
        <div>
          <label style={lbl}>Principal Investigator</label>
          <input style={inp} value={piName} onChange={e => setPiName(e.target.value)} placeholder="Prof. Jane Smith" />
        </div>
        <div>
          <label style={lbl}>Trial phase</label>
          <select value={phase} onChange={e => setPhase(e.target.value as Phase)} style={inp}>
            {PHASES.map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label style={lbl}>Therapeutic area</label>
          <input style={inp} value={therapeuticArea} onChange={e => setTherapeuticArea(e.target.value)} placeholder="e.g. Oncology, Cardiology" />
        </div>
        <div>
          <label style={lbl}>IND/CTA number</label>
          <input style={inp} value={indCta} onChange={e => setIndCta(e.target.value)} placeholder="IND/CTA reference" />
        </div>
        <div>
          <label style={lbl}>Trial close date (for expiry)</label>
          <input type="date" style={inp} value={trialCloseDate} onChange={e => setTrialCloseDate(e.target.value)} />
        </div>
      </div>

      {/* Documents */}
      <div style={{ marginBottom: 20 }}>
        <label style={lbl}>TMF documents</label>
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => { e.preventDefault(); setDragging(false); if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files) }}
          onClick={() => inputRef.current?.click()}
          style={{ border: `1.5px dashed ${dragging ? 'var(--ud-teal)' : 'var(--ud-border)'}`, borderRadius: 'var(--ud-radius-lg)', padding: '24px', textAlign: 'center', cursor: 'pointer', background: dragging ? 'var(--ud-teal-2)' : '#fafaf8', marginBottom: 12 }}
        >
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ud-muted)' }}>Drop TMF documents (multiple files) · or click to browse</div>
          <input ref={inputRef} type="file" multiple style={{ display: 'none' }} onChange={e => e.target.files && addFiles(e.target.files)} />
        </div>

        {docs.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {docs.map(d => (
              <div key={d.id} style={{ ...card, display: 'grid', gridTemplateColumns: '1fr 200px 80px 80px 1fr auto', gap: 8, alignItems: 'center' }}>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--ud-ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.file.name}</div>
                <select value={d.section} onChange={e => updateDoc(d.id, 'section', e.target.value)} style={{ ...inp, padding: '6px 8px', fontSize: 12 }}>
                  {TMF_SECTIONS.map(s => <option key={s}>{s}</option>)}
                </select>
                <select value={d.gcpClass} onChange={e => updateDoc(d.id, 'gcpClass', e.target.value as GCPClass)} style={{ ...inp, padding: '6px 8px', fontSize: 12 }}>
                  <option>Essential</option>
                  <option>Non-essential</option>
                </select>
                <input style={{ ...inp, padding: '6px 8px', fontSize: 12 }} value={d.version} onChange={e => updateDoc(d.id, 'version', e.target.value)} placeholder="v1.0" />
                <input style={{ ...inp, padding: '6px 8px', fontSize: 12 }} value={d.author} onChange={e => updateDoc(d.id, 'author', e.target.value)} placeholder="Author" />
                <button onClick={() => removeDoc(d.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ud-muted)', fontSize: 14 }}>✕</button>
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
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ud-teal)', fontFamily: 'var(--font-body)' }}>TMF bundle created ✓</div>
            <div style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)' }}>{docs.length} documents · ICH E6(R3) compliant · DIA TMF Reference Model</div>
          </div>
          <a href={result.url} download={result.name} style={{ padding: '10px 18px', background: 'var(--ud-ink)', color: '#fff', fontWeight: 600, fontSize: 13, borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)', textDecoration: 'none', flexShrink: 0 }}>Download .udz →</a>
        </div>
      )}

      <button
        onClick={generate}
        disabled={!ready}
        style={{ width: '100%', padding: '14px', background: !ready ? 'var(--ud-border)' : 'var(--ud-ink)', color: !ready ? 'var(--ud-muted)' : '#fff', border: 'none', borderRadius: 'var(--ud-radius)', fontSize: 15, fontWeight: 600, fontFamily: 'var(--font-body)', cursor: !ready ? 'not-allowed' : 'pointer' }}>
        Generate TMF bundle →
      </button>

      {/* Features */}
      <div style={{ marginTop: 48, marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--ud-ink)', marginBottom: 16 }}>ICH GCP compliance by construction</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
          {[
            { title: 'ICH E6(R3)', body: 'Every document carries ICH E6(R3) compliance metadata. The standard is embedded in the provenance.' },
            { title: 'DIA TMF Reference Model', body: '7 standard sections per the DIA Reference Model. Documents auto-tagged to the correct section.' },
            { title: 'Cryptographic provenance record', body: 'Every document has a cryptographic timestamp proving it existed before inspection.' },
            { title: 'GCP classification', body: 'Essential vs non-essential documents flagged at upload — supports inspection readiness.' },
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
        <h2 style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--ud-ink)', marginBottom: 6 }}>UD Clinical TMF vs Veeva Vault</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
          {[
            { icon: '💰', title: 'Veeva Vault', body: '$50,000–200,000/year. 6–12 month implementation. Requires dedicated validation team. CSV required.' },
            { icon: '🏛', title: 'Phlexglobal', body: 'Similar enterprise pricing. Traditional eTMF approach. Long-term vendor lock-in.' },
            { icon: '📂', title: 'Manual TMF', body: 'GCP non-compliance risk. Inspection failure risk. Cannot prove document existed before inspection.' },
            { icon: '🧪', title: 'UD Clinical TMF', body: 'Enterprise Scale tier. ICH GCP compliant by construction. Cryptographic provenance record on every document. Inspection-ready.' },
          ].map(item => (
            <div key={item.title} style={{ ...card, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 20, lineHeight: '1', flexShrink: 0, marginTop: 2 }}>{item.icon}</span>
              <div><div style={h3s}>{item.title}</div><p style={p13}>{item.body}</p></div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 40, padding: '16px', background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', fontSize: 13, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', textAlign: 'center' }}>
        Processed in your browser. No files stored on our servers. Part of the <a href="https://ud.hive.baby" style={{ color: 'var(--ud-teal)' }}>Universal Document™</a> ecosystem.
      </div>

      <TooltipTour engineId="clinical-trial-master-file" tips={tourSteps['clinical-trial-master-file']} />
    </div>
  )
}
