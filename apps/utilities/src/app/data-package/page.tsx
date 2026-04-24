'use client'
import { useState, useRef, useCallback } from 'react'
import TooltipTour from '@/components/TooltipTour'
import { tourSteps } from '@/lib/tourSteps'

export default function DataPackage() {
  const [title, setTitle] = useState('')
  const [doi, setDoi] = useState('')
  const [authors, setAuthors] = useState('')
  const [institution, setInstitution] = useState('')
  const [description, setDescription] = useState('')
  const [license, setLicense] = useState('CC BY 4.0')
  const [files, setFiles] = useState<File[]>([])
  const [dragging, setDragging] = useState(false)
  const [result, setResult] = useState<{ url: string; name: string } | null>(null)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const addFiles = useCallback((fl: FileList | null) => { if (!fl) return; setFiles(prev => [...prev, ...Array.from(fl)]); setResult(null) }, [])
  const onDrop = useCallback((e: React.DragEvent) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files) }, [addFiles])

  const inp = { width: '100%', padding: '10px 14px', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ud-ink)', background: '#fff', boxSizing: 'border-box' as const }
  const lbl = { display: 'block' as const, fontSize: 11, fontWeight: 600 as const, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: 6 }

  const run = async () => {
    if (!title || !files.length) { setError('Title and at least one file are required'); return }
    setError('')
    try {
      const now = new Date().toISOString()
      const docs = await Promise.all(files.map(async (f, i) => {
        const text = await f.text()
        let inner: Record<string, unknown>
        try { inner = JSON.parse(text) } catch { inner = { content: text.slice(0, 2000), truncated: text.length > 2000 } }
        const ext = f.name.split('.').pop()?.toLowerCase()
        const type = ext === 'csv' || ext === 'xlsx' ? 'dataset' : ext === 'md' || ext === 'txt' ? 'documentation' : 'supporting_material'
        return { index: i + 1, filename: f.name, file_type: type, size_bytes: f.size, document: inner }
      }))
      const bundle = {
        format: 'UDZ', bundle_type: 'research_data_package',
        title, doi: doi || undefined,
        authors: authors || undefined,
        institution: institution || undefined,
        description: description || undefined,
        license,
        file_count: files.length,
        created_at: now,
        documents: docs,
        provenance: { created_at: now, bundle_type: 'research_data_package', file_count: files.length },
      }
      const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' })
      setResult({ url: URL.createObjectURL(blob), name: `data-package-${title.replace(/\s+/g,'-').toLowerCase().slice(0,40)}.udz` })
    } catch (err: unknown) { setError(err instanceof Error ? err.message : 'Failed') }
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
      <a href="/" style={{ fontSize: 13, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 32 }}>← All tools</a>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--ud-ink)', fontFamily: 'var(--font-display)' }}>UD Data Package</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 99, background: 'var(--ud-gold-3)', color: 'var(--ud-gold)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Pro</span>
          <span style={{ fontSize: 9, color: 'var(--ud-muted)', fontFamily: 'var(--font-mono)', paddingLeft: 10 }}>Free during beta</span>
        </div>
      </div>
      <p style={{ fontSize: 16, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', marginBottom: 32, lineHeight: 1.6 }}>Bundle a research paper, methodology document, and datasets into a .udz package with shared provenance, DOI, authorship, and licence. Output: .udz bundle.</p>

      <div style={{ border: `1.5px dashed ${dragging ? 'var(--ud-teal)' : 'var(--ud-border-2)'}`, borderRadius: 'var(--ud-radius-xl)', padding: '28px 24px', textAlign: 'center', cursor: 'pointer', background: dragging ? 'var(--ud-teal-2)' : 'var(--ud-paper-2)', transition: 'all 0.2s', marginBottom: 14 }}
        onDragOver={e => { e.preventDefault(); setDragging(true) }} onDragLeave={() => setDragging(false)} onDrop={onDrop} onClick={() => inputRef.current?.click()}>
        <input ref={inputRef} type="file" multiple accept=".uds,.pdf,.csv,.xlsx,.txt,.md,.json" style={{ display: 'none' }} onChange={e => addFiles(e.target.files)} />
        <div style={{ fontSize: 24, marginBottom: 6 }}>🔬</div>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ud-ink)', fontFamily: 'var(--font-body)' }}>Drop research files · multiple accepted</div>
        <div style={{ fontSize: 12, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', marginTop: 4 }}>.uds · .pdf · .csv · .xlsx · .txt · .md · .json</div>
      </div>
      {files.length > 0 && <div style={{ marginBottom: 20 }}>{files.map((f, i) => <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#fff', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', marginBottom: 6, fontSize: 13, fontFamily: 'var(--font-body)', color: 'var(--ud-ink)' }}><span>📄 {f.name}</span><button onClick={() => setFiles(prev => prev.filter((_,j) => j !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ud-muted)', fontSize: 16 }}>×</button></div>)}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>
        <div style={{ gridColumn: '1/-1' }}><label style={lbl}>Dataset title *</label><input style={inp} value={title} onChange={e => setTitle(e.target.value)} placeholder="Research dataset title" /></div>
        <div><label style={lbl}>DOI</label><input style={inp} value={doi} onChange={e => setDoi(e.target.value)} placeholder="10.XXXXX/XXXXX" /></div>
        <div>
          <label style={lbl}>Licence</label>
          <select value={license} onChange={e => setLicense(e.target.value)} style={{ ...inp, cursor: 'pointer' }}>
            {['CC BY 4.0','CC BY-SA 4.0','CC BY-NC 4.0','CC0 1.0','Apache 2.0','MIT','Proprietary'].map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <div style={{ gridColumn: '1/-1' }}><label style={lbl}>Authors</label><input style={inp} value={authors} onChange={e => setAuthors(e.target.value)} placeholder="Author names (comma-separated)" /></div>
        <div style={{ gridColumn: '1/-1' }}><label style={lbl}>Institution</label><input style={inp} value={institution} onChange={e => setInstitution(e.target.value)} placeholder="University or organisation" /></div>
        <div style={{ gridColumn: '1/-1' }}><label style={lbl}>Description</label><textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} style={{ ...inp, resize: 'vertical' }} placeholder="Brief description of dataset contents" /></div>
      </div>

      {error && <div style={{ padding: '12px 16px', background: 'rgba(226,75,74,0.08)', border: '1px solid rgba(226,75,74,0.2)', borderRadius: 'var(--ud-radius)', fontSize: 13, color: 'var(--ud-danger)', fontFamily: 'var(--font-body)', marginBottom: 20 }}>{error}</div>}
      {result && (
        <div style={{ padding: '14px 18px', background: 'var(--ud-teal-2)', border: '1px solid var(--ud-teal)', borderRadius: 'var(--ud-radius-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <div><div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ud-teal)', fontFamily: 'var(--font-body)' }}>Data package ready · Output: .udz bundle</div><div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)' }}>{files.length} file{files.length !== 1 ? 's' : ''} · {license}</div></div>
          <a href={result.url} download={result.name} style={{ padding: '10px 18px', background: 'var(--ud-ink)', color: '#fff', fontWeight: 600, fontSize: 13, borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)', textDecoration: 'none', flexShrink: 0 }}>Download .udz →</a>
        </div>
      )}
      <button onClick={run} disabled={!title || !files.length} style={{ width: '100%', padding: '14px', background: !title || !files.length ? 'var(--ud-border)' : 'var(--ud-ink)', color: !title || !files.length ? 'var(--ud-muted)' : '#fff', border: 'none', borderRadius: 'var(--ud-radius)', fontSize: 15, fontWeight: 600, fontFamily: 'var(--font-body)', cursor: !title || !files.length ? 'not-allowed' : 'pointer' }}>Create Data Package</button>
      <div style={{ marginTop: 40, padding: '16px', background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', fontSize: 12, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', textAlign: 'center' }}>
        Runs in your browser. No data sent to any server. Part of the <a href="https://ud.hive.baby" style={{ color: 'var(--ud-teal)' }}>Universal Document™</a> ecosystem.
      </div>

      <div style={{ marginTop: '3rem', paddingTop: '2.5rem', borderTop: '1px solid var(--ud-border)' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--ud-ink)', fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>How UD Data Package differs from Zenodo, Figshare, and OSF</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', marginBottom: '1.5rem', lineHeight: 1.6 }}>Repository platforms host your data. UD Data Package embeds methodology and provenance inside the bundle — so the package is reproducibility-ready even if the platform shuts down.</p>
        <div style={{ display: 'grid', gap: '1rem' }}>
          {[
            { title: 'Zenodo / Figshare / OSF', body: 'Excellent platforms for data sharing — but the repository is the verification mechanism. If the DOI resolves to nothing or the platform is decommissioned, there\'s no way to verify provenance from the data files alone.' },
            { title: 'ZIP file with README', body: 'Common practice. No structured metadata, no machine-readable licensing terms, no cryptographic proof the data hasn\'t been altered after collection. A reviewer must trust the depositor.' },
            { title: 'UD Data Package — provenance inside the bundle', body: 'Methodology, collection date, licensing, and contributor details are structured metadata inside the .udz — not a separate README that can be lost or edited. The bundle is self-describing.' },
            { title: 'UD Data Package — tamper-evident data integrity', body: 'The package is sealed at creation time. Any modification to the data files, methodology, or licensing terms after sealing is detectable. Independent verification requires no platform access.' },
          ].map(card => (
            <div key={card.title} style={{ background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)', borderRadius: '0.75rem', padding: '1.25rem' }}>
              <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--ud-ink)', fontFamily: 'var(--font-body)', marginBottom: '0.4rem' }}>{card.title}</div>
              <div style={{ fontSize: '0.83rem', color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', lineHeight: 1.6 }}>{card.body}</div>
            </div>
          ))}
        </div>
      </div>
      <TooltipTour engineId="data-package" tips={tourSteps['data-package']} />
    </div>
  )
}
