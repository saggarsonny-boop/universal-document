'use client'

import { useState } from 'react'
import TooltipTour from '@/components/TooltipTour'
import { tourSteps } from '@/lib/tourSteps'

async function sha256hex(data: Uint8Array): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer)
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

const REPORTING_STANDARDS = [
  'GRI (Global Reporting Initiative)',
  'TCFD (Task Force on Climate-related Financial Disclosures)',
  'SASB (Sustainability Accounting Standards Board)',
  'CDP (Carbon Disclosure Project)',
  'UN SDGs',
  'ISO 14001',
  'CSRD (EU Corporate Sustainability Reporting Directive)',
  'None / Internal',
]

const SECTORS = [
  'Energy', 'Manufacturing', 'Technology', 'Financial Services', 'Healthcare',
  'Real Estate', 'Retail & Consumer Goods', 'Transport & Logistics',
  'Agriculture & Food', 'Construction', 'Professional Services', 'Other',
]

interface CarbonCredit {
  registry: string
  vintageYear: string
  quantity: string
  certificateId: string
}

export default function EsgReportPage() {
  const [orgName, setOrgName] = useState('')
  const [orgSector, setOrgSector] = useState('')
  const [reportingPeriodStart, setReportingPeriodStart] = useState('')
  const [reportingPeriodEnd, setReportingPeriodEnd] = useState('')
  const [reportingStandard, setReportingStandard] = useState('')
  const [scope1, setScope1] = useState('')
  const [scope2, setScope2] = useState('')
  const [scope3, setScope3] = useState('')
  const [scope3Categories, setScope3Categories] = useState('')
  const [totalWaterUsage, setTotalWaterUsage] = useState('')
  const [totalWasteGenerated, setTotalWasteGenerated] = useState('')
  const [renewableEnergyPct, setRenewableEnergyPct] = useState('')
  const [carbonCredits, setCarbonCredits] = useState<CarbonCredit[]>([])
  const [boardDiversityPct, setBoardDiversityPct] = useState('')
  const [employeeCount, setEmployeeCount] = useState('')
  const [payGapReported, setPayGapReported] = useState(false)
  const [supplyChainAudit, setSupplyChainAudit] = useState(false)
  const [governancePolicy, setGovernancePolicy] = useState('')
  const [antiCorruptionPolicy, setAntiCorruptionPolicy] = useState(false)
  const [whistleblowerPolicy, setWhistleblowerPolicy] = useState(false)
  const [dataVerifiedBy, setDataVerifiedBy] = useState('')
  const [verificationDate, setVerificationDate] = useState('')
  const [additionalDisclosures, setAdditionalDisclosures] = useState('')
  const [status, setStatus] = useState<'idle' | 'sealing' | 'done' | 'error'>('idle')
  const [filename, setFilename] = useState('')

  function addCarbonCredit() {
    setCarbonCredits(prev => [...prev, { registry: '', vintageYear: '', quantity: '', certificateId: '' }])
  }

  function updateCredit(i: number, field: keyof CarbonCredit, value: string) {
    setCarbonCredits(prev => prev.map((c, idx) => idx === i ? { ...c, [field]: value } : c))
  }

  function removeCredit(i: number) {
    setCarbonCredits(prev => prev.filter((_, idx) => idx !== i))
  }

  async function seal() {
    if (!orgName || !reportingPeriodStart || !reportingPeriodEnd) {
      alert('Please fill in organisation name and reporting period.')
      return
    }
    setStatus('sealing')
    try {
      const encoder = new TextEncoder()
      const totalScope123 = [scope1, scope2, scope3].reduce((sum, v) => {
        const n = parseFloat(v)
        return sum + (isNaN(n) ? 0 : n)
      }, 0)
      const doc = {
        organization: { name: orgName, sector: orgSector },
        reportingPeriod: { start: reportingPeriodStart, end: reportingPeriodEnd },
        reportingStandard,
        environmental: {
          emissions: {
            scope1_tCO2e: scope1 || null,
            scope2_tCO2e: scope2 || null,
            scope3_tCO2e: scope3 || null,
            scope3Categories,
            total_tCO2e: totalScope123 > 0 ? totalScope123.toFixed(2) : null,
          },
          water: { totalUsage_m3: totalWaterUsage || null },
          waste: { totalGenerated_tonnes: totalWasteGenerated || null },
          energy: { renewablePercentage: renewableEnergyPct ? `${renewableEnergyPct}%` : null },
          carbonCredits,
        },
        social: {
          employees: employeeCount || null,
          boardDiversityPercentage: boardDiversityPct ? `${boardDiversityPct}%` : null,
          genderPayGapReported: payGapReported,
          supplyChainAuditConducted: supplyChainAudit,
        },
        governance: {
          governancePolicy: governancePolicy || null,
          antiCorruptionPolicy,
          whistleblowerPolicy,
        },
        verification: {
          verifiedBy: dataVerifiedBy || 'Not independently verified',
          verificationDate: verificationDate || null,
        },
        additionalDisclosures,
      }
      const hash = await sha256hex(encoder.encode(JSON.stringify(doc, null, 2)))
      const id = `ESG-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
      const uds = {
        ud_version: '1.0',
        format: 'uds',
        id,
        created: new Date().toISOString(),
        schema: 'esg-report/v1',
        metadata: {
          title: `ESG Report — ${orgName} ${reportingPeriodStart?.split('-')[0]}/${reportingPeriodEnd?.split('-')[0]}`,
          organization: orgName,
          sector: orgSector,
          reportingStandard,
          totalEmissions_tCO2e: totalScope123 > 0 ? totalScope123.toFixed(2) : 'Not reported',
        },
        provenance: {
          sha256: hash,
          sealed: new Date().toISOString(),
          tool: 'UD ESG Report',
          version: '1.0',
          antiGreenwashingNote: 'All figures hashed at time of sealing. Any retrospective amendment breaks SHA-256 integrity.',
        },
        content: doc,
      }
      const blob = new Blob([JSON.stringify(uds, null, 2)], { type: 'application/json' })
      const safeName = orgName.replace(/[^a-z0-9]/gi, '-').toLowerCase().slice(0, 30)
      const fname = `esg-report-${safeName}-${id}.uds`
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
      <TooltipTour engineId="esg-report" tips={tourSteps['esg-report'] ?? []} />

      <div className="bg-[#c8960a] text-white text-center py-2 text-sm font-medium">
        Beta — Pro features free during beta
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 style={{ fontFamily: 'Playfair Display, serif' }} className="text-3xl font-bold mb-2">
            UD ESG Report
          </h1>
          <p className="text-gray-500 text-sm">
            Sealed ESG reports with Scope 1, 2, and 3 emissions, carbon credit certificates, and SHA-256 provenance.
            Figures are cryptographically locked at submission — preventing retrospective adjustment.
          </p>
          <span className="inline-block mt-2 px-2 py-0.5 text-xs rounded font-semibold" style={{ background: 'var(--ud-gold-3, #fef9ec)', color: 'var(--ud-gold-text, #92670a)', border: '1px solid #c8960a' }}>
            Pro · Free during beta
          </span>
        </div>

        {/* Organisation */}
        <section data-tour="org-details" className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
          <h2 style={{ fontFamily: 'Playfair Display, serif' }} className="text-lg font-semibold mb-4">Organisation</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Organisation Name *</label>
              <input value={orgName} onChange={e => setOrgName(e.target.value)} className={inputCls} placeholder="e.g. Acme Energy plc" />
            </div>
            <div>
              <label className={labelCls}>Sector</label>
              <select value={orgSector} onChange={e => setOrgSector(e.target.value)} className={inputCls}>
                <option value="">Select sector…</option>
                {SECTORS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Reporting Period Start *</label>
              <input type="date" value={reportingPeriodStart} onChange={e => setReportingPeriodStart(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Reporting Period End *</label>
              <input type="date" value={reportingPeriodEnd} onChange={e => setReportingPeriodEnd(e.target.value)} className={inputCls} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Reporting Standard</label>
              <select value={reportingStandard} onChange={e => setReportingStandard(e.target.value)} className={inputCls}>
                <option value="">Select standard…</option>
                {REPORTING_STANDARDS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </section>

        {/* Environmental */}
        <section data-tour="emissions" className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
          <h2 style={{ fontFamily: 'Playfair Display, serif' }} className="text-lg font-semibold mb-4">Environmental — Emissions (tCO₂e)</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div>
              <label className={labelCls}>Scope 1 (direct)</label>
              <input value={scope1} onChange={e => setScope1(e.target.value)} className={inputCls} type="number" min="0" placeholder="tCO₂e" />
            </div>
            <div>
              <label className={labelCls}>Scope 2 (indirect energy)</label>
              <input value={scope2} onChange={e => setScope2(e.target.value)} className={inputCls} type="number" min="0" placeholder="tCO₂e" />
            </div>
            <div>
              <label className={labelCls}>Scope 3 (value chain)</label>
              <input value={scope3} onChange={e => setScope3(e.target.value)} className={inputCls} type="number" min="0" placeholder="tCO₂e" />
            </div>
          </div>
          {(scope1 || scope2 || scope3) && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-xs text-blue-800 font-semibold">
                Total Scope 1+2+3: {(
                  (parseFloat(scope1) || 0) + (parseFloat(scope2) || 0) + (parseFloat(scope3) || 0)
                ).toFixed(2)} tCO₂e
              </p>
            </div>
          )}
          <div className="mb-4">
            <label className={labelCls}>Scope 3 Categories Included</label>
            <textarea value={scope3Categories} onChange={e => setScope3Categories(e.target.value)} className={`${inputCls} h-16 resize-none`} placeholder="e.g. Category 1 (Purchased goods), Category 11 (Use of sold products)…" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Water Usage (m³)</label>
              <input value={totalWaterUsage} onChange={e => setTotalWaterUsage(e.target.value)} className={inputCls} type="number" min="0" />
            </div>
            <div>
              <label className={labelCls}>Waste Generated (tonnes)</label>
              <input value={totalWasteGenerated} onChange={e => setTotalWasteGenerated(e.target.value)} className={inputCls} type="number" min="0" />
            </div>
            <div>
              <label className={labelCls}>Renewable Energy %</label>
              <input value={renewableEnergyPct} onChange={e => setRenewableEnergyPct(e.target.value)} className={inputCls} type="number" min="0" max="100" placeholder="%" />
            </div>
          </div>
        </section>

        {/* Carbon Credits */}
        <section className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 style={{ fontFamily: 'Playfair Display, serif' }} className="text-lg font-semibold">Carbon Credit Certificates</h2>
            <button onClick={addCarbonCredit} className="text-xs px-3 py-1.5 rounded-lg border border-[#c8960a] text-[#c8960a] font-medium hover:bg-amber-50">
              + Add Certificate
            </button>
          </div>
          {carbonCredits.length === 0 && (
            <p className="text-xs text-gray-400">No carbon credits added. Click "Add Certificate" to record purchased offsets.</p>
          )}
          {carbonCredits.map((cc, i) => (
            <div key={i} className="border border-gray-100 rounded-lg p-4 mb-3 bg-gray-50">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className={labelCls}>Registry</label>
                  <input value={cc.registry} onChange={e => updateCredit(i, 'registry', e.target.value)} className={inputCls} placeholder="e.g. Gold Standard" />
                </div>
                <div>
                  <label className={labelCls}>Vintage Year</label>
                  <input value={cc.vintageYear} onChange={e => updateCredit(i, 'vintageYear', e.target.value)} className={inputCls} placeholder="e.g. 2025" />
                </div>
                <div>
                  <label className={labelCls}>Quantity (tCO₂e)</label>
                  <input value={cc.quantity} onChange={e => updateCredit(i, 'quantity', e.target.value)} className={inputCls} type="number" min="0" />
                </div>
                <div>
                  <label className={labelCls}>Certificate ID</label>
                  <input value={cc.certificateId} onChange={e => updateCredit(i, 'certificateId', e.target.value)} className={inputCls} placeholder="Registry ref #" />
                </div>
              </div>
              <button onClick={() => removeCredit(i)} className="text-xs text-red-500 mt-2 hover:underline">Remove</button>
            </div>
          ))}
        </section>

        {/* Social */}
        <section className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
          <h2 style={{ fontFamily: 'Playfair Display, serif' }} className="text-lg font-semibold mb-4">Social</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className={labelCls}>Employee Count</label>
              <input value={employeeCount} onChange={e => setEmployeeCount(e.target.value)} className={inputCls} type="number" min="0" />
            </div>
            <div>
              <label className={labelCls}>Board Gender Diversity %</label>
              <input value={boardDiversityPct} onChange={e => setBoardDiversityPct(e.target.value)} className={inputCls} type="number" min="0" max="100" placeholder="% women/non-binary" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input type="checkbox" checked={payGapReported} onChange={e => setPayGapReported(e.target.checked)} />
              Gender pay gap reported
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input type="checkbox" checked={supplyChainAudit} onChange={e => setSupplyChainAudit(e.target.checked)} />
              Supply chain audit conducted this period
            </label>
          </div>
        </section>

        {/* Governance */}
        <section data-tour="governance" className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
          <h2 style={{ fontFamily: 'Playfair Display, serif' }} className="text-lg font-semibold mb-4">Governance</h2>
          <div className="mb-4">
            <label className={labelCls}>Governance Policy Summary</label>
            <textarea value={governancePolicy} onChange={e => setGovernancePolicy(e.target.value)} className={`${inputCls} h-20 resize-none`} placeholder="Board structure, remuneration policy, audit committee details…" />
          </div>
          <div className="space-y-2 mb-4">
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input type="checkbox" checked={antiCorruptionPolicy} onChange={e => setAntiCorruptionPolicy(e.target.checked)} />
              Anti-corruption / anti-bribery policy in place
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input type="checkbox" checked={whistleblowerPolicy} onChange={e => setWhistleblowerPolicy(e.target.checked)} />
              Whistleblower protection policy in place
            </label>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Data Verified By</label>
              <input value={dataVerifiedBy} onChange={e => setDataVerifiedBy(e.target.value)} className={inputCls} placeholder="e.g. KPMG Sustainability, Internal audit" />
            </div>
            <div>
              <label className={labelCls}>Verification Date</label>
              <input type="date" value={verificationDate} onChange={e => setVerificationDate(e.target.value)} className={inputCls} />
            </div>
          </div>
        </section>

        <div className="text-center">
          <button onClick={seal} disabled={status === 'sealing'} className="px-8 py-3 rounded-xl text-white font-semibold text-lg disabled:opacity-50" style={{ background: '#c8960a' }}>
            {status === 'sealing' ? 'Sealing…' : 'Seal ESG Report (.uds)'}
          </button>
          {status === 'done' && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 text-sm font-semibold">ESG Report sealed</p>
              <p className="text-green-700 text-xs mt-1 font-mono">{filename}</p>
              <p className="text-green-600 text-xs mt-1">All figures locked with SHA-256. Retrospective changes are detectable.</p>
            </div>
          )}
          {status === 'error' && <p className="mt-4 text-red-600 text-sm">Sealing failed — please try again.</p>}
        </div>

        <section className="mt-16">
          <h2 style={{ fontFamily: 'Playfair Display, serif' }} className="text-2xl font-bold mb-6">
            How UD ESG Report differs from CDP / Workiva / standard reporting templates
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { title: 'Greenwashing prevention by design', body: 'Emission figures are SHA-256 hashed at submission. Any retrospective adjustment of numbers produces a different hash — making manipulation detectable.' },
              { title: 'Carbon credits inside the document', body: 'Registry name, vintage year, certificate IDs and quantities are embedded in the sealed file — not referenced externally where they can be decoupled.' },
              { title: 'No platform dependency', body: 'The sealed .uds is valid JSON. Any auditor, regulator, or investor can verify it independently without access to our infrastructure.' },
              { title: 'Scope 3 category transparency', body: 'Scope 3 category inclusions are recorded in the sealed file. Omitting high-impact categories is visible rather than hidden.' },
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
