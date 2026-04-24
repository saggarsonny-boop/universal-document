'use client'

type Tool = { label: string; href: string; key: string }

const TOOLS: Tool[] = [
  { label: 'Home',      href: 'https://hive.baby',              key: '' },
  { label: 'Reader',    href: 'https://reader.hive.baby',       key: 'UD Reader' },
  { label: 'Converter', href: 'https://converter.hive.baby',    key: 'UD Converter' },
  { label: 'Creator',   href: 'https://creator.hive.baby',      key: 'UD Creator' },
  { label: 'Validator', href: 'https://validator.hive.baby',    key: 'UD Validator' },
  { label: 'Utilities', href: 'https://utilities.hive.baby',    key: 'UD Utilities' },
]

export default function UDNav({ engine }: { engine: string }) {
  return (
    <header style={{
      height: 56,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 24px',
      background: 'var(--ud-paper)',
      borderBottom: '0.5px solid var(--ud-border)',
      position: 'sticky', top: 0, zIndex: 50,
      boxShadow: '0 1px 0 var(--ud-border)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <a href="https://hive.baby" className="hive-planet" style={{ textDecoration: 'none', fontSize: 20, lineHeight: '1' }}>🌍</a>
        <a href="https://ud.hive.baby" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none' }}>
          <img src="/icons/ud-mark-uds.png" width={32} height={32} alt="Universal Document" style={{ borderRadius: 5, flexShrink: 0 }} />
          <span style={{
            fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17,
            color: 'var(--ud-ink)', letterSpacing: '-0.01em',
          }}>Universal Document™</span>
        </a>
      </div>
      <nav style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
        {TOOLS.filter(t => t.key !== engine).map(t => (
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
