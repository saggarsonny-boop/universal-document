import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'UD Notarize — Document Self-Certification and Notarization Preparation',
  description: 'Cryptographically self-certify any document or prepare it for Remote Online Notarization. Free for 3 per month. Not a replacement for a licensed notary where legally required.',
  keywords: 'document self certification, notarization preparation tool, remote online notarization prep, RON document preparation, digital notary alternative, document certification free, notarize document online',
  openGraph: {
    title: 'UD Notarize — Document Self-Certification and Notarization Preparation',
    description: 'Self-certify documents cryptographically or prepare them for Remote Online Notarization.',
    url: 'https://utilities.hive.baby/notarize',
    siteName: 'Universal Document™',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
