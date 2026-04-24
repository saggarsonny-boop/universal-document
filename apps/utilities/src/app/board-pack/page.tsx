'use client'
import { useState, useRef, useCallback } from 'react'
import TooltipTour from '@/components/TooltipTour'
import { tourSteps } from '@/lib/tourSteps'

type Classification = 'Board Confidential' | 'Restricted'
type PaperEntry = { id: string; file: File; sectionNum: string; classification: Classification; author: string }

export default function BoardPackPage() {
  const [packTitle, setPackTitle] = useState('')
  const [meetingDate, setMeetingDate] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [papers, setPapers] = useState<PaperEntry[]>([])
  const [dragging, setDragging] = useState(false)
  const [result, setResult] = useState<{ url: string; name: string } | null>(null)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const addFiles = useCallback((files: FileList) => {
    const newPapers: PaperEntry[] = Array.from(files).map((f, i) => ({
      id: `paper-${Date.now()}-${i}`,
      file: f,
      sectionNum: String(papers.length + i + 1),
      classification: 'Board Confidential' as Classification,
      author: '',
    }))
    setPapers(prev => [...prev, ...newPapers])
    setResult(null)
  }, [papers.length])

  const updatePaper = (id: string, field: keyof PaperEntry, value: string) => {
    setPapers(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p))
  }

  const removePaper = (id: string) => {
    setPapers(prev => prev.filter(p => p.id !== id))
  }

  const generate = async () => {
    setError('')
    setResult(null)

    if (!packTitle.trim()) { setError('Board pack title is required.'); return }
    if (!meetingDate) { setError('Meeting date is required.'); return }
    if (!companyName.trim()) { setError('Company name is required.'); return }
    if (papers.length === 0) { setError('Upload at least one board paper.'); return }

    const now = new Date().toISOString()
    const expiryDate = new Date(meetingDate)
    expiryDate.setDate(expiryDate.getDate() + 7)
    const expiryISO = expiryDate.toISOString()
    const version = `v1.0-${now.split('T')[0]}`

    const { default: JSZip } = await import('jszip')
    const zip = new JSZip()

    const paperDocs = await Promise.all(papers.map(async (p) => {
      const text = await p.file.text().catch(() => `Document: ${p.file.name}`)
      const title = p.file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ')
      const doc = {
        format: 'UDS',
        version: '1.0',
        status: 'sealed',
        metadata: {
          title,
          created: now,
          document_type: 'board_paper',
          classification: p.classification,
          section_number: p.sectionNum,
          author: p.author || undefined,
          expiry: expiryISO,
          board_meeting: meetingDate,
          company: companyName.trim(),
          language: 'en',
        },
        content: {
          blocks: text.slice(0, 3000).split('\n\n').filter(Boolean).slice(0, 20).map((para, i) => ({
            id: `b${i + 1}`,
            type: i === 0 ? 'heading' : 'paragraph',
            text: para.trim().slice(0, 400),
          })),
        },
        provenance: { created: now, source: `file:${p.file.name}`, expiry: expiryISO },
      }
      const fileName = `section-${p.sectionNum}-${title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase().slice(0, 40)}.uds`
      zip.file(fileName, JSON.stringify(doc, null, 2))
      return { title, fileName, section: p.sectionNum, classification: p.classification, author: p.author }
    }))

    const coverSheet = {
      format: 'UDS',
      version: '1.0',
      status: 'sealed',
      metadata: {
        title: `Cover Sheet: ${packTitle}`,
        created: now,
        document_type: 'board_pack_cover',
        classification: 'Board Confidential',
        expiry: expiryISO,
      },
      content: {
        blocks: [
          { id: 'h1', type: 'heading', text: packTitle },
          { id: 'b1', type: 'paragraph', text: `Company: ${companyName}` },
          { id: 'b2', type: 'paragraph', text: `Meeting date: ${meetingDate}` },
          { id: 'b3', type: 'paragraph', text: `Version: ${version}` },
          { id: 'b4', type: 'paragraph', text: `Expiry: ${expiryDate.toISOString().split('T')[0]} (7 days after meeting)` },
          { id: 'b5', type: 'heading', text: 'Document Index' },
          ...paperDocs.map((p, i) => ({
            id: `idx-${i}`,
            type: 'paragraph',
            text: `Section ${p.section}: ${p.title}${p.author ? ` (${p.author})` : ''} — ${p.classification}`,
          })),
        ],
      },
      provenance: { created: now, source: 'board_pack_generator', version },
    }
    zip.file('00-cover-sheet.uds', JSON.stringify(coverSheet, null, 2))

    const bundle = {
      format: 'UDZ',
      version: '1.0',
      metadata: {
        title: packTitle,
        company: companyName.trim(),
        meeting_date: meetingDate,
        expiry: expiryISO,
        classification: 'Board Confidential',
        version,
        document_count: papers.length + 1,
        files: ['00-cover-sheet.uds', ...paperDocs.map(p => p.fileName)],
      },
      chain_of_custody: [
        { event: 'board_pack_created', timestamp: now, papers: papers.length, version },
      ],
    }
    zip.file('bundle.json', JSON.stringify(bundle, null, 2))

    const zipBlob = await zip.generateAsync({ type: 'blob', mimeType: 'application/octet-stream' })
    const safeName = packTitle.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase().slice(0, 48)
    setResult({ url: URL.createObjectURL(zipBlob), name: `board-pack-${safeName}.udz` })
  }

  const inp: React.CSSProperties = { width: '100%', padding: '10px 14px', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ud-ink)', background: '#fff', boxSizing: 'border-box' }
  const lbl: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }
  const card: React.CSSProperties = { padding: '16px 20px', background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius-lg)' }
  const h3s: React.CSSProperties = { fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--ud-ink)', marginBottom: 4 }
  const p13: React.CSSProperties = { fontSize: 13, fontFamily: 'var(--font-body)', color: 'var(--ud-muted)', lineHeight: 1.5, margin: 0 }
  const ready = !!packTitle.trim() && !!meetingDate && !!companyName.trim() && papers.length > 0

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '48px 24px' }}>
      <a href="/" style={{ fontSize: 13, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 32 }}>← All tools</a>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10, flexWrap: 'wrap' }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--ud-ink)', fontFamily: 'var(--font-display)' }}>UD Board Pack</h1>
        <span style={{ fontSize: 13, fontWeight: 600, padding: '3px 10px', borderRadius: 99, background: '#1e2d3d', color: '#fff', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Enterprise · Free during beta</span>
      </div>

      <p style={{ fontSize: 16, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', marginBottom: 8, lineHeight: 1.6 }}>
        Create a governed board meeting document package as a .udz bundle. All board papers with version control, Board Confidential classification, auto-expiry 7 days after the meeting, and chain of custody.
      </p>

      <div style={{ fontSize: 13, color: 'var(--ud-teal)', marginBottom: 28, padding: '8px 12px', background: 'var(--ud-teal-2)', border: '1px solid var(--ud-teal)', borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)' }}>
        ✦ Enterprise · Free during beta — Diligent charges $15,000–50,000/year
      </div>

      {/* Pack details */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>
        <div style={{ gridColumn: '1/-1' }}>
          <label style={lbl}>Board pack title *</label>
          <input style={inp} value={packTitle} onChange={e => setPackTitle(e.target.value)} placeholder="e.g. Q2 2026 Board Meeting Papers" />
        </div>
        <div>
          <label style={lbl}>Meeting date *</label>
          <input type="date" style={inp} value={meetingDate} onChange={e => setMeetingDate(e.target.value)} />
        </div>
        <div>
          <label style={lbl}>Company name *</label>
          <input style={inp} value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Acme Corp Ltd" />
        </div>
      </div>

      {/* Document uploads */}
      <div style={{ marginBottom: 20 }}>
        <label style={lbl}>Board papers</label>
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => { e.preventDefault(); setDragging(false); if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files) }}
          onClick={() => inputRef.current?.click()}
          style={{ border: `1.5px dashed ${dragging ? 'var(--ud-teal)' : 'var(--ud-border)'}`, borderRadius: 'var(--ud-radius-lg)', padding: '24px', textAlign: 'center', cursor: 'pointer', background: dragging ? 'var(--ud-teal-2)' : '#fafaf8', marginBottom: 12, transition: 'all 0.15s' }}
        >
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ud-muted)' }}>Drop board papers here (multiple files) · or click to browse</div>
          <input ref={inputRef} type="file" multiple style={{ display: 'none' }} onChange={e => e.target.files && addFiles(e.target.files)} />
        </div>

        {papers.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {papers.map((p) => (
              <div key={p.id} style={{ ...card, display: 'grid', gridTemplateColumns: '60px 1fr 180px 1fr auto', gap: 10, alignItems: 'center' }}>
                <div>
                  <label style={{ ...lbl, marginBottom: 3 }}>§</label>
                  <input style={{ ...inp, padding: '6px 10px' }} value={p.sectionNum} onChange={e => updatePaper(p.id, 'sectionNum', e.target.value)} placeholder="1" />
                </div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ud-ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.file.name}</div>
                <select value={p.classification} onChange={e => updatePaper(p.id, 'classification', e.target.value as Classification)} style={{ ...inp, padding: '6px 10px' }}>
                  <option>Board Confidential</option>
                  <option>Restricted</option>
                </select>
                <input style={{ ...inp, padding: '6px 10px' }} value={p.author} onChange={e => updatePaper(p.id, 'author', e.target.value)} placeholder="Author (optional)" />
                <button onClick={() => removePaper(p.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ud-muted)', fontSize: 16, padding: '4px 6px' }}>✕</button>
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
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ud-teal)', fontFamily: 'var(--font-body)' }}>Board pack created ✓</div>
            <div style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)' }}>{papers.length + 1} documents · expires {meetingDate ? new Date(new Date(meetingDate).setDate(new Date(meetingDate).getDate() + 7)).toISOString().split('T')[0] : ''}</div>
          </div>
          <a href={result.url} download={result.name} style={{ padding: '10px 18px', background: 'var(--ud-ink)', color: '#fff', fontWeight: 600, fontSize: 13, borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)', textDecoration: 'none', flexShrink: 0 }}>Download .udz →</a>
        </div>
      )}

      <button
        onClick={generate}
        disabled={!ready}
        style={{ width: '100%', padding: '14px', background: !ready ? 'var(--ud-border)' : 'var(--ud-ink)', color: !ready ? 'var(--ud-muted)' : '#fff', border: 'none', borderRadius: 'var(--ud-radius)', fontSize: 15, fontWeight: 600, fontFamily: 'var(--font-body)', cursor: !ready ? 'not-allowed' : 'pointer' }}>
        Generate board pack →
      </button>

      {/* Comparison */}
      <div style={{ marginTop: 48, paddingTop: 40, borderTop: '1px solid var(--ud-border)' }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--ud-ink)', marginBottom: 6 }}>UD Board Pack vs Diligent</h2>
        <p style={{ fontSize: 14, fontFamily: 'var(--font-body)', color: 'var(--ud-muted)', marginBottom: 20, lineHeight: 1.6 }}>
          Board portals are one of the most expensive tools in governance. The core requirement — governed, expiring, version-controlled board packs — is a document problem, not a portal problem.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
          {[
            { icon: '💰', title: 'Diligent', body: '$15,000–50,000/year. Complex implementation. Requires IT involvement. Most features unused by most boards.' },
            { icon: '📊', title: 'BoardEffect', body: '$10,000+/year. PDF-based. No tamper evidence. Documents expire in the portal, not in the file.' },
            { icon: '📁', title: 'Manual PDF packs', body: 'No version control. No auto-expiry. No chain of custody. Documents circulate freely after the meeting.' },
            { icon: '🏛', title: 'UD Board Pack', body: 'Enterprise tier. Governed .udz archive. Auto-expiry 7 days after meeting. Board Confidential classification embedded in every file.' },
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

      <TooltipTour engineId="board-pack" tips={tourSteps['board-pack']} />
    </div>
  )
}
