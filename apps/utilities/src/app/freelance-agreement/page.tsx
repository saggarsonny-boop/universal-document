'use client'

import { useState } from 'react'
import TooltipTour from '@/components/TooltipTour'
import { tourSteps } from '@/lib/tourSteps'

async function sha256hex(data: Uint8Array): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer)
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

const SERVICE_TYPES = [
  'Web Design & Development', 'Graphic Design', 'Copywriting & Content', 'Photography',
  'Video Production', 'Software Development', 'Consulting / Advisory', 'Marketing',
  'Translation', 'Data Analysis', 'Audio / Music Production', 'Illustration', 'Other',
]

const PAYMENT_METHODS = ['Bank Transfer', 'PayPal', 'Stripe', 'Wise', 'Cheque', 'Cryptocurrency', 'Other']
const CURRENCIES = ['GBP £', 'USD $', 'EUR €', 'AUD $', 'CAD $', 'CHF', 'Other']

export default function FreelanceAgreementPage() {
  const [serviceType, setServiceType] = useState('')
  const [currency, setCurrency] = useState('GBP £')
  const [clientName, setClientName] = useState('')
  const [clientAddress, setClientAddress] = useState('')
  const [freelancerName, setFreelancerName] = useState('')
  const [freelancerAddress, setFreelancerAddress] = useState('')
  const [projectTitle, setProjectTitle] = useState('')
  const [scopeOfWork, setScopeOfWork] = useState('')
  const [deliverables, setDeliverables] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [feeAmount, setFeeAmount] = useState('')
  const [feeStructure, setFeeStructure] = useState('Fixed project fee')
  const [depositPercent, setDepositPercent] = useState('50')
  const [paymentTerms, setPaymentTerms] = useState('14')
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer')
  const [revisionsIncluded, setRevisionsIncluded] = useState('3')
  const [additionalRevisionRate, setAdditionalRevisionRate] = useState('')
  const [ipOwnership, setIpOwnership] = useState<'client-on-payment' | 'freelancer-retains' | 'shared'>('client-on-payment')
  const [confidentiality, setConfidentiality] = useState(true)
  const [exclusivity, setExclusivity] = useState(false)
  const [noticePeriod, setNoticePeriod] = useState('14')
  const [governingLaw, setGoverningLaw] = useState('England and Wales')
  const [additionalTerms, setAdditionalTerms] = useState('')
  const [status, setStatus] = useState<'idle' | 'sealing' | 'done' | 'error'>('idle')
  const [filename, setFilename] = useState('')

  async function seal() {
    if (!clientName || !freelancerName || !projectTitle || !scopeOfWork || !feeAmount) {
      alert('Please fill in both parties, project title, scope, and fee.')
      return
    }
    setStatus('sealing')
    try {
      const encoder = new TextEncoder()
      const doc = {
        serviceType,
        parties: { client: { name: clientName, address: clientAddress }, freelancer: { name: freelancerName, address: freelancerAddress } },
        project: { title: projectTitle, scopeOfWork, deliverables, startDate, endDate },
        payment: { currency, feeAmount, feeStructure, depositPercent: `${depositPercent}%`, paymentTermsDays: paymentTerms, paymentMethod },
        revisions: { included: revisionsIncluded, additionalRate: additionalRevisionRate || 'N/A' },
        ip: { ownership: ipOwnership },
        terms: { confidentiality, exclusivity, noticePeriodDays: noticePeriod, governingLaw, additionalTerms },
      }
      const hash = await sha256hex(encoder.encode(JSON.stringify(doc, null, 2)))
      const id = `FA-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
      const uds = {
        ud_version: '1.0',
        format: 'uds',
        id,
        created: new Date().toISOString(),
        expires: endDate ? new Date(endDate).toISOString() : undefined,
        schema: 'freelance-agreement/v1',
        metadata: { title: `Freelance Agreement — ${projectTitle}`, serviceType, client: clientName, freelancer: freelancerName },
        provenance: { sha256: hash, sealed: new Date().toISOString(), tool: 'UD Freelance Agreement', version: '1.0' },
        content: doc,
      }
      const blob = new Blob([JSON.stringify(uds, null, 2)], { type: 'application/json' })
      const safeName = projectTitle.replace(/[^a-z0-9]/gi, '-').toLowerCase().slice(0, 30)
      const fname = `freelance-agreement-${safeName}-${id}.uds`
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
      <TooltipTour engineId="freelance-agreement" tips={tourSteps['freelance-agreement'] ?? []} />

      <div className="bg-[#c8960a] text-white text-center py-2 text-sm font-medium">
        Beta — Free features available, Pro features free during beta
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 style={{ fontFamily: 'Playfair Display, serif' }} className="text-3xl font-bold mb-2">
            UD Freelance Agreement
          </h1>
          <p className="text-gray-500 text-sm">
            Seal your freelance agreement with SHA-256 tamper-evidence. Scope, payment, IP, revisions, and confidentiality — all in one document.
          </p>
          <div className="flex gap-2 mt-2 flex-wrap">
            <span className="inline-block px-2 py-0.5 text-xs rounded font-semibold" style={{ background: '#e6f4f1', color: '#0d7a6a' }}>
              Free · 3/month
            </span>
          </div>
        </div>

        {/* Parties */}
        <section data-tour="parties" className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
          <h2 style={{ fontFamily: 'Playfair Display, serif' }} className="text-lg font-semibold mb-4">Parties</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Client Name / Company *</label>
              <input value={clientName} onChange={e => setClientName(e.target.value)} className={inputCls} placeholder="e.g. Acme Ltd" />
            </div>
            <div>
              <label className={labelCls}>Client Address</label>
              <input value={clientAddress} onChange={e => setClientAddress(e.target.value)} className={inputCls} placeholder="Registered address" />
            </div>
            <div>
              <label className={labelCls}>Freelancer Name *</label>
              <input value={freelancerName} onChange={e => setFreelancerName(e.target.value)} className={inputCls} placeholder="Your full name or trading name" />
            </div>
            <div>
              <label className={labelCls}>Freelancer Address</label>
              <input value={freelancerAddress} onChange={e => setFreelancerAddress(e.target.value)} className={inputCls} placeholder="Your address" />
            </div>
          </div>
        </section>

        {/* Project */}
        <section data-tour="scope" className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
          <h2 style={{ fontFamily: 'Playfair Display, serif' }} className="text-lg font-semibold mb-4">Project Scope</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="sm:col-span-2">
              <label className={labelCls}>Project Title *</label>
              <input value={projectTitle} onChange={e => setProjectTitle(e.target.value)} className={inputCls} placeholder="e.g. Brand Identity Redesign 2026" />
            </div>
            <div>
              <label className={labelCls}>Service Type</label>
              <select value={serviceType} onChange={e => setServiceType(e.target.value)} className={inputCls}>
                <option value="">Select…</option>
                {SERVICE_TYPES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Currency</label>
              <select value={currency} onChange={e => setCurrency(e.target.value)} className={inputCls}>
                {CURRENCIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Start Date</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>End Date / Deadline</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className={inputCls} />
            </div>
          </div>
          <div className="mb-4">
            <label className={labelCls}>Scope of Work *</label>
            <textarea value={scopeOfWork} onChange={e => setScopeOfWork(e.target.value)} className={`${inputCls} h-28 resize-none`} placeholder="Describe exactly what is included in this agreement. Be specific — vague scope causes disputes." />
          </div>
          <div>
            <label className={labelCls}>Deliverables</label>
            <textarea value={deliverables} onChange={e => setDeliverables(e.target.value)} className={`${inputCls} h-20 resize-none`} placeholder="List specific files, formats, or outputs to be delivered. e.g. 3 logo variations in SVG and PNG, brand guidelines PDF…" />
          </div>
        </section>

        {/* Payment */}
        <section data-tour="payment" className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
          <h2 style={{ fontFamily: 'Playfair Display, serif' }} className="text-lg font-semibold mb-4">Payment Terms</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Fee *</label>
              <input value={feeAmount} onChange={e => setFeeAmount(e.target.value)} className={inputCls} placeholder="e.g. 2500" type="number" min="0" />
            </div>
            <div>
              <label className={labelCls}>Fee Structure</label>
              <select value={feeStructure} onChange={e => setFeeStructure(e.target.value)} className={inputCls}>
                {['Fixed project fee', 'Hourly rate', 'Daily rate', 'Retainer (monthly)', 'Milestone-based'].map(f => <option key={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Deposit (%)</label>
              <input value={depositPercent} onChange={e => setDepositPercent(e.target.value)} className={inputCls} type="number" min="0" max="100" />
            </div>
            <div>
              <label className={labelCls}>Payment Terms (days net)</label>
              <input value={paymentTerms} onChange={e => setPaymentTerms(e.target.value)} className={inputCls} type="number" min="1" max="90" />
            </div>
            <div>
              <label className={labelCls}>Payment Method</label>
              <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className={inputCls}>
                {PAYMENT_METHODS.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
          </div>
        </section>

        {/* Revisions & IP */}
        <section className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
          <h2 style={{ fontFamily: 'Playfair Display, serif' }} className="text-lg font-semibold mb-4">Revisions & IP</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className={labelCls}>Revisions Included</label>
              <input value={revisionsIncluded} onChange={e => setRevisionsIncluded(e.target.value)} className={inputCls} type="number" min="0" max="99" />
            </div>
            <div>
              <label className={labelCls}>Additional Revision Rate (per round)</label>
              <input value={additionalRevisionRate} onChange={e => setAdditionalRevisionRate(e.target.value)} className={inputCls} placeholder="e.g. 150" />
            </div>
          </div>
          <div>
            <label className={labelCls}>IP / Copyright Ownership</label>
            <div className="space-y-2 mt-1">
              {([
                ['client-on-payment', 'Transfers to client on full payment'],
                ['freelancer-retains', 'Freelancer retains all rights (licence granted to client)'],
                ['shared', 'Shared / jointly owned'],
              ] as const).map(([val, label]) => (
                <label key={val} className="flex items-center gap-2 cursor-pointer text-sm">
                  <input type="radio" name="ipOwnership" value={val} checked={ipOwnership === val} onChange={() => setIpOwnership(val)} />
                  {label}
                </label>
              ))}
            </div>
          </div>
        </section>

        {/* Other Terms */}
        <section className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
          <h2 style={{ fontFamily: 'Playfair Display, serif' }} className="text-lg font-semibold mb-4">Other Terms</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input type="checkbox" checked={confidentiality} onChange={e => setConfidentiality(e.target.checked)} />
              Confidentiality / NDA clause included
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input type="checkbox" checked={exclusivity} onChange={e => setExclusivity(e.target.checked)} />
              Exclusivity (freelancer will not work with direct competitors)
            </label>
            <div>
              <label className={labelCls}>Notice Period (days)</label>
              <input value={noticePeriod} onChange={e => setNoticePeriod(e.target.value)} className={inputCls} type="number" min="1" max="90" />
            </div>
            <div>
              <label className={labelCls}>Governing Law</label>
              <input value={governingLaw} onChange={e => setGoverningLaw(e.target.value)} className={inputCls} placeholder="e.g. England and Wales" />
            </div>
          </div>
          <div>
            <label className={labelCls}>Additional Terms</label>
            <textarea value={additionalTerms} onChange={e => setAdditionalTerms(e.target.value)} className={`${inputCls} h-20 resize-none`} placeholder="Any additional clauses, kill fees, expenses policy, approval process…" />
          </div>
        </section>

        {/* Legal */}
        <div className="border border-red-300 rounded-lg p-4 mb-6 bg-red-50">
          <p className="text-xs text-red-800 font-semibold mb-1">Legal Notice</p>
          <p className="text-xs text-red-700">
            This tool creates a tamper-evident record of freelance agreement terms. It is not a substitute for legal advice.
            For high-value engagements, have the agreement reviewed by a qualified solicitor. Universal Document™ does not provide legal advice.
          </p>
        </div>

        <div className="text-center">
          <button onClick={seal} disabled={status === 'sealing'} className="px-8 py-3 rounded-xl text-white font-semibold text-lg disabled:opacity-50" style={{ background: '#c8960a' }}>
            {status === 'sealing' ? 'Sealing…' : 'Seal Agreement (.uds)'}
          </button>
          {status === 'done' && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 text-sm font-semibold">Agreement sealed</p>
              <p className="text-green-700 text-xs mt-1 font-mono">{filename}</p>
            </div>
          )}
          {status === 'error' && <p className="mt-4 text-red-600 text-sm">Sealing failed — please try again.</p>}
        </div>

        {/* Comparison */}
        <section className="mt-16">
          <h2 style={{ fontFamily: 'Playfair Display, serif' }} className="text-2xl font-bold mb-6">
            How UD Freelance Agreement differs from HelloSign / Docracy templates
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { title: 'Revision limit recorded in the sealed file', body: 'The number of included revisions is cryptographically sealed. Neither party can later claim a different number was agreed.' },
              { title: 'IP clause is part of the hash', body: 'IP ownership selection is hashed into the document. Changing it after sealing breaks the SHA-256 — providing clear evidence of tampering.' },
              { title: 'No account or subscription required', body: 'Seal and download in seconds. No login, no monthly fee, no vendor platform dependency.' },
              { title: 'Machine-readable structure', body: '.uds is valid JSON with a defined schema. Accounting tools, legal workflows, and future automation can parse it directly.' },
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
