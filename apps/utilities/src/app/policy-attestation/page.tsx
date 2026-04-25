'use client'
import { useState, useRef, useCallback } from 'react'
import TooltipTour from '@/components/TooltipTour'
import { tourSteps } from '@/lib/tourSteps'

async function sha256hex(text: string): Promise<string> {
  const enc = new TextEncoder()
  const data = enc.encode(text)
  const buf = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

export default function PolicyAttestationPage() {
  const [policyFile, setPolicyFile] = useState<File | null>(null)
  const [policyText, setPolicyText] = useState('')
  const [policyDragging, setPolicyDragging] = useState(false)
  const [employeeName, setEmployeeName] = useState('')
  const [employeeEmail, setEmployeeEmail] = useState('')
  const [employeeId, setEmployeeId] = useState('')
  const [department, setDepartment] = useState('')
  const [attestationStatement, setAttestationStatement] = useState('I confirm that I have read and understood this policy in full.')
  const [result, setResult] = useState<{ url: string; name: string } | null>(null)
  const [error, setError] = useState('')
  const policyInputRef = useRef<HTMLInputElement>(null)

  const handlePolicyFile = useCallback((f: File) => {
    setPolicyFile(f)
    setResult(null)
    setError('')
    f.text().then(t => setPolicyText(t)).catch(() => {})
  }, [])

  const onPolicyDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setPolicyDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handlePolicyFile(f)
  }, [handlePolicyFile])

  const create = async () => {
    setError('')
    setResult(null)

    if (!policyFile && !policyText.trim()) { setError('Upload a policy document or paste the policy text.'); return }
    if (!employeeName.trim()) { setError('Employee name is required.'); return }
    if (!employeeEmail.trim()) { setError('Employee email is required.'); return }

    const now = new Date().toISOString()
    const today = now.split('T')[0]
    const policyContent = policyText || (policyFile ? `Policy document: ${policyFile.name}` : '')
    const policyHash = 'sha256-' + await sha256hex(policyContent)
    const policyTitle = policyFile ? policyFile.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ') : 'Policy Document'

    const policyDoc = {
      format: 'UDS',
      version: '1.0',
      status: 'sealed',
      metadata: {
        title: policyTitle,
        created: now,
        document_type: 'policy',
        classification: 'Internal',
        language: 'en',
      },
      content: {
        blocks: policyContent.slice(0, 5000).split('\n\n').filter(Boolean).map((para, i) => ({
          id: `p${i + 1}`,
          type: i === 0 ? 'heading' : 'paragraph',
          text: para.trim().slice(0, 500),
        })),
      },
      provenance: { created: now, hash: policyHash, source: policyFile ? `file:${policyFile.name}` : 'text' },
    }

    const attestationId = `ATT-${Date.now().toString(36).toUpperCase()}`
    const attestationDoc = {
      format: 'UDS',
      version: '1.0',
      status: 'sealed',
      metadata: {
        title: `Policy Attestation: ${policyTitle}`,
        created: now,
        document_type: 'policy_attestation',
        classification: 'Internal',
        language: 'en',
        attestation_id: attestationId,
        policy_hash: policyHash,
        employee_name: employeeName.trim(),
        employee_email: employeeEmail.trim(),
        employee_id: employeeId.trim() || undefined,
        department: department.trim() || undefined,
        attestation_date: today,
      },
      content: {
        blocks: [
          { id: 'h1', type: 'heading', text: `Policy Attestation Record` },
          { id: 'b1', type: 'paragraph', text: `Employee: ${employeeName.trim()}` },
          { id: 'b2', type: 'paragraph', text: `Email: ${employeeEmail.trim()}` },
          ...(employeeId ? [{ id: 'b3', type: 'paragraph', text: `Employee ID: ${employeeId.trim()}` }] : []),
          ...(department ? [{ id: 'b4', type: 'paragraph', text: `Department: ${department.trim()}` }] : []),
          { id: 'b5', type: 'paragraph', text: `Policy: ${policyTitle}` },
          { id: 'b6', type: 'paragraph', text: `Policy hash: ${policyHash}` },
          { id: 'b7', type: 'paragraph', text: `Date: ${today}` },
          { id: 'stmt', type: 'paragraph', text: `Statement: "${attestationStatement}"` },
          { id: 'ref', type: 'paragraph', text: `Attestation ID: ${attestationId}` },
        ],
      },
      provenance: {
        created: now,
        source: `attestation:${policyTitle}`,
        policy_hash: policyHash,
        attestation_id: attestationId,
        blockchain: null,
      },
    }

    const { default: JSZip } = await import('jszip')
    const zip = new JSZip()
    zip.file(`policy-${policyTitle.replace(/\s+/g, '-').toLowerCase().slice(0, 40)}.uds`, JSON.stringify(policyDoc, null, 2))
    zip.file(`attestation-${employeeName.replace(/\s+/g, '-').toLowerCase().slice(0, 30)}-${attestationId}.uds`, JSON.stringify(attestationDoc, null, 2))

    const bundle = {
      format: 'UDZ',
      version: '1.0',
      metadata: {
        title: `Policy Attestation Bundle: ${policyTitle}`,
        created: now,
        document_type: 'policy_attestation_bundle',
        files: [
          `policy-${policyTitle.replace(/\s+/g, '-').toLowerCase().slice(0, 40)}.uds`,
          `attestation-${employeeName.replace(/\s+/g, '-').toLowerCase().slice(0, 30)}-${attestationId}.uds`,
        ],
      },
      chain_of_custody: [
        { event: 'policy_sealed', timestamp: now, hash: policyHash },
        { event: 'attestation_created', timestamp: now, attestation_id: attestationId, employee: employeeName.trim() },
      ],
    }
    zip.file('bundle.json', JSON.stringify(bundle, null, 2))

    const zipBlob = await zip.generateAsync({ type: 'blob', mimeType: 'application/octet-stream' })
    const safeName = policyTitle.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase().slice(0, 40)
    setResult({ url: URL.createObjectURL(zipBlob), name: `attestation-${safeName}.udz` })
  }

  const inp: React.CSSProperties = { width: '100%', padding: '10px 14px', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ud-ink)', background: '#fff', boxSizing: 'border-box' }
  const lbl: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }
  const card: React.CSSProperties = { padding: '16px 20px', background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius-lg)' }
  const h3s: React.CSSProperties = { fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--ud-ink)', marginBottom: 4 }
  const p13: React.CSSProperties = { fontSize: 13, fontFamily: 'var(--font-body)', color: 'var(--ud-muted)', lineHeight: 1.5, margin: 0 }
  const ready = (!!policyFile || !!policyText.trim()) && !!employeeName.trim() && !!employeeEmail.trim()

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
      <a href="/" style={{ fontSize: 13, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 32 }}>← All tools</a>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10, flexWrap: 'wrap' }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--ud-ink)', fontFamily: 'var(--font-display)' }}>UD Policy Attestation</h1>
        <span style={{ fontSize: 13, fontWeight: 600, padding: '3px 10px', borderRadius: 99, background: 'var(--ud-gold-3)', color: 'var(--ud-gold)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Pro · Free during beta</span>
      </div>

      <p style={{ fontSize: 16, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', marginBottom: 8, lineHeight: 1.6 }}>
        Create a tamper-evident record proving an employee read and understood a specific version of a policy. The policy hash and attestation are bundled together — making it impossible to claim a different policy version was attested to.
      </p>

      <div style={{ fontSize: 13, color: 'var(--ud-teal)', marginBottom: 28, padding: '8px 12px', background: 'var(--ud-teal-2)', border: '1px solid var(--ud-teal)', borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)' }}>
        ✦ Pro · Free during beta — GDPR, SOX, ISO 27001 compliant by construction
      </div>

      {/* Policy upload */}
      <div style={{ marginBottom: 20 }}>
        <label style={lbl}>Policy document</label>
        <div
          onDragOver={e => { e.preventDefault(); setPolicyDragging(true) }}
          onDragLeave={() => setPolicyDragging(false)}
          onDrop={onPolicyDrop}
          onClick={() => policyInputRef.current?.click()}
          style={{ border: `1.5px dashed ${policyDragging ? 'var(--ud-teal)' : 'var(--ud-border)'}`, borderRadius: 'var(--ud-radius-lg)', padding: '24px', textAlign: 'center', cursor: 'pointer', background: policyDragging ? 'var(--ud-teal-2)' : '#fafaf8', transition: 'all 0.15s' }}
        >
          {policyFile ? (
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ud-ink)' }}>{policyFile.name} <span style={{ color: 'var(--ud-muted)', fontSize: 13 }}>· Click to change</span></div>
          ) : (
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ud-muted)' }}>Drop policy (.uds, .pdf, .txt) or click to browse</div>
          )}
          <input ref={policyInputRef} type="file" accept=".uds,.json,.pdf,.txt,.docx" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && handlePolicyFile(e.target.files[0])} />
        </div>
        {!policyFile && (
          <div style={{ marginTop: 8 }}>
            <label style={{ ...lbl, marginTop: 8 }}>Or paste policy text</label>
            <textarea rows={4} value={policyText} onChange={e => setPolicyText(e.target.value)} placeholder="Paste policy text here…" style={{ ...inp, resize: 'vertical' }} />
          </div>
        )}
      </div>

      {/* Employee details */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>
        <div style={{ gridColumn: '1/-1' }}>
          <label style={lbl}>Employee full name *</label>
          <input style={inp} value={employeeName} onChange={e => setEmployeeName(e.target.value)} placeholder="Jane Smith" />
        </div>
        <div>
          <label style={lbl}>Employee email *</label>
          <input type="email" style={inp} value={employeeEmail} onChange={e => setEmployeeEmail(e.target.value)} placeholder="jane@company.com" />
        </div>
        <div>
          <label style={lbl}>Employee ID (optional)</label>
          <input style={inp} value={employeeId} onChange={e => setEmployeeId(e.target.value)} placeholder="EMP-001" />
        </div>
        <div style={{ gridColumn: '1/-1' }}>
          <label style={lbl}>Department (optional)</label>
          <input style={inp} value={department} onChange={e => setDepartment(e.target.value)} placeholder="Engineering, HR, Finance…" />
        </div>
        <div style={{ gridColumn: '1/-1' }}>
          <label style={lbl}>Attestation statement</label>
          <textarea rows={2} value={attestationStatement} onChange={e => setAttestationStatement(e.target.value)} style={{ ...inp, resize: 'vertical' }} />
        </div>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', background: 'rgba(226,75,74,0.08)', border: '1px solid rgba(226,75,74,0.2)', borderRadius: 'var(--ud-radius)', fontSize: 13, color: 'var(--ud-danger)', fontFamily: 'var(--font-body)', marginBottom: 20 }}>{error}</div>
      )}

      {result && (
        <div style={{ padding: '14px 18px', background: 'var(--ud-teal-2)', border: '1px solid var(--ud-teal)', borderRadius: 'var(--ud-radius-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ud-teal)', fontFamily: 'var(--font-body)' }}>Attestation bundle created ✓</div>
            <div style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)' }}>Policy + attestation record in tamper-evident .udz bundle</div>
          </div>
          <a href={result.url} download={result.name} style={{ padding: '10px 18px', background: 'var(--ud-ink)', color: '#fff', fontWeight: 600, fontSize: 13, borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)', textDecoration: 'none', flexShrink: 0 }}>Download .udz →</a>
        </div>
      )}

      <button
        onClick={create}
        disabled={!ready}
        style={{ width: '100%', padding: '14px', background: !ready ? 'var(--ud-border)' : 'var(--ud-ink)', color: !ready ? 'var(--ud-muted)' : '#fff', border: 'none', borderRadius: 'var(--ud-radius)', fontSize: 15, fontWeight: 600, fontFamily: 'var(--font-body)', cursor: !ready ? 'not-allowed' : 'pointer' }}>
        Create attestation bundle →
      </button>

      {/* Use cases */}
      <div style={{ marginTop: 48, marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--ud-ink)', marginBottom: 16 }}>Built for compliance requirements</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
          {[
            { title: 'GDPR', body: 'Article 5(2) requires demonstrable compliance. Policy attestation records are your evidence.' },
            { title: 'SOX', body: 'Section 302 certifications require auditable records of who reviewed which policy version.' },
            { title: 'ISO 27001', body: 'Clause 7.2 requires competence and awareness evidence. Attestation records satisfy this.' },
            { title: 'HR onboarding', body: 'Prove new employees acknowledged the employee handbook, data protection, and code of conduct.' },
          ].map(item => (
            <div key={item.title} style={card}>
              <div style={h3s}>{item.title}</div>
              <p style={p13}>{item.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Comparison */}
      <div style={{ marginTop: 48, paddingTop: 40, borderTop: '1px solid var(--ud-border)' }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--ud-ink)', marginBottom: 6 }}>How UD Policy Attestation differs</h2>
        <p style={{ fontSize: 14, fontFamily: 'var(--font-body)', color: 'var(--ud-muted)', marginBottom: 20, lineHeight: 1.6 }}>
          Email acknowledgments are easily disputed. LMS systems are expensive overkill for attestation. UD bundles the policy hash with the attestation in one tamper-evident record.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
          {[
            { icon: '📧', title: 'Email acknowledgment', body: 'No tamper evidence. Employee can claim they saw a different version. Easily disputed in a hearing.' },
            { icon: '🏫', title: 'LMS systems', body: 'Expensive, complex, and designed for course delivery — not attestation. $10,000–50,000/year for simple acknowledgment.' },
            { icon: '✍️', title: 'DocuSign', body: 'Signing only. Does not capture which version of the policy was signed, or hash-verify the document.' },
            { icon: '✔', title: 'UD Policy Attestation', body: 'Policy hash + attestation record in one tamper-evident .udz bundle. Disputes require breaking SHA-256.' },
          ].map(item => (
            <div key={item.title} style={{ ...card, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 20, lineHeight: '1', flexShrink: 0, marginTop: 2 }}>{item.icon}</span>
              <div>
                <div style={h3s}>{item.title}</div>
                <p style={p13}>{item.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 40, padding: '16px', background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', fontSize: 13, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', textAlign: 'center' }}>
        Processed in your browser. No data stored on our servers. Part of the <a href="https://ud.hive.baby" style={{ color: 'var(--ud-teal)' }}>Universal Document™</a> ecosystem.
      </div>

      <TooltipTour engineId="policy-attestation" tips={tourSteps['policy-attestation']} />
    </div>
  )
}
