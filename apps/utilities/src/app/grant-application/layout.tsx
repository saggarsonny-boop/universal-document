import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'UD Grant Application — Tamper-Evident Grant Applications with Submission Proof',
  description: 'Structure any grant application as a tamper-evident .uds with cryptographic timestamp proving on-time submission. Supplementary documents bundled as .udz. Free.',
  keywords: 'grant application template, research grant document, charitable grant application, proof of submission, grant application bundle, academic funding application, grant deadline proof',
  openGraph: {
    title: 'UD Grant Application — Tamper-Evident Grant Applications with Submission Proof',
    description: 'Tamper-evident grant applications with cryptographic timestamp proving on-time delivery.',
    url: 'https://utilities.hive.baby/grant-application',
    siteName: 'Universal Document™',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
