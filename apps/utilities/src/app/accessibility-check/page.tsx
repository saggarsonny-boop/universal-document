'use client'
import { useState, useRef, useCallback } from 'react'

interface Check {
  id: string; label: string; status: 'PASS' | 'FAIL' | 'CANNOT_ASSESS'; wcag: string; note: string
}
interface Report {
  overall: string; score: number; checks: Check[]; summary: string; remediation_steps: string[]
}

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  PASS:          { bg: 'var(--ud-teal-2)',      color: 'var(--ud-teal)',    label: 'PASS' },
  FAIL:          { bg: 'rgba(226,75,74,0.1)',   color: 'var(--ud-danger)',  label: 'FAIL' },
  CANNOT_ASSESS: { bg: 'var(--ud-paper-2)',     color: 'var(--ud-muted)',   label: 'N/A'  },
}

export default function AccessibilityCheck() {
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [report, setReport] = useState<Report | null>(null)
  const [udsBlob, setUdsBlob] = useState<{ url: string; name: string } | null>(null)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (f: File | null) => { if (!f) return; setFile(f); setReport(null); setError(''); setUdsBlob(null) }
  const onDrop = useCallback((e: React.DragEvent) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]) }, [])

  const run = async () => {
    if (!file) return
    setProcessing(true); setError(''); setReport(null); setUdsBlob(null)
    try {
      const form = new FormData(); form.append('file', file)
      const res = await fetch('/api/accessibility-check', { method: 'POST', body: form })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Check failed') }
      const data = await res.json()
      setReport(data.report)
      if (data.uds) {
        const blob = new Blob([data.uds], { type: 'application/json' })
        setUdsBlob({ url: URL.createObjectURL(blob), name: data.filename })
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Check failed')
    } finally { setProcessing(false) }
  }

  const overallColor = report?.overall === 'PASS' ? 'var(--ud-teal)' : report?.overall === 'FAIL' ? 'var(--ud-danger)' : 'var(--ud-gold)'

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
      <a href="/" style={{ fontSize: 13, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 32 }}>← All tools</a>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--ud-ink)', fontFamily: 'var(--font-display)' }}>UD Accessibility Check</h1>
        <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 99, background: 'var(--ud-teal-2)', color: 'var(--ud-teal)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>AI · Free during beta</span>
      </div>
      <p style={{ fontSize: 16, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', marginBottom: 32, lineHeight: 1.6 }}>
        Check any document against WCAG 2.1 and Section 508. Covers alt text, heading hierarchy, colour contrast, reading order, and 6 more criteria. If the input is a .uds file, the report is embedded as a Clarity Layer in the output.
      </p>

      <div style={{ border: `1.5px dashed ${dragging ? 'var(--ud-teal)' : 'var(--ud-border-2)'}`, borderRadius: 'var(--ud-radius-xl)', padding: '48px 24px', textAlign: 'center', cursor: 'pointer', background: dragging ? 'var(--ud-teal-2)' : 'var(--ud-paper-2)', transition: 'all 0.2s', marginBottom: 24 }}
        onDragOver={e => { e.preventDefault(); setDragging(true) }} onDragLeave={() => setDragging(false)} onDrop={onDrop} onClick={() => inputRef.current?.click()}>
        <input ref={inputRef} type="file" accept=".uds,.udr,.pdf,.txt,.docx" style={{ display: 'none' }} onChange={e => handleFile(e.target.files?.[0] ?? null)} />
        {file
          ? <div><div style={{ fontSize: 14, color: 'var(--ud-ink)', fontFamily: 'var(--font-body)' }}>♿ {file.name}</div><div style={{ fontSize: 12, color: 'var(--ud-teal)', marginTop: 8, fontFamily: 'var(--font-body)' }}>Click or drop to replace</div></div>
          : <div><div style={{ fontSize: 32, marginBottom: 12 }}>♿</div><div style={{ fontSize: 15, color: 'var(--ud-ink)', fontWeight: 600, marginBottom: 6, fontFamily: 'var(--font-body)' }}>Drop your document here</div><div style={{ fontSize: 13, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)' }}>or click to browse · .uds .pdf .txt</div></div>}
      </div>

      {error && <div style={{ padding: '12px 16px', background: 'rgba(226,75,74,0.08)', border: '1px solid rgba(226,75,74,0.2)', borderRadius: 'var(--ud-radius)', fontSize: 13, color: 'var(--ud-danger)', fontFamily: 'var(--font-body)', marginBottom: 20 }}>{error}</div>}

      {processing && <div style={{ marginBottom: 20 }}><div style={{ height: 4, background: 'var(--ud-border)', borderRadius: 99, overflow: 'hidden' }}><div style={{ height: '100%', width: '60%', background: 'var(--ud-teal)', borderRadius: 99, animation: 'ud-bounce 1.4s ease-in-out infinite' }} /></div><div style={{ fontSize: 12, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', marginTop: 8 }}>Checking against WCAG 2.1 and Section 508…</div></div>}

      {report && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', background: report.overall === 'PASS' ? 'var(--ud-teal-2)' : report.overall === 'FAIL' ? 'rgba(226,75,74,0.08)' : 'var(--ud-gold-3)', border: `1px solid ${overallColor}`, borderRadius: 'var(--ud-radius-lg)', marginBottom: 20 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: overallColor, minWidth: 80 }}>{report.overall}</div>
            <div><div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600, color: overallColor }}>Score: {report.score}/100</div><div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ud-muted)', marginTop: 4 }}>{report.summary}</div></div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 10, marginBottom: 20 }}>
            {report.checks.map(c => {
              const s = STATUS_STYLE[c.status] ?? STATUS_STYLE.CANNOT_ASSESS
              return (
                <div key={c.id} style={{ padding: '12px 14px', background: s.bg, border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)', color: s.color, minWidth: 36, paddingTop: 2 }}>{s.label}</span>
                  <div><div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ud-ink)', fontFamily: 'var(--font-body)', marginBottom: 2 }}>{c.label}</div><div style={{ fontSize: 11, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)' }}>{c.note}</div><div style={{ fontSize: 10, color: 'var(--ud-muted)', fontFamily: 'var(--font-mono)', marginTop: 4 }}>WCAG {c.wcag}</div></div>
                </div>
              )
            })}
          </div>

          {report.remediation_steps.length > 0 && (
            <div style={{ padding: '16px 18px', background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius-lg)', marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Remediation steps</div>
              <ol style={{ margin: 0, paddingLeft: 18 }}>
                {report.remediation_steps.map((s, i) => <li key={i} style={{ fontSize: 13, color: 'var(--ud-ink)', fontFamily: 'var(--font-body)', lineHeight: 1.6, marginBottom: 4 }}>{s}</li>)}
              </ol>
            </div>
          )}

          {udsBlob && (
            <div style={{ padding: '14px 18px', background: 'var(--ud-teal-2)', border: '1px solid var(--ud-teal)', borderRadius: 'var(--ud-radius-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
              <div><div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ud-teal)', fontFamily: 'var(--font-body)', marginBottom: 2 }}>Report embedded in .uds ✓</div><div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)' }}>{udsBlob.name}</div></div>
              <a href={udsBlob.url} download={udsBlob.name} style={{ padding: '10px 18px', background: 'var(--ud-ink)', color: '#fff', fontWeight: 600, fontSize: 13, borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)', textDecoration: 'none', flexShrink: 0 }}>Download .uds →</a>
            </div>
          )}
        </div>
      )}

      <button onClick={run} disabled={!file || processing} style={{ width: '100%', padding: '14px', background: !file || processing ? 'var(--ud-border)' : 'var(--ud-ink)', color: !file || processing ? 'var(--ud-muted)' : '#fff', border: 'none', borderRadius: 'var(--ud-radius)', fontSize: 15, fontWeight: 600, fontFamily: 'var(--font-body)', cursor: !file || processing ? 'not-allowed' : 'pointer' }}>
        {processing ? 'Checking…' : 'Run Accessibility Check'}
      </button>

      <div style={{ marginTop: 40, padding: '16px', background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', fontSize: 12, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', textAlign: 'center' }}>
        Analysis powered by Claude claude-opus-4-5. Part of the <a href="https://ud.hive.baby" style={{ color: 'var(--ud-teal)' }}>Universal Document™</a> ecosystem.
      </div>
    </div>
  )
}
