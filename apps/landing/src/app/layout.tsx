import type { Metadata } from 'next'
import './globals.css'
import UDNav from '@/components/UDNav'
import UDFooter from '@/components/UDFooter'

export const metadata: Metadata = {
  title: 'Universal Document™',
  description: 'Universal Document™ — the next-generation document format. AI-native, semantic, expiring, multilingual.',
  icons: { icon: '/favicon.svg' },
  openGraph: {
    title: 'Universal Document™',
    description: 'Universal Document™ — the next-generation document format. AI-native. Semantic. Expiring. Multilingual.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <UDNav engine="Universal Document" />
        <main style={{ flex: 1 }}>{children}</main>
        <UDFooter />
      </body>
    </html>
  )
}
