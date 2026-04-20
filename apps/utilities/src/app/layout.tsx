import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'UD Utilities — Universal Document Tools',
  description: 'Merge, split, compress, OCR, protect, watermark, and more. Free PDF and document utilities from the Universal Document ecosystem.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <nav style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 24px', height: 56, borderBottom: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(10,12,16,0.95)', backdropFilter: 'blur(12px)',
          position: 'sticky', top: 0, zIndex: 100,
        }}>
          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <svg width="28" height="28" viewBox="0 0 28 28">
              <rect width="28" height="28" rx="6" fill="#003A8C"/>
              <text x="14" y="20" textAnchor="middle" fontFamily="Georgia,serif" fontWeight="700" fontSize="11" fill="#fff">UD</text>
            </svg>
            <span style={{ fontWeight: 700, fontSize: 15, color: '#f1f5f9' }}>UD Utilities</span>
          </a>
          <div style={{ display: 'flex', gap: 20, fontSize: 13, color: '#8892a4' }}>
            <a href="https://ud.hive.baby" style={{ color: '#8892a4' }}>UD Hub</a>
            <a href="https://converter.hive.baby" style={{ color: '#8892a4' }}>Converter</a>
          </div>
        </nav>
        {children}
        <footer style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          padding: '24px',
          textAlign: 'center',
          fontSize: 12,
          color: '#4a5568',
        }}>
          UD Utilities · Part of the Universal Document™ ecosystem · No ads. No investors. No agenda.
        </footer>
      </body>
    </html>
  )
}
