import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'UD Power of Attorney — Structured POA Draft as Tamper-Evident .uds',
  description: 'Create a structured Power of Attorney document as a tamper-evident .uds — General, Lasting, Financial, or Medical POA. A starting point for legal review. Free for 1 basic.',
  keywords: 'power of attorney template, lasting power of attorney, POA document, LPA template, financial power of attorney, medical power of attorney, enduring power of attorney, POA draft',
  openGraph: {
    title: 'UD Power of Attorney — Structured POA Draft as Tamper-Evident .uds',
    description: 'Structured Power of Attorney draft as .uds — General, Lasting, Financial, or Medical. Starting point for legal review.',
    url: 'https://utilities.hive.baby/power-of-attorney',
    siteName: 'Universal Document™',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
