'use client'
import { useState, useRef, useCallback } from 'react'

export default function LegalBundle() {
  const [files, setFiles] = useState<File[]>([])
  const [dragging, setDragging] = useState(false)
  const [caseName, setCaseName] = useState('')
  const [jurisdiction, setJurisdiction] = useState('')
  const [batesPrefix, setBatesPrefix] = useState('BATES-')
  const [batesStart, setBatesStart] = useState('1')
  const [result, setResult] = useState<{ url: string; name: string } | null>(null)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const addFiles = useCallback((incoming: FileList | null) => {
    if (!incoming) return
    setFiles(prev => [...prev, ...Array.from(incoming)])
    setResult(null); setError('')
  }, [])
  const onDrop = useCallback((e: React.DragEvent) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files) }, [addFiles])

  const run = async () => {
    if (!files.length || !caseName) return
    setError(''); setResult(null)
    try {
      const start = parseInt(batesStart, 10) || 1
      const docs: Record<string, unknown>[] = []
      for (let i = 0; i < files.length; i++) {
        const text = await files[i].text()
        let inner: Record<string, unknown>
        try { inner = JSON.parse(text) } catch { inner = { format: 'UDS', title: files[i].name, content: text } }
        const batesNum = `${batesPrefix}${String(start + i).padStart(5, '0')}`
        docs.push({ index: i + 1, bates_number: batesNum, filename: files[i].name, document: { ...inner, bates_number: batesNum } })
      }
      const now = new Date().toISOString()
      const bundle: Record<string, unknown> = {
        format: 'UDZ',
        bundle_type: 'legal',
        case_name: caseName,
        jurisdiction: jurisdiction || undefined,
        bates_prefix: batesPrefix,
        bates_range: `${batesPrefix}${String(start).padStart(5, '0')} – ${batesPrefix}${String(start + files.length - 1).padStart(5, '0')}`,
        document_count: files.length,
        documents: docs,
        cover_sheet: { case_name: caseName, jurisdiction, document_count: files.length, bates_range: `${batesPrefix}${String(start).padStart(5,'0')} – ${batesPrefix}${String(start + files.length - 1).padStart(5,'0')}`, prepared_at: now },
        privilege_log_template: docs.map(d => ({ bates_number: d.bates_number, filename: d.filename, privilege_claimed: '', basis: '', date: '', author: '', recipient: '' })),
        provenance: { created_at: now, bundle_type: 'legal' },
      }
      const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' })
      const fname = `${caseName.replace(/\s+/g, '-').toLowerCase()}-legal-bundle.udz`
      setResult({ url: URL.createObjectURL(blob), name: fname })
    } catch (err: unknown) { setError(err instanceof Error ? err.message : 'Failed') }
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
      <a href="/" style={{ fontSize: 13, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 32 }}>← All tools</a>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--ud-ink)', fontFamily: 'var(--font-display)' }}>UD Legal Bundle</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 99, background: 'var(--ud-gold-3)', color: 'var(--ud-gold)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Pro</span>
          <span style={{ fontSize: 9, color: 'var(--ud-muted)', fontFamily: 'var(--font-mono)', paddingLeft: 10 }}>Free during beta</span>
        </div>
      </div>
      <p style={{ fontSize: 16, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', marginBottom: 32, lineHeight: 1.6 }}>
        Package multiple documents into a court-ready .udz bundle with sequential Bates numbering, auto-generated cover sheet, privilege log template, and chain of custody.
      </p>
      <div style={{ border: `1.5px dashed ${dragging ? 'var(--ud-teal)' : 'var(--ud-border-2)'}`, borderRadius: 'var(--ud-radius-xl)', padding: '36px 24px', textAlign: 'center', cursor: 'pointer', background: dragging ? 'var(--ud-teal-2)' : 'var(--ud-paper-2)', transition: 'all 0.2s', marginBottom: 16 }}
        onDragOver={e => { e.preventDefault(); setDragging(true) }} onDragLeave={() => setDragging(false)} onDrop={onDrop} onClick={() => inputRef.current?.click()}>
        <input ref={inputRef} type="file" accept=".uds,.udr,.pdf,.txt" multiple style={{ display: 'none' }} onChange={e => addFiles(e.target.files)} />
        <div style={{ fontSize: 28, marginBottom: 8 }}>⚖️</div>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ud-ink)', fontFamily: 'var(--font-body)' }}>Drop documents here · click to browse</div>
        <div style={{ fontSize: 12, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', marginTop: 4 }}>Multiple files accepted · .uds .pdf .txt</div>
      </div>
      {files.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          {files.map((f, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#fff', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', marginBottom: 6, fontSize: 13, fontFamily: 'var(--font-body)', color: 'var(--ud-ink)' }}>
              <span>📄 {f.name}</span>
              <button onClick={() => setFiles(prev => prev.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ud-muted)', fontSize: 16, lineHeight: 1 }}>×</button>
            </div>
          ))}
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>
        {[['Case name *', caseName, setCaseName, 'e.g. Smith v Jones [2026]', '1/-1'],
          ['Jurisdiction', jurisdiction, setJurisdiction, 'e.g. England and Wales', ''],
          ['Bates prefix', batesPrefix, setBatesPrefix, 'e.g. BATES-', ''],
          ['Start number', batesStart, setBatesStart, '1', '']
        ].map(([label, val, setter, ph, col]) => (
          <div key={label as string} style={{ gridColumn: col as string || 'auto' }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>{label as string}</label>
            <input value={val as string} onChange={e => (setter as (v: string) => void)(e.target.value)} placeholder={ph as string} style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ud-ink)', background: '#fff', boxSizing: 'border-box' }} />
          </div>
        ))}
      </div>
      {error && <div style={{ padding: '12px 16px', background: 'rgba(226,75,74,0.08)', border: '1px solid rgba(226,75,74,0.2)', borderRadius: 'var(--ud-radius)', fontSize: 13, color: 'var(--ud-danger)', fontFamily: 'var(--font-body)', marginBottom: 20 }}>{error}</div>}
      {result && (
        <div style={{ padding: '14px 18px', background: 'var(--ud-teal-2)', border: '1px solid var(--ud-teal)', borderRadius: 'var(--ud-radius-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <div><div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ud-teal)', fontFamily: 'var(--font-body)' }}>Legal bundle ready · Output: .udz bundle</div><div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)' }}>{files.length} documents · Bates {batesPrefix}{String(parseInt(batesStart)||1).padStart(5,'0')} – {batesPrefix}{String((parseInt(batesStart)||1)+files.length-1).padStart(5,'0')}</div></div>
          <a href={result.url} download={result.name} style={{ padding: '10px 18px', background: 'var(--ud-ink)', color: '#fff', fontWeight: 600, fontSize: 13, borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)', textDecoration: 'none', flexShrink: 0 }}>Download .udz →</a>
        </div>
      )}
      <button onClick={run} disabled={!files.length || !caseName} style={{ width: '100%', padding: '14px', background: !files.length || !caseName ? 'var(--ud-border)' : 'var(--ud-ink)', color: !files.length || !caseName ? 'var(--ud-muted)' : '#fff', border: 'none', borderRadius: 'var(--ud-radius)', fontSize: 15, fontWeight: 600, fontFamily: 'var(--font-body)', cursor: !files.length || !caseName ? 'not-allowed' : 'pointer' }}>Create Legal Bundle</button>
      <div style={{ marginTop: 40, padding: '16px', background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', fontSize: 12, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', textAlign: 'center' }}>
        Runs in your browser. No data sent to any server. Part of the <a href="https://ud.hive.baby" style={{ color: 'var(--ud-teal)' }}>Universal Document™</a> ecosystem.
      </div>
    </div>
  )
}
