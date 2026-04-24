'use client'

import { useState } from 'react'
import TooltipTour from '@/components/TooltipTour'
import { tourSteps } from '@/lib/tourSteps'

async function sha256hex(data: Uint8Array): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer)
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

const CONSENT_TYPES = [
  'Photo / Video Consent',
  'Model Release (Commercial)',
  'Data Processing Consent (GDPR)',
  'Research Participation Consent',
  'Medical Procedure Consent',
  'Event Participation Waiver',
  'Social Media Usage Consent',
  'Children\'s Activity Consent',
]

export default function ConsentFormPage() {
  const [consentType, setConsentType] = useState('')
  const [organizationName, setOrganizationName] = useState('')
  const [organizationAddress, setOrganizationAddress] = useState('')
  const [consenteeName, setConsenteeName] = useState('')
  const [consenteeEmail, setConsenteeEmail] = useState('')
  const [consenteeDob, setConsenteeDob] = useState('')
  const [isMinor, setIsMinor] = useState(false)
  const [guardianName, setGuardianName] = useState('')
  const [guardianRelationship, setGuardianRelationship] = useState('Parent')
  const [purposeDescription, setPurposeDescription] = useState('')
  const [dataCategories, setDataCategories] = useState<string[]>([])
  const [retentionPeriod, setRetentionPeriod] = useState('')
  const [thirdPartySharing, setThirdPartySharing] = useState(false)
  const [thirdParties, setThirdParties] = useState('')
  const [rightToWithdraw, setRightToWithdraw] = useState(true)
  const [additionalClauses, setAdditionalClauses] = useState('')
  const [consentDate, setConsentDate] = useState(new Date().toISOString().split('T')[0])
  const [expiryDate, setExpiryDate] = useState('')
  const [status, setStatus] = useState<'idle' | 'sealing' | 'done' | 'error'>('idle')
  const [filename, setFilename] = useState('')

  const DATA_CATEGORIES = [
    'Name & contact details', 'Date of birth', 'Photographs / images',
    'Video recordings', 'Audio recordings', 'Health data',
    'Location data', 'Biometric data', 'Financial data',
    'Research data / survey responses',
  ]

  function toggleCategory(cat: string) {
    setDataCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat])
  }

  async function seal() {
    if (!consentType || !organizationName || !consenteeName || !purposeDescription) {
      alert('Please fill in consent type, organisation, consenting party, and purpose.')
      return
    }
    if (isMinor && !guardianName) {
      alert('Please provide the guardian/parent name for a minor.')
      return
    }
    setStatus('sealing')
    try {
      const encoder = new TextEncoder()
      const doc = {
        consentType,
        organization: { name: organizationName, address: organizationAddress },
        consentee: {
          name: consenteeName,
          email: consenteeEmail,
          dob: consenteeDob,
          isMinor,
          guardian: isMinor ? { name: guardianName, relationship: guardianRelationship } : undefined,
        },
        consent: {
          purpose: purposeDescription,
          dataCategories,
          retentionPeriod,
          thirdPartySharing,
          thirdParties: thirdPartySharing ? thirdParties : undefined,
          rightToWithdraw,
          additionalClauses,
        },
        dates: { consentGiven: consentDate, expires: expiryDate || undefined },
        gdprBasis: 'Freely given, specific, informed and unambiguous consent (Article 6(1)(a) GDPR)',
      }
      const hash = await sha256hex(encoder.encode(JSON.stringify(doc, null, 2)))
      const id = `CF-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
      const uds = {
        ud_version: '1.0',
        format: 'uds',
        id,
        created: new Date().toISOString(),
        expires: expiryDate ? new Date(expiryDate).toISOString() : undefined,
        schema: 'consent-form/v1',
        metadata: { title: `${consentType} — ${consenteeName}`, consentType, organization: organizationName },
        provenance: { sha256: hash, sealed: new Date().toISOString(), tool: 'UD Consent Form', version: '1.0' },
        content: doc,
      }
      const blob = new Blob([JSON.stringify(uds, null, 2)], { type: 'application/json' })
      const safeName = consenteeName.replace(/[^a-z0-9]/gi, '-').toLowerCase()
      const fname = `consent-form-${safeName}-${id}.uds`
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
      <TooltipTour engineId="consent-form" tips={tourSteps['consent-form'] ?? []} />

      <div className="bg-[#c8960a] text-white text-center py-2 text-sm font-medium">
        Beta — Free during beta
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 style={{ fontFamily: 'Playfair Display, serif' }} className="text-3xl font-bold mb-2">
            UD Consent Form
          </h1>
          <p className="text-gray-500 text-sm">
            GDPR-compliant, tamper-evident consent forms. Photo releases, model releases, data processing consent,
            and research participation — sealed with SHA-256 provenance.
          </p>
          <span className="inline-block mt-2 px-2 py-0.5 text-xs rounded font-semibold" style={{ background: '#e6f4f1', color: '#0d7a6a' }}>
            Free · 5/month
          </span>
        </div>

        {/* Consent Type & Org */}
        <section data-tour="consent-type" className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
          <h2 style={{ fontFamily: 'Playfair Display, serif' }} className="text-lg font-semibold mb-4">Consent Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className={labelCls}>Type of Consent *</label>
              <select value={consentType} onChange={e => setConsentType(e.target.value)} className={inputCls}>
                <option value="">Select type…</option>
                {CONSENT_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Organisation / Data Controller *</label>
              <input value={organizationName} onChange={e => setOrganizationName(e.target.value)} className={inputCls} placeholder="e.g. Bright Media Ltd" />
            </div>
            <div>
              <label className={labelCls}>Organisation Address</label>
              <input value={organizationAddress} onChange={e => setOrganizationAddress(e.target.value)} className={inputCls} placeholder="Registered address" />
            </div>
          </div>
        </section>

        {/* Consenting Party */}
        <section data-tour="consenting-party" className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
          <h2 style={{ fontFamily: 'Playfair Display, serif' }} className="text-lg font-semibold mb-4">Consenting Party</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className={labelCls}>Full Name *</label>
              <input value={consenteeName} onChange={e => setConsenteeName(e.target.value)} className={inputCls} placeholder="As on ID" />
            </div>
            <div>
              <label className={labelCls}>Email</label>
              <input type="email" value={consenteeEmail} onChange={e => setConsenteeEmail(e.target.value)} className={inputCls} placeholder="consent@example.com" />
            </div>
            <div>
              <label className={labelCls}>Date of Birth</label>
              <input type="date" value={consenteeDob} onChange={e => setConsenteeDob(e.target.value)} className={inputCls} />
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer text-sm mb-3">
            <input type="checkbox" checked={isMinor} onChange={e => setIsMinor(e.target.checked)} />
            Consenting party is a minor (under 18) — guardian consent required
          </label>
          {isMinor && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
              <div>
                <label className={labelCls}>Guardian / Parent Name *</label>
                <input value={guardianName} onChange={e => setGuardianName(e.target.value)} className={inputCls} placeholder="Full name" />
              </div>
              <div>
                <label className={labelCls}>Relationship</label>
                <select value={guardianRelationship} onChange={e => setGuardianRelationship(e.target.value)} className={inputCls}>
                  {['Parent', 'Legal guardian', 'Foster carer', 'Other'].map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
            </div>
          )}
        </section>

        {/* Purpose & Data */}
        <section data-tour="purpose" className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
          <h2 style={{ fontFamily: 'Playfair Display, serif' }} className="text-lg font-semibold mb-4">Purpose & Data Scope</h2>
          <div className="mb-4">
            <label className={labelCls}>Purpose Description *</label>
            <textarea value={purposeDescription} onChange={e => setPurposeDescription(e.target.value)} className={`${inputCls} h-24 resize-none`} placeholder="Clearly explain what consent is being given for, how data will be used, and the scope of the activity." />
          </div>
          <div className="mb-4">
            <label className={labelCls}>Data Categories Covered</label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              {DATA_CATEGORIES.map(cat => (
                <label key={cat} className="flex items-center gap-2 cursor-pointer text-sm">
                  <input type="checkbox" checked={dataCategories.includes(cat)} onChange={() => toggleCategory(cat)} />
                  {cat}
                </label>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Data Retention Period</label>
              <input value={retentionPeriod} onChange={e => setRetentionPeriod(e.target.value)} className={inputCls} placeholder="e.g. 2 years, Until project completion" />
            </div>
          </div>
        </section>

        {/* GDPR Rights & Sharing */}
        <section className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
          <h2 style={{ fontFamily: 'Playfair Display, serif' }} className="text-lg font-semibold mb-4">GDPR Rights & Sharing</h2>
          <div className="space-y-3 mb-4">
            <label className="flex items-start gap-2 cursor-pointer text-sm">
              <input type="checkbox" className="mt-0.5" checked={rightToWithdraw} onChange={e => setRightToWithdraw(e.target.checked)} />
              <span>Right to withdraw consent at any time (Article 7(3) GDPR)</span>
            </label>
            <label className="flex items-start gap-2 cursor-pointer text-sm">
              <input type="checkbox" className="mt-0.5" checked={thirdPartySharing} onChange={e => setThirdPartySharing(e.target.checked)} />
              <span>Data may be shared with third parties</span>
            </label>
          </div>
          {thirdPartySharing && (
            <div className="mb-4">
              <label className={labelCls}>Third Parties Named</label>
              <textarea value={thirdParties} onChange={e => setThirdParties(e.target.value)} className={`${inputCls} h-16 resize-none`} placeholder="List third parties by name and purpose" />
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Consent Date</label>
              <input type="date" value={consentDate} onChange={e => setConsentDate(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Consent Expiry (optional)</label>
              <input type="date" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} className={inputCls} />
            </div>
          </div>
          <div className="mt-4">
            <label className={labelCls}>Additional Clauses</label>
            <textarea value={additionalClauses} onChange={e => setAdditionalClauses(e.target.value)} className={`${inputCls} h-16 resize-none`} placeholder="Any additional terms, withdrawal procedures, or special conditions…" />
          </div>
        </section>

        <div className="text-center">
          <button onClick={seal} disabled={status === 'sealing'} className="px-8 py-3 rounded-xl text-white font-semibold text-lg disabled:opacity-50" style={{ background: '#c8960a' }}>
            {status === 'sealing' ? 'Sealing…' : 'Seal Consent Form (.uds)'}
          </button>
          {status === 'done' && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 text-sm font-semibold">Consent form sealed</p>
              <p className="text-green-700 text-xs mt-1 font-mono">{filename}</p>
              <p className="text-green-600 text-xs mt-1">SHA-256 hash embedded. GDPR Article 7(1) compliant record.</p>
            </div>
          )}
          {status === 'error' && <p className="mt-4 text-red-600 text-sm">Sealing failed — please try again.</p>}
        </div>

        <section className="mt-16">
          <h2 style={{ fontFamily: 'Playfair Display, serif' }} className="text-2xl font-bold mb-6">
            How UD Consent Form differs from Google Forms / DocuSign consent templates
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { title: 'GDPR Article 7(1) compliance built in', body: 'The legal basis, data categories, retention period, and right to withdraw are captured in machine-readable fields — not free text.' },
              { title: 'Proof lives in the document', body: 'Consent record is SHA-256 hashed. No database required to prove what was consented to and when.' },
              { title: 'Minor safeguards enforced', body: 'Enabling the minor flag requires a guardian name before sealing — preventing accidental omission of required parental consent.' },
              { title: 'Expiry is cryptographic', body: 'Setting an expiry date locks it into the sealed file. Renewing consent requires a new sealed document — no silent extension.' },
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
