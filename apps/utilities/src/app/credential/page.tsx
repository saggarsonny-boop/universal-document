'use client'
import { useState } from 'react'

const CRED_TYPES = ['Medical Licence','Engineering Registration','Legal Practising Certificate','Teaching Qualification','Nursing Registration','Solicitor Admission','Accountancy Licence','Architect Registration','Pharmacy Registration','Pilot Licence','Other']

export default function Credential() {
  const [credType, setCredType] = useState('')
  const [customType, setCustomType] = useState('')
  const [holderName, setHolderName] = useState('')
  const [holderEmail, setHolderEmail] = useState('')
  const [issuingBody, setIssuingBody] = useState('')
  const [credNumber, setCredNumber] = useState('')
  const [issueDate, setIssueDate] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [jurisdiction, setJurisdiction] = useState('')
  const [conditions, setConditions] = useState('')
  const [result, setResult] = useState<{ url: string; name: string } | null>(null)

  const inp = { width: '100%', padding: '10px 14px', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ud-ink)', background: '#fff', boxSizing: 'border-box' as const }
  const lbl = { display: 'block' as const, fontSize: 11, fontWeight: 600 as const, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: 6 }

  const run = () => {
    const now = new Date().toISOString()
    const type = credType === 'Other' ? customType : credType
    const id = credNumber || `CRED-${Date.now().toString(36).toUpperCase()}`
    const doc = {
      format: 'UDS', status: 'sealed',
      title: `${type} — ${holderName}`,
      document_type: 'credential',
      credential: {
        credential_id: id,
        type,
        holder: { name: holderName, email: holderEmail || undefined },
        issuing_body: issuingBody || undefined,
        credential_number: credNumber || undefined,
        jurisdiction: jurisdiction || undefined,
        issue_date: issueDate || undefined,
        expiry_date: expiryDate || undefined,
        conditions: conditions || undefined,
        status: 'active',
      },
      expires_at: expiryDate ? new Date(expiryDate).toISOString() : undefined,
      provenance: { created_at: now, document_type: 'credential', credential_id: id },
    }
    const blob = new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' })
    setResult({ url: URL.createObjectURL(blob), name: `credential-${holderName.replace(/\s+/g,'-').toLowerCase()}-${id}.uds` })
  }

  const can = !credType || !holderName || (credType === 'Other' && !customType)

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
      <a href="/" style={{ fontSize: 13, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 32 }}>← All tools</a>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--ud-ink)', fontFamily: 'var(--font-display)' }}>UD Credential</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 99, background: 'var(--ud-gold-3)', color: 'var(--ud-gold)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Pro</span>
          <span style={{ fontSize: 9, color: 'var(--ud-muted)', fontFamily: 'var(--font-mono)', paddingLeft: 10 }}>Free during beta</span>
        </div>
      </div>
      <p style={{ fontSize: 16, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', marginBottom: 32, lineHeight: 1.6 }}>Issue a tamper-evident professional credential .uds with expiry, credential number, issuing body, and revocation capability. Supports medical, legal, engineering, and all regulated professions.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>
        <div style={{ gridColumn: '1/-1' }}>
          <label style={lbl}>Credential type *</label>
          <select value={credType} onChange={e => setCredType(e.target.value)} style={{ ...inp, cursor: 'pointer' }}>
            <option value="">— Select —</option>
            {CRED_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        {credType === 'Other' && <div style={{ gridColumn: '1/-1' }}><label style={lbl}>Specify credential type</label><input style={inp} value={customType} onChange={e => setCustomType(e.target.value)} placeholder="Credential type" /></div>}
        <div><label style={lbl}>Holder name *</label><input style={inp} value={holderName} onChange={e => setHolderName(e.target.value)} placeholder="Full name" /></div>
        <div><label style={lbl}>Holder email</label><input type="email" style={inp} value={holderEmail} onChange={e => setHolderEmail(e.target.value)} placeholder="email@example.com" /></div>
        <div style={{ gridColumn: '1/-1' }}><label style={lbl}>Issuing body</label><input style={inp} value={issuingBody} onChange={e => setIssuingBody(e.target.value)} placeholder="e.g. General Medical Council" /></div>
        <div><label style={lbl}>Credential / licence number</label><input style={inp} value={credNumber} onChange={e => setCredNumber(e.target.value)} placeholder="Auto-generated if blank" /></div>
        <div><label style={lbl}>Jurisdiction</label><input style={inp} value={jurisdiction} onChange={e => setJurisdiction(e.target.value)} placeholder="e.g. England & Wales" /></div>
        <div><label style={lbl}>Issue date</label><input type="date" style={inp} value={issueDate} onChange={e => setIssueDate(e.target.value)} /></div>
        <div><label style={lbl}>Expiry date</label><input type="date" style={inp} value={expiryDate} onChange={e => setExpiryDate(e.target.value)} /></div>
        <div style={{ gridColumn: '1/-1' }}><label style={lbl}>Conditions / restrictions</label><textarea value={conditions} onChange={e => setConditions(e.target.value)} rows={2} style={{ ...inp, resize: 'vertical' }} placeholder="Any conditions attached to this credential" /></div>
      </div>

      {result && (
        <div style={{ padding: '14px 18px', background: 'var(--ud-teal-2)', border: '1px solid var(--ud-teal)', borderRadius: 'var(--ud-radius-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <div><div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ud-teal)', fontFamily: 'var(--font-body)' }}>Credential issued ✓</div><div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)' }}>{holderName} · {credType === 'Other' ? customType : credType}{expiryDate ? ` · Expires ${expiryDate}` : ''}</div></div>
          <a href={result.url} download={result.name} style={{ padding: '10px 18px', background: 'var(--ud-ink)', color: '#fff', fontWeight: 600, fontSize: 13, borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)', textDecoration: 'none', flexShrink: 0 }}>Download .uds →</a>
        </div>
      )}
      <button onClick={run} disabled={!!can} style={{ width: '100%', padding: '14px', background: can ? 'var(--ud-border)' : 'var(--ud-ink)', color: can ? 'var(--ud-muted)' : '#fff', border: 'none', borderRadius: 'var(--ud-radius)', fontSize: 15, fontWeight: 600, fontFamily: 'var(--font-body)', cursor: can ? 'not-allowed' : 'pointer' }}>Issue Credential</button>
      <div style={{ marginTop: 40, padding: '16px', background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', fontSize: 12, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', textAlign: 'center' }}>
        Runs in your browser. No data sent to any server. Part of the <a href="https://ud.hive.baby" style={{ color: 'var(--ud-teal)' }}>Universal Document™</a> ecosystem.
      </div>

      <div style={{ marginTop: '3rem', paddingTop: '2.5rem', borderTop: '1px solid var(--ud-border)' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--ud-ink)', fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>How UD Credential differs from PDF certificates and Credly badges</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', marginBottom: '1.5rem', lineHeight: 1.6 }}>PDF credentials can be edited in any image tool. Credly badges require a live platform. UD Credential embeds proof inside the file itself — verifiable offline, forever.</p>
        <div style={{ display: 'grid', gap: '1rem' }}>
          {[
            { title: 'PDF diploma or certificate', body: 'Standard format — and the easiest to forge. No way for an employer to verify authenticity without calling the institution directly. No expiry tracking for time-limited licences or CPD requirements.' },
            { title: 'Credly / LinkedIn credential badge', body: 'Platform-dependent. Verification requires Credly\'s servers to be live and the issuer to maintain an active account. Revocation depends on the issuer remembering to revoke.' },
            { title: 'UD Credential — issuer seal inside the file', body: 'Issuer name, issue date, credential type, and holder details are sealed into the .uds with a tamper-evident hash. Any employer with UD Reader can verify authenticity in under 10 seconds.' },
            { title: 'UD Credential — expiry for time-limited qualifications', body: 'Professional licences, first aid certificates, and CPD requirements all expire. UD Credential carries expiry as structured metadata — UD Reader shows holders and employers the exact days remaining.' },
          ].map(card => (
            <div key={card.title} style={{ background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)', borderRadius: '0.75rem', padding: '1.25rem' }}>
              <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--ud-ink)', fontFamily: 'var(--font-body)', marginBottom: '0.4rem' }}>{card.title}</div>
              <div style={{ fontSize: '0.83rem', color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', lineHeight: 1.6 }}>{card.body}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
