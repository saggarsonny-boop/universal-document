import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'UD Audio Embed — Embed Audio Files Directly Inside Universal Document™ Files',
  description: 'Embed MP3, WAV, or OGG audio files directly into a .uds document as base64-encoded metadata. The audio travels with the document — no separate file, no broken links. Free, browser-only.',
  keywords: 'embed audio in document, audio document file, audio embedded PDF alternative, document with audio, multimedia document tool, audio attachment document, MP3 embed document, podcast document, lecture notes with audio, audio document format',
  openGraph: {
    title: 'UD Audio Embed — Embed Audio Files Directly Inside Universal Document™ Files',
    description: 'Embed MP3, WAV, or OGG audio directly into .uds documents as base64 metadata — the audio travels with the file.',
    url: 'https://utilities.hive.baby/audio-embed',
    siteName: 'Universal Document™',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
