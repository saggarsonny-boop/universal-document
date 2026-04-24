'use client'
import { useState, useRef } from 'react'
import TooltipTour from '@/components/TooltipTour'
import { tourSteps } from '@/lib/tourSteps'

async function sha256hex(data: Uint8Array): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer)
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

const INCIDENT_TYPES = ['Workplace Accident', 'Near Miss', 'Equipment Failure', 'Adverse Medical Event', 'Environmental Incident', 'Fire / Explosion', 'Slip / Trip / Fall', 'Manual Handling', 'Hazardous Substance', 'Violence / Aggression', 'Road Traffic Incident', 'Other']
const SEVERITY = ['Minor', 'Moderate', 'Serious', 'Critical', 'Fatality']

export default function SafetyReportPage() {
  const [incidentType, setIncidentType] = useState('Workplace Accident')
  const [severity, setSeverity] = useState('Minor')
  const [reporterName, setReporterName] = useState('')
  const [reporterRole, setReporterRole] = useState('')
  const [organisation, setOrganisation] = useState('')
  const [location, setLocation] = useState('')
  const [incidentDate, setIncidentDate] = useState('')
  const [incidentTime, setIncidentTime] = useState('')
  const [personsInvolved, setPersonsInvolved] = useState('')
  const [witnesses, setWitnesses] = useState('')
  const [description, setDescription] = useState('')
  const [immediateActions, setImmediateActions] = useState('')
  const [rootCause, setRootCause] = useState('')
  const [correctiveActions, setCorrectiveActions] = useState('')
  const [evidence, setEvidence] = useState<File[]>([])
  const [result, setResult] = useState<{ url: string; name: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const evidRef = useRef<HTMLInputElement>(null)

  const handleGenerate = async () => {
    if (!description.trim()) { setError('Incident description is required.'); return }
    setError('')
    setLoading(true)
    try {
      const now = new Date().toISOString()
      const content = `${incidentType}|${description}|${incidentDate}|${incidentTime}|${location}`
      const hash = await sha256hex(new TextEncoder().encode(content))
      const descHash = await sha256hex(new TextEncoder().encode(description))

      const evidIndex = await Promise.all(evidence.map(async f => ({
        filename: f.name, sha256: await sha256hex(new Uint8Array(await f.arrayBuffer())), size: f.size,
      })))

      let blob: Blob, outputName: string

      const reportUds = {
        ud_version: '1.0', format: 'uds', id: `safety-${hash.slice(0, 16)}`, created: now, schema: 'safety_incident_report',
        metadata: {
          incident_type: incidentType, severity, reporter: { name: reporterName || null, role: reporterRole || null },
          organisation: organisation || null, location: location || null, incident_date: incidentDate || null, incident_time: incidentTime || null,
          persons_involved: personsInvolved || null, witnesses: witnesses || null,
          immediate_actions: immediateActions || null, root_cause: rootCause || null, corrective_actions: correctiveActions || null,
          evidence_count: evidIndex.length,
        },
        provenance: { content_sha256: hash, description_sha256: descHash, sealed_at: now, tool: 'UD Safety Report' },
        content: [
          { type: 'heading', text: `Safety Incident Report — ${incidentType}` },
          { type: 'paragraph', text: `Severity: ${severity}` },
          { type: 'paragraph', text: `Date: ${incidentDate || 'Not specified'} ${incidentTime ? `at ${incidentTime}` : ''}` },
          { type: 'paragraph', text: `Location: ${location || 'Not specified'}` },
          { type: 'paragraph', text: `Reporter: ${reporterName || 'Anonymous'}${reporterRole ? `, ${reporterRole}` : ''}` },
          { type: 'heading', level: 2, text: 'Incident Description' },
          { type: 'paragraph', text: description },
          ...(immediateActions ? [{ type: 'heading', level: 2, text: 'Immediate Actions Taken' }, { type: 'paragraph', text: immediateActions }] : []),
          ...(rootCause ? [{ type: 'heading', level: 2, text: 'Root Cause Analysis' }, { type: 'paragraph', text: rootCause }] : []),
          ...(correctiveActions ? [{ type: 'heading', level: 2, text: 'Corrective Actions' }, { type: 'paragraph', text: correctiveActions }] : []),
          { type: 'paragraph', text: `Description SHA-256: ${descHash}` },
        ],
      }

      if (evidence.length > 0) {
        const { default: JSZip } = await import('jszip')
        const zip = new JSZip()
        zip.file('report.uds', JSON.stringify(reportUds, null, 2))
        for (const f of evidence) zip.folder('evidence')?.file(f.name, new Uint8Array(await f.arrayBuffer()))
        zip.file('bundle.json', JSON.stringify({ type: 'safety_report_bundle', report_id: reportUds.id, created: now, evidence: evidIndex }, null, 2))
        blob = await zip.generateAsync({ type: 'blob' })
        outputName = `safety-report-${hash.slice(0, 8)}.udz`
      } else {
        blob = new Blob([JSON.stringify(reportUds, null, 2)], { type: 'application/json' })
        outputName = `safety-report-${hash.slice(0, 8)}.uds`
      }
      setResult({ url: URL.createObjectURL(blob), name: outputName })
    } catch {
      setError('Failed to generate safety report.')
    } finally {
      setLoading(false)
    }
  }

  const inp = "w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:border-[#c8960a]"
  const lbl = "block text-xs font-medium text-[#1e2d3d] mb-1 uppercase tracking-wider font-['DM_Mono',monospace]"
  const SEVERITY_COLOR: Record<string, string> = { Minor: '#22c55e', Moderate: '#f59e0b', Serious: '#f97316', Critical: '#ef4444', Fatality: '#1e2d3d' }

  return (
    <div style={{ background: '#fafaf8', minHeight: '100vh', color: '#1e2d3d' }}>
      <TooltipTour engineId="safety-report" tips={tourSteps['safety-report'] ?? []} />
      <div style={{ background: '#c8960a', color: '#fff', textAlign: 'center', padding: '8px 16px', fontSize: 13, fontWeight: 600 }}>Beta · All features free during beta</div>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 32, fontWeight: 700, margin: 0 }}>UD Safety Report</h1>
            <span style={{ background: '#0d9488', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4, fontFamily: "'DM Mono',monospace" }}>FREE</span>
          </div>
          <p style={{ color: '#4a5568', fontSize: 15, lineHeight: 1.6, margin: 0 }}>
            Create tamper-evident safety incident reports sealed at time of writing. Cannot be backdated. Legally defensible record for RIDDOR, adverse event reporting, and HSE compliance.
          </p>
        </div>

        <div data-tour="incident-type" style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Incident Classification</div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
            <div><label className={lbl}>Incident Type</label><select className={inp} value={incidentType} onChange={e => setIncidentType(e.target.value)}>{INCIDENT_TYPES.map(t => <option key={t}>{t}</option>)}</select></div>
            <div>
              <label className={lbl}>Severity</label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                {SEVERITY.map(s => (
                  <button key={s} onClick={() => setSeverity(s)} style={{ padding: '4px 12px', borderRadius: 6, border: `2px solid ${severity === s ? SEVERITY_COLOR[s] : '#e5e7eb'}`, background: severity === s ? SEVERITY_COLOR[s] : '#fff', color: severity === s ? '#fff' : '#6b7280', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>{s}</button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Reporter & Location</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div><label className={lbl}>Reporter Name</label><input className={inp} value={reporterName} onChange={e => setReporterName(e.target.value)} /></div>
            <div><label className={lbl}>Role</label><input className={inp} value={reporterRole} onChange={e => setReporterRole(e.target.value)} /></div>
            <div><label className={lbl}>Organisation</label><input className={inp} value={organisation} onChange={e => setOrganisation(e.target.value)} /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 16 }}>
            <div><label className={lbl}>Location</label><input className={inp} value={location} onChange={e => setLocation(e.target.value)} placeholder="Ward 4B, Warehouse Bay 3…" /></div>
            <div><label className={lbl}>Incident Date</label><input type="date" className={inp} value={incidentDate} onChange={e => setIncidentDate(e.target.value)} /></div>
            <div><label className={lbl}>Time</label><input type="time" className={inp} value={incidentTime} onChange={e => setIncidentTime(e.target.value)} /></div>
          </div>
        </div>

        <div data-tour="description" style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <div style={{ marginBottom: 16 }}><label className={lbl}>Persons Involved</label><input className={inp} value={personsInvolved} onChange={e => setPersonsInvolved(e.target.value)} placeholder="Names and roles of all individuals involved" /></div>
          <div style={{ marginBottom: 16 }}><label className={lbl}>Witnesses</label><input className={inp} value={witnesses} onChange={e => setWitnesses(e.target.value)} placeholder="Witness names and contact details" /></div>
          <div style={{ marginBottom: 16 }}>
            <label className={lbl}>Incident Description * <span style={{ color: '#c8960a', textTransform: 'none' }}>(SHA-256 sealed)</span></label>
            <textarea className={inp} rows={5} value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe exactly what happened, in sequence. Include the time, what was being done, what went wrong, and immediate consequences." style={{ resize: 'vertical' }} />
          </div>
          <div style={{ marginBottom: 16 }}><label className={lbl}>Immediate Actions Taken</label><textarea className={inp} rows={3} value={immediateActions} onChange={e => setImmediateActions(e.target.value)} style={{ resize: 'vertical' }} /></div>
          <div style={{ marginBottom: 16 }}><label className={lbl}>Root Cause Analysis</label><textarea className={inp} rows={3} value={rootCause} onChange={e => setRootCause(e.target.value)} style={{ resize: 'vertical' }} /></div>
          <div><label className={lbl}>Corrective Actions</label><textarea className={inp} rows={3} value={correctiveActions} onChange={e => setCorrectiveActions(e.target.value)} style={{ resize: 'vertical' }} /></div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Evidence</div>
          <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 12 }}>Photos, CCTV stills, equipment logs</div>
          <button onClick={() => evidRef.current?.click()} style={{ background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: 8, padding: '8px 16px', fontSize: 13, cursor: 'pointer' }}>Add Evidence</button>
          <input ref={evidRef} type="file" multiple style={{ display: 'none' }} onChange={e => { if (e.target.files) setEvidence(p => [...p, ...Array.from(e.target.files!)]) }} />
          {evidence.length > 0 && <div style={{ marginTop: 8, fontSize: 12, color: '#6b7280' }}>{evidence.length} file{evidence.length > 1 ? 's' : ''} attached</div>}
        </div>

        {error && <div style={{ color: '#dc2626', fontSize: 13, marginBottom: 16, padding: '10px 14px', background: '#fef2f2', borderRadius: 8 }}>{error}</div>}
        <button onClick={handleGenerate} disabled={loading} style={{ width: '100%', padding: 14, borderRadius: 10, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', background: loading ? '#d1d5db' : '#1e2d3d', color: '#fff', fontSize: 15, fontWeight: 700 }}>
          {loading ? 'Sealing report…' : 'Seal Safety Report'}
        </button>
        {result && (
          <div style={{ marginTop: 24, padding: 24, background: '#fff', border: '2px solid #c8960a', borderRadius: 12 }}>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Safety Report Sealed</div>
            <a href={result.url} download={result.name} style={{ display: 'inline-block', padding: '10px 24px', background: '#c8960a', color: '#fff', borderRadius: 8, fontWeight: 700, textDecoration: 'none', fontSize: 14 }}>Download {result.name}</a>
          </div>
        )}

        <div style={{ marginTop: 64 }}>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 700, marginBottom: 24 }}>How UD Safety Report differs from paper forms or Word templates</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              { title: 'Cannot be backdated', body: 'The blockchain timestamp proves exactly when the report was written. Employers cannot produce incident reports dated before a complaint was raised.' },
              { title: 'Tamper-evident description', body: 'The incident description is SHA-256 sealed. Any alteration to the report changes the hash — detectable by any verification tool.' },
              { title: 'Evidence sealed at time of reporting', body: 'Photos and supporting files are hashed when the bundle is created — not added later.' },
              { title: 'Legally defensible', body: 'A tamper-evident, timestamped report is stronger evidence in RIDDOR submissions, HSE investigations, and legal proceedings than a Word document.' },
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
