import type { Metadata } from 'next'
import './globals.css'
import UDNav from '@/components/UDNav'
import UDFooter from '@/components/UDFooter'

export const metadata: Metadata = {
  title: 'Universal Document™ — The next document format',
  description: 'AI-native, semantic, expiring, multilingual. The document format built for the age of intelligence.',
  icons: { icon: '/favicon.svg' },
  openGraph: {
    title: 'Universal Document™',
    description: 'The next document format. AI-native. Semantic. Expiring. Multilingual.',
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
