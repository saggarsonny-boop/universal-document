import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'UD Tenancy Deposit — Tamper-Evident Property Inspection Reports',
  description: 'Document rental property condition at check-in and check-out with tamper-evident reports. Photos sealed at inspection time. Prevents deposit disputes with cryptographic evidence.',
  keywords: 'tenancy deposit protection, property condition report, check-in inspection, checkout inspection, deposit dispute evidence, landlord tenant inspection, rental property documentation',
  openGraph: {
    title: 'UD Tenancy Deposit — Tamper-Evident Property Inspection Reports',
    description: 'Seal property condition at check-in and check-out. Photos hashed at inspection time. Prevents deposit disputes.',
    url: 'https://utilities.hive.baby/tenancy-deposit',
    siteName: 'Universal Document™',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
