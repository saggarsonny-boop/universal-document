'use client'
import { useState } from 'react'
import LifecycleAnimation from '@/components/LifecycleAnimation'

const TOOLS = [
  { name: 'UD Converter', desc: 'Turn any file into UDS. DOCX, TXT, MD, CSV — instant.', url: 'https://converter.hive.baby', status: 'live', icon: '📄' },
  { name: 'UD Reader', desc: 'Open and read any UDS file. Clarity layers, metadata, permissions.', url: 'https://universal-document.vercel.app/reader', status: 'live', icon: '📖' },
  { name: 'UD Utilities', desc: 'Merge, split, compress, OCR, protect, watermark, compare, redact.', url: 'https://udutilities.hive.baby', status: 'live', icon: '🔧' },
  { name: 'UD Creator', desc: 'Write a Universal Document from scratch.', url: null, status: 'soon', icon: '✏️' },
  { name: 'UD Validator', desc: 'Verify schema, expiry, signatures, chain-of-custody.', url: null, status: 'soon', icon: '✅' },
  { name: 'UD Signer', desc: 'Governed signing with legal-grade audit trails.', url: null, status: 'coming', icon: '🔏' },
]

const FEATURES = [
  { icon: '🧠', title: 'AI-native', desc: 'Every block carries provenance, context, and structured metadata. AI reads it natively.' },
  { icon: '⏳', title: 'Expiring', desc: 'Documents expire or are revoked. No more zombie PDFs circulating after supersession.' },
  { icon: '🌍', title: 'Multilingual', desc: 'One document, every language. The MLLR handles translation at block level.' },
  { icon: '🔗', title: 'Chain of custody', desc: 'Every edit, every signature, every view is traceable. Legal-grade provenance built in.' },
  { icon: '👁', title: 'Clarity layers', desc: 'The same document speaks differently to a clinician, a patient, and a regulator.' },
  { icon: '🔒', title: 'Controlled', desc: 'Copy, print, and export permissions set at document level — not at platform level.' },
]

const LIFECYCLE_STEPS = [
  { label: 'Any file', sub: 'PDF · DOCX · TXT', color: '#3F3F3F' },
  { label: 'UD Converter', sub: 'cleans & transforms', color: '#003A8C' },
  { label: 'UDS', sub: 'sealed · dark blue', color: '#003A8C' },
  { label: 'UD Reader', sub: 'clarity layers', color: '#1a5cb5' },
  { label: 'UDR', sub: 'editable · light blue', color: '#4DA3FF' },
  { label: 'UD Editor', sub: 'structured editing', color: '#4DA3FF' },
]

export default function LandingPage() {
  const [activeStep, setActiveStep] = useState<number | null>(null)

  const s = {
    page: { background: '#0a0c10', minHeight: '100vh', color: '#e2e8f0' } as React.CSSProperties,
    nav: {
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 24px', height: 56, borderBottom: '1px solid rgba(255,255,255,0.06)',
      background: 'rgba(10,12,16,0.95)', backdropFilter: 'blur(12px)',
      position: 'sticky', top: 0, zIndex: 100,
    } as React.CSSProperties,
    hero: { maxWidth: 760, margin: '0 auto', padding: '80px 24px 64px', textAlign: 'center' as const },
    badge: {
      display: 'inline-block', fontSize: 11, fontWeight: 600, letterSpacing: '0.12em',
      textTransform: 'uppercase' as const, padding: '4px 14px', borderRadius: 20, marginBottom: 28,
      background: 'rgba(0,58,140,0.15)', border: '1px solid rgba(0,58,140,0.3)', color: '#4DA3FF',
    },
    h1: { fontSize: 'clamp(36px, 6vw, 64px)', fontWeight: 800, letterSpacing: '-0.03em', color: '#f1f5f9', lineHeight: 1.1, marginBottom: 24 },
    blue: { color: '#4DA3FF' },
    sub: { fontSize: 18, color: '#8892a4', maxWidth: 520, margin: '0 auto 40px', lineHeight: 1.7 },
    ctaRow: { display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' as const },
    ctaPrimary: { display: 'inline-block', padding: '13px 28px', background: '#003A8C', color: '#fff', fontWeight: 700, fontSize: 14, borderRadius: 8, textDecoration: 'none', boxShadow: '0 0 24px rgba(0,58,140,0.4)' },
    ctaSecondary: { display: 'inline-block', padding: '13px 28px', background: 'transparent', color: '#4DA3FF', fontWeight: 600, fontSize: 14, borderRadius: 8, textDecoration: 'none', border: '1px solid rgba(77,163,255,0.3)' },
    section: { maxWidth: 960, margin: '0 auto', padding: '56px 24px' } as React.CSSProperties,
    sectionTitle: { fontSize: 11, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase' as const, color: '#4a5568', marginBottom: 32, textAlign: 'center' as const },
    divider: { border: 'none', borderTop: '1px solid rgba(255,255,255,0.06)', margin: '0 24px' },
    problemBlock: { maxWidth: 720, margin: '0 auto', textAlign: 'center' as const, padding: '48px 24px' },
    problemTitle: { fontSize: 28, fontWeight: 700, color: '#f1f5f9', marginBottom: 20, letterSpacing: '-0.02em' },
    problemText: { fontSize: 16, color: '#8892a4', lineHeight: 1.8 },
  }

  return (
    <div style={s.page}>
      {/* Nav */}
      <nav style={s.nav}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="28" height="28" viewBox="0 0 28 28">
            <rect width="28" height="28" rx="6" fill="#003A8C" />
            <text x="14" y="20" textAnchor="middle" fontFamily="Georgia,serif" fontWeight="700" fontSize="11" fill="#fff">UD</text>
          </svg>
          <span style={{ fontWeight: 700, fontSize: 15, color: '#f1f5f9' }}>Universal Document</span>
        </div>
        <div style={{ display: 'flex', gap: 20, fontSize: 13, color: '#8892a4' }}>
          <a href="https://converter.hive.baby" style={{ color: '#8892a4' }}>Converter</a>
          <a href="https://udutilities.hive.baby" style={{ color: '#4DA3FF', fontWeight: 600 }}>Utilities</a>
          <a href="https://hive.baby/patrons" style={{ color: '#8892a4' }}>Support</a>
        </div>
      </nav>

      {/* Hero */}
      <div style={s.hero}>
        <div style={s.badge}>iSDF v0.1.0 · Open format</div>
        <h1 style={s.h1}>
          Universal Documents.<br />
          <span style={s.blue}>For a universal world.</span>
        </h1>
        <p style={s.sub}>
          Convert anything. Read everything. Edit intelligently.
          The world's first clarity-native document format.
        </p>
        <div style={s.ctaRow}>
          <a href="https://converter.hive.baby" style={s.ctaPrimary}>Try UD Converter — Free →</a>
          <a href="https://udutilities.hive.baby" style={s.ctaSecondary}>UD Utilities</a>
        </div>
      </div>

      <hr style={s.divider} />

      {/* Lifecycle Animation */}
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '48px 24px' }}>
        <p style={{ ...s.sectionTitle, marginBottom: 20 }}>How it works</p>
        <LifecycleAnimation autoPlay={true} />
      </div>

      <hr style={s.divider} />

      {/* The Problem */}
      <div style={s.problemBlock}>
        <h2 style={s.problemTitle}>PDFs are messy. DOCX files break.</h2>
        <p style={s.problemText}>
          Legacy formats weren't built for a global, multilingual, AI-native world.<br />
          They don't expire. They don't adapt. They don't prove who touched them.<br />
          Universal Document fixes all of that.
        </p>
      </div>

      <hr style={s.divider} />

      {/* Lifecycle flow */}
      <section style={s.section}>
        <p style={s.sectionTitle}>The UD Lifecycle</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: 0 }}>
          {LIFECYCLE_STEPS.map((step, i) => (
            <div key={step.label} style={{ display: 'flex', alignItems: 'center' }}>
              <div
                onMouseEnter={() => setActiveStep(i)}
                onMouseLeave={() => setActiveStep(null)}
                style={{
                  padding: '12px 16px',
                  background: activeStep === i ? step.color : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${activeStep === i ? step.color : 'rgba(255,255,255,0.08)'}`,
                  borderRadius: 10,
                  textAlign: 'center',
                  cursor: 'default',
                  transition: 'all 0.2s',
                  minWidth: 80,
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 700, color: activeStep === i ? '#fff' : '#f1f5f9', marginBottom: 2 }}>{step.label}</div>
                <div style={{ fontSize: 10, color: activeStep === i ? 'rgba(255,255,255,0.7)' : '#4a5568' }}>{step.sub}</div>
              </div>
              {i < LIFECYCLE_STEPS.length - 1 && (
                <div style={{ width: 20, height: 1, background: 'rgba(77,163,255,0.3)', margin: '0 2px', position: 'relative' }}>
                  <div style={{ position: 'absolute', right: -4, top: -4, width: 0, height: 0, borderTop: '4px solid transparent', borderBottom: '4px solid transparent', borderLeft: '6px solid rgba(77,163,255,0.3)' }} />
                </div>
              )}
            </div>
          ))}
        </div>
        <p style={{ textAlign: 'center', fontSize: 13, color: '#4a5568', marginTop: 20 }}>
          Every UDS spreads the ecosystem · Every UDR builds the ecosystem · Every user becomes a node
        </p>
      </section>

      <hr style={s.divider} />

      {/* UDS vs UDR */}
      <section style={s.section}>
        <p style={s.sectionTitle}>Two formats. One ecosystem.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
          {/* UDS */}
          <div style={{
            background: 'rgba(0,58,140,0.1)', border: '1px solid rgba(0,58,140,0.3)',
            borderRadius: 14, padding: 28,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 36, height: 36, background: '#003A8C', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: '#fff' }}>S</div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9' }}>UDS — Universal Document Standard</div>
                <div style={{ fontSize: 12, color: '#4DA3FF' }}>Sealed · Dark blue · Authoritative</div>
              </div>
            </div>
            <p style={{ fontSize: 14, color: '#8892a4', lineHeight: 1.7, marginBottom: 12 }}>
              The final, sealed form. Structured, clarity-layered, and perfect for reading.
              Cannot be edited — only superseded.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {['Permanent hash', 'Chain of custody', 'Clarity layers', 'Multilingual ribbons', 'Expiry control'].map(f => (
                <div key={f} style={{ fontSize: 13, color: '#8892a4', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: '#003A8C', fontWeight: 700 }}>✓</span> {f}
                </div>
              ))}
            </div>
          </div>

          {/* UDR */}
          <div style={{
            background: 'rgba(77,163,255,0.08)', border: '1px solid rgba(77,163,255,0.25)',
            borderRadius: 14, padding: 28,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 36, height: 36, background: '#4DA3FF', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: '#fff' }}>R</div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9' }}>UDR — Universal Document Record</div>
                <div style={{ fontSize: 12, color: '#4DA3FF' }}>Editable · Light blue · Flexible</div>
              </div>
            </div>
            <p style={{ fontSize: 14, color: '#8892a4', lineHeight: 1.7, marginBottom: 12 }}>
              The working format. Editable, structured, intelligent.
              Full sidebar tools: sections, metadata, permissions, versioning.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {['Section-level editing', 'Metadata management', 'Permission control', 'Version history', 'Export to UDS'].map(f => (
                <div key={f} style={{ fontSize: 13, color: '#8892a4', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: '#4DA3FF', fontWeight: 700 }}>✓</span> {f}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <hr style={s.divider} />

      {/* Ecosystem */}
      <section style={s.section}>
        <p style={s.sectionTitle}>UD Ecosystem</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {TOOLS.map(tool => (
            <a
              key={tool.name}
              href={tool.url || '#'}
              onClick={!tool.url ? (e) => e.preventDefault() : undefined}
              style={{
                display: 'block', textDecoration: 'none', cursor: tool.url ? 'pointer' : 'default',
                background: tool.status === 'live' ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${tool.status === 'live' ? 'rgba(77,163,255,0.15)' : 'rgba(255,255,255,0.06)'}`,
                borderRadius: 12, padding: 20,
                opacity: tool.status === 'coming' ? 0.45 : 1,
              }}
            >
              <div style={{ fontSize: 24, marginBottom: 10 }}>{tool.icon}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9', marginBottom: 6 }}>{tool.name}</div>
              <div style={{ fontSize: 13, color: '#8892a4', lineHeight: 1.5, marginBottom: 10 }}>{tool.desc}</div>
              <span style={{
                fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
                padding: '2px 8px', borderRadius: 8,
                background: tool.status === 'live' ? 'rgba(77,163,255,0.12)' : 'rgba(255,255,255,0.04)',
                color: tool.status === 'live' ? '#4DA3FF' : '#4a5568',
              }}>
                {tool.status === 'live' ? '● Live' : tool.status === 'soon' ? 'Coming soon' : 'Pipeline'}
              </span>
            </a>
          ))}
        </div>
      </section>

      <hr style={s.divider} />

      {/* Features */}
      <section style={s.section}>
        <p style={s.sectionTitle}>Why Universal Document</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {FEATURES.map(f => (
            <div key={f.title} style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 12, padding: 24,
            }}>
              <div style={{ fontSize: 24, marginBottom: 12 }}>{f.icon}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>{f.title}</div>
              <div style={{ fontSize: 13, color: '#8892a4', lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <hr style={s.divider} />

      {/* For institutions */}
      <section style={{ ...s.section, textAlign: 'center' as const }}>
        <h2 style={{ fontSize: 32, fontWeight: 700, color: '#f1f5f9', marginBottom: 16, letterSpacing: '-0.02em' }}>Built for institutions.</h2>
        <p style={{ fontSize: 15, color: '#8892a4', marginBottom: 32, maxWidth: 560, margin: '0 auto 32px', lineHeight: 1.7 }}>
          Governments, healthcare systems, legal firms, enterprises — anyone who needs documents to be intelligent, traceable, and controlled.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, textAlign: 'left', maxWidth: 800, margin: '0 auto' }}>
          {[
            { label: 'Government', title: 'Policy & legislation', desc: 'Versioned, multilingual, expiring. Every amendment traceable.' },
            { label: 'Healthcare', title: 'Clinical records', desc: 'Clinician-grade and patient-grade clarity layers. Revoked when superseded.' },
            { label: 'Legal & corporate', title: 'Contracts & compliance', desc: 'Signed, timestamped, chain-of-custody. Expiry built in.' },
            { label: 'Education', title: 'Adaptive content', desc: 'Same document, adapted for age, language, and reading level.' },
          ].map(card => (
            <div key={card.label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 20 }}>
              <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#4DA3FF', marginBottom: 8 }}>{card.label}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>{card.title}</div>
              <div style={{ fontSize: 12, color: '#8892a4', lineHeight: 1.5 }}>{card.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <hr style={s.divider} />

      {/* Open */}
      <section style={{ maxWidth: 640, margin: '0 auto', padding: '56px 24px', textAlign: 'center' as const }}>
        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#4a5568', marginBottom: 16 }}>Open. Free. Yours.</p>
        <p style={{ fontSize: 15, color: '#8892a4', lineHeight: 1.8, marginBottom: 24 }}>
          The iSDF (Intelligent Semantic Document Format) is open. The reader SDK is free.
          Universal Document is built by Hive and stays free because of the people who choose to support it.
        </p>
        <a href="https://hive.baby/patrons" style={s.ctaSecondary}>View patrons →</a>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '24px', textAlign: 'center', fontSize: 12, color: '#4a5568' }}>
        Universal Document · Part of <a href="https://hive.baby" style={{ color: '#4DA3FF' }}>hive.baby</a> · No ads. No investors. No agenda.
      </footer>
    </div>
  )
}
