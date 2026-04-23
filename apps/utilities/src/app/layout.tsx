import type { Metadata } from 'next'
import { Playfair_Display, DM_Sans, DM_Mono } from 'next/font/google'
import './globals.css'
import UDNav from '@/components/UDNav'
import UDFooter from '@/components/UDFooter'

const playfair = Playfair_Display({ subsets: ['latin'], weight: ['400', '600', '700'], variable: '--font-display', display: 'swap' })
const dmSans = DM_Sans({ subsets: ['latin'], weight: ['300', '400', '500'], variable: '--font-body', display: 'swap' })
const dmMono = DM_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-mono', display: 'swap' })

export const metadata: Metadata = {
  title: 'Universal Document™ Utilities',
  description: 'Universal Document™ Utilities — merge, split, compress, OCR, protect, watermark, and more. Free forever.',
  icons: { icon: '/favicon.svg' },
  metadataBase: new URL('https://utilities.hive.baby'),
  openGraph: {
    title: 'Universal Document™ Utilities',
    description: 'Thirteen PDF and document tools. Free forever.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable} ${dmMono.variable}`}>
      <body style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <UDNav engine="UD Utilities" />
        <div style={{ background: '#c8960a', color: '#1e2d3d', fontFamily: 'var(--font-mono)', fontSize: 12, textAlign: 'center', padding: '0 24px', height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', letterSpacing: '0.05em', textTransform: 'uppercase', flexShrink: 0 }}>
          ✦ All Pro features free during beta — no account required · no credit card · full access while we build ✦
        </div>
        <main style={{ flex: 1 }}>{children}</main>
        <UDFooter />
      </body>
    </html>
  )
}
