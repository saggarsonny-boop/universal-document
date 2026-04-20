export default function ISDKPage() {
  return (
    <main style={{ maxWidth: 860, margin: '0 auto', padding: '72px 24px', color: '#e2e8f0' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: 10 }}>UD Reader iSDK</h1>
      <p style={{ color: '#94a3b8', marginBottom: 24, lineHeight: 1.7 }}>
        The iSDK is the embedded reader surface for UDR/UDS files. It exposes identity metadata, preview-pane descriptors,
        and normalized block rendering hooks for host applications.
      </p>
      <div style={{ border: '1px solid #1e293b', borderRadius: 12, padding: 18, background: 'rgba(15,23,42,0.6)' }}>
        <h2 style={{ fontSize: '1.05rem', marginBottom: 8 }}>Core capabilities</h2>
        <ul style={{ color: '#cbd5e1', lineHeight: 1.8, paddingLeft: 18 }}>
          <li>Render semantic UD blocks with language and clarity switching</li>
          <li>Read UDR/UDS identity metadata and watermark hints</li>
          <li>Expose deterministic icon metadata for host-level previews</li>
          <li>Validate expiry, revocation, and chain-of-custody state</li>
        </ul>
      </div>
    </main>
  )
}
