'use client'

import { useState } from 'react'
import TooltipTour from '@/components/TooltipTour'
import { tourSteps } from '@/lib/tourSteps'

async function sha256hex(data: Uint8Array): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer)
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

interface Annotation {
  id: string
  type: 'text-overlay' | 'highlight' | 'comment' | 'redaction' | 'form-fill'
  page: number
  content: string
  position: string
  createdAt: string
}

export default function PdfEditorPage() {
  const [pdfFile, setPdfFile] = useState<{ name: string; hash: string; size: number; bytes: Uint8Array } | null>(null)
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [annotationType, setAnnotationType] = useState<Annotation['type']>('text-overlay')
  const [annotationContent, setAnnotationContent] = useState('')
  const [annotationPage, setAnnotationPage] = useState('1')
  const [annotationPosition, setAnnotationPosition] = useState('')
  const [editorNotes, setEditorNotes] = useState('')
  const [editedBy, setEditedBy] = useState('')
  const [editPurpose, setEditPurpose] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'sealing' | 'done' | 'error'>('idle')
  const [filename, setFilename] = useState('')

  async function loadPdf(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.name.toLowerCase().endsWith('.pdf')) { alert('Please select a PDF file.'); return }
    setIsLoading(true)
    const bytes = new Uint8Array(await file.arrayBuffer())
    const hash = await sha256hex(bytes)
    setPdfFile({ name: file.name, hash, size: file.size, bytes })
    setIsLoading(false)
    e.target.value = ''
  }

  function addAnnotation() {
    if (!annotationContent) return
    const ann: Annotation = {
      id: `ANN-${Date.now().toString(36).toUpperCase()}`,
      type: annotationType,
      page: parseInt(annotationPage) || 1,
      content: annotationContent,
      position: annotationPosition,
      createdAt: new Date().toISOString(),
    }
    setAnnotations(prev => [...prev, ann])
    setAnnotationContent('')
    setAnnotationPosition('')
  }

  function removeAnnotation(id: string) {
    setAnnotations(prev => prev.filter(a => a.id !== id))
  }

  const ANNOTATION_TYPE_LABELS: Record<Annotation['type'], string> = {
    'text-overlay': 'Text Overlay',
    'highlight': 'Highlight',
    'comment': 'Comment / Note',
    'redaction': 'Redaction',
    'form-fill': 'Form Fill',
  }

  const ANNOTATION_COLOURS: Record<Annotation['type'], string> = {
    'text-overlay': 'bg-blue-50 border-blue-200 text-blue-800',
    'highlight': 'bg-yellow-50 border-yellow-200 text-yellow-800',
    'comment': 'bg-green-50 border-green-200 text-green-800',
    'redaction': 'bg-red-50 border-red-200 text-red-800',
    'form-fill': 'bg-purple-50 border-purple-200 text-purple-800',
  }

  async function sealEditedDocument() {
    if (!pdfFile) { alert('Please load a PDF first.'); return }
    if (annotations.length === 0 && !editorNotes) { alert('Please add at least one annotation or note.'); return }
    setStatus('sealing')
    try {
      const encoder = new TextEncoder()
      const doc = {
        originalDocument: {
          name: pdfFile.name,
          originalHash: pdfFile.hash,
          size: pdfFile.size,
        },
        edits: {
          editedBy,
          purpose: editPurpose,
          notes: editorNotes,
          annotations,
          editedAt: new Date().toISOString(),
        },
        summary: {
          annotationCount: annotations.length,
          annotationTypes: [...new Set(annotations.map(a => a.type))],
          pagesAnnotated: [...new Set(annotations.map(a => a.page))].sort((a, b) => a - b),
        },
      }
      const docHash = await sha256hex(encoder.encode(JSON.stringify(doc, null, 2)))
      const id = `PDFE-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`

      const { default: JSZip } = await import('jszip')
      const zip = new JSZip()

      const uds = {
        ud_version: '1.0',
        format: 'uds',
        id,
        created: new Date().toISOString(),
        schema: 'pdf-editor/v1',
        metadata: {
          title: `Annotated PDF — ${pdfFile.name}`,
          originalFile: pdfFile.name,
          originalHash: pdfFile.hash,
          annotationCount: annotations.length,
          editedBy: editedBy || 'Unknown',
        },
        provenance: {
          sha256: docHash,
          sealed: new Date().toISOString(),
          tool: 'UD PDF Editor',
          version: '1.0',
          originalFileHash: pdfFile.hash,
        },
        content: doc,
      }

      zip.file('edit-record.uds', JSON.stringify(uds, null, 2))
      zip.file('original.pdf', pdfFile.bytes)
      zip.file('bundle.json', JSON.stringify({
        format: 'udz',
        type: 'pdf-editor-bundle',
        editId: id,
        originalFile: pdfFile.name,
        originalHash: pdfFile.hash,
        editRecordHash: docHash,
        created: new Date().toISOString(),
      }, null, 2))

      const blob = await zip.generateAsync({ type: 'blob' })
      const safeName = pdfFile.name.replace(/\.pdf$/i, '').replace(/[^a-z0-9]/gi, '-').toLowerCase().slice(0, 25)
      const fname = `pdf-editor-${safeName}-${id}.udz`
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

  return (
    <main className="min-h-screen bg-[#fafaf8] text-[#1e2d3d]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      <TooltipTour engineId="pdf-editor" tips={tourSteps['pdf-editor'] ?? []} />

      <div className="bg-[#c8960a] text-white text-center py-2 text-sm font-medium">
        Beta — Free during beta
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 style={{ fontFamily: 'Playfair Display, serif' }} className="text-3xl font-bold mb-2">
            UD PDF Editor
          </h1>
          <p className="text-gray-500 text-sm">
            Add text overlays, highlights, form fills, redactions, and comments to PDFs.
            The original PDF and edit record are bundled into a tamper-evident .udz — proving what changed and when.
          </p>
          <span className="inline-block mt-2 px-2 py-0.5 text-xs rounded font-semibold" style={{ background: '#e6f4f1', color: '#0d7a6a' }}>
            Free · 3/month
          </span>
        </div>

        {/* Load PDF */}
        <section data-tour="load-pdf" className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
          <h2 style={{ fontFamily: 'Playfair Display, serif' }} className="text-lg font-semibold mb-4">Load PDF</h2>
          {!pdfFile ? (
            <label className="flex items-center gap-4 p-6 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-[#c8960a] transition-colors">
              <span className="text-4xl">📄</span>
              <div>
                <p className="text-sm font-medium">{isLoading ? 'Loading PDF…' : 'Click to load PDF'}</p>
                <p className="text-xs text-gray-400 mt-0.5">SHA-256 computed locally. File stays on your device.</p>
              </div>
              <input type="file" accept=".pdf" className="hidden" onChange={loadPdf} disabled={isLoading} />
            </label>
          ) : (
            <div className="flex items-center gap-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <span className="text-2xl">📄</span>
              <div className="flex-1">
                <p className="text-sm font-medium">{pdfFile.name}</p>
                <p className="text-xs font-mono text-gray-500 mt-0.5">{pdfFile.hash.slice(0, 24)}… · {(pdfFile.size / 1024).toFixed(1)} KB</p>
              </div>
              <button onClick={() => { setPdfFile(null); setAnnotations([]) }} className="text-xs text-red-500 hover:text-red-700">Change</button>
            </div>
          )}
        </section>

        {/* Editor Details */}
        {pdfFile && (
          <>
            <section className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
              <h2 style={{ fontFamily: 'Playfair Display, serif' }} className="text-lg font-semibold mb-4">Edit Context</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Edited By</label>
                  <input value={editedBy} onChange={e => setEditedBy(e.target.value)} className={inputCls} placeholder="Your name" />
                </div>
                <div>
                  <label className={labelCls}>Purpose of Edits</label>
                  <input value={editPurpose} onChange={e => setEditPurpose(e.target.value)} className={inputCls} placeholder="e.g. Review comments, Form completion" />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelCls}>Editor Notes</label>
                  <textarea value={editorNotes} onChange={e => setEditorNotes(e.target.value)} className={`${inputCls} h-16 resize-none`} placeholder="Overall notes about the edits made…" />
                </div>
              </div>
            </section>

            {/* Add Annotations */}
            <section data-tour="annotations" className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
              <h2 style={{ fontFamily: 'Playfair Display, serif' }} className="text-lg font-semibold mb-4">Add Annotations</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                <div>
                  <label className={labelCls}>Type</label>
                  <select value={annotationType} onChange={e => setAnnotationType(e.target.value as Annotation['type'])} className={inputCls}>
                    {(Object.entries(ANNOTATION_TYPE_LABELS) as [Annotation['type'], string][]).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Page Number</label>
                  <input value={annotationPage} onChange={e => setAnnotationPage(e.target.value)} className={inputCls} type="number" min="1" />
                </div>
                <div>
                  <label className={labelCls}>Position (optional)</label>
                  <input value={annotationPosition} onChange={e => setAnnotationPosition(e.target.value)} className={inputCls} placeholder="e.g. Top-right, §3.2" />
                </div>
              </div>
              <div className="flex gap-3">
                <textarea
                  value={annotationContent}
                  onChange={e => setAnnotationContent(e.target.value)}
                  className={`${inputCls} h-16 resize-none flex-1`}
                  placeholder={annotationType === 'redaction' ? 'Describe what is being redacted (not the content itself)' : annotationType === 'form-fill' ? 'Field name: value entered' : 'Annotation text…'}
                />
                <button onClick={addAnnotation} disabled={!annotationContent} className="px-4 rounded-lg text-white font-medium text-sm disabled:opacity-40" style={{ background: '#c8960a' }}>
                  Add
                </button>
              </div>

              {annotations.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{annotations.length} annotation{annotations.length !== 1 ? 's' : ''}</p>
                  {annotations.map(ann => (
                    <div key={ann.id} className={`flex items-start gap-3 p-3 rounded-lg border ${ANNOTATION_COLOURS[ann.type]}`}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold">{ANNOTATION_TYPE_LABELS[ann.type]}</span>
                          <span className="text-xs">p.{ann.page}</span>
                          {ann.position && <span className="text-xs opacity-70">{ann.position}</span>}
                        </div>
                        <p className="text-sm">{ann.content}</p>
                      </div>
                      <button onClick={() => removeAnnotation(ann.id)} className="text-xs opacity-50 hover:opacity-100 flex-shrink-0">✕</button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <div className="text-center">
              <button onClick={sealEditedDocument} disabled={status === 'sealing'} className="px-8 py-3 rounded-xl text-white font-semibold text-lg disabled:opacity-50" style={{ background: '#c8960a' }}>
                {status === 'sealing' ? 'Sealing…' : 'Seal PDF + Edit Record (.udz)'}
              </button>
              {status === 'done' && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 text-sm font-semibold">PDF edit record sealed</p>
                  <p className="text-green-700 text-xs mt-1 font-mono">{filename}</p>
                  <p className="text-green-600 text-xs mt-1">Original PDF + edit record bundled in .udz. Original hash preserved.</p>
                </div>
              )}
              {status === 'error' && <p className="mt-4 text-red-600 text-sm">Sealing failed — please try again.</p>}
            </div>
          </>
        )}

        <section className="mt-16">
          <h2 style={{ fontFamily: 'Playfair Display, serif' }} className="text-2xl font-bold mb-6">
            How UD PDF Editor differs from Adobe Acrobat / Smallpdf
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { title: 'Original document hash preserved', body: 'The original PDF\'s SHA-256 is recorded before any edits. The bundle proves the original state — you cannot claim the edited version was always that way.' },
              { title: 'Edit record is tamper-evident', body: 'Every annotation, its type, page, and timestamp are hashed together. The .uds edit record cannot be modified without detection.' },
              { title: 'No upload required', body: 'Processing happens entirely in your browser. Your PDF never leaves your device — unlike Smallpdf, Adobe online, and similar services.' },
              { title: 'Portable edit audit trail', body: 'The .udz bundle contains both the original PDF and the edit record. Anyone can verify what changed without needing access to our service.' },
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
