import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'UD Steg Watermark — Embed Invisible Ownership Marks Verifiable by UD Validator',
  description: 'Embed a cryptographic ownership mark (SHA-256) invisibly into any .uds document as steganographic metadata. Ownership is verifiable by UD Validator — invisible to the naked eye, impossible to remove without detection.',
  keywords: 'steganographic watermark, invisible document watermark, cryptographic ownership mark, steganography document tool, document ownership proof, SHA-256 watermark, invisible copyright mark, document fingerprint, steg watermark tool, ownership verification document',
  openGraph: {
    title: 'UD Steg Watermark — Embed Invisible Ownership Marks Verifiable by UD Validator',
    description: 'Cryptographic SHA-256 ownership marks embedded invisibly in .uds documents — verifiable by UD Validator, impossible to remove without detection.',
    url: 'https://utilities.hive.baby/steg-watermark',
    siteName: 'Universal Document™',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
