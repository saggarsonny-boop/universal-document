'use client'

const LINKS = [
  { label: 'hive.baby',   href: 'https://hive.baby' },
  { label: 'Contribute',  href: 'https://hive.baby/contribute' },
  { label: 'Patrons',     href: 'https://hive.baby/patrons' },
  { label: 'Privacy',     href: 'https://hive.baby/privacy' },
]

export default function UDFooter() {
  return (
    <footer style={{
      borderTop: '0.5px solid var(--ud-border)',
      padding: '32px 24px',
      background: 'var(--ud-paper-2)',
      marginTop: 'auto',
    }}>
      <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: 13,
          fontWeight: 600, color: 'var(--ud-ink)', marginBottom: 4,
        }}>Universal Document™ Incorporated</p>
        <p style={{
          fontFamily: 'var(--font-mono)', fontSize: 11,
          color: 'var(--ud-muted)', marginBottom: 18,
        }}>
          <a href="https://universaldocument.solutions" style={{ color: 'var(--ud-muted)', textDecoration: 'none' }}>universaldocument.solutions</a>
          {' · '}
          <a href="mailto:press@universaldocument.solutions" style={{ color: 'var(--ud-muted)', textDecoration: 'none' }}>press@universaldocument.solutions</a>
        </p>
        <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 18 }}>
          {LINKS.map(t => (
            <a key={t.href} href={t.href} style={{
              fontFamily: 'var(--font-mono)', fontSize: 11,
              color: 'var(--ud-muted)', textDecoration: 'none',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--ud-ink)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--ud-muted)')}
            >{t.label}</a>
          ))}
        </div>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ud-border-2)', marginBottom: 6 }}>
          Universal Document™ Standard 1.0 · CC BY 4.0 · April 2026
        </p>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ud-border-2)', lineHeight: 1.6, maxWidth: 600, margin: '0 auto' }}>
          Universal Document™ is a pending trademark (Serial 99774346). The specification is released under CC BY 4.0 and may be implemented freely by any party.
        </p>
      </div>
    </footer>
  )
}
