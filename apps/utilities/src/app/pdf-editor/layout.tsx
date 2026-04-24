export const metadata = {
  title: 'UD PDF Editor — In-Browser PDF Text Editing, Seal as .uds',
  description:
    'Edit text in PDFs directly in your browser. Add annotations, fill forms, and seal the edited document as a tamper-evident .uds. No upload required. Free tier available.',
  keywords:
    'PDF editor, in-browser PDF editing, PDF text editor, PDF annotation, PDF form fill, tamper-evident PDF, free PDF editor',
  openGraph: {
    title: 'UD PDF Editor — In-Browser PDF Editing',
    description:
      'Edit text in PDFs in-browser, add annotations, and seal as a tamper-evident .uds. No file upload required.',
    url: 'https://utilities.hive.baby/pdf-editor',
    siteName: 'Universal Document™',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
