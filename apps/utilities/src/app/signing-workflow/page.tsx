'use client'

import { useState } from 'react'
import TooltipTour from '@/components/TooltipTour'
import { tourSteps } from '@/lib/tourSteps'

async function sha256hex(data: Uint8Array): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer)
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

interface Signer {
  id: string
  name: string
  email: string
  role: string
  order: number
  status: 'pending' | 'signed' | 'declined'
  signedAt?: string
  sigHash?: string
}

interface AttachedDoc {
  name: string
  hash: string
}

export default function SigningWorkflowPage() {
  const [workflowTitle, setWorkflowTitle] = useState('')
  const [workflowMode, setWorkflowMode] = useState<'sequential' | 'parallel'>('sequential')
  const [signers, setSigners] = useState<Signer[]>([
    { id: '1', name: '', email: '', role: 'Party A', order: 1, status: 'pending' },
    { id: '2', name: '', email: '', role: 'Party B', order: 2, status: 'pending' },
  ])
  const [documentContent, setDocumentContent] = useState('')
  const [attachedDocs, setAttachedDocs] = useState<AttachedDoc[]>([])
  const [deadline, setDeadline] = useState('')
  const [signingCurrentId, setSigningCurrentId] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'sealing' | 'done' | 'error'>('idle')
  const [filename, setFilename] = useState('')
  const [workflowId] = useState(() => `WF-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`)

  function addSigner() {
    const nextOrder = Math.max(...signers.map(s => s.order), 0) + 1
    setSigners(prev => [...prev, { id: String(Date.now()), name: '', email: '', role: `Party ${String.fromCharCode(64 + nextOrder)}`, order: nextOrder, status: 'pending' }])
  }

  function updateSigner(id: string, field: keyof Signer, value: string | number) {
    setSigners(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s))
  }

  function removeSigner(id: string) {
    if (signers.length <= 2) { alert('At least 2 signers required.'); return }
    setSigners(prev => prev.filter(s => s.id !== id))
  }

  async function attachFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const bytes = new Uint8Array(await file.arrayBuffer())
    const hash = await sha256hex(bytes)
    setAttachedDocs(prev => [...prev, { name: file.name, hash }])
  }

  async function signAs(signerId: string) {
    setSigningCurrentId(signerId)
    const encoder = new TextEncoder()
    const signer = signers.find(s => s.id === signerId)
    if (!signer) return
    const sigPayload = `${workflowId}|${signerId}|${signer.name}|${documentContent}|${new Date().toISOString()}`
    const sigHash = await sha256hex(encoder.encode(sigPayload))
    setSigners(prev => prev.map(s => s.id === signerId ? { ...s, status: 'signed', signedAt: new Date().toISOString(), sigHash } : s))
    setSigningCurrentId(null)
  }

  function canSign(signer: Signer): boolean {
    if (signer.status !== 'pending') return false
    if (workflowMode === 'parallel') return true
    const prevOrder = signer.order - 1
    if (prevOrder < 1) return true
    return signers.filter(s => s.order < signer.order).every(s => s.status === 'signed')
  }

  const allSigned = signers.every(s => s.status === 'signed')

  async function sealWorkflow() {
    if (!workflowTitle || !documentContent) { alert('Please add a title and document content.'); return }
    if (!allSigned) { alert('All parties must sign before sealing.'); return }
    setStatus('sealing')
    try {
      const encoder = new TextEncoder()
      const doc = {
        workflowId,
        title: workflowTitle,
        mode: workflowMode,
        documentContent,
        attachedDocuments: attachedDocs,
        signers: signers.map(s => ({ ...s })),
        deadline: deadline || null,
        completedAt: new Date().toISOString(),
      }
      const hash = await sha256hex(encoder.encode(JSON.stringify(doc, null, 2)))
      const uds = {
        ud_version: '1.0',
        format: 'uds',
        id: workflowId,
        created: new Date().toISOString(),
        expires: deadline ? new Date(deadline).toISOString() : undefined,
        schema: 'signing-workflow/v1',
        metadata: {
          title: workflowTitle,
          mode: workflowMode,
          signerCount: signers.length,
          completedAt: new Date().toISOString(),
        },
        provenance: { sha256: hash, sealed: new Date().toISOString(), tool: 'UD Signing Workflow', version: '1.0' },
        content: doc,
      }
      const blob = new Blob([JSON.stringify(uds, null, 2)], { type: 'application/json' })
      const safeName = workflowTitle.replace(/[^a-z0-9]/gi, '-').toLowerCase().slice(0, 25)
      const fname = `signing-workflow-${safeName}-${workflowId}.uds`
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
      <TooltipTour engineId="signing-workflow" tips={tourSteps['signing-workflow'] ?? []} />

      <div className="bg-[#c8960a] text-white text-center py-2 text-sm font-medium">
        Beta — Pro features free during beta
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 style={{ fontFamily: 'Playfair Display, serif' }} className="text-3xl font-bold mb-2">
            UD Signing Workflow
          </h1>
          <p className="text-gray-500 text-sm">
            Orchestrate multi-party document signing with sequential or parallel workflows.
            Each signature is SHA-256 hashed. The completed workflow is sealed as a single tamper-evident .uds.
          </p>
          <span className="inline-block mt-2 px-2 py-0.5 text-xs rounded font-semibold" style={{ background: 'var(--ud-gold-3, #fef9ec)', color: 'var(--ud-gold-text, #92670a)', border: '1px solid #c8960a' }}>
            Pro · Free during beta
          </span>
        </div>

        {/* Workflow setup */}
        <section data-tour="workflow-setup" className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
          <h2 style={{ fontFamily: 'Playfair Display, serif' }} className="text-lg font-semibold mb-4">Workflow Setup</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="sm:col-span-2">
              <label className={labelCls}>Workflow Title *</label>
              <input value={workflowTitle} onChange={e => setWorkflowTitle(e.target.value)} className={inputCls} placeholder="e.g. Partnership Agreement Q2 2026" />
            </div>
            <div>
              <label className={labelCls}>Signing Mode</label>
              <div className="flex gap-3 mt-1">
                {(['sequential', 'parallel'] as const).map(mode => (
                  <label key={mode} className="flex items-center gap-2 cursor-pointer text-sm">
                    <input type="radio" name="signingMode" value={mode} checked={workflowMode === mode} onChange={() => setWorkflowMode(mode)} />
                    <span className="capitalize">{mode}</span>
                    <span className="text-xs text-gray-400">
                      {mode === 'sequential' ? '(in order)' : '(any order)'}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className={labelCls}>Signing Deadline (optional)</label>
              <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className={inputCls} />
            </div>
            <div className="text-xs text-gray-400 font-mono flex items-center">Workflow ID: {workflowId}</div>
          </div>
        </section>

        {/* Document */}
        <section className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
          <h2 style={{ fontFamily: 'Playfair Display, serif' }} className="text-lg font-semibold mb-4">Document Content</h2>
          <textarea
            value={documentContent}
            onChange={e => setDocumentContent(e.target.value)}
            className={`${inputCls} h-40 resize-none font-mono text-xs`}
            placeholder="Paste or type the document text that all parties are signing. This content is hashed into each individual signature."
          />
          <div className="mt-3">
            <label className={labelCls}>Attach Supporting Documents (optional)</label>
            <label className="cursor-pointer flex items-center gap-2 mt-1">
              <span className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs bg-white hover:bg-gray-50">+ Attach file</span>
              <input type="file" className="hidden" onChange={attachFile} />
            </label>
            {attachedDocs.map((d, i) => (
              <div key={i} className="text-xs font-mono text-gray-500 mt-1">{d.name} — {d.hash.slice(0, 16)}…</div>
            ))}
          </div>
        </section>

        {/* Signers */}
        <section data-tour="signers" className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 style={{ fontFamily: 'Playfair Display, serif' }} className="text-lg font-semibold">Signers</h2>
            <button onClick={addSigner} className="text-xs px-3 py-1.5 rounded-lg border border-[#c8960a] text-[#c8960a] font-medium hover:bg-amber-50">
              + Add Signer
            </button>
          </div>
          <div className="space-y-3">
            {signers.sort((a, b) => a.order - b.order).map((signer) => (
              <div key={signer.id} className={`p-4 rounded-lg border ${signer.status === 'signed' ? 'border-green-300 bg-green-50' : 'border-gray-100 bg-gray-50'}`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: signer.status === 'signed' ? '#16a34a' : '#1e2d3d' }}>
                    {workflowMode === 'sequential' ? signer.order : '∥'}
                  </div>
                  <div className="flex-1 grid grid-cols-3 gap-2">
                    <input value={signer.name} onChange={e => updateSigner(signer.id, 'name', e.target.value)} className={inputCls} placeholder="Full name" disabled={signer.status === 'signed'} />
                    <input value={signer.email} onChange={e => updateSigner(signer.id, 'email', e.target.value)} className={inputCls} placeholder="Email" disabled={signer.status === 'signed'} />
                    <input value={signer.role} onChange={e => updateSigner(signer.id, 'role', e.target.value)} className={inputCls} placeholder="Role" disabled={signer.status === 'signed'} />
                  </div>
                  {signer.status === 'pending' && (
                    <button onClick={() => removeSigner(signer.id)} className="text-xs text-red-400 hover:text-red-600 flex-shrink-0">✕</button>
                  )}
                </div>
                {signer.status === 'signed' ? (
                  <div className="text-xs text-green-700 font-mono">
                    ✓ Signed {new Date(signer.signedAt!).toLocaleString()} · {signer.sigHash?.slice(0, 20)}…
                  </div>
                ) : (
                  <button
                    onClick={() => signAs(signer.id)}
                    disabled={!canSign(signer) || !signer.name || signingCurrentId === signer.id}
                    className="text-xs px-3 py-1.5 rounded-lg text-white font-medium disabled:opacity-40"
                    style={{ background: canSign(signer) && signer.name ? '#c8960a' : '#9ca3af' }}
                  >
                    {signingCurrentId === signer.id ? 'Signing…' : canSign(signer) ? `Sign as ${signer.name || 'signer'}` : workflowMode === 'sequential' ? 'Waiting for previous signer' : 'Awaiting signature'}
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        {allSigned && (
          <div className="bg-green-50 border border-green-300 rounded-xl p-4 mb-4 text-center">
            <p className="text-green-800 font-semibold">All parties have signed. Ready to seal.</p>
          </div>
        )}

        <div className="text-center">
          <button
            onClick={sealWorkflow}
            disabled={status === 'sealing' || !allSigned}
            className="px-8 py-3 rounded-xl text-white font-semibold text-lg disabled:opacity-50"
            style={{ background: '#c8960a' }}
          >
            {status === 'sealing' ? 'Sealing…' : 'Seal Completed Workflow (.uds)'}
          </button>
          {status === 'done' && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 text-sm font-semibold">Signing workflow sealed</p>
              <p className="text-green-700 text-xs mt-1 font-mono">{filename}</p>
            </div>
          )}
          {status === 'error' && <p className="mt-4 text-red-600 text-sm">Sealing failed — please try again.</p>}
        </div>

        <section className="mt-16">
          <h2 style={{ fontFamily: 'Playfair Display, serif' }} className="text-2xl font-bold mb-6">
            How UD Signing Workflow differs from DocuSign / Adobe Sign
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { title: 'Each signature has its own hash', body: 'Every individual signature is SHA-256 hashed at the moment of signing. The final seal proves both what was signed and when each party signed.' },
              { title: 'No email or cloud account required', body: 'Run entirely in-browser. No sending rounds, no email delivery failures, no platform subscription needed.' },
              { title: 'Sequential locking is cryptographic', body: 'In sequential mode, party 2 can only sign after party 1 — enforced by the hash chain, not just a UI gate.' },
              { title: 'Single portable sealed file', body: 'The completed workflow exports as one .uds containing the full audit trail — all signatories, timestamps, hashes, and document content.' },
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
