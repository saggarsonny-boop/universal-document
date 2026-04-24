import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'UD Certificate Issuer — Issue Tamper-Evident Digital Certificates with Expiry and Verification',
  description: 'Issue structured .uds certificates of completion, achievement, or compliance with expiry dates, issuer attribution, and tamper-evident sealing. Verifiable by anyone with UD Reader. Free.',
  keywords: 'digital certificate issuer, certificate of completion tool, tamper-evident certificate, verifiable digital certificate, Credly alternative, PDF certificate alternative, compliance certificate, achievement certificate generator, certificate with expiry, certificate verification tool',
  openGraph: {
    title: 'UD Certificate Issuer — Issue Tamper-Evident Digital Certificates with Expiry and Verification',
    description: 'Structured .uds certificates with expiry dates, issuer attribution, and tamper-evident sealing — verifiable by anyone.',
    url: 'https://utilities.hive.baby/certificate-issuer',
    siteName: 'Universal Document™',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
