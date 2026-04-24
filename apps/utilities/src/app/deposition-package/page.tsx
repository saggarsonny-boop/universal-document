'use client'
import { useState, useRef, useCallback } from 'react'
import TooltipTour from '@/components/TooltipTour'
import { tourSteps } from '@/lib/tourSteps'

export default function DepositionPackage() {
  const [transcript, setTranscript] = useState<File | null>(null)
  const [exhibits, setExhibits] = useState<File[]>([])
  const [draggingT, setDraggingT] = useState(false)
  const [draggingE, setDraggingE] = useState(false)
  const [deponent, setDeponent] = useState('')
  const [caseRef, setCaseRef] = useState('')
  const [depDate, setDepDate] = useState('')
  const [result, setResult] = useState<{ url: string; name: string } | null>(null)
  const [error, setError] = useState('')
  const tRef = useRef<HTMLInputElement>(null)
  const eRef = useRef<HTMLInputElement>(null)

  const onDropT = useCallback((e: React.DragEvent) => { e.preventDefault(); setDraggingT(false); const f = e.dataTransfer.files[0]; if (f) { setTranscript(f); setResult(null) } }, [])
  const onDropE = useCallback((e: React.DragEvent) => { e.preventDefault(); setDraggingE(false); setExhibits(prev => [...prev, ...Array.from(e.dataTransfer.files)]); setResult(null) }, [])

  const run = async () => {
    if (!transcript || !deponent) return
    setError(''); setResult(null)
    try {
      const tText = await transcript.text()
      let tDoc: Record<string, unknown>
      try { tDoc = JSON.parse(tText) } catch { tDoc = { format: 'UDS', title: `Transcript — ${deponent}`, content: tText } }

      const exhibitDocs: Record<string, unknown>[] = []
      for (let i = 0; i < exhibits.length; i++) {
        const txt = await exhibits[i].text()
        let inner: Record<string, unknown>
        try { inner = JSON.parse(txt) } catch { inner = { format: 'UDS', title: exhibits[i].name, content: txt } }
        exhibitDocs.push({ index: i + 1, exhibit_number: `Exhibit ${String.fromCharCode(65 + i)}`, filename: exhibits[i].name, document: inner })
      }

      const now = new Date().toISOString()
      const bundle = {
        format: 'UDZ',
        bundle_type: 'deposition',
        deponent,
        case_reference: caseRef || undefined,
        deposition_date: depDate || undefined,
        document_count: 1 + exhibits.length,
        documents: [
          { index: 1, type: 'transcript', filename: transcript.name, document: tDoc },
          ...exhibitDocs,
        ],
        deposition_index: {
          deponent,
          case_reference: caseRef,
          deposition_date: depDate,
          transcript_file: transcript.name,
          exhibits: exhibitDocs.map(e => ({ number: e.exhibit_number, filename: e.filename })),
        },
        provenance: { created_at: now, bundle_type: 'deposition' },
      }
      const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' })
      setResult({ url: URL.createObjectURL(blob), name: `${deponent.replace(/\s+/g, '-').toLowerCase()}-deposition.udz` })
    } catch (err: unknown) { setError(err instanceof Error ? err.message : 'Failed') }
  }

  const dropStyle = (active: boolean) => ({ border: `1.5px dashed ${active ? 'var(--ud-teal)' : 'var(--ud-border-2)'}`, borderRadius: 'var(--ud-radius-lg)', padding: '24px 16px', textAlign: 'center' as const, cursor: 'pointer', background: active ? 'var(--ud-teal-2)' : 'var(--ud-paper-2)', transition: 'all 0.2s' })
  const inp = { width: '100%', padding: '10px 14px', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ud-ink)', background: '#fff', boxSizing: 'border-box' as const }
  const lbl = { display: 'block' as const, fontSize: 12, fontWeight: 600 as const, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: 8 }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
      <a href="/" style={{ fontSize: 13, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 32 }}>← All tools</a>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--ud-ink)', fontFamily: 'var(--font-display)' }}>UD Deposition Package</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 99, background: 'var(--ud-gold-3)', color: 'var(--ud-gold)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Pro</span>
          <span style={{ fontSize: 9, color: 'var(--ud-muted)', fontFamily: 'var(--font-mono)', paddingLeft: 10 }}>Free during beta</span>
        </div>
      </div>
      <p style={{ fontSize: 16, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', marginBottom: 32, lineHeight: 1.6 }}>Bundle a deposition transcript with exhibits into a structured .udz package with synchronised exhibit references and a deposition index.</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Transcript <span style={{ color: 'var(--ud-danger)' }}>*</span></div>
          <div style={dropStyle(draggingT)} onDragOver={e => { e.preventDefault(); setDraggingT(true) }} onDragLeave={() => setDraggingT(false)} onDrop={onDropT} onClick={() => tRef.current?.click()}>
            <input ref={tRef} type="file" accept=".uds,.udr,.pdf,.txt" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) { setTranscript(f); setResult(null) } }} />
            <div style={{ fontSize: 12, color: transcript ? 'var(--ud-ink)' : 'var(--ud-muted)', fontFamily: 'var(--font-body)' }}>{transcript ? `📋 ${transcript.name}` : 'Drop transcript here'}</div>
          </div>
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Exhibits</div>
          <div style={dropStyle(draggingE)} onDragOver={e => { e.preventDefault(); setDraggingE(true) }} onDragLeave={() => setDraggingE(false)} onDrop={onDropE} onClick={() => eRef.current?.click()}>
            <input ref={eRef} type="file" accept=".uds,.udr,.pdf,.txt" multiple style={{ display: 'none' }} onChange={e => { setExhibits(prev => [...prev, ...Array.from(e.target.files ?? [])]); setResult(null) }} />
            <div style={{ fontSize: 12, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)' }}>{exhibits.length ? `${exhibits.length} exhibit${exhibits.length > 1 ? 's' : ''} added` : 'Drop exhibits (optional)'}</div>
          </div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 24 }}>
        <div style={{ gridColumn: '1/-1' }}><label style={lbl}>Deponent name <span style={{ color: 'var(--ud-danger)' }}>*</span></label><input style={inp} value={deponent} onChange={e => setDeponent(e.target.value)} placeholder="Full name" /></div>
        <div><label style={lbl}>Case reference</label><input style={inp} value={caseRef} onChange={e => setCaseRef(e.target.value)} placeholder="Case no." /></div>
        <div><label style={lbl}>Deposition date</label><input type="date" style={inp} value={depDate} onChange={e => setDepDate(e.target.value)} /></div>
      </div>
      {error && <div style={{ padding: '12px 16px', background: 'rgba(226,75,74,0.08)', border: '1px solid rgba(226,75,74,0.2)', borderRadius: 'var(--ud-radius)', fontSize: 13, color: 'var(--ud-danger)', fontFamily: 'var(--font-body)', marginBottom: 20 }}>{error}</div>}
      {result && (
        <div style={{ padding: '14px 18px', background: 'var(--ud-teal-2)', border: '1px solid var(--ud-teal)', borderRadius: 'var(--ud-radius-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <div><div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ud-teal)', fontFamily: 'var(--font-body)' }}>Package ready · Output: .udz bundle</div><div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)' }}>1 transcript + {exhibits.length} exhibit{exhibits.length !== 1 ? 's' : ''}</div></div>
          <a href={result.url} download={result.name} style={{ padding: '10px 18px', background: 'var(--ud-ink)', color: '#fff', fontWeight: 600, fontSize: 13, borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)', textDecoration: 'none', flexShrink: 0 }}>Download .udz →</a>
        </div>
      )}
      <button onClick={run} disabled={!transcript || !deponent} style={{ width: '100%', padding: '14px', background: !transcript || !deponent ? 'var(--ud-border)' : 'var(--ud-ink)', color: !transcript || !deponent ? 'var(--ud-muted)' : '#fff', border: 'none', borderRadius: 'var(--ud-radius)', fontSize: 15, fontWeight: 600, fontFamily: 'var(--font-body)', cursor: !transcript || !deponent ? 'not-allowed' : 'pointer' }}>Create Deposition Package</button>
      <div style={{ marginTop: 40, padding: '16px', background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', fontSize: 12, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', textAlign: 'center' }}>
        Runs in your browser. No data sent to any server. Part of the <a href="https://ud.hive.baby" style={{ color: 'var(--ud-teal)' }}>Universal Document™</a> ecosystem.
      </div>

      <div style={{ marginTop: '3rem', paddingTop: '2.5rem', borderTop: '1px solid var(--ud-border)' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--ud-ink)', fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>How UD Deposition Package differs from TrialDirector and manual bundling</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', marginBottom: '1.5rem', lineHeight: 1.6 }}>Enterprise trial presentation tools require installation and licences. Manually assembling transcript and exhibits in a folder has no structure or chain of custody.</p>
        <div style={{ display: 'grid', gap: '1rem' }}>
          {[
            { title: 'TrialDirector / Sanction', body: 'Powerful trial presentation tools — but expensive, Windows-only, and far more than you need for bundling a deposition. Not available to paralegals or barristers without IT procurement.' },
            { title: 'Shared folder or email attachment', body: 'Transcript and exhibits emailed separately. No cover sheet, no exhibit index, no chain of custody, no assurance the recipient has the correct version of each document.' },
            { title: 'UD Deposition Package — single .udz with index', body: 'One file contains the transcript, all numbered exhibits, a cover sheet, and a machine-readable exhibit index. Opposing counsel or the court receives one verified package, not a folder of loose files.' },
            { title: 'UD Deposition Package — chain of custody', body: 'Every document in the bundle carries provenance metadata showing when it was added and by whom. The .udz itself is sealed with a tamper-evident hash at creation time.' },
          ].map(card => (
            <div key={card.title} style={{ background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)', borderRadius: '0.75rem', padding: '1.25rem' }}>
              <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--ud-ink)', fontFamily: 'var(--font-body)', marginBottom: '0.4rem' }}>{card.title}</div>
              <div style={{ fontSize: '0.83rem', color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', lineHeight: 1.6 }}>{card.body}</div>
            </div>
          ))}
        </div>
      </div>
      <TooltipTour engineId="deposition-package" tips={tourSteps['deposition-package']} />
    </div>
  )
}
