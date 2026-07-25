import React, { useState, useEffect } from 'react';

export default function CrossPollinationModal({ sourceEngine, targetEngine, targetUrl, description }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsOpen(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', bottom: '1rem', right: '1rem', maxWidth: '300px', background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '1.25rem', zIndex: 50, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}>
      <button 
        onClick={() => setIsOpen(false)}
        style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
      >
        ✕
      </button>
      <div style={{ fontSize: '10px', fontFamily: 'monospace', color: '#D4AF37', marginBottom: '0.5rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>The Hive Ecosystem</div>
      <h4 style={{ fontWeight: 'bold', fontSize: '1rem', marginBottom: '0.5rem', color: '#f1f5f9' }}>Try {targetEngine}</h4>
      <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '1rem' }}>{description}</p>
      <a 
        href={targetUrl}
        style={{ display: 'block', textAlign: 'center', padding: '0.5rem', background: '#f8fafc', color: '#020617', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 'bold', textDecoration: 'none' }}
      >
        Open {targetEngine} →
      </a>
    </div>
  );
}
