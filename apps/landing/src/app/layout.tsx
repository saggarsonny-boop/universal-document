import type { Metadata } from 'next'
import { Playfair_Display, DM_Sans, DM_Mono } from 'next/font/google'
import './globals.css'
import UDNav from '@/components/UDNav'
import UDFooter from '@/components/UDFooter'

const playfair = Playfair_Display({ subsets: ['latin'], weight: ['400', '600', '700'], variable: '--font-display', display: 'swap' })
const dmSans = DM_Sans({ subsets: ['latin'], weight: ['300', '400', '500'], variable: '--font-body', display: 'swap' })
const dmMono = DM_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-mono', display: 'swap' })

export const metadata: Metadata = {
  title: 'Universal Document™ — The AI-Native, Structured Document Format. Open. Free. PDF Successor.',
  description: 'Universal Document™ (.uds) is an open, AI-native document format with structured sections, embedded provenance, cryptographic signing, expiry dates, and multilingual support. The modern successor to PDF. Free forever.',
  keywords: 'universal document format, UDS file format, AI native document, structured document format, PDF successor, PDF alternative, document format open standard, tamper-evident document format, expiring document, multilingual document format, document provenance, semantic document',
  icons: { icon: '/favicon.svg' },
  metadataBase: new URL('https://ud.hive.baby'),
  openGraph: {
    title: 'Universal Document™ — The AI-Native, Structured Document Format. Open. Free. PDF Successor.',
    description: 'Universal Document™ (.uds) — structured, tamper-evident, AI-native. The open document format for the age of AI. Free forever.',
    url: 'https://ud.hive.baby',
    siteName: 'Universal Document™',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable} ${dmMono.variable}`}>
      <body style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <UDNav engine="Universal Document™" />
        <div style={{ background: '#c8960a', color: '#1e2d3d', fontFamily: 'var(--font-mono)', fontSize: 13, textAlign: 'center', padding: '0 24px', height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', letterSpacing: '0.05em', textTransform: 'uppercase', flexShrink: 0 }}>
          ✦ All Pro features free during beta — no account required · no credit card · full access while we build ✦
        </div>
        <main style={{ flex: 1 }}>{children}</main>
        <UDFooter />
      </body>
    </html>
  )
}
