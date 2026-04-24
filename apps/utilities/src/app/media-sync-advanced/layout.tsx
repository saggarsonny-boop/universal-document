import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'UD Media Sync Advanced — Synchronize Documents with Audio and Video with Chapter Markers',
  description: 'Align any document with audio or video content. Click a paragraph, jump to that moment. Chapter markers, automatic sync. No other document format can do this.',
  keywords: 'document media synchronization, audio document sync, video transcript sync, chapter marker document, synchronized media document, multimedia document tool, legal transcript sync, lecture notes sync',
  openGraph: {
    title: 'UD Media Sync Advanced — Synchronize Documents with Audio and Video with Chapter Markers',
    description: 'Align any document with audio or video content. Click a paragraph, jump to that moment. Chapter markers, automatic sync.',
    url: 'https://utilities.hive.baby/media-sync-advanced',
    siteName: 'Universal Document™',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
