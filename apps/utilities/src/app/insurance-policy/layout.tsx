import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'UD Insurance Policy — Structured Insurance Policy Document with Expiry and Coverage Metadata',
  description: 'Create a structured .uds insurance policy record with coverage details, premium schedule, expiry date, and tamper-evident sealing. Suitable for insurers, brokers, and self-insured organisations.',
  keywords: 'insurance policy document, structured insurance record, digital insurance policy, insurance expiry tracking, policy coverage metadata, insurance broker tool, certificate of insurance alternative, policy management document, insurance document tool, coverage schedule document',
  openGraph: {
    title: 'UD Insurance Policy — Structured Insurance Policy Document with Expiry and Coverage Metadata',
    description: 'Structured .uds insurance policy records with coverage details, premium schedule, expiry, and tamper-evident sealing.',
    url: 'https://utilities.hive.baby/insurance-policy',
    siteName: 'Universal Document™',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
