'use client'

import { useState, useRef, useCallback } from 'react'

type ConvertState = 'idle' | 'converting' | 'done' | 'error'

const ACCEPTED = '.docx,.txt,.md'
const ACCEPTED_LABEL = 'DOCX, TXT, MD'

export default function ConverterPage() {
  const [state, setState] = useState<ConvertState>('idle')
  const [error, setError] = useState('')
  const [fileName, setFileName] = useState('')
  const [outputName, setOutputName] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function convert(file: File) {
    setFileName(file.name)
    setState('converting')
    setError('')

    const form = new FormData()
    form.append('file', file)

    try {
      const res = await fetch('/api/convert', { method: 'POST', body: form })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Conversion failed')
      }

      const blob = await res.blob()
      const disp = res.headers.get('Content-Disposition') ?? ''
      const match = disp.match(/filename="([^"]+)"/)
      const name = match?.[1] ?? file.name.replace(/\.[^.]+$/, '.uds')
      setOutputName(name)

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = name
      a.click()
      URL.revokeObjectURL(url)
      setState('done')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Conversion failed')
      setState('error')
    }
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) convert(file)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function reset() {
    setState('idle')
    setError('')
    setFileName('')
    setOutputName('')
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <main style={{ maxWidth: 600, margin: '0 auto', padding: '64px 24px 40px' }}>

      <div style={{ marginBottom: 48, textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 16 }}>
          <a href="https://universal-document.vercel.app" style={{ fontSize: 13, color: '#6b7280' }}>← UD Reader</a>
          <span style={{ color: '#d1d5db' }}>·</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>Converter</span>
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', color: '#111827', marginBottom: 12 }}>
          Convert to Universal Document
        </h1>
        <p style={{ fontSize: 15, color: '#6b7280', maxWidth: 440, margin: '0 auto', lineHeight: 1.6 }}>
          Upload a {ACCEPTED_LABEL} file. Download a <code style={{ background: '#f3f4f6', padding: '1px 6px', borderRadius: 4, fontSize: 13 }}>.uds</code> file, ready to open in the UD Reader.
        </p>
      </div>

      {state === 'idle' || state === 'error' ? (
        <>
          <div
            onDrop={onDrop}
            onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onClick={() => inputRef.current?.click()}
            style={{
              border: `2px dashed ${isDragging ? '#2563eb' : '#d1d5db'}`,
              borderRadius: 16,
              padding: '56px 32px',
              textAlign: 'center',
              cursor: 'pointer',
              background: isDragging ? '#eff6ff' : '#ffffff',
              transition: 'all 0.15s',
            }}
          >
            <div style={{ fontSize: 40, marginBottom: 16 }}>📄</div>
            <p style={{ fontSize: 16, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
              Drop your file here
            </p>
            <p style={{ fontSize: 13, color: '#9ca3af' }}>
              or click to browse · {ACCEPTED_LABEL} supported · max 10 MB
            </p>
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPTED}
              style={{ display: 'none' }}
              onChange={e => { const f = e.target.files?.[0]; if (f) convert(f); e.target.value = '' }}
            />
          </div>

          {state === 'error' && (
            <div style={{ marginTop: 16, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '14px 16px', color: '#dc2626', fontSize: 14 }}>
              {error}
              <button onClick={reset} style={{ marginLeft: 12, color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}>Try again</button>
            </div>
          )}
        </>
      ) : state === 'converting' ? (
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 16, padding: '56px 32px', textAlign: 'center', background: '#fff' }}>
          <div style={{ width: 36, height: 36, border: '3px solid #e5e7eb', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 20px' }} />
          <p style={{ fontSize: 15, color: '#374151', fontWeight: 500 }}>Converting {fileName}…</p>
          <p style={{ fontSize: 13, color: '#9ca3af', marginTop: 6 }}>This usually takes a second or two.</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      ) : (
        <div style={{ border: '1px solid #d1fae5', borderRadius: 16, padding: '48px 32px', textAlign: 'center', background: '#f0fdf4' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✓</div>
          <p style={{ fontSize: 18, fontWeight: 700, color: '#065f46', marginBottom: 6 }}>Converted successfully</p>
          <p style={{ fontSize: 14, color: '#047857', marginBottom: 8 }}>{outputName} downloaded to your device.</p>
          <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 28 }}>
            Open it in the{' '}
            <a href="https://universal-document.vercel.app" style={{ color: '#2563eb' }}>UD Reader</a>.
          </p>
          <button
            onClick={reset}
            style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
          >
            Convert another file
          </button>
        </div>
      )}

      <div style={{ marginTop: 48, borderTop: '1px solid #f3f4f6', paddingTop: 24, textAlign: 'center' }}>
        <p style={{ fontSize: 11, color: '#d1d5db', marginBottom: 12, letterSpacing: '0.05em' }}>
          NO ADS · NO INVESTORS · NO AGENDA
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          {[
            ['UD Reader', 'https://universal-document.vercel.app'],
            ['What is UD?', 'https://hive.baby'],
            ['hive.baby', 'https://hive.baby'],
          ].map(([label, href]) => (
            <a key={label} href={href} style={{ fontSize: 12, color: '#9ca3af' }}>{label}</a>
          ))}
        </div>
      </div>
    </main>
  )
}
