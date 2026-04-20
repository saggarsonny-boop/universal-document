const TOOLS = [
  { label: 'Reader', href: 'https://ud.hive.baby' },
  { label: 'Converter', href: 'https://converter.hive.baby' },
  { label: 'Creator', href: 'https://creator.hive.baby' },
  { label: 'Validator', href: 'https://validator.hive.baby' },
  { label: 'Utilities', href: 'https://utilities.hive.baby' },
  { label: 'UD Hub', href: 'https://ud.hive.baby' },
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
        <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 14 }}>
          {TOOLS.map(t => (
            <a key={t.href} href={t.href} style={{
              fontFamily: 'var(--font-mono)', fontSize: 11,
              color: 'var(--ud-muted)', textDecoration: 'none',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--ud-ink)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--ud-muted)')}
            >{t.label}</a>
          ))}
        </div>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ud-muted)', marginBottom: 8 }}>
          Free forever. Part of the Hive. ·{' '}
          <a href="https://hive.baby" style={{ color: 'var(--ud-muted)', textDecoration: 'none' }}>hive.baby</a>
        </p>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ud-border-2)', lineHeight: 1.6, maxWidth: 600, margin: '0 auto' }}>
          Universal Document™ is a pending trademark (Serial 99774346). The Universal Document™ specification is released under CC BY 4.0 and may be implemented freely by any party.
        </p>
      </div>
    </footer>
  )
}
