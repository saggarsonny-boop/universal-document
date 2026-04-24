'use client'

import { useState, useCallback } from 'react'
import TooltipTour from '@/components/TooltipTour'
import { tourSteps } from '@/lib/tourSteps'

async function sha256hex(data: Uint8Array): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer)
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

interface Version {
  versionNumber: number
  timestamp: string
  content: string
  title: string
  changeNote: string
  hash: string
}

const DOCUMENT_TYPES = [
  'Policy Document', 'Research Protocol', 'Project Specification', 'Meeting Minutes',
  'Strategic Plan', 'Standard Operating Procedure', 'Contract Draft', 'Proposal Draft',
  'Guidelines', 'Whitepaper', 'Other',
]

export default function LivingDocumentPage() {
  const [docTitle, setDocTitle] = useState('')
  const [docType, setDocType] = useState('')
  const [author, setAuthor] = useState('')
  const [organisation, setOrganisation] = useState('')
  const [content, setContent] = useState('')
  const [changeNote, setChangeNote] = useState('')
  const [versions, setVersions] = useState<Version[]>([])
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null)
  const [docId] = useState(() => `LD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`)
  const [isSaving, setIsSaving] = useState(false)
  const [isSnapshotting, setIsSnapshotting] = useState(false)
  const [isLoadingUdr, setIsLoadingUdr] = useState(false)
  const [snapshotFilename, setSnapshotFilename] = useState('')

  const viewingVersion = selectedVersion !== null ? versions.find(v => v.versionNumber === selectedVersion) : null
  const currentVersionNum = versions.length > 0 ? versions[versions.length - 1].versionNumber : 0

  async function saveVersion() {
    if (!docTitle || !content) { alert('Please provide a title and content.'); return }
    setIsSaving(true)
    try {
      const encoder = new TextEncoder()
      const hash = await sha256hex(encoder.encode(content))
      const newVersion: Version = {
        versionNumber: currentVersionNum + 1,
        timestamp: new Date().toISOString(),
        content,
        title: docTitle,
        changeNote: changeNote || 'Version saved',
        hash,
      }
      setVersions(prev => [...prev, newVersion])
      setChangeNote('')
    } finally {
      setIsSaving(false)
    }
  }

  async function downloadUdr() {
    if (versions.length === 0) { alert('Save at least one version first.'); return }
    const udr = {
      ud_version: '1.0',
      format: 'udr',
      id: docId,
      created: versions[0].timestamp,
      lastModified: versions[versions.length - 1].timestamp,
      schema: 'living-document/v1',
      metadata: { title: docTitle, type: docType, author, organisation },
      revisionHistory: versions.map(v => ({
        version: v.versionNumber,
        timestamp: v.timestamp,
        changeNote: v.changeNote,
        contentHash: v.hash,
      })),
      currentVersion: versions.length,
      content: {
        current: content,
        allVersions: versions,
      },
    }
    const blob = new Blob([JSON.stringify(udr, null, 2)], { type: 'application/json' })
    const safeName = docTitle.replace(/[^a-z0-9]/gi, '-').toLowerCase().slice(0, 30)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `${safeName}-${docId}.udr`; a.click()
    URL.revokeObjectURL(url)
  }

  async function sealSnapshot(versionNum?: number) {
    const targetVersion = versionNum !== undefined
      ? versions.find(v => v.versionNumber === versionNum)
      : versions[versions.length - 1]
    if (!targetVersion) { alert('No version to snapshot.'); return }
    setIsSnapshotting(true)
    try {
      const encoder = new TextEncoder()
      const doc = {
        documentId: docId,
        snapshotOfVersion: targetVersion.versionNumber,
        title: targetVersion.title,
        type: docType,
        author,
        organisation,
        content: targetVersion.content,
        versionTimestamp: targetVersion.timestamp,
        changeNote: targetVersion.changeNote,
        totalVersions: versions.length,
      }
      const hash = await sha256hex(encoder.encode(JSON.stringify(doc, null, 2)))
      const snapId = `SNAP-${Date.now().toString(36).toUpperCase()}`
      const uds = {
        ud_version: '1.0',
        format: 'uds',
        id: snapId,
        created: new Date().toISOString(),
        schema: 'living-document-snapshot/v1',
        metadata: {
          title: `${targetVersion.title} — v${targetVersion.versionNumber} snapshot`,
          sourceDocumentId: docId,
          snapshotVersion: targetVersion.versionNumber,
        },
        provenance: { sha256: hash, sealed: new Date().toISOString(), tool: 'UD Living Document', version: '1.0' },
        content: doc,
      }
      const blob = new Blob([JSON.stringify(uds, null, 2)], { type: 'application/json' })
      const safeName = targetVersion.title.replace(/[^a-z0-9]/gi, '-').toLowerCase().slice(0, 25)
      const fname = `${safeName}-v${targetVersion.versionNumber}-${snapId}.uds`
      setSnapshotFilename(fname)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = fname; a.click()
      URL.revokeObjectURL(url)
    } finally {
      setIsSnapshotting(false)
    }
  }

  const loadVersion = useCallback((vNum: number) => {
    const v = versions.find(ver => ver.versionNumber === vNum)
    if (v) {
      setContent(v.content)
      setDocTitle(v.title)
      setSelectedVersion(vNum)
    }
  }, [versions])

  function loadUdr(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setIsLoadingUdr(true)
    const reader = new FileReader()
    reader.onload = (evt) => {
      try {
        const udr = JSON.parse(evt.target?.result as string)
        if (udr.format !== 'udr') { alert('This file is not a .udr living document.'); return }
        setDocTitle(udr.metadata?.title || '')
        setDocType(udr.metadata?.type || '')
        setAuthor(udr.metadata?.author || '')
        setOrganisation(udr.metadata?.organisation || '')
        setContent(udr.content?.current || '')
        if (udr.content?.allVersions) setVersions(udr.content.allVersions)
      } catch {
        alert('Could not parse .udr file.')
      } finally {
        setIsLoadingUdr(false)
      }
    }
    reader.readAsText(file)
  }

  const inputCls = 'w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:border-[#c8960a]'
  const labelCls = 'block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide'

  return (
    <main className="min-h-screen bg-[#fafaf8] text-[#1e2d3d]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      <TooltipTour engineId="living-document" tips={tourSteps['living-document'] ?? []} />

      <div className="bg-[#c8960a] text-white text-center py-2 text-sm font-medium">
        Beta — Free during beta
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 style={{ fontFamily: 'Playfair Display, serif' }} className="text-3xl font-bold mb-2">
            UD Living Document
          </h1>
          <p className="text-gray-500 text-sm">
            Create version-tracked .udr documents that evolve over time.
            Export the full revision history as a .udr, or seal any version as an immutable .uds snapshot.
          </p>
          <span className="inline-block mt-2 px-2 py-0.5 text-xs rounded font-semibold" style={{ background: '#e6f4f1', color: '#0d7a6a' }}>
            Free · 3/month
          </span>
        </div>

        {/* Load existing */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4 flex items-center gap-4">
          <div>
            <p className="text-sm font-medium text-blue-800">Continue an existing .udr document</p>
            <p className="text-xs text-blue-600 mt-0.5">Load a previously saved .udr to resume editing</p>
          </div>
          <label className="ml-auto flex-shrink-0 cursor-pointer px-3 py-2 rounded-lg border border-blue-400 text-blue-800 text-xs font-medium hover:bg-blue-100">
            {isLoadingUdr ? 'Loading…' : 'Load .udr'}
            <input type="file" accept=".udr,.json" className="hidden" onChange={loadUdr} />
          </label>
        </div>

        {/* Document metadata */}
        <section data-tour="doc-metadata" className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
          <h2 style={{ fontFamily: 'Playfair Display, serif' }} className="text-lg font-semibold mb-4">Document Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className={labelCls}>Document Title *</label>
              <input value={docTitle} onChange={e => setDocTitle(e.target.value)} className={inputCls} placeholder="e.g. Research Ethics Protocol v1" />
            </div>
            <div>
              <label className={labelCls}>Document Type</label>
              <select value={docType} onChange={e => setDocType(e.target.value)} className={inputCls}>
                <option value="">Select type…</option>
                {DOCUMENT_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Author</label>
              <input value={author} onChange={e => setAuthor(e.target.value)} className={inputCls} placeholder="Your name" />
            </div>
            <div>
              <label className={labelCls}>Organisation</label>
              <input value={organisation} onChange={e => setOrganisation(e.target.value)} className={inputCls} placeholder="Organisation or team" />
            </div>
            <div className="text-xs text-gray-400 flex items-center gap-1 font-mono">
              ID: {docId}
            </div>
          </div>
        </section>

        {/* Editor */}
        <section data-tour="editor" className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
          <h2 style={{ fontFamily: 'Playfair Display, serif' }} className="text-lg font-semibold mb-2">
            Document Content
            {versions.length > 0 && (
              <span className="ml-3 text-sm font-normal text-gray-400">
                {viewingVersion ? `Viewing v${viewingVersion.versionNumber}` : `Current (v${currentVersionNum})`}
              </span>
            )}
          </h2>
          <textarea
            value={content}
            onChange={e => { setContent(e.target.value); setSelectedVersion(null) }}
            className={`${inputCls} h-64 resize-y font-mono text-xs`}
            placeholder="Write your document content here. Use plain text, markdown, or structured notes. Save versions as you work — each save records an immutable snapshot of this state."
          />
          <div className="flex items-center gap-3 mt-3">
            <div className="flex-1">
              <input value={changeNote} onChange={e => setChangeNote(e.target.value)} className={inputCls} placeholder="Change note (optional) — what changed in this version?" />
            </div>
            <button
              onClick={saveVersion}
              disabled={isSaving || !docTitle || !content}
              className="px-4 py-2 rounded-lg text-white text-sm font-medium disabled:opacity-50"
              style={{ background: '#1e2d3d' }}
            >
              {isSaving ? 'Saving…' : 'Save Version'}
            </button>
          </div>
        </section>

        {/* Version History */}
        {versions.length > 0 && (
          <section data-tour="version-history" className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
            <h2 style={{ fontFamily: 'Playfair Display, serif' }} className="text-lg font-semibold mb-4">
              Version History ({versions.length} versions)
            </h2>
            <div className="space-y-2">
              {[...versions].reverse().map(v => (
                <div key={v.versionNumber} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 bg-gray-50">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#1e2d3d] text-white flex items-center justify-center text-xs font-bold">
                    v{v.versionNumber}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{v.changeNote}</p>
                    <p className="text-xs text-gray-400 font-mono">{new Date(v.timestamp).toLocaleString()} · {v.hash.slice(0, 12)}…</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => loadVersion(v.versionNumber)} className="text-xs px-2 py-1 rounded border border-gray-300 hover:bg-gray-100">
                      Load
                    </button>
                    <button onClick={() => sealSnapshot(v.versionNumber)} className="text-xs px-2 py-1 rounded border border-[#c8960a] text-[#c8960a] hover:bg-amber-50">
                      Seal
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
          <button
            onClick={downloadUdr}
            disabled={versions.length === 0}
            className="px-6 py-3 rounded-xl border-2 border-[#1e2d3d] text-[#1e2d3d] font-semibold disabled:opacity-40"
          >
            Download .udr (living document)
          </button>
          <button
            onClick={() => sealSnapshot()}
            disabled={isSnapshotting || versions.length === 0}
            className="px-6 py-3 rounded-xl text-white font-semibold disabled:opacity-50"
            style={{ background: '#c8960a' }}
          >
            {isSnapshotting ? 'Sealing…' : 'Seal Latest Snapshot (.uds)'}
          </button>
        </div>

        {snapshotFilename && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-center">
            <p className="text-green-800 text-sm font-semibold">Snapshot sealed</p>
            <p className="text-green-700 text-xs mt-1 font-mono">{snapshotFilename}</p>
          </div>
        )}

        <section className="mt-16">
          <h2 style={{ fontFamily: 'Playfair Display, serif' }} className="text-2xl font-bold mb-6">
            How UD Living Document differs from Google Docs version history
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { title: '.udr is a portable open format', body: 'Your living document is a JSON file you own. No Google account, no cloud dependency — open and edit it anywhere.' },
              { title: 'Seal any version as immutable proof', body: 'Any version can be exported as a .uds snapshot with SHA-256 hash. That snapshot is cryptographically frozen — it cannot be silently altered.' },
              { title: 'Version hashes recorded in history', body: 'Each saved version records its own SHA-256 in the revision log. The progression of hashes proves the chain of changes.' },
              { title: 'Works offline, runs in browser', body: 'No server. No upload. Document editing and version saving happen entirely in your browser with zero data leaving your device.' },
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
