'use client'
import { useState, useRef, useCallback } from 'react'
import TooltipTour from '@/components/TooltipTour'
import { tourSteps } from '@/lib/tourSteps'

interface BundledDoc {
  index: number
  filename: string
  document: Record<string, unknown>
  downloadUrl?: string
}

export default function UDZUnzipper() {
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [bundle, setBundle] = useState<{ title?: string; created_at?: string; document_count?: number; docs: BundledDoc[] } | null>(null)
  const [report, setReport] = useState<{ fileCount: number; expectedCount: number; pass: boolean } | null>(null)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (f: File | null) => {
    if (!f) return
    setFile(f)
    setBundle(null)
    setReport(null)
    setError('')
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files[0])
  }, [])

  const unzip = async () => {
    if (!file) return
    setError('')
    setBundle(null)
    setReport(null)
    try {
      const text = await file.text()
      let raw: Record<string, unknown>
      try { raw = JSON.parse(text) } catch { throw new Error('File does not appear to be a valid .udz bundle.') }
      if (raw.format !== 'UDZ') throw new Error('File format is not UDZ. Expected format: "UDZ".')

      const docs = Array.isArray(raw.documents) ? raw.documents as BundledDoc[] : []
      const expectedCount = typeof raw.document_count === 'number' ? raw.document_count : docs.length

      const enriched: BundledDoc[] = docs.map((d, i) => {
        const blob = new Blob([JSON.stringify(d.document, null, 2)], { type: 'application/json' })
        return { ...d, index: i, filename: d.filename || `document-${i + 1}.uds`, downloadUrl: URL.createObjectURL(blob) }
      })

      setBundle({ title: typeof raw.title === 'string' ? raw.title : undefined, created_at: typeof raw.created_at === 'string' ? raw.created_at : undefined, document_count: expectedCount, docs: enriched })
      setReport({ fileCount: enriched.length, expectedCount, pass: enriched.length === expectedCount })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to unpack bundle')
    }
  }

  const downloadAll = () => {
    if (!bundle) return
    bundle.docs.forEach((d, i) => {
      setTimeout(() => {
        const a = document.createElement('a')
        a.href = d.downloadUrl!
        a.download = d.filename
        a.click()
      }, i * 200)
    })
  }

  function fmt(ts?: string) {
    if (!ts) return null
    try { return new Date(ts).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }) } catch { return ts }
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
      <a href="/" style={{ fontSize: 13, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 32 }}>
        ← All tools
      </a>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--ud-ink)', fontFamily: 'var(--font-display)' }}>UDZ Unzipper</h1>
        <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 99, background: 'var(--ud-teal-2)', color: 'var(--ud-teal)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>FREE</span>
      </div>
      <p style={{ fontSize: 16, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', marginBottom: 32, lineHeight: 1.6 }}>
        Extract all .uds files from a .udz bundle. Verifies bundle integrity and shows a file count report before download.
      </p>

      <div
        style={{ border: `1.5px dashed ${dragging ? 'var(--ud-teal)' : 'var(--ud-border-2)'}`, borderRadius: 'var(--ud-radius-xl)', padding: '48px 24px', textAlign: 'center', cursor: 'pointer', background: dragging ? 'var(--ud-teal-2)' : 'var(--ud-paper-2)', transition: 'border-color 0.2s, background 0.2s', marginBottom: 24 }}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input ref={inputRef} type="file" accept=".udz" style={{ display: 'none' }} onChange={e => handleFile(e.target.files?.[0] ?? null)} />
        {file ? (
          <div>
            <div style={{ fontSize: 14, color: 'var(--ud-ink)', fontFamily: 'var(--font-body)', marginBottom: 4 }}>📦 {file.name} <span style={{ color: 'var(--ud-muted)', fontSize: 12 }}>({(file.size / 1024).toFixed(0)} KB)</span></div>
            <div style={{ fontSize: 12, color: 'var(--ud-teal)', marginTop: 8, fontFamily: 'var(--font-body)' }}>Click or drop to replace</div>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📦</div>
            <div style={{ fontSize: 15, color: 'var(--ud-ink)', fontWeight: 600, marginBottom: 6, fontFamily: 'var(--font-body)' }}>Drop your .udz file here</div>
            <div style={{ fontSize: 13, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)' }}>or click to browse · .udz</div>
          </div>
        )}
      </div>

      {error && <div style={{ padding: '12px 16px', background: 'rgba(226,75,74,0.08)', border: '1px solid rgba(226,75,74,0.2)', borderRadius: 'var(--ud-radius)', fontSize: 13, color: 'var(--ud-danger)', fontFamily: 'var(--font-body)', marginBottom: 20 }}>{error}</div>}

      {report && (
        <div style={{ padding: '14px 18px', background: report.pass ? 'var(--ud-teal-2)' : 'rgba(226,75,74,0.08)', border: `1px solid ${report.pass ? 'var(--ud-teal)' : 'rgba(226,75,74,0.3)'}`, borderRadius: 'var(--ud-radius-lg)', marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: report.pass ? 'var(--ud-teal)' : 'var(--ud-danger)', fontFamily: 'var(--font-body)', marginBottom: 8 }}>
            Integrity Report: {report.pass ? 'PASS ✓' : 'MISMATCH ⚠'}
          </div>
          <div style={{ fontSize: 12, color: 'var(--ud-muted)', fontFamily: 'var(--font-mono)', display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            <span>Expected files: {report.expectedCount}</span>
            <span>Found: {report.fileCount}</span>
            <span>{report.pass ? 'Bundle intact' : 'File count mismatch'}</span>
          </div>
        </div>
      )}

      {bundle && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ padding: '14px 18px', background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius-lg)', marginBottom: 16 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--ud-ink)', marginBottom: 4 }}>{bundle.title || 'Untitled Bundle'}</div>
            <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)', display: 'flex', gap: 16 }}>
              {bundle.created_at && <span>Created: {fmt(bundle.created_at)}</span>}
              <span>{bundle.docs.length} document{bundle.docs.length !== 1 ? 's' : ''}</span>
            </div>
          </div>

          <div style={{ border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius-lg)', overflow: 'hidden', marginBottom: 16 }}>
            {bundle.docs.map((d, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: i % 2 === 0 ? '#fff' : 'var(--ud-paper-2)', borderBottom: i < bundle.docs.length - 1 ? '1px solid var(--ud-border)' : 'none', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)', minWidth: 20 }}>{i + 1}</span>
                  <span style={{ fontSize: 13, fontFamily: 'var(--font-body)', color: 'var(--ud-ink)' }}>📄 {d.filename}</span>
                </div>
                <a href={d.downloadUrl} download={d.filename} style={{ fontSize: 12, color: 'var(--ud-teal)', fontFamily: 'var(--font-mono)', textDecoration: 'none', whiteSpace: 'nowrap', padding: '4px 10px', border: '1px solid var(--ud-teal)', borderRadius: 6 }}>
                  Download
                </a>
              </div>
            ))}
          </div>

          <button onClick={downloadAll} style={{ width: '100%', padding: '12px', background: 'var(--ud-teal)', color: '#fff', border: 'none', borderRadius: 'var(--ud-radius)', fontSize: 14, fontWeight: 600, fontFamily: 'var(--font-body)', cursor: 'pointer' }}>
            Download All {bundle.docs.length} Files
          </button>
        </div>
      )}

      <button onClick={unzip} disabled={!file} style={{ width: '100%', padding: '14px', background: !file ? 'var(--ud-border)' : 'var(--ud-ink)', color: !file ? 'var(--ud-muted)' : '#fff', border: 'none', borderRadius: 'var(--ud-radius)', fontSize: 15, fontWeight: 600, fontFamily: 'var(--font-body)', cursor: !file ? 'not-allowed' : 'pointer', transition: 'background 0.15s' }}>
        Extract Bundle
      </button>

      <div style={{ marginTop: 40, padding: '16px', background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', fontSize: 12, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', textAlign: 'center' }}>
        Processed entirely in your browser. No data is sent to any server. Part of the <a href="https://ud.hive.baby" style={{ color: 'var(--ud-teal)' }}>Universal Document™</a> ecosystem.
      </div>
      <TooltipTour engineId="udz-unzipper" tips={tourSteps['udz-unzipper']} />
    </div>
  )
}
