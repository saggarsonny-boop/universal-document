import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'UD Separation Agreement — Tamper-Evident Separation and Divorce Agreement',
  description: 'Create a structured separation agreement as a tamper-evident .uds starting point for divorce negotiations. Neither party can claim terms were changed after agreement. Free for 1 basic.',
  keywords: 'separation agreement template, divorce document, financial settlement, child arrangements document, separation terms, tamper-evident separation, cohabitation breakdown',
  openGraph: {
    title: 'UD Separation Agreement — Tamper-Evident Separation and Divorce Agreement',
    description: 'Structured separation agreement as tamper-evident .uds. Neither party can claim terms were changed after agreement.',
    url: 'https://utilities.hive.baby/separation-agreement',
    siteName: 'Universal Document™',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
