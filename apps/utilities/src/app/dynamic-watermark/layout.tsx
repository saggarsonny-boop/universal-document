import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'UD Dynamic Watermark — Embed Identity-Linked Watermarks That Travel With Your Document',
  description: 'Embed a dynamic watermark — recipient name, date, access level — into any .uds document as structured metadata. The watermark travels with the file and cannot be stripped. Free, browser-only.',
  keywords: 'dynamic watermark document, identity watermark, document watermarking tool, recipient watermark, Digify watermark alternative, Vitrium watermark alternative, document DRM alternative, watermark PDF alternative, access-level watermark, tamper-evident watermark',
  openGraph: {
    title: 'UD Dynamic Watermark — Embed Identity-Linked Watermarks That Travel With Your Document',
    description: 'Dynamic watermarks embedded as structured metadata — recipient-linked, tamper-evident, and impossible to strip.',
    url: 'https://utilities.hive.baby/dynamic-watermark',
    siteName: 'Universal Document™',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
