import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'UD Insurance Claim — Consumer Insurance Claim Documentation Bundle',
  description: 'Document your insurance claim as a tamper-evident .udz bundle with photos, receipts, and incident details sealed at submission time. Free for 3/month.',
  keywords: 'insurance claim documentation, claim evidence bundle, insurance claim form, home insurance claim, car insurance claim, tamper-evident claim, claim document pack',
  openGraph: {
    title: 'UD Insurance Claim — Consumer Insurance Claim Documentation Bundle',
    description: 'Tamper-evident .udz claims bundle with photos, receipts, and incident details. Sealed at submission time.',
    url: 'https://utilities.hive.baby/insurance-claim-consumer',
    siteName: 'Universal Document™',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
