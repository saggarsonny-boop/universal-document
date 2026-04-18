import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'UD Converter — Universal Document',
  description: 'Convert PDF, DOCX, and text files into Universal Document (.uds) format.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
