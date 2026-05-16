'use client'

export default function ComparePage() {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#000',
      color: '#fff',
      fontFamily: 'var(--font-sans, system-ui, -apple-system, sans-serif)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Gradient */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse at top, #1a1a1a 0%, #000 100%)',
        zIndex: 0
      }}></div>
      
      <div style={{
        maxWidth: 1024,
        margin: '0 auto',
        padding: '96px 24px',
        position: 'relative',
        zIndex: 10
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 16px',
            borderRadius: '99px',
            border: '1px solid rgba(212,175,55,0.3)',
            background: 'rgba(212,175,55,0.1)',
            color: '#D4AF37',
            fontSize: '13px',
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: '24px'
          }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#D4AF37' }}></span>
            Machine Over Human
          </div>
          
          <h1 style={{
            fontSize: 'clamp(40px, 6vw, 64px)',
            fontWeight: 900,
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            marginBottom: '24px'
          }}>
            The era of bloated <br/>
            <span style={{ background: 'linear-gradient(to right, #888, #555)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>signing suites is over.</span>
          </h1>
          <p style={{
            fontSize: '20px',
            color: '#999',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: 1.6
          }}>
            See exactly why high-end clinics, executives, and founders are abandoning DocuSign for the Hive Engine.
          </p>
        </div>

        {/* The Matrix */}
        <div style={{
          background: 'rgba(20,20,20,0.6)',
          backdropFilter: 'blur(20px)',
          border: '1px solid #333',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
          marginBottom: '64px'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '15px' }}>
            <thead>
              <tr style={{ background: 'rgba(0,0,0,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '12px', color: '#888', borderBottom: '1px solid #333' }}>
                <th style={{ padding: '24px', fontWeight: 700, width: '25%' }}>Capability</th>
                <th style={{ padding: '24px', fontWeight: 900, color: '#D4AF37', width: '25%', background: 'rgba(212,175,55,0.05)' }}>UD Signer (Hive)</th>
                <th style={{ padding: '24px', fontWeight: 500, width: '25%' }}>DocuSign</th>
                <th style={{ padding: '24px', fontWeight: 500, width: '25%' }}>Adobe Sign</th>
              </tr>
            </thead>
            <tbody>
              {[
                { cap: 'Time to First Action', hive: '< 3 Seconds (Dropzone)', docusign: '> 2 Mins (Wizard)', adobe: '> 2 Mins (Wizard)' },
                { cap: 'Cryptographic Proof', hive: 'SHA-256 Math (Local)', docusign: 'Proprietary Database', adobe: 'Proprietary PDF Lock' },
                { cap: 'Friction', hive: 'Near-Zero', docusign: 'High (Account Required)', adobe: 'High (Adobe ID)' },
                { cap: 'Privacy Architecture', hive: 'Browser-Based Execution', docusign: 'Cloud Uploaded', adobe: 'Cloud Uploaded' },
                { cap: 'UI/UX Aesthetic', hive: 'Glassmorphism HUD', docusign: 'Command Center Bloat', adobe: 'Ecosystem Heavy' },
                { cap: 'Pricing & Limits', hive: '$108/yr (50 Docs/mo)', docusign: '$120/yr (5 Docs/mo)', adobe: '$156/yr (Bundled)' },
              ].map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '20px 24px', fontWeight: 700, color: '#e5e5e5' }}>{row.cap}</td>
                  <td style={{ padding: '20px 24px', fontWeight: 700, color: '#D4AF37', background: 'rgba(212,175,55,0.05)' }}>{row.hive}</td>
                  <td style={{ padding: '20px 24px', color: '#888' }}>{row.docusign}</td>
                  <td style={{ padding: '20px 24px', color: '#888' }}>{row.adobe}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center' }}>
          <a href="/" style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px 32px',
            fontSize: '14px',
            fontWeight: 700,
            letterSpacing: '0.1em',
            color: '#000',
            textTransform: 'uppercase',
            background: '#D4AF37',
            borderRadius: '8px',
            textDecoration: 'none',
            boxShadow: '0 0 30px rgba(212,175,55,0.3)',
            transition: 'transform 0.2s',
          }}>
            Launch Engine Now
          </a>
          <p style={{ marginTop: '24px', fontSize: '14px', color: '#666', fontFamily: 'var(--font-mono, monospace)' }}>
            Free for your first 3 signatures every month.
          </p>
        </div>
      </div>
    </div>
  )
}
