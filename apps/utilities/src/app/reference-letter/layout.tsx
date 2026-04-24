import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'UD Reference Letter — Tamper-Evident Reference and Recommendation Letters',
  description: 'Create tamper-evident reference and recommendation letters as .uds files. Cannot be altered after issuance. Recipients verify without contacting the referee. Free for 3/month.',
  keywords: 'reference letter maker, recommendation letter tamper-evident, employment reference document, academic reference letter, character reference, referee letter verification',
  openGraph: {
    title: 'UD Reference Letter — Tamper-Evident Reference and Recommendation Letters',
    description: 'Tamper-evident reference letters. Cannot be altered after issuance. Recipients verify without calling the referee.',
    url: 'https://utilities.hive.baby/reference-letter',
    siteName: 'Universal Document™',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
