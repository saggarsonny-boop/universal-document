'use client';
 
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body style={{ backgroundColor: '#000', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', margin: 0, fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ textAlign: 'center', padding: '2rem', border: '1px solid #333', borderRadius: '12px', maxWidth: '400px' }}>
          <h2 style={{ color: '#D4AF37', marginBottom: '1rem' }}>System Recalibrating</h2>
          <p style={{ color: '#94a3b8', marginBottom: '2rem', fontSize: '0.875rem' }}>A temporal anomaly occurred within the engine. Our governance models have logged the deviation.</p>
          <button 
            onClick={() => reset()}
            style={{ backgroundColor: '#D4AF37', color: '#000', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', width: '100%' }}
          >
            Restart Engine
          </button>
        </div>
      </body>
    </html>
  )
}