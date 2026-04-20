import type { Metadata } from 'next'
import type { CSSProperties } from 'react'
import './globals.css'
import UDFooter from '@/components/UDFooter'

export const metadata: Metadata = {
  title: 'Universal Document™ Reader',
  description: 'Universal Document™ Reader — open and read any .uds or .udr file. Free forever.',
  openGraph: { title: 'Universal Document™ Reader', description: 'Read Universal Document™ files. Free forever.' },
  icons: { icon: '/favicon.svg' },
}

const NAV: CSSProperties = { fontSize: '11px', color: 'rgba(180,200,225,0.55)', textDecoration: 'none' }
const DOT: CSSProperties = { color: 'rgba(26,58,92,0.5)', fontSize: '11px' }

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
            <a href="https://converter.hive.baby" style={NAV}>Converter</a>
            <span style={DOT}>·</span>
            <a href="https://creator.hive.baby" style={NAV}>Creator</a>
            <span style={DOT}>·</span>
            <a href="https://validator.hive.baby" style={NAV}>Validator</a>
            <span style={DOT}>·</span>
            <a href="https://signer.hive.baby" style={NAV}>Signer</a>
            <span style={DOT}>·</span>
            <a href="https://ud.hive.baby" style={NAV}>UD Hub</a>
          </nav>
        </header>
        <main style={{ flex: 1 }}>{children}</main>
        <UDFooter />
      </body>
    </html>
  )
}
