import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'UD Policy Attestation — Tamper-Evident Employee Policy Read and Sign Records',
  description: 'Create cryptographic proof that employees read and understood your policies. GDPR, SOX, ISO 27001 compliant. Policy hash + attestation in one tamper-evident bundle.',
  keywords: 'policy attestation software, employee policy acknowledgment tool, GDPR policy compliance, SOX policy attestation, ISO 27001 policy management, policy read and sign tool, HR compliance document tool, employee policy tracking',
  openGraph: {
    title: 'UD Policy Attestation — Tamper-Evident Employee Policy Read and Sign Records',
    description: 'Cryptographic proof that employees read and understood your policies. GDPR, SOX, ISO 27001 compliant.',
    url: 'https://utilities.hive.baby/policy-attestation',
    siteName: 'Universal Document™',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
