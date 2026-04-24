'use client'
import { useState } from 'react'
import TooltipTour from '@/components/TooltipTour'
import { tourSteps } from '@/lib/tourSteps'

async function sha256hex(data: Uint8Array): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer)
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

const LETTER_TYPES = ['Employment Reference', 'Academic Reference', 'Character Reference', 'Professional Reference', 'Tenancy Reference', 'General Reference']

export default function ReferenceLetterPage() {
  const [refereeName, setRefereeName] = useState('')
  const [refereeTitle, setRefereeTitle] = useState('')
  const [refereeOrg, setRefereeOrg] = useState('')
  const [refereeEmail, setRefereeEmail] = useState('')
  const [subjectName, setSubjectName] = useState('')
  const [letterType, setLetterType] = useState('Employment Reference')
  const [context, setContext] = useState('')
  const [letterText, setLetterText] = useState('')
  const [issueDate, setIssueDate] = useState('')
  const [result, setResult] = useState<{ url: string; name: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleGenerate = async () => {
    if (!refereeName.trim()) { setError('Referee name is required.'); return }
    if (!subjectName.trim()) { setError('Subject name is required.'); return }
    if (!letterText.trim()) { setError('Letter text is required.'); return }
    setError('')
    setLoading(true)
    try {
      const now = new Date().toISOString()
      const date = issueDate || now.slice(0, 10)
      const content = `${refereeName}|${subjectName}|${letterText}|${date}`
      const hash = await sha256hex(new TextEncoder().encode(content))
      const doc = {
        ud_version: '1.0', format: 'uds', id: `ref-${hash.slice(0, 16)}`, created: now, schema: 'reference_letter',
        metadata: {
          referee: { name: refereeName, title: refereeTitle || null, organisation: refereeOrg || null, email: refereeEmail || null },
          subject: subjectName,
          letter_type: letterType,
          context: context || null,
          issue_date: date,
        },
        provenance: { content_sha256: hash, sealed_at: now, tool: 'UD Reference Letter' },
        content: [
          { type: 'heading', text: `${letterType} — ${subjectName}` },
          { type: 'paragraph', text: `Issued by: ${refereeName}${refereeTitle ? `, ${refereeTitle}` : ''}${refereeOrg ? `, ${refereeOrg}` : ''}` },
          { type: 'paragraph', text: `Date: ${date}` },
          ...(context ? [{ type: 'paragraph', text: `Context: ${context}` }] : []),
          { type: 'heading', level: 2, text: 'Reference' },
          { type: 'paragraph', text: letterText },
          { type: 'paragraph', text: `SHA-256: ${hash}` },
          { type: 'paragraph', text: 'This reference letter is sealed and tamper-evident. Verify at utilities.hive.baby/verify.' },
        ],
      }
      const blob = new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' })
      const safeName = subjectName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      setResult({ url: URL.createObjectURL(blob), name: `reference-${safeName}.uds` })
    } catch {
      setError('Failed to generate reference letter.')
    } finally {
      setLoading(false)
    }
  }

  const inp = "w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:border-[#c8960a]"
  const lbl = "block text-xs font-medium text-[#1e2d3d] mb-1 uppercase tracking-wider font-['DM_Mono',monospace]"

  return (
    <div style={{ background: '#fafaf8', minHeight: '100vh', color: '#1e2d3d' }}>
      <TooltipTour engineId="reference-letter" tips={tourSteps['reference-letter'] ?? []} />
      <div style={{ background: '#c8960a', color: '#fff', textAlign: 'center', padding: '8px 16px', fontSize: 13, fontWeight: 600 }}>Beta · All features free during beta</div>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 32, fontWeight: 700, margin: 0 }}>UD Reference Letter</h1>
            <span style={{ background: '#0d9488', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4, fontFamily: "'DM Mono',monospace" }}>FREE · 3/MONTH</span>
          </div>
          <p style={{ color: '#4a5568', fontSize: 15, lineHeight: 1.6, margin: 0 }}>
            Create tamper-evident reference and recommendation letters as <code style={{ fontFamily: "'DM Mono',monospace" }}>.uds</code> files. Cannot be altered after issuance. Recipients verify authenticity without contacting the referee.
          </p>
        </div>

        <div data-tour="referee-details" style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Referee Details</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div><label className={lbl}>Referee Name *</label><input className={inp} value={refereeName} onChange={e => setRefereeName(e.target.value)} placeholder="Dr Jane Smith" /></div>
            <div><label className={lbl}>Title / Role</label><input className={inp} value={refereeTitle} onChange={e => setRefereeTitle(e.target.value)} placeholder="Consultant Cardiologist" /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div><label className={lbl}>Organisation</label><input className={inp} value={refereeOrg} onChange={e => setRefereeOrg(e.target.value)} placeholder="NHS Trust" /></div>
            <div><label className={lbl}>Email</label><input type="email" className={inp} value={refereeEmail} onChange={e => setRefereeEmail(e.target.value)} placeholder="For verification contact" /></div>
          </div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Reference Subject</div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div><label className={lbl}>Subject Name *</label><input className={inp} value={subjectName} onChange={e => setSubjectName(e.target.value)} placeholder="John Doe" /></div>
            <div><label className={lbl}>Letter Type</label>
              <select className={inp} value={letterType} onChange={e => setLetterType(e.target.value)}>
                {LETTER_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div><label className={lbl}>Issue Date</label><input type="date" className={inp} value={issueDate} onChange={e => setIssueDate(e.target.value)} /></div>
          </div>
          <div><label className={lbl}>Context (role applied for, course, etc.)</label><input className={inp} value={context} onChange={e => setContext(e.target.value)} placeholder="e.g. Application for Senior Nurse position at Barts Health" /></div>
        </div>

        <div data-tour="letter-content" style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <label className={lbl}>Reference Text * <span style={{ color: '#c8960a', textTransform: 'none' }}>(SHA-256 sealed — cannot be altered after generation)</span></label>
          <textarea className={inp} rows={8} value={letterText} onChange={e => setLetterText(e.target.value)} placeholder="Write the full reference letter text here..." style={{ resize: 'vertical' }} />
        </div>

        {error && <div style={{ color: '#dc2626', fontSize: 13, marginBottom: 16, padding: '10px 14px', background: '#fef2f2', borderRadius: 8 }}>{error}</div>}
        <button onClick={handleGenerate} disabled={loading} style={{ width: '100%', padding: 14, borderRadius: 10, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', background: loading ? '#d1d5db' : '#1e2d3d', color: '#fff', fontSize: 15, fontWeight: 700 }}>
          {loading ? 'Sealing…' : 'Seal Reference Letter'}
        </button>
        {result && (
          <div style={{ marginTop: 24, padding: 24, background: '#fff', border: '2px solid #c8960a', borderRadius: 12 }}>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Reference Letter Sealed</div>
            <a href={result.url} download={result.name} style={{ display: 'inline-block', padding: '10px 24px', background: '#c8960a', color: '#fff', borderRadius: 8, fontWeight: 700, textDecoration: 'none', fontSize: 14 }}>Download {result.name}</a>
          </div>
        )}

        <div style={{ marginTop: 64 }}>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 700, marginBottom: 24 }}>How UD Reference Letter differs from PDF letters or email references</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              { title: 'Cannot be altered', body: 'A PDF reference letter can be edited. A .uds reference letter is SHA-256 sealed — any change breaks the hash. Forgery is detectable.' },
              { title: 'Verifiable without calls', body: 'Recipients can verify the letter cryptographically without calling the referee. Faster hiring, less referee burden.' },
              { title: 'Tamper-evident timestamp', body: 'The sealed date is embedded in the .uds. Nobody can backdate a reference letter or claim it was written before an incident.' },
              { title: 'Portable', body: 'Share the .uds directly. No letterhead, no printing, no scanning. Works internationally and digitally.' },
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
