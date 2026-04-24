'use client'

import { useState } from 'react'
import TooltipTour from '@/components/TooltipTour'
import { tourSteps } from '@/lib/tourSteps'

async function sha256hex(data: Uint8Array): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer)
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

type StageId = 'draft' | 'legal-review' | 'negotiation' | 'approval' | 'execution' | 'active' | 'renewal' | 'archived'

interface StageRecord {
  stage: StageId
  enteredAt: string
  completedAt?: string
  completedBy?: string
  notes?: string
  hash: string
}

interface Amendment {
  id: string
  description: string
  requestedBy: string
  date: string
  status: 'proposed' | 'accepted' | 'rejected'
  hash: string
}

const STAGES: { id: StageId; label: string; description: string }[] = [
  { id: 'draft', label: 'Draft', description: 'Initial contract terms drafted' },
  { id: 'legal-review', label: 'Legal Review', description: 'Under review by legal team' },
  { id: 'negotiation', label: 'Negotiation', description: 'Terms being negotiated with counterparty' },
  { id: 'approval', label: 'Internal Approval', description: 'Awaiting internal sign-off' },
  { id: 'execution', label: 'Execution', description: 'Being signed by all parties' },
  { id: 'active', label: 'Active', description: 'Contract live and obligations running' },
  { id: 'renewal', label: 'Renewal/Renegotiation', description: 'Under review for renewal' },
  { id: 'archived', label: 'Archived', description: 'Contract term ended, archived' },
]

const CONTRACT_TYPES = [
  'Supplier Agreement', 'Customer Contract', 'Employment Contract', 'NDA',
  'Partnership Agreement', 'Licensing Agreement', 'SaaS/Services Agreement',
  'Lease', 'M&A/Acquisition', 'Joint Venture', 'Other',
]

export default function ContractLifecyclePage() {
  const [contractTitle, setContractTitle] = useState('')
  const [contractType, setContractType] = useState('')
  const [counterparty, setCounterparty] = useState('')
  const [internalOwner, setInternalOwner] = useState('')
  const [contractValue, setContractValue] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [autoRenew, setAutoRenew] = useState(false)
  const [renewalNoticeDays, setRenewalNoticeDays] = useState('')
  const [currentStage, setCurrentStage] = useState<StageId>('draft')
  const [stageHistory, setStageHistory] = useState<StageRecord[]>([])
  const [stagingNotes, setStagingNotes] = useState('')
  const [stagingCompletedBy, setStagingCompletedBy] = useState('')
  const [amendments, setAmendments] = useState<Amendment[]>([])
  const [amendmentDesc, setAmendmentDesc] = useState('')
  const [amendmentBy, setAmendmentBy] = useState('')
  const [keyObligations, setKeyObligations] = useState('')
  const [kpis, setKpis] = useState('')
  const [riskNotes, setRiskNotes] = useState('')
  const [status, setStatus] = useState<'idle' | 'sealing' | 'done' | 'error'>('idle')
  const [filename, setFilename] = useState('')
  const [contractId] = useState(() => `CLM-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`)

  async function recordStageTransition() {
    const encoder = new TextEncoder()
    const stagePayload = `${contractId}|${currentStage}|${new Date().toISOString()}|${stagingNotes}`
    const hash = await sha256hex(encoder.encode(stagePayload))
    const record: StageRecord = {
      stage: currentStage,
      enteredAt: new Date().toISOString(),
      completedBy: stagingCompletedBy,
      notes: stagingNotes,
      hash,
    }
    setStageHistory(prev => [...prev, record])
    setStagingNotes('')
    setStagingCompletedBy('')
  }

  async function addAmendment() {
    if (!amendmentDesc) return
    const encoder = new TextEncoder()
    const hash = await sha256hex(encoder.encode(`${contractId}|${amendmentDesc}|${new Date().toISOString()}`))
    const amendment: Amendment = {
      id: `AMD-${Date.now().toString(36).toUpperCase()}`,
      description: amendmentDesc,
      requestedBy: amendmentBy,
      date: new Date().toISOString(),
      status: 'proposed',
      hash,
    }
    setAmendments(prev => [...prev, amendment])
    setAmendmentDesc('')
    setAmendmentBy('')
  }

  function updateAmendmentStatus(id: string, newStatus: Amendment['status']) {
    setAmendments(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a))
  }

  async function sealLifecycle() {
    if (!contractTitle || !counterparty) {
      alert('Please fill in contract title and counterparty.')
      return
    }
    setStatus('sealing')
    try {
      const encoder = new TextEncoder()
      const doc = {
        contractId,
        details: { title: contractTitle, type: contractType, counterparty, internalOwner, value: contractValue },
        duration: { start: startDate, end: endDate, autoRenew, renewalNotice: renewalNoticeDays ? `${renewalNoticeDays} days` : null },
        currentStage,
        stageHistory,
        amendments,
        obligations: keyObligations,
        kpis,
        risks: riskNotes,
        sealedAt: new Date().toISOString(),
      }
      const hash = await sha256hex(encoder.encode(JSON.stringify(doc, null, 2)))
      const uds = {
        ud_version: '1.0',
        format: 'uds',
        id: contractId,
        created: new Date().toISOString(),
        expires: endDate ? new Date(endDate).toISOString() : undefined,
        schema: 'contract-lifecycle/v1',
        metadata: {
          title: contractTitle,
          type: contractType,
          counterparty,
          currentStage,
          stageCount: stageHistory.length,
          amendmentCount: amendments.length,
        },
        provenance: { sha256: hash, sealed: new Date().toISOString(), tool: 'UD Contract Lifecycle', version: '1.0' },
        content: doc,
      }
      const blob = new Blob([JSON.stringify(uds, null, 2)], { type: 'application/json' })
      const safeName = contractTitle.replace(/[^a-z0-9]/gi, '-').toLowerCase().slice(0, 25)
      const fname = `contract-lifecycle-${safeName}-${contractId}.uds`
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
  const currentStageInfo = STAGES.find(s => s.id === currentStage)!

  return (
    <main className="min-h-screen bg-[#fafaf8] text-[#1e2d3d]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      <TooltipTour engineId="contract-lifecycle" tips={tourSteps['contract-lifecycle'] ?? []} />

      <div className="bg-[#c8960a] text-white text-center py-2 text-sm font-medium">
        Beta — Enterprise features free during beta
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 style={{ fontFamily: 'Playfair Display, serif' }} className="text-3xl font-bold mb-2">
            UD Contract Lifecycle
          </h1>
          <p className="text-gray-500 text-sm">
            Manage contracts from draft to archive with a tamper-evident audit trail at every stage.
            Each stage transition and amendment is SHA-256 hashed — producing a complete, verifiable history.
          </p>
          <span className="inline-block mt-2 px-2 py-0.5 text-xs rounded font-semibold text-white" style={{ background: '#1e2d3d' }}>
            Enterprise · Free during beta
          </span>
        </div>

        {/* Contract Details */}
        <section data-tour="contract-details" className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
          <h2 style={{ fontFamily: 'Playfair Display, serif' }} className="text-lg font-semibold mb-4">Contract Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className={labelCls}>Contract Title *</label>
              <input value={contractTitle} onChange={e => setContractTitle(e.target.value)} className={inputCls} placeholder="e.g. Cloud Services Agreement — Acme Ltd" />
            </div>
            <div>
              <label className={labelCls}>Contract Type</label>
              <select value={contractType} onChange={e => setContractType(e.target.value)} className={inputCls}>
                <option value="">Select type…</option>
                {CONTRACT_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Counterparty *</label>
              <input value={counterparty} onChange={e => setCounterparty(e.target.value)} className={inputCls} placeholder="Legal entity name" />
            </div>
            <div>
              <label className={labelCls}>Internal Owner</label>
              <input value={internalOwner} onChange={e => setInternalOwner(e.target.value)} className={inputCls} placeholder="Responsible person / team" />
            </div>
            <div>
              <label className={labelCls}>Contract Value</label>
              <input value={contractValue} onChange={e => setContractValue(e.target.value)} className={inputCls} placeholder="e.g. £120,000/year" />
            </div>
            <div>
              <label className={labelCls}>Start Date</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>End Date</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className={inputCls} />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input type="checkbox" checked={autoRenew} onChange={e => setAutoRenew(e.target.checked)} />
              Auto-renews
            </label>
            {autoRenew && (
              <div className="flex items-center gap-2">
                <input value={renewalNoticeDays} onChange={e => setRenewalNoticeDays(e.target.value)} className="w-20 px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm" type="number" min="1" placeholder="Days" />
                <span className="text-sm text-gray-500">days notice to cancel</span>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-2 font-mono">ID: {contractId}</p>
        </section>

        {/* Stage Pipeline */}
        <section data-tour="stage-pipeline" className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
          <h2 style={{ fontFamily: 'Playfair Display, serif' }} className="text-lg font-semibold mb-4">Lifecycle Stage</h2>
          <div className="flex flex-wrap gap-2 mb-4">
            {STAGES.map(stage => (
              <button
                key={stage.id}
                onClick={() => setCurrentStage(stage.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${currentStage === stage.id ? 'text-white' : 'text-gray-600 bg-gray-100 hover:bg-gray-200'}`}
                style={currentStage === stage.id ? { background: '#c8960a' } : {}}
              >
                {stage.label}
              </button>
            ))}
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
            <p className="text-sm font-medium text-amber-900">Current: {currentStageInfo.label}</p>
            <p className="text-xs text-amber-700 mt-0.5">{currentStageInfo.description}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div>
              <label className={labelCls}>Completed By</label>
              <input value={stagingCompletedBy} onChange={e => setStagingCompletedBy(e.target.value)} className={inputCls} placeholder="Name of person advancing stage" />
            </div>
            <div>
              <label className={labelCls}>Stage Notes</label>
              <input value={stagingNotes} onChange={e => setStagingNotes(e.target.value)} className={inputCls} placeholder="Any notes about this stage" />
            </div>
          </div>
          <button onClick={recordStageTransition} className="text-sm px-4 py-2 rounded-lg border border-[#c8960a] text-[#c8960a] font-medium hover:bg-amber-50">
            Record Stage Transition
          </button>
          {stageHistory.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Stage History</p>
              {stageHistory.map((s, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100 text-xs">
                  <span className="font-semibold capitalize">{STAGES.find(st => st.id === s.stage)?.label}</span>
                  <span className="text-gray-400">{new Date(s.enteredAt).toLocaleString()}</span>
                  {s.completedBy && <span className="text-gray-500">by {s.completedBy}</span>}
                  {s.notes && <span className="text-gray-500 flex-1">{s.notes}</span>}
                  <span className="font-mono text-gray-300">{s.hash.slice(0, 10)}…</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Amendments */}
        <section className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
          <h2 style={{ fontFamily: 'Playfair Display, serif' }} className="text-lg font-semibold mb-4">Amendments</h2>
          <div className="flex gap-3 mb-3">
            <input value={amendmentDesc} onChange={e => setAmendmentDesc(e.target.value)} className={`${inputCls} flex-1`} placeholder="Describe the proposed amendment" />
            <input value={amendmentBy} onChange={e => setAmendmentBy(e.target.value)} className="w-36 px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:border-[#c8960a]" placeholder="Requested by" />
            <button onClick={addAmendment} disabled={!amendmentDesc} className="px-3 py-2 rounded-lg text-white text-sm font-medium disabled:opacity-40" style={{ background: '#c8960a' }}>Add</button>
          </div>
          {amendments.length > 0 && (
            <div className="space-y-2">
              {amendments.map(a => (
                <div key={a.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100 text-sm">
                  <div className="flex-1">
                    <p className="font-medium">{a.description}</p>
                    <p className="text-xs text-gray-400">Requested by {a.requestedBy || 'unknown'} · {new Date(a.date).toLocaleDateString()}</p>
                  </div>
                  <div className="flex gap-1">
                    {(['proposed', 'accepted', 'rejected'] as const).map(s => (
                      <button
                        key={s}
                        onClick={() => updateAmendmentStatus(a.id, s)}
                        className={`text-xs px-2 py-1 rounded capitalize ${a.status === s ? 'font-semibold text-white' : 'text-gray-500 bg-gray-100'}`}
                        style={a.status === s ? { background: s === 'accepted' ? '#16a34a' : s === 'rejected' ? '#dc2626' : '#6b7280' } : {}}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Obligations & Risk */}
        <section className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
          <h2 style={{ fontFamily: 'Playfair Display, serif' }} className="text-lg font-semibold mb-4">Obligations, KPIs & Risk</h2>
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Key Obligations</label>
              <textarea value={keyObligations} onChange={e => setKeyObligations(e.target.value)} className={`${inputCls} h-20 resize-none`} placeholder="What must each party do under this contract?" />
            </div>
            <div>
              <label className={labelCls}>Performance KPIs / SLAs</label>
              <textarea value={kpis} onChange={e => setKpis(e.target.value)} className={`${inputCls} h-16 resize-none`} placeholder="Measurable targets, service levels, benchmarks" />
            </div>
            <div>
              <label className={labelCls}>Risk Notes</label>
              <textarea value={riskNotes} onChange={e => setRiskNotes(e.target.value)} className={`${inputCls} h-16 resize-none`} placeholder="Identified risks, force majeure clauses, termination triggers" />
            </div>
          </div>
        </section>

        <div className="text-center">
          <button onClick={sealLifecycle} disabled={status === 'sealing'} className="px-8 py-3 rounded-xl text-white font-semibold text-lg disabled:opacity-50" style={{ background: '#c8960a' }}>
            {status === 'sealing' ? 'Sealing…' : 'Seal CLM Record (.uds)'}
          </button>
          {status === 'done' && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 text-sm font-semibold">Contract lifecycle record sealed</p>
              <p className="text-green-700 text-xs mt-1 font-mono">{filename}</p>
              <p className="text-green-600 text-xs mt-1">{stageHistory.length} stage transitions · {amendments.length} amendments recorded.</p>
            </div>
          )}
          {status === 'error' && <p className="mt-4 text-red-600 text-sm">Sealing failed — please try again.</p>}
        </div>

        <section className="mt-16">
          <h2 style={{ fontFamily: 'Playfair Display, serif' }} className="text-2xl font-bold mb-6">
            How UD Contract Lifecycle differs from Salesforce CLM / Ironclad
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { title: 'Every stage transition is hashed', body: 'Each lifecycle stage advancement records a SHA-256 hash of the stage, timestamp, and notes — making the history tamper-evident, not just logged.' },
              { title: 'Amendments have cryptographic status', body: 'Each amendment is individually hashed at creation. Changing an amendment\'s description after hashing would invalidate the record.' },
              { title: 'No per-seat CLM subscription', body: 'Salesforce CLM and Ironclad charge thousands per month. UD Contract Lifecycle is free for individual contracts, scalable via Enterprise tier.' },
              { title: 'Portable audit record', body: 'The sealed .uds contains the full lifecycle history — all stage transitions, amendments, and obligations — in a portable file you own.' },
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
