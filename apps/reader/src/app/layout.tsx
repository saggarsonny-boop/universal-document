import type { Metadata } from 'next'
import { Playfair_Display, DM_Sans, DM_Mono } from 'next/font/google'
import './globals.css'
import UDNav from '@/components/UDNav'
import UDFooter from '@/components/UDFooter'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

const playfair = Playfair_Display({ subsets: ['latin'], weight: ['400', '600', '700'], variable: '--font-display', display: 'swap' })
const dmSans = DM_Sans({ subsets: ['latin'], weight: ['300', '400', '500'], variable: '--font-body', display: 'swap' })
const dmMono = DM_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-mono', display: 'swap' })

export const metadata: Metadata = {
  title: 'UD Reader — Open Any Universal Document™ File Free in Your Browser',
  description: 'Open, read, and verify any .uds or .udr file instantly in your browser. Clarity layers, multilingual switching, expiry status, tamper verification. Free forever. No install.',
  keywords: 'universal document reader, uds file opener, udr file viewer, pdf alternative reader, better than pdf viewer, open uds file, open udr file, document viewer browser, tamper evident document reader, clarity layer viewer, multilingual document reader, document expiry check',
  icons: { icon: '/favicon.svg' },
  manifest: '/manifest.json',
  metadataBase: new URL('https://reader.hive.baby'),
  openGraph: {
    title: 'UD Reader — Open Any Universal Document™ File Free in Your Browser',
    description: 'Open, read, and verify any .uds or .udr file in your browser. Tamper verification, expiry status, multilingual switching, clarity layers. Free forever.',
    url: 'https://reader.hive.baby',
    siteName: 'Universal Document™',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable} ${dmMono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
              navigator.serviceWorker.register('/sw.js')
            })
          }
        `}} />
      </head>
      <body style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <UDNav engine="UD Reader" />
        <div style={{ background: '#c8960a', color: '#1e2d3d', fontFamily: 'var(--font-mono)', fontSize: 12, textAlign: 'center', padding: '0 24px', height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', letterSpacing: '0.05em', textTransform: 'uppercase', flexShrink: 0 }}>
          ✦ All Pro features free during beta — no account required · no credit card · full access while we build ✦
        </div>
        <main style={{ flex: 1 }}>{children}</main>
        <UDFooter />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
