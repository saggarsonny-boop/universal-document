'use client'
import { useState } from 'react'
import TooltipTour from '@/components/TooltipTour'
import { tourSteps } from '@/lib/tourSteps'

const POLICY_TYPES = ['Home & Contents','Motor','Life','Health & Medical','Travel','Public Liability','Professional Indemnity','Employers Liability','Business Interruption','Cyber','Other']

export default function InsurancePolicy() {
  const [policyType, setPolicyType] = useState('')
  const [customType, setCustomType] = useState('')
  const [insurer, setInsurer] = useState('')
  const [insuredName, setInsuredName] = useState('')
  const [insuredEmail, setInsuredEmail] = useState('')
  const [policyNumber, setPolicyNumber] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [premium, setPremium] = useState('')
  const [currency, setCurrency] = useState('GBP')
  const [coverageDetails, setCoverageDetails] = useState('')
  const [excess, setExcess] = useState('')
  const [result, setResult] = useState<{ url: string; name: string } | null>(null)

  const inp = { width: '100%', padding: '10px 14px', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ud-ink)', background: '#fff', boxSizing: 'border-box' as const }
  const lbl = { display: 'block' as const, fontSize: 13, fontWeight: 600 as const, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: 6 }

  const run = () => {
    const now = new Date().toISOString()
    const type = policyType === 'Other' ? customType : policyType
    const polNum = policyNumber || `POL-${Date.now().toString(36).toUpperCase()}`
    const expiresAt = endDate ? new Date(endDate).toISOString() : undefined
    const doc = {
      format: 'UDS', status: 'sealed',
      title: `${type} Policy — ${insuredName}`,
      document_type: 'insurance_policy',
      policy: {
        policy_number: polNum,
        type,
        insurer: insurer || undefined,
        insured: { name: insuredName, email: insuredEmail || undefined },
        coverage_details: coverageDetails || undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        premium: premium ? { amount: parseFloat(premium), currency, frequency: 'annual' } : undefined,
        excess: excess ? { amount: parseFloat(excess), currency } : undefined,
        status: 'active',
        cancellation_date: null,
      },
      expires_at: expiresAt,
      provenance: { created_at: now, document_type: 'insurance_policy', policy_number: polNum },
    }
    const blob = new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' })
    setResult({ url: URL.createObjectURL(blob), name: `insurance-${polNum.toLowerCase()}.uds` })
  }

  const can = !policyType || !insuredName || (policyType === 'Other' && !customType)

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
      <a href="/" style={{ fontSize: 13, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 32 }}>← All tools</a>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--ud-ink)', fontFamily: 'var(--font-display)' }}>UD Insurance Policy</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontSize: 13, fontWeight: 600, padding: '3px 10px', borderRadius: 99, background: 'var(--ud-gold-3)', color: 'var(--ud-gold-text)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Pro</span>
          <span style={{ fontSize: 9, color: 'var(--ud-muted)', fontFamily: 'var(--font-mono)', paddingLeft: 10 }}>Free during beta</span>
        </div>
      </div>
      <p style={{ fontSize: 16, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', marginBottom: 32, lineHeight: 1.6 }}>Create a sealed insurance policy .uds that expires on the end date, carries policy number, premium, excess, and coverage details in verifiable metadata. Cancellation-ready.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>
        <div style={{ gridColumn: '1/-1' }}>
          <label style={lbl}>Policy type *</label>
          <select value={policyType} onChange={e => setPolicyType(e.target.value)} style={{ ...inp, cursor: 'pointer' }}>
            <option value="">— Select —</option>
            {POLICY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        {policyType === 'Other' && <div style={{ gridColumn: '1/-1' }}><label style={lbl}>Specify policy type</label><input style={inp} value={customType} onChange={e => setCustomType(e.target.value)} placeholder="Policy type" /></div>}
        <div style={{ gridColumn: '1/-1' }}><label style={lbl}>Insurer</label><input style={inp} value={insurer} onChange={e => setInsurer(e.target.value)} placeholder="Insurance company name" /></div>
        <div><label style={lbl}>Insured name *</label><input style={inp} value={insuredName} onChange={e => setInsuredName(e.target.value)} placeholder="Policyholder name" /></div>
        <div><label style={lbl}>Insured email</label><input type="email" style={inp} value={insuredEmail} onChange={e => setInsuredEmail(e.target.value)} placeholder="email@example.com" /></div>
        <div><label style={lbl}>Policy number</label><input style={inp} value={policyNumber} onChange={e => setPolicyNumber(e.target.value)} placeholder="Auto-generated if blank" /></div>
        <div><label style={lbl}>Currency</label><select value={currency} onChange={e => setCurrency(e.target.value)} style={{ ...inp, cursor: 'pointer' }}>{['GBP','USD','EUR','AUD','CAD'].map(c => <option key={c} value={c}>{c}</option>)}</select></div>
        <div><label style={lbl}>Start date</label><input type="date" style={inp} value={startDate} onChange={e => setStartDate(e.target.value)} /></div>
        <div><label style={lbl}>End date</label><input type="date" style={inp} value={endDate} onChange={e => setEndDate(e.target.value)} /></div>
        <div><label style={lbl}>Annual premium</label><input type="number" min="0" step="0.01" style={inp} value={premium} onChange={e => setPremium(e.target.value)} placeholder="Amount" /></div>
        <div><label style={lbl}>Excess / deductible</label><input type="number" min="0" step="0.01" style={inp} value={excess} onChange={e => setExcess(e.target.value)} placeholder="Amount" /></div>
        <div style={{ gridColumn: '1/-1' }}><label style={lbl}>Coverage details</label><textarea value={coverageDetails} onChange={e => setCoverageDetails(e.target.value)} rows={4} style={{ ...inp, resize: 'vertical' }} placeholder="What is covered, key exclusions, coverage limits…" /></div>
      </div>

      {result && (
        <div style={{ padding: '14px 18px', background: 'var(--ud-teal-2)', border: '1px solid var(--ud-teal)', borderRadius: 'var(--ud-radius-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <div><div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ud-teal)', fontFamily: 'var(--font-body)' }}>Policy created ✓</div><div style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)' }}>{insuredName} · {policyType === 'Other' ? customType : policyType}{endDate ? ` · Expires ${endDate}` : ''}</div></div>
          <a href={result.url} download={result.name} style={{ padding: '10px 18px', background: 'var(--ud-ink)', color: '#fff', fontWeight: 600, fontSize: 13, borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)', textDecoration: 'none', flexShrink: 0 }}>Download .uds →</a>
        </div>
      )}
      <button onClick={run} disabled={!!can} style={{ width: '100%', padding: '14px', background: can ? 'var(--ud-border)' : 'var(--ud-ink)', color: can ? 'var(--ud-muted)' : '#fff', border: 'none', borderRadius: 'var(--ud-radius)', fontSize: 15, fontWeight: 600, fontFamily: 'var(--font-body)', cursor: can ? 'not-allowed' : 'pointer' }}>Create Insurance Policy</button>
      <div style={{ marginTop: 40, padding: '16px', background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', fontSize: 13, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', textAlign: 'center' }}>
        Runs in your browser. No data sent to any server. Part of the <a href="https://ud.hive.baby" style={{ color: 'var(--ud-teal)' }}>Universal Document™</a> ecosystem.
      </div>

      <div style={{ marginTop: '3rem', paddingTop: '2.5rem', borderTop: '1px solid var(--ud-border)' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--ud-ink)', fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>How UD Insurance Policy differs from PDF policy documents and legacy systems</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', marginBottom: '1.5rem', lineHeight: 1.6 }}>PDF insurance policies have coverage details buried in paragraphs. Legacy systems lock data in proprietary formats. UD Insurance Policy makes coverage metadata machine-readable and portable.</p>
        <div style={{ display: 'grid', gap: '1rem' }}>
          {[
            { title: 'PDF insurance policy from insurer', body: 'Coverage limits, exclusions, and expiry date are in formatted paragraphs — not structured fields. Brokers and risk managers extract these manually into spreadsheets for portfolio management.' },
            { title: 'Legacy policy administration systems', body: 'Proprietary platforms that lock data in vendor-specific formats. Switching insurers or brokers often means manually re-entering policy data — no portable, structured export.' },
            { title: 'UD Insurance Policy — structured coverage metadata', body: 'Coverage type, limits, exclusions, premium, and expiry are structured fields readable by any system. Risk managers can aggregate portfolio data without manual extraction.' },
            { title: 'UD Insurance Policy — expiry alert in the document', body: 'Expiry date is a metadata field, not a line of text. UD Reader flags approaching expiry immediately on open. No separate calendar reminder or spreadsheet tracker required.' },
          ].map(card => (
            <div key={card.title} style={{ background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)', borderRadius: '0.75rem', padding: '1.25rem' }}>
              <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--ud-ink)', fontFamily: 'var(--font-body)', marginBottom: '0.4rem' }}>{card.title}</div>
              <div style={{ fontSize: '15px', color: 'var(--ud-ink)', fontFamily: 'var(--font-body)', lineHeight: 1.7 }}>{card.body}</div>
            </div>
          ))}
        </div>
      </div>
      <TooltipTour engineId="insurance-policy" tips={tourSteps['insurance-policy']} />
    </div>
  )
}
