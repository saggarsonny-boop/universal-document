'use client'
import { useState, useRef, useCallback } from 'react'

interface ParsedEMR { patient?: Record<string, unknown>; diagnoses?: { code?: string; description: string }[]; medications?: { name: string; dose: string; frequency: string }[]; allergies?: string[]; patient_summary?: string; clinical_summary?: string; source_format?: string }

export default function EMRExport() {
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [parsed, setParsed] = useState<ParsedEMR | null>(null)
  const [udsBlob, setUdsBlob] = useState<{ url: string; name: string } | null>(null)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback((f: File | null) => { if (!f) return; setFile(f); setParsed(null); setError(''); setUdsBlob(null) }, [])
  const onDrop = useCallback((e: React.DragEvent) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]) }, [handleFile])

  const run = async () => {
    if (!file) return
    setProcessing(true); setError(''); setParsed(null); setUdsBlob(null)
    try {
      const form = new FormData(); form.append('file', file)
      const res = await fetch('/api/emr-export', { method: 'POST', body: form })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Export failed') }
      const data = await res.json()
      setParsed(data.parsed)
      if (data.uds) {
        const blob = new Blob([data.uds], { type: 'application/json' })
        setUdsBlob({ url: URL.createObjectURL(blob), name: data.filename })
      }
    } catch (err: unknown) { setError(err instanceof Error ? err.message : 'Export failed') }
    finally { setProcessing(false) }
  }

  const section = (title: string, children: React.ReactNode) => (
    <div style={{ background: '#fff', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', padding: '14px 16px', marginBottom: 12 }}>
      <div style={{ fontSize: 10, fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>{title}</div>
      {children}
    </div>
  )

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
      <a href="/" style={{ fontSize: 13, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 32 }}>← All tools</a>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--ud-ink)', fontFamily: 'var(--font-display)' }}>UD EMR Export</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 99, background: 'rgba(200,150,10,0.12)', color: 'var(--ud-gold)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Enterprise</span>
          <span style={{ fontSize: 9, color: 'var(--ud-muted)', fontFamily: 'var(--font-mono)', paddingLeft: 10 }}>Free during beta</span>
        </div>
      </div>
      <p style={{ fontSize: 16, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', marginBottom: 8, lineHeight: 1.6 }}>Convert HL7, FHIR, C-CDA, or CCD health records into Universal Document™ format with a patient summary layer, clinical layer, and machine-readable structured data.</p>
      <div style={{ fontSize: 12, color: 'var(--ud-danger)', marginBottom: 28, padding: '8px 12px', background: 'rgba(226,75,74,0.06)', border: '1px solid rgba(226,75,74,0.2)', borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)' }}>This is not medical advice. Outputs must be reviewed by a qualified clinician before clinical use.</div>

      <div style={{ border: `1.5px dashed ${dragging ? 'var(--ud-teal)' : 'var(--ud-border-2)'}`, borderRadius: 'var(--ud-radius-xl)', padding: '40px 24px', textAlign: 'center', cursor: 'pointer', background: dragging ? 'var(--ud-teal-2)' : 'var(--ud-paper-2)', transition: 'all 0.2s', marginBottom: 24 }}
        onDragOver={e => { e.preventDefault(); setDragging(true) }} onDragLeave={() => setDragging(false)} onDrop={onDrop} onClick={() => inputRef.current?.click()}>
        <input ref={inputRef} type="file" accept=".xml,.hl7,.json,.txt,.cda,.ccda,.ccd" style={{ display: 'none' }} onChange={e => handleFile(e.target.files?.[0] ?? null)} />
        {file ? <div style={{ fontSize: 14, color: 'var(--ud-ink)', fontFamily: 'var(--font-body)' }}>🏥 {file.name}<br /><span style={{ fontSize: 12, color: 'var(--ud-teal)' }}>Click to replace</span></div>
          : <div><div style={{ fontSize: 32, marginBottom: 10 }}>🏥</div><div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ud-ink)', fontFamily: 'var(--font-body)' }}>Drop your health record</div><div style={{ fontSize: 13, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)' }}>.xml · .hl7 · .json · .txt · FHIR · C-CDA · CCD</div></div>}
      </div>

      {processing && <div style={{ marginBottom: 16 }}><div style={{ height: 4, background: 'var(--ud-border)', borderRadius: 99, overflow: 'hidden' }}><div style={{ height: '100%', width: '60%', background: 'var(--ud-teal)', borderRadius: 99, animation: 'ud-bounce 1.4s ease-in-out infinite' }} /></div><div style={{ fontSize: 12, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', marginTop: 8 }}>Parsing health record…</div></div>}
      {error && <div style={{ padding: '12px 16px', background: 'rgba(226,75,74,0.08)', border: '1px solid rgba(226,75,74,0.2)', borderRadius: 'var(--ud-radius)', fontSize: 13, color: 'var(--ud-danger)', fontFamily: 'var(--font-body)', marginBottom: 20 }}>{error}</div>}

      {parsed && (
        <div style={{ marginBottom: 24 }}>
          {parsed.source_format && <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)', marginBottom: 14 }}>Detected format: {parsed.source_format}</div>}
          {parsed.patient && section('Patient', <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {Object.entries(parsed.patient).filter(([,v]) => v).map(([k, v]) => <div key={k}><div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{k}</div><div style={{ fontSize: 13, fontFamily: 'var(--font-body)', color: 'var(--ud-ink)' }}>{String(v)}</div></div>)}
          </div>)}
          {parsed.patient_summary && section('Patient summary', <p style={{ fontSize: 14, fontFamily: 'var(--font-body)', color: 'var(--ud-ink)', lineHeight: 1.6, margin: 0 }}>{parsed.patient_summary}</p>)}
          {parsed.diagnoses?.length ? section('Diagnoses', parsed.diagnoses.map((d, i) => <div key={i} style={{ fontSize: 13, fontFamily: 'var(--font-body)', color: 'var(--ud-ink)', marginBottom: 4 }}>· {d.code ? `[${d.code}] ` : ''}{d.description}</div>)) : null}
          {parsed.medications?.length ? section('Medications', parsed.medications.map((m, i) => <div key={i} style={{ fontSize: 13, fontFamily: 'var(--font-body)', color: 'var(--ud-ink)', marginBottom: 4 }}>· {m.name} {m.dose} — {m.frequency}</div>)) : null}
          {udsBlob && (
            <div style={{ padding: '14px 18px', background: 'var(--ud-teal-2)', border: '1px solid var(--ud-teal)', borderRadius: 'var(--ud-radius-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginTop: 16 }}>
              <div><div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ud-teal)', fontFamily: 'var(--font-body)' }}>EMR converted to .uds ✓</div><div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)' }}>Patient + clinical layers embedded</div></div>
              <a href={udsBlob.url} download={udsBlob.name} style={{ padding: '10px 18px', background: 'var(--ud-ink)', color: '#fff', fontWeight: 600, fontSize: 13, borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)', textDecoration: 'none' }}>Download .uds →</a>
            </div>
          )}
        </div>
      )}

      <button onClick={run} disabled={!file || processing} style={{ width: '100%', padding: '14px', background: !file || processing ? 'var(--ud-border)' : 'var(--ud-ink)', color: !file || processing ? 'var(--ud-muted)' : '#fff', border: 'none', borderRadius: 'var(--ud-radius)', fontSize: 15, fontWeight: 600, fontFamily: 'var(--font-body)', cursor: !file || processing ? 'not-allowed' : 'pointer' }}>{processing ? 'Converting…' : 'Convert EMR to .uds'}</button>
      <div style={{ marginTop: 40, padding: '16px', background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', fontSize: 12, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', textAlign: 'center' }}>
        Analysis by Claude claude-opus-4-5. This is not medical advice. Part of the <a href="https://ud.hive.baby" style={{ color: 'var(--ud-teal)' }}>Universal Document™</a> ecosystem.
      </div>
    </div>
  )
}
