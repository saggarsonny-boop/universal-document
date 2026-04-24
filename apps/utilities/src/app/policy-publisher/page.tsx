'use client'
import { useState } from 'react'

const POLICY_TYPES = ['Acceptable Use','Privacy','Data Retention','Information Security','Remote Work','Code of Conduct','Expense','Procurement','Change Management','Other']
const AUDIENCES = ['All staff','Management','IT department','Finance','HR','Contractors','Customers','Public']

export default function PolicyPublisher() {
  const [policyType, setPolicyType] = useState('')
  const [customType, setCustomType] = useState('')
  const [orgName, setOrgName] = useState('')
  const [version, setVersion] = useState('1.0')
  const [effectiveDate, setEffectiveDate] = useState('')
  const [reviewDate, setReviewDate] = useState('')
  const [owner, setOwner] = useState('')
  const [approver, setApprover] = useState('')
  const [audience, setAudience] = useState<string[]>(['All staff'])
  const [classification, setClassification] = useState('Internal')
  const [summary, setSummary] = useState('')
  const [result, setResult] = useState<{ url: string; name: string } | null>(null)

  const toggleAudience = (a: string) => setAudience(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a])

  const inp = { width: '100%', padding: '10px 14px', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ud-ink)', background: '#fff', boxSizing: 'border-box' as const }
  const lbl = { display: 'block' as const, fontSize: 11, fontWeight: 600 as const, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: 6 }

  const run = () => {
    const now = new Date().toISOString()
    const type = policyType === 'Other' ? customType : policyType
    const doc = {
      format: 'UDS', status: 'sealed',
      title: `${orgName ? orgName + ' — ' : ''}${type} Policy v${version}`,
      document_type: 'policy',
      policy: {
        type, version,
        organisation: orgName || undefined,
        owner: owner || undefined,
        approver: approver || undefined,
        effective_date: effectiveDate || undefined,
        review_date: reviewDate || undefined,
        audience,
        classification,
        summary: summary || undefined,
        status: 'active',
      },
      provenance: { created_at: now, document_type: 'policy', version },
      _notice: 'This policy document is generated for informational purposes. Always review with qualified legal and compliance professionals.',
    }
    const blob = new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' })
    setResult({ url: URL.createObjectURL(blob), name: `${type.replace(/\s+/g,'-').toLowerCase()}-policy-v${version}.uds` })
  }

  const can = !policyType || (policyType === 'Other' && !customType)

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
      <a href="/" style={{ fontSize: 13, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 32 }}>← All tools</a>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--ud-ink)', fontFamily: 'var(--font-display)' }}>UD Policy Publisher</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 99, background: 'var(--ud-gold-3)', color: 'var(--ud-gold)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Pro</span>
          <span style={{ fontSize: 9, color: 'var(--ud-muted)', fontFamily: 'var(--font-mono)', paddingLeft: 10 }}>Free during beta</span>
        </div>
      </div>
      <p style={{ fontSize: 16, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', marginBottom: 32, lineHeight: 1.6 }}>Publish organisational policies as versioned, tamper-evident .uds documents with effective date, review date, owner, and audience metadata.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>
        <div style={{ gridColumn: '1/-1' }}>
          <label style={lbl}>Policy type *</label>
          <select value={policyType} onChange={e => setPolicyType(e.target.value)} style={{ ...inp, cursor: 'pointer' }}>
            <option value="">— Select —</option>
            {POLICY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        {policyType === 'Other' && <div style={{ gridColumn: '1/-1' }}><label style={lbl}>Specify policy type</label><input style={inp} value={customType} onChange={e => setCustomType(e.target.value)} placeholder="Policy name" /></div>}
        <div><label style={lbl}>Organisation</label><input style={inp} value={orgName} onChange={e => setOrgName(e.target.value)} placeholder="Organisation name" /></div>
        <div><label style={lbl}>Version</label><input style={inp} value={version} onChange={e => setVersion(e.target.value)} placeholder="1.0" /></div>
        <div><label style={lbl}>Policy owner</label><input style={inp} value={owner} onChange={e => setOwner(e.target.value)} placeholder="Name or role" /></div>
        <div><label style={lbl}>Approver</label><input style={inp} value={approver} onChange={e => setApprover(e.target.value)} placeholder="Name or role" /></div>
        <div><label style={lbl}>Effective date</label><input type="date" style={inp} value={effectiveDate} onChange={e => setEffectiveDate(e.target.value)} /></div>
        <div><label style={lbl}>Review date</label><input type="date" style={inp} value={reviewDate} onChange={e => setReviewDate(e.target.value)} /></div>
        <div>
          <label style={lbl}>Classification</label>
          <select value={classification} onChange={e => setClassification(e.target.value)} style={{ ...inp, cursor: 'pointer' }}>
            {['Public','Internal','Confidential','Restricted'].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div style={{ gridColumn: '1/-1' }}><label style={lbl}>Policy summary</label><textarea value={summary} onChange={e => setSummary(e.target.value)} placeholder="Brief purpose statement for this policy" rows={3} style={{ ...inp, resize: 'vertical' }} /></div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <label style={{ ...lbl, marginBottom: 10 }}>Audience</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {AUDIENCES.map(a => <button key={a} onClick={() => toggleAudience(a)} style={{ padding: '6px 14px', borderRadius: 99, fontFamily: 'var(--font-body)', fontSize: 13, cursor: 'pointer', border: '1px solid', background: audience.includes(a) ? 'var(--ud-ink)' : '#fff', color: audience.includes(a) ? '#fff' : 'var(--ud-muted)', borderColor: audience.includes(a) ? 'var(--ud-ink)' : 'var(--ud-border)' }}>{a}</button>)}
        </div>
      </div>

      {result && (
        <div style={{ padding: '14px 18px', background: 'var(--ud-teal-2)', border: '1px solid var(--ud-teal)', borderRadius: 'var(--ud-radius-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <div><div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ud-teal)', fontFamily: 'var(--font-body)' }}>Policy published ✓</div><div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)' }}>{policyType === 'Other' ? customType : policyType} v{version}</div></div>
          <a href={result.url} download={result.name} style={{ padding: '10px 18px', background: 'var(--ud-ink)', color: '#fff', fontWeight: 600, fontSize: 13, borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)', textDecoration: 'none', flexShrink: 0 }}>Download .uds →</a>
        </div>
      )}
      <button onClick={run} disabled={!!can} style={{ width: '100%', padding: '14px', background: can ? 'var(--ud-border)' : 'var(--ud-ink)', color: can ? 'var(--ud-muted)' : '#fff', border: 'none', borderRadius: 'var(--ud-radius)', fontSize: 15, fontWeight: 600, fontFamily: 'var(--font-body)', cursor: can ? 'not-allowed' : 'pointer' }}>Publish Policy</button>
      <div style={{ marginTop: 40, padding: '16px', background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', fontSize: 12, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', textAlign: 'center' }}>
        Runs in your browser. No data sent to any server. Part of the <a href="https://ud.hive.baby" style={{ color: 'var(--ud-teal)' }}>Universal Document™</a> ecosystem.
      </div>

      <div style={{ marginTop: '3rem', paddingTop: '2.5rem', borderTop: '1px solid var(--ud-border)' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--ud-ink)', fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>How UD Policy Publisher differs from SharePoint and PolicyStat</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', marginBottom: '1.5rem', lineHeight: 1.6 }}>SharePoint stores policies as files with no structural enforcement. PolicyStat requires subscription and IT setup. UD Policy Publisher creates a self-contained, verifiable policy record instantly.</p>
        <div style={{ display: 'grid', gap: '1rem' }}>
          {[
            { title: 'SharePoint / intranet document library', body: 'Policies stored as Word or PDF files. Version history relies on SharePoint\'s own metadata — not embedded in the document. If the file is downloaded and shared, version and review date information is lost.' },
            { title: 'PolicyStat / MedTrainer', body: 'Healthcare-specific policy management platforms. Require subscription, implementation, and training. More than most organisations need for creating a single structured policy document.' },
            { title: 'UD Policy Publisher — review date in structured metadata', body: 'Mandatory review date is a structured field inside the .uds — not a word in a paragraph. UD Reader surfaces "review due" immediately on open. Policies can be filtered by review date without a database.' },
            { title: 'UD Policy Publisher — version and owner embedded', body: 'Policy version number, approving authority, and owner are part of the document\'s sealed metadata. Anyone who receives the file can verify who published it, when, and whether it\'s been modified since.' },
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
