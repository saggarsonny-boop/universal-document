'use client'
import { useState, useRef, useCallback } from 'react'
import TooltipTour from '@/components/TooltipTour'
import { tourSteps } from '@/lib/tourSteps'

const CONTRACT_TYPES = ['NDA', 'Service Agreement', 'Employment', 'Lease', 'Licensing', 'Other']

export default function ContractIntelligencePage() {
  const [file, setFile] = useState<File | null>(null)
  const [contractType, setContractType] = useState('Other')
  const [dragging, setDragging] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<{ url: string; name: string } | null>(null)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback((f: File) => {
    setFile(f)
    setResult(null)
    setError('')
  }, [])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }, [handleFile])

  const analyse = async () => {
    if (!file) { setError('Upload a contract to analyse.'); return }
    setError('')
    setResult(null)
    setProcessing(true)
    setProgress(10)

    try {
      const form = new FormData()
      form.append('file', file)
      form.append('contractType', contractType)

      setProgress(30)
      const res = await fetch('/api/contract-intelligence', { method: 'POST', body: form })
      setProgress(85)

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Analysis failed' }))
        throw new Error(err.error || 'Analysis failed')
      }

      const blob = await res.blob()
      const cd = res.headers.get('Content-Disposition') || ''
      const nameMatch = cd.match(/filename="([^"]+)"/)
      const name = nameMatch?.[1] || `contract-intelligence-${file.name}.uds`
      setResult({ url: URL.createObjectURL(blob), name })
      setProgress(100)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Analysis failed. Please try again.')
    }
    setProcessing(false)
  }

  const inp: React.CSSProperties = { width: '100%', padding: '10px 14px', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ud-ink)', background: '#fff', boxSizing: 'border-box' }
  const lbl: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }
  const card: React.CSSProperties = { padding: '16px 20px', background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius-lg)' }
  const h3s: React.CSSProperties = { fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--ud-ink)', marginBottom: 4 }
  const p13: React.CSSProperties = { fontSize: 13, fontFamily: 'var(--font-body)', color: 'var(--ud-muted)', lineHeight: 1.5, margin: 0 }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
      <a href="/" style={{ fontSize: 13, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 32 }}>← All tools</a>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10, flexWrap: 'wrap' }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--ud-ink)', fontFamily: 'var(--font-display)' }}>UD Contract Intelligence</h1>
        <span style={{ fontSize: 13, fontWeight: 600, padding: '3px 10px', borderRadius: 99, background: 'var(--ud-gold-3)', color: 'var(--ud-gold)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Pro · Free during beta</span>
      </div>

      <p style={{ fontSize: 16, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', marginBottom: 8, lineHeight: 1.6 }}>
        Upload any contract. Claude extracts every key date, renewal deadline, obligation, and risk flag — embedded as structured metadata in your .uds output. Never miss a contract renewal again.
      </p>

      <div style={{ fontSize: 13, color: 'var(--ud-teal)', marginBottom: 28, padding: '8px 12px', background: 'var(--ud-teal-2)', border: '1px solid var(--ud-teal)', borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)' }}>
        ✦ Pro · Free during beta — no account required
      </div>

      {/* Upload zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        style={{ border: `1.5px dashed ${dragging ? 'var(--ud-teal)' : 'var(--ud-border)'}`, borderRadius: 'var(--ud-radius-lg)', padding: '36px 24px', textAlign: 'center', cursor: 'pointer', background: dragging ? 'var(--ud-teal-2)' : '#fafaf8', marginBottom: 20, transition: 'all 0.15s' }}
      >
        <div style={{ fontSize: 28, marginBottom: 10 }}>📋</div>
        {file ? (
          <div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, color: 'var(--ud-ink)', marginBottom: 4 }}>{file.name}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ud-muted)' }}>{(file.size / 1024).toFixed(1)} KB · Click to change</div>
          </div>
        ) : (
          <div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, color: 'var(--ud-ink)', marginBottom: 4 }}>Drop any contract here</div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ud-muted)' }}>PDF, DOCX, TXT, or .uds · up to 10 MB</div>
          </div>
        )}
        <input ref={inputRef} type="file" accept=".pdf,.docx,.txt,.uds,.json" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
      </div>

      {/* Contract type */}
      <div style={{ marginBottom: 24 }}>
        <label style={lbl}>Contract type</label>
        <select value={contractType} onChange={e => setContractType(e.target.value)} style={{ ...inp }}>
          {CONTRACT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', background: 'rgba(226,75,74,0.08)', border: '1px solid rgba(226,75,74,0.2)', borderRadius: 'var(--ud-radius)', fontSize: 13, color: 'var(--ud-danger)', fontFamily: 'var(--font-body)', marginBottom: 20 }}>{error}</div>
      )}

      {processing && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontFamily: 'var(--font-body)', color: 'var(--ud-muted)', marginBottom: 8 }}>Claude is analysing your contract…</div>
          <div style={{ height: 4, background: 'var(--ud-border)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', background: 'var(--ud-teal)', borderRadius: 2, width: `${progress}%`, transition: 'width 0.4s ease' }} />
          </div>
        </div>
      )}

      {result && (
        <div style={{ padding: '14px 18px', background: 'var(--ud-teal-2)', border: '1px solid var(--ud-teal)', borderRadius: 'var(--ud-radius-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ud-teal)', fontFamily: 'var(--font-body)' }}>Contract analysed ✓</div>
            <div style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)' }}>Key dates, obligations, and risk flags embedded in .uds</div>
          </div>
          <a href={result.url} download={result.name} style={{ padding: '10px 18px', background: 'var(--ud-ink)', color: '#fff', fontWeight: 600, fontSize: 13, borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)', textDecoration: 'none', flexShrink: 0 }}>Download .uds →</a>
        </div>
      )}

      <button
        onClick={analyse}
        disabled={!file || processing}
        style={{ width: '100%', padding: '14px', background: !file || processing ? 'var(--ud-border)' : 'var(--ud-ink)', color: !file || processing ? 'var(--ud-muted)' : '#fff', border: 'none', borderRadius: 'var(--ud-radius)', fontSize: 15, fontWeight: 600, fontFamily: 'var(--font-body)', cursor: !file || processing ? 'not-allowed' : 'pointer' }}>
        {processing ? 'Analysing with Claude…' : 'Analyse contract →'}
      </button>

      {/* What gets extracted */}
      <div style={{ marginTop: 48, marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--ud-ink)', marginBottom: 16 }}>What Claude extracts</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
          {[
            { title: 'Key dates', body: 'Renewal dates, termination deadlines, payment dates, and notice periods.' },
            { title: 'Obligations', body: 'What each party must do, by when, with deadlines flagged.' },
            { title: 'Financial terms', body: 'Payment amounts, frequency, liability caps, and penalties.' },
            { title: 'Risk flags', body: 'Unusual clauses, missing protections, and non-standard terms — rated high/medium/low.' },
          ].map(item => (
            <div key={item.title} style={card}>
              <div style={h3s}>{item.title}</div>
              <p style={p13}>{item.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Comparison */}
      <div style={{ marginTop: 48, paddingTop: 40, borderTop: '1px solid var(--ud-border)' }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--ud-ink)', marginBottom: 6 }}>How UD Contract Intelligence differs</h2>
        <p style={{ fontSize: 14, fontFamily: 'var(--font-body)', color: 'var(--ud-muted)', marginBottom: 20, lineHeight: 1.6 }}>
          Enterprise contract management tools cost $50,000–200,000 per year. UD Contract Intelligence gives you the core extraction capability at Pro tier.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
          {[
            { icon: '⚖️', title: 'Manual review', body: 'Hours of lawyer or paralegal time per contract. Error-prone, expensive, and doesn\'t scale.' },
            { icon: '🏢', title: 'Ironclad / ContractPodAi', body: '$50,000–200,000/year enterprise contracts. Complex implementation, months of onboarding.' },
            { icon: '🤖', title: 'Kira Systems', body: 'Expensive ML platform requiring dedicated implementation teams. Not accessible to SMBs.' },
            { icon: '📋', title: 'UD Contract Intelligence', body: 'Upload, get structured output instantly. Key dates embedded in the .uds file. Pro tier. No implementation required.' },
          ].map(item => (
            <div key={item.title} style={{ ...card, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 20, lineHeight: '1', flexShrink: 0, marginTop: 2 }}>{item.icon}</span>
              <div>
                <div style={h3s}>{item.title}</div>
                <p style={p13}>{item.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 40, padding: '16px', background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', fontSize: 13, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', textAlign: 'center' }}>
        Analysis powered by Claude AI. Files processed in memory — not stored. Part of the <a href="https://ud.hive.baby" style={{ color: 'var(--ud-teal)' }}>Universal Document™</a> ecosystem.
      </div>

      <TooltipTour engineId="contract-intelligence" tips={tourSteps['contract-intelligence']} />
    </div>
  )
}
