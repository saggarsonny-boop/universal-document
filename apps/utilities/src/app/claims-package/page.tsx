'use client'
import { useState, useRef, useCallback } from 'react'

export default function ClaimsPackage() {
  const [claimRef, setClaimRef] = useState('')
  const [claimantName, setClaimantName] = useState('')
  const [claimantEmail, setClaimantEmail] = useState('')
  const [policyNumber, setPolicyNumber] = useState('')
  const [insurer, setInsurer] = useState('')
  const [incidentDate, setIncidentDate] = useState('')
  const [incidentDescription, setIncidentDescription] = useState('')
  const [claimAmount, setClaimAmount] = useState('')
  const [currency, setCurrency] = useState('GBP')
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
    if (!claimantName || !incidentDate) { setError('Claimant name and incident date are required'); return }
    setError('')
    try {
      const now = new Date().toISOString()
      const ref = claimRef || `CLM-${Date.now().toString(36).toUpperCase()}`
      const docs = await Promise.all(files.map(async (f, i) => {
        const text = await f.text().catch(() => '')
        let inner: Record<string, unknown>
        try { inner = JSON.parse(text) } catch { inner = { content: text.slice(0, 1000) } }
        const type = i === 0 ? 'claim_form' : i === 1 ? 'incident_report' : 'supporting_evidence'
        return { index: i + 1, filename: f.name, document_type: type, disclosed: true, document: inner }
      }))
      const bundle = {
        format: 'UDZ', bundle_type: 'claims_package',
        claim_reference: ref,
        claimant: { name: claimantName, email: claimantEmail || undefined },
        policy_number: policyNumber || undefined,
        insurer: insurer || undefined,
        incident_date: incidentDate,
        incident_description: incidentDescription || undefined,
        claim_amount: claimAmount ? { amount: parseFloat(claimAmount), currency } : undefined,
        document_count: files.length,
        chain_of_custody: docs.map(d => ({ index: d.index, filename: d.filename, received_at: now, document_type: d.document_type })),
        documents: docs,
        provenance: { created_at: now, bundle_type: 'claims_package', claim_reference: ref },
      }
      const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' })
      setResult({ url: URL.createObjectURL(blob), name: `claims-${ref.toLowerCase()}.udz` })
    } catch (err: unknown) { setError(err instanceof Error ? err.message : 'Failed') }
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
      <a href="/" style={{ fontSize: 13, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 32 }}>← All tools</a>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--ud-ink)', fontFamily: 'var(--font-display)' }}>UD Claims Package</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 99, background: 'var(--ud-gold-3)', color: 'var(--ud-gold)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Pro</span>
          <span style={{ fontSize: 9, color: 'var(--ud-muted)', fontFamily: 'var(--font-mono)', paddingLeft: 10 }}>Free during beta</span>
        </div>
      </div>
      <p style={{ fontSize: 16, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', marginBottom: 32, lineHeight: 1.6 }}>Bundle a claim form, incident report, and supporting evidence into a .udz package with chain-of-custody proof and claim metadata. Output: .udz bundle.</p>

      <div style={{ border: `1.5px dashed ${dragging ? 'var(--ud-teal)' : 'var(--ud-border-2)'}`, borderRadius: 'var(--ud-radius-xl)', padding: '28px 24px', textAlign: 'center', cursor: 'pointer', background: dragging ? 'var(--ud-teal-2)' : 'var(--ud-paper-2)', transition: 'all 0.2s', marginBottom: 14 }}
        onDragOver={e => { e.preventDefault(); setDragging(true) }} onDragLeave={() => setDragging(false)} onDrop={onDrop} onClick={() => inputRef.current?.click()}>
        <input ref={inputRef} type="file" multiple accept=".uds,.pdf,.txt,.jpg,.jpeg,.png,.docx" style={{ display: 'none' }} onChange={e => addFiles(e.target.files)} />
        <div style={{ fontSize: 24, marginBottom: 6 }}>📁</div>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ud-ink)', fontFamily: 'var(--font-body)' }}>Drop evidence files · multiple accepted</div>
        <div style={{ fontSize: 12, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', marginTop: 4 }}>Claim form · Incident report · Photos · Supporting docs</div>
      </div>
      {files.length > 0 && <div style={{ marginBottom: 20 }}>{files.map((f, i) => <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#fff', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', marginBottom: 6, fontSize: 13, fontFamily: 'var(--font-body)', color: 'var(--ud-ink)' }}><span>📄 {f.name} <span style={{ color: 'var(--ud-muted)', fontSize: 11 }}>({i===0?'claim form':i===1?'incident report':'evidence'})</span></span><button onClick={() => setFiles(p => p.filter((_,j)=>j!==i))} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--ud-muted)', fontSize:16 }}>×</button></div>)}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>
        <div><label style={lbl}>Claim reference</label><input style={inp} value={claimRef} onChange={e => setClaimRef(e.target.value)} placeholder="Auto-generated if blank" /></div>
        <div><label style={lbl}>Policy number</label><input style={inp} value={policyNumber} onChange={e => setPolicyNumber(e.target.value)} placeholder="Your policy number" /></div>
        <div><label style={lbl}>Claimant name *</label><input style={inp} value={claimantName} onChange={e => setClaimantName(e.target.value)} placeholder="Full name" /></div>
        <div><label style={lbl}>Claimant email</label><input type="email" style={inp} value={claimantEmail} onChange={e => setClaimantEmail(e.target.value)} placeholder="email@example.com" /></div>
        <div style={{ gridColumn: '1/-1' }}><label style={lbl}>Insurer</label><input style={inp} value={insurer} onChange={e => setInsurer(e.target.value)} placeholder="Insurance company" /></div>
        <div><label style={lbl}>Incident date *</label><input type="date" style={inp} value={incidentDate} onChange={e => setIncidentDate(e.target.value)} /></div>
        <div><label style={lbl}>Claim amount</label><input type="number" min="0" step="0.01" style={inp} value={claimAmount} onChange={e => setClaimAmount(e.target.value)} placeholder="Amount" /></div>
        <div style={{ gridColumn: '1/-1' }}><label style={lbl}>Currency</label><select value={currency} onChange={e => setCurrency(e.target.value)} style={{ ...inp, cursor: 'pointer', width: 'auto' }}>{['GBP','USD','EUR','AUD','CAD'].map(c => <option key={c} value={c}>{c}</option>)}</select></div>
        <div style={{ gridColumn: '1/-1' }}><label style={lbl}>Incident description</label><textarea value={incidentDescription} onChange={e => setIncidentDescription(e.target.value)} rows={4} style={{ ...inp, resize: 'vertical' }} placeholder="What happened, when, where, how…" /></div>
      </div>

      {error && <div style={{ padding: '12px 16px', background: 'rgba(226,75,74,0.08)', border: '1px solid rgba(226,75,74,0.2)', borderRadius: 'var(--ud-radius)', fontSize: 13, color: 'var(--ud-danger)', fontFamily: 'var(--font-body)', marginBottom: 20 }}>{error}</div>}
      {result && (
        <div style={{ padding: '14px 18px', background: 'var(--ud-teal-2)', border: '1px solid var(--ud-teal)', borderRadius: 'var(--ud-radius-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <div><div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ud-teal)', fontFamily: 'var(--font-body)' }}>Claims package ready · Output: .udz bundle</div><div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)' }}>{claimantName} · {files.length} document{files.length!==1?'s':''}</div></div>
          <a href={result.url} download={result.name} style={{ padding: '10px 18px', background: 'var(--ud-ink)', color: '#fff', fontWeight: 600, fontSize: 13, borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)', textDecoration: 'none', flexShrink: 0 }}>Download .udz →</a>
        </div>
      )}
      <button onClick={run} disabled={!claimantName || !incidentDate} style={{ width: '100%', padding: '14px', background: !claimantName || !incidentDate ? 'var(--ud-border)' : 'var(--ud-ink)', color: !claimantName || !incidentDate ? 'var(--ud-muted)' : '#fff', border: 'none', borderRadius: 'var(--ud-radius)', fontSize: 15, fontWeight: 600, fontFamily: 'var(--font-body)', cursor: !claimantName || !incidentDate ? 'not-allowed' : 'pointer' }}>Create Claims Package</button>
      <div style={{ marginTop: 40, padding: '16px', background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', fontSize: 12, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', textAlign: 'center' }}>
        Runs in your browser. No data sent to any server. Part of the <a href="https://ud.hive.baby" style={{ color: 'var(--ud-teal)' }}>Universal Document™</a> ecosystem.
      </div>
    </div>
  )
}
