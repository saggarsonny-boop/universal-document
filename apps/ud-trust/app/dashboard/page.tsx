"use client";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";

export default function Dashboard() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Simulated Stripe gate check
    setTimeout(() => setIsSubscribed(false), 500);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isSubscribed) {
    return (
      <div style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center' }}>
        <div className="card">
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--hive-gold)' }}>Authentication Required</h2>
          <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>
            This Sovereign-Lite tactical engine is restricted to Enterprise subscribers.
          </p>
          <div style={{ padding: '2rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', marginBottom: '2rem' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 700 }}>$699 <span style={{ fontSize: '1rem', color: '#64748b' }}>/ month</span></div>
          </div>
          <button className="btn btn-solid" style={{ width: '100%', padding: '1rem' }} onClick={() => {
            alert("Routing to Stripe Checkout... (Simulated success)");
            setIsSubscribed(true);
          }}>Authorize Payment & Deploy</button>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 style={{ color: 'var(--hive-gold)', marginBottom: '1rem' }}>UD Trust HUD</h2>
      <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', marginBottom: '2rem' }}>
        Network Status: <span style={{ color: isOnline ? '#10b981' : '#ef4444' }}>{isOnline ? "ONLINE (SYNCED)" : "OFFLINE (CACHING LOCALLY)"}</span>
      </div>
      <div style={{ border: '2px dashed var(--accent)', padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>
        Drag and drop documentation here for strategic analysis.
      </div>
    </div>
  );
}