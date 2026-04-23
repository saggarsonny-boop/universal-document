'use client'
import { useState, useRef, useCallback } from 'react'

const CLASSIFICATIONS = ['', 'PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED'] as const

interface Meta {
  title: string
  author: string
  classification: string
  audience: string
  jurisdiction: string
  description: string
  custom: { key: string; value: string }[]
}

export default function MetadataEditor() {
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [docJson, setDocJson] = useState<Record<string, unknown> | null>(null)
  const [meta, setMeta] = useState<Meta>({ title: '', author: '', classification: '', audience: '', jurisdiction: '', description: '', custom: [] })
  const [result, setResult] = useState<{ url: string; name: string } | null>(null)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback((f: File | null) => {
    if (!f) return
    setFile(f); setResult(null); setError('')
    f.text().then(text => {
      try {
        const doc = JSON.parse(text) as Record<string, unknown>
        setDocJson(doc)
        const prov = typeof doc.provenance === 'object' && doc.provenance ? doc.provenance as Record<string, unknown> : {}
        const custom: { key: string; value: string }[] = []
        if (typeof doc.custom_fields === 'object' && doc.custom_fields) {
          for (const [k, v] of Object.entries(doc.custom_fields as Record<string, unknown>)) {
            custom.push({ key: k, value: String(v) })
          }
        }
        setMeta({
          title: (doc.title as string) ?? '',
          author: (doc.author as string) ?? (prov.created_by as string) ?? '',
          classification: (doc.classification as string) ?? '',
          audience: (doc.audience as string) ?? '',
          jurisdiction: (doc.jurisdiction as string) ?? '',
          description: (doc.description as string) ?? '',
          custom,
        })
      } catch {
        setError('File does not appear to be a valid .uds or .udr file.')
      }
    })
  }, [])

  const onDrop = useCallback((e: React.DragEvent) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]) }, [handleFile])

  const addCustomField = () => setMeta(m => ({ ...m, custom: [...m.custom, { key: '', value: '' }] }))
  const removeCustomField = (i: number) => setMeta(m => ({ ...m, custom: m.custom.filter((_, j) => j !== i) }))
  const updateCustomField = (i: number, field: 'key' | 'value', val: string) =>
    setMeta(m => ({ ...m, custom: m.custom.map((c, j) => j === i ? { ...c, [field]: val } : c) }))

  const save = () => {
    if (!docJson || !file) return
    setError(''); setResult(null)
    try {
      const now = new Date().toISOString()
      const customFields = meta.custom.filter(c => c.key.trim()).reduce((acc, c) => ({ ...acc, [c.key.trim()]: c.value }), {} as Record<string, string>)
      const updated: Record<string, unknown> = {
        ...docJson,
        ...(meta.title && { title: meta.title }),
        ...(meta.author && { author: meta.author }),
        ...(meta.classification && { classification: meta.classification }),
        ...(meta.audience && { audience: meta.audience }),
        ...(meta.jurisdiction && { jurisdiction: meta.jurisdiction }),
        ...(meta.description && { description: meta.description }),
        ...(Object.keys(customFields).length > 0 && { custom_fields: { ...(typeof docJson.custom_fields === 'object' && docJson.custom_fields ? docJson.custom_fields as Record<string, unknown> : {}), ...customFields } }),
        provenance: {
          ...(typeof docJson.provenance === 'object' && docJson.provenance ? docJson.provenance as Record<string, unknown> : {}),
          last_modified_at: now,
          last_modified_by: meta.author || undefined,
        },
      }

      const blob = new Blob([JSON.stringify(updated, null, 2)], { type: 'application/json' })
      const name = file.name.replace(/\.(uds|udr)$/, '') + '-edited.uds'
      setResult({ url: URL.createObjectURL(blob), name })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update metadata')
    }
  }

  const fieldStyle = { width: '100%', padding: '10px 14px', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)' as const, fontSize: 14, color: 'var(--ud-ink)', background: '#fff', boxSizing: 'border-box' as const }
  const labelStyle = { display: 'block' as const, fontSize: 12, fontWeight: 600 as const, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: 8 }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
      <a href="/" style={{ fontSize: 13, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 32 }}>← All tools</a>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--ud-ink)', fontFamily: 'var(--font-display)' }}>UD Metadata Editor</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 99, background: 'var(--ud-gold-3)', color: 'var(--ud-gold)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Pro</span>
          <span style={{ fontSize: 9, color: 'var(--ud-muted)', fontFamily: 'var(--font-mono)', paddingLeft: 10 }}>Free during beta</span>
        </div>
      </div>
      <p style={{ fontSize: 16, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', marginBottom: 32, lineHeight: 1.6 }}>
        Edit structured metadata on any Universal Document™: title, author, classification, audience, jurisdiction, description, and custom fields. All changes are recorded in provenance.
      </p>

      <div style={{ border: `1.5px dashed ${dragging ? 'var(--ud-teal)' : 'var(--ud-border-2)'}`, borderRadius: 'var(--ud-radius-xl)', padding: '40px 24px', textAlign: 'center', cursor: 'pointer', background: dragging ? 'var(--ud-teal-2)' : 'var(--ud-paper-2)', transition: 'all 0.2s', marginBottom: 28 }}
        onDragOver={e => { e.preventDefault(); setDragging(true) }} onDragLeave={() => setDragging(false)} onDrop={onDrop} onClick={() => !docJson ? inputRef.current?.click() : undefined}>
        <input ref={inputRef} type="file" accept=".uds,.udr" style={{ display: 'none' }} onChange={e => handleFile(e.target.files?.[0] ?? null)} />
        {file
          ? <div><div style={{ fontSize: 14, color: 'var(--ud-ink)', fontFamily: 'var(--font-body)' }}>✏️ {file.name}</div><div style={{ fontSize: 12, color: 'var(--ud-teal)', marginTop: 6, fontFamily: 'var(--font-body)', cursor: 'pointer' }} onClick={e => { e.stopPropagation(); inputRef.current?.click() }}>Click to replace file</div></div>
          : <div><div style={{ fontSize: 32, marginBottom: 12 }}>✏️</div><div style={{ fontSize: 15, color: 'var(--ud-ink)', fontWeight: 600, marginBottom: 6, fontFamily: 'var(--font-body)' }}>Drop your .uds file here</div><div style={{ fontSize: 13, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)' }}>or click to browse · .uds .udr</div></div>}
      </div>

      {error && <div style={{ padding: '12px 16px', background: 'rgba(226,75,74,0.08)', border: '1px solid rgba(226,75,74,0.2)', borderRadius: 'var(--ud-radius)', fontSize: 13, color: 'var(--ud-danger)', fontFamily: 'var(--font-body)', marginBottom: 20 }}>{error}</div>}

      {docJson && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div><label style={labelStyle}>Title</label><input style={fieldStyle} value={meta.title} onChange={e => setMeta(m => ({ ...m, title: e.target.value }))} placeholder="Document title" /></div>
            <div><label style={labelStyle}>Author</label><input style={fieldStyle} value={meta.author} onChange={e => setMeta(m => ({ ...m, author: e.target.value }))} placeholder="Author name" /></div>
            <div>
              <label style={labelStyle}>Classification</label>
              <select style={{ ...fieldStyle, cursor: 'pointer' }} value={meta.classification} onChange={e => setMeta(m => ({ ...m, classification: e.target.value }))}>
                <option value="">— Select —</option>
                {CLASSIFICATIONS.filter(Boolean).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div><label style={labelStyle}>Audience</label><input style={fieldStyle} value={meta.audience} onChange={e => setMeta(m => ({ ...m, audience: e.target.value }))} placeholder="e.g. Internal staff, Patients..." /></div>
            <div><label style={labelStyle}>Jurisdiction</label><input style={fieldStyle} value={meta.jurisdiction} onChange={e => setMeta(m => ({ ...m, jurisdiction: e.target.value }))} placeholder="e.g. England and Wales, US-CA..." /></div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Description</label>
            <textarea style={{ ...fieldStyle, minHeight: 80, resize: 'vertical' }} value={meta.description} onChange={e => setMeta(m => ({ ...m, description: e.target.value }))} placeholder="Brief description of this document" />
          </div>

          {/* Custom fields */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <label style={{ ...labelStyle, marginBottom: 0 }}>Custom fields</label>
              <button onClick={addCustomField} style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--ud-teal)', background: 'none', border: '1px solid var(--ud-teal)', borderRadius: 'var(--ud-radius)', padding: '4px 10px', cursor: 'pointer' }}>+ Add field</button>
            </div>
            {meta.custom.map((c, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 10, marginBottom: 10, alignItems: 'center' }}>
                <input style={fieldStyle} value={c.key} onChange={e => updateCustomField(i, 'key', e.target.value)} placeholder="Field name" />
                <input style={fieldStyle} value={c.value} onChange={e => updateCustomField(i, 'value', e.target.value)} placeholder="Value" />
                <button onClick={() => removeCustomField(i)} style={{ padding: '10px 12px', background: 'rgba(226,75,74,0.08)', border: '1px solid rgba(226,75,74,0.2)', borderRadius: 'var(--ud-radius)', color: 'var(--ud-danger)', cursor: 'pointer', fontSize: 14 }}>×</button>
              </div>
            ))}
          </div>

          {result && (
            <div style={{ padding: '14px 18px', background: 'var(--ud-teal-2)', border: '1px solid var(--ud-teal)', borderRadius: 'var(--ud-radius-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 20 }}>
              <div><div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ud-teal)', fontFamily: 'var(--font-body)', marginBottom: 2 }}>Metadata updated ✓</div><div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)' }}>{result.name}</div></div>
              <a href={result.url} download={result.name} style={{ padding: '10px 18px', background: 'var(--ud-ink)', color: '#fff', fontWeight: 600, fontSize: 13, borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)', textDecoration: 'none', flexShrink: 0 }}>Download .uds →</a>
            </div>
          )}

          <button onClick={save} style={{ width: '100%', padding: '14px', background: 'var(--ud-ink)', color: '#fff', border: 'none', borderRadius: 'var(--ud-radius)', fontSize: 15, fontWeight: 600, fontFamily: 'var(--font-body)', cursor: 'pointer' }}>
            Save Metadata
          </button>
        </div>
      )}

      {!docJson && (
        <div style={{ textAlign: 'center', padding: '20px', color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', fontSize: 14 }}>
          Upload a .uds file to start editing its metadata.
        </div>
      )}

      <div style={{ marginTop: 40, padding: '16px', background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', fontSize: 12, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', textAlign: 'center' }}>
        Runs entirely in your browser. No data is sent to any server. Part of the <a href="https://ud.hive.baby" style={{ color: 'var(--ud-teal)' }}>Universal Document™</a> ecosystem.
      </div>
    </div>
  )
}
