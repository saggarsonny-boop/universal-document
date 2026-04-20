export default function CertifiedPage() {
  return (
    <main style={{ maxWidth: 860, margin: '0 auto', padding: '72px 24px', color: '#e2e8f0' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: 12 }}>UD Certified</h1>
      <p style={{ color: '#94a3b8', lineHeight: 1.7, marginBottom: 26 }}>
        UD Certified verifies that a product correctly handles UDR/UDS identity metadata, preprocessing utility traces,
        and lifecycle-safe conversion semantics.
      </p>

      <div style={{ border: '1px solid #1e293b', borderRadius: 12, padding: 18, background: 'rgba(15,23,42,0.6)' }}>
        <h2 style={{ fontSize: '1.05rem', marginBottom: 10 }}>Certification checklist</h2>
        <ul style={{ color: '#cbd5e1', lineHeight: 1.8, paddingLeft: 18 }}>
          <li>UDR light blue identity appears in metadata and preview pane</li>
          <li>UDS dark blue identity appears in metadata and preview pane</li>
          <li>Desktop/Finder/Explorer icon ids are deterministic</li>
          <li>Preprocessing utility trace is preserved through conversion/export</li>
          <li>Reader clarity rendering honors state and access rules</li>
        </ul>
      </div>
    </main>
  )
}
