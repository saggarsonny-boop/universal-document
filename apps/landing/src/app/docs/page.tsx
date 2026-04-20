const SECTIONS = [
  '1. Introduction',
  'What is UDS',
  'What is UDR',
  'Why UD exists',
  'Comparison to PDF, DOCX, HTML',
  '2. File Structure',
  'UDS schema',
  'UDR schema',
  'Metadata',
  'Clarity layers',
  'Multilingual ribbons',
  'Permissions',
  'Chain-of-custody',
  '3. UD Converter API',
  'Endpoints',
  'Input formats',
  'Output formats',
  'Error handling',
  'Rate limits',
  '4. UD Reader API',
  'Rendering',
  'Clarity layer toggles',
  'Accessibility',
  'Embedding',
  '5. UD Editor API',
  'Editing operations',
  'Section manipulation',
  'Metadata editing',
  'Versioning',
  'Exporting to UDS',
  '6. UD Utilities',
  'Merge',
  'Split',
  'OCR',
  'Extract',
  'Optimize',
  'Compare',
  'Redact',
  '7. Embedding UD in Applications',
  'Web',
  'Mobile',
  'Desktop',
  'Electron',
  'WASM',
  '8. Security Model',
  'Hashing',
  'Signing',
  'Permissions',
  'Revocation',
  'Audit logs',
  '9. Best Practices',
  'Document design',
  'Clarity layer usage',
  'Metadata hygiene',
  'Accessibility',
  '10. Roadmap',
  'UD Creator',
  'UD AI Assistants',
  'UD Enterprise',
  'UD Cloud',
]

export default function DocsPage() {
  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: '72px 24px', color: 'var(--ud-charcoal)' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: 8 }}>UD Developer Documentation</h1>
      <p style={{ color: 'var(--ud-slate)', lineHeight: 1.7, marginBottom: 22 }}>
        Official table of contents for the Universal Document developer docs.
      </p>
      <ol style={{ paddingLeft: 18, lineHeight: 1.9, color: 'var(--ud-charcoal)' }}>
        {SECTIONS.map((item) => (
          <li key={item} style={{ fontSize: 14 }}>{item}</li>
        ))}
      </ol>
    </main>
  )
}
