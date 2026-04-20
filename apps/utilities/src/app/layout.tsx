import type { Metadata } from 'next'
import './globals.css'
import UDNav from '@/components/UDNav'
import UDFooter from '@/components/UDFooter'

export const metadata: Metadata = {
  title: 'UD Utilities — Universal Document™ Tools',
  description: 'Merge, split, compress, OCR, protect, watermark, and more. Free PDF and document utilities from the Universal Document™ ecosystem.',
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
