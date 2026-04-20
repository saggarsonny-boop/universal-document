import type { Metadata } from 'next'
import './globals.css'
import UDNav from '@/components/UDNav'
import UDFooter from '@/components/UDFooter'

export const metadata: Metadata = {
  title: 'Universal Document™ Utilities',
  description: 'Universal Document™ Utilities — merge, split, compress, OCR, protect, watermark, and more. Free forever.',
  openGraph: { title: 'Universal Document™ Utilities', description: 'Thirteen PDF and document tools. Free forever.' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <UDNav engine="UD Utilities" />
        <main style={{ flex: 1 }}>{children}</main>
        <UDFooter />
      </body>
    </html>
  )
}
