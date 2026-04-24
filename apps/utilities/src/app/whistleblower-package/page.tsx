'use client'
import { useState, useRef } from 'react'
import TooltipTour from '@/components/TooltipTour'
import { tourSteps } from '@/lib/tourSteps'

const INCIDENT_CATEGORIES = [
  'Financial fraud / accounting irregularities',
  'Bribery or corruption',
  'Health & safety violations',
  'Environmental violations',
  'Data protection / privacy breach',
  'Discrimination or harassment',
  'Regulatory non-compliance',
  'Securities / market abuse',
  'Tax evasion',
  'Modern slavery / labour violations',
  'Product safety / quality fraud',
  'Other',
]

const REGULATORS = [
  'SEC (US Securities)',
  'FCA (UK Financial Conduct Authority)',
  'HMRC (UK Tax)',
  'CMA (UK Competition)',
  'ICO (UK Data Protection)',
  'EPA (US Environment)',
  'OSHA (US Health & Safety)',
  'SFO (UK Serious Fraud Office)',
  'Internal compliance team',
  'Law enforcement',
  'Other',
]

async function sha256hex(data: Uint8Array): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer)
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

function makeRefNumber(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let ref = 'WB-'
  for (let i = 0; i < 12; i++) {
    if (i === 4 || i === 8) ref += '-'
    ref += chars[Math.floor(Math.random() * chars.length)]
  }
  return ref
}

export default function WhistleblowerPackagePage() {
  const [anonymous, setAnonymous] = useState(true)
  const [submitterName, setSubmitterName] = useState('')
  const [submitterContact, setSubmitterContact] = useState('')
  const [organisation, setOrganisation] = useState('')
  const [incidentDate, setIncidentDate] = useState('')
  const [category, setCategory] = useState('')
  const [regulator, setRegulator] = useState('')
  const [description, setDescription] = useState('')
  const [evidence, setEvidence] = useState<File[]>([])
  const [result, setResult] = useState<{ url: string; name: string; ref: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const addFiles = (files: FileList | null) => {
    if (!files) return
    setEvidence(prev => [...prev, ...Array.from(files)])
  }

  const removeFile = (index: number) => setEvidence(prev => prev.filter((_, i) => i !== index))

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    addFiles(e.dataTransfer.files)
  }

  const handleGenerate = async () => {
    if (!description.trim()) { setError('Incident description is required.'); return }
    if (!category) { setError('Please select an incident category.'); return }
    setError('')
    setLoading(true)

    try {
      const { default: JSZip } = await import('jszip')
      const zip = new JSZip()
      const refNumber = makeRefNumber()
      const now = new Date().toISOString()

      // Hash each evidence file
      const evidenceIndex: Array<{ filename: string; sha256: string; size: number; type: string }> = []
      for (const file of evidence) {
        const buf = new Uint8Array(await file.arrayBuffer())
        const hash = await sha256hex(buf)
        evidenceIndex.push({ filename: file.name, sha256: hash, size: file.size, type: file.type })
        const folder = zip.folder('evidence')
        folder?.file(file.name, buf)
      }

      // Hash the description
      const descBytes = new TextEncoder().encode(description)
      const descHash = await sha256hex(descBytes)

      // Disclosure .uds
      const disclosureUds = {
        ud_version: '1.0',
        format: 'uds',
        id: `wb-disclosure-${refNumber}`,
        created: now,
        schema: 'whistleblower_disclosure',
        anonymous_mode: anonymous,
        reference_number: refNumber,
        submitter: anonymous
          ? { name: '[ANONYMOUS]', contact: '[ANONYMOUS]' }
          : { name: submitterName || '[NOT PROVIDED]', contact: submitterContact || '[NOT PROVIDED]' },
        metadata: {
          organisation: organisation || '[NOT PROVIDED]',
          incident_date: incidentDate || '[NOT PROVIDED]',
          category,
          intended_regulator: regulator || '[NOT SPECIFIED]',
          ip_logged: false,
          anonymous_mode: anonymous,
        },
        provenance: {
          description_sha256: descHash,
          evidence_files: evidenceIndex.length,
          evidence_index: evidenceIndex,
          sealed_at: now,
          tool: 'UD Whistleblower Package',
          version: '1.0',
        },
        content: [
          {
            type: 'heading',
            text: `Whistleblower Disclosure — ${refNumber}`,
          },
          {
            type: 'paragraph',
            text: `Category: ${category}`,
          },
          {
            type: 'paragraph',
            text: `Incident date: ${incidentDate || 'Not specified'}`,
          },
          {
            type: 'paragraph',
            text: `Intended recipient: ${regulator || 'Not specified'}`,
          },
          {
            type: 'paragraph',
            text: `Organisation: ${organisation || 'Not specified'}`,
          },
          {
            type: 'heading',
            level: 2,
            text: 'Incident Description',
          },
          {
            type: 'paragraph',
            text: description,
          },
          {
            type: 'paragraph',
            text: `Description SHA-256: ${descHash}`,
          },
        ],
      }

      zip.file('disclosure.uds', JSON.stringify(disclosureUds, null, 2))

      // Bundle manifest
      const bundleJson = {
        ud_bundle_version: '1.0',
        bundle_type: 'whistleblower_package',
        bundle_id: `udz-wb-${refNumber}`,
        reference_number: refNumber,
        created: now,
        anonymous_mode: anonymous,
        ip_logged: false,
        contents: [
          { filename: 'disclosure.uds', type: 'whistleblower_disclosure' },
          ...evidenceIndex.map(e => ({ filename: `evidence/${e.filename}`, type: 'evidence', sha256: e.sha256 })),
        ],
        integrity: {
          description_sha256: descHash,
          evidence_count: evidenceIndex.length,
          sealed_at: now,
        },
        tool: 'UD Whistleblower Package',
        version: '1.0',
      }

      zip.file('bundle.json', JSON.stringify(bundleJson, null, 2))

      const blob = await zip.generateAsync({ type: 'blob' })
      const url = URL.createObjectURL(blob)
      const name = `whistleblower-${refNumber}.udz`
      setResult({ url, name, ref: refNumber })
    } catch (e) {
      setError('Failed to generate package. Please try again.')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:border-[#c8960a]"
  const labelClass = "block text-xs font-medium text-[#1e2d3d] mb-1 font-['DM_Mono',monospace] uppercase tracking-wider"

  return (
    <div style={{ background: '#fafaf8', minHeight: '100vh', color: '#1e2d3d' }}>
      <TooltipTour engineId="whistleblower-package" tips={tourSteps['whistleblower-package']} />

      {/* Beta banner */}
      <div style={{ background: '#c8960a', color: '#fff', textAlign: 'center', padding: '8px 16px', fontSize: 13, fontWeight: 600 }}>
        Beta · All features free during beta
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 700, color: '#1e2d3d', margin: 0 }}>
              UD Whistleblower Package
            </h1>
            <span style={{ background: '#1e2d3d', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4, fontFamily: "'DM Mono', monospace", letterSpacing: '0.05em' }}>
              ENTERPRISE
            </span>
            <span style={{ fontSize: 11, color: '#c8960a', fontWeight: 600, fontFamily: "'DM Mono', monospace" }}>Pro · Free during beta</span>
          </div>
          <p style={{ color: '#4a5568', fontSize: 15, lineHeight: 1.6, margin: 0 }}>
            Create a tamper-evident, SHA-256 sealed evidence package for whistleblower disclosures. Anonymous mode logs no IP address or identity. Submitter receives a <code style={{ fontFamily: "'DM Mono', monospace", fontSize: 13 }}>.udz</code> bundle with a unique reference number.
          </p>
        </div>

        {/* Legal notice */}
        <div style={{ background: '#fff3cd', border: '1px solid #ffc107', borderRadius: 8, padding: '14px 18px', marginBottom: 32 }}>
          <p style={{ margin: 0, fontSize: 13, color: '#856404', lineHeight: 1.5 }}>
            <strong>Important:</strong> This tool creates a sealed evidence package. It is not a substitute for legal advice. If you are making a protected disclosure, consider seeking independent legal counsel. This tool does not submit anything to any regulator on your behalf.
          </p>
        </div>

        {/* Anonymous toggle */}
        <div data-tour="anonymous-mode" style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, fontWeight: 700, color: '#1e2d3d', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                Anonymous Mode
              </div>
              <div style={{ fontSize: 13, color: '#4a5568' }}>
                {anonymous
                  ? 'Identity fields hidden. No IP logged. Reference number only.'
                  : 'Your name and contact will be included in the sealed package.'}
              </div>
            </div>
            <button
              onClick={() => setAnonymous(a => !a)}
              style={{
                width: 52, height: 28, borderRadius: 14, border: 'none', cursor: 'pointer',
                background: anonymous ? '#c8960a' : '#d1d5db',
                position: 'relative', transition: 'background 0.2s',
              }}
            >
              <span style={{
                position: 'absolute', top: 4, width: 20, height: 20, borderRadius: '50%', background: '#fff',
                transition: 'left 0.2s', left: anonymous ? 28 : 4,
              }} />
            </button>
          </div>
        </div>

        {/* Submitter info (only if not anonymous) */}
        {!anonymous && (
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, marginBottom: 24 }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Submitter Information</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label className={labelClass}>Your Name</label>
                <input className={inputClass} value={submitterName} onChange={e => setSubmitterName(e.target.value)} placeholder="Full name" />
              </div>
              <div>
                <label className={labelClass}>Contact (optional)</label>
                <input className={inputClass} value={submitterContact} onChange={e => setSubmitterContact(e.target.value)} placeholder="Email or phone" />
              </div>
            </div>
          </div>
        )}

        {/* Incident details */}
        <div data-tour="incident-details" style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Incident Details</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label className={labelClass}>Organisation / Company</label>
              <input className={inputClass} value={organisation} onChange={e => setOrganisation(e.target.value)} placeholder="e.g. Acme Corp plc" />
            </div>
            <div>
              <label className={labelClass}>Approximate Incident Date</label>
              <input type="date" className={inputClass} value={incidentDate} onChange={e => setIncidentDate(e.target.value)} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label className={labelClass}>Incident Category *</label>
              <select className={inputClass} value={category} onChange={e => setCategory(e.target.value)}>
                <option value="">Select category…</option>
                {INCIDENT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Intended Recipient / Regulator</label>
              <select className={inputClass} value={regulator} onChange={e => setRegulator(e.target.value)}>
                <option value="">Select…</option>
                {REGULATORS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className={labelClass}>Incident Description * <span style={{ color: '#c8960a' }}>(SHA-256 sealed)</span></label>
            <textarea
              className={inputClass}
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={6}
              placeholder="Describe the incident in as much detail as you can. Include dates, names, amounts, or any other relevant information. This description will be cryptographically sealed."
              style={{ resize: 'vertical' }}
            />
          </div>
        </div>

        {/* Evidence files */}
        <div data-tour="evidence-upload" style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Evidence Files</div>
          <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 16 }}>Optional. Documents, screenshots, emails, recordings. All files are SHA-256 hashed and bundled.</div>
          <div
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
            onClick={() => fileRef.current?.click()}
            style={{
              border: '2px dashed #d1d5db', borderRadius: 8, padding: '24px', textAlign: 'center',
              cursor: 'pointer', background: '#fafaf8', marginBottom: 12,
            }}
          >
            <div style={{ fontSize: 13, color: '#6b7280' }}>Drop evidence files here or <span style={{ color: '#c8960a', fontWeight: 600 }}>click to browse</span></div>
          </div>
          <input ref={fileRef} type="file" multiple style={{ display: 'none' }} onChange={e => addFiles(e.target.files)} />
          {evidence.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {evidence.map((f, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f9f9f7', borderRadius: 6, padding: '8px 12px', fontSize: 13 }}>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12 }}>{f.name}</span>
                  <button onClick={() => removeFile(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: 16, fontWeight: 700 }}>×</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && <div style={{ color: '#dc2626', fontSize: 13, marginBottom: 16, padding: '10px 14px', background: '#fef2f2', borderRadius: 8 }}>{error}</div>}

        <button
          data-tour="generate-package"
          onClick={handleGenerate}
          disabled={loading}
          style={{
            width: '100%', padding: '14px', borderRadius: 10, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
            background: loading ? '#d1d5db' : '#1e2d3d', color: '#fff', fontSize: 15, fontWeight: 700,
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {loading ? 'Sealing package…' : 'Generate Sealed Whistleblower Package'}
        </button>

        {result && (
          <div style={{ marginTop: 24, padding: 24, background: '#fff', border: '2px solid #c8960a', borderRadius: 12 }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, marginBottom: 8, color: '#1e2d3d' }}>
              Package Sealed
            </div>
            <div style={{ background: '#fafaf8', borderRadius: 8, padding: '12px 16px', marginBottom: 16, fontFamily: "'DM Mono', monospace", fontSize: 13 }}>
              <div>Reference: <strong style={{ color: '#c8960a' }}>{result.ref}</strong></div>
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>Keep this reference number. It links to your package.</div>
            </div>
            <a
              href={result.url}
              download={result.name}
              style={{
                display: 'inline-block', padding: '10px 24px', background: '#c8960a', color: '#fff',
                borderRadius: 8, fontWeight: 700, textDecoration: 'none', fontSize: 14,
              }}
            >
              Download {result.name}
            </a>
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 12 }}>
              Your package contains a tamper-evident <code style={{ fontFamily: "'DM Mono', monospace" }}>disclosure.uds</code> with SHA-256 sealed description{evidence.length > 0 ? ` and ${evidence.length} evidence file${evidence.length > 1 ? 's' : ''}` : ''}.
            </div>
          </div>
        )}

        {/* Comparison section */}
        <div style={{ marginTop: 64 }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, marginBottom: 24, color: '#1e2d3d' }}>
            How UD Whistleblower Package differs from email or generic form tools
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              { title: 'Cryptographic sealing', body: 'Every description and evidence file is SHA-256 hashed at the moment of submission. The hash is embedded in the sealed .udz — nobody can alter the content without the hash changing.' },
              { title: 'True anonymous mode', body: 'In anonymous mode no name, email, or identifying information is collected. The tool runs entirely in your browser. Nothing is sent to a server.' },
              { title: 'Unique reference number', body: 'Every package gets a unique WB reference number embedded in the bundle. You can reference it in follow-up communications without revealing your identity.' },
              { title: 'Open format', body: 'The .udz bundle is a ZIP file containing human-readable .uds JSON files. Any investigator or regulator can open and verify it without proprietary software.' },
            ].map(c => (
              <div key={c.title} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: 20 }}>
                <div style={{ fontWeight: 700, marginBottom: 8, fontFamily: "'DM Sans', sans-serif" }}>{c.title}</div>
                <div style={{ fontSize: 13, color: '#4a5568', lineHeight: 1.6 }}>{c.body}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}
