'use client'
import { useState } from 'react'

const CONTRACT_TYPES = ['Service Agreement', 'NDA', 'Employment', 'Licensing', 'Purchase', 'Custom']

export default function SmartContract() {
  const [contractTitle, setContractTitle] = useState('')
  const [contractType, setContractType] = useState('Service Agreement')
  const [effectiveDate, setEffectiveDate] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [keyTerms, setKeyTerms] = useState('')
  const [governingLaw, setGoverningLaw] = useState('')
  const [autoRenewal, setAutoRenewal] = useState(false)

  const [partyAName, setPartyAName] = useState('')
  const [partyAEmail, setPartyAEmail] = useState('')
  const [partyAOrg, setPartyAOrg] = useState('')

  const [partyBName, setPartyBName] = useState('')
  const [partyBEmail, setPartyBEmail] = useState('')
  const [partyBOrg, setPartyBOrg] = useState('')

  const [result, setResult] = useState<{ url: string; name: string } | null>(null)

  const inp: React.CSSProperties = { width: '100%', padding: '10px 14px', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ud-ink)', background: '#fff', boxSizing: 'border-box' }
  const lbl: React.CSSProperties = { display: 'block', fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }
  const sectionHead: React.CSSProperties = { fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12, marginTop: 24 }

  function run() {
    const now = new Date().toISOString()
    const safeTitle = contractTitle.replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase().slice(0, 40)

    const doc = {
      format: 'UDS', status: 'sealed',
      title: contractTitle,
      document_type: 'contract',
      expires_at: expiryDate ? new Date(expiryDate).toISOString() : undefined,
      contract: {
        contract_type: contractType,
        effective_date: effectiveDate || undefined,
        expiry_date: expiryDate || undefined,
        auto_renewal: autoRenewal,
        governing_law: governingLaw || undefined,
        key_terms: keyTerms || undefined,
        party_a: {
          name: partyAName,
          email: partyAEmail || undefined,
          organisation: partyAOrg || undefined,
          signature: null,
          signature_placeholder: 'Awaiting signature via UD Signer — signer.hive.baby',
        },
        party_b: {
          name: partyBName,
          email: partyBEmail || undefined,
          organisation: partyBOrg || undefined,
          signature: null,
          signature_placeholder: 'Awaiting signature via UD Signer — signer.hive.baby',
        },
        status: 'draft_unsigned',
      },
      provenance: {
        created_at: now,
        document_type: 'contract',
        contract_type: contractType,
        parties: [partyAName, partyBName],
        generator: 'UD Smart Contract · utilities.hive.baby',
      },
      _notice: 'This is not legal advice. This document does not constitute a legally binding contract without proper execution per applicable law. Consult a qualified solicitor or attorney before relying on any contract.',
    }

    const blob = new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' })
    setResult({ url: URL.createObjectURL(blob), name: `contract-${safeTitle}.uds` })
  }

  const can = !contractTitle || !partyAName || !partyBName

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '48px 24px' }}>
      <a href="/" style={{ fontSize: 13, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 32 }}>← All tools</a>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--ud-ink)', fontFamily: 'var(--font-display)' }}>UD Smart Contract</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 99, background: 'var(--ud-gold-3)', color: 'var(--ud-gold)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Pro</span>
          <span style={{ fontSize: 9, color: 'var(--ud-muted)', fontFamily: 'var(--font-mono)', paddingLeft: 10 }}>Free during beta</span>
        </div>
      </div>

      <p style={{ fontSize: 16, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', marginBottom: 8, lineHeight: 1.6 }}>
        Create a structured contract .uds — tamper-evident, with both party details, expiry, renewal clause, and signature placeholders ready for UD Signer.
      </p>
      <div style={{ fontSize: 12, color: 'var(--ud-danger)', marginBottom: 28, padding: '8px 12px', background: 'rgba(226,75,74,0.06)', border: '1px solid rgba(226,75,74,0.2)', borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)' }}>
        This is not legal advice. Always consult a qualified solicitor or attorney before relying on any contract document.
      </div>

      {/* Contract details */}
      <div style={sectionHead}>Contract</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 8 }}>
        <div style={{ gridColumn: '1/-1' }}>
          <label style={lbl}>Contract title *</label>
          <input style={inp} value={contractTitle} onChange={e => setContractTitle(e.target.value)} placeholder="e.g. Software Development Services Agreement" />
        </div>
        <div>
          <label style={lbl}>Contract type</label>
          <select style={{ ...inp, cursor: 'pointer' }} value={contractType} onChange={e => setContractType(e.target.value)}>
            {CONTRACT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label style={lbl}>Governing law / jurisdiction</label>
          <input style={inp} value={governingLaw} onChange={e => setGoverningLaw(e.target.value)} placeholder="e.g. England & Wales, New York" />
        </div>
        <div>
          <label style={lbl}>Effective date</label>
          <input type="date" style={inp} value={effectiveDate} onChange={e => setEffectiveDate(e.target.value)} />
        </div>
        <div>
          <label style={lbl}>Expiry date</label>
          <input type="date" style={inp} value={expiryDate} onChange={e => setExpiryDate(e.target.value)} />
        </div>
        <div style={{ gridColumn: '1/-1', display: 'flex', alignItems: 'center', gap: 10 }}>
          <input type="checkbox" id="autoRenewal" checked={autoRenewal} onChange={e => setAutoRenewal(e.target.checked)} style={{ width: 16, height: 16 }} />
          <label htmlFor="autoRenewal" style={{ fontSize: 13, color: 'var(--ud-ink)', fontFamily: 'var(--font-body)', cursor: 'pointer' }}>Auto-renewal clause</label>
        </div>
        <div style={{ gridColumn: '1/-1' }}>
          <label style={lbl}>Key terms</label>
          <textarea rows={5} style={{ ...inp, resize: 'vertical' }} value={keyTerms} onChange={e => setKeyTerms(e.target.value)} placeholder="Scope of work, payment terms, deliverables, warranties, limitations of liability, termination conditions…" />
        </div>
      </div>

      {/* Party A */}
      <div style={sectionHead}>Party A</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 8 }}>
        <div style={{ gridColumn: '1/-1' }}>
          <label style={lbl}>Name *</label>
          <input style={inp} value={partyAName} onChange={e => setPartyAName(e.target.value)} placeholder="Full legal name" />
        </div>
        <div>
          <label style={lbl}>Email</label>
          <input type="email" style={inp} value={partyAEmail} onChange={e => setPartyAEmail(e.target.value)} placeholder="party-a@example.com" />
        </div>
        <div>
          <label style={lbl}>Organisation</label>
          <input style={inp} value={partyAOrg} onChange={e => setPartyAOrg(e.target.value)} placeholder="Company or entity name" />
        </div>
      </div>

      {/* Party B */}
      <div style={sectionHead}>Party B</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>
        <div style={{ gridColumn: '1/-1' }}>
          <label style={lbl}>Name *</label>
          <input style={inp} value={partyBName} onChange={e => setPartyBName(e.target.value)} placeholder="Full legal name" />
        </div>
        <div>
          <label style={lbl}>Email</label>
          <input type="email" style={inp} value={partyBEmail} onChange={e => setPartyBEmail(e.target.value)} placeholder="party-b@example.com" />
        </div>
        <div>
          <label style={lbl}>Organisation</label>
          <input style={inp} value={partyBOrg} onChange={e => setPartyBOrg(e.target.value)} placeholder="Company or entity name" />
        </div>
      </div>

      {result && (
        <div style={{ padding: '14px 18px', background: 'var(--ud-teal-2)', border: '1px solid var(--ud-teal)', borderRadius: 'var(--ud-radius-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ud-teal)', fontFamily: 'var(--font-body)' }}>Contract created ✓</div>
            <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)' }}>{contractType} · {partyAName} ↔ {partyBName}{expiryDate ? ` · Expires ${expiryDate}` : ''}</div>
          </div>
          <a href={result.url} download={result.name} style={{ padding: '10px 18px', background: 'var(--ud-ink)', color: '#fff', fontWeight: 600, fontSize: 13, borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)', textDecoration: 'none', flexShrink: 0 }}>Download .uds →</a>
        </div>
      )}

      <button onClick={run} disabled={!!can} style={{ width: '100%', padding: '14px', background: can ? 'var(--ud-border)' : 'var(--ud-ink)', color: can ? 'var(--ud-muted)' : '#fff', border: 'none', borderRadius: 'var(--ud-radius)', fontSize: 15, fontWeight: 600, fontFamily: 'var(--font-body)', cursor: can ? 'not-allowed' : 'pointer' }}>
        Create Contract
      </button>

      <div style={{ marginTop: 16, padding: '12px 16px', background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', fontSize: 12, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)' }}>
        The output .uds includes signature placeholders for both parties. Open it in <a href="https://signer.hive.baby" style={{ color: 'var(--ud-teal)' }}>UD Signer</a> to apply cryptographic signatures.
      </div>

      <div style={{ marginTop: 16, padding: '16px', background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', fontSize: 12, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', textAlign: 'center' }}>
        Runs in your browser. No data sent to any server. Part of the <a href="https://ud.hive.baby" style={{ color: 'var(--ud-teal)' }}>Universal Document™</a> ecosystem.
      </div>
    </div>
  )
}
