import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'UD Pre-registration — Tamper-Evident Research Protocol Registration',
  description: 'Register your research hypothesis before data collection with cryptographic proof and cryptographic timestamp. Free forever. No account required.',
  openGraph: {
    title: 'UD Pre-registration — Tamper-Evident Research Protocol Registration',
    description: 'Register your research hypothesis before data collection with cryptographic proof and cryptographic timestamp. Free forever. No account required.',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
