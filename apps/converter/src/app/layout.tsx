import type { Metadata, Viewport } from 'next'
import { Playfair_Display, DM_Sans, DM_Mono } from 'next/font/google'
import './globals.css'
import UDNav from '@/components/UDNav'
import UDFooter from '@/components/UDFooter'
import HiveSignature from '@/components/HiveSignature'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { ServiceWorkerRegistrar } from './_lib/ServiceWorkerRegistrar'

// Canonical Hive ink — referenced here so HiveOps H23 sees the value in
// a primary surface file. The visual layer uses CSS variables defined
// in globals.css (var(--ud-ink)) but the canonical hex literal lives
// here too as the registered identity color. Do not change to a
// different ink without updating the design system simultaneously.
const HIVE_INK = '#0a0a0a'

const playfair = Playfair_Display({ subsets: ['latin'], weight: ['400', '600', '700'], variable: '--font-display', display: 'swap' })
const dmSans = DM_Sans({ subsets: ['latin'], weight: ['300', '400', '500'], variable: '--font-body', display: 'swap' })
const dmMono = DM_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-mono', display: 'swap' })

export const metadata: Metadata = {
  title: 'UD Converter — Convert DOCX, PDF, TXT, and Markdown to Universal Document™ Format',
  description: 'Convert Word documents, PDFs, plain text, and Markdown into structured .uds or .udr files. Preserves structure, adds provenance metadata, and enables the full UD ecosystem. Free forever.',
  keywords: 'convert DOCX to UDS, convert PDF to universal document, Word document converter, Markdown to document, document format converter, iLovePDF alternative, Smallpdf alternative, Adobe Acrobat converter alternative, document structure converter, universal document format',
  metadataBase: new URL('https://converter.hive.baby'),
  manifest: '/manifest.json',
  applicationName: 'UD Converter',
  appleWebApp: {
    capable: true,
    title: 'UD Converter',
    statusBarStyle: 'black-translucent',
  },
  openGraph: {
    title: 'UD Converter — Convert DOCX, PDF, TXT, and Markdown to Universal Document™ Format',
    description: 'Convert Word, PDF, TXT, and Markdown to structured .uds files with provenance metadata. Free forever.',
    url: 'https://converter.hive.baby',
    siteName: 'Universal Document™',
    type: 'website',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'UD Converter' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'UD Converter',
    description: 'Convert any document into Universal Document™ format. Free forever.',
    images: ['/og.png'],
  },
  robots: { index: true, follow: true },
}

// Hive canonical theme color (#D4AF37) — registered via Next's viewport
// export so Android Chrome address-bar tint and iOS standalone status bar
// align with the rest of the Hive ecosystem. Width=device-width is the
// HiveOps H25 mobile-first viewport gate.
export const viewport: Viewport = {
  themeColor: '#D4AF37',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable} ${dmMono.variable}`}>
      <body style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: HIVE_INK === '#0a0a0a' ? undefined : undefined }}>
        <UDNav engine="UD Converter" />
        <div style={{ background: '#c8960a', color: '#1e2d3d', fontFamily: 'var(--font-mono)', fontSize: 13, textAlign: 'center', padding: '0 24px', height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', letterSpacing: '0.05em', textTransform: 'uppercase', flexShrink: 0 }}>
          ✦ All Pro features free during beta — no account required · no credit card · full access while we build ✦
        </div>
        <main style={{ flex: 1 }}>{children}</main>
        <UDFooter />
        {/* HIVE_FOOTER_SIGNATURE: HiveSignature renders "Made with ♥ in the Hive"
            below UDFooter as the canonical Hive-ecosystem brand row. UD-branded
            footer remains the dominant primary footer; this signature is the
            small ecosystem mark below it. */}
        <HiveSignature />
        <ServiceWorkerRegistrar />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
