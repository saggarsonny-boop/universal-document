'use client'

const NAV_LINKS = [
  { label: 'Reader',      href: 'https://reader.network.baby' },
  { label: 'Converter',   href: 'https://converter.network.baby' },
  { label: 'Creator',     href: 'https://creator.network.baby' },
  { label: 'Validator',   href: 'https://validator.network.baby' },
  { label: 'Utilities',   href: 'https://utilities.network.baby' },
  { label: 'White Paper', href: 'https://universaldocument.network.baby' },
  { label: 'Certified',   href: 'https://universaldocument.network.baby/certified' },
]

export default function UDFooter() {
  return (
    <footer style={{
      borderTop: '0.5px solid var(--ud-border)',
      padding: '40px 24px 32px',
      background: 'var(--ud-paper-2)',
      marginTop: 'auto',
    }}>
      <div style={{ maxWidth: 860, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 24 }}>
          {NAV_LINKS.map(t => (
            <a key={t.href} href={t.href} style={{
              fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 500,
              color: 'var(--ud-muted)', textDecoration: 'none', transition: 'color 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--ud-ink)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--ud-muted)')}
            >{t.label}</a>
          ))}
        </div>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ud-muted)', marginBottom: 10 }}>
          <a href="mailto:support@network.baby" style={{ color: 'var(--ud-muted)', textDecoration: 'none' }}>support@network.baby</a>
          {' · '}
          <a href="https://universaldocument.network.baby" style={{ color: 'var(--ud-muted)', textDecoration: 'none' }}>universaldocument.network.baby</a>
        </p>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ud-border-2)', marginBottom: 4 }}>
          Universal Document™ is a pending trademark (USPTO Serial No. 99774346)
        </p>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ud-muted)', marginBottom: 10 }}>
          Need help?{' '}
          <a href="https://support.network.baby" style={{ color: 'var(--ud-teal)', textDecoration: 'none', fontWeight: 600 }}>
            Priority Support - from $1.99/mo →
          </a>
        </p>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ud-border-2)', marginBottom: 16 }}>
          © 2026 Universal Document Incorporated
        </p>
        <a href="https://network.baby" style={{
          fontSize: 18, textDecoration: 'none', opacity: 0.45, transition: 'opacity 0.15s', display: 'inline-block',
        }}
        onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
        onMouseLeave={e => (e.currentTarget.style.opacity = '0.45')}
        title="Back to Network">🌍</a>
      </div>
    </footer>
  )
}
