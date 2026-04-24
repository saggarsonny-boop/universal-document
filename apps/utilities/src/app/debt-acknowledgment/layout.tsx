import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'UD Debt Acknowledgment — Tamper-Evident IOU and Debt Agreement',
  description: 'Create a tamper-evident debt acknowledgment between two parties. Cannot be altered after sealing. The IOU that actually holds up. Free for 3/month.',
  keywords: 'debt acknowledgment, IOU document, loan agreement, debt repayment schedule, money owed document, informal loan agreement, promissory note alternative, tamper-evident debt record',
  openGraph: {
    title: 'UD Debt Acknowledgment — Tamper-Evident IOU and Debt Agreement',
    description: 'Tamper-evident debt acknowledgment between two parties. Cannot be altered after sealing. The IOU that holds up.',
    url: 'https://utilities.hive.baby/debt-acknowledgment',
    siteName: 'Universal Document™',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
