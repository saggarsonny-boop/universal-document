import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'UD Highlight — Structural Document Highlighting That Travels With Your File',
  description: 'Add permanent structural highlights to any document. Unlike PDF annotations that can be stripped, UD highlights are tamper-evident and embedded in the document itself.',
  openGraph: {
    title: 'UD Highlight — Structural Document Highlighting That Travels With Your File',
    description: 'Add permanent structural highlights to any document. Unlike PDF annotations that can be stripped, UD highlights are tamper-evident and embedded in the document itself.',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
