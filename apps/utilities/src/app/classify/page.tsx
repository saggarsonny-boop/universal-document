'use client'
import { useState, useRef, useCallback } from 'react'

interface ClassifyResult {
  classification: 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED'
  confidence: number
  reasoning: string
  indicators: string[]
  recommended_handling: string
}

const CLASSIFICATION_STYLE: Record<string, { bg: string; border: string; color: string; icon: string }> = {
  PUBLIC:       { bg: 'var(--ud-teal-2)',         border: 'var(--ud-teal)',          color: 'var(--ud-teal)',    icon: '🌐' },
  INTERNAL:     { bg: 'rgba(200,150,10,0.08)',     border: 'var(--ud-gold)',          color: 'var(--ud-gold)',    icon: '🏢' },
  CONFIDENTIAL: { bg: 'rgba(226,120,50,0.08)',     border: 'rgba(226,120,50,0.6)',    color: '#d17a30',           icon: '🔒' },
  RESTRICTED:   { bg: 'rgba(226,75,74,0.08)',      border: 'rgba(226,75,74,0.4)',     color: 'var(--ud-danger)',  icon: '🔴' },
}

export default function Classify() {
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState<ClassifyResult | null>(null)
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
      const res = await fetch('/api/classify', { method: 'POST', body: form })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Classification failed') }
      const data = await res.json()
      setResult(data.result)
      if (data.uds) {
        const blob = new Blob([data.uds], { type: 'application/json' })
        setUdsBlob({ url: URL.createObjectURL(blob), name: data.filename })
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Classification failed')
    } finally { setProcessing(false) }
  }

  const style = result ? CLASSIFICATION_STYLE[result.classification] ?? CLASSIFICATION_STYLE.INTERNAL : null

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
      <a href="/" style={{ fontSize: 13, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 32 }}>← All tools</a>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--ud-ink)', fontFamily: 'var(--font-display)' }}>UD Classify</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 99, background: 'var(--ud-gold-3)', color: 'var(--ud-gold)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Pro</span>
          <span style={{ fontSize: 9, color: 'var(--ud-muted)', fontFamily: 'var(--font-mono)', paddingLeft: 10 }}>Free during beta</span>
        </div>
      </div>
      <p style={{ fontSize: 16, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', marginBottom: 32, lineHeight: 1.6 }}>
        Claude reads your document and assigns a sensitivity classification: Public, Internal, Confidential, or Restricted — with reasoning. The classification is embedded as metadata in the output .uds file.
      </p>

      <div style={{ border: `1.5px dashed ${dragging ? 'var(--ud-teal)' : 'var(--ud-border-2)'}`, borderRadius: 'var(--ud-radius-xl)', padding: '48px 24px', textAlign: 'center', cursor: 'pointer', background: dragging ? 'var(--ud-teal-2)' : 'var(--ud-paper-2)', transition: 'all 0.2s', marginBottom: 24 }}
        onDragOver={e => { e.preventDefault(); setDragging(true) }} onDragLeave={() => setDragging(false)} onDrop={onDrop} onClick={() => inputRef.current?.click()}>
        <input ref={inputRef} type="file" accept=".uds,.udr,.pdf,.txt,.docx" style={{ display: 'none' }} onChange={e => handleFile(e.target.files?.[0] ?? null)} />
        {file
          ? <div><div style={{ fontSize: 14, color: 'var(--ud-ink)', fontFamily: 'var(--font-body)' }}>🏷 {file.name}</div><div style={{ fontSize: 12, color: 'var(--ud-teal)', marginTop: 8, fontFamily: 'var(--font-body)' }}>Click or drop to replace</div></div>
          : <div><div style={{ fontSize: 32, marginBottom: 12 }}>🏷</div><div style={{ fontSize: 15, color: 'var(--ud-ink)', fontWeight: 600, marginBottom: 6, fontFamily: 'var(--font-body)' }}>Drop your document here</div><div style={{ fontSize: 13, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)' }}>or click to browse · .uds .pdf .txt .docx</div></div>}
      </div>

      {error && <div style={{ padding: '12px 16px', background: 'rgba(226,75,74,0.08)', border: '1px solid rgba(226,75,74,0.2)', borderRadius: 'var(--ud-radius)', fontSize: 13, color: 'var(--ud-danger)', fontFamily: 'var(--font-body)', marginBottom: 20 }}>{error}</div>}

      {processing && <div style={{ marginBottom: 20 }}><div style={{ height: 4, background: 'var(--ud-border)', borderRadius: 99, overflow: 'hidden' }}><div style={{ height: '100%', width: '60%', background: 'var(--ud-gold)', borderRadius: 99, animation: 'ud-bounce 1.4s ease-in-out infinite' }} /></div><div style={{ fontSize: 12, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', marginTop: 8 }}>Analysing document sensitivity…</div></div>}

      {result && style && (
        <div style={{ marginBottom: 24 }}>
          {/* Classification banner */}
          <div style={{ padding: '20px 24px', background: style.bg, border: `1.5px solid ${style.border}`, borderRadius: 'var(--ud-radius-lg)', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
              <div style={{ fontSize: 32 }}>{style.icon}</div>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, color: style.color, letterSpacing: '-0.02em' }}>{result.classification}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ud-muted)', marginTop: 2 }}>Confidence: {result.confidence}%</div>
              </div>
            </div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ud-ink)', lineHeight: 1.6, margin: 0 }}>{result.reasoning}</p>
          </div>

          {/* Indicators */}
          {result.indicators.length > 0 && (
            <div style={{ padding: '14px 18px', background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Sensitivity indicators</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {result.indicators.map((ind, i) => (
                  <span key={i} style={{ fontSize: 12, fontFamily: 'var(--font-body)', color: 'var(--ud-ink)', background: '#fff', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', padding: '4px 10px' }}>{ind}</span>
                ))}
              </div>
            </div>
          )}

          {/* Handling recommendation */}
          <div style={{ padding: '14px 18px', background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', marginBottom: udsBlob ? 12 : 0 }}>
            <div style={{ fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Recommended handling</div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ud-ink)', lineHeight: 1.6, margin: 0 }}>{result.recommended_handling}</p>
          </div>

          {udsBlob && (
            <div style={{ padding: '14px 18px', background: 'var(--ud-teal-2)', border: '1px solid var(--ud-teal)', borderRadius: 'var(--ud-radius-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginTop: 12 }}>
              <div><div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ud-teal)', fontFamily: 'var(--font-body)', marginBottom: 2 }}>Classification embedded in .uds ✓</div><div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)' }}>{udsBlob.name}</div></div>
              <a href={udsBlob.url} download={udsBlob.name} style={{ padding: '10px 18px', background: 'var(--ud-ink)', color: '#fff', fontWeight: 600, fontSize: 13, borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)', textDecoration: 'none', flexShrink: 0 }}>Download .uds →</a>
            </div>
          )}
        </div>
      )}

      <button onClick={run} disabled={!file || processing} style={{ width: '100%', padding: '14px', background: !file || processing ? 'var(--ud-border)' : 'var(--ud-ink)', color: !file || processing ? 'var(--ud-muted)' : '#fff', border: 'none', borderRadius: 'var(--ud-radius)', fontSize: 15, fontWeight: 600, fontFamily: 'var(--font-body)', cursor: !file || processing ? 'not-allowed' : 'pointer' }}>
        {processing ? 'Classifying…' : 'Classify Document'}
      </button>

      <div style={{ marginTop: 40, padding: '16px', background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', fontSize: 12, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', textAlign: 'center' }}>
        Analysis powered by Claude claude-opus-4-5. Part of the <a href="https://ud.hive.baby" style={{ color: 'var(--ud-teal)' }}>Universal Document™</a> ecosystem.
      </div>

      <div style={{ marginTop: '3rem', paddingTop: '2.5rem', borderTop: '1px solid var(--ud-border)' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--ud-ink)', fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>How UD Classify differs from Microsoft Purview and manual labelling</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', marginBottom: '1.5rem', lineHeight: 1.6 }}>Microsoft Purview requires Microsoft 365 and IT policy configuration. Manual classification depends on individual judgement. UD Classify gives AI-reasoned classification in seconds, embedded in the document.</p>
        <div style={{ display: 'grid', gap: '1rem' }}>
          {[
            { title: 'Microsoft Purview Information Protection', body: 'Enterprise information classification platform tied to Microsoft 365. Requires Azure AD, policy configuration, and IT deployment. Not available for standalone documents outside the Microsoft ecosystem.' },
            { title: 'Manual classification', body: 'Relies on the document creator to assess sensitivity correctly. Inconsistent across teams, subject to anchoring bias, and produces no reasoning trail for audit purposes.' },
            { title: 'UD Classify — AI reasoning with classification', body: 'Claude reads the document content and returns a classification (PUBLIC / INTERNAL / CONFIDENTIAL / RESTRICTED) with a specific reasoning trail explaining which content drove the classification decision.' },
            { title: 'UD Classify — label embedded in the document', body: 'The classification label and reasoning are embedded as structured metadata in the output .uds. Any downstream system — DLP, review platform, or document management system — can read the classification without re-processing the content.' },
          ].map(card => (
            <div key={card.title} style={{ background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)', borderRadius: '0.75rem', padding: '1.25rem' }}>
              <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--ud-ink)', fontFamily: 'var(--font-body)', marginBottom: '0.4rem' }}>{card.title}</div>
              <div style={{ fontSize: '0.83rem', color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', lineHeight: 1.6 }}>{card.body}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
