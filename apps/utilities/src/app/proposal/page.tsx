'use client'

import { useState } from 'react'
import TooltipTour from '@/components/TooltipTour'
import { tourSteps } from '@/lib/tourSteps'

async function sha256hex(data: Uint8Array): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer)
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

interface PricingLine {
  item: string
  quantity: string
  unitPrice: string
  total: string
}

const PROPOSAL_TYPES = [
  'Business Development Proposal', 'Technical Proposal', 'Grant Proposal',
  'Research Proposal', 'Project Bid', 'Partnership Proposal', 'Consulting Proposal', 'Other',
]

const CURRENCIES = ['GBP £', 'USD $', 'EUR €', 'AUD $', 'CAD $', 'Other']

export default function ProposalPage() {
  const [proposalTitle, setProposalTitle] = useState('')
  const [proposalType, setProposalType] = useState('')
  const [preparedBy, setPreparedBy] = useState('')
  const [preparedFor, setPreparedFor] = useState('')
  const [submittedTo, setSubmittedTo] = useState('')
  const [validUntil, setValidUntil] = useState('')
  const [currency, setCurrency] = useState('GBP £')
  // Executive layer
  const [execSummary, setExecSummary] = useState('')
  const [problemStatement, setProblemStatement] = useState('')
  const [proposedSolution, setProposedSolution] = useState('')
  const [keyBenefits, setKeyBenefits] = useState('')
  // Detailed layer
  const [detailedScope, setDetailedScope] = useState('')
  const [methodology, setMethodology] = useState('')
  const [timeline, setTimeline] = useState('')
  const [teamMembers, setTeamMembers] = useState('')
  const [assumptions, setAssumptions] = useState('')
  const [exclusions, setExclusions] = useState('')
  // Pricing layer
  const [pricingLines, setPricingLines] = useState<PricingLine[]>([{ item: '', quantity: '1', unitPrice: '', total: '' }])
  const [totalPrice, setTotalPrice] = useState('')
  const [paymentTerms, setPaymentTerms] = useState('')
  const [pricingNotes, setPricingNotes] = useState('')
  const [activeLayer, setActiveLayer] = useState<'executive' | 'detailed' | 'pricing'>('executive')
  const [status, setStatus] = useState<'idle' | 'sealing' | 'done' | 'error'>('idle')
  const [filename, setFilename] = useState('')

  function addPricingLine() {
    setPricingLines(prev => [...prev, { item: '', quantity: '1', unitPrice: '', total: '' }])
  }

  function updatePricingLine(i: number, field: keyof PricingLine, value: string) {
    setPricingLines(prev => prev.map((line, idx) => {
      if (idx !== i) return line
      const updated = { ...line, [field]: value }
      if (field === 'quantity' || field === 'unitPrice') {
        const q = parseFloat(field === 'quantity' ? value : updated.quantity) || 0
        const p = parseFloat(field === 'unitPrice' ? value : updated.unitPrice) || 0
        updated.total = (q * p).toFixed(2)
      }
      return updated
    }))
  }

  function removePricingLine(i: number) {
    setPricingLines(prev => prev.filter((_, idx) => idx !== i))
  }

  const calculatedTotal = pricingLines.reduce((sum, l) => sum + (parseFloat(l.total) || 0), 0).toFixed(2)

  async function seal() {
    if (!proposalTitle || !preparedBy || !preparedFor) {
      alert('Please fill in proposal title, prepared by, and prepared for.')
      return
    }
    setStatus('sealing')
    try {
      const encoder = new TextEncoder()
      const doc = {
        title: proposalTitle,
        type: proposalType,
        parties: { preparedBy, preparedFor, submittedTo },
        validity: { validUntil: validUntil || null },
        executiveSummary: { summary: execSummary, problem: problemStatement, solution: proposedSolution, benefits: keyBenefits },
        detailedProposal: { scope: detailedScope, methodology, timeline, team: teamMembers, assumptions, exclusions },
        pricing: {
          currency,
          lines: pricingLines,
          total: totalPrice || calculatedTotal,
          paymentTerms,
          notes: pricingNotes,
        },
      }
      const hash = await sha256hex(encoder.encode(JSON.stringify(doc, null, 2)))
      const id = `PROP-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
      const uds = {
        ud_version: '1.0',
        format: 'uds',
        id,
        created: new Date().toISOString(),
        expires: validUntil ? new Date(validUntil).toISOString() : undefined,
        schema: 'proposal/v1',
        metadata: {
          title: proposalTitle,
          type: proposalType,
          preparedBy,
          preparedFor,
          totalValue: `${currency} ${totalPrice || calculatedTotal}`,
        },
        provenance: { sha256: hash, sealed: new Date().toISOString(), tool: 'UD Proposal', version: '1.0' },
        content: doc,
      }
      const blob = new Blob([JSON.stringify(uds, null, 2)], { type: 'application/json' })
      const safeName = proposalTitle.replace(/[^a-z0-9]/gi, '-').toLowerCase().slice(0, 25)
      const fname = `proposal-${safeName}-${id}.uds`
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
  const layers = [
    { id: 'executive' as const, label: 'Executive Summary' },
    { id: 'detailed' as const, label: 'Detailed Scope' },
    { id: 'pricing' as const, label: 'Pricing' },
  ]

  return (
    <main className="min-h-screen bg-[#fafaf8] text-[#1e2d3d]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      <TooltipTour engineId="proposal" tips={tourSteps['proposal'] ?? []} />

      <div className="bg-[#c8960a] text-white text-center py-2 text-sm font-medium">
        Beta — Free during beta
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 style={{ fontFamily: 'Playfair Display, serif' }} className="text-3xl font-bold mb-2">
            UD Proposal
          </h1>
          <p className="text-gray-500 text-sm">
            Build proposals with three audience layers — executive summary, detailed scope, and pricing.
            Seal with SHA-256 and set an expiry date. All three layers sealed in one document.
          </p>
          <span className="inline-block mt-2 px-2 py-0.5 text-xs rounded font-semibold" style={{ background: '#e6f4f1', color: '#0d7a6a' }}>
            Free · 3/month
          </span>
        </div>

        {/* Proposal Details */}
        <section className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
          <h2 style={{ fontFamily: 'Playfair Display, serif' }} className="text-lg font-semibold mb-4">Proposal Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className={labelCls}>Proposal Title *</label>
              <input value={proposalTitle} onChange={e => setProposalTitle(e.target.value)} className={inputCls} placeholder="e.g. Digital Transformation Programme — Phase 1" />
            </div>
            <div>
              <label className={labelCls}>Proposal Type</label>
              <select value={proposalType} onChange={e => setProposalType(e.target.value)} className={inputCls}>
                <option value="">Select type…</option>
                {PROPOSAL_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Currency</label>
              <select value={currency} onChange={e => setCurrency(e.target.value)} className={inputCls}>
                {CURRENCIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Prepared By *</label>
              <input value={preparedBy} onChange={e => setPreparedBy(e.target.value)} className={inputCls} placeholder="Your name / company" />
            </div>
            <div>
              <label className={labelCls}>Prepared For *</label>
              <input value={preparedFor} onChange={e => setPreparedFor(e.target.value)} className={inputCls} placeholder="Client / recipient" />
            </div>
            <div>
              <label className={labelCls}>Submitted To (contact)</label>
              <input value={submittedTo} onChange={e => setSubmittedTo(e.target.value)} className={inputCls} placeholder="Specific person" />
            </div>
            <div>
              <label className={labelCls}>Valid Until</label>
              <input type="date" value={validUntil} onChange={e => setValidUntil(e.target.value)} className={inputCls} />
            </div>
          </div>
        </section>

        {/* Layer Tabs */}
        <section data-tour="proposal-layers" className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
          <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1">
            {layers.map(l => (
              <button
                key={l.id}
                onClick={() => setActiveLayer(l.id)}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${activeLayer === l.id ? 'bg-white text-[#1e2d3d] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {l.label}
              </button>
            ))}
          </div>

          {activeLayer === 'executive' && (
            <div className="space-y-4">
              <div>
                <label className={labelCls}>Executive Summary</label>
                <textarea value={execSummary} onChange={e => setExecSummary(e.target.value)} className={`${inputCls} h-24 resize-none`} placeholder="2–3 sentences a CEO reads first. What are you proposing and why does it matter?" />
              </div>
              <div>
                <label className={labelCls}>Problem Statement</label>
                <textarea value={problemStatement} onChange={e => setProblemStatement(e.target.value)} className={`${inputCls} h-20 resize-none`} placeholder="What problem or opportunity does the client have?" />
              </div>
              <div>
                <label className={labelCls}>Proposed Solution</label>
                <textarea value={proposedSolution} onChange={e => setProposedSolution(e.target.value)} className={`${inputCls} h-20 resize-none`} placeholder="High-level description of your approach" />
              </div>
              <div>
                <label className={labelCls}>Key Benefits</label>
                <textarea value={keyBenefits} onChange={e => setKeyBenefits(e.target.value)} className={`${inputCls} h-20 resize-none`} placeholder="3–5 measurable outcomes the client gains" />
              </div>
            </div>
          )}

          {activeLayer === 'detailed' && (
            <div className="space-y-4">
              <div>
                <label className={labelCls}>Detailed Scope of Work</label>
                <textarea value={detailedScope} onChange={e => setDetailedScope(e.target.value)} className={`${inputCls} h-32 resize-none`} placeholder="Comprehensive description of all work included. Be explicit — vague scope creates disputes." />
              </div>
              <div>
                <label className={labelCls}>Methodology / Approach</label>
                <textarea value={methodology} onChange={e => setMethodology(e.target.value)} className={`${inputCls} h-24 resize-none`} placeholder="How will you deliver? Phases, sprint structure, frameworks used…" />
              </div>
              <div>
                <label className={labelCls}>Timeline</label>
                <textarea value={timeline} onChange={e => setTimeline(e.target.value)} className={`${inputCls} h-20 resize-none`} placeholder="Phases and milestones with target dates" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Assumptions</label>
                  <textarea value={assumptions} onChange={e => setAssumptions(e.target.value)} className={`${inputCls} h-20 resize-none`} placeholder="Conditions this proposal depends on" />
                </div>
                <div>
                  <label className={labelCls}>Exclusions</label>
                  <textarea value={exclusions} onChange={e => setExclusions(e.target.value)} className={`${inputCls} h-20 resize-none`} placeholder="What is NOT included" />
                </div>
              </div>
              <div>
                <label className={labelCls}>Team / Resources</label>
                <textarea value={teamMembers} onChange={e => setTeamMembers(e.target.value)} className={`${inputCls} h-20 resize-none`} placeholder="Key people, roles, and relevant experience" />
              </div>
            </div>
          )}

          {activeLayer === 'pricing' && (
            <div>
              <div className="space-y-2 mb-4">
                {pricingLines.map((line, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 items-center">
                    <input value={line.item} onChange={e => updatePricingLine(i, 'item', e.target.value)} className={`${inputCls} col-span-5`} placeholder="Item / service" />
                    <input value={line.quantity} onChange={e => updatePricingLine(i, 'quantity', e.target.value)} className={`${inputCls} col-span-2`} type="number" min="0" placeholder="Qty" />
                    <input value={line.unitPrice} onChange={e => updatePricingLine(i, 'unitPrice', e.target.value)} className={`${inputCls} col-span-2`} type="number" min="0" placeholder="Unit" />
                    <div className="col-span-2 text-sm font-mono text-right pr-1">{line.total || '0.00'}</div>
                    <button onClick={() => removePricingLine(i)} className="col-span-1 text-red-400 hover:text-red-600 text-xs">✕</button>
                  </div>
                ))}
                <div className="grid grid-cols-12 gap-2 text-xs text-gray-400 font-medium px-0">
                  <span className="col-span-5">Description</span>
                  <span className="col-span-2">Qty</span>
                  <span className="col-span-2">Unit price</span>
                  <span className="col-span-2 text-right">Total</span>
                </div>
              </div>
              <button onClick={addPricingLine} className="text-xs px-3 py-1.5 rounded-lg border border-[#c8960a] text-[#c8960a] mb-4">+ Add line</button>
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <div className="flex justify-between text-sm font-semibold">
                  <span>Total ({currency})</span>
                  <span>{totalPrice || calculatedTotal}</span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Custom Total (override)</label>
                  <input value={totalPrice} onChange={e => setTotalPrice(e.target.value)} className={inputCls} placeholder="Leave blank to use line totals" />
                </div>
                <div>
                  <label className={labelCls}>Payment Terms</label>
                  <input value={paymentTerms} onChange={e => setPaymentTerms(e.target.value)} className={inputCls} placeholder="e.g. 50% deposit, 50% on delivery" />
                </div>
              </div>
              <div className="mt-4">
                <label className={labelCls}>Pricing Notes</label>
                <textarea value={pricingNotes} onChange={e => setPricingNotes(e.target.value)} className={`${inputCls} h-16 resize-none`} placeholder="Exclusions, VAT treatment, expense policy, change request rates…" />
              </div>
            </div>
          )}
        </section>

        <div className="text-center">
          <button onClick={seal} disabled={status === 'sealing'} className="px-8 py-3 rounded-xl text-white font-semibold text-lg disabled:opacity-50" style={{ background: '#c8960a' }}>
            {status === 'sealing' ? 'Sealing…' : 'Seal Proposal (.uds)'}
          </button>
          {status === 'done' && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 text-sm font-semibold">Proposal sealed</p>
              <p className="text-green-700 text-xs mt-1 font-mono">{filename}</p>
              {validUntil && <p className="text-green-600 text-xs mt-1">Expires: {new Date(validUntil).toLocaleDateString()}</p>}
            </div>
          )}
          {status === 'error' && <p className="mt-4 text-red-600 text-sm">Sealing failed — please try again.</p>}
        </div>

        <section className="mt-16">
          <h2 style={{ fontFamily: 'Playfair Display, serif' }} className="text-2xl font-bold mb-6">
            How UD Proposal differs from Proposify / PandaDoc templates
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { title: 'Pricing is sealed, not editable', body: 'Once sealed, the pricing section cannot be altered. The SHA-256 proves the quoted price — preventing disputes about what was agreed.' },
              { title: 'Three audience layers in one file', body: 'Executive, detailed, and pricing layers all exist in one .uds — anyone with the file can access their relevant layer without needing separate documents.' },
              { title: 'Proposal expiry is cryptographic', body: 'The valid-until date is locked into the sealed file. A client cannot present an expired proposal as current — the hash proves when it was valid.' },
              { title: 'No subscription required', body: 'No Proposify monthly fee. Generate as many proposals as your tier allows, download as portable .uds files.' },
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
