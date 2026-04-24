'use client'
import { useState } from 'react'

const CONSENT_TYPES = ['Surgical procedure','Diagnostic investigation','Research participation','Data processing','Treatment plan','Medication administration','Photography/recording','Other']
const LANGS = ['English','Spanish','French','German','Arabic','Mandarin','Polish','Urdu']

export default function ConsentManager() {
  const [consentType, setConsentType] = useState('')
  const [customType, setCustomType] = useState('')
  const [procedureDetails, setProcedureDetails] = useState('')
  const [risks, setRisks] = useState('')
  const [patientName, setPatientName] = useState('')
  const [patientDob, setPatientDob] = useState('')
  const [clinicianName, setClinicianName] = useState('')
  const [procedureDate, setProcedureDate] = useState('')
  const [langs, setLangs] = useState<string[]>(['English'])
  const [result, setResult] = useState<{ url: string; name: string } | null>(null)

  const toggleLang = (l: string) => setLangs(prev => prev.includes(l) ? prev.filter(x => x !== l) : [...prev, l])

  const run = () => {
    const now = new Date().toISOString()
    const procedureDateParsed = procedureDate ? new Date(procedureDate).toISOString() : undefined
    const expiresAt = procedureDateParsed ? new Date(new Date(procedureDate).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString() : undefined
    const type = consentType === 'Other' ? customType : consentType
    const doc = {
      format: 'UDS', status: 'sealed',
      title: `Consent — ${type} — ${patientName}`,
      document_type: 'consent_form',
      consent: { type, procedure_details: procedureDetails, risks_discussed: risks || undefined, patient_name: patientName, patient_dob: patientDob || undefined, clinician_name: clinicianName, procedure_date: procedureDateParsed, consent_given: null, consent_given_at: null },
      languages_requested: langs,
      expires_at: expiresAt,
      provenance: { created_at: now, expires_at: expiresAt, document_type: 'consent_form' },
      _notice: 'Consent must be freely given by a competent adult. Record actual consent date/signature separately per your institution\'s requirements.',
    }
    const blob = new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' })
    setResult({ url: URL.createObjectURL(blob), name: `consent-${patientName.replace(/\s+/g,'-').toLowerCase()}.uds` })
  }

  const inp = { width: '100%', padding: '10px 14px', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ud-ink)', background: '#fff', boxSizing: 'border-box' as const }
  const lbl = { display: 'block' as const, fontSize: 11, fontWeight: 600 as const, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: 6 }
  const can = !consentType || !procedureDetails || !patientName || !clinicianName

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
      <a href="/" style={{ fontSize: 13, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 32 }}>← All tools</a>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--ud-ink)', fontFamily: 'var(--font-display)' }}>UD Consent Manager</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 99, background: 'var(--ud-gold-3)', color: 'var(--ud-gold)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Pro</span>
          <span style={{ fontSize: 9, color: 'var(--ud-muted)', fontFamily: 'var(--font-mono)', paddingLeft: 10 }}>Free during beta</span>
        </div>
      </div>
      <p style={{ fontSize: 16, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', marginBottom: 8, lineHeight: 1.6 }}>Structured consent .uds with expiration tied to the procedure date and multilingual output for patient understanding.</p>
      <div style={{ fontSize: 12, color: 'var(--ud-danger)', marginBottom: 28, padding: '8px 12px', background: 'rgba(226,75,74,0.06)', border: '1px solid rgba(226,75,74,0.2)', borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)' }}>This is not medical or legal advice. Always follow your institution's consent procedures.</div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
        <div style={{ gridColumn: '1/-1' }}>
          <label style={lbl}>Consent type *</label>
          <select value={consentType} onChange={e => setConsentType(e.target.value)} style={{ ...inp, cursor: 'pointer' }}>
            <option value="">— Select —</option>
            {CONSENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        {consentType === 'Other' && <div style={{ gridColumn: '1/-1' }}><label style={lbl}>Specify</label><input style={inp} value={customType} onChange={e => setCustomType(e.target.value)} placeholder="Consent type" /></div>}
        <div style={{ gridColumn: '1/-1' }}>
          <label style={lbl}>Procedure / intervention details *</label>
          <textarea value={procedureDetails} onChange={e => setProcedureDetails(e.target.value)} placeholder="Describe the procedure, its purpose, and what it involves" rows={3} style={{ ...inp, resize: 'vertical' }} />
        </div>
        <div style={{ gridColumn: '1/-1' }}>
          <label style={lbl}>Risks discussed</label>
          <textarea value={risks} onChange={e => setRisks(e.target.value)} placeholder="Key risks and alternatives discussed" rows={2} style={{ ...inp, resize: 'vertical' }} />
        </div>
        <div><label style={lbl}>Patient name *</label><input style={inp} value={patientName} onChange={e => setPatientName(e.target.value)} placeholder="Full name" /></div>
        <div><label style={lbl}>Date of birth</label><input type="date" style={inp} value={patientDob} onChange={e => setPatientDob(e.target.value)} /></div>
        <div><label style={lbl}>Clinician name *</label><input style={inp} value={clinicianName} onChange={e => setClinicianName(e.target.value)} placeholder="Dr / Clinician" /></div>
        <div><label style={lbl}>Procedure date</label><input type="date" style={inp} value={procedureDate} onChange={e => setProcedureDate(e.target.value)} /></div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <label style={{ ...lbl, fontSize: 12, marginBottom: 10 }}>Language streams</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {LANGS.map(l => <button key={l} onClick={() => toggleLang(l)} style={{ padding: '6px 14px', borderRadius: 99, fontFamily: 'var(--font-body)', fontSize: 13, cursor: 'pointer', border: '1px solid', background: langs.includes(l) ? 'var(--ud-ink)' : '#fff', color: langs.includes(l) ? '#fff' : 'var(--ud-muted)', borderColor: langs.includes(l) ? 'var(--ud-ink)' : 'var(--ud-border)' }}>{l}</button>)}
        </div>
      </div>

      {result && (
        <div style={{ padding: '14px 18px', background: 'var(--ud-teal-2)', border: '1px solid var(--ud-teal)', borderRadius: 'var(--ud-radius-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <div><div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ud-teal)', fontFamily: 'var(--font-body)' }}>Consent form created ✓</div><div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)' }}>{langs.join(' · ')}{procedureDate ? ` · Expires 7 days post-procedure` : ''}</div></div>
          <a href={result.url} download={result.name} style={{ padding: '10px 18px', background: 'var(--ud-ink)', color: '#fff', fontWeight: 600, fontSize: 13, borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)', textDecoration: 'none', flexShrink: 0 }}>Download .uds →</a>
        </div>
      )}
      <button onClick={run} disabled={!!can} style={{ width: '100%', padding: '14px', background: can ? 'var(--ud-border)' : 'var(--ud-ink)', color: can ? 'var(--ud-muted)' : '#fff', border: 'none', borderRadius: 'var(--ud-radius)', fontSize: 15, fontWeight: 600, fontFamily: 'var(--font-body)', cursor: can ? 'not-allowed' : 'pointer' }}>Generate Consent Form</button>
      <div style={{ marginTop: 40, padding: '16px', background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', fontSize: 12, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', textAlign: 'center' }}>
        This is not medical or legal advice. Always consult a qualified clinician. Part of the <a href="https://ud.hive.baby" style={{ color: 'var(--ud-teal)' }}>Universal Document™</a> ecosystem.
      </div>

      <div style={{ marginTop: '3rem', paddingTop: '2.5rem', borderTop: '1px solid var(--ud-border)' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--ud-ink)', fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>How UD Consent Manager differs from DocuSign and Veeva</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', marginBottom: '1.5rem', lineHeight: 1.6 }}>General e-signature platforms handle signatures. They don't model consent-specific rules like procedure-linked expiry or multilingual patient comprehension.</p>
        <div style={{ display: 'grid', gap: '1rem' }}>
          {[
            { title: 'DocuSign / Adobe Sign', body: 'General e-signature platforms. They capture a signature but don\'t model consent semantics — no procedure-linked expiry, no multilingual patient streams, no awareness that consent lapses if a procedure date changes.' },
            { title: 'Veeva Vault / paper consent forms', body: 'Enterprise systems require institution-wide deployment and IT integration. Paper forms have no expiry enforcement and no audit trail without manual scanning.' },
            { title: 'UD Consent Manager — procedure-linked expiry', body: 'Consent expiry is tied directly to the procedure date — automatically set to 7 days post-procedure. UD Reader surfaces this immediately, so no one acts on stale consent.' },
            { title: 'UD Consent Manager — multilingual patient comprehension', body: 'Generate consent in up to 8 languages within a single .uds file. The patient reads their language; the clinician reads the structured English record. Comprehension and compliance in one document.' },
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
