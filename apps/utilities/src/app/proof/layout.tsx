import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'UD Proof — Cryptographic Proof of Existence for Any Document or Idea',
  description: 'Prove any document, idea, or creative work existed at a specific moment. SHA256 hash + cryptographic timestamp. Free for 3 proofs per month. No account required.',
  keywords: 'proof of existence document, timestamp document free, prove idea first, intellectual property proof, document timestamp cryptographic, creative work proof of ownership, prior art proof tool, document existence certificate',
  openGraph: {
    title: 'UD Proof — Cryptographic Proof of Existence for Any Document or Idea',
    description: 'Prove any document, idea, or creative work existed at a specific moment. SHA256 hash + cryptographic timestamp.',
    url: 'https://utilities.hive.baby/proof',
    siteName: 'Universal Document™',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
