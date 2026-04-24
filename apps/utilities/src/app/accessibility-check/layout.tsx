import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'UD Accessibility Check — WCAG 2.1 and Section 508 Document Accessibility Audit',
  description: 'Run a WCAG 2.1 and Section 508 accessibility audit on any .uds document using Claude AI. Results embedded as structured metadata in the output file. Free, no account required.',
  keywords: 'WCAG 2.1 accessibility check, Section 508 compliance, document accessibility audit, accessibility compliance tool, CommonLook alternative, PDF accessibility checker, document ARIA audit, accessibility report document, WCAG checker tool, screen reader compliance check',
  openGraph: {
    title: 'UD Accessibility Check — WCAG 2.1 and Section 508 Document Accessibility Audit',
    description: 'WCAG 2.1 and Section 508 accessibility audits powered by Claude AI — results embedded in your document.',
    url: 'https://utilities.hive.baby/accessibility-check',
    siteName: 'Universal Document™',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
