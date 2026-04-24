'use client'
import { useState } from 'react'
import TooltipTour from '@/components/TooltipTour'
import { tourSteps } from '@/lib/tourSteps'

export default function SmartLease() {
  const [landlordName, setLandlordName] = useState('')
  const [landlordEmail, setLandlordEmail] = useState('')
  const [landlordPhone, setLandlordPhone] = useState('')
  const [tenantName, setTenantName] = useState('')
  const [tenantEmail, setTenantEmail] = useState('')
  const [tenantPhone, setTenantPhone] = useState('')
  const [propertyAddress, setPropertyAddress] = useState('')
  const [leaseStart, setLeaseStart] = useState('')
  const [leaseEnd, setLeaseEnd] = useState('')
  const [monthlyRent, setMonthlyRent] = useState('')
  const [currency, setCurrency] = useState('GBP')
  const [deposit, setDeposit] = useState('')
  const [renewalClause, setRenewalClause] = useState(false)
  const [conditions, setConditions] = useState('')
  const [result, setResult] = useState<{ url: string; name: string } | null>(null)

  const inp = { width: '100%', padding: '10px 14px', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ud-ink)', background: '#fff', boxSizing: 'border-box' as const }
  const lbl = { display: 'block' as const, fontSize: 13, fontWeight: 600 as const, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: 6 }
  const sectionHead = { fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: 12, marginTop: 24 }

  const run = () => {
    const now = new Date().toISOString()
    const expiresAt = leaseEnd ? new Date(leaseEnd).toISOString() : undefined
    const doc = {
      format: 'UDS', status: 'sealed',
      title: `Lease Agreement — ${propertyAddress}`,
      document_type: 'lease_agreement',
      lease: {
        property_address: propertyAddress,
        landlord: { name: landlordName, email: landlordEmail || undefined, phone: landlordPhone || undefined },
        tenant: { name: tenantName, email: tenantEmail || undefined, phone: tenantPhone || undefined },
        lease_start: leaseStart || undefined,
        lease_end: leaseEnd || undefined,
        monthly_rent: monthlyRent ? { amount: parseFloat(monthlyRent), currency } : undefined,
        deposit: deposit ? { amount: parseFloat(deposit), currency } : undefined,
        renewal_clause: renewalClause,
        conditions: conditions || undefined,
        status: 'active',
        consent_landlord: null,
        consent_tenant: null,
      },
      expires_at: expiresAt,
      provenance: { created_at: now, document_type: 'lease_agreement', property: propertyAddress },
      _notice: 'This is not legal advice. This document does not constitute a legally binding lease without proper execution per applicable tenancy law. Consult a qualified solicitor.',
    }
    const blob = new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' })
    setResult({ url: URL.createObjectURL(blob), name: `lease-${propertyAddress.replace(/[^a-zA-Z0-9]+/g,'-').toLowerCase().slice(0,50)}.uds` })
  }

  const can = !landlordName || !tenantName || !propertyAddress

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
      <a href="/" style={{ fontSize: 13, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 32 }}>← All tools</a>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--ud-ink)', fontFamily: 'var(--font-display)' }}>UD Smart Lease</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontSize: 13, fontWeight: 600, padding: '3px 10px', borderRadius: 99, background: 'var(--ud-gold-3)', color: 'var(--ud-gold-text)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Pro</span>
          <span style={{ fontSize: 9, color: 'var(--ud-muted)', fontFamily: 'var(--font-mono)', paddingLeft: 10 }}>Free during beta</span>
        </div>
      </div>
      <p style={{ fontSize: 16, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', marginBottom: 8, lineHeight: 1.6 }}>Create a structured lease agreement .uds that expires on the end date, carries both parties' details, rent, deposit, and renewal clause in verifiable metadata.</p>
      <div style={{ fontSize: 13, color: 'var(--ud-danger)', marginBottom: 28, padding: '8px 12px', background: 'rgba(226,75,74,0.06)', border: '1px solid rgba(226,75,74,0.2)', borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)' }}>This is not legal advice. Always consult a qualified solicitor before relying on any lease document.</div>

      <div style={sectionHead}>Landlord</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 8 }}>
        <div><label style={lbl}>Name *</label><input style={inp} value={landlordName} onChange={e => setLandlordName(e.target.value)} placeholder="Landlord full name" /></div>
        <div><label style={lbl}>Email</label><input type="email" style={inp} value={landlordEmail} onChange={e => setLandlordEmail(e.target.value)} placeholder="landlord@example.com" /></div>
        <div style={{ gridColumn: '1/-1' }}><label style={lbl}>Phone</label><input style={inp} value={landlordPhone} onChange={e => setLandlordPhone(e.target.value)} placeholder="Contact number" /></div>
      </div>

      <div style={sectionHead}>Tenant</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 8 }}>
        <div><label style={lbl}>Name *</label><input style={inp} value={tenantName} onChange={e => setTenantName(e.target.value)} placeholder="Tenant full name" /></div>
        <div><label style={lbl}>Email</label><input type="email" style={inp} value={tenantEmail} onChange={e => setTenantEmail(e.target.value)} placeholder="tenant@example.com" /></div>
        <div style={{ gridColumn: '1/-1' }}><label style={lbl}>Phone</label><input style={inp} value={tenantPhone} onChange={e => setTenantPhone(e.target.value)} placeholder="Contact number" /></div>
      </div>

      <div style={sectionHead}>Property & Terms</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>
        <div style={{ gridColumn: '1/-1' }}><label style={lbl}>Property address *</label><input style={inp} value={propertyAddress} onChange={e => setPropertyAddress(e.target.value)} placeholder="Full property address" /></div>
        <div><label style={lbl}>Lease start</label><input type="date" style={inp} value={leaseStart} onChange={e => setLeaseStart(e.target.value)} /></div>
        <div><label style={lbl}>Lease end</label><input type="date" style={inp} value={leaseEnd} onChange={e => setLeaseEnd(e.target.value)} /></div>
        <div><label style={lbl}>Monthly rent</label><input type="number" min="0" step="0.01" style={inp} value={monthlyRent} onChange={e => setMonthlyRent(e.target.value)} placeholder="Amount" /></div>
        <div><label style={lbl}>Currency</label><select value={currency} onChange={e => setCurrency(e.target.value)} style={{ ...inp, cursor: 'pointer' }}>{['GBP','USD','EUR','AUD','CAD'].map(c => <option key={c} value={c}>{c}</option>)}</select></div>
        <div><label style={lbl}>Deposit</label><input type="number" min="0" step="0.01" style={inp} value={deposit} onChange={e => setDeposit(e.target.value)} placeholder="Amount" /></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 28 }}>
          <input type="checkbox" id="renewal" checked={renewalClause} onChange={e => setRenewalClause(e.target.checked)} style={{ width: 16, height: 16 }} />
          <label htmlFor="renewal" style={{ fontSize: 13, color: 'var(--ud-ink)', fontFamily: 'var(--font-body)', cursor: 'pointer' }}>Include renewal clause</label>
        </div>
        <div style={{ gridColumn: '1/-1' }}><label style={lbl}>Key conditions</label><textarea value={conditions} onChange={e => setConditions(e.target.value)} rows={4} style={{ ...inp, resize: 'vertical' }} placeholder="Pets policy, maintenance responsibilities, break clauses…" /></div>
      </div>

      {result && (
        <div style={{ padding: '14px 18px', background: 'var(--ud-teal-2)', border: '1px solid var(--ud-teal)', borderRadius: 'var(--ud-radius-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <div><div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ud-teal)', fontFamily: 'var(--font-body)' }}>Lease created ✓</div><div style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)' }}>{propertyAddress.slice(0,40)}{leaseEnd ? ` · Expires ${leaseEnd}` : ''}</div></div>
          <a href={result.url} download={result.name} style={{ padding: '10px 18px', background: 'var(--ud-ink)', color: '#fff', fontWeight: 600, fontSize: 13, borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)', textDecoration: 'none', flexShrink: 0 }}>Download .uds →</a>
        </div>
      )}
      <button onClick={run} disabled={!!can} style={{ width: '100%', padding: '14px', background: can ? 'var(--ud-border)' : 'var(--ud-ink)', color: can ? 'var(--ud-muted)' : '#fff', border: 'none', borderRadius: 'var(--ud-radius)', fontSize: 15, fontWeight: 600, fontFamily: 'var(--font-body)', cursor: can ? 'not-allowed' : 'pointer' }}>Create Lease Agreement</button>
      <div style={{ marginTop: 40, padding: '16px', background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', fontSize: 13, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', textAlign: 'center' }}>
        Runs in your browser. No data sent to any server. Part of the <a href="https://ud.hive.baby" style={{ color: 'var(--ud-teal)' }}>Universal Document™</a> ecosystem.
      </div>

      <div style={{ marginTop: '3rem', paddingTop: '2.5rem', borderTop: '1px solid var(--ud-border)' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--ud-ink)', fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>How UD Smart Lease differs from PDF leases and DocuSign</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', marginBottom: '1.5rem', lineHeight: 1.6 }}>PDF leases are flat documents. Term end dates, rent review dates, and break clause windows live in paragraphs — not queryable metadata. UD Smart Lease makes these machine-readable.</p>
        <div style={{ display: 'grid', gap: '1rem' }}>
          {[
            { title: 'PDF lease agreement', body: 'Standard format for residential and commercial leases. Term dates, rent review dates, and break clause windows are buried in paragraphs. No automatic expiry notification, no machine-readable structure.' },
            { title: 'DocuSign / Adobe Sign on a lease', body: 'Captures signatures on a flat PDF. The executed document has no queryable expiry, no break clause date field, no structured rent schedule. You need a separate CRM to manage lease milestones.' },
            { title: 'UD Smart Lease — term and break dates as metadata', body: 'Start date, end date, rent review dates, and break clause windows are structured metadata fields. Property management systems can read them directly without parsing document text.' },
            { title: 'UD Smart Lease — signature-ready for UD Signer', body: 'The output .uds includes signature placeholders for landlord and tenant. Open in UD Signer to apply tamper-evident signatures — no DocuSign subscription, no per-document fee.' },
          ].map(card => (
            <div key={card.title} style={{ background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)', borderRadius: '0.75rem', padding: '1.25rem' }}>
              <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--ud-ink)', fontFamily: 'var(--font-body)', marginBottom: '0.4rem' }}>{card.title}</div>
              <div style={{ fontSize: '15px', color: 'var(--ud-ink)', fontFamily: 'var(--font-body)', lineHeight: 1.7 }}>{card.body}</div>
            </div>
          ))}
        </div>
      </div>
      <TooltipTour engineId="smart-lease" tips={tourSteps['smart-lease']} />
    </div>
  )
}
