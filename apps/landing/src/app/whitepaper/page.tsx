const SECTIONS = [
  {
    title: '1. Legacy file -> Converter -> UDS',
    body: 'Legacy formats (PDF, DOCX, TXT, CSV, images) first pass through preprocessing utilities such as merge, OCR, redact, optimize, and compare. The normalized output is then converted into UD payload blocks and exported with deterministic visual identity metadata.',
  },
  {
    title: '2. UDS -> Reader -> Clarity',
    body: 'UD Reader validates schema and renders by block semantics rather than brittle page geometry. UDS state, watermark color, and icon metadata are shown in the preview pane to reduce ambiguity.',
  },
  {
    title: '3. UDR -> Editor dashboard -> UDS',
    body: 'UD Creator/Editor supports editable UDR and sealed UDS states. Editing occurs in dashboard blocks, then exports preserve identity fields, watermark tone, and icon metadata at file level.',
  },
  {
    title: '4. Visual identity system',
    body: 'UDR uses light blue identity markers. UDS uses dark blue markers. Both carry desktop icon ids, Finder/Explorer preview ids, and preview pane metadata in a deterministic map.',
  },
]

export default function WhitepaperPage() {
  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: '72px 24px', color: '#e2e8f0' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: 10 }}>UD Lifecycle Whitepaper</h1>
      <p style={{ color: '#94a3b8', marginBottom: 28, lineHeight: 1.7 }}>
        This onboarding whitepaper explains how preprocessing, conversion, reading, and editing fit together in a single lifecycle.
      </p>
      <div style={{ display: 'grid', gap: 14 }}>
        {SECTIONS.map((section) => (
          <article key={section.title} style={{ border: '1px solid #1e293b', borderRadius: 12, padding: 18, background: 'rgba(15,23,42,0.56)' }}>
            <h2 style={{ fontSize: '1.05rem', marginBottom: 8 }}>{section.title}</h2>
            <p style={{ color: '#cbd5e1', lineHeight: 1.75 }}>{section.body}</p>
          </article>
        ))}
      </div>
    </main>
  )
}
