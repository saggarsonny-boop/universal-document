'use client'
import { useState, useRef, useCallback } from 'react'

const LANGUAGES = [
  'Arabic', 'Bengali', 'Chinese (Simplified)', 'Chinese (Traditional)', 'Czech',
  'Danish', 'Dutch', 'Finnish', 'French', 'German', 'Greek', 'Hebrew', 'Hindi',
  'Hungarian', 'Indonesian', 'Italian', 'Japanese', 'Korean', 'Malay', 'Norwegian',
  'Persian', 'Polish', 'Portuguese', 'Romanian', 'Russian', 'Spanish', 'Swahili',
  'Swedish', 'Tagalog', 'Thai', 'Turkish', 'Ukrainian', 'Urdu', 'Vietnamese',
]

export default function Translate() {
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [language, setLanguage] = useState('Spanish')
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState<{ url: string; name: string } | null>(null)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (f: File | null) => {
    if (!f) return
    setFile(f)
    setResult(null)
    setError('')
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files[0])
  }, [])

  const translate = async () => {
    if (!file) return
    setProcessing(true)
    setError('')
    setResult(null)
    try {
      const form = new FormData()
      form.append('file', file)
      form.append('language', language)
      const res = await fetch('/api/translate', { method: 'POST', body: form })
      if (!res.ok) {
        const e = await res.json()
        throw new Error(e.error || 'Translation failed')
      }
      const blob = await res.blob()
      const cd = res.headers.get('content-disposition') || ''
      const match = cd.match(/filename="?([^"]+)"?/)
      const name = match?.[1] || `translated-${language.toLowerCase()}.uds`
      setResult({ url: URL.createObjectURL(blob), name })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Translation failed')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
      <a href="/" style={{ fontSize: 13, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 32 }}>
        ← All tools
      </a>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--ud-ink)', fontFamily: 'var(--font-display)' }}>UD Translate</h1>
        <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 99, background: 'var(--ud-teal-2)', color: 'var(--ud-teal)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>AI · Free during beta</span>
      </div>
      <p style={{ fontSize: 16, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', marginBottom: 32, lineHeight: 1.6 }}>
        Translate any Universal Document™ into another language. The translation is embedded as a parallel language stream in the output .uds file.
      </p>

      <div
        style={{ border: `1.5px dashed ${dragging ? 'var(--ud-teal)' : 'var(--ud-border-2)'}`, borderRadius: 'var(--ud-radius-xl)', padding: '48px 24px', textAlign: 'center', cursor: 'pointer', background: dragging ? 'var(--ud-teal-2)' : 'var(--ud-paper-2)', transition: 'border-color 0.2s, background 0.2s', marginBottom: 24 }}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input ref={inputRef} type="file" accept=".uds,.udr" style={{ display: 'none' }} onChange={e => handleFile(e.target.files?.[0] ?? null)} />
        {file ? (
          <div>
            <div style={{ fontSize: 14, color: 'var(--ud-ink)', fontFamily: 'var(--font-body)', marginBottom: 4 }}>📄 {file.name}</div>
            <div style={{ fontSize: 12, color: 'var(--ud-teal)', marginTop: 8, fontFamily: 'var(--font-body)' }}>Click or drop to replace</div>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🌐</div>
            <div style={{ fontSize: 15, color: 'var(--ud-ink)', fontWeight: 600, marginBottom: 6, fontFamily: 'var(--font-body)' }}>Drop your .uds file here</div>
            <div style={{ fontSize: 13, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)' }}>or click to browse · .uds .udr</div>
          </div>
        )}
      </div>

      <div style={{ marginBottom: 24 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--ud-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Target Language</label>
        <select value={language} onChange={e => setLanguage(e.target.value)} style={{ width: '100%', padding: '10px 14px', background: '#fff', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', color: 'var(--ud-ink)', fontSize: 14, fontFamily: 'var(--font-body)', outline: 'none', cursor: 'pointer' }}>
          {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
      </div>

      {error && <div style={{ padding: '12px 16px', background: 'rgba(226,75,74,0.08)', border: '1px solid rgba(226,75,74,0.2)', borderRadius: 'var(--ud-radius)', fontSize: 13, color: 'var(--ud-danger)', fontFamily: 'var(--font-body)', marginBottom: 20 }}>{error}</div>}

      {processing && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ height: 4, background: 'var(--ud-border)', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: '60%', background: 'var(--ud-teal)', borderRadius: 99, animation: 'ud-bounce 1.4s ease-in-out infinite' }} />
          </div>
          <div style={{ fontSize: 12, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', marginTop: 8 }}>Translating with Claude…</div>
        </div>
      )}

      {result && (
        <div style={{ padding: '16px 20px', background: 'var(--ud-teal-2)', border: '1px solid var(--ud-teal)', borderRadius: 'var(--ud-radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, gap: 16 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ud-teal)', fontFamily: 'var(--font-body)', marginBottom: 2 }}>Translation complete ✓</div>
            <div style={{ fontSize: 12, color: 'var(--ud-muted)', fontFamily: 'var(--font-mono)' }}>{result.name}</div>
          </div>
          <a href={result.url} download={result.name} style={{ padding: '10px 20px', background: 'var(--ud-ink)', color: '#fff', fontWeight: 600, fontSize: 13, borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)', textDecoration: 'none', flexShrink: 0 }}>Download .uds →</a>
        </div>
      )}

      <button onClick={translate} disabled={!file || processing} style={{ width: '100%', padding: '14px', background: !file || processing ? 'var(--ud-border)' : 'var(--ud-ink)', color: !file || processing ? 'var(--ud-muted)' : '#fff', border: 'none', borderRadius: 'var(--ud-radius)', fontSize: 15, fontWeight: 600, fontFamily: 'var(--font-body)', cursor: !file || processing ? 'not-allowed' : 'pointer', transition: 'background 0.15s' }}>
        {processing ? 'Translating…' : `Translate to ${language}`}
      </button>

      <div style={{ marginTop: 40, padding: '16px', background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', fontSize: 12, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', textAlign: 'center' }}>
        Translation powered by Claude claude-opus-4-5. Output embedded as a parallel language stream in the .uds file.
        Part of the <a href="https://ud.hive.baby" style={{ color: 'var(--ud-teal)' }}>Universal Document™</a> ecosystem.
      </div>
    </div>
  )
}
