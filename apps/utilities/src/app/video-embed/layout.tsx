import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'UD Video Embed — Embed Video Files Directly Inside Universal Document™ Files',
  description: 'Embed MP4, WebM, or MOV video files directly into a .uds document as base64-encoded metadata. Video travels with the document — no YouTube links, no broken embeds, no hosting dependency.',
  keywords: 'embed video in document, video document file, document with video, multimedia document tool, video attachment document, MP4 embed document, video without YouTube, video lecture notes document, video embedded document format, video document alternative',
  openGraph: {
    title: 'UD Video Embed — Embed Video Files Directly Inside Universal Document™ Files',
    description: 'Embed MP4, WebM, or MOV video directly into .uds documents — no YouTube links, no hosting dependency, no broken embeds.',
    url: 'https://utilities.hive.baby/video-embed',
    siteName: 'Universal Document™',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
