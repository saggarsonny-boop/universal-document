import type { Metadata } from 'next'
import './globals.css'
import UDNav from '@/components/UDNav'
import UDFooter from '@/components/UDFooter'

export const metadata: Metadata = {
  title: 'Universal Document™ Validator',
  description: 'Universal Document™ Validator — verify any .uds file. Check schema, expiry, signatures, and more. Free.',
  openGraph: { title: 'Universal Document™ Validator', description: 'Validate Universal Document™ files instantly.' },
  icons: { icon: '/favicon.svg' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <header style={{ borderBottom: '1px solid rgba(13,31,53,0.7)', padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(2,4,8,0.6)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 50 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <a href="https://hive.baby" className="hive-planet" style={{ textDecoration: 'none', fontSize: '22px', lineHeight: '1' }}>🌍</a>
            <a href="https://ud.hive.baby" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
              <svg width="28" height="28" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                <rect width="32" height="32" rx="5" fill="#1e2d3d"/>
                <text x="16" y="23" textAnchor="middle" fontFamily="Georgia, 'Times New Roman', serif" fontWeight="700" fontSize="13" fill="#ffffff">UD</text>
              </svg>
            </a>
          </div>
          <nav style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
            <a href="https://ud.hive.baby" style={NAV}>UD Hub</a>
            <span style={DOT}>·</span>
            <a href="https://converter.hive.baby" style={NAV}>Converter</a>
            <span style={DOT}>·</span>
            <a href="https://creator.hive.baby" style={NAV}>Creator</a>
          </nav>
        </header>
        <main style={{ flex: 1 }}>{children}</main>
        <footer style={{ borderTop: '1px solid rgba(13,31,53,0.8)', padding: '20px 24px 28px', textAlign: 'center' }}>
          <p style={{ fontSize: '11px', color: 'rgba(26,58,92,0.5)', marginBottom: '14px', letterSpacing: '0.05em' }}>Free forever. No ads. No investors. You are the investor.</p>
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '10px' }}>
            <a href="https://hive.baby" style={NAV}>hive.baby</a>
            <span style={DOT}>·</span>
            <a href="https://ud.hive.baby" style={NAV}>Universal Document</a>
            <span style={DOT}>·</span>
            <a href="mailto:hive@hive.baby" style={NAV}>Feedback</a>
          </div>
          <p style={TM}>The UD wordmark and UD Certified mark are trademarks of Hive. The Universal Document specification is released under CC BY 4.0 and may be implemented freely by any party.</p>
        </footer>
      </body>
    </html>
  )
}
