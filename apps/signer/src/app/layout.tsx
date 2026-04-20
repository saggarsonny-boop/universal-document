import type { Metadata } from 'next'
import './globals.css'
import UDNav from '@/components/UDNav'
import UDFooter from '@/components/UDFooter'

export const metadata: Metadata = {
  title: 'UD Signer — Sign any document. Free forever.',
  description: 'Sign PDFs, DOCX, UDS, UDR, and any file format. Generate cryptographic .udsig companion files. Free forever.',
  openGraph: {
    title: 'UD Signer — Universal Document Signing',
    description: 'Sign any document format. Generate .udsig companion proofs. Free forever.',
  },
  icons: { icon: '/favicon.svg' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <UDNav engine="UD Signer" />
        <main style={{ flex: 1 }}>{children}</main>
        <UDFooter />
      </body>
    </html>
  )
}
