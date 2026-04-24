import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'UD Receipt — Tamper-Evident Purchase Receipts and Invoices',
  description: 'Convert any purchase receipt, invoice, or proof of payment into a tamper-evident .uds file. Cannot be altered after sealing. Free forever.',
  keywords: 'digital receipt, tamper-evident receipt, proof of purchase, invoice seal, expense record, receipt maker, digital invoice, immutable receipt',
  openGraph: {
    title: 'UD Receipt — Tamper-Evident Purchase Receipts and Invoices',
    description: 'Convert any purchase receipt or invoice into a tamper-evident .uds file. Cannot be altered after sealing.',
    url: 'https://utilities.hive.baby/receipt',
    siteName: 'Universal Document™',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
