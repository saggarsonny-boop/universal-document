import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'UD Petition — Tamper-Evident Petitions with Mathematical Proof of Integrity',
  description: 'Create a tamper-evident petition where the text is sealed and cannot be altered after the first signature. Every signatory signs the same cryptographic version. Free forever.',
  keywords: 'tamper-evident petition, digital petition, petition integrity, open petition, change.org alternative, petition with proof, cryptographic petition, petition document',
  openGraph: {
    title: 'UD Petition — Tamper-Evident Petitions with Mathematical Proof',
    description: 'Petition text sealed on first signature. Every signatory signs the same version. Mathematical proof of integrity.',
    url: 'https://utilities.hive.baby/petition',
    siteName: 'Universal Document™',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
