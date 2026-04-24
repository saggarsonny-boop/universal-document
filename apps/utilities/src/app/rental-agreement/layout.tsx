import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'UD Rental Agreement — Short-Term Rental Agreements as Tamper-Evident .uds',
  description: 'Create short-term rental agreements for holiday lets, room rentals, and Airbnb-style stays as tamper-evident .uds files. Host and guest layers. Expiry on checkout date. Free for 1/month.',
  keywords: 'short term rental agreement, holiday let contract, room rental agreement, Airbnb contract, rental document, guest agreement, host agreement, tamper-evident rental contract',
  openGraph: {
    title: 'UD Rental Agreement — Short-Term Rental Agreements as Tamper-Evident .uds',
    description: 'Short-term rental agreements as .uds with host and guest layers. Expiry on checkout. Simpler than UD Smart Lease.',
    url: 'https://utilities.hive.baby/rental-agreement',
    siteName: 'Universal Document™',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
