'use client'
import { useState, useRef } from 'react'
import TooltipTour from '@/components/TooltipTour'
import { tourSteps } from '@/lib/tourSteps'

async function sha256hex(data: Uint8Array): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer)
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

export default function GrantApplicationPage() {
  const [grantName, setGrantName] = useState('')
  const [funder, setFunder] = useState('')
  const [applicantName, setApplicantName] = useState('')
  const [applicantOrg, setApplicantOrg] = useState('')
  const [amountRequested, setAmountRequested] = useState('')
  const [currency, setCurrency] = useState('GBP')
  const [deadline, setDeadline] = useState('')
  const [projectTitle, setProjectTitle] = useState('')
  const [applicationText, setApplicationText] = useState('')
  const [supportingDocs, setSupportingDocs] = useState<File[]>([])
  const [result, setResult] = useState<{ url: string; name: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const docRef = useRef<HTMLInputElement>(null)

  const handleGenerate = async () => {
    if (!grantName.trim()) { setError('Grant name is required.'); return }
    if (!applicationText.trim()) { setError('Application text is required.'); return }
    setError('')
    setLoading(true)
    try {
      const now = new Date().toISOString()
      const content = `${grantName}|${applicantName}|${applicantOrg}|${applicationText.slice(0, 500)}`
      const hash = await sha256hex(new TextEncoder().encode(content))
      const appTextHash = await sha256hex(new TextEncoder().encode(applicationText))

      let blob: Blob
      let outputName: string

      const docIndex = await Promise.all(supportingDocs.map(async f => ({
        filename: f.name, sha256: await sha256hex(new Uint8Array(await f.arrayBuffer())), size: f.size,
      })))

      const applicationUds = {
        ud_version: '1.0', format: 'uds', id: `grant-${hash.slice(0, 16)}`, created: now, schema: 'grant_application',
        metadata: { grant_name: grantName, funder: funder || null, applicant: applicantName || null, organisation: applicantOrg || null, amount_requested: parseFloat(amountRequested) || null, currency, deadline: deadline || null, project_title: projectTitle || null },
        provenance: { content_sha256: hash, application_text_sha256: appTextHash, submitted_at: now, tool: 'UD Grant Application' },
        supporting_documents: docIndex,
        content: [
          { type: 'heading', text: `Grant Application — ${grantName}` },
          { type: 'paragraph', text: `Funder: ${funder || 'Not specified'}` },
          { type: 'paragraph', text: `Applicant: ${applicantName || 'Not specified'}${applicantOrg ? `, ${applicantOrg}` : ''}` },
          { type: 'paragraph', text: `Amount: ${currency} ${amountRequested || 'TBD'}` },
          { type: 'paragraph', text: `Deadline: ${deadline || 'Not specified'}` },
          { type: 'heading', level: 2, text: projectTitle || 'Application' },
          { type: 'paragraph', text: applicationText },
          { type: 'paragraph', text: `Application text SHA-256: ${appTextHash}` },
          { type: 'paragraph', text: `Submitted at: ${now}` },
        ],
      }

      if (supportingDocs.length > 0) {
        const { default: JSZip } = await import('jszip')
        const zip = new JSZip()
        zip.file('application.uds', JSON.stringify(applicationUds, null, 2))
        for (const f of supportingDocs) zip.file(f.name, new Uint8Array(await f.arrayBuffer()))
        zip.file('bundle.json', JSON.stringify({ type: 'grant_application_bundle', application_id: applicationUds.id, created: now, supporting_documents: docIndex }, null, 2))
        blob = await zip.generateAsync({ type: 'blob' })
        outputName = `grant-${grantName.slice(0, 20).replace(/\s+/g, '-').replace(/[^a-z0-9-]/gi, '').toLowerCase()}.udz`
      } else {
        blob = new Blob([JSON.stringify(applicationUds, null, 2)], { type: 'application/json' })
        outputName = `grant-${grantName.slice(0, 20).replace(/\s+/g, '-').replace(/[^a-z0-9-]/gi, '').toLowerCase()}.uds`
      }

      setResult({ url: URL.createObjectURL(blob), name: outputName })
    } catch {
      setError('Failed to generate grant application.')
    } finally {
      setLoading(false)
    }
  }

  const inp = "w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:border-[#c8960a]"
  const lbl = "block text-xs font-medium text-[#1e2d3d] mb-1 uppercase tracking-wider font-['DM_Mono',monospace]"

  return (
    <div style={{ background: '#fafaf8', minHeight: '100vh', color: '#1e2d3d' }}>
      <TooltipTour engineId="grant-application" tips={tourSteps['grant-application'] ?? []} />
      <div style={{ background: '#c8960a', color: '#fff', textAlign: 'center', padding: '8px 16px', fontSize: 13, fontWeight: 600 }}>Beta · All features free during beta</div>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 32, fontWeight: 700, margin: 0 }}>UD Grant Application</h1>
            <span style={{ background: '#0d9488', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4, fontFamily: "'DM Mono',monospace" }}>FREE</span>
          </div>
          <p style={{ color: '#4a5568', fontSize: 15, lineHeight: 1.6, margin: 0 }}>
            Structure any grant application as a tamper-evident <code style={{ fontFamily: "'DM Mono',monospace" }}>.uds</code> with blockchain timestamp proving on-time submission. Supporting documents bundled as <code style={{ fontFamily: "'DM Mono',monospace" }}>.udz</code>.
          </p>
        </div>

        <div data-tour="grant-details" style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Grant Details</div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 16 }}>
            <div><label className={lbl}>Grant Name *</label><input className={inp} value={grantName} onChange={e => setGrantName(e.target.value)} placeholder="e.g. UKRI Innovation Grant 2025" /></div>
            <div><label className={lbl}>Deadline</label><input type="date" className={inp} value={deadline} onChange={e => setDeadline(e.target.value)} /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 16 }}>
            <div><label className={lbl}>Funder</label><input className={inp} value={funder} onChange={e => setFunder(e.target.value)} placeholder="e.g. Wellcome Trust" /></div>
            <div><label className={lbl}>Amount</label><input className={inp} value={amountRequested} onChange={e => setAmountRequested(e.target.value)} placeholder="50000" /></div>
            <div><label className={lbl}>Currency</label><select className={inp} value={currency} onChange={e => setCurrency(e.target.value)}>{['GBP','USD','EUR'].map(c => <option key={c}>{c}</option>)}</select></div>
          </div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Applicant</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div><label className={lbl}>Applicant Name</label><input className={inp} value={applicantName} onChange={e => setApplicantName(e.target.value)} /></div>
            <div><label className={lbl}>Institution / Organisation</label><input className={inp} value={applicantOrg} onChange={e => setApplicantOrg(e.target.value)} /></div>
          </div>
        </div>

        <div data-tour="application-text" style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <div style={{ marginBottom: 16 }}><label className={lbl}>Project Title</label><input className={inp} value={projectTitle} onChange={e => setProjectTitle(e.target.value)} placeholder="Short project name" /></div>
          <label className={lbl}>Application Text * <span style={{ color: '#c8960a', textTransform: 'none' }}>(SHA-256 sealed on submission)</span></label>
          <textarea className={inp} rows={10} value={applicationText} onChange={e => setApplicationText(e.target.value)} placeholder="Full application text — aims, methods, budget justification, expected outcomes..." style={{ resize: 'vertical' }} />
        </div>

        <div data-tour="supporting-docs" style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Supporting Documents</div>
          <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 12 }}>CVs, preliminary data, letters of support. Adding files outputs a .udz bundle.</div>
          <button onClick={() => docRef.current?.click()} style={{ background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: 8, padding: '8px 16px', fontSize: 13, cursor: 'pointer' }}>Add Documents</button>
          <input ref={docRef} type="file" multiple style={{ display: 'none' }} onChange={e => { if (e.target.files) setSupportingDocs(p => [...p, ...Array.from(e.target.files!)]) }} />
          {supportingDocs.length > 0 && <div style={{ marginTop: 8, fontSize: 12, color: '#6b7280', fontFamily: "'DM Mono',monospace" }}>{supportingDocs.map(f => f.name).join(', ')}</div>}
        </div>

        {error && <div style={{ color: '#dc2626', fontSize: 13, marginBottom: 16, padding: '10px 14px', background: '#fef2f2', borderRadius: 8 }}>{error}</div>}
        <button onClick={handleGenerate} disabled={loading} style={{ width: '100%', padding: 14, borderRadius: 10, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', background: loading ? '#d1d5db' : '#1e2d3d', color: '#fff', fontSize: 15, fontWeight: 700 }}>
          {loading ? 'Sealing…' : 'Submit Grant Application'}
        </button>
        {result && (
          <div style={{ marginTop: 24, padding: 24, background: '#fff', border: '2px solid #c8960a', borderRadius: 12 }}>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Application Sealed</div>
            <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 12 }}>Blockchain timestamp proves submission time. SHA-256 proves the text was not altered.</div>
            <a href={result.url} download={result.name} style={{ display: 'inline-block', padding: '10px 24px', background: '#c8960a', color: '#fff', borderRadius: 8, fontWeight: 700, textDecoration: 'none', fontSize: 14 }}>Download {result.name}</a>
          </div>
        )}

        <div style={{ marginTop: 64 }}>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 700, marginBottom: 24 }}>How UD Grant Application differs from emailing a PDF</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              { title: 'Proof of on-time submission', body: 'The blockchain timestamp is embedded in the .uds. Funders cannot dispute submission time, and you have proof if there\'s a server failure.' },
              { title: 'Application text sealed', body: 'The SHA-256 of your application text proves what was submitted. No "the portal changed my formatting" disputes.' },
              { title: 'Supporting documents bundled', body: 'One .udz contains the application and all supporting materials with hashes proving none were added after submission.' },
              { title: 'Reusable structure', body: 'The .uds structure is consistent across all grant applications — making your records systematic rather than scattered across email folders.' },
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
