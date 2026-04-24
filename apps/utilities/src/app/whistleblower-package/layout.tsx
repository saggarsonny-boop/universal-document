import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'UD Whistleblower Package — Anonymous Evidence Bundle for Compliance Disclosure',
  description: 'Create a tamper-evident anonymous whistleblower evidence package. SHA-256 sealed .udz bundle. No IP logging. Free for submitters, Enterprise for organisations.',
  keywords: 'whistleblower tool, anonymous disclosure, compliance reporting, evidence bundle, SEC whistleblower, FCA whistleblower, tamper-evident disclosure, anonymous reporting tool, corporate compliance, speak up reporting',
  openGraph: {
    title: 'UD Whistleblower Package — Anonymous Evidence Bundle for Compliance Disclosure',
    description: 'Tamper-evident anonymous evidence bundle. No IP logged. SHA-256 sealed .udz for whistleblower disclosures.',
    url: 'https://utilities.hive.baby/whistleblower-package',
    siteName: 'Universal Document™',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
