import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'UD Medical History — Personal Medical Record as Tamper-Evident .uds',
  description: 'Create a personal medical history document as a multilingual .uds file with patient, emergency responder, and specialist audience layers. Free for 1 per month.',
  keywords: 'personal medical history, medical record format, patient document, emergency medical record, health history document, medical information portable, multilingual medical record',
  openGraph: {
    title: 'UD Medical History — Personal Medical Record as Tamper-Evident .uds',
    description: 'Personal medical history with patient, emergency responder, and specialist audience layers. Multilingual .uds format.',
    url: 'https://utilities.hive.baby/medical-history',
    siteName: 'Universal Document™',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
