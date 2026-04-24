import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'UD Regulatory Filing — Structured Regulatory Submission Record with Tamper-Evident Audit Trail',
  description: 'Create a structured .uds record of a regulatory filing with submission date, regulator, reference number, and tamper-evident chain of custody. Works for EDGAR, FDA, FCA, and equivalent regulators.',
  keywords: 'regulatory filing tool, regulatory submission record, EDGAR filing alternative, FDA eSub record, FCA regulatory filing, compliance submission document, structured regulatory record, tamper-evident filing, regulatory audit trail, compliance document management',
  openGraph: {
    title: 'UD Regulatory Filing — Structured Regulatory Submission Record with Tamper-Evident Audit Trail',
    description: 'Structured .uds regulatory filing records with submission date, reference, and tamper-evident chain of custody.',
    url: 'https://utilities.hive.baby/regulatory-filing',
    siteName: 'Universal Document™',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
