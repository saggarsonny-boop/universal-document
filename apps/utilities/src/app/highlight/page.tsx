'use client'
import { useState, useRef, useCallback } from 'react'
import TooltipTour from '@/components/TooltipTour'
import { tourSteps } from '@/lib/tourSteps'

const COLORS = [
  { name: 'Gold',   hex: '#c8960a', label: 'Gold'   },
  { name: 'Yellow', hex: '#fbbf24', label: 'Yellow' },
  { name: 'Green',  hex: '#22543d', label: 'Green'  },
  { name: 'Red',    hex: '#9b2335', label: 'Red'    },
  { name: 'Blue',   hex: '#1e40af', label: 'Blue'   },
]

interface HighlightEntry {
  id: number
  text: string
  label: string
  color: string
}

export default function Highlight() {
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [selectedColor, setSelectedColor] = useState('#c8960a')
  const [entries, setEntries] = useState<HighlightEntry[]>([
    { id: 1, text: '', label: '', color: '#c8960a' },
  ])
  const [result, setResult] = useState<{ url: string; name: string } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (f: File | null) => {
    if (!f) return
    setFile(f)
    setResult(null)
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files[0])
  }, [])

  function addEntry() {
    setEntries(prev => [...prev, { id: Date.now(), text: '', label: '', color: selectedColor }])
  }

  function removeEntry(id: number) {
    setEntries(prev => prev.filter(e => e.id !== id))
  }

  function updateEntry(id: number, field: keyof HighlightEntry, value: string) {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, [field]: value } : e))
  }

  function run() {
    if (!file) return
    const now = new Date().toISOString()
    const safeName = file.name.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase().slice(0, 40)

    const doc = {
      format: 'UDS', status: 'sealed',
      title: `${file.name} [Highlighted]`,
      document_type: 'highlighted_document',
      source_file: { name: file.name, size: file.size, type: file.type },
      highlights: entries
        .filter(e => e.text.trim())
        .map((e, i) => ({
          sequence: i + 1,
          text: e.text.trim(),
          label: e.label.trim() || undefined,
          color: e.color,
          color_name: COLORS.find(c => c.hex === e.color)?.name || 'Gold',
          type: 'structural',
          note: 'Structural highlight — embedded in document metadata, not a removable annotation layer.',
        })),
      provenance: {
        created_at: now,
        document_type: 'highlighted_document',
        source: file.name,
        highlight_count: entries.filter(e => e.text.trim()).length,
        generator: 'UD Highlight · utilities.hive.baby',
      },
      _notice: 'Highlights are encoded as structural markers in document metadata. They travel with the file and are tamper-evident. Unlike PDF annotation layers, they cannot be stripped without invalidating the document seal.',
    }

    const blob = new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' })
    setResult({ url: URL.createObjectURL(blob), name: `${safeName}-highlighted.uds` })
  }

  const inp: React.CSSProperties = { width: '100%', padding: '10px 14px', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ud-ink)', background: '#fff', boxSizing: 'border-box' }
  const lbl: React.CSSProperties = { display: 'block', fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }

  const validEntries = entries.filter(e => e.text.trim()).length
  const can = !file || validEntries === 0

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
      <a href="/" style={{ fontSize: 13, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 32 }}>← All tools</a>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--ud-ink)', fontFamily: 'var(--font-display)' }}>UD Highlight</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 99, background: 'var(--ud-gold-3)', color: 'var(--ud-gold)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Pro</span>
          <span style={{ fontSize: 9, color: 'var(--ud-muted)', fontFamily: 'var(--font-mono)', paddingLeft: 10 }}>Free during beta</span>
        </div>
      </div>

      <p style={{ fontSize: 16, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', marginBottom: 12, lineHeight: 1.6 }}>
        Structural document highlighting that travels with the file. Unlike PDF annotation layers — which any reader can strip in seconds — UD highlights are embedded in the document metadata itself, tamper-evident and inseparable from the content.
      </p>
      <div style={{ fontSize: 13, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', marginBottom: 32, lineHeight: 1.6, padding: '12px 16px', background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)' }}>
        Useful for legal document markup and contract highlighting where the annotation must survive version control, sharing, and printing. Removing a structural highlight invalidates the document seal.
      </div>

      {/* File upload */}
      <div
        style={{ border: `1.5px dashed ${dragging ? 'var(--ud-teal)' : 'var(--ud-border-2)'}`, borderRadius: 'var(--ud-radius-xl)', padding: '36px 24px', textAlign: 'center', cursor: 'pointer', background: dragging ? 'var(--ud-teal-2)' : 'var(--ud-paper-2)', transition: 'border-color 0.2s, background 0.2s', marginBottom: 28 }}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input ref={inputRef} type="file" accept=".uds,.udr,.pdf" style={{ display: 'none' }} onChange={e => handleFile(e.target.files?.[0] ?? null)} />
        {file ? (
          <div>
            <div style={{ fontSize: 14, color: 'var(--ud-ink)', fontFamily: 'var(--font-body)', marginBottom: 4 }}>📄 {file.name}</div>
            <div style={{ fontSize: 12, color: 'var(--ud-teal)', marginTop: 8, fontFamily: 'var(--font-body)' }}>Click or drop to replace</div>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🖊</div>
            <div style={{ fontSize: 15, color: 'var(--ud-ink)', fontWeight: 600, marginBottom: 6, fontFamily: 'var(--font-body)' }}>Drop your document here</div>
            <div style={{ fontSize: 13, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)' }}>or click to browse · .uds .udr .pdf</div>
          </div>
        )}
      </div>

      {/* Color picker */}
      <div style={{ marginBottom: 28 }}>
        <label style={lbl}>Default highlight color</label>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {COLORS.map(c => (
            <button
              key={c.hex}
              onClick={() => setSelectedColor(c.hex)}
              title={c.name}
              style={{
                width: 36, height: 36, borderRadius: 8, background: c.hex, border: selectedColor === c.hex ? '3px solid var(--ud-ink)' : '2px solid transparent',
                cursor: 'pointer', outline: 'none', flexShrink: 0,
                boxShadow: selectedColor === c.hex ? '0 0 0 2px #fff inset' : 'none',
                transition: 'border 0.15s',
              }}
            />
          ))}
          <span style={{ fontSize: 12, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', alignSelf: 'center' }}>
            {COLORS.find(c => c.hex === selectedColor)?.name}
          </span>
        </div>
      </div>

      {/* Highlight entries */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <label style={{ ...lbl, marginBottom: 0 }}>Highlight entries</label>
        <button onClick={addEntry} style={{ background: 'none', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', padding: '4px 12px', fontSize: 12, fontFamily: 'var(--font-body)', color: 'var(--ud-ink)', cursor: 'pointer' }}>+ Add</button>
      </div>

      {entries.map((entry, idx) => (
        <div key={entry.id} style={{ marginBottom: 12, padding: '14px 16px', background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)', borderLeft: `4px solid ${entry.color}`, borderRadius: 'var(--ud-radius-lg)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Highlight {idx + 1}</span>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {COLORS.map(c => (
                <button key={c.hex} onClick={() => updateEntry(entry.id, 'color', c.hex)} title={c.name} style={{ width: 20, height: 20, borderRadius: 4, background: c.hex, border: entry.color === c.hex ? '2px solid var(--ud-ink)' : '1px solid transparent', cursor: 'pointer', outline: 'none', flexShrink: 0 }} />
              ))}
              {entries.length > 1 && (
                <button onClick={() => removeEntry(entry.id)} style={{ background: 'none', border: 'none', color: 'var(--ud-danger)', cursor: 'pointer', fontSize: 12, fontFamily: 'var(--font-body)', padding: '0 4px' }}>Remove</button>
              )}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10 }}>
            <div>
              <label style={lbl}>Text to highlight *</label>
              <textarea rows={2} style={{ ...inp, resize: 'vertical' }} value={entry.text} onChange={e => updateEntry(entry.id, 'text', e.target.value)} placeholder="Paste the exact text you want highlighted" />
            </div>
            <div>
              <label style={lbl}>Label (optional)</label>
              <input style={inp} value={entry.label} onChange={e => updateEntry(entry.id, 'label', e.target.value)} placeholder='e.g. "Key clause"' />
            </div>
          </div>
        </div>
      ))}

      {result && (
        <div style={{ padding: '14px 18px', background: 'var(--ud-teal-2)', border: '1px solid var(--ud-teal)', borderRadius: 'var(--ud-radius-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ud-teal)', fontFamily: 'var(--font-body)' }}>Highlights embedded ✓</div>
            <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)' }}>{validEntries} structural {validEntries === 1 ? 'highlight' : 'highlights'} · {file?.name}</div>
          </div>
          <a href={result.url} download={result.name} style={{ padding: '10px 18px', background: 'var(--ud-ink)', color: '#fff', fontWeight: 600, fontSize: 13, borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)', textDecoration: 'none', flexShrink: 0 }}>Download .uds →</a>
        </div>
      )}

      <button onClick={run} disabled={!!can} style={{ width: '100%', padding: '14px', background: can ? 'var(--ud-border)' : 'var(--ud-ink)', color: can ? 'var(--ud-muted)' : '#fff', border: 'none', borderRadius: 'var(--ud-radius)', fontSize: 15, fontWeight: 600, fontFamily: 'var(--font-body)', cursor: can ? 'not-allowed' : 'pointer' }}>
        Embed Highlights
      </button>

      {/* Comparison */}
      <div style={{ marginTop: 48, paddingTop: 40, borderTop: '1px solid var(--ud-border)' }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--ud-ink)', marginBottom: 6 }}>How UD Highlight differs from PDF annotations</h2>
        <p style={{ fontSize: 14, fontFamily: 'var(--font-body)', color: 'var(--ud-muted)', marginBottom: 20, lineHeight: 1.6 }}>
          PDF highlights in Adobe Acrobat, Word track changes, and browser annotations all sit on top of the document as a removable layer. Any reader can flatten, strip, or delete them. UD highlights are encoded in document metadata — removing them breaks the seal.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
          {[
            { icon: '🔒', title: 'Cannot be silently stripped', body: 'PDF annotation layers can be removed in one click in any reader. A UD structural highlight is part of the document seal — removing it changes the integrity hash.' },
            { icon: '✈️', title: 'Travels with the file', body: 'Share a highlighted .uds via email, upload, or print — the highlight data travels with it. No separate annotation file. No sync required.' },
            { icon: '🏷', title: 'Labelled and queryable', body: 'Each highlight carries a label ("Key clause", "Action required") embedded in metadata. Legal and compliance teams can extract all highlights programmatically.' },
            { icon: '🎨', title: 'Colour carries meaning', body: 'Choose from five named colours with semantic intent. Unlike PDF where colour is purely visual, UD highlight colours are named and stored structurally.' },
          ].map(item => (
            <div key={item.title} style={{ padding: '16px 18px', background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius-lg)', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 18, lineHeight: '1', flexShrink: 0, marginTop: 2 }}>{item.icon}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--ud-ink)', marginBottom: 4 }}>{item.title}</div>
                <p style={{ fontSize: 12, fontFamily: 'var(--font-body)', color: 'var(--ud-muted)', lineHeight: 1.5, margin: 0 }}>{item.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 24, padding: '16px', background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', fontSize: 12, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', textAlign: 'center' }}>
        Runs in your browser. No data sent to any server. Part of the <a href="https://ud.hive.baby" style={{ color: 'var(--ud-teal)' }}>Universal Document™</a> ecosystem.
      </div>
      <TooltipTour engineId="highlight" tips={tourSteps['highlight']} />
    </div>
  )
}
