import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'UD Smart Contract — Structured Contract Document with Expiry, Auto-Renewal, and Signature Ready',
  description: 'Create a structured .uds contract with expiry tracking, auto-renewal clause, both party details, and signature placeholders ready for UD Signer. Free, browser-only.',
  keywords: 'smart contract document, digital contract creator, structured contract tool, contract with expiry tracking, DocuSign contract alternative, e-signature contract, NDA generator, service agreement tool, employment contract template, contract auto-renewal, contract management tool',
  openGraph: {
    title: 'UD Smart Contract — Structured Contract Document with Expiry, Auto-Renewal, and Signature Ready',
    description: 'Structured .uds contracts with expiry tracking, auto-renewal, and signature placeholders for UD Signer. Free, browser-only.',
    url: 'https://utilities.hive.baby/smart-contract',
    siteName: 'Universal Document™',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
