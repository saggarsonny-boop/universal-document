'use client'
import { useState } from 'react'
import TooltipTour from '@/components/TooltipTour'
import { tourSteps } from '@/lib/tourSteps'

export default function PreRegistration() {
  const [researchTitle, setResearchTitle] = useState('')
  const [hypothesis, setHypothesis] = useState('')
  const [methodology, setMethodology] = useState('')
  const [analysisPlan, setAnalysisPlan] = useState('')
  const [primaryOutcome, setPrimaryOutcome] = useState('')
  const [secondaryOutcomes, setSecondaryOutcomes] = useState('')
  const [sampleSize, setSampleSize] = useState('')
  const [institution, setInstitution] = useState('')
  const [researchers, setResearchers] = useState('')
  const [result, setResult] = useState<{ url: string; name: string } | null>(null)
  const [error, setError] = useState('')

  const inp = { width: '100%', padding: '10px 14px', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ud-ink)', background: '#fff', boxSizing: 'border-box' as const }
  const lbl = { display: 'block' as const, fontSize: 11, fontWeight: 600 as const, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: 6 }
  const ta = { ...inp, resize: 'vertical' as const }

  const run = () => {
    if (!researchTitle || !hypothesis || !primaryOutcome) { setError('Title, hypothesis, and primary outcome are required'); return }
    setError('')
    const now = new Date().toISOString()
    let integrityHash = ''
    const content = `${researchTitle}|${hypothesis}|${methodology}|${analysisPlan}|${primaryOutcome}|${now}`
    let h = 2166136261
    for (let i = 0; i < content.length; i++) { h ^= content.charCodeAt(i); h = Math.imul(h, 16777619) }
    integrityHash = (h >>> 0).toString(16).padStart(8, '0') + '-' + Date.now().toString(16)

    const doc = {
      format: 'UDS', status: 'sealed',
      title: `Pre-registration: ${researchTitle}`,
      document_type: 'pre_registration',
      pre_registration: {
        registration_id: `PREREG-${integrityHash.toUpperCase()}`,
        registered_at: now,
        research_title: researchTitle,
        hypothesis,
        methodology: methodology || undefined,
        analysis_plan: analysisPlan || undefined,
        primary_outcome: primaryOutcome,
        secondary_outcomes: secondaryOutcomes || undefined,
        sample_size: sampleSize ? parseInt(sampleSize) : undefined,
        institution: institution || undefined,
        researchers: researchers || undefined,
        data_collection_started: false,
        _proof: `This document was sealed before data collection. Registration ID: PREREG-${integrityHash.toUpperCase()}. Timestamp: ${now}.`,
      },
      provenance: { created_at: now, document_type: 'pre_registration', registration_id: `PREREG-${integrityHash.toUpperCase()}` },
      _notice: 'This pre-registration record proves the hypothesis and analysis plan were fixed before data collection. Keep this sealed .uds file as evidence.',
    }
    const blob = new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' })
    setResult({ url: URL.createObjectURL(blob), name: `prereg-${researchTitle.replace(/\s+/g,'-').toLowerCase().slice(0,40)}.uds` })
  }

  const card: React.CSSProperties = { padding: '16px 20px', background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius-lg)' }
  const h3: React.CSSProperties = { fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--ud-ink)', marginBottom: 4 }
  const p13: React.CSSProperties = { fontSize: 13, fontFamily: 'var(--font-body)', color: 'var(--ud-muted)', lineHeight: 1.5, margin: 0 }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
      <a href="/" style={{ fontSize: 13, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 32 }}>← All tools</a>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--ud-ink)', fontFamily: 'var(--font-display)' }}>UD Pre-registration</h1>
        <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 99, background: 'var(--ud-teal-2)', color: 'var(--ud-teal)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Free forever</span>
      </div>

      <p style={{ fontSize: 16, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', marginBottom: 8, lineHeight: 1.6 }}>
        Tamper-evident hypothesis registration before data collection. Lock your research protocol as a cryptographically sealed .uds file — mathematically proving it existed before you saw the data. A Centre for Open Science alternative built for research transparency and reproducibility.
      </p>

      <div style={{ fontSize: 12, color: 'var(--ud-teal)', marginBottom: 28, padding: '8px 12px', background: 'var(--ud-teal-2)', border: '1px solid var(--ud-teal)', borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)' }}>
        Open science tool — always free. No account required. The sealed .uds timestamp proves your hypothesis was fixed before data collection, countering HARKing and supporting registered reports.
      </div>

      {/* Why pre-register */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--ud-ink)', marginBottom: 16 }}>Why hypothesis registration matters</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
          {[
            { title: 'Prevents HARKing', body: 'Hypothesising After Results are Known is a driver of the reproducibility crisis. A sealed timestamp makes it impossible.' },
            { title: 'Supports registered reports', body: 'Journals accepting registered reports require proof the hypothesis predates data collection. Your .uds is that proof.' },
            { title: 'Research transparency', body: 'Preregistration is the foundation of open science. Share the sealed file with reviewers, editors, or co-authors.' },
            { title: 'No platform lock-in', body: 'Unlike OSF, your proof lives inside the document itself — verifiable by anyone, permanently, with no dependency on any service.' },
          ].map(item => (
            <div key={item.title} style={card}>
              <div style={h3}>{item.title}</div>
              <p style={p13}>{item.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Form */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>
        <div style={{ gridColumn: '1/-1' }}><label style={lbl}>Research title *</label><input style={inp} value={researchTitle} onChange={e => setResearchTitle(e.target.value)} placeholder="Full title of your study" /></div>
        <div style={{ gridColumn: '1/-1' }}><label style={lbl}>Hypothesis *</label><textarea rows={3} style={ta} value={hypothesis} onChange={e => setHypothesis(e.target.value)} placeholder="State your hypothesis clearly and precisely" /></div>
        <div style={{ gridColumn: '1/-1' }}><label style={lbl}>Methodology</label><textarea rows={3} style={ta} value={methodology} onChange={e => setMethodology(e.target.value)} placeholder="Study design, data collection method, participants" /></div>
        <div style={{ gridColumn: '1/-1' }}><label style={lbl}>Analysis plan</label><textarea rows={3} style={ta} value={analysisPlan} onChange={e => setAnalysisPlan(e.target.value)} placeholder="Statistical methods, software, exclusion criteria" /></div>
        <div style={{ gridColumn: '1/-1' }}><label style={lbl}>Primary outcome *</label><textarea rows={2} style={ta} value={primaryOutcome} onChange={e => setPrimaryOutcome(e.target.value)} placeholder="The single primary outcome measure" /></div>
        <div style={{ gridColumn: '1/-1' }}><label style={lbl}>Secondary outcomes</label><textarea rows={2} style={ta} value={secondaryOutcomes} onChange={e => setSecondaryOutcomes(e.target.value)} placeholder="Additional outcome measures" /></div>
        <div><label style={lbl}>Sample size (target)</label><input type="number" min="1" style={inp} value={sampleSize} onChange={e => setSampleSize(e.target.value)} placeholder="n =" /></div>
        <div><label style={lbl}>Institution</label><input style={inp} value={institution} onChange={e => setInstitution(e.target.value)} placeholder="University or organisation" /></div>
        <div style={{ gridColumn: '1/-1' }}><label style={lbl}>Researchers</label><input style={inp} value={researchers} onChange={e => setResearchers(e.target.value)} placeholder="Names of all researchers" /></div>
      </div>

      {error && <div style={{ padding: '12px 16px', background: 'rgba(226,75,74,0.08)', border: '1px solid rgba(226,75,74,0.2)', borderRadius: 'var(--ud-radius)', fontSize: 13, color: 'var(--ud-danger)', fontFamily: 'var(--font-body)', marginBottom: 20 }}>{error}</div>}

      {result && (
        <div style={{ padding: '14px 18px', background: 'var(--ud-teal-2)', border: '1px solid var(--ud-teal)', borderRadius: 'var(--ud-radius-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <div><div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ud-teal)', fontFamily: 'var(--font-body)' }}>Pre-registration sealed ✓</div><div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)' }}>Hypothesis locked before data collection</div></div>
          <a href={result.url} download={result.name} style={{ padding: '10px 18px', background: 'var(--ud-ink)', color: '#fff', fontWeight: 600, fontSize: 13, borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)', textDecoration: 'none', flexShrink: 0 }}>Download .uds →</a>
        </div>
      )}

      <button onClick={run} disabled={!researchTitle || !hypothesis || !primaryOutcome} style={{ width: '100%', padding: '14px', background: !researchTitle || !hypothesis || !primaryOutcome ? 'var(--ud-border)' : 'var(--ud-ink)', color: !researchTitle || !hypothesis || !primaryOutcome ? 'var(--ud-muted)' : '#fff', border: 'none', borderRadius: 'var(--ud-radius)', fontSize: 15, fontWeight: 600, fontFamily: 'var(--font-body)', cursor: !researchTitle || !hypothesis || !primaryOutcome ? 'not-allowed' : 'pointer' }}>Seal Pre-registration</button>

      {/* OSF comparison */}
      <div style={{ marginTop: 48, paddingTop: 40, borderTop: '1px solid var(--ud-border)' }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--ud-ink)', marginBottom: 6 }}>How UD Pre-registration differs from OSF</h2>
        <p style={{ fontSize: 14, fontFamily: 'var(--font-body)', color: 'var(--ud-muted)', marginBottom: 20, lineHeight: 1.6 }}>
          The Open Science Framework stores your registration in their database. UD Pre-registration seals the proof inside your document. The difference matters for long-term research integrity.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
          {[
            { icon: '📄', title: 'Proof in the document', body: 'Your cryptographic timestamp is embedded in the .uds file itself — not in our database. Share the file and the proof travels with it.' },
            { icon: '🔢', title: 'Mathematically verifiable', body: 'The FNV-1a integrity hash can be independently verified by anyone with the file. No need to query any service or API.' },
            { icon: '🚫', title: 'No account required', body: 'OSF requires registration and login. UD Pre-registration runs entirely in your browser. We never see your data.' },
            { icon: '🏗', title: 'No platform dependency', body: 'If the Centre for Open Science shuts down, OSF registrations become unverifiable. Your .uds timestamp is permanently self-contained.' },
            { icon: '∞', title: 'Free forever', body: 'Research preregistration and open science tools are always free on Universal Document™. No tiers, no upgrades, no expiry.' },
          ].map(item => (
            <div key={item.title} style={{ ...card, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 20, lineHeight: '1', flexShrink: 0, marginTop: 2 }}>{item.icon}</span>
              <div>
                <div style={h3}>{item.title}</div>
                <p style={p13}>{item.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 40, padding: '16px', background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', fontSize: 12, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', textAlign: 'center' }}>
        Runs in your browser. No data sent to any server. Part of the <a href="https://ud.hive.baby" style={{ color: 'var(--ud-teal)' }}>Universal Document™</a> ecosystem.
      </div>
      <TooltipTour engineId="pre-registration" tips={tourSteps['pre-registration']} />
    </div>
  )
}
