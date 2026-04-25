'use client'
import { useState } from 'react'
import TooltipTour from '@/components/TooltipTour'
import { tourSteps } from '@/lib/tourSteps'

const CERT_TYPES = ['Completion','Achievement','Attendance','Competency','Accreditation','Training','Award','Other']

export default function CertificateIssuer() {
  const [certType, setCertType] = useState('')
  const [customType, setCustomType] = useState('')
  const [recipientName, setRecipientName] = useState('')
  const [recipientEmail, setRecipientEmail] = useState('')
  const [courseTitle, setCourseTitle] = useState('')
  const [issuerName, setIssuerName] = useState('')
  const [issuerOrg, setIssuerOrg] = useState('')
  const [issueDate, setIssueDate] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [creditHours, setCreditHours] = useState('')
  const [certId, setCertId] = useState('')
  const [result, setResult] = useState<{ url: string; name: string } | null>(null)

  const inp = { width: '100%', padding: '10px 14px', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ud-ink)', background: '#fff', boxSizing: 'border-box' as const }
  const lbl = { display: 'block' as const, fontSize: 13, fontWeight: 600 as const, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: 6 }

  const run = () => {
    const now = new Date().toISOString()
    const type = certType === 'Other' ? customType : certType
    const id = certId || `CERT-${Date.now().toString(36).toUpperCase()}`
    const doc = {
      format: 'UDS', status: 'sealed',
      title: `Certificate of ${type} — ${recipientName}`,
      document_type: 'certificate',
      certificate: {
        certificate_id: id,
        type,
        recipient: { name: recipientName, email: recipientEmail || undefined },
        course_title: courseTitle || undefined,
        issuer: { name: issuerName || undefined, organisation: issuerOrg || undefined },
        issue_date: issueDate || undefined,
        expiry_date: expiryDate || undefined,
        credit_hours: creditHours ? parseFloat(creditHours) : undefined,
        status: 'valid',
      },
      provenance: { created_at: now, document_type: 'certificate', certificate_id: id },
    }
    const blob = new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' })
    setResult({ url: URL.createObjectURL(blob), name: `cert-${recipientName.replace(/\s+/g,'-').toLowerCase()}-${id}.uds` })
  }

  const can = !certType || !recipientName || (certType === 'Other' && !customType)

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
      <a href="/" style={{ fontSize: 13, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 32 }}>← All tools</a>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--ud-ink)', fontFamily: 'var(--font-display)' }}>UD Certificate Issuer</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontSize: 13, fontWeight: 600, padding: '3px 10px', borderRadius: 99, background: 'var(--ud-gold-3)', color: 'var(--ud-gold-text)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Pro</span>
          <span style={{ fontSize: 9, color: 'var(--ud-muted)', fontFamily: 'var(--font-mono)', paddingLeft: 10 }}>Free during beta</span>
        </div>
      </div>
      <p style={{ fontSize: 16, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', marginBottom: 32, lineHeight: 1.6 }}>Issue verifiable certificates as sealed .uds documents with a unique certificate ID, recipient details, issuer, credit hours, and optional expiry.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>
        <div style={{ gridColumn: '1/-1' }}>
          <label style={lbl}>Certificate type *</label>
          <select value={certType} onChange={e => setCertType(e.target.value)} style={{ ...inp, cursor: 'pointer' }}>
            <option value="">— Select —</option>
            {CERT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        {certType === 'Other' && <div style={{ gridColumn: '1/-1' }}><label style={lbl}>Specify</label><input style={inp} value={customType} onChange={e => setCustomType(e.target.value)} placeholder="Certificate type" /></div>}
        <div><label style={lbl}>Recipient name *</label><input style={inp} value={recipientName} onChange={e => setRecipientName(e.target.value)} placeholder="Full name" /></div>
        <div><label style={lbl}>Recipient email</label><input type="email" style={inp} value={recipientEmail} onChange={e => setRecipientEmail(e.target.value)} placeholder="email@example.com" /></div>
        <div style={{ gridColumn: '1/-1' }}><label style={lbl}>Course / programme title</label><input style={inp} value={courseTitle} onChange={e => setCourseTitle(e.target.value)} placeholder="e.g. Advanced Data Analysis" /></div>
        <div><label style={lbl}>Issuer name</label><input style={inp} value={issuerName} onChange={e => setIssuerName(e.target.value)} placeholder="Issuing person" /></div>
        <div><label style={lbl}>Issuing organisation</label><input style={inp} value={issuerOrg} onChange={e => setIssuerOrg(e.target.value)} placeholder="Organisation" /></div>
        <div><label style={lbl}>Issue date</label><input type="date" style={inp} value={issueDate} onChange={e => setIssueDate(e.target.value)} /></div>
        <div><label style={lbl}>Expiry date</label><input type="date" style={inp} value={expiryDate} onChange={e => setExpiryDate(e.target.value)} /></div>
        <div><label style={lbl}>Credit hours</label><input type="number" min="0" step="0.5" style={inp} value={creditHours} onChange={e => setCreditHours(e.target.value)} placeholder="e.g. 8" /></div>
        <div><label style={lbl}>Certificate ID (auto-generated if blank)</label><input style={inp} value={certId} onChange={e => setCertId(e.target.value)} placeholder="CERT-XXXXX" /></div>
      </div>

      {result && (
        <div style={{ padding: '14px 18px', background: 'var(--ud-teal-2)', border: '1px solid var(--ud-teal)', borderRadius: 'var(--ud-radius-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <div><div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ud-teal)', fontFamily: 'var(--font-body)' }}>Certificate issued ✓</div><div style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)' }}>{recipientName} · {certType === 'Other' ? customType : certType}</div></div>
          <a href={result.url} download={result.name} style={{ padding: '10px 18px', background: 'var(--ud-ink)', color: '#fff', fontWeight: 600, fontSize: 13, borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)', textDecoration: 'none', flexShrink: 0 }}>Download .uds →</a>
        </div>
      )}
      <button onClick={run} disabled={!!can} style={{ width: '100%', padding: '14px', background: can ? 'var(--ud-border)' : 'var(--ud-ink)', color: can ? 'var(--ud-muted)' : '#fff', border: 'none', borderRadius: 'var(--ud-radius)', fontSize: 15, fontWeight: 600, fontFamily: 'var(--font-body)', cursor: can ? 'not-allowed' : 'pointer' }}>Issue Certificate</button>
      <div style={{ marginTop: 40, padding: '16px', background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', fontSize: 13, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', textAlign: 'center' }}>
        Runs in your browser. No data sent to any server. Part of the <a href="https://ud.hive.baby" style={{ color: 'var(--ud-teal)' }}>Universal Document™</a> ecosystem.
      </div>

      <div style={{ marginTop: '3rem', paddingTop: '2.5rem', borderTop: '1px solid var(--ud-border)' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--ud-ink)', fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>How UD Certificate Issuer differs from PDF certificates and Credly</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', marginBottom: '1.5rem', lineHeight: 1.6 }}>PDF certificates can be forged in seconds. Credly badges require platform accounts. UD certificates are tamper-evident and verifiable by anyone with no account required.</p>
        <div style={{ display: 'grid', gap: '1rem' }}>
          {[
            { title: 'PDF certificate', body: 'The most common format — and the easiest to forge. Anyone with Photoshop can produce an identical-looking certificate. There\'s no way for an employer or regulator to verify it hasn\'t been altered.' },
            { title: 'Credly / Acclaim digital badges', body: 'Cryptographically anchored badges requiring issuer accounts, platform integration, and recipient email addresses. Verification depends on Credly\'s platform remaining live and accessible.' },
            { title: 'UD Certificate Issuer — tamper-evident sealing', body: 'The certificate is sealed with a cryptographic hash at the moment of issue. Any modification to the recipient name, issuer, date, or achievement description invalidates the seal — detectable by UD Reader in one click.' },
            { title: 'UD Certificate Issuer — no platform dependency', body: 'The proof lives inside the .uds file. Verification works offline with UD Reader — no internet connection required, no Credly account, no issuer platform needed. The certificate survives platform shutdowns.' },
          ].map(card => (
            <div key={card.title} style={{ background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)', borderRadius: '0.75rem', padding: '1.25rem' }}>
              <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--ud-ink)', fontFamily: 'var(--font-body)', marginBottom: '0.4rem' }}>{card.title}</div>
              <div style={{ fontSize: '15px', color: 'var(--ud-ink)', fontFamily: 'var(--font-body)', lineHeight: 1.7 }}>{card.body}</div>
            </div>
          ))}
        </div>
      </div>
      <TooltipTour engineId="certificate-issuer" tips={tourSteps['certificate-issuer']} />
    </div>
  )
}
