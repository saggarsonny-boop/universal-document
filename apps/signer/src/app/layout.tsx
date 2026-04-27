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
  title: 'UD Signer — Cryptographically Sign Any Document. Free Forever.',
  description: 'Sign PDFs, DOCX, .uds, .udr, and any file format with a tamper-evident cryptographic signature. Generates a .udsig companion proof file. No account required. Free forever.',
  keywords: 'document signing, cryptographic document signature, digital signature free, sign PDF online, tamper-evident document, document integrity proof, DocuSign alternative, Adobe Sign alternative, electronic signature tool, document hash signature',
  icons: { icon: '/favicon.svg' },
  metadataBase: new URL('https://signer.hive.baby'),
  openGraph: {
    title: 'UD Signer — Cryptographically Sign Any Document. Free Forever.',
    description: 'Sign any file format with a tamper-evident cryptographic signature. Generates a .udsig proof companion. No account required.',
    url: 'https://signer.hive.baby',
    siteName: 'Universal Document™',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable} ${dmMono.variable}`}>
      <body style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <UDNav engine="UD Signer" />
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
