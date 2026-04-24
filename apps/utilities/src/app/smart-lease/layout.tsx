import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'UD Smart Lease — Structured Lease Agreement with Expiry Tracking and Signature Ready',
  description: 'Create a structured .uds lease agreement with tenant and landlord details, term dates, rent schedule, break clauses, and tamper-evident sealing. Signature-ready for UD Signer. Free.',
  keywords: 'smart lease agreement, digital lease document, structured lease contract, lease with expiry tracking, landlord tenant agreement, DocuSign lease alternative, lease management tool, residential lease document, commercial lease tool, lease break clause tracker',
  openGraph: {
    title: 'UD Smart Lease — Structured Lease Agreement with Expiry Tracking and Signature Ready',
    description: 'Structured .uds lease agreements with term dates, rent schedule, break clauses, and tamper-evident sealing.',
    url: 'https://utilities.hive.baby/smart-lease',
    siteName: 'Universal Document™',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
