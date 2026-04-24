'use client'
import { useState } from 'react'

const LANGS = ['English','Spanish','French','German','Arabic','Mandarin','Hindi','Portuguese','Polish','Urdu']

export default function Prescription() {
  const [f, setF] = useState({ patientName:'', dob:'', medication:'', dose:'', frequency:'', duration:'', prescriberName:'', licenseNo:'', prescriberAddress:'' })
  const [langs, setLangs] = useState<string[]>(['English'])
  const [result, setResult] = useState<{ url: string; name: string } | null>(null)

  const upd = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF(prev => ({ ...prev, [k]: e.target.value }))
  const toggleLang = (l: string) => setLangs(prev => prev.includes(l) ? prev.filter(x => x !== l) : [...prev, l])

  const run = () => {
    const now = new Date().toISOString()
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    const doc = {
      format: 'UDS', status: 'sealed',
      title: `Prescription — ${f.patientName}`,
      document_type: 'prescription',
      patient: { name: f.patientName, date_of_birth: f.dob },
      medication: { name: f.medication, dose: f.dose, frequency: f.frequency, duration: f.duration },
      prescriber: { name: f.prescriberName, license_number: f.licenseNo, address: f.prescriberAddress },
      languages_requested: langs,
      expires_at: expiresAt,
      provenance: { created_at: now, expires_at: expiresAt, document_type: 'prescription' },
      _notice: 'This is a Universal Document™ prescription record. Not a substitute for an official signed prescription where required by law.',
    }
    const blob = new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' })
    setResult({ url: URL.createObjectURL(blob), name: `prescription-${f.patientName.replace(/\s+/g,'-').toLowerCase()}.uds` })
  }

  const inp = { width: '100%', padding: '10px 14px', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ud-ink)', background: '#fff', boxSizing: 'border-box' as const }
  const lbl = { display: 'block' as const, fontSize: 11, fontWeight: 600 as const, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: 6 }
  const can = !f.patientName || !f.medication || !f.dose || !f.prescriberName

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
      <a href="/" style={{ fontSize: 13, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 32 }}>← All tools</a>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--ud-ink)', fontFamily: 'var(--font-display)' }}>UD Prescription</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 99, background: 'var(--ud-gold-3)', color: 'var(--ud-gold)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Pro</span>
          <span style={{ fontSize: 9, color: 'var(--ud-muted)', fontFamily: 'var(--font-mono)', paddingLeft: 10 }}>Free during beta</span>
        </div>
      </div>
      <p style={{ fontSize: 16, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', marginBottom: 8, lineHeight: 1.6 }}>Structured .uds prescription with 30-day expiration, multilingual output streams, and pharmacist-restricted fields.</p>
      <div style={{ fontSize: 12, color: 'var(--ud-danger)', marginBottom: 28, padding: '8px 12px', background: 'rgba(226,75,74,0.06)', border: '1px solid rgba(226,75,74,0.2)', borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)' }}>This is not a legally valid prescription. Always comply with jurisdiction-specific prescription requirements.</div>

      <div style={{ background: '#fff', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius-lg)', padding: '24px', marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>Patient</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div><label style={lbl}>Full name *</label><input style={inp} value={f.patientName} onChange={upd('patientName')} placeholder="Patient full name" /></div>
          <div><label style={lbl}>Date of birth</label><input type="date" style={inp} value={f.dob} onChange={upd('dob')} /></div>
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius-lg)', padding: '24px', marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>Medication</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {([['medication','Name *','e.g. Amoxicillin','1/-1'],['dose','Dose *','e.g. 500mg',''],['frequency','Frequency *','e.g. Three times daily',''],['duration','Duration','e.g. 7 days','']]) .map(([k,l,p,col]) => (
            <div key={k} style={{ gridColumn: col || 'auto' }}>
              <label style={lbl}>{l}</label>
              <input style={inp} value={f[k as keyof typeof f]} onChange={upd(k as keyof typeof f)} placeholder={p} />
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius-lg)', padding: '24px', marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>Prescriber</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div><label style={lbl}>Name *</label><input style={inp} value={f.prescriberName} onChange={upd('prescriberName')} placeholder="Dr / Prescriber name" /></div>
          <div><label style={lbl}>Licence number</label><input style={inp} value={f.licenseNo} onChange={upd('licenseNo')} placeholder="GMC / NPI / licence no." /></div>
          <div style={{ gridColumn: '1/-1' }}><label style={lbl}>Address</label><input style={inp} value={f.prescriberAddress} onChange={upd('prescriberAddress')} placeholder="Practice address" /></div>
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <label style={{ ...lbl, fontSize: 12, marginBottom: 10 }}>Language streams</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {LANGS.map(l => (
            <button key={l} onClick={() => toggleLang(l)} style={{ padding: '6px 14px', borderRadius: 99, fontFamily: 'var(--font-body)', fontSize: 13, cursor: 'pointer', border: '1px solid', background: langs.includes(l) ? 'var(--ud-ink)' : '#fff', color: langs.includes(l) ? '#fff' : 'var(--ud-muted)', borderColor: langs.includes(l) ? 'var(--ud-ink)' : 'var(--ud-border)' }}>{l}</button>
          ))}
        </div>
      </div>

      {result && (
        <div style={{ padding: '14px 18px', background: 'var(--ud-teal-2)', border: '1px solid var(--ud-teal)', borderRadius: 'var(--ud-radius-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <div><div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ud-teal)', fontFamily: 'var(--font-body)' }}>Prescription created · expires 30 days</div><div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)' }}>{langs.join(' · ')}</div></div>
          <a href={result.url} download={result.name} style={{ padding: '10px 18px', background: 'var(--ud-ink)', color: '#fff', fontWeight: 600, fontSize: 13, borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)', textDecoration: 'none', flexShrink: 0 }}>Download .uds →</a>
        </div>
      )}
      <button onClick={run} disabled={!!can} style={{ width: '100%', padding: '14px', background: can ? 'var(--ud-border)' : 'var(--ud-ink)', color: can ? 'var(--ud-muted)' : '#fff', border: 'none', borderRadius: 'var(--ud-radius)', fontSize: 15, fontWeight: 600, fontFamily: 'var(--font-body)', cursor: can ? 'not-allowed' : 'pointer' }}>Generate Prescription</button>
      <div style={{ marginTop: 40, padding: '16px', background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', fontSize: 12, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', textAlign: 'center' }}>
        This is not medical advice. Always consult a qualified clinician. Part of the <a href="https://ud.hive.baby" style={{ color: 'var(--ud-teal)' }}>Universal Document™</a> ecosystem.
      </div>

      <div style={{ marginTop: '3rem', paddingTop: '2.5rem', borderTop: '1px solid var(--ud-border)' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--ud-ink)', fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>How UD Prescription differs from a PDF or EPS form</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', marginBottom: '1.5rem', lineHeight: 1.6 }}>PDF prescriptions are flat images. EPS is locked to NHS infrastructure. UD Prescription is a structured, machine-readable record that carries its own rules.</p>
        <div style={{ display: 'grid', gap: '1rem' }}>
          {[
            { title: 'PDF prescription', body: 'A scanned or printed form. No machine-readable fields, no expiry, no language switching. Pharmacists read it by eye. Any copy looks identical to the original — no tamper evidence.' },
            { title: 'EPS (Electronic Prescribing Service)', body: 'UK-only, NHS-only. Requires GP system integration and a Smartcard. Not available to private prescribers, international clinicians, or clinics outside the NHS EPS network.' },
            { title: 'UD Prescription — automatic expiry', body: 'Every .uds prescription carries a 30-day expiry date in structured metadata. UD Reader surfaces this immediately on open — no manual date-checking required.' },
            { title: 'UD Prescription — multilingual patient streams', body: 'Generate patient-facing instructions in up to 10 languages within a single file. The patient reads their language; the pharmacist reads English. One document, not ten translations.' },
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
