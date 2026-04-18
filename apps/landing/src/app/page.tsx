export default function LandingPage() {
  const TOOLS = [
    {
      name: 'UD Converter',
      desc: 'Convert DOCX, TXT, MD to .uds format. Instant download.',
      url: 'https://converter.hive.baby',
      status: 'live',
      emoji: '📄',
    },
    {
      name: 'UD Reader',
      desc: 'Open and read any .uds file in your browser. No install.',
      url: 'https://ud.hive.baby/reader',
      status: 'live',
      emoji: '📖',
    },
    {
      name: 'UD Creator',
      desc: 'Write a Universal Document from scratch. Set expiry and language.',
      url: null,
      status: 'soon',
      emoji: '✏️',
    },
    {
      name: 'UD Validator',
      desc: 'Verify a .uds file — schema, expiry, signatures, languages.',
      url: null,
      status: 'soon',
      emoji: '✅',
    },
    {
      name: 'UD Signer',
      desc: 'Governed signing with chain-of-custody and audit trails.',
      url: null,
      status: 'coming',
      emoji: '🔏',
    },
  ]

  const FEATURES = [
    { icon: '🧠', title: 'AI-native', desc: 'Every block carries provenance, context, and structured metadata. AI reads it natively.' },
    { icon: '⏳', title: 'Expiring', desc: 'Documents can be set to expire or be revoked. No more zombie PDFs.' },
    { icon: '🌍', title: 'Multilingual', desc: 'One document, every language. The Multilingual Language Ribbon (MLLR) handles translation at the block level.' },
    { icon: '🔗', title: 'Chain of custody', desc: 'Every edit, every signature, every view is traceable. Legal-grade provenance.' },
    { icon: '👁', title: 'Audience-adaptive', desc: 'Clarity layers let the same document speak differently to a clinician, a patient, and a regulator.' },
    { icon: '🔒', title: 'Controlled', desc: 'Set copy, print, and export permissions at document level. Not at platform level.' },
  ]

  const s = {
    page: { background: 'var(--bg)', minHeight: '100vh' } as React.CSSProperties,
    hero: { maxWidth: 760, margin: '0 auto', padding: '80px 24px 64px', textAlign: 'center' as const },
    badge: { display: 'inline-block', background: 'var(--gold-glow)', border: '1px solid rgba(212,175,55,0.2)', color: 'var(--gold-dim)', fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' as const, padding: '4px 14px', borderRadius: 20, marginBottom: 28 },
    h1: { fontSize: 'clamp(36px, 6vw, 64px)', fontWeight: 800, letterSpacing: '-0.03em', color: '#f1f5f9', lineHeight: 1.1, marginBottom: 24 },
    gold: { color: 'var(--gold)' },
    sub: { fontSize: 18, color: 'var(--muted)', maxWidth: 520, margin: '0 auto 40px', lineHeight: 1.7 },
    ctaRow: { display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' as const },
    ctaPrimary: { display: 'inline-block', padding: '12px 28px', background: 'var(--gold)', color: '#0a0a0a', fontWeight: 700, fontSize: 14, borderRadius: 8, textDecoration: 'none' },
    ctaSecondary: { display: 'inline-block', padding: '12px 28px', background: 'transparent', color: 'var(--gold-dim)', fontWeight: 600, fontSize: 14, borderRadius: 8, textDecoration: 'none', border: '1px solid rgba(212,175,55,0.3)' },
    section: { maxWidth: 960, margin: '0 auto', padding: '48px 24px' } as React.CSSProperties,
    sectionTitle: { fontSize: 11, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase' as const, color: 'var(--muted)', marginBottom: 32, textAlign: 'center' as const },
    toolGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 },
    toolCard: (status: string): React.CSSProperties => ({
      background: status === 'live' ? 'var(--surface)' : 'rgba(13,17,23,0.4)',
      border: `1px solid ${status === 'live' ? 'rgba(212,175,55,0.2)' : 'var(--border)'}`,
      borderRadius: 12,
      padding: 24,
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      opacity: status === 'coming' ? 0.5 : 1,
    }),
    toolEmoji: { fontSize: 28 } as React.CSSProperties,
    toolName: { fontSize: 16, fontWeight: 700, color: '#f1f5f9' } as React.CSSProperties,
    toolDesc: { fontSize: 13, color: 'var(--muted)', lineHeight: 1.5, flex: 1 } as React.CSSProperties,
    toolPill: (status: string): React.CSSProperties => ({
      display: 'inline-block',
      fontSize: 10,
      fontWeight: 600,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      padding: '2px 8px',
      borderRadius: 10,
      background: status === 'live' ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.04)',
      color: status === 'live' ? 'var(--gold)' : 'var(--subtle)',
      alignSelf: 'flex-start' as const,
      marginTop: 4,
    }),
    divider: { border: 'none', borderTop: '1px solid var(--border)', margin: '0 24px' },
    featureGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 },
    featureCard: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 24 } as React.CSSProperties,
    featureIcon: { fontSize: 24, marginBottom: 12 } as React.CSSProperties,
    featureTitle: { fontSize: 15, fontWeight: 700, color: '#f1f5f9', marginBottom: 8 } as React.CSSProperties,
    featureDesc: { fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 } as React.CSSProperties,
    proBlock: { maxWidth: 760, margin: '0 auto', padding: '48px 24px', textAlign: 'center' as const },
    proTitle: { fontSize: 28, fontWeight: 700, color: '#f1f5f9', marginBottom: 16, letterSpacing: '-0.02em' } as React.CSSProperties,
    proDesc: { fontSize: 15, color: 'var(--muted)', marginBottom: 32, lineHeight: 1.7 } as React.CSSProperties,
    proCards: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, textAlign: 'left' as const },
    proCard: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 } as React.CSSProperties,
    proCardLabel: { fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: 'var(--gold-dim)', marginBottom: 8 } as React.CSSProperties,
    proCardTitle: { fontSize: 15, fontWeight: 700, color: '#f1f5f9', marginBottom: 8 } as React.CSSProperties,
    proCardDesc: { fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 } as React.CSSProperties,
  }

  return (
    <div style={s.page}>
      {/* Hero */}
      <div style={s.hero}>
        <div style={s.badge}>iSDF v0.1.0 · Open format</div>
        <h1 style={s.h1}>
          The document format<br />
          <span style={s.gold}>built for intelligence.</span>
        </h1>
        <p style={s.sub}>
          PDF was designed for print. Universal Document is designed for the age of AI —
          semantic, expiring, multilingual, and revocable by design.
        </p>
        <div style={s.ctaRow}>
          <a href="https://converter.hive.baby" style={s.ctaPrimary}>Convert a document →</a>
          <a href="https://hive.baby/patrons" style={s.ctaSecondary}>Support the project</a>
        </div>
      </div>

      <hr style={s.divider} />

      {/* Tools */}
      <section style={s.section}>
        <p style={s.sectionTitle}>UD Ecosystem</p>
        <div style={s.toolGrid}>
          {TOOLS.map(tool => (
            <a
              key={tool.name}
              href={tool.url || '#'}
              style={{ textDecoration: 'none', cursor: tool.url ? 'pointer' : 'default' }}
              onClick={!tool.url ? (e) => e.preventDefault() : undefined}
            >
              <div style={s.toolCard(tool.status)}>
                <span style={s.toolEmoji}>{tool.emoji}</span>
                <span style={s.toolName}>{tool.name}</span>
                <span style={s.toolDesc}>{tool.desc}</span>
                <span style={s.toolPill(tool.status)}>
                  {tool.status === 'live' ? '● Live' : tool.status === 'soon' ? 'Coming soon' : 'Pipeline'}
                </span>
              </div>
            </a>
          ))}
        </div>
      </section>

      <hr style={s.divider} />

      {/* Certification badge */}
      <section style={{ ...s.section, textAlign: 'center' as const }}>
        <p style={s.sectionTitle}>UD Certified</p>
        <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 24, maxWidth: 480, margin: '0 auto 24px' }}>
          Products and services that implement the Universal Document specification may display the UD Certified mark.
        </p>
        <div style={{ display: 'inline-flex', flexDirection: 'column' as const, alignItems: 'center', gap: 16 }}>
          <svg width="148" height="32" viewBox="0 0 148 32" xmlns="http://www.w3.org/2000/svg">
            <rect width="148" height="32" rx="16" fill="#f5f4f0" stroke="#d0cdc6" strokeWidth="1"/>
            <rect x="4" y="4" width="24" height="24" rx="4" fill="#1e2d3d"/>
            <text x="16" y="20" textAnchor="middle" fontFamily="Georgia, 'Times New Roman', serif" fontWeight="700" fontSize="9" fill="#ffffff">UD</text>
            <text x="36" y="21" fontFamily="'Courier New', monospace" fontSize="10" fill="#444444" letterSpacing="1">UD CERTIFIED</text>
          </svg>
          <a href="/certified" style={{ fontSize: 12, color: 'var(--muted)', textDecoration: 'underline' }}>
            Apply for UD Certified →
          </a>
        </div>
      </section>

      <hr style={s.divider} />

      {/* Features */}
      <section style={s.section}>
        <p style={s.sectionTitle}>Why Universal Document</p>
        <div style={s.featureGrid}>
          {FEATURES.map(f => (
            <div key={f.title} style={s.featureCard}>
              <div style={s.featureIcon}>{f.icon}</div>
              <div style={s.featureTitle}>{f.title}</div>
              <div style={s.featureDesc}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <hr style={s.divider} />

      {/* For organisations */}
      <section style={s.proBlock}>
        <h2 style={s.proTitle}>Built for institutions.</h2>
        <p style={s.proDesc}>
          Universal Document is designed from the ground up for governments, healthcare systems,
          legal firms, and enterprises that need documents to be intelligent, traceable, and controlled.
        </p>
        <div style={s.proCards}>
          <div style={s.proCard}>
            <div style={s.proCardLabel}>Government</div>
            <div style={s.proCardTitle}>Policy & legislation</div>
            <div style={s.proCardDesc}>Versioned, multilingual, expiring. Every amendment traceable. Every citizen reachable in their language.</div>
          </div>
          <div style={s.proCard}>
            <div style={s.proCardLabel}>Healthcare</div>
            <div style={s.proCardTitle}>Clinical records</div>
            <div style={s.proCardDesc}>Clinician-grade and patient-grade clarity layers. Shared, not copied. Revoked when superseded.</div>
          </div>
          <div style={s.proCard}>
            <div style={s.proCardLabel}>Legal & corporate</div>
            <div style={s.proCardTitle}>Contracts & compliance</div>
            <div style={s.proCardDesc}>Signed, timestamped, chain-of-custody. Expiry built in. Audit trail included.</div>
          </div>
          <div style={s.proCard}>
            <div style={s.proCardLabel}>Education</div>
            <div style={s.proCardTitle}>Adaptive content</div>
            <div style={s.proCardDesc}>The same document, adapted for age, language, and reading level. No separate editions.</div>
          </div>
        </div>
      </section>

      <hr style={s.divider} />

      {/* White papers */}
      <section style={{ ...s.section, textAlign: 'center' }}>
        <p style={s.sectionTitle}>White papers</p>
        <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 24 }}>
          Detailed technical and policy papers for institutional adoption.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="/whitepapers/government" style={{ ...s.ctaSecondary, fontSize: 13 }}>Government paper</a>
          <a href="/whitepapers/corporate" style={{ ...s.ctaSecondary, fontSize: 13 }}>Corporate paper</a>
          <a href="/whitepapers/oem" style={{ ...s.ctaSecondary, fontSize: 13, opacity: 0.5, cursor: 'not-allowed' }}>OEM / iSDK (coming)</a>
        </div>
      </section>

      <hr style={s.divider} />

      {/* Open format */}
      <section style={{ ...s.proBlock, paddingTop: 40 }}>
        <p style={{ ...s.sectionTitle, marginBottom: 16 }}>Open. Free. Yours.</p>
        <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.8 }}>
          The iSDF (Intelligent Semantic Document Format) is open. The reader SDK is free and under 400KB.
          Universal Document is built by one person. It stays free because of the people who choose to support it.
        </p>
        <div style={{ marginTop: 20 }}>
          <a href="https://hive.baby/patrons" style={s.ctaSecondary}>View patrons →</a>
        </div>
      </section>
    </div>
  )
}
