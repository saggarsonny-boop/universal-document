import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'UD Reader — Universal Document Reader',
  description: 'Open and read Universal Document (.uds) files. Free forever.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
