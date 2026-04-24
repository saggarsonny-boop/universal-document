import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'UD Consent Manager — Structured Informed Consent with Expiry and Multilingual Output',
  description: 'Create structured .uds consent forms with automatic procedure-linked expiry, multilingual patient streams, and tamper-evident sealing. Works for surgery, research, data processing, and more.',
  keywords: 'informed consent form, digital consent management, structured consent document, multilingual consent form, patient consent tool, surgical consent form, clinical consent management, DocuSign consent alternative, Veeva consent alternative, consent form expiry tracking, research participant consent',
  openGraph: {
    title: 'UD Consent Manager — Structured Informed Consent with Expiry and Multilingual Output',
    description: 'Structured consent forms with procedure-linked expiry, multilingual patient streams, and tamper-evident sealing.',
    url: 'https://utilities.hive.baby/consent-manager',
    siteName: 'Universal Document™',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
