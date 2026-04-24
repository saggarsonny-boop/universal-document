'use client'

import { useState } from 'react'
import TooltipTour from '@/components/TooltipTour'
import { tourSteps } from '@/lib/tourSteps'

async function sha256hex(data: Uint8Array): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer)
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

interface CapturedDoc {
  id: string
  name: string
  size: number
  hash: string
  capturedAt: string
  classification: string
  suggestedCategory: string
  confidence: 'high' | 'medium' | 'low'
  extractedMetadata: Record<string, string>
  rawBytes: Uint8Array
}

const AUTO_CATEGORIES = [
  'Contract', 'Invoice', 'Receipt', 'Certificate', 'Report', 'Correspondence',
  'Policy Document', 'HR Record', 'Financial Record', 'Legal Document',
  'Technical Specification', 'Form', 'Identification', 'Other',
]

function classifyByFilename(name: string): { category: string; confidence: 'high' | 'medium' | 'low' } {
  const lower = name.toLowerCase()
  if (lower.includes('invoice') || lower.includes('inv-')) return { category: 'Invoice', confidence: 'high' }
  if (lower.includes('contract') || lower.includes('agreement')) return { category: 'Contract', confidence: 'high' }
  if (lower.includes('receipt')) return { category: 'Receipt', confidence: 'high' }
  if (lower.includes('certificate') || lower.includes('cert')) return { category: 'Certificate', confidence: 'high' }
  if (lower.includes('report')) return { category: 'Report', confidence: 'medium' }
  if (lower.includes('policy')) return { category: 'Policy Document', confidence: 'medium' }
  if (lower.includes('hr') || lower.includes('employee')) return { category: 'HR Record', confidence: 'medium' }
  if (lower.match(/\.(pdf|docx?|xlsx?)$/)) return { category: 'Other', confidence: 'low' }
  return { category: 'Other', confidence: 'low' }
}

export default function CapturePage() {
  const [batchName, setBatchName] = useState('')
  const [organisation, setOrganisation] = useState('')
  const [documents, setDocuments] = useState<CapturedDoc[]>([])
  const [isCapturing, setIsCapturing] = useState(false)
  const [status, setStatus] = useState<'idle' | 'sealing' | 'done' | 'error'>('idle')
  const [filename, setFilename] = useState('')
  const [captureId] = useState(() => `CAP-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`)

  async function captureFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setIsCapturing(true)
    const newDocs: CapturedDoc[] = await Promise.all(files.map(async (file) => {
      const bytes = new Uint8Array(await file.arrayBuffer())
      const hash = await sha256hex(bytes)
      const { category, confidence } = classifyByFilename(file.name)
      const ext = file.name.split('.').pop()?.toLowerCase() || ''
      return {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: file.name,
        size: file.size,
        hash,
        capturedAt: new Date().toISOString(),
        classification: 'Internal',
        suggestedCategory: category,
        confidence,
        extractedMetadata: {
          fileType: ext.toUpperCase(),
          sizeKB: (file.size / 1024).toFixed(1),
          lastModified: new Date(file.lastModified).toISOString(),
        },
        rawBytes: bytes,
      }
    }))
    setDocuments(prev => [...prev, ...newDocs])
    setIsCapturing(false)
    e.target.value = ''
  }

  function updateDoc(id: string, field: keyof CapturedDoc, value: string) {
    setDocuments(prev => prev.map(d => d.id === id ? { ...d, [field]: value } : d))
  }

  function removeDoc(id: string) {
    setDocuments(prev => prev.filter(d => d.id !== id))
  }

  async function sealBatch() {
    if (!batchName || documents.length === 0) {
      alert('Please add a batch name and capture at least one document.')
      return
    }
    setStatus('sealing')
    try {
      const { default: JSZip } = await import('jszip')
      const zip = new JSZip()
      const encoder = new TextEncoder()

      const manifest = {
        captureId,
        batchName,
        organisation,
        capturedAt: new Date().toISOString(),
        documents: documents.map(d => ({
          id: d.id,
          name: d.name,
          size: d.size,
          hash: d.hash,
          capturedAt: d.capturedAt,
          classification: d.classification,
          suggestedCategory: d.suggestedCategory,
          confidence: d.confidence,
          extractedMetadata: d.extractedMetadata,
        })),
        statistics: {
          totalDocuments: documents.length,
          totalSize: documents.reduce((s, d) => s + d.size, 0),
          highConfidence: documents.filter(d => d.confidence === 'high').length,
          mediumConfidence: documents.filter(d => d.confidence === 'medium').length,
          lowConfidence: documents.filter(d => d.confidence === 'low').length,
          categories: Object.fromEntries(
            AUTO_CATEGORIES.map(cat => [cat, documents.filter(d => d.suggestedCategory === cat).length] as [string, number]).filter(([, count]) => count > 0)
          ),
        },
      }

      const manifestHash = await sha256hex(encoder.encode(JSON.stringify(manifest, null, 2)))

      zip.file('bundle.json', JSON.stringify({
        format: 'udz',
        type: 'capture-batch',
        captureId,
        manifestHash,
        batchName,
        created: new Date().toISOString(),
        documentCount: documents.length,
      }, null, 2))
      zip.file('capture-manifest.json', JSON.stringify(manifest, null, 2))

      documents.forEach(doc => {
        zip.file(`documents/${doc.name}`, doc.rawBytes)
      })

      const blob = await zip.generateAsync({ type: 'blob' })
      const safeName = batchName.replace(/[^a-z0-9]/gi, '-').toLowerCase().slice(0, 25)
      const fname = `capture-${safeName}-${captureId}.udz`
      setFilename(fname)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = fname; a.click()
      URL.revokeObjectURL(url)
      setStatus('done')
    } catch {
      setStatus('error')
    }
  }

  const inputCls = 'w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:border-[#c8960a]'
  const labelCls = 'block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide'

  const CONFIDENCE_COLOURS = { high: 'text-green-700 bg-green-50', medium: 'text-amber-700 bg-amber-50', low: 'text-gray-500 bg-gray-100' }

  return (
    <main className="min-h-screen bg-[#fafaf8] text-[#1e2d3d]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      <TooltipTour engineId="capture" tips={tourSteps['capture'] ?? []} />

      <div className="bg-[#c8960a] text-white text-center py-2 text-sm font-medium">
        Beta — Enterprise features free during beta
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 style={{ fontFamily: 'Playfair Display, serif' }} className="text-3xl font-bold mb-2">
            UD Capture
          </h1>
          <p className="text-gray-500 text-sm">
            Bulk document ingestion with automatic classification. Drop any documents — filenames and types
            are analysed to suggest categories. Review, correct, then seal as a tamper-evident .udz bundle.
          </p>
          <span className="inline-block mt-2 px-2 py-0.5 text-xs rounded font-semibold text-white" style={{ background: '#1e2d3d' }}>
            Enterprise · Free during beta
          </span>
        </div>

        {/* Batch Config */}
        <section data-tour="batch-setup" className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
          <h2 style={{ fontFamily: 'Playfair Display, serif' }} className="text-lg font-semibold mb-4">Capture Batch</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Batch Name *</label>
              <input value={batchName} onChange={e => setBatchName(e.target.value)} className={inputCls} placeholder="e.g. Q1 2026 Supplier Invoices" />
            </div>
            <div>
              <label className={labelCls}>Organisation</label>
              <input value={organisation} onChange={e => setOrganisation(e.target.value)} className={inputCls} placeholder="Your organisation" />
            </div>
            <div className="text-xs text-gray-400 font-mono flex items-center">Capture ID: {captureId}</div>
          </div>
        </section>

        {/* Drop Zone */}
        <section data-tour="capture-zone" className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
          <h2 style={{ fontFamily: 'Playfair Display, serif' }} className="text-lg font-semibold mb-4">
            Document Ingestion
            {documents.length > 0 && <span className="ml-2 text-sm font-normal text-gray-400">({documents.length} captured)</span>}
          </h2>
          <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-[#c8960a] transition-colors text-center">
            <span className="text-4xl mb-3">📥</span>
            <p className="text-sm font-medium">{isCapturing ? 'Classifying documents…' : 'Drop documents here or click to browse'}</p>
            <p className="text-xs text-gray-400 mt-1">Any file type · SHA-256 computed locally · Auto-classification by filename</p>
            <input type="file" multiple className="hidden" onChange={captureFiles} disabled={isCapturing} />
          </label>

          {documents.length > 0 && (
            <div className="mt-4">
              {/* Stats summary */}
              <div className="flex gap-3 mb-4 flex-wrap">
                {(['high', 'medium', 'low'] as const).map(conf => {
                  const count = documents.filter(d => d.confidence === conf).length
                  return count > 0 ? (
                    <span key={conf} className={`px-2 py-1 rounded text-xs font-medium ${CONFIDENCE_COLOURS[conf]}`}>
                      {count} {conf} confidence
                    </span>
                  ) : null
                })}
              </div>
              <div className="space-y-2">
                {documents.map(doc => (
                  <div key={doc.id} className="p-3 rounded-lg border border-gray-100 bg-gray-50">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="text-sm font-medium truncate">{doc.name}</p>
                          <span className={`flex-shrink-0 px-1.5 py-0.5 rounded text-xs font-medium ${CONFIDENCE_COLOURS[doc.confidence]}`}>
                            {doc.confidence}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <select
                            value={doc.suggestedCategory}
                            onChange={e => updateDoc(doc.id, 'suggestedCategory', e.target.value)}
                            className="text-xs px-2 py-0.5 border border-gray-200 rounded bg-white"
                          >
                            {AUTO_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                          </select>
                          <select
                            value={doc.classification}
                            onChange={e => updateDoc(doc.id, 'classification', e.target.value)}
                            className="text-xs px-2 py-0.5 border border-gray-200 rounded bg-white"
                          >
                            {['Public', 'Internal', 'Confidential', 'Strictly Confidential'].map(c => <option key={c}>{c}</option>)}
                          </select>
                        </div>
                        <p className="text-xs text-gray-400 font-mono mt-1">{doc.hash.slice(0, 16)}… · {doc.extractedMetadata.sizeKB} KB</p>
                      </div>
                      <button onClick={() => removeDoc(doc.id)} className="text-xs text-red-400 hover:text-red-600 flex-shrink-0 mt-1">✕</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        <div className="text-center">
          <button onClick={sealBatch} disabled={status === 'sealing' || documents.length === 0} className="px-8 py-3 rounded-xl text-white font-semibold text-lg disabled:opacity-50" style={{ background: '#c8960a' }}>
            {status === 'sealing' ? 'Sealing batch…' : `Seal Capture Bundle (.udz)`}
          </button>
          {status === 'done' && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 text-sm font-semibold">Capture bundle sealed</p>
              <p className="text-green-700 text-xs mt-1 font-mono">{filename}</p>
              <p className="text-green-600 text-xs mt-1">{documents.length} documents ingested and classified.</p>
            </div>
          )}
          {status === 'error' && <p className="mt-4 text-red-600 text-sm">Sealing failed — please try again.</p>}
        </div>

        <section className="mt-16">
          <h2 style={{ fontFamily: 'Playfair Display, serif' }} className="text-2xl font-bold mb-6">
            How UD Capture differs from document scanners / SharePoint auto-classification
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { title: 'Privacy-first processing', body: 'All SHA-256 hashing and classification analysis happens in your browser. No document content is uploaded to any server.' },
              { title: 'Tamper-evident from day one', body: 'Each captured document\'s hash is recorded at ingestion time. Any subsequent alteration of a document is immediately detectable.' },
              { title: 'Human-reviewable classification', body: 'Auto-classification confidence is shown per document. You correct and override before sealing — no silent misclassification.' },
              { title: 'Portable archive', body: 'The sealed .udz is a standard ZIP with a JSON manifest. No SharePoint, no ECM platform — access your captures with any tool.' },
            ].map(c => (
              <div key={c.title} className="bg-white rounded-xl border border-gray-200 p-4">
                <h3 className="font-semibold text-sm mb-1">{c.title}</h3>
                <p className="text-gray-500 text-xs">{c.body}</p>
              </div>
            ))}
          </div>
        </section>

        <p className="text-center text-xs text-gray-400 mt-12">No ads. No investors. No agenda.</p>
      </div>
    </main>
  )
}
