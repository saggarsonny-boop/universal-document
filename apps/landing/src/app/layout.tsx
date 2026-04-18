import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Universal Document — The next document format',
  description: 'AI-native, semantic, expiring, multilingual. The document format built for the age of intelligence.',
  openGraph: {
    title: 'Universal Document',
    description: 'The next document format. AI-native. Semantic. Expiring. Multilingual.',
    type: 'website',
  },
}

const NAV_STYLE: React.CSSProperties = { fontSize: '11px', color: 'rgba(180,200,225,0.55)', textDecoration: 'none' }
const DOT: React.CSSProperties = { color: 'rgba(26,58,92,0.5)', fontSize: '11px' }

function HiveNav() {
  return (
    <header style={{ borderBottom: '1px solid rgba(13,31,53,0.7)', padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(2,4,8,0.6)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 50 }}>
      <a href="https://hive.baby" className="hive-planet" style={{ textDecoration: 'none', fontSize: '22px', lineHeight: '1' }}>🌍</a>
      <nav style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
        <a href="https://converter.hive.baby" style={NAV_STYLE}>Converter</a>
        <span style={DOT}>·</span>
        <a href="https://hive.baby/patrons" style={NAV_STYLE}>Patrons</a>
      </nav>
    </header>
  )
}

function HiveFooter() {
  return (
    <footer style={{ borderTop: '1px solid rgba(13,31,53,0.8)', padding: '20px 24px 28px', textAlign: 'center' }}>
      <p style={{ fontSize: '11px', color: 'rgba(26,58,92,0.5)', marginBottom: '14px', letterSpacing: '0.05em' }}>
        Free forever. No ads. No investors. You are the investor.
      </p>
      <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <a href="https://hive.baby" style={NAV_STYLE}>hive.baby</a>
        <span style={DOT}>·</span>
        <a href="https://hive.baby/patrons" style={NAV_STYLE}>Patronage</a>
        <span style={DOT}>·</span>
        <a href="mailto:hive@hive.baby" style={NAV_STYLE}>Feedback</a>
      </div>
    </footer>
  )
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <HiveNav />
        <main style={{ flex: 1 }}>{children}</main>
        <HiveFooter />
      </body>
    </html>
  )
}
