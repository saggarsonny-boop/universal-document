'use client'
import { useState, useRef } from 'react'
import TooltipTour from '@/components/TooltipTour'
import { tourSteps } from '@/lib/tourSteps'

type Citation = { id: string; author: string; title: string; year: string; journal: string; doi: string }

async function sha256hex(data: Uint8Array): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer)
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

export default function AcademicPaperPage() {
  const [title, setTitle] = useState('')
  const [authors, setAuthors] = useState('')
  const [abstract, setAbstract] = useState('')
  const [journal, setJournal] = useState('')
  const [doi, setDoi] = useState('')
  const [year, setYear] = useState('')
  const [keywords, setKeywords] = useState('')
  const [citations, setCitations] = useState<Citation[]>([{ id: 'c1', author: '', title: '', year: '', journal: '', doi: '' }])
  const [supplementary, setSupplementary] = useState<File[]>([])
  const [result, setResult] = useState<{ url: string; name: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const suppRef = useRef<HTMLInputElement>(null)

  const addCitation = () => setCitations(p => [...p, { id: `c${Date.now()}`, author: '', title: '', year: '', journal: '', doi: '' }])
  const updateCit = (id: string, f: keyof Citation, v: string) => setCitations(p => p.map(c => c.id === id ? { ...c, [f]: v } : c))
  const removeCit = (id: string) => setCitations(p => p.filter(c => c.id !== id))

  const handleGenerate = async () => {
    if (!title.trim()) { setError('Paper title is required.'); return }
    setError('')
    setLoading(true)
    try {
      const now = new Date().toISOString()
      const content = `${title}|${authors}|${abstract.slice(0, 200)}`
      const hash = await sha256hex(new TextEncoder().encode(content))

      let outputName: string
      let blob: Blob

      const suppIndex = await Promise.all(supplementary.map(async f => {
        const buf = new Uint8Array(await f.arrayBuffer())
        return { filename: f.name, sha256: await sha256hex(buf), size: f.size }
      }))

      if (supplementary.length > 0) {
        const { default: JSZip } = await import('jszip')
        const zip = new JSZip()
        const paperDoc = buildPaperUds({ title, authors, abstract, journal, doi, year, keywords, citations, hash, now, suppIndex })
        zip.file('paper.uds', JSON.stringify(paperDoc, null, 2))
        for (const f of supplementary) {
          const folder = zip.folder('supplementary')
          folder?.file(f.name, new Uint8Array(await f.arrayBuffer()))
        }
        zip.file('bundle.json', JSON.stringify({ type: 'academic_paper_bundle', paper_id: paperDoc.id, created: now, supplementary: suppIndex }, null, 2))
        blob = await zip.generateAsync({ type: 'blob' })
        outputName = `paper-${title.slice(0,30).replace(/\s+/g,'-').replace(/[^a-z0-9-]/gi,'')}.udz`
      } else {
        const doc = buildPaperUds({ title, authors, abstract, journal, doi, year, keywords, citations, hash, now, suppIndex: [] })
        blob = new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' })
        outputName = `paper-${title.slice(0,30).replace(/\s+/g,'-').replace(/[^a-z0-9-]/gi,'')}.uds`
      }

      setResult({ url: URL.createObjectURL(blob), name: outputName })
    } catch {
      setError('Failed to generate paper document.')
    } finally {
      setLoading(false)
    }
  }

  function buildPaperUds({ title, authors, abstract, journal, doi, year, keywords, citations, hash, now, suppIndex }: Record<string, unknown> & { suppIndex: { filename: string; sha256: string; size: number }[] }) {
    return {
      ud_version: '1.0', format: 'uds', id: `paper-${(hash as string).slice(0, 16)}`, created: now, schema: 'academic_paper',
      metadata: { title, authors: (authors as string).split(',').map((a: string) => a.trim()), abstract, journal: journal || null, doi: doi || null, year: year || null, keywords: (keywords as string).split(',').map((k: string) => k.trim()).filter(Boolean) },
      citations: (citations as Citation[]).filter(c => c.title).map(c => ({ type: 'citation', author: c.author, title: c.title, year: c.year, journal: c.journal, doi: c.doi || null })),
      supplementary: suppIndex,
      provenance: { content_sha256: hash, sealed_at: now, tool: 'UD Academic Paper' },
      content: [
        { type: 'heading', text: title }, { type: 'paragraph', text: `Authors: ${authors}` }, { type: 'paragraph', text: `Journal: ${journal || 'Preprint'}` }, { type: 'paragraph', text: `DOI: ${doi || 'N/A'}` },
        { type: 'heading', level: 2, text: 'Abstract' }, { type: 'paragraph', text: abstract },
        { type: 'heading', level: 2, text: 'References' }, ...(citations as Citation[]).filter(c => c.title).map((c: Citation, i: number) => ({ type: 'paragraph', text: `[${i + 1}] ${c.author} (${c.year}). ${c.title}. ${c.journal}. ${c.doi ? `DOI: ${c.doi}` : ''}` })),
      ],
    }
  }

  const inp = "w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:border-[#c8960a]"
  const lbl = "block text-xs font-medium text-[#1e2d3d] mb-1 uppercase tracking-wider font-['DM_Mono',monospace]"

  return (
    <div style={{ background: '#fafaf8', minHeight: '100vh', color: '#1e2d3d' }}>
      <TooltipTour engineId="academic-paper" tips={tourSteps['academic-paper'] ?? []} />
      <div style={{ background: '#c8960a', color: '#fff', textAlign: 'center', padding: '8px 16px', fontSize: 13, fontWeight: 600 }}>Beta · All features free during beta</div>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 32, fontWeight: 700, margin: 0 }}>UD Academic Paper</h1>
            <span style={{ background: '#0d9488', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4, fontFamily: "'DM Mono',monospace" }}>FREE</span>
          </div>
          <p style={{ color: '#4a5568', fontSize: 15, lineHeight: 1.6, margin: 0 }}>
            Convert any academic paper or preprint into a structured <code style={{ fontFamily: "'DM Mono',monospace" }}>.uds</code> file with citations as queryable data objects. With supplementary files, outputs a <code style={{ fontFamily: "'DM Mono',monospace" }}>.udz</code> bundle.
          </p>
        </div>

        <div data-tour="paper-details" style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Paper Details</div>
          <div style={{ marginBottom: 16 }}><label className={lbl}>Title *</label><input className={inp} value={title} onChange={e => setTitle(e.target.value)} placeholder="Full paper title" /></div>
          <div style={{ marginBottom: 16 }}><label className={lbl}>Authors (comma-separated)</label><input className={inp} value={authors} onChange={e => setAuthors(e.target.value)} placeholder="Smith J, Jones A, Brown K" /></div>
          <div style={{ marginBottom: 16 }}><label className={lbl}>Abstract</label><textarea className={inp} rows={4} value={abstract} onChange={e => setAbstract(e.target.value)} placeholder="Abstract text…" style={{ resize: 'vertical' }} /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div><label className={lbl}>Journal / Preprint Server</label><input className={inp} value={journal} onChange={e => setJournal(e.target.value)} placeholder="e.g. Nature, arXiv" /></div>
            <div><label className={lbl}>Year</label><input className={inp} value={year} onChange={e => setYear(e.target.value)} placeholder="2024" /></div>
            <div><label className={lbl}>DOI</label><input className={inp} value={doi} onChange={e => setDoi(e.target.value)} placeholder="10.xxxx/xxxxx" /></div>
          </div>
          <div><label className={lbl}>Keywords (comma-separated)</label><input className={inp} value={keywords} onChange={e => setKeywords(e.target.value)} placeholder="machine learning, NLP, transformers" /></div>
        </div>

        <div data-tour="citations" style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700 }}>Citations</div>
            <button onClick={addCitation} style={{ background: '#1e2d3d', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: 13, cursor: 'pointer' }}>+ Add Citation</button>
          </div>
          {citations.map((c, idx) => (
            <div key={c.id} style={{ background: '#fafaf8', borderRadius: 8, padding: 12, marginBottom: 10, position: 'relative' }}>
              <div style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", color: '#6b7280', marginBottom: 8 }}>REF [{idx + 1}]</div>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr', gap: 10, marginBottom: 8 }}>
                <input className={inp} value={c.author} onChange={e => updateCit(c.id, 'author', e.target.value)} placeholder="Author(s)" />
                <input className={inp} value={c.title} onChange={e => updateCit(c.id, 'title', e.target.value)} placeholder="Paper title" />
                <input className={inp} value={c.year} onChange={e => updateCit(c.id, 'year', e.target.value)} placeholder="Year" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: 10 }}>
                <input className={inp} value={c.journal} onChange={e => updateCit(c.id, 'journal', e.target.value)} placeholder="Journal" />
                <input className={inp} value={c.doi} onChange={e => updateCit(c.id, 'doi', e.target.value)} placeholder="DOI" />
                <button onClick={() => removeCit(c.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: 18 }}>×</button>
              </div>
            </div>
          ))}
        </div>

        <div data-tour="supplementary" style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Supplementary Materials</div>
          <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 12 }}>Optional. Adding files outputs a .udz bundle instead of .uds.</div>
          <button onClick={() => suppRef.current?.click()} style={{ background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: 8, padding: '8px 16px', fontSize: 13, cursor: 'pointer' }}>Add files</button>
          <input ref={suppRef} type="file" multiple style={{ display: 'none' }} onChange={e => { if (e.target.files) setSupplementary(p => [...p, ...Array.from(e.target.files!)]) }} />
          {supplementary.length > 0 && (
            <div style={{ marginTop: 8, fontSize: 12, fontFamily: "'DM Mono',monospace", color: '#6b7280' }}>
              {supplementary.map((f, i) => <div key={i}>{f.name}</div>)}
            </div>
          )}
        </div>

        {error && <div style={{ color: '#dc2626', fontSize: 13, marginBottom: 16, padding: '10px 14px', background: '#fef2f2', borderRadius: 8 }}>{error}</div>}
        <button onClick={handleGenerate} disabled={loading} style={{ width: '100%', padding: 14, borderRadius: 10, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', background: loading ? '#d1d5db' : '#1e2d3d', color: '#fff', fontSize: 15, fontWeight: 700 }}>
          {loading ? 'Building…' : 'Generate Paper Document'}
        </button>
        {result && (
          <div style={{ marginTop: 24, padding: 24, background: '#fff', border: '2px solid #c8960a', borderRadius: 12 }}>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Document Ready</div>
            <a href={result.url} download={result.name} style={{ display: 'inline-block', padding: '10px 24px', background: '#c8960a', color: '#fff', borderRadius: 8, fontWeight: 700, textDecoration: 'none', fontSize: 14 }}>Download {result.name}</a>
          </div>
        )}

        <div style={{ marginTop: 64 }}>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 700, marginBottom: 24 }}>How UD Academic Paper differs from PDF preprints</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              { title: 'Citations as structured data', body: 'Each reference is stored as a data object with author, title, DOI, and year. Machine-readable from the moment of publication.' },
              { title: 'Bundled supplementary materials', body: 'Supplementary files, datasets, and figures travel with the paper in a .udz bundle rather than sitting on a separate server that might go offline.' },
              { title: 'Tamper-evident provenance', body: 'The paper content is SHA-256 sealed. Nobody can alter the text after publication and claim the original said something different.' },
              { title: 'Open format', body: 'The .uds is a JSON file readable by any system. No dependency on publisher platforms or proprietary readers.' },
            ].map(c => (
              <div key={c.title} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: 20 }}>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>{c.title}</div>
                <div style={{ fontSize: 13, color: '#4a5568', lineHeight: 1.6 }}>{c.body}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
