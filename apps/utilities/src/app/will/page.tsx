'use client'
import { useState } from 'react'
import TooltipTour from '@/components/TooltipTour'
import { tourSteps } from '@/lib/tourSteps'

type Beneficiary = { id: string; name: string; relationship: string; share: string; bequest: string }
type Witness = { id: string; name: string; address: string }

export default function WillPage() {
  const [testatorName, setTestatorName] = useState('')
  const [testatorDob, setTestatorDob] = useState('')
  const [testatorAddress, setTestatorAddress] = useState('')
  const [executorName, setExecutorName] = useState('')
  const [executorContact, setExecutorContact] = useState('')
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([{ id: 'b1', name: '', relationship: '', share: '', bequest: '' }])
  const [residuary, setResiduary] = useState('')
  const [funeralWishes, setFuneralWishes] = useState('')
  const [advanceCPR, setAdvanceCPR] = useState('')
  const [advanceLifeSupport, setAdvanceLifeSupport] = useState('')
  const [organDonation, setOrganDonation] = useState('')
  const [reviewDate, setReviewDate] = useState('')
  const [witnesses, setWitnesses] = useState<Witness[]>([
    { id: 'w1', name: '', address: '' },
    { id: 'w2', name: '', address: '' },
  ])
  const [result, setResult] = useState<{ url: string; name: string } | null>(null)
  const [error, setError] = useState('')

  const addBeneficiary = () => setBeneficiaries(prev => [...prev, { id: `b${Date.now()}`, name: '', relationship: '', share: '', bequest: '' }])
  const updateBenef = (id: string, field: keyof Beneficiary, value: string) => setBeneficiaries(prev => prev.map(b => b.id === id ? { ...b, [field]: value } : b))
  const removeBenef = (id: string) => setBeneficiaries(prev => prev.filter(b => b.id !== id))
  const updateWitness = (id: string, field: keyof Witness, value: string) => setWitnesses(prev => prev.map(w => w.id === id ? { ...w, [field]: value } : w))

  const DISCLAIMER = 'This document is not a legally executed will. It requires proper witnessing and execution to have legal effect in your jurisdiction. Consult a qualified solicitor or attorney before relying on this document for estate planning purposes.'

  const generate = () => {
    setError('')
    setResult(null)

    if (!testatorName.trim()) { setError('Testator full name is required.'); return }
    if (!executorName.trim()) { setError('Executor name is required.'); return }
    if (beneficiaries.every(b => !b.name.trim())) { setError('Add at least one beneficiary.'); return }

    const now = new Date().toISOString()
    const defaultReview = new Date()
    defaultReview.setFullYear(defaultReview.getFullYear() + 5)
    const expiryISO = reviewDate ? new Date(reviewDate).toISOString() : defaultReview.toISOString()

    const validBenefs = beneficiaries.filter(b => b.name.trim())

    const plainBlocks = [
      { id: 'disclaimer', type: 'paragraph', text: `IMPORTANT: ${DISCLAIMER}` },
      { id: 'h1', type: 'heading', text: `Last Will and Testament of ${testatorName}` },
      { id: 'b1', type: 'paragraph', text: `I, ${testatorName}${testatorDob ? `, born ${testatorDob}` : ''}${testatorAddress ? `, of ${testatorAddress}` : ''}, declare this to be my last will and testament.` },
      { id: 'b2', type: 'paragraph', text: `Executor: ${executorName}${executorContact ? ` (${executorContact})` : ''}` },
      { id: 'h2', type: 'heading', text: 'Beneficiaries' },
      ...validBenefs.map((b, i) => ({
        id: `bene-${i}`,
        type: 'paragraph',
        text: `${b.name} (${b.relationship || 'beneficiary'})${b.share ? `: ${b.share} of estate` : ''}${b.bequest ? ` — Specific bequest: ${b.bequest}` : ''}`,
      })),
      ...(residuary ? [{ id: 'residuary', type: 'paragraph', text: `Residuary estate: ${residuary}` }] : []),
      ...(funeralWishes ? [{ id: 'funeral', type: 'paragraph', text: `Funeral wishes: ${funeralWishes}` }] : []),
      ...(advanceCPR || advanceLifeSupport || organDonation ? [
        { id: 'h-advance', type: 'heading', text: 'Advance Directive' },
        ...(advanceCPR ? [{ id: 'cpr', type: 'paragraph', text: `CPR wishes: ${advanceCPR}` }] : []),
        ...(advanceLifeSupport ? [{ id: 'ls', type: 'paragraph', text: `Life support wishes: ${advanceLifeSupport}` }] : []),
        ...(organDonation ? [{ id: 'od', type: 'paragraph', text: `Organ donation: ${organDonation}` }] : []),
      ] : []),
      { id: 'witnesses', type: 'paragraph', text: `Witnessed by: ${witnesses.filter(w => w.name).map(w => w.name + (w.address ? ` (${w.address})` : '')).join('; ')}` },
    ]

    const doc = {
      format: 'UDS',
      version: '1.0',
      status: 'sealed',
      metadata: {
        title: `Last Will and Testament: ${testatorName}`,
        created: now,
        document_type: 'will',
        classification: 'Confidential',
        testator: testatorName.trim(),
        executor: executorName.trim(),
        expiry: expiryISO,
        review_date: reviewDate || defaultReview.toISOString().split('T')[0],
        audience: ['Testator', 'Executor', 'Beneficiaries'],
        language: 'en',
        disclaimer: DISCLAIMER,
      },
      content: { blocks: plainBlocks },
      languages: {
        en: {
          blocks: [
            { id: 'h-formal', type: 'heading', text: 'LAST WILL AND TESTAMENT' },
            { id: 'p-formal', type: 'paragraph', text: `I, ${testatorName}, being of sound mind, hereby revoke all previous wills and codicils and declare this to be my Last Will and Testament.` },
          ],
        },
      },
      provenance: {
        created: now,
        source: 'ud_will_generator',
        blockchain: `simulated:${now}`,
        expiry: expiryISO,
        disclaimer: DISCLAIMER,
      },
    }

    const blob = new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' })
    const safeName = testatorName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase().slice(0, 40)
    setResult({ url: URL.createObjectURL(blob), name: `will-${safeName}.uds` })
  }

  const inp: React.CSSProperties = { width: '100%', padding: '10px 14px', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ud-ink)', background: '#fff', boxSizing: 'border-box' }
  const lbl: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }
  const card: React.CSSProperties = { padding: '16px 20px', background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius-lg)' }
  const h3s: React.CSSProperties = { fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--ud-ink)', marginBottom: 4 }
  const p13: React.CSSProperties = { fontSize: 13, fontFamily: 'var(--font-body)', color: 'var(--ud-muted)', lineHeight: 1.5, margin: 0 }
  const ready = !!testatorName.trim() && !!executorName.trim() && beneficiaries.some(b => b.name.trim())

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '48px 24px' }}>
      <a href="/" style={{ fontSize: 13, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 32 }}>← All tools</a>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10, flexWrap: 'wrap' }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--ud-ink)', fontFamily: 'var(--font-display)' }}>UD Will</h1>
        <span style={{ fontSize: 13, fontWeight: 600, padding: '3px 10px', borderRadius: 99, background: 'var(--ud-teal-2)', color: 'var(--ud-teal)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Free · 1 basic</span>
      </div>

      <div style={{ padding: '12px 16px', background: 'rgba(226,75,74,0.06)', border: '1px solid rgba(226,75,74,0.2)', borderRadius: 'var(--ud-radius)', fontSize: 13, color: 'var(--ud-danger)', fontFamily: 'var(--font-body)', marginBottom: 16, lineHeight: 1.6 }}>
        ⚠ {DISCLAIMER}
      </div>

      <p style={{ fontSize: 16, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', marginBottom: 8, lineHeight: 1.6 }}>
        Create a structured will or advance directive as a tamper-evident .uds file. Dual audience layers: plain English for family, formal language for legal purposes. Review date embedded as expiry reminder.
      </p>

      <div style={{ fontSize: 13, color: 'var(--ud-teal)', marginBottom: 28, padding: '8px 12px', background: 'var(--ud-teal-2)', border: '1px solid var(--ud-teal)', borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)' }}>
        ✦ Free · 1 basic will — Pro features free during beta
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>
        <div style={{ gridColumn: '1/-1' }}>
          <label style={lbl}>Testator full name *</label>
          <input style={inp} value={testatorName} onChange={e => setTestatorName(e.target.value)} placeholder="Your full legal name" />
        </div>
        <div>
          <label style={lbl}>Date of birth</label>
          <input type="date" style={inp} value={testatorDob} onChange={e => setTestatorDob(e.target.value)} />
        </div>
        <div>
          <label style={lbl}>Review date (default 5 years)</label>
          <input type="date" style={inp} value={reviewDate} onChange={e => setReviewDate(e.target.value)} />
        </div>
        <div style={{ gridColumn: '1/-1' }}>
          <label style={lbl}>Address</label>
          <input style={inp} value={testatorAddress} onChange={e => setTestatorAddress(e.target.value)} placeholder="Your full address" />
        </div>
        <div>
          <label style={lbl}>Executor name *</label>
          <input style={inp} value={executorName} onChange={e => setExecutorName(e.target.value)} placeholder="Person who carries out your will" />
        </div>
        <div>
          <label style={lbl}>Executor contact</label>
          <input style={inp} value={executorContact} onChange={e => setExecutorContact(e.target.value)} placeholder="Email or phone" />
        </div>
      </div>

      <h2 style={{ fontSize: 17, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--ud-ink)', marginBottom: 14 }}>Beneficiaries</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
        {beneficiaries.map(b => (
          <div key={b.id} style={{ ...card, display: 'grid', gridTemplateColumns: '1fr 1fr 100px 1fr auto', gap: 10, alignItems: 'flex-end' }}>
            <div><label style={lbl}>Name</label><input style={inp} value={b.name} onChange={e => updateBenef(b.id, 'name', e.target.value)} placeholder="Full name" /></div>
            <div><label style={lbl}>Relationship</label><input style={inp} value={b.relationship} onChange={e => updateBenef(b.id, 'relationship', e.target.value)} placeholder="Child, spouse…" /></div>
            <div><label style={lbl}>Share</label><input style={inp} value={b.share} onChange={e => updateBenef(b.id, 'share', e.target.value)} placeholder="50%" /></div>
            <div><label style={lbl}>Specific bequest</label><input style={inp} value={b.bequest} onChange={e => updateBenef(b.id, 'bequest', e.target.value)} placeholder="e.g. my gold watch" /></div>
            <button onClick={() => removeBenef(b.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ud-muted)', fontSize: 16, marginBottom: 2 }}>✕</button>
          </div>
        ))}
      </div>
      <button onClick={addBeneficiary} style={{ padding: '8px 18px', border: '1px dashed var(--ud-border)', borderRadius: 'var(--ud-radius)', background: 'none', fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ud-muted)', cursor: 'pointer', marginBottom: 24 }}>+ Add beneficiary</button>

      <div style={{ display: 'grid', gap: 14, marginBottom: 24 }}>
        <div>
          <label style={lbl}>Residuary estate (who gets the remainder)</label>
          <input style={inp} value={residuary} onChange={e => setResiduary(e.target.value)} placeholder="e.g. equally between my children" />
        </div>
        <div>
          <label style={lbl}>Funeral wishes (optional)</label>
          <textarea rows={2} style={{ ...inp, resize: 'vertical' }} value={funeralWishes} onChange={e => setFuneralWishes(e.target.value)} placeholder="Burial, cremation, ceremony preferences…" />
        </div>
      </div>

      <h2 style={{ fontSize: 17, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--ud-ink)', marginBottom: 14 }}>Advance Directive (optional)</h2>
      <div style={{ display: 'grid', gap: 14, marginBottom: 24 }}>
        <div>
          <label style={lbl}>CPR wishes</label>
          <input style={inp} value={advanceCPR} onChange={e => setAdvanceCPR(e.target.value)} placeholder="e.g. Do not resuscitate / Please attempt resuscitation" />
        </div>
        <div>
          <label style={lbl}>Life support wishes</label>
          <input style={inp} value={advanceLifeSupport} onChange={e => setAdvanceLifeSupport(e.target.value)} placeholder="e.g. Do not continue life support if no chance of recovery" />
        </div>
        <div>
          <label style={lbl}>Organ donation</label>
          <input style={inp} value={organDonation} onChange={e => setOrganDonation(e.target.value)} placeholder="e.g. I consent to organ and tissue donation" />
        </div>
      </div>

      <h2 style={{ fontSize: 17, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--ud-ink)', marginBottom: 14 }}>Witnesses</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>
        {witnesses.map((w, i) => (
          <div key={w.id} style={card}>
            <label style={lbl}>Witness {i + 1} name</label>
            <input style={{ ...inp, marginBottom: 10 }} value={w.name} onChange={e => updateWitness(w.id, 'name', e.target.value)} placeholder="Full name" />
            <label style={lbl}>Address</label>
            <input style={inp} value={w.address} onChange={e => updateWitness(w.id, 'address', e.target.value)} placeholder="Full address" />
          </div>
        ))}
      </div>

      {error && (
        <div style={{ padding: '12px 16px', background: 'rgba(226,75,74,0.08)', border: '1px solid rgba(226,75,74,0.2)', borderRadius: 'var(--ud-radius)', fontSize: 13, color: 'var(--ud-danger)', fontFamily: 'var(--font-body)', marginBottom: 20 }}>{error}</div>
      )}

      {result && (
        <div style={{ padding: '14px 18px', background: 'var(--ud-teal-2)', border: '1px solid var(--ud-teal)', borderRadius: 'var(--ud-radius-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ud-teal)', fontFamily: 'var(--font-body)' }}>Will document created ✓</div>
            <div style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)' }}>Sealed · review reminder on expiry date</div>
          </div>
          <a href={result.url} download={result.name} style={{ padding: '10px 18px', background: 'var(--ud-ink)', color: '#fff', fontWeight: 600, fontSize: 13, borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)', textDecoration: 'none', flexShrink: 0 }}>Download .uds →</a>
        </div>
      )}

      <button
        onClick={generate}
        disabled={!ready}
        style={{ width: '100%', padding: '14px', background: !ready ? 'var(--ud-border)' : 'var(--ud-ink)', color: !ready ? 'var(--ud-muted)' : '#fff', border: 'none', borderRadius: 'var(--ud-radius)', fontSize: 15, fontWeight: 600, fontFamily: 'var(--font-body)', cursor: !ready ? 'not-allowed' : 'pointer' }}>
        Generate will document →
      </button>

      {/* Comparison */}
      <div style={{ marginTop: 48, paddingTop: 40, borderTop: '1px solid var(--ud-border)' }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--ud-ink)', marginBottom: 6 }}>How UD Will differs</h2>
        <p style={{ fontSize: 14, fontFamily: 'var(--font-body)', color: 'var(--ud-muted)', marginBottom: 20, lineHeight: 1.6 }}>This tool creates a starting point — not a legally executed will. It exists because most people have no will at all.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
          {[
            { icon: '📄', title: 'Paper will', body: 'No tamper evidence. Can be lost, damaged, or altered. No reminder when review is due.' },
            { icon: '📋', title: 'PDF will templates', body: 'Static. No version control. No expiry reminder. No dual-audience layers for family vs. legal.' },
            { icon: '💰', title: 'LegalZoom', body: '$89–99, US-only. Requires account. No blockchain provenance.' },
            { icon: '📜', title: 'UD Will', body: 'Free basic. Tamper-evident. Blockchain timestamp. Review expiry reminder. Plain English + formal layers.' },
          ].map(item => (
            <div key={item.title} style={{ ...card, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 20, lineHeight: '1', flexShrink: 0, marginTop: 2 }}>{item.icon}</span>
              <div><div style={h3s}>{item.title}</div><p style={p13}>{item.body}</p></div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 40, padding: '16px', background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', fontSize: 13, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', textAlign: 'center' }}>
        Runs in your browser. No data stored. Part of the <a href="https://ud.hive.baby" style={{ color: 'var(--ud-teal)' }}>Universal Document™</a> ecosystem.
      </div>

      <TooltipTour engineId="will" tips={tourSteps['will']} />
    </div>
  )
}
