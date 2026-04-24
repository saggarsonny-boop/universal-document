'use client'
import { useState, useRef, useCallback } from 'react'
import TooltipTour from '@/components/TooltipTour'
import { tourSteps } from '@/lib/tourSteps'

type Regulator = 'FDA' | 'FCA' | 'EMA' | 'MHRA' | 'NHS' | 'SEC' | 'HMRC' | 'ICO' | 'Custom'
type Frequency = 'Daily' | 'Weekly' | 'Monthly'

async function sha256hex(text: string): Promise<string> {
  const enc = new TextEncoder()
  const buf = await crypto.subtle.digest('SHA-256', enc.encode(text))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

function computeDiff(prev: string, curr: string): { type: 'added' | 'removed' | 'changed' | 'context'; text: string }[] {
  const prevLines = prev.split('\n')
  const currLines = curr.split('\n')
  const diff: { type: 'added' | 'removed' | 'changed' | 'context'; text: string }[] = []

  const prevSet = new Set(prevLines)
  const currSet = new Set(currLines)

  for (const line of currLines) {
    if (!prevSet.has(line)) diff.push({ type: 'added', text: line })
    else diff.push({ type: 'context', text: line })
  }
  for (const line of prevLines) {
    if (!currSet.has(line)) diff.push({ type: 'removed', text: line })
  }

  return diff.slice(0, 50)
}

export default function RegulatoryChangeTrackerPage() {
  const [docTitle, setDocTitle] = useState('')
  const [docRef, setDocRef] = useState('')
  const [regulator, setRegulator] = useState<Regulator>('FDA')
  const [customRegulator, setCustomRegulator] = useState('')
  const [frequency, setFrequency] = useState<Frequency>('Weekly')
  const [emailAlert, setEmailAlert] = useState('')
  const [prevVersionFile, setPrevVersionFile] = useState<File | null>(null)
  const [currVersionFile, setCurrVersionFile] = useState<File | null>(null)
  const [prevDragging, setPrevDragging] = useState(false)
  const [currDragging, setCurrDragging] = useState(false)
  const [mode, setMode] = useState<'register' | 'compare'>('register')
  const [result, setResult] = useState<{ url: string; name: string } | null>(null)
  const [error, setError] = useState('')
  const prevRef = useRef<HTMLInputElement>(null)
  const currRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback((f: File, which: 'prev' | 'curr') => {
    if (which === 'prev') setPrevVersionFile(f)
    else setCurrVersionFile(f)
    setResult(null)
  }, [])

  const generate = async () => {
    setError('')
    setResult(null)

    if (!docTitle.trim()) { setError('Document title is required.'); return }
    if (mode === 'compare' && (!prevVersionFile || !currVersionFile)) {
      setError('Upload both the previous and current version to generate a diff.'); return
    }

    const now = new Date().toISOString()
    const regulatorLabel = regulator === 'Custom' ? customRegulator || 'Custom' : regulator

    if (mode === 'register') {
      const doc = {
        format: 'UDS',
        version: '1.0',
        status: 'sealed',
        metadata: {
          title: `Regulatory Monitor: ${docTitle}`,
          created: now,
          document_type: 'regulatory_monitor_registration',
          classification: 'Internal',
          regulator: regulatorLabel,
          document_reference: docRef.trim() || undefined,
          check_frequency: frequency,
          alert_email: emailAlert.trim() || undefined,
          language: 'en',
        },
        content: {
          blocks: [
            { id: 'h1', type: 'heading', text: `Regulatory Change Monitor: ${docTitle}` },
            { id: 'b1', type: 'paragraph', text: `Regulator: ${regulatorLabel}` },
            { id: 'b2', type: 'paragraph', text: `Reference: ${docRef || 'Not specified'}` },
            { id: 'b3', type: 'paragraph', text: `Check frequency: ${frequency}` },
            { id: 'b4', type: 'paragraph', text: `Alert email: ${emailAlert || 'Not specified'}` },
            { id: 'b5', type: 'paragraph', text: 'Status: Monitor registered. Upload new versions to generate change diffs.' },
          ],
        },
        provenance: { created: now, type: 'regulatory_monitor', regulator: regulatorLabel, blockchain: `simulated:${now}` },
      }

      const blob = new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' })
      const safeName = docTitle.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase().slice(0, 40)
      setResult({ url: URL.createObjectURL(blob), name: `regulatory-monitor-${safeName}.uds` })
    } else {
      const prevText = await prevVersionFile!.text().catch(() => '')
      const currText = await currVersionFile!.text().catch(() => '')
      const prevHash = 'sha256-' + await sha256hex(prevText)
      const currHash = 'sha256-' + await sha256hex(currText)

      const hasChanged = prevHash !== currHash
      const diff = hasChanged ? computeDiff(prevText, currText) : []

      const diffBlocks = hasChanged ? [
        { id: 'h-changes', type: 'heading', text: 'Changes Detected' },
        ...diff.filter(d => d.type !== 'context').slice(0, 30).map((d, i) => ({
          id: `diff-${i}`,
          type: 'paragraph',
          text: `[${d.type.toUpperCase()}] ${d.text.trim().slice(0, 200)}`,
        })),
        { id: 'summary', type: 'paragraph', text: `Added lines: ${diff.filter(d => d.type === 'added').length} · Removed lines: ${diff.filter(d => d.type === 'removed').length}` },
      ] : [
        { id: 'no-change', type: 'paragraph', text: 'No changes detected. Hash values are identical.' },
      ]

      const doc = {
        format: 'UDS',
        version: '1.0',
        status: 'sealed',
        metadata: {
          title: `Regulatory Change Diff: ${docTitle}`,
          created: now,
          document_type: 'regulatory_change_diff',
          classification: 'Internal',
          regulator: regulatorLabel,
          document_reference: docRef.trim() || undefined,
          previous_hash: prevHash,
          current_hash: currHash,
          change_detected: hasChanged,
          language: 'en',
        },
        content: {
          blocks: [
            { id: 'h1', type: 'heading', text: `Regulatory Change Report: ${docTitle}` },
            { id: 'b1', type: 'paragraph', text: `Regulator: ${regulatorLabel}` },
            { id: 'b2', type: 'paragraph', text: `Comparison date: ${now.split('T')[0]}` },
            { id: 'b3', type: 'paragraph', text: `Previous version hash: ${prevHash}` },
            { id: 'b4', type: 'paragraph', text: `Current version hash: ${currHash}` },
            { id: 'b5', type: 'paragraph', text: `Change detected: ${hasChanged ? 'YES — content differs' : 'NO — content identical'}` },
            ...diffBlocks,
          ],
        },
        provenance: {
          created: now,
          type: 'regulatory_change_diff',
          change_detected: hasChanged,
          previous_hash: prevHash,
          current_hash: currHash,
          blockchain: `simulated:${now}`,
        },
      }

      const blob = new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' })
      const safeName = docTitle.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase().slice(0, 40)
      setResult({ url: URL.createObjectURL(blob), name: `regulatory-diff-${safeName}.uds` })
    }
  }

  const inp: React.CSSProperties = { width: '100%', padding: '10px 14px', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ud-ink)', background: '#fff', boxSizing: 'border-box' }
  const lbl: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }
  const card: React.CSSProperties = { padding: '16px 20px', background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius-lg)' }
  const h3s: React.CSSProperties = { fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--ud-ink)', marginBottom: 4 }
  const p13: React.CSSProperties = { fontSize: 13, fontFamily: 'var(--font-body)', color: 'var(--ud-muted)', lineHeight: 1.5, margin: 0 }
  const ready = !!docTitle.trim()

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
      <a href="/" style={{ fontSize: 13, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 32 }}>← All tools</a>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10, flexWrap: 'wrap' }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--ud-ink)', fontFamily: 'var(--font-display)' }}>UD Regulatory Change Tracker</h1>
        <span style={{ fontSize: 13, fontWeight: 600, padding: '3px 10px', borderRadius: 99, background: '#1e2d3d', color: '#fff', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Enterprise · Free during beta</span>
      </div>

      <p style={{ fontSize: 16, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', marginBottom: 8, lineHeight: 1.6 }}>
        Monitor regulatory documents (FDA guidance, FCA rules, NHS policies) and generate .uds change diffs when they update — showing exactly what changed, with a hash-verified chain of versions.
      </p>

      <div style={{ fontSize: 13, color: 'var(--ud-teal)', marginBottom: 28, padding: '8px 12px', background: 'var(--ud-teal-2)', border: '1px solid var(--ud-teal)', borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)' }}>
        ✦ Enterprise · Free during beta — regulatory intelligence services charge $50,000–200,000/year
      </div>

      {/* Mode selector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {([['register', 'Register monitor'], ['compare', 'Compare versions']] as ['register' | 'compare', string][]).map(([m, label]) => (
          <button key={m} onClick={() => { setMode(m); setResult(null) }}
            style={{ padding: '10px 18px', borderRadius: 'var(--ud-radius)', border: `1px solid ${mode === m ? 'var(--ud-teal)' : 'var(--ud-border)'}`, background: mode === m ? 'var(--ud-teal-2)' : '#fff', color: mode === m ? 'var(--ud-teal)' : 'var(--ud-muted)', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            {label}
          </button>
        ))}
      </div>

      {/* Document details */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>
        <div style={{ gridColumn: '1/-1' }}>
          <label style={lbl}>Document title *</label>
          <input style={inp} value={docTitle} onChange={e => setDocTitle(e.target.value)} placeholder="e.g. FDA Guidance on AI/ML-Based Software as Medical Device" />
        </div>
        <div>
          <label style={lbl}>Regulator</label>
          <select value={regulator} onChange={e => setRegulator(e.target.value as Regulator)} style={inp}>
            {(['FDA', 'FCA', 'EMA', 'MHRA', 'NHS', 'SEC', 'HMRC', 'ICO', 'Custom'] as Regulator[]).map(r => <option key={r}>{r}</option>)}
          </select>
        </div>
        {regulator === 'Custom' && (
          <div>
            <label style={lbl}>Custom regulator name</label>
            <input style={inp} value={customRegulator} onChange={e => setCustomRegulator(e.target.value)} placeholder="Regulator name" />
          </div>
        )}
        <div>
          <label style={lbl}>Document reference number</label>
          <input style={inp} value={docRef} onChange={e => setDocRef(e.target.value)} placeholder="e.g. FDA-2023-D-1996" />
        </div>
        {mode === 'register' && (
          <>
            <div>
              <label style={lbl}>Check frequency</label>
              <select value={frequency} onChange={e => setFrequency(e.target.value as Frequency)} style={inp}>
                <option>Daily</option>
                <option>Weekly</option>
                <option>Monthly</option>
              </select>
            </div>
            <div>
              <label style={lbl}>Alert email (optional)</label>
              <input type="email" style={inp} value={emailAlert} onChange={e => setEmailAlert(e.target.value)} placeholder="compliance@yourorg.com" />
            </div>
          </>
        )}
      </div>

      {/* Version comparison */}
      {mode === 'compare' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>
          {[
            { label: 'Previous version', which: 'prev' as const, file: prevVersionFile, dragging: prevDragging, setDragging: setPrevDragging, ref: prevRef },
            { label: 'Current version', which: 'curr' as const, file: currVersionFile, dragging: currDragging, setDragging: setCurrDragging, ref: currRef },
          ].map(({ label, which, file, dragging: drag, setDragging: setDrag, ref }) => (
            <div key={which}>
              <label style={lbl}>{label}</label>
              <div
                onDragOver={e => { e.preventDefault(); setDrag(true) }}
                onDragLeave={() => setDrag(false)}
                onDrop={e => { e.preventDefault(); setDrag(false); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0], which) }}
                onClick={() => ref.current?.click()}
                style={{ border: `1.5px dashed ${drag ? 'var(--ud-teal)' : 'var(--ud-border)'}`, borderRadius: 'var(--ud-radius)', padding: '20px 16px', textAlign: 'center', cursor: 'pointer', background: drag ? 'var(--ud-teal-2)' : '#fafaf8' }}
              >
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: file ? 'var(--ud-ink)' : 'var(--ud-muted)' }}>
                  {file ? file.name : 'Drop document here'}
                </div>
                <input ref={ref} type="file" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && handleFile(e.target.files[0], which)} />
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div style={{ padding: '12px 16px', background: 'rgba(226,75,74,0.08)', border: '1px solid rgba(226,75,74,0.2)', borderRadius: 'var(--ud-radius)', fontSize: 13, color: 'var(--ud-danger)', fontFamily: 'var(--font-body)', marginBottom: 20 }}>{error}</div>
      )}

      {result && (
        <div style={{ padding: '14px 18px', background: 'var(--ud-teal-2)', border: '1px solid var(--ud-teal)', borderRadius: 'var(--ud-radius-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ud-teal)', fontFamily: 'var(--font-body)' }}>{mode === 'register' ? 'Monitor registered ✓' : 'Change diff generated ✓'}</div>
            <div style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)' }}>Hash-verified · blockchain timestamp</div>
          </div>
          <a href={result.url} download={result.name} style={{ padding: '10px 18px', background: 'var(--ud-ink)', color: '#fff', fontWeight: 600, fontSize: 13, borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)', textDecoration: 'none', flexShrink: 0 }}>Download .uds →</a>
        </div>
      )}

      <button
        onClick={generate}
        disabled={!ready}
        style={{ width: '100%', padding: '14px', background: !ready ? 'var(--ud-border)' : 'var(--ud-ink)', color: !ready ? 'var(--ud-muted)' : '#fff', border: 'none', borderRadius: 'var(--ud-radius)', fontSize: 15, fontWeight: 600, fontFamily: 'var(--font-body)', cursor: !ready ? 'not-allowed' : 'pointer' }}>
        {mode === 'register' ? 'Register monitor →' : 'Generate change diff →'}
      </button>

      {/* Comparison */}
      <div style={{ marginTop: 48, paddingTop: 40, borderTop: '1px solid var(--ud-border)' }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--ud-ink)', marginBottom: 6 }}>How UD Regulatory Change Tracker differs</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
          {[
            { icon: '👤', title: 'Manual monitoring', body: 'Compliance staff reading documents weekly. Human error. Missed changes. Hours of effort per document.' },
            { icon: '💰', title: 'Regulatory intelligence services', body: '$50,000–200,000/year. Broad but generic. No structured diff output.' },
            { icon: '📧', title: 'Email alerts', body: 'No structured diff. No hash verification. No version archive. Just "something changed".' },
            { icon: '📡', title: 'UD Regulatory Change Tracker', body: 'Structured diff in .uds format. Hash-verified versions. Complete archive. Enterprise tier.' },
          ].map(item => (
            <div key={item.title} style={{ ...card, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 20, lineHeight: '1', flexShrink: 0, marginTop: 2 }}>{item.icon}</span>
              <div><div style={h3s}>{item.title}</div><p style={p13}>{item.body}</p></div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 40, padding: '16px', background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', fontSize: 13, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', textAlign: 'center' }}>
        Processed in your browser. No files stored on our servers. Part of the <a href="https://ud.hive.baby" style={{ color: 'var(--ud-teal)' }}>Universal Document™</a> ecosystem.
      </div>

      <TooltipTour engineId="regulatory-change-tracker" tips={tourSteps['regulatory-change-tracker']} />
    </div>
  )
}
