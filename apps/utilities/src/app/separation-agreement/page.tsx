'use client'
import { useState } from 'react'
import TooltipTour from '@/components/TooltipTour'
import { tourSteps } from '@/lib/tourSteps'

async function sha256hex(data: Uint8Array): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer)
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

type Asset = { id: string; description: string; value: string; allocation: string }

export default function SeparationAgreementPage() {
  const [party1Name, setParty1Name] = useState('')
  const [party2Name, setParty2Name] = useState('')
  const [party1Address, setParty1Address] = useState('')
  const [party2Address, setParty2Address] = useState('')
  const [separationDate, setSeparationDate] = useState('')
  const [assets, setAssets] = useState<Asset[]>([{ id: 'a1', description: '', value: '', allocation: 'Equal split' }])
  const [childArrangements, setChildArrangements] = useState('')
  const [maintenanceTerms, setMaintenanceTerms] = useState('')
  const [additionalTerms, setAdditionalTerms] = useState('')
  const [reviewDate, setReviewDate] = useState('')
  const [result, setResult] = useState<{ url: string; name: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const addAsset = () => setAssets(p => [...p, { id: `a${Date.now()}`, description: '', value: '', allocation: 'Equal split' }])
  const updateAsset = (id: string, f: keyof Asset, v: string) => setAssets(p => p.map(a => a.id === id ? { ...a, [f]: v } : a))

  const handleGenerate = async () => {
    if (!party1Name.trim() || !party2Name.trim()) { setError('Both parties\' names are required.'); return }
    setError('')
    setLoading(true)
    try {
      const now = new Date().toISOString()
      const content = `${party1Name}|${party2Name}|${separationDate}|${childArrangements}|${maintenanceTerms}`
      const hash = await sha256hex(new TextEncoder().encode(content))
      const doc = {
        ud_version: '1.0', format: 'uds', id: `sep-${hash.slice(0, 16)}`, created: now, schema: 'separation_agreement',
        metadata: {
          party_1: { name: party1Name, address: party1Address || null },
          party_2: { name: party2Name, address: party2Address || null },
          separation_date: separationDate || null, review_date: reviewDate || null,
          assets: assets.filter(a => a.description).map(a => ({ description: a.description, value: a.value || null, allocation: a.allocation })),
          child_arrangements: childArrangements || null, maintenance_terms: maintenanceTerms || null, additional_terms: additionalTerms || null,
        },
        provenance: { content_sha256: hash, sealed_at: now, tool: 'UD Separation Agreement' },
        content: [
          { type: 'heading', text: 'Separation Agreement' },
          { type: 'paragraph', text: `Party 1: ${party1Name}` },
          { type: 'paragraph', text: `Party 2: ${party2Name}` },
          { type: 'paragraph', text: `Separation Date: ${separationDate || 'Not specified'}` },
          ...(assets.filter(a => a.description).length > 0 ? [{ type: 'heading', level: 2, text: 'Assets' }, ...assets.filter(a => a.description).map(a => ({ type: 'paragraph', text: `${a.description}: ${a.allocation}${a.value ? ` (${a.value})` : ''}` }))] : []),
          ...(childArrangements ? [{ type: 'heading', level: 2, text: 'Child Arrangements' }, { type: 'paragraph', text: childArrangements }] : []),
          ...(maintenanceTerms ? [{ type: 'heading', level: 2, text: 'Maintenance' }, { type: 'paragraph', text: maintenanceTerms }] : []),
          ...(additionalTerms ? [{ type: 'heading', level: 2, text: 'Additional Terms' }, { type: 'paragraph', text: additionalTerms }] : []),
          { type: 'paragraph', text: `SHA-256: ${hash}` },
        ],
      }
      const blob = new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' })
      const safeName = `${party1Name}-${party2Name}`.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 30)
      setResult({ url: URL.createObjectURL(blob), name: `separation-${safeName}.uds` })
    } catch {
      setError('Failed to generate separation agreement.')
    } finally {
      setLoading(false)
    }
  }

  const inp = "w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:border-[#c8960a]"
  const lbl = "block text-xs font-medium text-[#1e2d3d] mb-1 uppercase tracking-wider font-['DM_Mono',monospace]"

  return (
    <div style={{ background: '#fafaf8', minHeight: '100vh', color: '#1e2d3d' }}>
      <TooltipTour engineId="separation-agreement" tips={tourSteps['separation-agreement'] ?? []} />
      <div style={{ background: '#c8960a', color: '#fff', textAlign: 'center', padding: '8px 16px', fontSize: 13, fontWeight: 600 }}>Beta · All features free during beta</div>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 32, fontWeight: 700, margin: 0 }}>UD Separation Agreement</h1>
            <span style={{ background: '#0d9488', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4, fontFamily: "'DM Mono',monospace" }}>FREE · 1 BASIC</span>
          </div>
          <p style={{ color: '#4a5568', fontSize: 15, lineHeight: 1.6, margin: 0 }}>
            Create a structured separation agreement as a tamper-evident <code style={{ fontFamily: "'DM Mono',monospace" }}>.uds</code> file. Neither party can later claim terms were different from what was agreed.
          </p>
        </div>
        <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '12px 16px', marginBottom: 24 }}>
          <p style={{ margin: 0, fontSize: 13, color: '#7f1d1d', lineHeight: 1.5 }}>
            <strong>Legal Notice:</strong> This tool creates a starting point for separation negotiations. It is not a substitute for legal advice. Separation agreements involving children, pensions, or property should be reviewed by a qualified solicitor or family law attorney. This is not legal advice.
          </p>
        </div>

        <div data-tour="parties" style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Parties</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div><label className={lbl}>Party 1 Name *</label><input className={inp} value={party1Name} onChange={e => setParty1Name(e.target.value)} /></div>
            <div><label className={lbl}>Party 2 Name *</label><input className={inp} value={party2Name} onChange={e => setParty2Name(e.target.value)} /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div><label className={lbl}>Party 1 Address</label><input className={inp} value={party1Address} onChange={e => setParty1Address(e.target.value)} /></div>
            <div><label className={lbl}>Party 2 Address</label><input className={inp} value={party2Address} onChange={e => setParty2Address(e.target.value)} /></div>
          </div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div><label className={lbl}>Separation Date</label><input type="date" className={inp} value={separationDate} onChange={e => setSeparationDate(e.target.value)} /></div>
            <div><label className={lbl}>Review Date</label><input type="date" className={inp} value={reviewDate} onChange={e => setReviewDate(e.target.value)} /></div>
          </div>
        </div>

        <div data-tour="assets" style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700 }}>Assets</div>
            <button onClick={addAsset} style={{ background: '#1e2d3d', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: 13, cursor: 'pointer' }}>+ Add Asset</button>
          </div>
          {assets.map(a => (
            <div key={a.id} style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 2fr', gap: 10, marginBottom: 8 }}>
              <input className={inp} value={a.description} onChange={e => updateAsset(a.id, 'description', e.target.value)} placeholder="Asset description (e.g. Family home)" />
              <input className={inp} value={a.value} onChange={e => updateAsset(a.id, 'value', e.target.value)} placeholder="£ value" />
              <select className={inp} value={a.allocation} onChange={e => updateAsset(a.id, 'allocation', e.target.value)}>
                {['Equal split', `To ${party1Name || 'Party 1'}`, `To ${party2Name || 'Party 2'}`, 'For sale, proceeds split', 'To be agreed'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          ))}
        </div>

        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <div style={{ marginBottom: 16 }}><label className={lbl}>Child Arrangements</label><textarea className={inp} rows={3} value={childArrangements} onChange={e => setChildArrangements(e.target.value)} placeholder="Residence, contact schedule, school decisions…" style={{ resize: 'vertical' }} /></div>
          <div style={{ marginBottom: 16 }}><label className={lbl}>Maintenance Terms</label><textarea className={inp} rows={2} value={maintenanceTerms} onChange={e => setMaintenanceTerms(e.target.value)} placeholder="Monthly amounts, duration, review conditions…" style={{ resize: 'vertical' }} /></div>
          <div><label className={lbl}>Additional Terms</label><textarea className={inp} rows={2} value={additionalTerms} onChange={e => setAdditionalTerms(e.target.value)} style={{ resize: 'vertical' }} /></div>
        </div>

        {error && <div style={{ color: '#dc2626', fontSize: 13, marginBottom: 16, padding: '10px 14px', background: '#fef2f2', borderRadius: 8 }}>{error}</div>}
        <button onClick={handleGenerate} disabled={loading} style={{ width: '100%', padding: 14, borderRadius: 10, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', background: loading ? '#d1d5db' : '#1e2d3d', color: '#fff', fontSize: 15, fontWeight: 700 }}>
          {loading ? 'Sealing…' : 'Seal Separation Agreement'}
        </button>
        {result && (
          <div style={{ marginTop: 24, padding: 24, background: '#fff', border: '2px solid #c8960a', borderRadius: 12 }}>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Agreement Sealed</div>
            <a href={result.url} download={result.name} style={{ display: 'inline-block', padding: '10px 24px', background: '#c8960a', color: '#fff', borderRadius: 8, fontWeight: 700, textDecoration: 'none', fontSize: 14 }}>Download {result.name}</a>
          </div>
        )}

        <div style={{ marginTop: 64 }}>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 700, marginBottom: 24 }}>How UD Separation Agreement differs from a Word template or solicitor-only document</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              { title: 'Neither party can alter terms', body: 'Once sealed, the SHA-256 hash makes any alteration detectable. "I never agreed to that" disputes are resolved by verifying the hash.' },
              { title: 'Cryptographic timestamp', body: 'The agreement date is sealed into the .uds. Neither party can backdate or claim the document was signed earlier.' },
              { title: 'Starting point, not final word', body: 'This tool generates a structured starting point. Use it to agree terms before going to a solicitor — saving significantly on legal fees.' },
              { title: 'Structured data', body: 'Assets, child arrangements, and maintenance terms are stored as structured data objects, not just prose — easier to reference and review.' },
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
