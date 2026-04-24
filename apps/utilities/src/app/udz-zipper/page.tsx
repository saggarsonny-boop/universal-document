'use client'
import { useState, useRef, useCallback } from 'react'
import TooltipTour from '@/components/TooltipTour'
import { tourSteps } from '@/lib/tourSteps'

export default function UDZZipper() {
  const [files, setFiles] = useState<File[]>([])
  const [dragging, setDragging] = useState(false)
  const [bundleTitle, setBundleTitle] = useState('')
  const [bundleDesc, setBundleDesc] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [result, setResult] = useState<{ url: string; name: string; count: number } | null>(null)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = (incoming: FileList | null) => {
    if (!incoming) return
    const arr = Array.from(incoming)
    setFiles(prev => {
      const names = new Set(prev.map(f => f.name))
      return [...prev, ...arr.filter(f => !names.has(f.name))]
    })
    setResult(null)
    setError('')
  }

  const remove = (name: string) => setFiles(prev => prev.filter(f => f.name !== name))

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    handleFiles(e.dataTransfer.files)
  }, [])

  const zip = async () => {
    if (files.length === 0) return
    setError('')
    setResult(null)
    try {
      const docs: Record<string, unknown>[] = []
      for (const f of files) {
        const text = await f.text()
        let parsed: unknown
        try { parsed = JSON.parse(text) } catch { throw new Error(`${f.name} does not appear to be a valid .uds file.`) }
        docs.push(parsed as Record<string, unknown>)
      }

      const now = new Date().toISOString()
      const bundle = {
        format: 'UDZ',
        version: '1.0',
        title: bundleTitle || 'Untitled Bundle',
        description: bundleDesc || undefined,
        created_at: now,
        ...(expiresAt ? { expires_at: new Date(expiresAt).toISOString() } : {}),
        document_count: docs.length,
        documents: docs.map((doc, i) => ({
          index: i,
          filename: files[i].name,
          document: doc,
        })),
        provenance: {
          bundled_at: now,
          bundled_by: 'UD Utilities · utilities.hive.baby',
        },
      }

      const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const name = (bundleTitle || 'bundle').toLowerCase().replace(/[^a-z0-9]+/g, '-') + '.udz'
      setResult({ url, name, count: docs.length })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Bundling failed')
    }
  }

  const field = (label: string, node: React.ReactNode) => (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--ud-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{label}</label>
      {node}
    </div>
  )
  const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 14px', background: '#fff', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', color: 'var(--ud-ink)', fontSize: 14, fontFamily: 'var(--font-body)', outline: 'none', boxSizing: 'border-box' }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
      <a href="/" style={{ fontSize: 13, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 32 }}>
        ← All tools
      </a>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--ud-ink)', fontFamily: 'var(--font-display)' }}>UDZ Zipper</h1>
        <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 99, background: 'var(--ud-teal-2)', color: 'var(--ud-teal)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>FREE</span>
      </div>
      <p style={{ fontSize: 16, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', marginBottom: 32, lineHeight: 1.6 }}>
        Bundle multiple Universal Document™ files into a single .udz archive. Add a shared title, description, and optional expiration date.
      </p>

      <div
        style={{ border: `1.5px dashed ${dragging ? 'var(--ud-teal)' : 'var(--ud-border-2)'}`, borderRadius: 'var(--ud-radius-xl)', padding: '40px 24px', textAlign: 'center', cursor: 'pointer', background: dragging ? 'var(--ud-teal-2)' : 'var(--ud-paper-2)', transition: 'border-color 0.2s, background 0.2s', marginBottom: 20 }}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input ref={inputRef} type="file" accept=".uds" multiple style={{ display: 'none' }} onChange={e => handleFiles(e.target.files)} />
        <div style={{ fontSize: 28, marginBottom: 10 }}>📦</div>
        <div style={{ fontSize: 15, color: 'var(--ud-ink)', fontWeight: 600, marginBottom: 4, fontFamily: 'var(--font-body)' }}>Drop .uds files here</div>
        <div style={{ fontSize: 13, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)' }}>or click to browse — add multiple files</div>
      </div>

      {files.length > 0 && (
        <div style={{ marginBottom: 24, border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius-lg)', overflow: 'hidden' }}>
          {files.map((f, i) => (
            <div key={f.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', background: i % 2 === 0 ? '#fff' : 'var(--ud-paper-2)', borderBottom: i < files.length - 1 ? '1px solid var(--ud-border)' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)', minWidth: 20 }}>{i + 1}</span>
                <span style={{ fontSize: 13, fontFamily: 'var(--font-body)', color: 'var(--ud-ink)' }}>📄 {f.name}</span>
                <span style={{ fontSize: 11, color: 'var(--ud-muted)', fontFamily: 'var(--font-mono)' }}>({(f.size / 1024).toFixed(0)} KB)</span>
              </div>
              <button onClick={() => remove(f.name)} style={{ background: 'none', border: 'none', color: 'var(--ud-danger)', cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: '2px 6px', borderRadius: 4 }}>×</button>
            </div>
          ))}
        </div>
      )}

      <div style={{ background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius-lg)', padding: '20px 20px 8px', marginBottom: 24 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ud-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>Bundle Details</div>
        {field('Bundle Title', <input style={inputStyle} value={bundleTitle} onChange={e => setBundleTitle(e.target.value)} placeholder="e.g. Q1 2026 Reports" />)}
        {field('Description (optional)', <input style={inputStyle} value={bundleDesc} onChange={e => setBundleDesc(e.target.value)} placeholder="What this bundle contains" />)}
        {field('Shared Expiration (optional)', <input style={{ ...inputStyle, colorScheme: 'light' }} type="date" value={expiresAt} onChange={e => setExpiresAt(e.target.value)} />)}
      </div>

      {error && <div style={{ padding: '12px 16px', background: 'rgba(226,75,74,0.08)', border: '1px solid rgba(226,75,74,0.2)', borderRadius: 'var(--ud-radius)', fontSize: 13, color: 'var(--ud-danger)', fontFamily: 'var(--font-body)', marginBottom: 20 }}>{error}</div>}

      {result && (
        <div style={{ padding: '16px 20px', background: 'var(--ud-teal-2)', border: '1px solid var(--ud-teal)', borderRadius: 'var(--ud-radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, gap: 16 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ud-teal)', fontFamily: 'var(--font-body)', marginBottom: 2 }}>Bundle created — {result.count} documents ✓</div>
            <div style={{ fontSize: 12, color: 'var(--ud-muted)', fontFamily: 'var(--font-mono)' }}>{result.name}</div>
          </div>
          <a href={result.url} download={result.name} style={{ padding: '10px 20px', background: 'var(--ud-ink)', color: '#fff', fontWeight: 600, fontSize: 13, borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)', textDecoration: 'none', flexShrink: 0 }}>Download .udz →</a>
        </div>
      )}

      <button onClick={zip} disabled={files.length === 0} style={{ width: '100%', padding: '14px', background: files.length === 0 ? 'var(--ud-border)' : 'var(--ud-ink)', color: files.length === 0 ? 'var(--ud-muted)' : '#fff', border: 'none', borderRadius: 'var(--ud-radius)', fontSize: 15, fontWeight: 600, fontFamily: 'var(--font-body)', cursor: files.length === 0 ? 'not-allowed' : 'pointer', transition: 'background 0.15s' }}>
        {files.length === 0 ? 'Add .uds files to bundle' : `Create .udz Bundle (${files.length} file${files.length !== 1 ? 's' : ''})`}
      </button>

      <div style={{ marginTop: 40, padding: '16px', background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', fontSize: 12, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', textAlign: 'center' }}>
        Processed entirely in your browser. No data is sent to any server. Part of the <a href="https://ud.hive.baby" style={{ color: 'var(--ud-teal)' }}>Universal Document™</a> ecosystem.
      </div>
      <TooltipTour engineId="udz-zipper" tips={tourSteps['udz-zipper']} />
    </div>
  )
}
