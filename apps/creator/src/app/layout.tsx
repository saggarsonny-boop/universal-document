import type { Metadata } from 'next'
import './globals.css'
export const metadata: Metadata = {
  title: 'UD Creator — Build Universal Documents',
  description: 'Create .uds files with rich text, metadata, and expiry. The document format built for intelligence.',
}
const NAV: React.CSSProperties = { fontSize: '11px', color: 'rgba(180,200,225,0.55)', textDecoration: 'none' }
const DOT: React.CSSProperties = { color: 'rgba(26,58,92,0.5)', fontSize: '11px' }
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <header style={{ borderBottom: '1px solid rgba(13,31,53,0.7)', padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(2,4,8,0.6)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 50 }}>
          <a href="https://hive.baby" className="hive-planet" style={{ textDecoration: 'none', fontSize: '22px', lineHeight: '1' }}>🌍</a>
          <nav style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
            <a href="https://ud.hive.baby" style={NAV}>UD Hub</a>
            <span style={DOT}>·</span>
            <a href="https://converter.hive.baby" style={NAV}>Converter</a>
            <span style={DOT}>·</span>
            <a href="https://validator.hive.baby" style={NAV}>Validator</a>
          </nav>
        </header>
        <main style={{ flex: 1 }}>{children}</main>
        <footer style={{ borderTop: '1px solid rgba(13,31,53,0.8)', padding: '20px 24px 28px', textAlign: 'center' }}>
          <p style={{ fontSize: '11px', color: 'rgba(26,58,92,0.5)', marginBottom: '14px', letterSpacing: '0.05em' }}>Free forever. No ads. No investors. You are the investor.</p>
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="https://hive.baby" style={NAV}>hive.baby</a>
            <span style={DOT}>·</span>
            <a href="https://ud.hive.baby" style={NAV}>Universal Document</a>
            <span style={DOT}>·</span>
            <a href="mailto:hive@hive.baby" style={NAV}>Feedback</a>
          </div>
        </footer>
      </body>
    </html>
  )
}
