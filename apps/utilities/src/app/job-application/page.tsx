'use client'
import { useState, useRef } from 'react'
import TooltipTour from '@/components/TooltipTour'
import { tourSteps } from '@/lib/tourSteps'

async function sha256hex(data: Uint8Array): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer)
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

export default function JobApplicationPage() {
  const [applicantName, setApplicantName] = useState('')
  const [applicantEmail, setApplicantEmail] = useState('')
  const [applicantPhone, setApplicantPhone] = useState('')
  const [roleName, setRoleName] = useState('')
  const [company, setCompany] = useState('')
  const [docs, setDocs] = useState<{ file: File; docType: string }[]>([])
  const [notes, setNotes] = useState('')
  const [result, setResult] = useState<{ url: string; name: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const addFiles = (files: FileList | null) => {
    if (!files) return
    setDocs(prev => [...prev, ...Array.from(files).map(f => ({ file: f, docType: guessType(f.name) }))])
  }
  const guessType = (name: string) => {
    const n = name.toLowerCase()
    if (n.includes('cv') || n.includes('resume')) return 'CV / Resume'
    if (n.includes('cover')) return 'Cover Letter'
    if (n.includes('cert') || n.includes('diploma') || n.includes('degree')) return 'Certificate'
    if (n.includes('ref')) return 'Reference Letter'
    return 'Supporting Document'
  }
  const updateDocType = (idx: number, docType: string) => setDocs(prev => prev.map((d, i) => i === idx ? { ...d, docType } : d))
  const removeDoc = (idx: number) => setDocs(prev => prev.filter((_, i) => i !== idx))

  const handleGenerate = async () => {
    if (!applicantName.trim()) { setError('Applicant name is required.'); return }
    if (!roleName.trim()) { setError('Role name is required.'); return }
    if (docs.length === 0) { setError('Upload at least one document (CV, cover letter, etc.).'); return }
    setError('')
    setLoading(true)
    try {
      const { default: JSZip } = await import('jszip')
      const zip = new JSZip()
      const now = new Date().toISOString()

      const docIndex: Array<{ filename: string; docType: string; sha256: string; size: number }> = []
      for (const d of docs) {
        const buf = new Uint8Array(await d.file.arrayBuffer())
        const hash = await sha256hex(buf)
        docIndex.push({ filename: d.file.name, docType: d.docType, sha256: hash, size: d.file.size })
        zip.file(d.file.name, buf)
      }

      const contentHash = await sha256hex(new TextEncoder().encode(`${applicantName}|${roleName}|${company}|${now}`))
      const manifestUds = {
        ud_version: '1.0', format: 'uds', id: `jobapp-${contentHash.slice(0, 16)}`, created: now, schema: 'job_application',
        metadata: { applicant_name: applicantName, email: applicantEmail || null, phone: applicantPhone || null, role: roleName, company: company || null, notes: notes || null },
        provenance: { content_sha256: contentHash, sealed_at: now, tool: 'UD Job Application' },
        document_index: docIndex,
        content: [
          { type: 'heading', text: `Job Application — ${applicantName}` },
          { type: 'paragraph', text: `Role: ${roleName} at ${company || 'Not specified'}` },
          { type: 'paragraph', text: `Contact: ${applicantEmail || 'N/A'} · ${applicantPhone || 'N/A'}` },
          { type: 'heading', level: 2, text: 'Documents Included' },
          ...docIndex.map(d => ({ type: 'paragraph', text: `${d.docType}: ${d.filename} (SHA-256: ${d.sha256.slice(0, 16)}…)` })),
        ],
      }
      zip.file('application-manifest.uds', JSON.stringify(manifestUds, null, 2))
      zip.file('bundle.json', JSON.stringify({ type: 'job_application_bundle', application_id: manifestUds.id, created: now, applicant: applicantName, role: roleName, company: company || null, documents: docIndex }, null, 2))

      const blob = await zip.generateAsync({ type: 'blob' })
      const safeName = applicantName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      setResult({ url: URL.createObjectURL(blob), name: `job-application-${safeName}.udz` })
    } catch {
      setError('Failed to generate application package.')
    } finally {
      setLoading(false)
    }
  }

  const inp = "w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:border-[#c8960a]"
  const lbl = "block text-xs font-medium text-[#1e2d3d] mb-1 uppercase tracking-wider font-['DM_Mono',monospace]"

  return (
    <div style={{ background: '#fafaf8', minHeight: '100vh', color: '#1e2d3d' }}>
      <TooltipTour engineId="job-application" tips={tourSteps['job-application'] ?? []} />
      <div style={{ background: '#c8960a', color: '#fff', textAlign: 'center', padding: '8px 16px', fontSize: 13, fontWeight: 600 }}>Beta · All features free during beta</div>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 32, fontWeight: 700, margin: 0 }}>UD Job Application</h1>
            <span style={{ background: '#0d9488', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4, fontFamily: "'DM Mono',monospace" }}>FREE · 3/MONTH</span>
          </div>
          <p style={{ color: '#4a5568', fontSize: 15, lineHeight: 1.6, margin: 0 }}>
            Create a governed job application package as a <code style={{ fontFamily: "'DM Mono',monospace" }}>.udz</code> file — CV, cover letter, certificates, and references all in one tamper-evident bundle. Employers verify qualifications without contacting institutions.
          </p>
        </div>

        <div data-tour="applicant-details" style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Applicant Details</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div><label className={lbl}>Full Name *</label><input className={inp} value={applicantName} onChange={e => setApplicantName(e.target.value)} /></div>
            <div><label className={lbl}>Email</label><input type="email" className={inp} value={applicantEmail} onChange={e => setApplicantEmail(e.target.value)} /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div><label className={lbl}>Phone</label><input className={inp} value={applicantPhone} onChange={e => setApplicantPhone(e.target.value)} /></div>
          </div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Role Applied For</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div><label className={lbl}>Role / Job Title *</label><input className={inp} value={roleName} onChange={e => setRoleName(e.target.value)} placeholder="e.g. Senior Engineer" /></div>
            <div><label className={lbl}>Company</label><input className={inp} value={company} onChange={e => setCompany(e.target.value)} placeholder="e.g. Acme Corp" /></div>
          </div>
        </div>

        <div data-tour="documents" style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700 }}>Documents *</div>
            <button onClick={() => fileRef.current?.click()} style={{ background: '#1e2d3d', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: 13, cursor: 'pointer' }}>+ Add Documents</button>
          </div>
          <input ref={fileRef} type="file" multiple style={{ display: 'none' }} onChange={e => addFiles(e.target.files)} />
          {docs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px', color: '#9ca3af', fontSize: 14 }}>Upload CV, cover letter, certificates, and references</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {docs.map((d, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fafaf8', borderRadius: 8, padding: '10px 14px' }}>
                  <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 12, flex: 1 }}>{d.file.name}</span>
                  <select value={d.docType} onChange={e => updateDocType(i, e.target.value)} style={{ fontSize: 12, border: '1px solid #e5e7eb', borderRadius: 4, padding: '2px 6px', background: '#fff' }}>
                    {['CV / Resume', 'Cover Letter', 'Certificate', 'Reference Letter', 'Supporting Document'].map(t => <option key={t}>{t}</option>)}
                  </select>
                  <button onClick={() => removeDoc(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: 18 }}>×</button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <label className={lbl}>Notes</label>
          <textarea className={inp} rows={2} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Application notes or covering context" style={{ resize: 'vertical' }} />
        </div>

        {error && <div style={{ color: '#dc2626', fontSize: 13, marginBottom: 16, padding: '10px 14px', background: '#fef2f2', borderRadius: 8 }}>{error}</div>}
        <button data-tour="bundle" onClick={handleGenerate} disabled={loading} style={{ width: '100%', padding: 14, borderRadius: 10, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', background: loading ? '#d1d5db' : '#1e2d3d', color: '#fff', fontSize: 15, fontWeight: 700 }}>
          {loading ? 'Creating package…' : 'Create Application Package'}
        </button>
        {result && (
          <div style={{ marginTop: 24, padding: 24, background: '#fff', border: '2px solid #c8960a', borderRadius: 12 }}>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Application Package Ready</div>
            <a href={result.url} download={result.name} style={{ display: 'inline-block', padding: '10px 24px', background: '#c8960a', color: '#fff', borderRadius: 8, fontWeight: 700, textDecoration: 'none', fontSize: 14 }}>Download {result.name}</a>
          </div>
        )}

        <div style={{ marginTop: 64 }}>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 700, marginBottom: 24 }}>How UD Job Application differs from emailing a PDF CV</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              { title: 'Tamper-evident credentials', body: 'Every document in the bundle is SHA-256 hashed. Employers can verify certificates and qualifications without calling institutions.' },
              { title: 'Single bundle', body: 'One .udz file contains CV, cover letter, certificates, and references with an indexed manifest. No scattered email attachments.' },
              { title: 'Application record', body: 'The manifest.uds proves the application was submitted at a specific time with specific documents — useful in disputes about application content.' },
              { title: 'Professional presentation', body: 'A structured .udz bundle signals technical competence and seriousness compared to a PDF email attachment.' },
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
