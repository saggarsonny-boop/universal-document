'use client'
import { useState, useRef, useCallback } from 'react'
import TooltipTour from '@/components/TooltipTour'
import { tourSteps } from '@/lib/tourSteps'

export default function BatesStamp() {
  const [files, setFiles] = useState<File[]>([])
  const [dragging, setDragging] = useState(false)
  const [prefix, setPrefix] = useState('BATES')
  const [startNum, setStartNum] = useState('1')
  const [padLength, setPadLength] = useState('5')
  const [party, setParty] = useState('')
  const [matter, setMatter] = useState('')
  const [result, setResult] = useState<{ url: string; name: string } | null>(null)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const addFiles = useCallback((fl: FileList | null) => { if (!fl) return; setFiles(prev => [...prev, ...Array.from(fl)]); setResult(null) }, [])
  const onDrop = useCallback((e: React.DragEvent) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files) }, [addFiles])

  const bates = (n: number) => `${prefix}-${String(n).padStart(parseInt(padLength) || 5, '0')}`

  const run = async () => {
    if (!files.length || !prefix) return
    setError(''); setResult(null)
    try {
      const now = new Date().toISOString()
      const start = parseInt(startNum) || 1
      const docs = await Promise.all(files.map(async (f, i) => {
        const text = await f.text()
        let inner: Record<string, unknown>
        try { inner = JSON.parse(text) } catch { inner = { format: 'UDS', title: f.name, content: text } }
        const batesNum = bates(start + i)
        return {
          bates_number: batesNum,
          filename: f.name,
          document: {
            ...inner,
            _bates: { number: batesNum, prefix, applied_at: now, party: party || undefined, matter: matter || undefined },
          },
        }
      }))
      const bundle = {
        format: 'UDZ', bundle_type: 'bates_stamped',
        prefix,
        bates_range: { from: bates(start), to: bates(start + files.length - 1), count: files.length },
        party: party || undefined,
        matter: matter || undefined,
        documents: docs,
        provenance: { created_at: now, bundle_type: 'bates_stamped', prefix, start_number: start, document_count: files.length },
      }
      const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' })
      setResult({ url: URL.createObjectURL(blob), name: `bates-${prefix.toLowerCase()}-${bates(start)}-${bates(start+files.length-1)}.udz` })
    } catch (err: unknown) { setError(err instanceof Error ? err.message : 'Failed') }
  }

  const inp = { width: '100%', padding: '10px 14px', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ud-ink)', background: '#fff', boxSizing: 'border-box' as const }
  const lbl = { display: 'block' as const, fontSize: 13, fontWeight: 600 as const, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: 6 }
  const start = parseInt(startNum) || 1

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
      <a href="/" style={{ fontSize: 13, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 32 }}>← All tools</a>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--ud-ink)', fontFamily: 'var(--font-display)' }}>UD Bates Stamp</h1>
        <span style={{ fontSize: 13, fontWeight: 600, padding: '3px 10px', borderRadius: 99, background: 'var(--ud-teal-2)', color: 'var(--ud-teal)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Free</span>
      </div>
      <p style={{ fontSize: 16, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', marginBottom: 32, lineHeight: 1.6 }}>Apply sequential Bates numbers to multiple documents and bundle them as a .udz. Each document carries its Bates number in verifiable metadata. Output: .udz bundle.</p>

      <div style={{ border: `1.5px dashed ${dragging ? 'var(--ud-teal)' : 'var(--ud-border-2)'}`, borderRadius: 'var(--ud-radius-xl)', padding: '28px 24px', textAlign: 'center', cursor: 'pointer', background: dragging ? 'var(--ud-teal-2)' : 'var(--ud-paper-2)', transition: 'all 0.2s', marginBottom: 14 }}
        onDragOver={e => { e.preventDefault(); setDragging(true) }} onDragLeave={() => setDragging(false)} onDrop={onDrop} onClick={() => inputRef.current?.click()}>
        <input ref={inputRef} type="file" multiple accept=".uds,.udr,.pdf,.txt,.json" style={{ display: 'none' }} onChange={e => addFiles(e.target.files)} />
        <div style={{ fontSize: 24, marginBottom: 6 }}>🔢</div>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ud-ink)', fontFamily: 'var(--font-body)' }}>Drop documents to stamp · multiple accepted</div>
      </div>
      {files.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          {files.map((f, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#fff', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', marginBottom: 6, fontSize: 13, fontFamily: 'var(--font-body)', color: 'var(--ud-ink)' }}>
              <span><span style={{ fontFamily: 'var(--font-mono)', color: 'var(--ud-gold)', fontWeight: 600, marginRight: 8 }}>{bates(start + i)}</span>{f.name}</span>
              <button onClick={() => setFiles(p => p.filter((_,j)=>j!==i))} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--ud-muted)', fontSize:16 }}>×</button>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 24 }}>
        <div><label style={lbl}>Prefix</label><input style={inp} value={prefix} onChange={e => setPrefix(e.target.value.toUpperCase())} placeholder="BATES" /></div>
        <div><label style={lbl}>Start number</label><input type="number" min="1" style={inp} value={startNum} onChange={e => setStartNum(e.target.value)} /></div>
        <div><label style={lbl}>Padding digits</label><input type="number" min="3" max="8" style={inp} value={padLength} onChange={e => setPadLength(e.target.value)} /></div>
        <div><label style={lbl}>Producing party</label><input style={inp} value={party} onChange={e => setParty(e.target.value)} placeholder="Law firm or party name" /></div>
        <div style={{ gridColumn: 'span 2' }}><label style={lbl}>Matter / case name</label><input style={inp} value={matter} onChange={e => setMatter(e.target.value)} placeholder="Case or matter name" /></div>
      </div>

      {files.length > 0 && (
        <div style={{ padding: '10px 14px', background: 'var(--ud-gold-3)', border: '1px solid var(--ud-gold)', borderRadius: 'var(--ud-radius)', fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--ud-gold)', marginBottom: 20 }}>
          Range: {bates(start)} → {bates(start + files.length - 1)} · {files.length} document{files.length!==1?'s':''}
        </div>
      )}

      {error && <div style={{ padding: '12px 16px', background: 'rgba(226,75,74,0.08)', border: '1px solid rgba(226,75,74,0.2)', borderRadius: 'var(--ud-radius)', fontSize: 13, color: 'var(--ud-danger)', fontFamily: 'var(--font-body)', marginBottom: 20 }}>{error}</div>}
      {result && (
        <div style={{ padding: '14px 18px', background: 'var(--ud-teal-2)', border: '1px solid var(--ud-teal)', borderRadius: 'var(--ud-radius-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <div><div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ud-teal)', fontFamily: 'var(--font-body)' }}>Bates stamped · Output: .udz bundle</div><div style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)' }}>{bates(start)} → {bates(start+files.length-1)}</div></div>
          <a href={result.url} download={result.name} style={{ padding: '10px 18px', background: 'var(--ud-ink)', color: '#fff', fontWeight: 600, fontSize: 13, borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)', textDecoration: 'none', flexShrink: 0 }}>Download .udz →</a>
        </div>
      )}
      <button onClick={run} disabled={!files.length || !prefix} style={{ width: '100%', padding: '14px', background: !files.length || !prefix ? 'var(--ud-border)' : 'var(--ud-ink)', color: !files.length || !prefix ? 'var(--ud-muted)' : '#fff', border: 'none', borderRadius: 'var(--ud-radius)', fontSize: 15, fontWeight: 600, fontFamily: 'var(--font-body)', cursor: !files.length || !prefix ? 'not-allowed' : 'pointer' }}>Apply Bates Stamp</button>
      <div style={{ marginTop: 40, padding: '16px', background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', fontSize: 13, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', textAlign: 'center' }}>
        Runs in your browser. No data sent to any server. Part of the <a href="https://ud.hive.baby" style={{ color: 'var(--ud-teal)' }}>Universal Document™</a> ecosystem.
      </div>

      <div style={{ marginTop: '3rem', paddingTop: '2.5rem', borderTop: '1px solid var(--ud-border)' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--ud-ink)', fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>How UD Bates Stamp differs from Adobe Acrobat Bates</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', marginBottom: '1.5rem', lineHeight: 1.6 }}>Adobe Acrobat Bates numbering burns numbers onto PDF pages. UD Bates Stamp writes numbers into structured document metadata — queryable, not just visible.</p>
        <div style={{ display: 'grid', gap: '1rem' }}>
          {[
            { title: 'Adobe Acrobat Bates numbering', body: 'Requires Acrobat Pro licence ($239/year). Burns numbers visually onto PDF pages as rendered text. The number is part of the image — not a queryable metadata field. Changing a number requires re-rendering the page.' },
            { title: 'Manual numbering in Word or by hand', body: 'Error-prone, non-sequential numbering is a common source of discovery sanctions. No verification that the range is continuous or that documents haven\'t been renumbered after production.' },
            { title: 'UD Bates Stamp — metadata-embedded numbers', body: 'Bates numbers are written into each document\'s structured metadata, not just printed on the page. The number can be read by any review tool, validated against the bundle index, and verified as unchanged.' },
            { title: 'UD Bates Stamp — continuous range verification', body: 'The .udz bundle index records the full Bates range at creation time. UD Legal Bundle Verify can subsequently confirm the range is intact and no documents have been added, removed, or renumbered.' },
          ].map(card => (
            <div key={card.title} style={{ background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)', borderRadius: '0.75rem', padding: '1.25rem' }}>
              <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--ud-ink)', fontFamily: 'var(--font-body)', marginBottom: '0.4rem' }}>{card.title}</div>
              <div style={{ fontSize: '15px', color: 'var(--ud-ink)', fontFamily: 'var(--font-body)', lineHeight: 1.7 }}>{card.body}</div>
            </div>
          ))}
        </div>
      </div>
      <TooltipTour engineId="bates-stamp" tips={tourSteps['bates-stamp']} />
    </div>
  )
}
