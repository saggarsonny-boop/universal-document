'use client'

import { useState } from 'react'
import TooltipTour from '@/components/TooltipTour'
import { tourSteps } from '@/lib/tourSteps'

async function sha256hex(data: Uint8Array): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer)
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

interface VaultDocument {
  id: string
  name: string
  category: string
  hash: string
  size: number
  addedAt: string
  retentionPolicy: string
  classification: string
  rawBytes?: Uint8Array
}

const CLASSIFICATIONS = ['Public', 'Internal', 'Confidential', 'Strictly Confidential', 'Restricted']
const RETENTION_POLICIES = ['1 year', '3 years', '5 years', '7 years', '10 years', '20 years', 'Permanent', 'Until superseded']
const DOC_CATEGORIES = [
  'Contracts & Agreements', 'HR Records', 'Financial Records', 'Compliance & Regulatory',
  'Intellectual Property', 'Board & Governance', 'Health & Safety', 'Project Records',
  'Correspondence', 'Policies & Procedures', 'Other',
]

export default function DocumentVaultPage() {
  const [vaultName, setVaultName] = useState('')
  const [organisation, setOrganisation] = useState('')
  const [custodian, setCustodian] = useState('')
  const [accessPolicy, setAccessPolicy] = useState('')
  const [defaultRetention, setDefaultRetention] = useState('7 years')
  const [defaultClassification, setDefaultClassification] = useState('Confidential')
  const [documents, setDocuments] = useState<VaultDocument[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [addRetention, setAddRetention] = useState('7 years')
  const [addClassification, setAddClassification] = useState('Confidential')
  const [addCategory, setAddCategory] = useState('')
  const [status, setStatus] = useState<'idle' | 'sealing' | 'done' | 'error'>('idle')
  const [filename, setFilename] = useState('')

  async function addDocuments(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setIsAdding(true)
    const newDocs: VaultDocument[] = await Promise.all(files.map(async (file) => {
      const bytes = new Uint8Array(await file.arrayBuffer())
      const hash = await sha256hex(bytes)
      return {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: file.name,
        category: addCategory,
        hash,
        size: file.size,
        addedAt: new Date().toISOString(),
        retentionPolicy: addRetention,
        classification: addClassification,
        rawBytes: bytes,
      }
    }))
    setDocuments(prev => [...prev, ...newDocs])
    setIsAdding(false)
    e.target.value = ''
  }

  function removeDoc(id: string) {
    setDocuments(prev => prev.filter(d => d.id !== id))
  }

  function updateDoc(id: string, field: keyof VaultDocument, value: string) {
    setDocuments(prev => prev.map(d => d.id === id ? { ...d, [field]: value } : d))
  }

  async function sealVault() {
    if (!vaultName || !organisation || documents.length === 0) {
      alert('Please fill in vault name, organisation, and add at least one document.')
      return
    }
    setStatus('sealing')
    try {
      const { default: JSZip } = await import('jszip')
      const zip = new JSZip()
      const encoder = new TextEncoder()

      const manifest = {
        vault: {
          name: vaultName,
          organisation,
          custodian,
          accessPolicy,
          defaultRetention,
          defaultClassification,
          created: new Date().toISOString(),
        },
        documents: documents.map(d => ({
          id: d.id,
          name: d.name,
          category: d.category,
          hash: d.hash,
          size: d.size,
          addedAt: d.addedAt,
          retentionPolicy: d.retentionPolicy,
          classification: d.classification,
        })),
        statistics: {
          totalDocuments: documents.length,
          totalSize: documents.reduce((s, d) => s + d.size, 0),
          categories: [...new Set(documents.map(d => d.category).filter(Boolean))],
          classifications: [...new Set(documents.map(d => d.classification))],
        },
      }

      const manifestHash = await sha256hex(encoder.encode(JSON.stringify(manifest, null, 2)))
      const vaultId = `VAULT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`

      const vaultRecord = {
        ud_version: '1.0',
        format: 'uds',
        id: vaultId,
        created: new Date().toISOString(),
        schema: 'document-vault/v1',
        metadata: {
          title: `Document Vault — ${vaultName}`,
          organisation,
          custodian,
          documentCount: documents.length,
        },
        provenance: { sha256: manifestHash, sealed: new Date().toISOString(), tool: 'UD Document Vault', version: '1.0' },
        content: manifest,
      }

      zip.file('vault.uds', JSON.stringify(vaultRecord, null, 2))
      zip.file('bundle.json', JSON.stringify({
        format: 'udz',
        type: 'document-vault',
        vaultId,
        manifestHash,
        created: new Date().toISOString(),
        documentCount: documents.length,
      }, null, 2))

      documents.forEach(doc => {
        if (doc.rawBytes) {
          zip.file(`documents/${doc.name}`, doc.rawBytes)
        }
      })

      const blob = await zip.generateAsync({ type: 'blob' })
      const safeName = vaultName.replace(/[^a-z0-9]/gi, '-').toLowerCase().slice(0, 25)
      const fname = `document-vault-${safeName}-${vaultId}.udz`
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
      <TooltipTour engineId="document-vault" tips={tourSteps['document-vault'] ?? []} />

      <div className="bg-[#c8960a] text-white text-center py-2 text-sm font-medium">
        Beta — Enterprise features free during beta
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 style={{ fontFamily: 'Playfair Display, serif' }} className="text-3xl font-bold mb-2">
            UD Document Vault
          </h1>
          <p className="text-gray-500 text-sm">
            Organisation-level governed document storage. Bundle documents with retention policies,
            access classifications, and custodian records — sealed as a tamper-evident .udz archive.
          </p>
          <span className="inline-block mt-2 px-2 py-0.5 text-xs rounded font-semibold text-white" style={{ background: '#1e2d3d' }}>
            Enterprise · Free during beta
          </span>
        </div>

        {/* Vault Details */}
        <section data-tour="vault-config" className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
          <h2 style={{ fontFamily: 'Playfair Display, serif' }} className="text-lg font-semibold mb-4">Vault Configuration</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Vault Name *</label>
              <input value={vaultName} onChange={e => setVaultName(e.target.value)} className={inputCls} placeholder="e.g. Q1 2026 Contracts, HR Records Archive" />
            </div>
            <div>
              <label className={labelCls}>Organisation *</label>
              <input value={organisation} onChange={e => setOrganisation(e.target.value)} className={inputCls} placeholder="Legal entity name" />
            </div>
            <div>
              <label className={labelCls}>Custodian (responsible person)</label>
              <input value={custodian} onChange={e => setCustodian(e.target.value)} className={inputCls} placeholder="Name and role" />
            </div>
            <div>
              <label className={labelCls}>Default Retention Policy</label>
              <select value={defaultRetention} onChange={e => setDefaultRetention(e.target.value)} className={inputCls}>
                {RETENTION_POLICIES.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Default Classification</label>
              <select value={defaultClassification} onChange={e => setDefaultClassification(e.target.value)} className={inputCls}>
                {CLASSIFICATIONS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="mt-4">
            <label className={labelCls}>Access Policy</label>
            <textarea value={accessPolicy} onChange={e => setAccessPolicy(e.target.value)} className={`${inputCls} h-20 resize-none`} placeholder="Who may access this vault, under what conditions, and what approval process is required…" />
          </div>
        </section>

        {/* Add Documents */}
        <section data-tour="documents" className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
          <h2 style={{ fontFamily: 'Playfair Display, serif' }} className="text-lg font-semibold mb-4">Documents</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
            <div>
              <label className={labelCls}>Category for uploads</label>
              <select value={addCategory} onChange={e => setAddCategory(e.target.value)} className={inputCls}>
                <option value="">Select category…</option>
                {DOC_CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Retention</label>
              <select value={addRetention} onChange={e => setAddRetention(e.target.value)} className={inputCls}>
                {RETENTION_POLICIES.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Classification</label>
              <select value={addClassification} onChange={e => setAddClassification(e.target.value)} className={inputCls}>
                {CLASSIFICATIONS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <label className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-[#c8960a] transition-colors">
            <span className="text-2xl">📂</span>
            <div>
              <p className="text-sm font-medium">{isAdding ? 'Hashing files…' : 'Click to add documents'}</p>
              <p className="text-xs text-gray-400">Any file type. SHA-256 computed locally — files never leave your device.</p>
            </div>
            <input type="file" multiple className="hidden" onChange={addDocuments} disabled={isAdding} />
          </label>

          {documents.length > 0 && (
            <div className="mt-4 space-y-2">
              {documents.map(doc => (
                <div key={doc.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{doc.name}</p>
                    <div className="flex gap-2 mt-1">
                      <select value={doc.category} onChange={e => updateDoc(doc.id, 'category', e.target.value)} className="text-xs px-2 py-0.5 border border-gray-200 rounded bg-white">
                        <option value="">Category…</option>
                        {DOC_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                      </select>
                      <select value={doc.classification} onChange={e => updateDoc(doc.id, 'classification', e.target.value)} className="text-xs px-2 py-0.5 border border-gray-200 rounded bg-white">
                        {CLASSIFICATIONS.map(c => <option key={c}>{c}</option>)}
                      </select>
                      <select value={doc.retentionPolicy} onChange={e => updateDoc(doc.id, 'retentionPolicy', e.target.value)} className="text-xs px-2 py-0.5 border border-gray-200 rounded bg-white">
                        {RETENTION_POLICIES.map(r => <option key={r}>{r}</option>)}
                      </select>
                    </div>
                    <p className="text-xs text-gray-400 font-mono mt-1">{doc.hash.slice(0, 20)}… · {(doc.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <button onClick={() => removeDoc(doc.id)} className="text-xs text-red-400 hover:text-red-600 flex-shrink-0">✕</button>
                </div>
              ))}
              <div className="text-xs text-gray-400 text-right">{documents.length} document{documents.length !== 1 ? 's' : ''} · {(documents.reduce((s, d) => s + d.size, 0) / 1024).toFixed(1)} KB total</div>
            </div>
          )}
        </section>

        <div className="text-center">
          <button onClick={sealVault} disabled={status === 'sealing' || documents.length === 0} className="px-8 py-3 rounded-xl text-white font-semibold text-lg disabled:opacity-50" style={{ background: '#c8960a' }}>
            {status === 'sealing' ? 'Sealing vault…' : 'Seal Document Vault (.udz)'}
          </button>
          {status === 'done' && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 text-sm font-semibold">Document vault sealed</p>
              <p className="text-green-700 text-xs mt-1 font-mono">{filename}</p>
              <p className="text-green-600 text-xs mt-1">{documents.length} documents bundled with retention and classification metadata.</p>
            </div>
          )}
          {status === 'error' && <p className="mt-4 text-red-600 text-sm">Sealing failed — please try again.</p>}
        </div>

        <section className="mt-16">
          <h2 style={{ fontFamily: 'Playfair Display, serif' }} className="text-2xl font-bold mb-6">
            How UD Document Vault differs from SharePoint / Box / file archiving software
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { title: 'Retention policy is sealed into the archive', body: 'Each document\'s retention period and classification is cryptographically locked in the .udz manifest — it cannot be silently changed after sealing.' },
              { title: 'Zero-upload privacy', body: 'SHA-256 hashing happens in your browser. Files never leave your device. The vault bundle is assembled locally and downloaded directly.' },
              { title: 'Portable, no platform dependency', body: 'A .udz file is a ZIP you own. Open it with any tool. No SharePoint licence, no cloud storage subscription required to access your own archive.' },
              { title: 'Tamper-evident manifest', body: 'The bundle.json manifest hash covers all document hashes. Adding, removing, or altering any file breaks the manifest — providing a clear audit trail.' },
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
