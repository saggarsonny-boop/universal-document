'use client';
import { useEffect } from 'react';

export default function HiveOpsWidget() {
  useEffect(() => {
    try {
      window.localStorage.setItem('governance_stamp', new Date().toISOString());
      console.log('[Queen Bee] Governance Active');

      try {
        let sessionId = window.localStorage.getItem('hive_session_id');
        if (!sessionId) {
          sessionId = crypto.randomUUID();
          window.localStorage.setItem('hive_session_id', sessionId);
        }
        const engineId = window.location.hostname.split('.')[0] || 'ud-trust';
        fetch('https://creator-console.vercel.app/api/telemetry', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            engine_id: engineId,
            session_id: sessionId,
            event_type: 'page_view',
            stamp: new Date().toISOString()
          })
        }).catch(() => {});
      } catch(e) {}

    } catch (e) {}
  }, []);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: document.title,
          url: window.location.href,
        });
      } catch (err) {}
    }
  };

  return (
    <div className="fixed bottom-0 left-0 w-full p-3 bg-zinc-950 border-t border-[#D4AF37] flex justify-between items-center z-[9999]">
      <div className="flex flex-col">
        <span className="text-[#D4AF37] font-bold text-sm tracking-widest uppercase">UNIVERSAL DOCUMENT INCORPORATED</span>
        <span className="text-[#D4AF37]/70 text-xs">DBA THE HIVE</span>
      </div>
      <button 
        onClick={handleShare} 
        className="px-6 py-2 bg-[#D4AF37] text-black font-bold rounded shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:scale-105 transition-transform"
      >
        SHARE
      </button>
    </div>
  );
};
