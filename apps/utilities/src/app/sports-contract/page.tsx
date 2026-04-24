'use client'

import { useState } from 'react'
import TooltipTour from '@/components/TooltipTour'
import { tourSteps } from '@/lib/tourSteps'

async function sha256hex(data: Uint8Array): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer)
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

const CONTRACT_TYPES = [
  'Player Employment Contract',
  'Player Transfer Agreement',
  'Loan Agreement',
  'Agent Representation Agreement',
  'Sponsorship & Endorsement Deal',
  'Image Rights Agreement',
  'Youth Academy Contract',
  'Coaching Staff Contract',
  'Medical Staff Contract',
  'Broadcasting Rights Agreement',
]

const SPORTS = [
  'Football (Soccer)', 'Rugby Union', 'Rugby League', 'Cricket', 'Basketball',
  'American Football', 'Baseball', 'Tennis', 'Golf', 'Boxing', 'MMA',
  'Athletics', 'Swimming', 'Cycling', 'Formula One', 'Other',
]

const GOVERNING_BODIES = [
  'FIFA', 'UEFA', 'FA (England)', 'Premier League', 'EFL', 'SFA', 'FAI',
  'World Rugby', 'RFU', 'PRO14/URC', 'ECB', 'ICC', 'NBA', 'NFL', 'MLB',
  'ATP', 'WTA', 'PGA Tour', 'European Tour', 'WBC', 'IBF', 'WBA', 'UFC',
  'World Athletics', 'FINA', 'UCI', 'FIA', 'No governing body applicable',
]

const CURRENCIES = ['GBP £', 'USD $', 'EUR €', 'AUD $', 'JPY ¥', 'CHF', 'Other']

export default function SportsContractPage() {
  const [contractType, setContractType] = useState('')
  const [sport, setSport] = useState('')
  const [governingBody, setGoverningBody] = useState('')
  const [currency, setCurrency] = useState('GBP £')
  const [playerName, setPlayerName] = useState('')
  const [playerDob, setPlayerDob] = useState('')
  const [playerNationality, setPlayerNationality] = useState('')
  const [playerAgentName, setPlayerAgentName] = useState('')
  const [partyAName, setPartyAName] = useState('')
  const [partyARole, setPartyARole] = useState('Club / Organisation')
  const [partyBName, setPartyBName] = useState('')
  const [partyBRole, setPartyBRole] = useState('Player / Athlete')
  const [contractStart, setContractStart] = useState('')
  const [contractEnd, setContractEnd] = useState('')
  const [transferFee, setTransferFee] = useState('')
  const [baseSalary, setBaseSalary] = useState('')
  const [salaryFrequency, setSalaryFrequency] = useState('per week')
  const [signingBonus, setSigningBonus] = useState('')
  const [performanceBonuses, setPerformanceBonuses] = useState('')
  const [releaseClause, setReleaseClause] = useState('')
  const [sellOnPercentage, setSellOnPercentage] = useState('')
  const [keyTerms, setKeyTerms] = useState('')
  const [fipaCompliance, setFipaCompliance] = useState(false)
  const [tpoClauses, setTpoClauses] = useState(false)
  const [minorProtections, setMinorProtections] = useState(false)
  const [status, setStatus] = useState<'idle' | 'sealing' | 'done' | 'error'>('idle')
  const [filename, setFilename] = useState('')

  async function seal() {
    if (!contractType || !partyAName || !partyBName || !contractStart || !contractEnd) {
      alert('Please fill in contract type, both parties, and contract dates.')
      return
    }
    setStatus('sealing')
    try {
      const encoder = new TextEncoder()
      const contractDoc = {
        contractType,
        sport,
        governingBody,
        partyA: { name: partyAName, role: partyARole },
        partyB: { name: partyBName, role: partyBRole },
        player: playerName ? { name: playerName, dob: playerDob, nationality: playerNationality, agent: playerAgentName } : undefined,
        duration: { start: contractStart, end: contractEnd },
        financials: {
          currency,
          transferFee: transferFee || null,
          baseSalary: baseSalary ? `${baseSalary} ${salaryFrequency}` : null,
          signingBonus: signingBonus || null,
          performanceBonuses: performanceBonuses || null,
          releaseClause: releaseClause || null,
          sellOnPercentage: sellOnPercentage ? `${sellOnPercentage}%` : null,
        },
        keyTerms,
        compliance: { fipaCompliance, thirdPartyOwnershipClauses: tpoClauses, minorProtections },
      }
      const contractStr = JSON.stringify(contractDoc, null, 2)
      const hash = await sha256hex(encoder.encode(contractStr))
      const id = `SC-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
      const uds = {
        ud_version: '1.0',
        format: 'uds',
        id,
        created: new Date().toISOString(),
        expires: contractEnd ? new Date(contractEnd).toISOString() : undefined,
        schema: 'sports-contract/v1',
        metadata: {
          title: `${contractType} — ${partyAName} / ${partyBName}`,
          contractType,
          sport,
          governingBody,
          currency,
          duration: { start: contractStart, end: contractEnd },
          compliance: { fipaCompliance, tpoClauses, minorProtections },
        },
        provenance: {
          sha256: hash,
          sealed: new Date().toISOString(),
          tool: 'UD Sports Contract',
          version: '1.0',
        },
        content: contractDoc,
      }
      const blob = new Blob([JSON.stringify(uds, null, 2)], { type: 'application/json' })
      const safeName = partyAName.replace(/[^a-z0-9]/gi, '-').toLowerCase()
      const fname = `sports-contract-${safeName}-${id}.uds`
      setFilename(fname)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fname
      a.click()
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
      <TooltipTour engineId="sports-contract" tips={tourSteps['sports-contract'] ?? []} />

      {/* Beta banner */}
      <div className="bg-[#c8960a] text-white text-center py-2 text-sm font-medium">
        Beta — Pro features free during beta
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 style={{ fontFamily: 'Playfair Display, serif' }} className="text-3xl font-bold mb-2">
            UD Sports Contract
          </h1>
          <p className="text-gray-500 text-sm">
            Tamper-evident sports contracts with SHA-256 provenance. Player transfers, agent agreements,
            and sponsorship deals with governing body compliance metadata.
          </p>
          <span className="inline-block mt-2 px-2 py-0.5 text-xs rounded font-semibold" style={{ background: 'var(--ud-gold-3, #fef9ec)', color: 'var(--ud-gold-text, #92670a)', border: '1px solid #c8960a' }}>
            Pro · Free during beta
          </span>
        </div>

        {/* Contract Type & Sport */}
        <section data-tour="contract-type" className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
          <h2 style={{ fontFamily: 'Playfair Display, serif' }} className="text-lg font-semibold mb-4">Contract Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Contract Type *</label>
              <select value={contractType} onChange={e => setContractType(e.target.value)} className={inputCls}>
                <option value="">Select type…</option>
                {CONTRACT_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Sport</label>
              <select value={sport} onChange={e => setSport(e.target.value)} className={inputCls}>
                <option value="">Select sport…</option>
                {SPORTS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Governing Body</label>
              <select value={governingBody} onChange={e => setGoverningBody(e.target.value)} className={inputCls}>
                <option value="">Select body…</option>
                {GOVERNING_BODIES.map(b => <option key={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Currency</label>
              <select value={currency} onChange={e => setCurrency(e.target.value)} className={inputCls}>
                {CURRENCIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </section>

        {/* Parties */}
        <section data-tour="parties" className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
          <h2 style={{ fontFamily: 'Playfair Display, serif' }} className="text-lg font-semibold mb-4">Contracting Parties</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className={labelCls}>Party A Name *</label>
              <input value={partyAName} onChange={e => setPartyAName(e.target.value)} className={inputCls} placeholder="e.g. Manchester City FC" />
            </div>
            <div>
              <label className={labelCls}>Party A Role</label>
              <input value={partyARole} onChange={e => setPartyARole(e.target.value)} className={inputCls} placeholder="Club / Organisation" />
            </div>
            <div>
              <label className={labelCls}>Party B Name *</label>
              <input value={partyBName} onChange={e => setPartyBName(e.target.value)} className={inputCls} placeholder="e.g. Player full name" />
            </div>
            <div>
              <label className={labelCls}>Party B Role</label>
              <input value={partyBRole} onChange={e => setPartyBRole(e.target.value)} className={inputCls} placeholder="Player / Athlete" />
            </div>
          </div>
          <h3 className="text-sm font-semibold text-gray-600 mb-3">Player / Athlete Details (optional)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Full Name</label>
              <input value={playerName} onChange={e => setPlayerName(e.target.value)} className={inputCls} placeholder="As on passport" />
            </div>
            <div>
              <label className={labelCls}>Date of Birth</label>
              <input type="date" value={playerDob} onChange={e => setPlayerDob(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Nationality</label>
              <input value={playerNationality} onChange={e => setPlayerNationality(e.target.value)} className={inputCls} placeholder="e.g. Brazilian" />
            </div>
            <div>
              <label className={labelCls}>Agent Name</label>
              <input value={playerAgentName} onChange={e => setPlayerAgentName(e.target.value)} className={inputCls} placeholder="Registered agent (if any)" />
            </div>
          </div>
        </section>

        {/* Duration */}
        <section className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
          <h2 style={{ fontFamily: 'Playfair Display, serif' }} className="text-lg font-semibold mb-4">Contract Duration</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Start Date *</label>
              <input type="date" value={contractStart} onChange={e => setContractStart(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>End Date *</label>
              <input type="date" value={contractEnd} onChange={e => setContractEnd(e.target.value)} className={inputCls} />
            </div>
          </div>
          {contractStart && contractEnd && new Date(contractEnd) > new Date(contractStart) && (
            <p className="text-xs text-[#c8960a] mt-2">
              Duration: {Math.round((new Date(contractEnd).getTime() - new Date(contractStart).getTime()) / (1000 * 60 * 60 * 24 * 365.25) * 10) / 10} years. Document expires on contract end date.
            </p>
          )}
        </section>

        {/* Financials */}
        <section data-tour="financials" className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
          <h2 style={{ fontFamily: 'Playfair Display, serif' }} className="text-lg font-semibold mb-4">Financial Terms</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Transfer Fee</label>
              <input value={transferFee} onChange={e => setTransferFee(e.target.value)} className={inputCls} placeholder="e.g. 50,000,000" />
            </div>
            <div>
              <label className={labelCls}>Signing Bonus</label>
              <input value={signingBonus} onChange={e => setSigningBonus(e.target.value)} className={inputCls} placeholder="e.g. 5,000,000" />
            </div>
            <div>
              <label className={labelCls}>Base Salary</label>
              <div className="flex gap-2">
                <input value={baseSalary} onChange={e => setBaseSalary(e.target.value)} className={inputCls} placeholder="e.g. 250,000" />
                <select value={salaryFrequency} onChange={e => setSalaryFrequency(e.target.value)} className="px-2 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:border-[#c8960a]">
                  <option>per week</option>
                  <option>per month</option>
                  <option>per year</option>
                </select>
              </div>
            </div>
            <div>
              <label className={labelCls}>Release Clause</label>
              <input value={releaseClause} onChange={e => setReleaseClause(e.target.value)} className={inputCls} placeholder="e.g. 100,000,000" />
            </div>
            <div>
              <label className={labelCls}>Sell-on Percentage</label>
              <input value={sellOnPercentage} onChange={e => setSellOnPercentage(e.target.value)} className={inputCls} placeholder="e.g. 20" type="number" min="0" max="100" />
            </div>
          </div>
          <div className="mt-4">
            <label className={labelCls}>Performance Bonuses</label>
            <textarea value={performanceBonuses} onChange={e => setPerformanceBonuses(e.target.value)} className={`${inputCls} h-20 resize-none`} placeholder="e.g. £50,000 per league title, £10,000 per England cap…" />
          </div>
        </section>

        {/* Key Terms */}
        <section className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
          <h2 style={{ fontFamily: 'Playfair Display, serif' }} className="text-lg font-semibold mb-4">Key Contract Terms</h2>
          <textarea value={keyTerms} onChange={e => setKeyTerms(e.target.value)} className={`${inputCls} h-32 resize-none`} placeholder="Describe key obligations, exclusivity clauses, image rights provisions, conduct clauses, disciplinary procedures, injury provisions, etc." />
        </section>

        {/* Compliance */}
        <section data-tour="compliance" className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
          <h2 style={{ fontFamily: 'Playfair Display, serif' }} className="text-lg font-semibold mb-4">Compliance Metadata</h2>
          <div className="space-y-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={fipaCompliance} onChange={e => setFipaCompliance(e.target.checked)} className="mt-1" />
              <div>
                <div className="text-sm font-medium">FIFA/FIPA Compliance</div>
                <div className="text-xs text-gray-500">Contract meets FIFA Regulations on Working with Intermediaries</div>
              </div>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={tpoClauses} onChange={e => setTpoClauses(e.target.checked)} className="mt-1" />
              <div>
                <div className="text-sm font-medium">Third-Party Ownership Clauses Absent</div>
                <div className="text-xs text-gray-500">No third-party economic interests in player's future transfer (required by FIFA Article 18bis)</div>
              </div>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={minorProtections} onChange={e => setMinorProtections(e.target.checked)} className="mt-1" />
              <div>
                <div className="text-sm font-medium">Minor Player Protections Applied</div>
                <div className="text-xs text-gray-500">Applicable if contracting party is under 18 — FIFA Article 19 safeguards</div>
              </div>
            </label>
          </div>
        </section>

        {/* Legal disclaimer */}
        <div className="border border-red-300 rounded-lg p-4 mb-6 bg-red-50">
          <p className="text-xs text-red-800 font-semibold mb-1">Legal Notice</p>
          <p className="text-xs text-red-700">
            This tool creates a tamper-evident record of contract terms — it is not a substitute for a legally reviewed contract.
            Sports contracts have significant financial and regulatory implications. Always have agreements reviewed by a qualified
            sports law solicitor before execution. UD Sports Contract does not provide legal advice.
          </p>
        </div>

        {/* Seal */}
        <div className="text-center">
          <button
            onClick={seal}
            disabled={status === 'sealing'}
            className="px-8 py-3 rounded-xl text-white font-semibold text-lg disabled:opacity-50"
            style={{ background: '#c8960a' }}
          >
            {status === 'sealing' ? 'Sealing…' : 'Seal Contract (.uds)'}
          </button>
          {status === 'done' && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 text-sm font-semibold">Contract sealed successfully</p>
              <p className="text-green-700 text-xs mt-1 font-mono">{filename}</p>
              <p className="text-green-600 text-xs mt-1">SHA-256 hash embedded. Document expires on contract end date.</p>
            </div>
          )}
          {status === 'error' && <p className="mt-4 text-red-600 text-sm">Sealing failed — please try again.</p>}
        </div>

        {/* Comparison */}
        <section className="mt-16">
          <h2 style={{ fontFamily: 'Playfair Display, serif' }} className="text-2xl font-bold mb-6">
            How UD Sports Contract differs from DocuSign / standard templates
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { title: 'Tamper-evident by design', body: 'SHA-256 hash is embedded inside the .uds file itself. Any change to the document invalidates the hash — no database lookup required.' },
              { title: 'Governing body metadata', body: 'FIFA, UEFA, and league compliance flags are recorded directly in the sealed file — not as a separate checklist or database entry.' },
              { title: 'Expiry on contract end', body: 'The .uds document expires automatically when the contract period ends, preventing accidental re-use of outdated agreements.' },
              { title: 'No platform lock-in', body: 'A .uds file is valid JSON. Any party can verify the hash independently without needing access to Universal Document™ infrastructure.' },
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
