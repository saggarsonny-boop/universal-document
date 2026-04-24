'use client'
import { useState, useRef, useCallback } from 'react'
import TooltipTour from '@/components/TooltipTour'
import { tourSteps } from '@/lib/tourSteps'

const TARGET_FORMATS = [
  { value: 'uds', label: '.uds — Universal Document Sealed', desc: 'Seal and make tamper-evident' },
  { value: 'udr', label: '.udr — Universal Document Revisable', desc: 'Convert to editable draft' },
  { value: 'json', label: 'Structured JSON', desc: 'Flatten to plain JSON object' },
]

export default function Reformat() {
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [targetFormat, setTargetFormat] = useState('uds')
  const [stripLayers, setStripLayers] = useState(false)
  const [stripProvenance, setStripProvenance] = useState(false)
  const [result, setResult] = useState<{ url: string; name: string } | null>(null)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback((f: File | null) => { if (!f) return; setFile(f); setResult(null); setError('') }, [])
  const onDrop = useCallback((e: React.DragEvent) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]) }, [handleFile])

  const run = async () => {
    if (!file) return
    setError(''); setResult(null)
    try {
      const text = await file.text()
      let doc: Record<string, unknown>
      try { doc = JSON.parse(text) } catch { throw new Error('File must be valid JSON (.uds or .udr)') }

      const now = new Date().toISOString()
      const baseName = file.name.replace(/\.[^.]+$/, '')

      if (targetFormat === 'json') {
        const out: Record<string, unknown> = { ...doc }
        if (stripLayers) { delete out.clarity_layers }
        if (stripProvenance) { delete out.provenance; delete out._manifest }
        const blob = new Blob([JSON.stringify(out, null, 2)], { type: 'application/json' })
        setResult({ url: URL.createObjectURL(blob), name: `${baseName}-reformatted.json` })
        return
      }

      const out: Record<string, unknown> = {
        ...doc,
        format: targetFormat === 'uds' ? 'UDS' : 'UDR',
        status: targetFormat === 'uds' ? 'sealed' : 'draft',
      }
      if (stripLayers) delete out.clarity_layers
      if (stripProvenance) { delete out.provenance; delete out._manifest }
      if (!stripProvenance) {
        out.provenance = { ...(doc.provenance as Record<string, unknown> || {}), reformatted_at: now, reformatted_from: doc.format, reformatted_to: targetFormat.toUpperCase() }
      }
      const blob = new Blob([JSON.stringify(out, null, 2)], { type: 'application/json' })
      setResult({ url: URL.createObjectURL(blob), name: `${baseName}.${targetFormat}` })
    } catch (err: unknown) { setError(err instanceof Error ? err.message : 'Reformat failed') }
  }

  const inp = { width: '100%', padding: '10px 14px', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ud-ink)', background: '#fff', boxSizing: 'border-box' as const }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
      <a href="/" style={{ fontSize: 13, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 32 }}>← All tools</a>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--ud-ink)', fontFamily: 'var(--font-display)' }}>UD Reformat</h1>
        <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 99, background: 'var(--ud-teal-2)', color: 'var(--ud-teal)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Free</span>
      </div>
      <p style={{ fontSize: 16, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', marginBottom: 32, lineHeight: 1.6 }}>Convert any Universal Document™ between formats: .uds ↔ .udr ↔ JSON. Optionally strip clarity layers or provenance metadata.</p>

      <div style={{ border: `1.5px dashed ${dragging ? 'var(--ud-teal)' : 'var(--ud-border-2)'}`, borderRadius: 'var(--ud-radius-xl)', padding: '36px 24px', textAlign: 'center', cursor: 'pointer', background: dragging ? 'var(--ud-teal-2)' : 'var(--ud-paper-2)', transition: 'all 0.2s', marginBottom: 24 }}
        onDragOver={e => { e.preventDefault(); setDragging(true) }} onDragLeave={() => setDragging(false)} onDrop={onDrop} onClick={() => inputRef.current?.click()}>
        <input ref={inputRef} type="file" accept=".uds,.udr,.udz,.json" style={{ display: 'none' }} onChange={e => handleFile(e.target.files?.[0] ?? null)} />
        {file ? <div style={{ fontSize: 14, color: 'var(--ud-ink)', fontFamily: 'var(--font-body)' }}>📄 {file.name} · <span style={{ color: 'var(--ud-teal)' }}>Click to replace</span></div>
          : <><div style={{ fontSize: 28, marginBottom: 8 }}>⇄</div><div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ud-ink)', fontFamily: 'var(--font-body)' }}>Drop a .uds, .udr, or .udz file</div></>}
      </div>

      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Target format</div>
        {TARGET_FORMATS.map(f => (
          <label key={f.value} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 14px', background: targetFormat === f.value ? 'var(--ud-teal-2)' : '#fff', border: `1px solid ${targetFormat === f.value ? 'var(--ud-teal)' : 'var(--ud-border)'}`, borderRadius: 'var(--ud-radius)', marginBottom: 8, cursor: 'pointer', transition: 'all 0.15s' }}>
            <input type="radio" name="fmt" value={f.value} checked={targetFormat === f.value} onChange={() => setTargetFormat(f.value)} style={{ marginTop: 2 }} />
            <div><div style={{ fontSize: 14, fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--ud-ink)' }}>{f.label}</div><div style={{ fontSize: 12, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', marginTop: 2 }}>{f.desc}</div></div>
          </label>
        ))}
      </div>

      <div style={{ background: '#fff', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', padding: '14px 16px', marginBottom: 24 }}>
        <div style={{ fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Options</div>
        {[['stripLayers', 'Strip clarity layers (summaries, translations)', stripLayers, setStripLayers], ['stripProvenance', 'Strip provenance & manifest metadata', stripProvenance, setStripProvenance]].map(([id, label, val, setter]) => (
          <label key={id as string} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: 8 }}>
            <input type="checkbox" checked={val as boolean} onChange={e => (setter as (v: boolean) => void)(e.target.checked)} style={{ width: 15, height: 15 }} />
            <span style={{ fontSize: 13, color: 'var(--ud-ink)', fontFamily: 'var(--font-body)' }}>{label as string}</span>
          </label>
        ))}
      </div>

      {error && <div style={{ padding: '12px 16px', background: 'rgba(226,75,74,0.08)', border: '1px solid rgba(226,75,74,0.2)', borderRadius: 'var(--ud-radius)', fontSize: 13, color: 'var(--ud-danger)', fontFamily: 'var(--font-body)', marginBottom: 20 }}>{error}</div>}
      {result && (
        <div style={{ padding: '14px 18px', background: 'var(--ud-teal-2)', border: '1px solid var(--ud-teal)', borderRadius: 'var(--ud-radius-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <div><div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ud-teal)', fontFamily: 'var(--font-body)' }}>Reformatted ✓</div><div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)' }}>{result.name}</div></div>
          <a href={result.url} download={result.name} style={{ padding: '10px 18px', background: 'var(--ud-ink)', color: '#fff', fontWeight: 600, fontSize: 13, borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)', textDecoration: 'none', flexShrink: 0 }}>Download →</a>
        </div>
      )}
      <button onClick={run} disabled={!file} style={{ width: '100%', padding: '14px', background: !file ? 'var(--ud-border)' : 'var(--ud-ink)', color: !file ? 'var(--ud-muted)' : '#fff', border: 'none', borderRadius: 'var(--ud-radius)', fontSize: 15, fontWeight: 600, fontFamily: 'var(--font-body)', cursor: !file ? 'not-allowed' : 'pointer' }}>Reformat Document</button>
      <div style={{ marginTop: 40, padding: '16px', background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', fontSize: 12, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', textAlign: 'center' }}>
        Runs in your browser. No data sent to any server. Part of the <a href="https://ud.hive.baby" style={{ color: 'var(--ud-teal)' }}>Universal Document™</a> ecosystem.
      </div>
      <TooltipTour engineId="reformat" tips={tourSteps['reformat']} />
    </div>
  )
}
