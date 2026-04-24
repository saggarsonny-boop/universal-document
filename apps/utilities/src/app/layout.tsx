import type { Metadata } from 'next'
import { Playfair_Display, DM_Sans, DM_Mono } from 'next/font/google'
import './globals.css'
import UDNav from '@/components/UDNav'
import UDFooter from '@/components/UDFooter'

const playfair = Playfair_Display({ subsets: ['latin'], weight: ['400', '600', '700'], variable: '--font-display', display: 'swap' })
const dmSans = DM_Sans({ subsets: ['latin'], weight: ['300', '400', '500'], variable: '--font-body', display: 'swap' })
const dmMono = DM_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-mono', display: 'swap' })

export const metadata: Metadata = {
  title: 'UD Utilities — 57 AI-Powered Document Tools. Free Forever.',
  description: 'Merge, split, OCR, watermark, sign, translate, summarise, classify, embed media, generate legal bundles, register research, and more. 57 document tools powered by AI. No account required. Free forever.',
  keywords: 'document tools online, PDF utilities free, AI document processing, OCR online free, document merge split, watermark document, legal document bundle, medical document tools, research pre-registration, iLovePDF alternative, Smallpdf alternative, document AI tools, document summariser, legal bundle generator, medical consent form',
  icons: { icon: '/favicon.svg' },
  metadataBase: new URL('https://utilities.hive.baby'),
  openGraph: {
    title: 'UD Utilities — 57 AI-Powered Document Tools. Free Forever.',
    description: '57 document tools: merge, OCR, watermark, sign, translate, summarise, legal bundles, medical forms, and more. No account required.',
    url: 'https://utilities.hive.baby',
    siteName: 'Universal Document™',
    type: 'website',
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
