'use client'
import { useState } from 'react'
import TooltipTour from '@/components/TooltipTour'
import { tourSteps } from '@/lib/tourSteps'

async function sha256hex(data: Uint8Array): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer)
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

export default function IdentityDocumentPage() {
  const [fullName, setFullName] = useState('')
  const [dob, setDob] = useState('')
  const [nationality, setNationality] = useState('')
  const [profession, setProfession] = useState('')
  const [employer, setEmployer] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [licences, setLicences] = useState('')
  const [qualifications, setQualifications] = useState('')
  const [notes, setNotes] = useState('')
  const [result, setResult] = useState<{ url: string; name: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleGenerate = async () => {
    if (!fullName.trim()) { setError('Full name is required.'); return }
    setError('')
    setLoading(true)
    try {
      const now = new Date().toISOString()
      const content = `${fullName}|${dob}|${nationality}|${profession}|${employer}|${email}`
      const contentHash = await sha256hex(new TextEncoder().encode(content))
      const doc = {
        ud_version: '1.0',
        format: 'uds',
        id: `id-${contentHash.slice(0, 16)}`,
        created: now,
        schema: 'identity_document',
        metadata: {
          full_name: fullName,
          date_of_birth: dob || null,
          nationality: nationality || null,
          profession: profession || null,
          employer: employer || null,
          email: email || null,
          phone: phone || null,
          address: address || null,
          licences: licences ? licences.split('\n').map(l => l.trim()).filter(Boolean) : [],
          qualifications: qualifications ? qualifications.split('\n').map(q => q.trim()).filter(Boolean) : [],
          notes: notes || null,
        },
        provenance: {
          content_sha256: contentHash,
          sealed_at: now,
          tool: 'UD Identity Document',
          self_sovereign: true,
          verified_by: 'holder',
        },
        content: [
          { type: 'heading', text: `Identity Record — ${fullName}` },
          { type: 'paragraph', text: `Profession: ${profession || 'Not specified'}` },
          { type: 'paragraph', text: `Employer: ${employer || 'Not specified'}` },
          { type: 'paragraph', text: `Nationality: ${nationality || 'Not specified'}` },
          ...(licences ? [{ type: 'paragraph', text: `Licences: ${licences.replace(/\n/g, ', ')}` }] : []),
          ...(qualifications ? [{ type: 'paragraph', text: `Qualifications: ${qualifications.replace(/\n/g, ', ')}` }] : []),
          { type: 'paragraph', text: `SHA-256: ${contentHash}` },
        ],
      }
      const blob = new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const safeName = fullName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      setResult({ url, name: `identity-${safeName}.uds` })
    } catch {
      setError('Failed to generate identity document.')
    } finally {
      setLoading(false)
    }
  }

  const inp = "w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:border-[#c8960a]"
  const lbl = "block text-xs font-medium text-[#1e2d3d] mb-1 uppercase tracking-wider" + " font-['DM_Mono',monospace]"

  return (
    <div style={{ background: '#fafaf8', minHeight: '100vh', color: '#1e2d3d' }}>
      <TooltipTour engineId="identity-document" tips={tourSteps['identity-document'] ?? []} />
      <div style={{ background: '#c8960a', color: '#fff', textAlign: 'center', padding: '8px 16px', fontSize: 13, fontWeight: 600 }}>
        Beta · All features free during beta
      </div>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700, margin: 0 }}>UD Identity Document</h1>
            <span style={{ background: '#0d9488', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4, fontFamily: "'DM Mono',monospace" }}>FREE · 1/MONTH</span>
          </div>
          <p style={{ color: '#4a5568', fontSize: 15, lineHeight: 1.6, margin: 0 }}>
            Create a verifiable personal identity record as a tamper-evident <code style={{ fontFamily: "'DM Mono',monospace" }}>.uds</code> file. Not a government ID — a self-sovereign professional identity document that anyone can verify cryptographically without a central database.
          </p>
        </div>

        <div data-tour="identity-fields" style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Personal Information</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div><label className={lbl}>Full Name *</label><input className={inp} value={fullName} onChange={e => setFullName(e.target.value)} placeholder="e.g. Dr Jane Smith" /></div>
            <div><label className={lbl}>Date of Birth</label><input type="date" className={inp} value={dob} onChange={e => setDob(e.target.value)} /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div><label className={lbl}>Nationality</label><input className={inp} value={nationality} onChange={e => setNationality(e.target.value)} placeholder="e.g. British" /></div>
            <div><label className={lbl}>Profession / Role</label><input className={inp} value={profession} onChange={e => setProfession(e.target.value)} placeholder="e.g. Cardiologist" /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div><label className={lbl}>Employer / Organisation</label><input className={inp} value={employer} onChange={e => setEmployer(e.target.value)} placeholder="e.g. NHS Trust" /></div>
            <div><label className={lbl}>Email</label><input type="email" className={inp} value={email} onChange={e => setEmail(e.target.value)} placeholder="professional email" /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div><label className={lbl}>Phone</label><input className={inp} value={phone} onChange={e => setPhone(e.target.value)} placeholder="+44..." /></div>
            <div><label className={lbl}>Address</label><input className={inp} value={address} onChange={e => setAddress(e.target.value)} placeholder="Optional" /></div>
          </div>
        </div>

        <div data-tour="credentials" style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Credentials & Licences</div>
          <div style={{ marginBottom: 16 }}>
            <label className={lbl}>Professional Licences (one per line)</label>
            <textarea className={inp} rows={3} value={licences} onChange={e => setLicences(e.target.value)} placeholder={"GMC: 1234567\nNurse: 87654321"} style={{ resize: 'vertical' }} />
          </div>
          <div>
            <label className={lbl}>Qualifications (one per line)</label>
            <textarea className={inp} rows={3} value={qualifications} onChange={e => setQualifications(e.target.value)} placeholder={"MBBS — University of London, 2010\nMRCP — 2015"} style={{ resize: 'vertical' }} />
          </div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <label className={lbl}>Additional Notes</label>
          <textarea className={inp} rows={3} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any additional context or verification notes" style={{ resize: 'vertical' }} />
        </div>

        {error && <div style={{ color: '#dc2626', fontSize: 13, marginBottom: 16, padding: '10px 14px', background: '#fef2f2', borderRadius: 8 }}>{error}</div>}

        <button data-tour="generate" onClick={handleGenerate} disabled={loading} style={{ width: '100%', padding: 14, borderRadius: 10, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', background: loading ? '#d1d5db' : '#1e2d3d', color: '#fff', fontSize: 15, fontWeight: 700, fontFamily: "'DM Sans',sans-serif" }}>
          {loading ? 'Sealing…' : 'Seal Identity Document'}
        </button>

        {result && (
          <div style={{ marginTop: 24, padding: 24, background: '#fff', border: '2px solid #c8960a', borderRadius: 12 }}>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Identity Document Sealed</div>
            <a href={result.url} download={result.name} style={{ display: 'inline-block', padding: '10px 24px', background: '#c8960a', color: '#fff', borderRadius: 8, fontWeight: 700, textDecoration: 'none', fontSize: 14 }}>
              Download {result.name}
            </a>
          </div>
        )}

        <div style={{ marginTop: 64 }}>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 700, marginBottom: 24 }}>How UD Identity Document differs from LinkedIn or government IDs</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              { title: 'No central database', body: 'Your identity record is a cryptographically sealed file. No company holds your data. You share it directly — the recipient verifies it without pinging any server.' },
              { title: 'Tamper-evident', body: 'Every field is SHA-256 hashed at the moment of sealing. If anyone alters a single character — name, qualification, licence number — the hash changes and the document fails verification.' },
              { title: 'Self-sovereign', body: 'You create, hold, and share your identity document yourself. No platform can remove it, revoke access, or monetise your data.' },
              { title: 'Open format', body: 'A .uds file is a JSON file. Any technical person can inspect it. It does not require proprietary software to read or verify.' },
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
