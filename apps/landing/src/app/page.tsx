'use client'
import { useState } from 'react'
import LifecycleAnimation from '@/components/LifecycleAnimation'
import TooltipTour from '@/components/TooltipTour'

const TOOLS = [
  { name: 'UD Converter',  desc: 'Turn any file into UDS. DOCX, TXT, MD, CSV — instant.',               url: 'https://converter.hive.baby',       status: 'live', icon: '📄' },
  { name: 'UD Reader',     desc: 'Open and read any .uds or .udr file. Clarity layers, metadata.',       url: 'https://reader.hive.baby',          status: 'live', icon: '📖' },
  { name: 'UD Creator',    desc: 'Write a Universal Document™ from scratch. Rich text, metadata, expiry.', url: 'https://creator.hive.baby',       status: 'live', icon: '✏️' },
  { name: 'UD Validator',  desc: 'Verify schema, expiry, signatures, chain-of-custody.',                 url: 'https://validator.hive.baby',       status: 'live', icon: '✅' },
  { name: 'UD Utilities',  desc: 'Merge, split, compress, OCR, protect, watermark, compare, redact.',    url: 'https://utilities.hive.baby',       status: 'live', icon: '🔧' },
  { name: 'UD Signer',     desc: 'Governed signing with legal-grade audit trails.',                      url: 'https://signer.hive.baby',          status: 'live', icon: '🔏' },
  { name: 'iSDK',          desc: 'Embed Universal Document™ read/render in any device or app. Free. Under 400KB.', url: 'https://ud.hive.baby/isdk', status: 'live', icon: '⚡' },
  { name: 'cSDK',          desc: 'API access to creation, conversion, signing, and validation. For builders.', url: 'https://ud.hive.baby/csdk',    status: 'live', icon: '🛠' },
  { name: 'White Paper',   desc: 'Universal Document™ Standard 1.0 — the specification. CC BY 4.0.',    url: 'https://ud.hive.baby/whitepaper',   status: 'live', icon: '📃' },
]

const QUICK_LINKS = [
  { label: 'Utilities',   href: 'https://utilities.hive.baby' },
  { label: 'Creator',     href: 'https://creator.hive.baby' },
  { label: 'Signer',      href: 'https://signer.hive.baby' },
  { label: 'iSDK',        href: 'https://ud.hive.baby/isdk' },
  { label: 'cSDK',        href: 'https://ud.hive.baby/csdk' },
  { label: 'White Paper', href: 'https://ud.hive.baby/whitepaper' },
]

const FEATURES = [
  { icon: '🧠', title: 'AI-native',       desc: 'Every block carries provenance, context, and structured metadata. AI reads it natively.' },
  { icon: '⏳', title: 'Expiring',         desc: 'Documents expire or are revoked. No more zombie PDFs circulating after supersession.' },
  { icon: '🌍', title: 'Multilingual',     desc: 'One document, every language. The MLLR handles translation at block level.' },
  { icon: '🔗', title: 'Chain of custody', desc: 'Every edit, every signature, every view is traceable. Legal-grade provenance built in.' },
  { icon: '👁', title: 'Clarity layers',   desc: 'The same document speaks differently to a clinician, a patient, and a regulator.' },
  { icon: '🔒', title: 'Controlled',       desc: 'Copy, print, and export permissions set at document level — not at platform level.' },
]

const LIFECYCLE_LEGACY = [
  { label: 'Any file',     sub: 'PDF · DOCX · TXT',   color: 'var(--ud-muted)' },
  { label: 'UD Converter', sub: 'cleans & transforms', color: 'var(--ud-ink)' },
  { label: 'UDS',          sub: 'legacy · sealed',     color: 'var(--ud-ink)' },
]

const LIFECYCLE_NATIVE = [
  { label: 'UD Creator',   sub: 'write from scratch',  color: '#3b82f6' },
  { label: 'UDR',          sub: 'editable · blue',     color: '#3b82f6' },
  { label: 'UD Creator',   sub: 'publish / seal',      color: '#3b82f6' },
  { label: 'Pure UDS',     sub: 'native · sealed',     color: 'var(--ud-ink)' },
]

const INSTITUTIONS = [
  { label: 'Government',        title: 'Policy & legislation',   desc: 'Versioned, multilingual, expiring. Every amendment traceable.' },
  { label: 'Healthcare',        title: 'Clinical records',       desc: 'Clinician-grade and patient-grade clarity layers. Revoked when superseded.' },
  { label: 'Legal & corporate', title: 'Contracts & compliance', desc: 'Signed, timestamped, chain-of-custody. Expiry built in.' },
  { label: 'Education',         title: 'Adaptive content',       desc: 'Same document, adapted for age, language, and reading level.' },
]

const divider = { border: 'none', borderTop: '1px solid var(--ud-border)', margin: '0 24px' } as React.CSSProperties
const sectionLabel = { fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase' as const, color: 'var(--ud-muted)', marginBottom: 32, textAlign: 'center' as const }

export default function LandingPage() {
  const [activeStep, setActiveStep] = useState<string | null>(null)

  return (
    <div style={{ background: 'var(--ud-paper)', minHeight: '100vh', color: 'var(--ud-ink)' }}>

      {/* Hero */}
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '80px 24px 64px', textAlign: 'center' }}>
        <img src="/icons/ud-mark-uds.png" width={120} height={120} alt="Universal Document" style={{ display: 'block', margin: '0 auto 32px', borderRadius: 8 }} />
        <div style={{
          display: 'inline-block', fontSize: 13, fontWeight: 600, letterSpacing: '0.12em',
          textTransform: 'uppercase', padding: '4px 14px', borderRadius: 20, marginBottom: 28,
          background: 'var(--ud-gold-3)', border: '1px solid rgba(200,150,10,0.3)', color: 'var(--ud-gold)',
          fontFamily: 'var(--font-mono)',
        }}>Universal Document™ Standard 1.0 · Open format</div>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: 'clamp(36px, 6vw, 60px)', fontWeight: 700,
          letterSpacing: '-0.02em', color: 'var(--ud-ink)', lineHeight: 1.15, marginBottom: 24,
        }}>
          Universal Document™<br />
          <span style={{ color: 'var(--ud-gold)' }}>For a universal world.</span>
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 18, color: 'var(--ud-muted)', maxWidth: 520, margin: '0 auto 40px', lineHeight: 1.7 }}>
          Convert anything. Read everything. Edit intelligently. The world's first clarity-native document format.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="https://converter.hive.baby" style={{
            display: 'inline-block', padding: '13px 28px', background: 'var(--ud-ink)', color: '#fff',
            fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 14, borderRadius: 8, textDecoration: 'none',
            boxShadow: '0 2px 12px rgba(30,45,61,0.2)',
          }}>Try UD Converter — Free →</a>
          <a href="https://reader.hive.baby" style={{
            display: 'inline-block', padding: '13px 28px', background: 'transparent', color: 'var(--ud-ink)',
            fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 14, borderRadius: 8, textDecoration: 'none',
            border: '1px solid var(--ud-border)',
          }}>Open a document</a>
        </div>
        {/* Quick ecosystem links */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginTop: 20 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ud-muted)', alignSelf: 'center', letterSpacing: '0.04em' }}>Also:</span>
          {QUICK_LINKS.map(l => (
            <a key={l.href} href={l.href} style={{
              fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ud-muted)',
              textDecoration: 'none', padding: '4px 10px',
              border: '1px solid var(--ud-border)', borderRadius: 20,
              transition: 'color 0.15s, border-color 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--ud-ink)'; e.currentTarget.style.borderColor = 'var(--ud-ink)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--ud-muted)'; e.currentTarget.style.borderColor = 'var(--ud-border)' }}
            >{l.label}</a>
          ))}
        </div>
      </div>

      <hr style={divider} />

      {/* Lifecycle Animation */}
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '48px 24px' }}>
        <p style={sectionLabel}>How it works</p>
        <LifecycleAnimation autoPlay={true} />
      </div>

      <hr style={divider} />

      {/* The Problem */}
      <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center', padding: '48px 24px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--ud-ink)', marginBottom: 20, letterSpacing: '-0.02em' }}>PDFs are messy. DOCX files break.</h2>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, color: 'var(--ud-muted)', lineHeight: 1.8 }}>
          Legacy formats were not built for a global, multilingual, AI-native world.<br />
          They do not expire. They do not adapt. They do not prove who touched them.<br />
          Universal Document™ fixes all of that.
        </p>
      </div>

      <hr style={divider} />

      {/* Lifecycle flow */}
      <section style={{ maxWidth: 960, margin: '0 auto', padding: '56px 24px' }}>
        <p style={sectionLabel}>The UD Lifecycle</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
          {[
            { key: 'legacy', label: 'Legacy', steps: LIFECYCLE_LEGACY },
            { key: 'native', label: 'Native', steps: LIFECYCLE_NATIVE },
          ].map(({ key, label, steps }) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center', gap: 0 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ud-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' as const, width: 56, textAlign: 'right' as const, marginRight: 16, flexShrink: 0 }}>{label}</span>
              {steps.map((step, i) => (
                <div key={`${key}-${i}`} style={{ display: 'flex', alignItems: 'center' }}>
                  <div
                    onMouseEnter={() => setActiveStep(`${key}-${i}`)}
                    onMouseLeave={() => setActiveStep(null)}
                    style={{
                      padding: '12px 16px',
                      background: activeStep === `${key}-${i}` ? step.color : 'var(--ud-paper-2)',
                      border: `1px solid ${activeStep === `${key}-${i}` ? step.color : 'var(--ud-border)'}`,
                      borderRadius: 10, textAlign: 'center', cursor: 'default',
                      transition: 'all 0.2s', minWidth: 80,
                    }}
                  >
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 700, color: activeStep === `${key}-${i}` ? '#fff' : 'var(--ud-ink)', marginBottom: 2 }}>{step.label}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: activeStep === `${key}-${i}` ? 'rgba(255,255,255,0.7)' : 'var(--ud-muted)' }}>{step.sub}</div>
                  </div>
                  {i < steps.length - 1 && (
                    <div style={{ width: 20, height: 1, background: 'var(--ud-border-2)', margin: '0 2px', position: 'relative' }}>
                      <div style={{ position: 'absolute', right: -4, top: -4, width: 0, height: 0, borderTop: '4px solid transparent', borderBottom: '4px solid transparent', borderLeft: '6px solid var(--ud-border-2)' }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ud-muted)', marginTop: 8, textAlign: 'center' }}>
            UD Reader opens all UDS &amp; UDR files — it is not a conversion step
          </p>
        </div>
        <p style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ud-muted)', marginTop: 20 }}>
          Every UDS spreads the ecosystem · Every UDR builds the ecosystem · Every user becomes a node
        </p>
      </section>

      <hr style={divider} />

      {/* UDS vs UDR */}
      <section style={{ maxWidth: 960, margin: '0 auto', padding: '56px 24px' }}>
        <p style={sectionLabel}>Two formats. One ecosystem.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
          <div style={{ background: '#dbeafe', border: '1px solid #93c5fd', borderRadius: 14, padding: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <img src="/icons/udr.svg" width={36} height={44} alt="UDR" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--ud-ink)' }}>UDR — Universal Document™ Revisable</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: '#3b82f6' }}>Revisable &amp; Reviewable (Mutable/Editable)</div>
              </div>
            </div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ud-muted)', lineHeight: 1.7, marginBottom: 14 }}>
              The working format. Editable, structured, intelligent. Full sidebar: sections, metadata, permissions, versioning.
            </p>
            {['Section-level editing', 'Metadata management', 'Permission control', 'Version history', 'Export to UDS'].map(f => (
              <div key={f} style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ud-ink)', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ color: '#3b82f6', fontWeight: 700 }}>✓</span> {f}
              </div>
            ))}
          </div>
          <div style={{ background: 'var(--ud-ink)', borderRadius: 14, padding: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <img src="/icons/uds.svg" width={36} height={44} alt="UDS" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: '#fff' }}>UDS — Universal Document™ Sealed</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>Secured &amp; Sealed (Immutable)</div>
              </div>
            </div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, marginBottom: 14 }}>
              The final, sealed form. Structured, clarity-layered, and perfect for reading. Cannot be edited — only superseded.
            </p>
            {['Permanent hash', 'Chain of custody', 'Clarity layers', 'Multilingual ribbons', 'Expiry control'].map(f => (
              <div key={f} style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ color: 'var(--ud-gold)', fontWeight: 700 }}>✓</span> {f}
              </div>
            ))}
          </div>
        </div>
      </section>

      <hr style={divider} />

      {/* Ecosystem */}
      <section style={{ maxWidth: 960, margin: '0 auto', padding: '56px 24px' }}>
        <p style={sectionLabel}>UD Ecosystem</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {TOOLS.map(tool => (
            <a key={tool.name} href={tool.url} style={{
              display: 'block', textDecoration: 'none',
              background: '#fff', border: '0.5px solid var(--ud-border)',
              borderRadius: 12, padding: 20, boxShadow: 'var(--ud-shadow)',
            }}>
              <div style={{ fontSize: 24, marginBottom: 10 }}>{tool.icon}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--ud-ink)', marginBottom: 6 }}>{tool.name}</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ud-muted)', lineHeight: 1.5, marginBottom: 12 }}>{tool.desc}</div>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, letterSpacing: '0.08em',
                textTransform: 'uppercase', padding: '2px 8px', borderRadius: 8,
                background: 'var(--ud-gold-3)', color: 'var(--ud-gold)',
              }}>● Live</span>
            </a>
          ))}
        </div>
      </section>

      <hr style={divider} />

      {/* Features */}
      <section style={{ maxWidth: 960, margin: '0 auto', padding: '56px 24px' }}>
        <p style={sectionLabel}>Why Universal Document™</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {FEATURES.map(f => (
            <div key={f.title} style={{ background: '#fff', border: '0.5px solid var(--ud-border)', borderRadius: 12, padding: 24, boxShadow: 'var(--ud-shadow)' }}>
              <div style={{ fontSize: 24, marginBottom: 12 }}>{f.icon}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--ud-ink)', marginBottom: 8 }}>{f.title}</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ud-muted)', lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <hr style={divider} />

      {/* For institutions */}
      <section style={{ maxWidth: 960, margin: '0 auto', padding: '56px 24px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700, color: 'var(--ud-ink)', marginBottom: 16, letterSpacing: '-0.02em' }}>Built for institutions.</h2>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--ud-muted)', marginBottom: 40, maxWidth: 560, margin: '0 auto 40px', lineHeight: 1.7 }}>
          Governments, healthcare systems, legal firms, enterprises — anyone who needs documents to be intelligent, traceable, and controlled.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, textAlign: 'left', maxWidth: 800, margin: '0 auto' }}>
          {INSTITUTIONS.map(card => (
            <div key={card.label} style={{ background: '#fff', border: '0.5px solid var(--ud-border)', borderRadius: 12, padding: 20, boxShadow: 'var(--ud-shadow)' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ud-gold)', marginBottom: 8 }}>{card.label}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--ud-ink)', marginBottom: 8 }}>{card.title}</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ud-muted)', lineHeight: 1.5 }}>{card.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <hr style={divider} />

      {/* SEO comparison section */}
      <section style={{ maxWidth: 860, margin: '0 auto', padding: '48px 24px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 700, color: 'var(--ud-ink)', marginBottom: '0.5rem' }}>How Universal Document™ differs from PDF, DOCX, and JSON</h2>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--ud-muted)', marginBottom: '1.5rem', lineHeight: 1.6 }}>Each existing format was optimised for one purpose. PDF for print, DOCX for editing, JSON for data transfer. Universal Document™ was designed to handle all three at once — with provenance, expiry, and AI-readability built in from the start.</p>
        <div style={{ display: 'grid', gap: '1rem' }}>
          {[
            { title: 'PDF — excellent for print, opaque to machines', body: 'PDF captures layout perfectly. But extract the text, and you lose structure. A heading is indistinguishable from bold body text. A table is a grid of positioned characters. AI systems must guess semantic structure from visual heuristics — an inherently fragile process.' },
            { title: 'DOCX — editable but not portable', body: 'DOCX has heading styles and paragraph structure, but no provenance, no expiry, no tamper-evidence, and wildly inconsistent rendering across applications. It\'s a working format — not an archival one, and not one you\'d trust for legal, clinical, or regulatory purposes.' },
            { title: 'Universal Document™ — semantic structure as a first-class feature', body: '.uds files define their own sections with typed headings, body paragraphs, metadata blocks, and code regions. Any compliant implementation can parse the structure without rendering it. AI can work directly on the section graph rather than reconstructing it from visual layout.' },
            { title: 'Universal Document™ — provenance, expiry, and signing built in', body: 'Every .uds file optionally carries: who created it, when, with what version of what tool; an expiry date after which it should be re-validated; and a cryptographic hash for tamper-evidence via .udsig. These are not bolted on — they are part of the base format specification.' },
          ].map(card => (
            <div key={card.title} style={{ background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)', borderRadius: '0.75rem', padding: '1.25rem' }}>
              <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--ud-ink)', fontFamily: 'var(--font-body)', marginBottom: '0.4rem' }}>{card.title}</div>
              <div style={{ fontSize: '0.83rem', color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', lineHeight: 1.6 }}>{card.body}</div>
            </div>
          ))}
        </div>
      </section>

      <hr style={divider} />

      {/* Try a demo file */}
      <section style={{ maxWidth: 760, margin: '0 auto', padding: '56px 24px', textAlign: 'center' }}>
        <p style={sectionLabel}>Try a demo file</p>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--ud-muted)', maxWidth: 520, margin: '0 auto 32px', lineHeight: 1.7 }}>
          Download a sample .uds file and open it in UD Reader to see clarity layers, metadata, expiry, and tamper detection in action.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12, textAlign: 'left', marginBottom: 20 }}>
          {[
            { file: 'pharmacy-prescription.uds', icon: '💊', label: 'Pharmacy Prescription', desc: 'Multilingual (EN/ES/AR) · Confidential · Expiring · Patient + Pharmacist clarity layers' },
            { file: 'clinical-consent.uds',      icon: '🏥', label: 'Surgical Consent Form', desc: 'EN/FR · Patient plain-English layer + Clinician medical-detail layer · Revocable' },
            { file: 'legal-contract.uds',        icon: '📋', label: 'NDA — Acme Corp & Beta Ltd', desc: 'England & Wales · 2-year term · Confidential · Signed by two parties' },
            { file: 'tampered-contract.uds',     icon: '⚠️', label: 'Tampered Contract (try validating)', desc: 'Same NDA — content altered after sealing. Hash mismatch. Open in UD Validator to see FAIL.' },
          ].map(({ file, icon, label, desc }) => (
            <a
              key={file}
              href={`/demos/${file}`}
              download={file}
              style={{
                display: 'block', textDecoration: 'none',
                background: '#fff', border: '0.5px solid var(--ud-border)',
                borderRadius: 12, padding: '18px 20px', boxShadow: 'var(--ud-shadow)',
              }}
            >
              <div style={{ fontSize: 22, marginBottom: 8 }}>{icon}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: 'var(--ud-ink)', marginBottom: 4 }}>{label}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ud-muted)', lineHeight: 1.5, marginBottom: 10 }}>{desc}</div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ud-gold)', fontWeight: 600 }}>↓ {file}</span>
            </a>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="https://reader.hive.baby" style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ud-muted)', textDecoration: 'none', padding: '8px 16px', border: '1px solid var(--ud-border)', borderRadius: 8 }}>Open in UD Reader →</a>
          <a href="https://validator.hive.baby" style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ud-muted)', textDecoration: 'none', padding: '8px 16px', border: '1px solid var(--ud-border)', borderRadius: 8 }}>Validate in UD Validator →</a>
        </div>
      </section>

      <hr style={divider} />

      {/* Open */}
      <section style={{ maxWidth: 640, margin: '0 auto', padding: '56px 24px', textAlign: 'center' }}>
        <p style={{ ...sectionLabel, marginBottom: 16 }}>Open. Free. Yours.</p>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--ud-muted)', lineHeight: 1.8, marginBottom: 28 }}>
          The Universal Document™ specification is open. The reader SDK is free. UD is built by Hive and stays free because of the people who choose to support it.
        </p>
        <a href="https://hive.baby/patrons" style={{
          display: 'inline-block', padding: '13px 28px', background: 'transparent', color: 'var(--ud-ink)',
          fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 14, borderRadius: 8, textDecoration: 'none',
          border: '1px solid var(--ud-border)',
        }}>View patrons →</a>
      </section>

      <TooltipTour engineId="ud-landing" tips={[
        { label: 'What is .uds?', text: 'A sealed, tamper-evident document. Signed with a cryptographic hash. Readable offline. Expires automatically. No platform required.' },
        { label: 'What is .udr?', text: 'The editable draft format. Write and revise in UD Creator. Seal to .uds when ready. Full version history built in.' },
        { label: 'UD Ecosystem', text: 'Six free tools: Converter turns any file into .uds. Reader opens them. Creator writes them. Validator checks them. Utilities transforms them. Signer signs them.' },
        { label: 'Try a demo file', text: 'Scroll down to "Try a demo file" — download a sample .uds and open it in UD Reader to see clarity layers, expiry detection, and tamper-evidence in action.' },
      ]} />
    </div>
  )
}
