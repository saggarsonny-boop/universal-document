'use client'
import { useState } from 'react'
import TooltipTour from '@/components/TooltipTour'
import { tourSteps } from '@/lib/tourSteps'

async function sha256hex(data: Uint8Array): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer)
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

const POA_TYPES = ['General POA', 'Lasting POA (LPA) — Health & Welfare', 'Lasting POA (LPA) — Property & Financial', 'Enduring POA', 'Financial POA', 'Medical / Healthcare POA']

export default function PowerOfAttorneyPage() {
  const [poaType, setPoaType] = useState('General POA')
  const [donorName, setDonorName] = useState('')
  const [donorDob, setDonorDob] = useState('')
  const [donorAddress, setDonorAddress] = useState('')
  const [donorCapacity, setDonorCapacity] = useState('I confirm I have mental capacity to grant this power of attorney.')
  const [attorneyName, setAttorneyName] = useState('')
  const [attorneyRelationship, setAttorneyRelationship] = useState('')
  const [attorneyAddress, setAttorneyAddress] = useState('')
  const [scope, setScope] = useState('')
  const [restrictions, setRestrictions] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [result, setResult] = useState<{ url: string; name: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleGenerate = async () => {
    if (!donorName.trim()) { setError('Donor name is required.'); return }
    if (!attorneyName.trim()) { setError('Attorney name is required.'); return }
    setError('')
    setLoading(true)
    try {
      const now = new Date().toISOString()
      const content = `${poaType}|${donorName}|${attorneyName}|${scope}|${now}`
      const hash = await sha256hex(new TextEncoder().encode(content))
      const doc = {
        ud_version: '1.0', format: 'uds', id: `poa-${hash.slice(0, 16)}`, created: now, schema: 'power_of_attorney',
        metadata: {
          poa_type: poaType,
          donor: { name: donorName, date_of_birth: donorDob || null, address: donorAddress || null, capacity_statement: donorCapacity },
          attorney: { name: attorneyName, relationship: attorneyRelationship || null, address: attorneyAddress || null },
          scope: scope || null, restrictions: restrictions || null,
          start_date: startDate || now.slice(0, 10), end_date: endDate || null,
        },
        provenance: { content_sha256: hash, sealed_at: now, tool: 'UD Power of Attorney' },
        content: [
          { type: 'heading', text: `${poaType}` },
          { type: 'paragraph', text: `Donor: ${donorName}` },
          { type: 'paragraph', text: `Attorney: ${attorneyName}${attorneyRelationship ? ` (${attorneyRelationship})` : ''}` },
          { type: 'paragraph', text: `Capacity statement: ${donorCapacity}` },
          ...(scope ? [{ type: 'heading', level: 2, text: 'Scope of Powers' }, { type: 'paragraph', text: scope }] : []),
          ...(restrictions ? [{ type: 'heading', level: 2, text: 'Restrictions' }, { type: 'paragraph', text: restrictions }] : []),
          { type: 'paragraph', text: `Effective from: ${startDate || now.slice(0, 10)}${endDate ? ` to ${endDate}` : ' (no end date)'}` },
          { type: 'paragraph', text: `SHA-256: ${hash}` },
        ],
      }
      const blob = new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' })
      const safeName = donorName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      setResult({ url: URL.createObjectURL(blob), name: `poa-${safeName}.uds` })
    } catch {
      setError('Failed to generate POA document.')
    } finally {
      setLoading(false)
    }
  }

  const inp = "w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:border-[#c8960a]"
  const lbl = "block text-xs font-medium text-[#1e2d3d] mb-1 uppercase tracking-wider font-['DM_Mono',monospace]"

  return (
    <div style={{ background: '#fafaf8', minHeight: '100vh', color: '#1e2d3d' }}>
      <TooltipTour engineId="power-of-attorney" tips={tourSteps['power-of-attorney'] ?? []} />
      <div style={{ background: '#c8960a', color: '#fff', textAlign: 'center', padding: '8px 16px', fontSize: 13, fontWeight: 600 }}>Beta · All features free during beta</div>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 32, fontWeight: 700, margin: 0 }}>UD Power of Attorney</h1>
            <span style={{ background: '#0d9488', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4, fontFamily: "'DM Mono',monospace" }}>FREE · 1 BASIC</span>
          </div>
          <p style={{ color: '#4a5568', fontSize: 15, lineHeight: 1.6, margin: 0 }}>
            Create a structured Power of Attorney document as a tamper-evident <code style={{ fontFamily: "'DM Mono',monospace" }}>.uds</code> — General, Lasting, Financial, or Medical POA. A starting point for legal review.
          </p>
        </div>
        <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '12px 16px', marginBottom: 24 }}>
          <p style={{ margin: 0, fontSize: 13, color: '#7f1d1d', lineHeight: 1.5 }}>
            <strong>Legal Notice:</strong> This generates a draft starting point only. Lasting Powers of Attorney in England & Wales must be registered with the Office of the Public Guardian. Always consult a qualified solicitor. This is not legal advice.
          </p>
        </div>

        <div data-tour="poa-type" style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <label className={lbl}>POA Type</label>
          <select className={inp} value={poaType} onChange={e => setPoaType(e.target.value)}>{POA_TYPES.map(t => <option key={t}>{t}</option>)}</select>
        </div>

        <div data-tour="donor" style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Donor (Person Granting Authority)</div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 16 }}>
            <div><label className={lbl}>Full Name *</label><input className={inp} value={donorName} onChange={e => setDonorName(e.target.value)} /></div>
            <div><label className={lbl}>Date of Birth</label><input type="date" className={inp} value={donorDob} onChange={e => setDonorDob(e.target.value)} /></div>
          </div>
          <div style={{ marginBottom: 16 }}><label className={lbl}>Address</label><input className={inp} value={donorAddress} onChange={e => setDonorAddress(e.target.value)} /></div>
          <div>
            <label className={lbl}>Capacity Statement</label>
            <textarea className={inp} rows={2} value={donorCapacity} onChange={e => setDonorCapacity(e.target.value)} style={{ resize: 'vertical' }} />
          </div>
        </div>

        <div data-tour="attorney" style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Attorney (Person Granted Authority)</div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 16 }}>
            <div><label className={lbl}>Full Name *</label><input className={inp} value={attorneyName} onChange={e => setAttorneyName(e.target.value)} /></div>
            <div><label className={lbl}>Relationship to Donor</label><input className={inp} value={attorneyRelationship} onChange={e => setAttorneyRelationship(e.target.value)} placeholder="e.g. Spouse, Child" /></div>
          </div>
          <div><label className={lbl}>Address</label><input className={inp} value={attorneyAddress} onChange={e => setAttorneyAddress(e.target.value)} /></div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <div style={{ marginBottom: 16 }}><label className={lbl}>Scope of Powers</label><textarea className={inp} rows={3} value={scope} onChange={e => setScope(e.target.value)} placeholder="Describe the powers being granted" style={{ resize: 'vertical' }} /></div>
          <div style={{ marginBottom: 16 }}><label className={lbl}>Restrictions</label><textarea className={inp} rows={2} value={restrictions} onChange={e => setRestrictions(e.target.value)} placeholder="Any restrictions on the attorney's powers" style={{ resize: 'vertical' }} /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div><label className={lbl}>Start Date</label><input type="date" className={inp} value={startDate} onChange={e => setStartDate(e.target.value)} /></div>
            <div><label className={lbl}>End Date (leave blank for indefinite)</label><input type="date" className={inp} value={endDate} onChange={e => setEndDate(e.target.value)} /></div>
          </div>
        </div>

        {error && <div style={{ color: '#dc2626', fontSize: 13, marginBottom: 16, padding: '10px 14px', background: '#fef2f2', borderRadius: 8 }}>{error}</div>}
        <button onClick={handleGenerate} disabled={loading} style={{ width: '100%', padding: 14, borderRadius: 10, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', background: loading ? '#d1d5db' : '#1e2d3d', color: '#fff', fontSize: 15, fontWeight: 700 }}>
          {loading ? 'Sealing…' : 'Generate POA Draft'}
        </button>
        {result && (
          <div style={{ marginTop: 24, padding: 24, background: '#fff', border: '2px solid #c8960a', borderRadius: 12 }}>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, marginBottom: 12 }}>POA Draft Generated</div>
            <a href={result.url} download={result.name} style={{ display: 'inline-block', padding: '10px 24px', background: '#c8960a', color: '#fff', borderRadius: 8, fontWeight: 700, textDecoration: 'none', fontSize: 14 }}>Download {result.name}</a>
          </div>
        )}

        <div style={{ marginTop: 64 }}>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 700, marginBottom: 24 }}>How UD POA differs from online templates or solicitor-only documents</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              { title: 'Tamper-evident scope', body: 'Once sealed, the scope of powers cannot be changed. Disputes about what the attorney was authorised to do are resolved by verifying the hash.' },
              { title: 'Capacity recorded', body: 'The donor\'s capacity statement is embedded as structured data — not just a signature box.' },
              { title: 'Starting point for legal review', body: 'Generate the draft here, then take the structured .uds to a solicitor. Saves significant time and legal fees on document preparation.' },
              { title: 'Cryptographic timestamp', body: 'Proves when the POA was granted. Prevents later disputes about when authority was given or revoked.' },
            ].map(c => (
              <div key={c.title} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: 20 }}>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>{c.title}</div>
                <div style={{ fontSize: 13, color: '#4a5568', lineHeight: 1.6 }}>{c.body}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
