import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'UD Transcript — Issue Tamper-Evident Academic Transcripts Verifiable Without Contacting the Institution',
  description: 'Issue structured .uds academic transcripts with module grades, awarding institution, and tamper-evident sealing. Employers and universities can verify authenticity without contacting the issuer. Free.',
  keywords: 'digital academic transcript, tamper-evident transcript, verifiable transcript, academic record document, university transcript tool, HEDD transcript alternative, transcript verification, student grade record, academic achievement record, digital transcript issuer',
  openGraph: {
    title: 'UD Transcript — Issue Tamper-Evident Academic Transcripts Verifiable Without Contacting the Institution',
    description: 'Structured .uds transcripts with module grades, institution, and tamper-evident sealing — verifiable without contacting the issuer.',
    url: 'https://utilities.hive.baby/transcript',
    siteName: 'Universal Document™',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
