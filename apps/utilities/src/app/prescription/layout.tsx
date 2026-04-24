import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'UD Prescription — Structured Digital Prescription with Expiry and Multilingual Output',
  description: 'Create a structured .uds prescription with 30-day automatic expiry, multilingual patient streams, and tamper-evident sealing. Built for clarity, not to replace legally required prescriptions.',
  keywords: 'digital prescription record, structured prescription document, multilingual prescription, electronic prescription record, medication record document, prescription management, pharmacist prescription tool, NHS prescription alternative, EPS alternative, prescription expiry tracking',
  openGraph: {
    title: 'UD Prescription — Structured Digital Prescription with Expiry and Multilingual Output',
    description: 'Structured .uds prescriptions with 30-day expiry, multilingual streams, and tamper-evident sealing.',
    url: 'https://utilities.hive.baby/prescription',
    siteName: 'Universal Document™',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
