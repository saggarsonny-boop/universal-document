import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'UD Medication List — Structured Medication Record with Per-Drug Expiry Tracking',
  description: 'Build a structured .uds medication list with per-medication expiry, dose, frequency, and prescriber details. Machine-readable, tamper-evident, and shareable across care settings.',
  keywords: 'medication list document, structured medication record, patient medication tracker, digital medication list, medication reconciliation, poly-pharmacy record, EHR medication export alternative, medication management tool, per-medication expiry tracking, prescriber medication record',
  openGraph: {
    title: 'UD Medication List — Structured Medication Record with Per-Drug Expiry Tracking',
    description: 'Structured .uds medication records with per-drug expiry, dose, frequency, and prescriber — machine-readable and tamper-evident.',
    url: 'https://utilities.hive.baby/medication-list',
    siteName: 'Universal Document™',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
