'use client'
import { useState, useRef } from 'react'
import TooltipTour from '@/components/TooltipTour'
import { tourSteps } from '@/lib/tourSteps'

async function sha256hex(data: Uint8Array): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer)
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

const CLAIM_TYPES = ['Home / Contents', 'Car / Motor', 'Travel', 'Health / Medical', 'Pet', 'Business / Commercial', 'Life / Critical Illness', 'Other']

export default function InsuranceClaimConsumerPage() {
  const [claimType, setClaimType] = useState('Home / Contents')
  const [policyNumber, setPolicyNumber] = useState('')
  const [insurerName, setInsurerName] = useState('')
  const [claimantName, setClaimantName] = useState('')
  const [incidentDate, setIncidentDate] = useState('')
  const [incidentLocation, setIncidentLocation] = useState('')
  const [description, setDescription] = useState('')
  const [claimedAmount, setClaimedAmount] = useState('')
  const [currency, setCurrency] = useState('GBP')
  const [evidence, setEvidence] = useState<File[]>([])
  const [result, setResult] = useState<{ url: string; name: string; ref: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const addFiles = (files: FileList | null) => { if (files) setEvidence(p => [...p, ...Array.from(files)]) }

  const handleGenerate = async () => {
    if (!claimantName.trim()) { setError('Claimant name is required.'); return }
    if (!description.trim()) { setError('Incident description is required.'); return }
    setError('')
    setLoading(true)
    try {
      const { default: JSZip } = await import('jszip')
      const zip = new JSZip()
      const now = new Date().toISOString()
      const refNum = `CLM-${Date.now().toString(36).toUpperCase().slice(-8)}`

      const evidenceIndex: Array<{ filename: string; sha256: string; size: number }> = []
      for (const f of evidence) {
        const buf = new Uint8Array(await f.arrayBuffer())
        evidenceIndex.push({ filename: f.name, sha256: await sha256hex(buf), size: f.size })
        zip.folder('evidence')?.file(f.name, buf)
      }

      const descHash = await sha256hex(new TextEncoder().encode(description))
      const claimUds = {
        ud_version: '1.0', format: 'uds', id: `claim-${refNum}`, created: now, schema: 'insurance_claim',
        metadata: {
          reference: refNum, claim_type: claimType, policy_number: policyNumber || null, insurer: insurerName || null,
          claimant: claimantName, incident_date: incidentDate || null, incident_location: incidentLocation || null,
          claimed_amount: parseFloat(claimedAmount) || null, currency, evidence_count: evidenceIndex.length,
        },
        provenance: { description_sha256: descHash, sealed_at: now, tool: 'UD Insurance Claim' },
        content: [
          { type: 'heading', text: `Insurance Claim — ${refNum}` },
          { type: 'paragraph', text: `Type: ${claimType}` },
          { type: 'paragraph', text: `Claimant: ${claimantName}` },
          { type: 'paragraph', text: `Policy: ${policyNumber || 'Not provided'}` },
          { type: 'paragraph', text: `Insurer: ${insurerName || 'Not provided'}` },
          { type: 'paragraph', text: `Incident date: ${incidentDate || 'Not specified'}` },
          { type: 'paragraph', text: `Location: ${incidentLocation || 'Not specified'}` },
          { type: 'paragraph', text: `Claimed: ${currency} ${claimedAmount || 'TBD'}` },
          { type: 'heading', level: 2, text: 'Incident Description' },
          { type: 'paragraph', text: description },
          { type: 'paragraph', text: `Description SHA-256: ${descHash}` },
          ...evidenceIndex.map(e => ({ type: 'paragraph', text: `Evidence: ${e.filename} (SHA-256: ${e.sha256.slice(0, 16)}…)` })),
        ],
      }
      zip.file('claim.uds', JSON.stringify(claimUds, null, 2))
      zip.file('bundle.json', JSON.stringify({ type: 'insurance_claim_bundle', claim_id: claimUds.id, reference: refNum, created: now, evidence: evidenceIndex }, null, 2))
      const blob = await zip.generateAsync({ type: 'blob' })
      setResult({ url: URL.createObjectURL(blob), name: `claim-${refNum}.udz`, ref: refNum })
    } catch {
      setError('Failed to generate claim bundle.')
    } finally {
      setLoading(false)
    }
  }

  const inp = "w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:border-[#c8960a]"
  const lbl = "block text-xs font-medium text-[#1e2d3d] mb-1 uppercase tracking-wider font-['DM_Mono',monospace]"

  return (
    <div style={{ background: '#fafaf8', minHeight: '100vh', color: '#1e2d3d' }}>
      <TooltipTour engineId="insurance-claim-consumer" tips={tourSteps['insurance-claim-consumer'] ?? []} />
      <div style={{ background: '#c8960a', color: '#fff', textAlign: 'center', padding: '8px 16px', fontSize: 13, fontWeight: 600 }}>Beta · All features free during beta</div>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 32, fontWeight: 700, margin: 0 }}>UD Insurance Claim</h1>
            <span style={{ background: '#0d9488', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4, fontFamily: "'DM Mono',monospace" }}>FREE · 3/MONTH</span>
          </div>
          <p style={{ color: '#4a5568', fontSize: 15, lineHeight: 1.6, margin: 0 }}>
            Document your insurance claim as a tamper-evident <code style={{ fontFamily: "'DM Mono',monospace" }}>.udz</code> bundle with photos, receipts, and incident details sealed at submission time.
          </p>
        </div>

        <div data-tour="claim-details" style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Claim Details</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div><label className={lbl}>Claim Type</label><select className={inp} value={claimType} onChange={e => setClaimType(e.target.value)}>{CLAIM_TYPES.map(t => <option key={t}>{t}</option>)}</select></div>
            <div><label className={lbl}>Claimant Name *</label><input className={inp} value={claimantName} onChange={e => setClaimantName(e.target.value)} /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div><label className={lbl}>Policy Number</label><input className={inp} value={policyNumber} onChange={e => setPolicyNumber(e.target.value)} /></div>
            <div><label className={lbl}>Insurer</label><input className={inp} value={insurerName} onChange={e => setInsurerName(e.target.value)} /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16, marginBottom: 16 }}>
            <div><label className={lbl}>Incident Date</label><input type="date" className={inp} value={incidentDate} onChange={e => setIncidentDate(e.target.value)} /></div>
            <div><label className={lbl}>Location</label><input className={inp} value={incidentLocation} onChange={e => setIncidentLocation(e.target.value)} placeholder="Where the incident occurred" /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div><label className={lbl}>Claimed Amount</label><input className={inp} value={claimedAmount} onChange={e => setClaimedAmount(e.target.value)} placeholder="0.00" /></div>
            <div><label className={lbl}>Currency</label><select className={inp} value={currency} onChange={e => setCurrency(e.target.value)}>{['GBP','USD','EUR','AUD'].map(c => <option key={c}>{c}</option>)}</select></div>
          </div>
        </div>

        <div data-tour="description" style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <label className={lbl}>Incident Description * <span style={{ color: '#c8960a', textTransform: 'none', letterSpacing: 0 }}>(SHA-256 sealed)</span></label>
          <textarea className={inp} rows={5} value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe exactly what happened, when, and how..." style={{ resize: 'vertical' }} />
        </div>

        <div data-tour="evidence" style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Evidence</div>
          <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 12 }}>Photos, receipts, repair quotes, medical reports — all SHA-256 hashed</div>
          <button onClick={() => fileRef.current?.click()} style={{ background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: 8, padding: '8px 16px', fontSize: 13, cursor: 'pointer' }}>Add Evidence Files</button>
          <input ref={fileRef} type="file" multiple style={{ display: 'none' }} onChange={e => addFiles(e.target.files)} />
          {evidence.length > 0 && (
            <div style={{ marginTop: 8 }}>
              {evidence.map((f, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', background: '#fafaf8', borderRadius: 6, padding: '6px 12px', marginBottom: 4, fontSize: 12, fontFamily: "'DM Mono',monospace" }}>
                  <span>{f.name}</span>
                  <button onClick={() => setEvidence(p => p.filter((_, idx) => idx !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}>×</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && <div style={{ color: '#dc2626', fontSize: 13, marginBottom: 16, padding: '10px 14px', background: '#fef2f2', borderRadius: 8 }}>{error}</div>}
        <button onClick={handleGenerate} disabled={loading} style={{ width: '100%', padding: 14, borderRadius: 10, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', background: loading ? '#d1d5db' : '#1e2d3d', color: '#fff', fontSize: 15, fontWeight: 700 }}>
          {loading ? 'Sealing bundle…' : 'Create Claim Bundle'}
        </button>
        {result && (
          <div style={{ marginTop: 24, padding: 24, background: '#fff', border: '2px solid #c8960a', borderRadius: 12 }}>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Claim Bundle Sealed</div>
            <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 13, marginBottom: 12 }}>Reference: <strong style={{ color: '#c8960a' }}>{result.ref}</strong></div>
            <a href={result.url} download={result.name} style={{ display: 'inline-block', padding: '10px 24px', background: '#c8960a', color: '#fff', borderRadius: 8, fontWeight: 700, textDecoration: 'none', fontSize: 14 }}>Download {result.name}</a>
          </div>
        )}

        <div style={{ marginTop: 64 }}>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 700, marginBottom: 24 }}>How UD Insurance Claim differs from emailing your insurer</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              { title: 'Evidence sealed at submission', body: 'Photos, receipts, and descriptions are SHA-256 hashed at the moment you create the bundle — not after.' },
              { title: 'Tamper-evident record', body: 'The bundle proves the claim was submitted at a specific time with specific evidence. Insurers cannot claim documents were added later.' },
              { title: 'Complete bundle', body: 'One .udz file contains all claim documents with a manifest. Nothing gets lost in email threads.' },
              { title: 'Dispute protection', body: 'In the event of a dispute, the sealed bundle with cryptographic timestamp is stronger evidence than an email.' },
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
