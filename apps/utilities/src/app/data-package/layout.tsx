import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'UD Data Package — Bundle Research Data with Methodology, Licensing, and Tamper-Evident Provenance',
  description: 'Bundle research datasets with methodology documentation, licensing terms, and tamper-evident provenance into a structured .udz package. Reproducibility-ready. Zenodo and OSF alternative.',
  keywords: 'research data package, open data bundle, data sharing tool, research dataset document, Zenodo alternative, Figshare alternative, OSF data package, reproducible research package, data provenance document, open science data tool, dataset metadata',
  openGraph: {
    title: 'UD Data Package — Bundle Research Data with Methodology, Licensing, and Tamper-Evident Provenance',
    description: 'Bundle research datasets with methodology, licensing, and provenance into a structured .udz. Reproducibility-ready.',
    url: 'https://utilities.hive.baby/data-package',
    siteName: 'Universal Document™',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
