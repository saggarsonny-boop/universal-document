import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'UD Will — Create a Structured Will Document Free. Tamper-Evident.',
  description: 'Create a structured will and advance directive as a tamper-evident document with blockchain timestamp. Free for one basic will. Not a substitute for legal advice.',
  keywords: 'free will maker online, digital will creator, advance directive tool, living will creator free, estate planning document, will template free, last will testament tool, online will maker',
  openGraph: {
    title: 'UD Will — Create a Structured Will Document Free. Tamper-Evident.',
    description: 'Structured will and advance directive with blockchain timestamp. Free for one basic will. Consult a solicitor.',
    url: 'https://utilities.hive.baby/will',
    siteName: 'Universal Document™',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
