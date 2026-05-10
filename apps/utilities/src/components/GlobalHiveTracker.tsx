'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function GlobalHiveTracker() {
  const pathname = usePathname();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!pathname || pathname === '/') return;

    // The tool name is the first segment of the pathname (e.g. /academic-paper -> academic-paper)
    const tool = pathname.split('/')[1];

    // Fire Queen Bee Telemetry
    fetch('https://queenbee.hive.baby/api/govern', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        engineId: 'ud-utilities',
        input: 'tool_accessed',
        content: {
          toolName: tool,
          timestamp: new Date().toISOString()
        }
      })
    }).catch(err => console.warn('Queen Bee tracking failed:', err));

    // Show cross-pollination modal randomly after 10 seconds (10% chance)
    // or just show it after a delay to prove the concept
    const timer = setTimeout(() => {
      setShowModal(true);
    }, 8000);

    return () => clearTimeout(timer);
  }, [pathname]);

  if (!showModal) return null;

  return (
    <div className="fixed bottom-4 right-4 max-w-sm bg-white border border-gray-200 rounded-xl shadow-xl p-5 z-50 animate-in slide-in-from-bottom-5" style={{fontFamily: 'system-ui, sans-serif'}}>
      <button 
        onClick={() => setShowModal(false)}
        className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 border-none bg-transparent cursor-pointer"
      >
        ✕
      </button>
      <div className="text-[10px] font-mono text-[#c8960a] mb-2 tracking-widest uppercase" style={{fontFamily: "'DM Mono', monospace"}}>The Hive Ecosystem</div>
      <h4 className="font-bold text-base mb-2 text-gray-900" style={{margin: '0 0 8px 0'}}>Need more power?</h4>
      <p className="text-sm text-gray-600 mb-4" style={{margin: '0 0 16px 0'}}>
        UD Utilities is just the beginning. Check out our specialized enterprise engines like PlainScan Professional or Hive Field.
      </p>
      <a 
        href="https://plainscan2.hive.baby"
        className="block w-full text-center py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        style={{textDecoration: 'none', display: 'block'}}
      >
        Explore Hive →
      </a>
    </div>
  );
}
