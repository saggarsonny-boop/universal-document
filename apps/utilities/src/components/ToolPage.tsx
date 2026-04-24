'use client'
import { useState, useRef, useCallback } from 'react'

interface ToolPageProps {
  tool: string
  name: string
  desc: string
  acceptMultiple?: boolean
  acceptTypes?: string
  extraFields?: React.ReactNode
  extraData?: Record<string, string | number>
  freeLabel?: string
}

export default function ToolPage({
  tool, name, desc,
  acceptMultiple = false,
  acceptTypes = '.pdf',
  extraFields,
  extraData = {},
  freeLabel,
}: ToolPageProps) {
  const [files, setFiles] = useState<File[]>([])
  const [dragging, setDragging] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<{ url: string; name: string } | null>(null)
  const [error, setError] = useState('')
  const [textResult, setTextResult] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = (incoming: FileList | null) => {
    if (!incoming) return
    const arr = Array.from(incoming)
    setFiles(acceptMultiple ? arr : [arr[0]])
    setResult(null)
    setError('')
    setTextResult('')
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    handleFiles(e.dataTransfer.files)
  }, [])

  const process = async () => {
    if (!files.length) return
    setProcessing(true)
    setProgress(10)
    setError('')
    setResult(null)
    setTextResult('')

    try {
      const form = new FormData()
      form.append('tool', tool)
      files.forEach(f => form.append('files', f))
      Object.entries(extraData).forEach(([k, v]) => form.append(k, String(v)))

      setProgress(30)
      const res = await fetch('/api/process', { method: 'POST', body: form })
      setProgress(80)

      if (!res.ok) {
        const e = await res.json()
        throw new Error(e.error || 'Processing failed')
      }

      const contentType = res.headers.get('content-type') || ''
      if (contentType.includes('application/json')) {
        const json = await res.json()
        if (json.text) setTextResult(json.text)
        if (json.diff) setTextResult(json.diff)
      } else {
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const cd = res.headers.get('content-disposition') || ''
        const match = cd.match(/filename="?([^"]+)"?/)
        setResult({ url, name: match?.[1] || `ud-${tool}-output.pdf` })
      }
      setProgress(100)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Processing failed')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
      {/* Back link */}
      <a href="/" style={{ fontSize: 13, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 32 }}>
        ← All tools
      </a>

      {/* Heading */}
      <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--ud-ink)', fontFamily: 'var(--font-display)', marginBottom: 10 }}>
        {name}
      </h1>
      <p style={{ fontSize: 16, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', marginBottom: 8, lineHeight: 1.6 }}>{desc}</p>
      {freeLabel && (
        <span style={{
          display: 'inline-block', fontSize: 13, fontWeight: 600, letterSpacing: '0.1em',
          padding: '3px 10px', borderRadius: 99,
          background: 'var(--ud-teal-2)', color: 'var(--ud-teal)',
          fontFamily: 'var(--font-mono)', textTransform: 'uppercase',
          marginBottom: 32,
        }}>{freeLabel}</span>
      )}

      {/* Drop zone */}
      <div
        style={{
          border: `1.5px dashed ${dragging ? 'var(--ud-teal)' : 'var(--ud-border-2)'}`,
          borderRadius: 'var(--ud-radius-xl)',
          padding: '48px 24px',
          textAlign: 'center',
          cursor: 'pointer',
          background: dragging ? 'var(--ud-teal-2)' : 'var(--ud-paper-2)',
          transition: 'border-color 0.2s, background 0.2s',
          marginBottom: 24,
        }}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept={acceptTypes}
          multiple={acceptMultiple}
          style={{ display: 'none' }}
          onChange={e => handleFiles(e.target.files)}
        />
        {files.length > 0 ? (
          <div>
            {files.map((f, i) => (
              <div key={i} style={{ fontSize: 14, color: 'var(--ud-ink)', fontFamily: 'var(--font-body)', marginBottom: 4 }}>
                📄 {f.name} <span style={{ color: 'var(--ud-muted)', fontSize: 13 }}>({(f.size / 1024).toFixed(0)} KB)</span>
              </div>
            ))}
            <div style={{ fontSize: 13, color: 'var(--ud-teal)', marginTop: 8, fontFamily: 'var(--font-body)' }}>Click or drop to replace</div>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📄</div>
            <div style={{ fontSize: 15, color: 'var(--ud-ink)', fontWeight: 600, marginBottom: 6, fontFamily: 'var(--font-body)' }}>
              Drop your {acceptMultiple ? 'files' : 'file'} here
            </div>
            <div style={{ fontSize: 13, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)' }}>
              or click to browse · {acceptTypes}
            </div>
          </div>
        )}
      </div>

      {/* Extra fields */}
      {extraFields && <div style={{ marginBottom: 24 }}>{extraFields}</div>}

      {/* Progress bar */}
      {processing && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ height: 4, background: 'var(--ud-border)', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: 'var(--ud-teal)', borderRadius: 99, transition: 'width 0.3s ease' }} />
          </div>
          <div style={{ fontSize: 13, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', marginTop: 8 }}>Processing…</div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{
          padding: '12px 16px',
          background: 'rgba(226,75,74,0.08)',
          border: '1px solid rgba(226,75,74,0.2)',
          borderRadius: 'var(--ud-radius)',
          fontSize: 13, color: 'var(--ud-danger)',
          fontFamily: 'var(--font-body)',
          marginBottom: 20,
        }}>
          {error}
        </div>
      )}

      {/* Text result (OCR, Compare) */}
      {textResult && (
        <div style={{
          background: 'var(--ud-paper-2)',
          border: '1px solid var(--ud-border)',
          borderRadius: 'var(--ud-radius-lg)',
          padding: 20, marginBottom: 20,
        }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ud-teal)', fontFamily: 'var(--font-mono)', marginBottom: 10, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Result
          </div>
          <pre style={{ fontSize: 13, color: 'var(--ud-ink)', fontFamily: 'var(--font-mono)', lineHeight: 1.7, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {textResult}
          </pre>
        </div>
      )}

      {/* Download result */}
      {result && (
        <div style={{
          padding: '16px 20px',
          background: 'var(--ud-teal-2)',
          border: '1px solid var(--ud-teal)',
          borderRadius: 'var(--ud-radius-lg)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 20,
        }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ud-teal)', fontFamily: 'var(--font-body)', marginBottom: 2 }}>Ready to download</div>
            <div style={{ fontSize: 13, color: 'var(--ud-muted)', fontFamily: 'var(--font-mono)' }}>{result.name}</div>
          </div>
          <a
            href={result.url}
            download={result.name}
            style={{
              padding: '10px 20px',
              background: 'var(--ud-ink)',
              color: '#fff',
              fontWeight: 600,
              fontSize: 13,
              borderRadius: 'var(--ud-radius)',
              fontFamily: 'var(--font-body)',
              textDecoration: 'none',
              display: 'inline-block',
            }}
          >
            Download →
          </a>
        </div>
      )}

      {/* Action button */}
      <button
        onClick={process}
        disabled={!files.length || processing}
        style={{
          width: '100%',
          padding: '14px',
          background: !files.length || processing ? 'var(--ud-border)' : 'var(--ud-ink)',
          color: !files.length || processing ? 'var(--ud-muted)' : '#fff',
          border: 'none',
          borderRadius: 'var(--ud-radius)',
          fontSize: 15,
          fontWeight: 600,
          fontFamily: 'var(--font-body)',
          cursor: !files.length || processing ? 'not-allowed' : 'pointer',
          transition: 'background 0.15s',
        }}
      >
        {processing ? 'Processing…' : `Run ${name}`}
      </button>

      {/* Footer note */}
      <div style={{
        marginTop: 40, padding: '16px',
        background: 'var(--ud-paper-2)',
        border: '1px solid var(--ud-border)',
        borderRadius: 'var(--ud-radius)',
        fontSize: 13, color: 'var(--ud-muted)',
        fontFamily: 'var(--font-body)',
        textAlign: 'center',
      }}>
        Output is processed in-memory. Files are not stored.
        Part of the <a href="https://ud.hive.baby" style={{ color: 'var(--ud-teal)' }}>Universal Document™</a> ecosystem.
      </div>
    </div>
  )
}
