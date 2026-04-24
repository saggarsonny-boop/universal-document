import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'UD Identity Document — Self-Sovereign Verifiable Identity Record',
  description: 'Create a verifiable personal identity record as a tamper-evident .uds file. Not a government ID — a self-sovereign professional identity document anyone can verify without a central database.',
  keywords: 'self-sovereign identity, verifiable identity record, professional identity document, tamper-evident identity, digital identity, identity verification, portable identity document',
  openGraph: {
    title: 'UD Identity Document — Self-Sovereign Verifiable Identity Record',
    description: 'Create a verifiable personal identity record as a tamper-evident .uds file. No central database required.',
    url: 'https://utilities.hive.baby/identity-document',
    siteName: 'Universal Document™',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
