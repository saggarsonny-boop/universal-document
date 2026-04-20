import type { Metadata } from 'next'
import './globals.css'
import UDNav from '@/components/UDNav'
import UDFooter from '@/components/UDFooter'

export const metadata: Metadata = {
  title: 'UD Reader — Universal Document™ Reader',
  description: 'Open and read Universal Document (.uds) files. Free forever.',
  icons: { icon: '/favicon.svg' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <UDNav engine="UD Reader" />
        <main style={{ flex: 1 }}>{children}</main>
        <UDFooter />
      </body>
    </html>
  )
}
