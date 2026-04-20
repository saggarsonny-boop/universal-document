import type { Metadata } from 'next'
import './globals.css'
import UDNav from '@/components/UDNav'
import UDFooter from '@/components/UDFooter'

export const metadata: Metadata = {
  title: 'UD Converter — Convert to Universal Document™',
  description: 'Convert DOCX, TXT, MD to .uds format. Free forever. Pro tier for unlimited conversions.',
  icons: { icon: '/favicon.svg' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <header style={{ borderBottom: '1px solid #f3f4f6', padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ffffff', position: 'sticky', top: 0, zIndex: 50 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <a href="https://hive.baby" className="hive-planet" style={{ textDecoration: 'none', fontSize: '20px', lineHeight: '1' }}>🌍</a>
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
            <a href="https://creator.hive.baby" style={NAV}>Creator</a>
            <span style={DOT}>·</span>
            <a href="/pricing" style={NAV}>Pricing</a>
            <span style={DOT}>·</span>
            <a href="https://validator.hive.baby" style={NAV}>Validator</a>
          </nav>
        </header>
        <main style={{ flex: 1 }}>{children}</main>
        <footer style={{ borderTop: '1px solid #f3f4f6', padding: '20px 24px 28px', textAlign: 'center' }}>
          <p style={{ fontSize: '11px', color: '#d1d5db', marginBottom: '12px', letterSpacing: '0.05em' }}>NO ADS · NO INVESTORS · NO AGENDA</p>
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '10px' }}>
            <a href="https://hive.baby" style={{ fontSize: '12px', color: '#9ca3af' }}>hive.baby</a>
            <span style={DOT}>·</span>
            <a href="https://ud.hive.baby" style={{ fontSize: '12px', color: '#9ca3af' }}>Universal Document</a>
            <span style={DOT}>·</span>
            <a href="mailto:hive@hive.baby" style={{ fontSize: '12px', color: '#9ca3af' }}>Feedback</a>
          </div>
          <p style={TM}>The UD wordmark and UD Certified mark are trademarks of Hive. The Universal Document specification is released under CC BY 4.0 and may be implemented freely by any party.</p>
        </footer>
      </body>
    </html>
  )
}
