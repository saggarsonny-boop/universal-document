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
  title: 'UD Validator — Verify .uds File Integrity, Schema, Expiry, and Signatures. Free.',
  description: 'Validate any Universal Document™ .uds or .udr file instantly. Check schema compliance, expiry date, embedded signatures, and structural integrity. No upload required — runs in your browser. Free.',
  keywords: 'validate UDS file, verify universal document, document integrity check, document schema validator, document expiry checker, signature verification tool, tamper-evident document verify, digital document validator, document hash check, UDS file checker',
  icons: { icon: '/favicon.svg' },
  metadataBase: new URL('https://validator.hive.baby'),
  openGraph: {
    title: 'UD Validator — Verify .uds File Integrity, Schema, Expiry, and Signatures. Free.',
    description: 'Validate Universal Document™ files instantly — schema, expiry, signatures, and structure. Runs in your browser. Free.',
    url: 'https://validator.hive.baby',
    siteName: 'Universal Document™',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable} ${dmMono.variable}`}>
      <body style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <UDNav engine="UD Validator" />
        <div style={{ background: '#c8960a', color: '#1e2d3d', fontFamily: 'var(--font-mono)', fontSize: 13, textAlign: 'center', padding: '0 24px', height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', letterSpacing: '0.05em', textTransform: 'uppercase', flexShrink: 0 }}>
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
