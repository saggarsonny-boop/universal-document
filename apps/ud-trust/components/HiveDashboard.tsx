import React from 'react';

export default function HiveDashboard({ engineName, creditsUsed, maxCredits = 5 }) {
  const percentage = Math.min((creditsUsed / maxCredits) * 100, 100);
  
  return (
    <div style={{ border: '1px solid #334155', borderRadius: '12px', padding: '1.5rem', background: '#0f172a', marginBottom: '1.5rem', marginTop: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h3 style={{ fontWeight: 'bold', fontSize: '1.125rem', color: '#f1f5f9' }}>Your {engineName} Usage</h3>
        <span style={{ fontSize: '0.875rem', color: '#94a3b8', fontFamily: 'monospace' }}>{creditsUsed} / {maxCredits} Free Credits</span>
      </div>
      
      <div style={{ width: '100%', background: '#1e293b', borderRadius: '9999px', height: '0.5rem', marginBottom: '1.5rem' }}>
        <div 
          style={{ background: '#D4AF37', height: '0.5rem', borderRadius: '9999px', transition: 'width 0.5s', width: percentage + '%' }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div style={{ padding: '1rem', border: '1px solid #334155', borderRadius: '8px', background: '#1e293b' }}>
          <h4 style={{ fontWeight: 'bold', fontSize: '0.875rem', marginBottom: '0.25rem', color: '#e2e8f0' }}>Free Tier</h4>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.75rem' }}>Basic access, watermarked outputs.</p>
          <button style={{ width: '100%', padding: '0.5rem', fontSize: '0.75rem', fontWeight: 'bold', border: '1px solid #475569', borderRadius: '4px', background: 'transparent', color: '#94a3b8' }}>Current Plan</button>
        </div>
        
        <div style={{ padding: '1rem', border: '1px solid rgba(212, 175, 55, 0.3)', borderRadius: '8px', background: 'rgba(212, 175, 55, 0.05)', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '-10px', right: '10px', background: '#D4AF37', color: '#fff', fontSize: '10px', fontWeight: 'bold', padding: '2px 6px', borderRadius: '9999px' }}>PRO</div>
          <h4 style={{ fontWeight: 'bold', fontSize: '0.875rem', marginBottom: '0.25rem', color: '#D4AF37' }}>Plus Tier</h4>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.75rem' }}>$14/mo. No watermarks, priority speed.</p>
          <button style={{ width: '100%', padding: '0.5rem', fontSize: '0.75rem', fontWeight: 'bold', background: '#D4AF37', color: '#000', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Upgrade to Plus</button>
        </div>
      </div>
    </div>
  );
}
