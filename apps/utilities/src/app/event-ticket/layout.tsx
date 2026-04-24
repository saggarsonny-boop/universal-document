import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'UD Event Ticket — Tamper-Evident Event Tickets as .uds Files',
  description: 'Create tamper-evident event tickets as .uds files. Each ticket has a unique SHA-256 hash. Validate at the door using UD Validator — no special app needed. Free for 5/month.',
  keywords: 'digital event ticket, tamper-evident ticket, event ticket maker, ticket verification, event ticketing system, ticket without app, unique event ticket, DIY event tickets',
  openGraph: {
    title: 'UD Event Ticket — Tamper-Evident Event Tickets as .uds Files',
    description: 'Tamper-evident event tickets with unique hashes. Validate at the door via UD Validator. No special app needed.',
    url: 'https://utilities.hive.baby/event-ticket',
    siteName: 'Universal Document™',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
