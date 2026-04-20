import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'UD Reader — Universal Document Reader',
  description: 'Open and read Universal Document (.uds) files. Free forever.',
  icons: { icon: '/favicon.svg' },
}

const NAV: React.CSSProperties = { fontSize: '11px', color: 'rgba(180,200,225,0.55)', textDecoration: 'none' }
const DOT: React.CSSProperties = { color: 'rgba(26,58,92,0.5)', fontSize: '11px' }
const TM: React.CSSProperties = { fontSize: '10px', color: 'rgba(180,200,225,0.2)', lineHeight: 1.6, maxWidth: 560, margin: '10px auto 0' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <header style={{ borderBottom: '1px solid rgba(13,31,53,0.7)', padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(2,4,8,0.6)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 50 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <a href="https://hive.baby" className="hive-planet" style={{ textDecoration: 'none', fontSize: '22px', lineHeight: '1' }}>🌍</a>
            <a href="https://universal-document.vercel.app" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
              <svg width="28" height="28" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                <rect width="32" height="32" rx="5" fill="#1e2d3d"/>
                <text x="16" y="23" textAnchor="middle" fontFamily="Georgia, 'Times New Roman', serif" fontWeight="700" fontSize="13" fill="#ffffff">UD</text>
              </svg>
            </a>
          </div>
          <nav style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
            <a href="https://converter.hive.baby" style={NAV}>Convert a file →</a>
            <span style={DOT}>·</span>
            <a href="https://universal-document.vercel.app" style={NAV}>UD Hub</a>
          </nav>
        </header>
        <main style={{ flex: 1 }}>{children}</main>
        <footer style={{ borderTop: '1px solid rgba(13,31,53,0.8)', padding: '20px 24px 28px', textAlign: 'center' }}>
          <p style={{ fontSize: '11px', color: 'rgba(26,58,92,0.5)', marginBottom: '14px', letterSpacing: '0.05em' }}>Free forever. No ads. No investors. You are the investor.</p>
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '10px' }}>
            <a href="https://hive.baby" style={NAV}>A social experiment</a>
            <span style={DOT}>·</span>
            <a href="https://converter.hive.baby" style={NAV}>UD Converter</a>
            <span style={DOT}>·</span>
            <a href="https://hive.baby/patrons" style={NAV}>Patrons</a>
            <span style={DOT}>·</span>
            <a href="https://hive.baby/privacy" style={NAV}>Privacy</a>
            <span style={DOT}>·</span>
            <a href="mailto:hive@hive.baby" style={NAV}>Feedback</a>
          </div>
          <p style={TM}>Universal Document™ is a pending trademark (Serial 99774346). The UD wordmark and UD Certified mark are trademarks of Hive. The Universal Document™ specification is released under CC BY 4.0 and may be implemented freely by any party.</p>
        </footer>
      </body>
    </html>
  )
}
