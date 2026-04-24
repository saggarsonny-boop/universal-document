import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'UD Title Chain — Build a Tamper-Evident Property Ownership History Bundle',
  description: 'Compile a sequential chain of title for any property — owner history, instrument types, document references — into a tamper-evident .udz bundle. Free, browser-only. No conveyancing software required.',
  keywords: 'title chain document, property ownership history, chain of title tool, conveyancing document, property title search, title abstract tool, real estate title chain, property history document, land registry alternative, title examination tool, conveyancing bundle',
  openGraph: {
    title: 'UD Title Chain — Build a Tamper-Evident Property Ownership History Bundle',
    description: 'Sequential chain of title — owner history, instrument types, document references — in a tamper-evident .udz bundle.',
    url: 'https://utilities.hive.baby/title-chain',
    siteName: 'Universal Document™',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
