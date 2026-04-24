import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'UD Translate — Translate Any Document into Any Language with All Versions in One File',
  description: 'Translate any PDF, Word, or Universal Document™ file into multiple languages simultaneously. All language versions embedded in one file. Nobody else does this.',
  openGraph: {
    title: 'UD Translate — Translate Any Document into Any Language with All Versions in One File',
    description: 'Translate any PDF, Word, or Universal Document™ file into multiple languages simultaneously. All language versions embedded in one file. Nobody else does this.',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
