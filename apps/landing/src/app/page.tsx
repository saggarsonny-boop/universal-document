'use client'
import { useState } from 'react'
import LifecycleAnimation from '@/components/LifecycleAnimation'

const TOOLS = [
  { name: 'UD Converter',  desc: 'Turn any file into UDS. DOCX, TXT, MD, CSV — instant.',               url: 'https://converter.hive.baby',  status: 'live', icon: '📄' },
  { name: 'UD Reader',     desc: 'Open and read any .uds or .udr file. Clarity layers, metadata.',       url: 'https://reader.hive.baby',     status: 'live', icon: '📖' },
  { name: 'UD Creator',    desc: 'Write a Universal Document™ from scratch. Rich text, metadata, expiry.', url: 'https://creator.hive.baby',    status: 'live', icon: '✏️' },
  { name: 'UD Validator',  desc: 'Verify schema, expiry, signatures, chain-of-custody.',                 url: 'https://validator.hive.baby',  status: 'live', icon: '✅' },
  { name: 'UD Utilities',  desc: 'Merge, split, compress, OCR, protect, watermark, compare, redact.',    url: 'https://utilities.hive.baby',  status: 'live', icon: '🔧' },
  { name: 'UD Signer',     desc: 'Governed signing with legal-grade audit trails.',                      url: 'https://signer.hive.baby',     status: 'live', icon: '🔏' },
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
const sectionLabel = { fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase' as const, color: 'var(--ud-muted)', marginBottom: 32, textAlign: 'center' as const }

export default function LandingPage() {
  const [activeStep, setActiveStep] = useState<string | null>(null)

  return (
    <div style={{ background: 'var(--ud-paper)', minHeight: '100vh', color: 'var(--ud-ink)' }}>

      {/* Hero */}
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '80px 24px 64px', textAlign: 'center' }}>
        <img src="/icons/ud-mark-uds.png" width={120} height={120} alt="Universal Document" style={{ display: 'block', margin: '0 auto 32px', borderRadius: 8 }} />
        <div style={{
          display: 'inline-block', fontSize: 11, fontWeight: 600, letterSpacing: '0.12em',
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
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ud-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' as const, width: 56, textAlign: 'right' as const, marginRight: 16, flexShrink: 0 }}>{label}</span>
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
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: activeStep === `${key}-${i}` ? 'rgba(255,255,255,0.7)' : 'var(--ud-muted)' }}>{step.sub}</div>
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
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ud-muted)', marginTop: 8, textAlign: 'center' }}>
            UD Reader opens all UDS &amp; UDR files — it is not a conversion step
          </p>
        </div>
        <p style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ud-muted)', marginTop: 20 }}>
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
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#3b82f6' }}>Revisable &amp; Reviewable (Mutable/Editable)</div>
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
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Secured &amp; Sealed (Immutable)</div>
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
                fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
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
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ud-gold)', marginBottom: 8 }}>{card.label}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--ud-ink)', marginBottom: 8 }}>{card.title}</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--ud-muted)', lineHeight: 1.5 }}>{card.desc}</div>
            </div>
          ))}
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

    </div>
  )
}
