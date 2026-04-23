'use client'
import { useState } from 'react'

const FILING_TYPES = ['Annual Return','Compliance Report','Incident Report','Data Breach Notification','Environmental Report','Licence Renewal','Regulatory Notice','Other']
const REGULATORS = ['FCA','CQC','ICO','HMRC','HSE','OFSTED','FRC','Companies House','FDA','SEC','Other']

export default function RegulatoryFiling() {
  const [filingType, setFilingType] = useState('')
  const [customType, setCustomType] = useState('')
  const [regulator, setRegulator] = useState('')
  const [customRegulator, setCustomRegulator] = useState('')
  const [entityName, setEntityName] = useState('')
  const [entityRef, setEntityRef] = useState('')
  const [filingRef, setFilingRef] = useState('')
  const [jurisdiction, setJurisdiction] = useState('')
  const [filingDate, setFilingDate] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [periodStart, setPeriodStart] = useState('')
  const [periodEnd, setPeriodEnd] = useState('')
  const [submittedBy, setSubmittedBy] = useState('')
  const [result, setResult] = useState<{ url: string; name: string } | null>(null)
  const [error, setError] = useState('')

  const inp = { width: '100%', padding: '10px 14px', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ud-ink)', background: '#fff', boxSizing: 'border-box' as const }
  const lbl = { display: 'block' as const, fontSize: 11, fontWeight: 600 as const, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: 6 }

  const run = () => {
    setError('')
    const now = new Date().toISOString()
    const type = filingType === 'Other' ? customType : filingType
    const reg = regulator === 'Other' ? customRegulator : regulator
    const ref = filingRef || `REG-${Date.now().toString(36).toUpperCase()}`
    const doc = {
      format: 'UDS', status: 'sealed',
      title: `${type} — ${entityName}${reg ? ` — ${reg}` : ''}`,
      document_type: 'regulatory_filing',
      filing: {
        filing_reference: ref,
        filing_type: type,
        regulator: reg || undefined,
        entity: { name: entityName, reference: entityRef || undefined },
        jurisdiction: jurisdiction || undefined,
        submitted_by: submittedBy || undefined,
        filing_date: filingDate || now.slice(0, 10),
        due_date: dueDate || undefined,
        reporting_period: periodStart && periodEnd ? { from: periodStart, to: periodEnd } : undefined,
        status: 'filed',
      },
      provenance: { created_at: now, document_type: 'regulatory_filing', filing_reference: ref },
      _notice: 'This filing record is generated for documentation purposes. Always verify submission requirements with the relevant regulator.',
    }
    const blob = new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' })
    setResult({ url: URL.createObjectURL(blob), name: `${type.replace(/\s+/g,'-').toLowerCase()}-${ref}.uds` })
  }

  const can = !filingType || !entityName || (filingType === 'Other' && !customType) || (regulator === 'Other' && !customRegulator)

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
      <a href="/" style={{ fontSize: 13, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 32 }}>← All tools</a>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--ud-ink)', fontFamily: 'var(--font-display)' }}>UD Regulatory Filing</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 99, background: 'var(--ud-gold-3)', color: 'var(--ud-gold)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Pro</span>
          <span style={{ fontSize: 9, color: 'var(--ud-muted)', fontFamily: 'var(--font-mono)', paddingLeft: 10 }}>Free during beta</span>
        </div>
      </div>
      <p style={{ fontSize: 16, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', marginBottom: 32, lineHeight: 1.6 }}>Create a sealed .uds filing record with regulator, entity reference, reporting period, jurisdiction, and submission metadata for compliance audit trails.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>
        <div>
          <label style={lbl}>Filing type *</label>
          <select value={filingType} onChange={e => setFilingType(e.target.value)} style={{ ...inp, cursor: 'pointer' }}>
            <option value="">— Select —</option>
            {FILING_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label style={lbl}>Regulator</label>
          <select value={regulator} onChange={e => setRegulator(e.target.value)} style={{ ...inp, cursor: 'pointer' }}>
            <option value="">— Select —</option>
            {REGULATORS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        {filingType === 'Other' && <div><label style={lbl}>Filing type (specify)</label><input style={inp} value={customType} onChange={e => setCustomType(e.target.value)} placeholder="Type" /></div>}
        {regulator === 'Other' && <div><label style={lbl}>Regulator (specify)</label><input style={inp} value={customRegulator} onChange={e => setCustomRegulator(e.target.value)} placeholder="Regulator name" /></div>}
        <div><label style={lbl}>Entity name *</label><input style={inp} value={entityName} onChange={e => setEntityName(e.target.value)} placeholder="Company / organisation" /></div>
        <div><label style={lbl}>Entity reference number</label><input style={inp} value={entityRef} onChange={e => setEntityRef(e.target.value)} placeholder="e.g. Companies House no." /></div>
        <div><label style={lbl}>Filing reference</label><input style={inp} value={filingRef} onChange={e => setFilingRef(e.target.value)} placeholder="Auto-generated if blank" /></div>
        <div><label style={lbl}>Jurisdiction</label><input style={inp} value={jurisdiction} onChange={e => setJurisdiction(e.target.value)} placeholder="e.g. England & Wales" /></div>
        <div><label style={lbl}>Filing date</label><input type="date" style={inp} value={filingDate} onChange={e => setFilingDate(e.target.value)} /></div>
        <div><label style={lbl}>Due date</label><input type="date" style={inp} value={dueDate} onChange={e => setDueDate(e.target.value)} /></div>
        <div><label style={lbl}>Reporting period — from</label><input type="date" style={inp} value={periodStart} onChange={e => setPeriodStart(e.target.value)} /></div>
        <div><label style={lbl}>Reporting period — to</label><input type="date" style={inp} value={periodEnd} onChange={e => setPeriodEnd(e.target.value)} /></div>
        <div style={{ gridColumn: '1/-1' }}><label style={lbl}>Submitted by</label><input style={inp} value={submittedBy} onChange={e => setSubmittedBy(e.target.value)} placeholder="Name or role" /></div>
      </div>

      {error && <div style={{ padding: '12px 16px', background: 'rgba(226,75,74,0.08)', border: '1px solid rgba(226,75,74,0.2)', borderRadius: 'var(--ud-radius)', fontSize: 13, color: 'var(--ud-danger)', fontFamily: 'var(--font-body)', marginBottom: 20 }}>{error}</div>}
      {result && (
        <div style={{ padding: '14px 18px', background: 'var(--ud-teal-2)', border: '1px solid var(--ud-teal)', borderRadius: 'var(--ud-radius-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <div><div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ud-teal)', fontFamily: 'var(--font-body)' }}>Filing record created ✓</div><div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)' }}>{entityName} · {filingType === 'Other' ? customType : filingType}</div></div>
          <a href={result.url} download={result.name} style={{ padding: '10px 18px', background: 'var(--ud-ink)', color: '#fff', fontWeight: 600, fontSize: 13, borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)', textDecoration: 'none', flexShrink: 0 }}>Download .uds →</a>
        </div>
      )}
      <button onClick={run} disabled={!!can} style={{ width: '100%', padding: '14px', background: can ? 'var(--ud-border)' : 'var(--ud-ink)', color: can ? 'var(--ud-muted)' : '#fff', border: 'none', borderRadius: 'var(--ud-radius)', fontSize: 15, fontWeight: 600, fontFamily: 'var(--font-body)', cursor: can ? 'not-allowed' : 'pointer' }}>Create Filing Record</button>
      <div style={{ marginTop: 40, padding: '16px', background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', fontSize: 12, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', textAlign: 'center' }}>
        Runs in your browser. No data sent to any server. Part of the <a href="https://ud.hive.baby" style={{ color: 'var(--ud-teal)' }}>Universal Document™</a> ecosystem.
      </div>
    </div>
  )
}
