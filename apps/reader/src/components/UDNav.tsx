'use client'

type Tool = { label: string; href: string; key: string }

const TOOLS: Tool[] = [
  { label: 'Reader',      href: 'https://reader.network.baby',             key: 'UD Reader' },
  { label: 'Converter',   href: 'https://converter.network.baby',          key: 'UD Converter' },
  { label: 'Creator',     href: 'https://creator.network.baby',            key: 'UD Creator' },
  { label: 'Validator',   href: 'https://validator.network.baby',          key: 'UD Validator' },
  { label: 'Utilities',   href: 'https://utilities.network.baby',          key: 'UD Utilities' },
  { label: 'White Paper', href: 'https://ud.network.baby/whitepaper',        key: 'White Paper' },
  { label: 'iSDK',        href: 'https://ud.network.baby/isdk',                    key: 'iSDK' },
  { label: 'cSDK',        href: 'https://ud.network.baby/csdk',                    key: 'cSDK' },
  { label: 'Support',     href: 'https://support.network.baby',                    key: 'Support' },
]

export default function UDNav({ systemName }: { systemName: string }) {
  return (
    <header style={{
      height: 56,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 24px',
      background: '#1e2d3d',
      position: 'sticky', top: 0, zIndex: 50,
      boxShadow: '0 1px 0 rgba(0,0,0,0.25)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <a href="https://network.baby" style={{ textDecoration: 'none', fontSize: 18, lineHeight: '1' }}>🌍</a>
        <a href="https://ud.network.baby" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none' }}>
          <img src="/icons/ud-mark-uds.png" width={32} height={32} alt="Universal Document" style={{ borderRadius: 5, flexShrink: 0 }} />
          <span style={{
            fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17,
            color: '#ffffff', letterSpacing: '-0.01em',
          }}>Universal Document™</span>
        </a>
      </div>
      <nav style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
        <button
          onClick={() => { if (typeof window !== 'undefined') { localStorage.removeItem('ud_tour_dismissed'); window.location.reload() } }}
          title="Show help"
          style={{
            width: 20, height: 20, borderRadius: '50%', background: 'none',
            border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.35)',
            fontSize: 11, fontWeight: 700, cursor: 'pointer', padding: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            lineHeight: 1, fontFamily: 'inherit', flexShrink: 0,
          }}
        >?</button>
        {TOOLS.filter(t => t.key !== systemName).map(t => (
          <a key={t.href} href={t.href} style={{
            fontFamily: 'var(--font-body)', fontSize: 13,
            color: 'rgba(255,255,255,0.7)',
            fontWeight: 500, textDecoration: 'none', transition: 'color 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = '#ffffff')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
          >{t.label}</a>
        ))}
      </nav>
    </header>
  )
}
