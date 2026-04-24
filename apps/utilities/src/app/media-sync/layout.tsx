import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'UD Media Sync — Synchronize Document Text with Audio or Video Timestamps Using AI',
  description: 'Generate timestamp alignment between a .uds document and any media file using Claude AI. Click a paragraph, jump to that moment. Sync points embedded in the document. Free.',
  keywords: 'document media synchronization, audio document sync, video transcript sync, synchronized document tool, media timestamp document, lecture notes sync, audio book document sync, paragraph timestamp mapping, document video alignment, AI media sync tool',
  openGraph: {
    title: 'UD Media Sync — Synchronize Document Text with Audio or Video Timestamps Using AI',
    description: 'AI-generated timestamp alignment between .uds documents and media — sync points embedded in the file.',
    url: 'https://utilities.hive.baby/media-sync',
    siteName: 'Universal Document™',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
