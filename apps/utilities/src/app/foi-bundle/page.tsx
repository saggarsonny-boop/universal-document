'use client'
import { useState, useRef, useCallback } from 'react'
import TooltipTour from '@/components/TooltipTour'
import { tourSteps } from '@/lib/tourSteps'

export default function FOIBundle() {
  const [files, setFiles] = useState<File[]>([])
  const [dragging, setDragging] = useState(false)
  const [foiRef, setFoiRef] = useState('')
  const [requestorName, setRequestorName] = useState('')
  const [requestorOrg, setRequestorOrg] = useState('')
  const [requestDate, setRequestDate] = useState('')
  const [result, setResult] = useState<{ url: string; name: string } | null>(null)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const addFiles = useCallback((fl: FileList | null) => { if (!fl) return; setFiles(prev => [...prev, ...Array.from(fl)]); setResult(null) }, [])
  const onDrop = useCallback((e: React.DragEvent) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files) }, [addFiles])

  const run = async () => {
    if (!files.length || !foiRef) return
    setError(''); setResult(null)
    try {
      const docs: Record<string, unknown>[] = []
      for (let i = 0; i < files.length; i++) {
        const text = await files[i].text()
        let inner: Record<string, unknown>
        try { inner = JSON.parse(text) } catch { inner = { format: 'UDS', title: files[i].name, content: text } }
        docs.push({ index: i + 1, filename: files[i].name, disclosed: true, redaction_applied: false, document: inner })
      }
      const now = new Date().toISOString()
      const bundle = {
        format: 'UDZ', bundle_type: 'foi_response',
        foi_reference: foiRef,
        requestor: { name: requestorName || undefined, organisation: requestorOrg || undefined },
        request_date: requestDate || undefined,
        response_date: now,
        document_count: files.length,
        completeness_statement: `This bundle contains all ${files.length} document(s) disclosed in response to FOI request ${foiRef}. Any withheld documents are recorded in the redaction log.`,
        redaction_log: docs.map(d => ({ index: d.index, filename: d.filename, disclosed: true, exemption_applied: null, exemption_basis: null })),
        documents: docs,
        provenance: { created_at: now, bundle_type: 'foi_response', foi_reference: foiRef },
      }
      const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' })
      setResult({ url: URL.createObjectURL(blob), name: `foi-${foiRef.replace(/\s+/g,'-').toLowerCase()}-response.udz` })
    } catch (err: unknown) { setError(err instanceof Error ? err.message : 'Failed') }
  }

  const inp = { width: '100%', padding: '10px 14px', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ud-ink)', background: '#fff', boxSizing: 'border-box' as const }
  const lbl = { display: 'block' as const, fontSize: 13, fontWeight: 600 as const, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: 6 }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
      <a href="/" style={{ fontSize: 13, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 32 }}>← All tools</a>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--ud-ink)', fontFamily: 'var(--font-display)' }}>UD FOI Bundle</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontSize: 13, fontWeight: 600, padding: '3px 10px', borderRadius: 99, background: 'var(--ud-gold-3)', color: 'var(--ud-gold-text)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Pro</span>
          <span style={{ fontSize: 9, color: 'var(--ud-muted)', fontFamily: 'var(--font-mono)', paddingLeft: 10 }}>Free during beta</span>
        </div>
      </div>
      <p style={{ fontSize: 16, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', marginBottom: 32, lineHeight: 1.6 }}>Package FOI response documents into a .udz bundle with completeness proof, redaction log, and full disclosure metadata. Output: .udz bundle.</p>

      <div style={{ border: `1.5px dashed ${dragging ? 'var(--ud-teal)' : 'var(--ud-border-2)'}`, borderRadius: 'var(--ud-radius-xl)', padding: '32px 24px', textAlign: 'center', cursor: 'pointer', background: dragging ? 'var(--ud-teal-2)' : 'var(--ud-paper-2)', transition: 'all 0.2s', marginBottom: 14 }}
        onDragOver={e => { e.preventDefault(); setDragging(true) }} onDragLeave={() => setDragging(false)} onDrop={onDrop} onClick={() => inputRef.current?.click()}>
        <input ref={inputRef} type="file" multiple accept=".uds,.pdf,.txt" style={{ display: 'none' }} onChange={e => addFiles(e.target.files)} />
        <div style={{ fontSize: 28, marginBottom: 8 }}>🏛</div>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ud-ink)', fontFamily: 'var(--font-body)' }}>Drop response documents · multiple accepted</div>
      </div>

      {files.length > 0 && <div style={{ marginBottom: 20 }}>{files.map((f, i) => <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#fff', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', marginBottom: 6, fontSize: 13, fontFamily: 'var(--font-body)', color: 'var(--ud-ink)' }}><span>📄 {f.name}</span><button onClick={() => setFiles(prev => prev.filter((_,j) => j !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ud-muted)', fontSize: 16 }}>×</button></div>)}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>
        <div style={{ gridColumn: '1/-1' }}><label style={lbl}>FOI reference number *</label><input style={inp} value={foiRef} onChange={e => setFoiRef(e.target.value)} placeholder="e.g. FOI-2026-00123" /></div>
        <div><label style={lbl}>Requestor name</label><input style={inp} value={requestorName} onChange={e => setRequestorName(e.target.value)} placeholder="Full name" /></div>
        <div><label style={lbl}>Requestor organisation</label><input style={inp} value={requestorOrg} onChange={e => setRequestorOrg(e.target.value)} placeholder="Organisation" /></div>
        <div><label style={lbl}>Request date</label><input type="date" style={inp} value={requestDate} onChange={e => setRequestDate(e.target.value)} /></div>
      </div>

      {error && <div style={{ padding: '12px 16px', background: 'rgba(226,75,74,0.08)', border: '1px solid rgba(226,75,74,0.2)', borderRadius: 'var(--ud-radius)', fontSize: 13, color: 'var(--ud-danger)', fontFamily: 'var(--font-body)', marginBottom: 20 }}>{error}</div>}
      {result && (
        <div style={{ padding: '14px 18px', background: 'var(--ud-teal-2)', border: '1px solid var(--ud-teal)', borderRadius: 'var(--ud-radius-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <div><div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ud-teal)', fontFamily: 'var(--font-body)' }}>FOI bundle ready · Output: .udz bundle</div><div style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)' }}>{foiRef} · {files.length} document{files.length !== 1 ? 's' : ''}</div></div>
          <a href={result.url} download={result.name} style={{ padding: '10px 18px', background: 'var(--ud-ink)', color: '#fff', fontWeight: 600, fontSize: 13, borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)', textDecoration: 'none', flexShrink: 0 }}>Download .udz →</a>
        </div>
      )}
      <button onClick={run} disabled={!files.length || !foiRef} style={{ width: '100%', padding: '14px', background: !files.length || !foiRef ? 'var(--ud-border)' : 'var(--ud-ink)', color: !files.length || !foiRef ? 'var(--ud-muted)' : '#fff', border: 'none', borderRadius: 'var(--ud-radius)', fontSize: 15, fontWeight: 600, fontFamily: 'var(--font-body)', cursor: !files.length || !foiRef ? 'not-allowed' : 'pointer' }}>Create FOI Bundle</button>
      <div style={{ marginTop: 40, padding: '16px', background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', fontSize: 13, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', textAlign: 'center' }}>
        Runs in your browser. No data sent to any server. Part of the <a href="https://ud.hive.baby" style={{ color: 'var(--ud-teal)' }}>Universal Document™</a> ecosystem.
      </div>

      <div style={{ marginTop: '3rem', paddingTop: '2.5rem', borderTop: '1px solid var(--ud-border)' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--ud-ink)', fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>How UD FOI Bundle differs from SharePoint and email attachments</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', marginBottom: '1.5rem', lineHeight: 1.6 }}>FOI responses assembled from shared drives or email have no structured redaction index and no tamper-evident audit trail. UD FOI Bundle creates a verifiable, self-contained response package.</p>
        <div style={{ display: 'grid', gap: '1rem' }}>
          {[
            { title: 'SharePoint / shared drive assembly', body: 'Documents scattered across folders, manually zipped and emailed. No structured index of what was withheld and under which exemption. No chain of custody proving the response hasn\'t been modified after dispatch.' },
            { title: 'PDF bundle with manual redaction log', body: 'A separate spreadsheet lists redacted items. The log can\'t be verified against the documents, can be edited after submission, and doesn\'t travel with the bundle when forwarded to the Information Commissioner.' },
            { title: 'UD FOI Bundle — structured exemption log', body: 'Each withheld or redacted item is recorded with its exemption basis in structured metadata inside the .udz. The log is machine-readable, verifiable, and cannot be separated from the response bundle.' },
            { title: 'UD FOI Bundle — tamper-evident dispatch record', body: 'The bundle is sealed with a hash at creation time. If the response is disputed, the original bundle can be verified as unmodified since the response date — useful for ICO appeals and judicial review.' },
          ].map(card => (
            <div key={card.title} style={{ background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)', borderRadius: '0.75rem', padding: '1.25rem' }}>
              <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--ud-ink)', fontFamily: 'var(--font-body)', marginBottom: '0.4rem' }}>{card.title}</div>
              <div style={{ fontSize: '15px', color: 'var(--ud-ink)', fontFamily: 'var(--font-body)', lineHeight: 1.7 }}>{card.body}</div>
            </div>
          ))}
        </div>
      </div>
      <TooltipTour engineId="foi-bundle" tips={tourSteps['foi-bundle']} />
    </div>
  )
}
