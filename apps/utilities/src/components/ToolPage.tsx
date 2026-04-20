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
    } catch (err: any) {
      setError(err.message)
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
      {/* Header */}
      <a href="/" style={{ fontSize: 13, color: '#4DA3FF', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 32 }}>
        ← All tools
      </a>
      <h1 style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-0.03em', color: '#f1f5f9', marginBottom: 10 }}>
        {name}
      </h1>
      <p style={{ fontSize: 16, color: '#8892a4', marginBottom: 8 }}>{desc}</p>
      {freeLabel && (
        <span style={{
          display: 'inline-block', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
          padding: '3px 10px', borderRadius: 8,
          background: 'rgba(46,204,113,0.12)', color: '#2ECC71', marginBottom: 32,
        }}>{freeLabel}</span>
      )}

      {/* Drop zone */}
      <div
        className={`drop-zone${dragging ? ' active' : ''}`}
        style={{ marginBottom: 24 }}
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
              <div key={i} style={{ fontSize: 14, color: '#f1f5f9', marginBottom: 4 }}>
                📄 {f.name} <span style={{ color: '#8892a4', fontSize: 12 }}>({(f.size / 1024).toFixed(0)} KB)</span>
              </div>
            ))}
            <div style={{ fontSize: 12, color: '#4DA3FF', marginTop: 8 }}>Click or drop to replace</div>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📄</div>
            <div style={{ fontSize: 15, color: '#f1f5f9', fontWeight: 600, marginBottom: 6 }}>
              Drop your {acceptMultiple ? 'files' : 'file'} here
            </div>
            <div style={{ fontSize: 13, color: '#8892a4' }}>
              or click to browse · {acceptTypes}
            </div>
          </div>
        )}
      </div>

      {/* Extra fields */}
      {extraFields && <div style={{ marginBottom: 24 }}>{extraFields}</div>}

      {/* Progress */}
      {processing && (
        <div style={{ marginBottom: 20 }}>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <div style={{ fontSize: 12, color: '#8892a4', marginTop: 8 }}>Processing…</div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{
          padding: '12px 16px', background: 'rgba(231,76,60,0.1)',
          border: '1px solid rgba(231,76,60,0.2)', borderRadius: 8,
          fontSize: 13, color: '#E74C3C', marginBottom: 20,
        }}>
          {error}
        </div>
      )}

      {/* Text result (OCR, Compare) */}
      {textResult && (
        <div style={{
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 12, padding: 20, marginBottom: 20,
        }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#4DA3FF', marginBottom: 10, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Result
          </div>
          <pre style={{ fontSize: 13, color: '#e2e8f0', lineHeight: 1.7, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {textResult}
          </pre>
        </div>
      )}

      {/* Download result */}
      {result && (
        <div style={{
          padding: '16px 20px', background: 'rgba(46,204,113,0.08)',
          border: '1px solid rgba(46,204,113,0.2)', borderRadius: 12,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20,
        }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#2ECC71', marginBottom: 2 }}>Ready to download</div>
            <div style={{ fontSize: 12, color: '#8892a4' }}>{result.name}</div>
          </div>
          <a
            href={result.url}
            download={result.name}
            style={{
              padding: '10px 20px', background: '#003A8C', color: '#fff',
              fontWeight: 600, fontSize: 13, borderRadius: 8,
            }}
          >
            Download →
          </a>
        </div>
      )}

      {/* Action button */}
      <button
        className="btn-primary"
        onClick={process}
        disabled={!files.length || processing}
        style={{ width: '100%', justifyContent: 'center', padding: '14px' }}
      >
        {processing ? 'Processing…' : `Run ${name}`}
      </button>

      {/* UD footer */}
      <div style={{
        marginTop: 40, padding: '16px', background: 'rgba(0,58,140,0.08)',
        border: '1px solid rgba(0,58,140,0.15)', borderRadius: 10,
        fontSize: 12, color: '#8892a4', textAlign: 'center',
      }}>
        Output is processed in-memory. Files are not stored.
        Part of the <a href="https://ud.hive.baby" style={{ color: '#4DA3FF' }}>Universal Document</a> ecosystem.
      </div>
    </div>
  )
}
