import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'UD Academic Paper — Convert Research Papers to Structured .uds Format',
  description: 'Convert any academic paper or preprint into a structured .uds file with citations as queryable data objects, figures as first-class content, and supplementary materials bundled. Free.',
  keywords: 'academic paper format, research paper conversion, preprint archive, citation management, structured research document, open science format, academic document management',
  openGraph: {
    title: 'UD Academic Paper — Convert Research Papers to Structured .uds Format',
    description: 'Academic papers as structured .uds with citations as queryable data. Supplementary materials bundled. Free.',
    url: 'https://utilities.hive.baby/academic-paper',
    siteName: 'Universal Document™',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
