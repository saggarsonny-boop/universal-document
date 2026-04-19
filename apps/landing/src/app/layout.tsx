import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Universal Document — The next document format',
  description: 'AI-native, semantic, expiring, multilingual. The document format built for the age of intelligence.',
  icons: { icon: '/favicon.svg' },
  openGraph: {
    title: 'Universal Document',
    description: 'The next document format. AI-native. Semantic. Expiring. Multilingual.',
    type: 'website',
  },
}

const NAV: React.CSSProperties = { fontSize: '11px', color: 'rgba(180,200,225,0.55)', textDecoration: 'none' }
const DOT: React.CSSProperties = { color: 'rgba(26,58,92,0.5)', fontSize: '11px' }
const TM: React.CSSProperties = { fontSize: '10px', color: 'rgba(180,200,225,0.25)', lineHeight: 1.6, maxWidth: 600, margin: '10px auto 0' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <header style={{ borderBottom: '1px solid rgba(13,31,53,0.7)', padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(2,4,8,0.6)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 50 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <a href="https://hive.baby" className="hive-planet" style={{ textDecoration: 'none', fontSize: '22px', lineHeight: '1' }}>🌍</a>
            {/* Horizontal lockup — dark-adapted */}
            <a href="https://ud.hive.baby" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
              <svg width="180" height="34" viewBox="0 0 320 56" xmlns="http://www.w3.org/2000/svg">
                <rect width="56" height="56" rx="8" fill="#1e2d3d"/>
                <text x="28" y="39" textAnchor="middle" fontFamily="Georgia, 'Times New Roman', serif" fontWeight="700" fontSize="22" fill="#ffffff">UD</text>
                <text x="76" y="30" fontFamily="Georgia, 'Times New Roman', serif" fontWeight="700" fontSize="18" fill="#e2e8f0">Universal Document</text>
                <text x="77" y="46" fontFamily="'Courier New', monospace" fontSize="11" fill="#475569" letterSpacing="1">SPECIFICATION 1.0</text>
              </svg>
            </a>
          </div>
          <nav style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
            <a href="https://converter.hive.baby" style={NAV}>Converter</a>
            <span style={DOT}>·</span>
            <a href="https://hive.baby/patrons" style={NAV}>Patrons</a>
          </nav>
        </header>
        <main style={{ flex: 1 }}>{children}</main>
        <footer style={{ borderTop: '1px solid rgba(13,31,53,0.8)', padding: '20px 24px 28px', textAlign: 'center' }}>
          <p style={{ fontSize: '11px', color: 'rgba(26,58,92,0.5)', marginBottom: '14px', letterSpacing: '0.05em' }}>Free forever. No ads. No investors. You are the investor.</p>
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '12px' }}>
            <a href="https://hive.baby" style={NAV}>hive.baby</a>
            <span style={DOT}>·</span>
            <a href="https://hive.baby/patrons" style={NAV}>Patronage</a>
            <span style={DOT}>·</span>
            <a href="mailto:press@hive.baby" style={NAV}>press@hive.baby</a>
          </div>
          <p style={TM}>The UD wordmark and UD Certified mark are trademarks of Hive. The Universal Document specification is released under CC BY 4.0 and may be implemented freely by any party.</p>
        </footer>
      </body>
    </html>
  )
}
