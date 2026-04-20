'use client'

const TOOLS = [
  { label: 'Reader', href: 'https://ud.hive.baby' },
  { label: 'Converter', href: 'https://converter.hive.baby' },
  { label: 'Creator', href: 'https://creator.hive.baby' },
  { label: 'Validator', href: 'https://validator.hive.baby' },
  { label: 'Utilities', href: 'https://utilities.hive.baby' },
]

export default function UDNav({ engine }: { engine: string }) {
  return (
    <header style={{
      height: 56,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 24px',
      background: '#ffffff',
      borderBottom: '0.5px solid var(--ud-border)',
      position: 'sticky', top: 0, zIndex: 50,
      boxShadow: '0 1px 0 var(--ud-border)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <a href="https://hive.baby" className="hive-planet" style={{ textDecoration: 'none', fontSize: 20, lineHeight: '1' }}>🌍</a>
        <a href="https://ud.hive.baby" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none' }}>
          <div style={{
            width: 28, height: 28, background: 'var(--ud-ink)', borderRadius: 5,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: 11, color: '#fff',
            flexShrink: 0,
          }}>UD</div>
          <span style={{
            fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17,
            color: 'var(--ud-ink)', letterSpacing: '-0.01em',
          }}>{engine}</span>
        </a>
      </div>
      <nav style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
        {TOOLS.filter(t => t.label !== engine.replace('UD ', '')).map(t => (
          <a key={t.href} href={t.href} style={{
            fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--ud-muted)',
            fontWeight: 500, textDecoration: 'none', transition: 'color 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--ud-ink)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--ud-muted)')}
          >{t.label}</a>
        ))}
      </nav>
    </header>
  )
}
