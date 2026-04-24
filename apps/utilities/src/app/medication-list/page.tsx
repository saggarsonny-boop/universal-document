'use client'
import { useState } from 'react'
import TooltipTour from '@/components/TooltipTour'
import { tourSteps } from '@/lib/tourSteps'

interface Med { name: string; dose: string; frequency: string; prescriber: string; startDate: string; expiryDays: string }
const BLANK: Med = { name: '', dose: '', frequency: '', prescriber: '', startDate: '', expiryDays: '' }

export default function MedicationList() {
  const [patientName, setPatientName] = useState('')
  const [patientDob, setPatientDob] = useState('')
  const [meds, setMeds] = useState<Med[]>([{ ...BLANK }])
  const [result, setResult] = useState<{ url: string; name: string } | null>(null)

  const addMed = () => setMeds(prev => [...prev, { ...BLANK }])
  const removeMed = (i: number) => setMeds(prev => prev.filter((_, j) => j !== i))
  const updMed = (i: number, k: keyof Med) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setMeds(prev => prev.map((m, j) => j === i ? { ...m, [k]: e.target.value } : m))

  const run = () => {
    const now = new Date().toISOString()
    const medications = meds.filter(m => m.name).map(m => {
      const expiresAt = m.startDate && m.expiryDays
        ? new Date(new Date(m.startDate).getTime() + parseInt(m.expiryDays) * 24 * 60 * 60 * 1000).toISOString()
        : undefined
      return { name: m.name, dose: m.dose, frequency: m.frequency, prescriber: m.prescriber || undefined, start_date: m.startDate || undefined, expires_at: expiresAt }
    })
    const doc = {
      format: 'UDS', status: 'sealed',
      title: `Medication List — ${patientName}`,
      document_type: 'medication_list',
      patient: { name: patientName, date_of_birth: patientDob || undefined },
      medications,
      provenance: { created_at: now, document_type: 'medication_list' },
      _notice: 'This is not medical advice. Always consult a qualified clinician before starting, stopping, or changing any medication.',
    }
    const blob = new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' })
    setResult({ url: URL.createObjectURL(blob), name: `medications-${patientName.replace(/\s+/g,'-').toLowerCase()}.uds` })
  }

  const inp = { width: '100%', padding: '9px 12px', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ud-ink)', background: '#fff', boxSizing: 'border-box' as const }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
      <a href="/" style={{ fontSize: 13, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 32 }}>← All tools</a>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--ud-ink)', fontFamily: 'var(--font-display)' }}>UD Medication List</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontSize: 13, fontWeight: 600, padding: '3px 10px', borderRadius: 99, background: 'var(--ud-gold-3)', color: 'var(--ud-gold-text)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Pro</span>
          <span style={{ fontSize: 9, color: 'var(--ud-muted)', fontFamily: 'var(--font-mono)', paddingLeft: 10 }}>Free during beta</span>
        </div>
      </div>
      <p style={{ fontSize: 16, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', marginBottom: 8, lineHeight: 1.6 }}>Build a structured .uds medication list with per-medication expiry. Each entry carries dose, frequency, prescriber, and duration.</p>
      <div style={{ fontSize: 13, color: 'var(--ud-danger)', marginBottom: 28, padding: '8px 12px', background: 'rgba(226,75,74,0.06)', border: '1px solid rgba(226,75,74,0.2)', borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)' }}>This is not medical advice. Always consult a qualified clinician.</div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>
        <div><label style={{ display: 'block', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Patient name *</label><input style={{ ...inp, padding: '10px 14px', fontSize: 14 }} value={patientName} onChange={e => setPatientName(e.target.value)} placeholder="Full name" /></div>
        <div><label style={{ display: 'block', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Date of birth</label><input type="date" style={{ ...inp, padding: '10px 14px', fontSize: 14 }} value={patientDob} onChange={e => setPatientDob(e.target.value)} /></div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Medications</div>
          <button onClick={addMed} style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--ud-teal)', background: 'none', border: '1px solid var(--ud-teal)', borderRadius: 'var(--ud-radius)', padding: '4px 10px', cursor: 'pointer' }}>+ Add medication</button>
        </div>
        {meds.map((m, i) => (
          <div key={i} style={{ background: '#fff', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius-lg)', padding: '16px', marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)', fontWeight: 600 }}>#{i + 1}</div>
              {meds.length > 1 && <button onClick={() => removeMed(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ud-muted)', fontSize: 16 }}>×</button>}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              {([['name','Medication *','e.g. Metformin'],['dose','Dose','e.g. 500mg'],['frequency','Frequency','e.g. Twice daily'],['prescriber','Prescriber','Dr name'],['startDate','Start date',''],['expiryDays','Duration (days)','e.g. 90']]).map(([k,l,p]) => (
                <div key={k}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{l}</label>
                  <input type={k === 'startDate' ? 'date' : 'text'} style={inp} value={m[k as keyof Med]} onChange={updMed(i, k as keyof Med)} placeholder={p} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {result && (
        <div style={{ padding: '14px 18px', background: 'var(--ud-teal-2)', border: '1px solid var(--ud-teal)', borderRadius: 'var(--ud-radius-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <div><div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ud-teal)', fontFamily: 'var(--font-body)' }}>Medication list created ✓</div><div style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)' }}>{meds.filter(m => m.name).length} medication{meds.filter(m => m.name).length !== 1 ? 's' : ''}</div></div>
          <a href={result.url} download={result.name} style={{ padding: '10px 18px', background: 'var(--ud-ink)', color: '#fff', fontWeight: 600, fontSize: 13, borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)', textDecoration: 'none', flexShrink: 0 }}>Download .uds →</a>
        </div>
      )}
      <button onClick={run} disabled={!patientName || !meds.some(m => m.name)} style={{ width: '100%', padding: '14px', background: !patientName || !meds.some(m => m.name) ? 'var(--ud-border)' : 'var(--ud-ink)', color: !patientName || !meds.some(m => m.name) ? 'var(--ud-muted)' : '#fff', border: 'none', borderRadius: 'var(--ud-radius)', fontSize: 15, fontWeight: 600, fontFamily: 'var(--font-body)', cursor: !patientName || !meds.some(m => m.name) ? 'not-allowed' : 'pointer' }}>Generate Medication List</button>
      <div style={{ marginTop: 40, padding: '16px', background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', fontSize: 13, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', textAlign: 'center' }}>
        This is not medical advice. Part of the <a href="https://ud.hive.baby" style={{ color: 'var(--ud-teal)' }}>Universal Document™</a> ecosystem.
      </div>

      <div style={{ marginTop: '3rem', paddingTop: '2.5rem', borderTop: '1px solid var(--ud-border)' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--ud-ink)', fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>How UD Medication List differs from an EHR module or PDF printout</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', marginBottom: '1.5rem', lineHeight: 1.6 }}>EHR medication lists are locked inside hospital systems. PDF printouts go stale the moment they leave the printer. UD Medication List travels with the patient and carries its own rules.</p>
        <div style={{ display: 'grid', gap: '1rem' }}>
          {[
            { title: 'EHR medication module (Epic, EMIS, SystmOne)', body: 'Accurate within one system. The moment a patient moves between practices, hospitals, or countries, the medication record doesn\'t follow. Reconciliation happens by fax or phone.' },
            { title: 'PDF medication printout', body: 'A flat snapshot. No machine-readable fields, no expiry dates on individual drugs, no structured dose or frequency data. Outdated the moment it leaves the printer.' },
            { title: 'UD Medication List — per-drug expiry', body: 'Each medication entry carries its own start date and duration in structured metadata. UD Reader surfaces drugs approaching expiry before anyone acts on an outdated record.' },
            { title: 'UD Medication List — shareable across care settings', body: 'A .uds file is a self-contained record. A GP, hospital, pharmacist, or carer in any country can open it in UD Reader — no system access, no login, no integration required.' },
          ].map(card => (
            <div key={card.title} style={{ background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)', borderRadius: '0.75rem', padding: '1.25rem' }}>
              <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--ud-ink)', fontFamily: 'var(--font-body)', marginBottom: '0.4rem' }}>{card.title}</div>
              <div style={{ fontSize: '15px', color: 'var(--ud-ink)', fontFamily: 'var(--font-body)', lineHeight: 1.7 }}>{card.body}</div>
            </div>
          ))}
        </div>
      </div>
      <TooltipTour engineId="medication-list" tips={tourSteps['medication-list']} />
    </div>
  )
}
