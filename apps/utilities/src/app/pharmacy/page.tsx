'use client'
import { useState } from 'react'
import TooltipTour from '@/components/TooltipTour'

const DEMO = {
  patientName: 'Maria Garcia',
  dob: '1985-03-12',
  medication: 'Amoxicillin 500mg capsules',
  dose: '500mg',
  frequency: 'Three times daily (every 8 hours)',
  duration: '7 days',
  prescriberName: 'Dr J. Patel',
  licenseNo: 'GMC 7654321',
  prescriberOrg: 'Riverdale Medical Centre',
}

const TOUR = [
  { label: 'Patient details', text: 'Enter the patient\'s name and date of birth. DOB is optional but recommended for identification.' },
  { label: 'Medication', text: 'Enter the full medication name including formulation (e.g. Amoxicillin 500mg capsules). Claude will use this to generate appropriate instructions.' },
  { label: 'Prescriber', text: 'Prescriber name and licence number are embedded in the sealed document for pharmacist verification.' },
  { label: 'Generate', text: 'Claude generates dispensing and patient instructions. The output is a tamper-evident .uds file sealed at the moment of generation.' },
  { label: 'Output', text: 'The .uds file has a 30-day expiry, revocation URL, and a SHA-256 hash of all block content.' },
  { label: 'Beta access', text: 'All Pro features are free during beta. No account required.' },
]

const inp: React.CSSProperties = {
  width: '100%', padding: '10px 14px',
  border: '1px solid var(--ud-border)',
  borderRadius: 'var(--ud-radius)',
  fontFamily: 'var(--font-body)', fontSize: 14,
  color: 'var(--ud-ink)', background: '#fff',
  boxSizing: 'border-box',
}
const lbl: React.CSSProperties = {
  display: 'block', fontSize: 13, fontWeight: 600,
  fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)',
  textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6,
}

export default function PharmacyPage() {
  const [f, setF] = useState({
    patientName: '', dob: '',
    medication: '', dose: '', frequency: '', duration: '',
    prescriberName: '', licenseNo: '', prescriberOrg: '',
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ url: string; name: string } | null>(null)
  const [error, setError] = useState('')

  const upd = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setF(prev => ({ ...prev, [k]: e.target.value }))

  const loadDemo = () => setF(DEMO)

  const generate = async () => {
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await fetch('/api/pharmacy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(f),
      })
      if (!res.ok) {
        const e = await res.json()
        throw new Error(e.error || 'Generation failed')
      }
      const blob = await res.blob()
      const cd = res.headers.get('content-disposition') || ''
      const match = cd.match(/filename="?([^"]+)"?/)
      const name = match?.[1] || `prescription-${f.patientName.replace(/\s+/g, '-').toLowerCase()}.uds`
      setResult({ url: URL.createObjectURL(blob), name })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Generation failed')
    } finally {
      setLoading(false)
    }
  }

  const can = !f.patientName || !f.medication || !f.dose || !f.frequency || !f.prescriberName

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
      <a href="/" style={{ fontSize: 13, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 32 }}>
        ← All tools
      </a>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10, flexWrap: 'wrap' }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--ud-ink)', fontFamily: 'var(--font-display)' }}>
          UD Pharmacy
        </h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontSize: 13, fontWeight: 600, padding: '3px 10px', borderRadius: 99, background: 'var(--ud-gold-3)', color: 'var(--ud-gold-text)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Pro</span>
          <span style={{ fontSize: 9, color: 'var(--ud-muted)', fontFamily: 'var(--font-mono)', paddingLeft: 10 }}>Free during beta</span>
        </div>
        <TooltipTour engineId="pharmacy" tips={TOUR} />
      </div>

      <p style={{ fontSize: 16, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', marginBottom: 8, lineHeight: 1.6 }}>
        AI-assisted prescription generator. Produces a tamper-evident .uds with dispensing instructions, patient guidance, and a 30-day expiry seal.
      </p>

      <div style={{ fontSize: 13, color: 'var(--ud-danger)', marginBottom: 24, padding: '8px 12px', background: 'rgba(226,75,74,0.06)', border: '1px solid rgba(226,75,74,0.2)', borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)' }}>
        This is not a legally valid prescription. Always comply with your jurisdiction's prescription requirements and sign physical prescriptions as required.
      </div>

      <button
        onClick={loadDemo}
        style={{ fontSize: 12, color: 'var(--ud-teal)', fontFamily: 'var(--font-mono)', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 24, padding: 0, textDecoration: 'underline' }}
      >
        Load example
      </button>

      {/* Patient */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--ud-gold)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Patient</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div>
            <label style={lbl}>Name *</label>
            <input style={inp} value={f.patientName} onChange={upd('patientName')} placeholder="Full name" />
          </div>
          <div>
            <label style={lbl}>Date of birth</label>
            <input type="date" style={inp} value={f.dob} onChange={upd('dob')} />
          </div>
        </div>
      </div>

      {/* Medication */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--ud-gold)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Medication</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div style={{ gridColumn: '1/-1' }}>
            <label style={lbl}>Medication name & formulation *</label>
            <input style={inp} value={f.medication} onChange={upd('medication')} placeholder="e.g. Amoxicillin 500mg capsules" />
          </div>
          <div>
            <label style={lbl}>Dose *</label>
            <input style={inp} value={f.dose} onChange={upd('dose')} placeholder="e.g. 500mg" />
          </div>
          <div>
            <label style={lbl}>Frequency *</label>
            <input style={inp} value={f.frequency} onChange={upd('frequency')} placeholder="e.g. Three times daily" />
          </div>
          <div>
            <label style={lbl}>Duration</label>
            <input style={inp} value={f.duration} onChange={upd('duration')} placeholder="e.g. 7 days" />
          </div>
        </div>
      </div>

      {/* Prescriber */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--ud-gold)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Prescriber</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div>
            <label style={lbl}>Prescriber name *</label>
            <input style={inp} value={f.prescriberName} onChange={upd('prescriberName')} placeholder="Dr / NP / PA" />
          </div>
          <div>
            <label style={lbl}>Licence / GMC / DEA number</label>
            <input style={inp} value={f.licenseNo} onChange={upd('licenseNo')} placeholder="Optional" />
          </div>
          <div style={{ gridColumn: '1/-1' }}>
            <label style={lbl}>Practice / organisation</label>
            <input style={inp} value={f.prescriberOrg} onChange={upd('prescriberOrg')} placeholder="Optional" />
          </div>
        </div>
      </div>

      <button
        onClick={generate}
        disabled={can || loading}
        style={{
          width: '100%', padding: '13px 24px',
          background: can || loading ? 'var(--ud-border)' : 'var(--ud-gold)',
          color: can || loading ? 'var(--ud-muted)' : '#1e2d3d',
          border: 'none', borderRadius: 'var(--ud-radius)',
          fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 700,
          cursor: can || loading ? 'not-allowed' : 'pointer',
          transition: 'opacity 0.15s',
          marginBottom: 20,
        }}
      >
        {loading ? 'Generating prescription…' : 'Generate prescription →'}
      </button>

      {error && (
        <div style={{ padding: '10px 14px', background: 'rgba(226,75,74,0.06)', border: '1px solid rgba(226,75,74,0.2)', borderRadius: 'var(--ud-radius)', color: 'var(--ud-danger)', fontFamily: 'var(--font-body)', fontSize: 14, marginBottom: 20 }}>
          {error}
        </div>
      )}

      {result && (
        <div style={{ padding: '18px 20px', background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ud-gold)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>
            Prescription sealed
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ud-muted)', marginBottom: 14 }}>
            {result.name}
          </div>
          <a
            href={result.url}
            download={result.name}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '10px 20px',
              background: 'var(--ud-gold)', color: '#1e2d3d',
              fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 700,
              borderRadius: 'var(--ud-radius)', textDecoration: 'none',
            }}
          >
            Download .uds →
          </a>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ud-muted)', marginTop: 12 }}>
            Sealed · 30-day expiry · SHA-256 hash embedded
          </div>
        </div>
      )}

      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ud-muted)', marginTop: 48, paddingTop: 20, borderTop: '1px solid var(--ud-border)', lineHeight: 1.7 }}>
        No ads. No investors. No agenda. · Universal Document™ · This is not medical advice.
      </div>
    </div>
  )
}
