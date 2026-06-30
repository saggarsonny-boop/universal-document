import type { Metadata } from 'next'
import { Playfair_Display, DM_Sans, DM_Mono } from 'next/font/google'
import './globals.css'
import RegistryNav from '@/components/RegistryNav'
import RegistryFooter from '@/components/RegistryFooter'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { SITE_URL } from '@/lib/site'

const playfair = Playfair_Display({ subsets: ['latin'], weight: ['400', '600', '700'], variable: '--font-display', display: 'swap' })
const dmSans = DM_Sans({ subsets: ['latin'], weight: ['300', '400', '500'], variable: '--font-body', display: 'swap' })
const dmMono = DM_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-mono', display: 'swap' })

export const metadata: Metadata = {
  title: 'Universal Document Schema Registry — Governance, Schemas, and Standards',
  description: 'The authoritative catalogue of JSON Schema definitions for Universal Document™. Governance model, registration process, versioning, licensing, and national PKI integration.',
  keywords: 'schema registry, universal document, JSON schema, document governance, UDF, CC BY 4.0, document standards',
  metadataBase: new URL(SITE_URL),
  openGraph: {
    title: 'Universal Document Schema Registry',
    description: 'Governance, schemas, and standards for the Universal Document™ ecosystem.',
    url: SITE_URL,
    siteName: 'Universal Document Schema Registry',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable} ${dmMono.variable}`}>
      <body style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <RegistryNav />
        <main style={{ flex: 1 }}>{children}</main>
        <RegistryFooter />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
