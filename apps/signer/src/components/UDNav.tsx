'use client'

type Tool = { label: string; href: string; key: string }

const TOOLS: Tool[] = [
  { label: 'Home',      href: 'https://hive.baby',              key: '' },
  { label: 'Reader',    href: 'https://reader.hive.baby',       key: 'UD Reader' },
  { label: 'Converter', href: 'https://converter.hive.baby',    key: 'UD Converter' },
  { label: 'Creator',   href: 'https://creator.hive.baby',      key: 'UD Creator' },
  { label: 'Validator', href: 'https://validator.hive.baby',    key: 'UD Validator' },
  { label: 'Utilities',   href: 'https://utilities.hive.baby',        key: 'UD Utilities' },
  { label: 'White Paper', href: 'https://ud.hive.baby/whitepaper',    key: 'White Paper' },
  { label: 'iSDK',        href: 'https://ud.hive.baby/isdk',          key: 'iSDK' },
  { label: 'cSDK',        href: 'https://ud.hive.baby/csdk',          key: 'cSDK' },
  { label: 'Support',     href: 'https://support.hive.baby',          key: 'Support' },
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
        <button
          onClick={() => { if (typeof window !== 'undefined') { localStorage.removeItem('hive_ud_tour_dismissed'); window.location.reload() } }}
          title="Show help"
          style={{
            width: 20, height: 20, borderRadius: '50%', background: 'none',
            border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.35)',
            fontSize: 11, fontWeight: 700, cursor: 'pointer', padding: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            lineHeight: 1, fontFamily: 'inherit', flexShrink: 0,
          }}
        >?</button>
        {TOOLS.filter(t => t.key !== engine).map(t => (
          <a key={t.href} href={t.href} style={{
            fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ud-muted)',
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
