import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'UD Credential — Issue Tamper-Evident Academic and Professional Credentials',
  description: 'Issue structured .uds credentials — degrees, diplomas, licences, professional qualifications — with tamper-evident sealing and expiry. Verifiable by employers without contacting the issuing institution.',
  keywords: 'digital credential issuer, tamper-evident credential, verifiable degree certificate, professional qualification document, academic credential tool, Credly credential alternative, LinkedIn credential alternative, digital diploma, credential verification tool, credential with expiry',
  openGraph: {
    title: 'UD Credential — Issue Tamper-Evident Academic and Professional Credentials',
    description: 'Structured .uds credentials with tamper-evident sealing and expiry — verifiable without contacting the issuer.',
    url: 'https://utilities.hive.baby/credential',
    siteName: 'Universal Document™',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
