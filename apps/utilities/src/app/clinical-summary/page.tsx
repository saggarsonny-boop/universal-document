'use client'
import { useState, useRef, useCallback } from 'react'
import TooltipTour from '@/components/TooltipTour'
import { tourSteps } from '@/lib/tourSteps'

interface ClinicalResult {
  patient_summary: string
  clinical_summary: string
  key_diagnoses: string[]
  key_medications: string[]
  red_flags: string[]
  follow_up: string
}

export default function ClinicalSummary() {
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState<ClinicalResult | null>(null)
  const [udsBlob, setUdsBlob] = useState<{ url: string; name: string } | null>(null)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (f: File | null) => { if (!f) return; setFile(f); setResult(null); setError(''); setUdsBlob(null) }
  const onDrop = useCallback((e: React.DragEvent) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]) }, [])

  const run = async () => {
    if (!file) return
    setProcessing(true); setError(''); setResult(null); setUdsBlob(null)
    try {
      const form = new FormData(); form.append('file', file)
      const res = await fetch('/api/clinical-summary', { method: 'POST', body: form })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Clinical summary failed') }
      const data = await res.json()
      setResult(data.result)
      if (data.uds) {
        const blob = new Blob([data.uds], { type: 'application/json' })
        setUdsBlob({ url: URL.createObjectURL(blob), name: data.filename })
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Clinical summary failed')
    } finally { setProcessing(false) }
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
      <a href="/" style={{ fontSize: 13, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 32 }}>← All tools</a>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--ud-ink)', fontFamily: 'var(--font-display)' }}>UD Clinical Summary</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontSize: 13, fontWeight: 600, padding: '3px 10px', borderRadius: 99, background: 'var(--ud-gold-3)', color: 'var(--ud-gold-text)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Pro</span>
          <span style={{ fontSize: 9, color: 'var(--ud-muted)', fontFamily: 'var(--font-mono)', paddingLeft: 10 }}>Free during beta</span>
        </div>
      </div>
      <p style={{ fontSize: 16, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', marginBottom: 12, lineHeight: 1.6 }}>
        One clinical document, two plain-language layers: a health-literacy-optimised patient summary, and a structured clinical summary for the treating team. Both are embedded as Clarity Layers in the output .uds file — so the dual-audience record travels with the document, not in a separate system.
      </p>
      <div style={{ fontSize: 13, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', marginBottom: 20, lineHeight: 1.6, padding: '12px 16px', background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)' }}>
        Built for discharge summaries, clinic letters, and EHR exports where both patient understanding and NHS document governance are required. Unlike Dragon Medical or Nuance — which do voice-to-text only — this tool reads any existing document and generates structured output.
      </div>
      <div style={{ fontSize: 13, color: 'var(--ud-danger)', fontFamily: 'var(--font-body)', marginBottom: 32, padding: '8px 12px', background: 'rgba(226,75,74,0.06)', border: '1px solid rgba(226,75,74,0.2)', borderRadius: 'var(--ud-radius)' }}>
        This is not medical advice. Summaries are AI-generated and must be reviewed by a qualified clinician before use.
      </div>

      <div style={{ border: `1.5px dashed ${dragging ? 'var(--ud-teal)' : 'var(--ud-border-2)'}`, borderRadius: 'var(--ud-radius-xl)', padding: '48px 24px', textAlign: 'center', cursor: 'pointer', background: dragging ? 'var(--ud-teal-2)' : 'var(--ud-paper-2)', transition: 'all 0.2s', marginBottom: 24 }}
        onDragOver={e => { e.preventDefault(); setDragging(true) }} onDragLeave={() => setDragging(false)} onDrop={onDrop} onClick={() => inputRef.current?.click()}>
        <input ref={inputRef} type="file" accept=".uds,.udr,.pdf,.txt,.docx" style={{ display: 'none' }} onChange={e => handleFile(e.target.files?.[0] ?? null)} />
        {file
          ? <div><div style={{ fontSize: 14, color: 'var(--ud-ink)', fontFamily: 'var(--font-body)' }}>🏥 {file.name}</div><div style={{ fontSize: 13, color: 'var(--ud-teal)', marginTop: 8, fontFamily: 'var(--font-body)' }}>Click or drop to replace</div></div>
          : <div><div style={{ fontSize: 32, marginBottom: 12 }}>🏥</div><div style={{ fontSize: 15, color: 'var(--ud-ink)', fontWeight: 600, marginBottom: 6, fontFamily: 'var(--font-body)' }}>Drop your clinical document here</div><div style={{ fontSize: 13, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)' }}>or click to browse · .uds .pdf .txt .docx</div></div>}
      </div>

      {error && <div style={{ padding: '12px 16px', background: 'rgba(226,75,74,0.08)', border: '1px solid rgba(226,75,74,0.2)', borderRadius: 'var(--ud-radius)', fontSize: 13, color: 'var(--ud-danger)', fontFamily: 'var(--font-body)', marginBottom: 20 }}>{error}</div>}

      {processing && <div style={{ marginBottom: 20 }}><div style={{ height: 4, background: 'var(--ud-border)', borderRadius: 99, overflow: 'hidden' }}><div style={{ height: '100%', width: '60%', background: 'var(--ud-teal)', borderRadius: 99, animation: 'ud-bounce 1.4s ease-in-out infinite' }} /></div><div style={{ fontSize: 13, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', marginTop: 8 }}>Generating dual-audience clinical summary…</div></div>}

      {result && (
        <div style={{ marginBottom: 24 }}>
          {/* Patient summary */}
          <div style={{ padding: '20px 22px', background: 'var(--ud-teal-2)', border: '1px solid var(--ud-teal)', borderRadius: 'var(--ud-radius-lg)', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 18 }}>👤</span>
              <div style={{ fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--ud-teal)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Patient summary — plain language</div>
            </div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--ud-ink)', lineHeight: 1.7, margin: 0 }}>{result.patient_summary}</p>
          </div>

          {/* Clinical summary */}
          <div style={{ padding: '20px 22px', background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius-lg)', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 18 }}>🩺</span>
              <div style={{ fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Clinical summary — healthcare professional</div>
            </div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ud-ink)', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-wrap' }}>{result.clinical_summary}</p>
          </div>

          {/* Key data grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 14 }}>
            {result.key_diagnoses.length > 0 && (
              <div style={{ padding: '14px 16px', background: '#fff', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)' }}>
                <div style={{ fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Diagnoses</div>
                {result.key_diagnoses.map((d, i) => <div key={i} style={{ fontSize: 13, fontFamily: 'var(--font-body)', color: 'var(--ud-ink)', marginBottom: 3 }}>· {d}</div>)}
              </div>
            )}
            {result.key_medications.length > 0 && (
              <div style={{ padding: '14px 16px', background: '#fff', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)' }}>
                <div style={{ fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Medications</div>
                {result.key_medications.map((m, i) => <div key={i} style={{ fontSize: 13, fontFamily: 'var(--font-body)', color: 'var(--ud-ink)', marginBottom: 3 }}>· {m}</div>)}
              </div>
            )}
            {result.red_flags.length > 0 && (
              <div style={{ padding: '14px 16px', background: 'rgba(226,75,74,0.05)', border: '1px solid rgba(226,75,74,0.2)', borderRadius: 'var(--ud-radius)' }}>
                <div style={{ fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--ud-danger)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Red flags</div>
                {result.red_flags.map((f, i) => <div key={i} style={{ fontSize: 13, fontFamily: 'var(--font-body)', color: 'var(--ud-danger)', marginBottom: 3 }}>⚑ {f}</div>)}
              </div>
            )}
          </div>

          {/* Follow-up */}
          {result.follow_up && (
            <div style={{ padding: '12px 16px', background: 'rgba(200,150,10,0.06)', border: '1px solid rgba(200,150,10,0.3)', borderRadius: 'var(--ud-radius)', marginBottom: udsBlob ? 12 : 0 }}>
              <span style={{ fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--ud-gold)', textTransform: 'uppercase', letterSpacing: '0.08em', marginRight: 8 }}>Follow-up</span>
              <span style={{ fontSize: 13, fontFamily: 'var(--font-body)', color: 'var(--ud-ink)' }}>{result.follow_up}</span>
            </div>
          )}

          {udsBlob && (
            <div style={{ padding: '14px 18px', background: 'var(--ud-teal-2)', border: '1px solid var(--ud-teal)', borderRadius: 'var(--ud-radius-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginTop: 12 }}>
              <div><div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ud-teal)', fontFamily: 'var(--font-body)', marginBottom: 2 }}>Both summaries embedded in .uds ✓</div><div style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)' }}>{udsBlob.name}</div></div>
              <a href={udsBlob.url} download={udsBlob.name} style={{ padding: '10px 18px', background: 'var(--ud-ink)', color: '#fff', fontWeight: 600, fontSize: 13, borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)', textDecoration: 'none', flexShrink: 0 }}>Download .uds →</a>
            </div>
          )}
        </div>
      )}

      <button onClick={run} disabled={!file || processing} style={{ width: '100%', padding: '14px', background: !file || processing ? 'var(--ud-border)' : 'var(--ud-ink)', color: !file || processing ? 'var(--ud-muted)' : '#fff', border: 'none', borderRadius: 'var(--ud-radius)', fontSize: 15, fontWeight: 600, fontFamily: 'var(--font-body)', cursor: !file || processing ? 'not-allowed' : 'pointer' }}>
        {processing ? 'Generating…' : 'Generate Clinical Summary'}
      </button>

      {/* Comparison */}
      <div style={{ marginTop: 48, paddingTop: 40, borderTop: '1px solid var(--ud-border)' }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--ud-ink)', marginBottom: 6 }}>How UD Clinical Summary differs</h2>
        <p style={{ fontSize: 14, fontFamily: 'var(--font-body)', color: 'var(--ud-muted)', marginBottom: 20, lineHeight: 1.6 }}>
          Clinical summarization already exists — but no other tool embeds both the patient-facing and clinician-facing versions inside the original document as a governed record.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
          {[
            { icon: '📋', title: 'Manual summarization', body: 'Clinicians writing discharge summaries manually takes 20–40 minutes per patient. Quality is inconsistent. UD Clinical Summary generates both versions in under 30 seconds from the source document.' },
            { icon: '🎙', title: 'Dragon Medical / Nuance', body: 'Voice-to-text tools transcribe speech but cannot summarise existing documents. They produce a single voice note, not a dual-audience structured summary embedded in a file.' },
            { icon: '💬', title: 'ChatGPT', body: 'ChatGPT can summarise text pasted into a chat window, but the output lives in a conversation thread — not embedded in the document, not tamper-evident, not shareable as a file.' },
            { icon: '📄', title: 'UD Clinical Summary', body: 'Both the plain-language patient version and the structured clinical professional version are embedded as named Clarity Layers in the .uds output. They travel with the document permanently.' },
          ].map(item => (
            <div key={item.title} style={{ padding: '16px 18px', background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius-lg)', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 18, lineHeight: '1', flexShrink: 0, marginTop: 2 }}>{item.icon}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--ud-ink)', marginBottom: 4 }}>{item.title}</div>
                <p style={{ fontSize: 13, fontFamily: 'var(--font-body)', color: 'var(--ud-muted)', lineHeight: 1.5, margin: 0 }}>{item.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 24, padding: '16px', background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', fontSize: 13, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', textAlign: 'center' }}>
        Analysis powered by Claude. This is not medical advice. Always consult a qualified clinician.<br />
        Part of the <a href="https://ud.hive.baby" style={{ color: 'var(--ud-teal)' }}>Universal Document™</a> ecosystem.
      </div>
      <TooltipTour engineId="clinical-summary" tips={tourSteps['clinical-summary']} />
    </div>
  )
}
