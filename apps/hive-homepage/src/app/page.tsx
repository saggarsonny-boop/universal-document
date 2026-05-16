"use client";

import { useState, useEffect } from "react";
// removed dynamic
import { Lock, X, ChevronRight, Terminal, Globe, Cpu, Stethoscope } from "lucide-react";

// Dynamically import removed for lightning banner

const ENGINE_DIRECTORY = [
  {
    category: "Universal Document Ecosystem",
    icon: <Globe className="w-4 h-4 text-[#D4AF37]" />,
    engines: [
      { name: "UD Converter", desc: "Turn any file into UDS.", url: "https://converter.hive.baby", status: "live" },
      { name: "UD Reader", desc: "Open and read any .uds or .udr file.", url: "https://reader.hive.baby", status: "live" },
      { name: "UD Creator", desc: "Write a Universal Document™ from scratch.", url: "https://creator.hive.baby", status: "live" },
      { name: "UD Validator", desc: "Verify schema, expiry, signatures.", url: "https://validator.hive.baby", status: "live" },
      { name: "UD Utilities", desc: "Merge, split, compress, protect.", url: "https://utilities.hive.baby", status: "live" },
      { name: "UD Signer", desc: "Governed signing with legal-grade audit trails.", url: "https://signer.hive.baby", status: "live" },
    ]
  },
  {
    category: "Clinical Analytics",
    icon: <Stethoscope className="w-4 h-4 text-[#D4AF37]" />,
    engines: [
      { name: "Hemodynamics", desc: "Enterprise CHF workstation & RV Risk.", url: "https://hemodynamics.hive.baby", status: "live" },
      { name: "Body Log", desc: "Longitudinal biometric tracking and analysis.", url: "https://hivebodylog.hive.baby", status: "live" },
      { name: "Systems Check", desc: "Automated physician diagnostic assistant.", url: "#", status: "building" },
      { name: "Sleep Console", desc: "Advanced chronotype & sleep architecture analysis.", url: "#", status: "building" },
    ]
  },
  {
    category: "Broadcast & Creator",
    icon: <Terminal className="w-4 h-4 text-[#D4AF37]" />,
    engines: [
      { name: "Teleprompter Engine", desc: "Machine Over Human speech delivery.", url: "https://teleprompter.hive.baby", status: "live" },
      { name: "Invisible Founder", desc: "Autonomous AI ghostwriter and strategist.", url: "#", status: "building" },
      { name: "Image Trainer", desc: "Custom AI portrait synthesis.", url: "#", status: "building" },
    ]
  },
  {
    category: "HiveOps Infrastructure",
    icon: <Cpu className="w-4 h-4 text-[#D4AF37]" />,
    engines: [
      { name: "Queen Bee Protocol", desc: "Master governance and constitutional layer.", url: "#", status: "classified" },
      { name: "iSDK", desc: "Embed Universal Document™ read/render.", url: "https://ud.hive.baby/isdk", status: "live" },
      { name: "cSDK", desc: "API access to creation, conversion, signing.", url: "https://ud.hive.baby/csdk", status: "live" },
    ]
  }
];

export default function HiveHomepage() {
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState(false);
  const [activeConnections, setActiveConnections] = useState(141);

  // Prevent hydration mismatch by setting random value after mount
  useEffect(() => {
    setActiveConnections(Math.floor(100 + Math.random() * 50));
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(true);
    setTimeout(() => setAuthError(false), 2000);
  };

  return (
    <main className="relative w-screen h-screen bg-black overflow-hidden font-sans text-white">
      
      {/* Lightning Background */}
      <div className="absolute inset-0 z-0 bg-[url('/lightning-bg.png')] bg-cover bg-center opacity-15 mix-blend-screen pointer-events-none"></div>

      <div className="absolute inset-0 z-10 flex flex-col md:flex-row pointer-events-none">
        
        {/* Left Panel: Hero */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 md:p-16 relative">
          <img 
            src="/logo.png" 
            alt="The Hive" 
            className="w-32 h-32 md:w-48 md:h-48 object-contain mb-6 mix-blend-screen drop-shadow-[0_0_30px_rgba(212,175,55,0.4)]"
          />
          <h1 className="text-4xl md:text-5xl font-bold tracking-[0.2em] uppercase text-center drop-shadow-xl">
            The Hive
          </h1>
          <p className="mt-4 text-[#D4AF37] tracking-widest uppercase text-xs md:text-sm font-bold text-center border-b border-[#D4AF37]/30 pb-4 inline-block px-4">
            Machine Over Human Architecture
          </p>
          <div className="mt-8 text-neutral-400 font-mono text-xs tracking-widest text-center max-w-sm">
            Autonomous ecosystems. 229 planned engines. One central node.
          </div>
          
          {/* Mobile Only: Scroll indicator */}
          <div className="md:hidden mt-12 animate-bounce text-[#D4AF37] font-mono text-xs tracking-widest uppercase flex flex-col items-center gap-2">
            <span>Scroll to Engines</span>
            <ChevronRight className="rotate-90" size={16} />
          </div>
        </div>

        {/* Right Panel: LCARS Directory */}
        <div className="flex-1 md:h-full overflow-y-auto pointer-events-auto bg-black/60 md:bg-black/40 backdrop-blur-sm border-l border-[#D4AF37]/20 p-6 md:p-12 scrollbar-thin scrollbar-thumb-[#D4AF37]/30 scrollbar-track-transparent">
          <div className="max-w-2xl mx-auto pb-24">
            <div className="flex items-center gap-4 mb-10 border-b border-[#D4AF37]/20 pb-4">
              <Terminal className="text-[#D4AF37] w-6 h-6" />
              <h2 className="text-xl md:text-2xl font-bold tracking-[0.15em] uppercase text-[#D4AF37]">
                Engine Directory
              </h2>
            </div>

            <div className="space-y-12">
              {ENGINE_DIRECTORY.map((section, idx) => (
                <div key={idx} className="relative">
                  <div className="flex items-center gap-3 mb-6 bg-gradient-to-r from-[#D4AF37]/10 to-transparent p-2 rounded-l border-l-2 border-[#D4AF37]">
                    {section.icon}
                    <h3 className="font-mono text-sm font-bold tracking-widest uppercase text-neutral-200">
                      {section.category}
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {section.engines.map((engine, eIdx) => (
                      <a 
                        key={eIdx}
                        href={engine.status === 'live' ? engine.url : undefined}
                        className={`block p-4 rounded bg-neutral-900/50 border ${engine.status === 'live' ? 'border-neutral-800 hover:border-[#D4AF37]/50 cursor-pointer' : 'border-neutral-900 opacity-50 cursor-not-allowed'} transition-colors group relative overflow-hidden`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold tracking-widest uppercase text-sm group-hover:text-[#D4AF37] transition-colors">
                            {engine.name}
                          </h4>
                          <span className={`text-[9px] font-mono tracking-widest uppercase px-2 py-0.5 rounded ${engine.status === 'live' ? 'bg-[#D4AF37]/20 text-[#D4AF37]' : engine.status === 'classified' ? 'bg-red-900/40 text-red-400' : 'bg-neutral-800 text-neutral-400'}`}>
                            {engine.status}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-400 font-mono leading-relaxed pr-4">
                          {engine.desc}
                        </p>
                        {engine.status === 'live' && (
                          <div className="absolute right-3 bottom-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <ChevronRight className="text-[#D4AF37] w-4 h-4" />
                          </div>
                        )}
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Hidden Admin Trigger */}
      <button 
        onClick={() => setIsAdminOpen(true)}
        className="absolute top-6 left-6 md:top-auto md:bottom-6 z-20 p-2 text-neutral-800 hover:text-[#D4AF37] transition-colors opacity-50 hover:opacity-100 pointer-events-auto"
      >
        <Lock size={16} />
      </button>

      {/* Admin Login Modal */}
      {isAdminOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md pointer-events-auto">
          <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-xl w-full max-w-md shadow-2xl relative">
            <button 
              onClick={() => setIsAdminOpen(false)}
              className="absolute top-4 right-4 text-neutral-500 hover:text-white"
            >
              <X size={20} />
            </button>
            <div className="flex items-center gap-3 mb-6">
              <Lock className="text-[#D4AF37]" size={24} />
              <h2 className="text-xl font-bold tracking-widest text-white uppercase">Queen Bee Console</h2>
            </div>
            <p className="text-neutral-400 text-sm mb-6">Enter protocol clearance to access network administration and live NOI dashboards.</p>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Clearance Code" 
                  className={`w-full bg-black border ${authError ? 'border-red-500' : 'border-neutral-800'} rounded p-4 text-white focus:outline-none focus:border-[#D4AF37] tracking-widest font-mono transition-colors`}
                  autoFocus
                />
                {authError && <p className="text-red-500 text-xs mt-2 font-mono">ERR: CLEARANCE DENIED</p>}
              </div>
              <button 
                type="submit"
                className="w-full bg-[#D4AF37] hover:bg-[#b0902c] text-black font-bold p-4 rounded tracking-widest uppercase transition-colors flex justify-center items-center gap-2"
              >
                Authenticate <ChevronRight size={18} />
              </button>
            </form>
          </div>
        </div>
      )}
      
      {/* Live Node Ticker UI at Bottom */}
      <div className="absolute bottom-0 left-0 w-full p-2 border-t border-neutral-900 bg-black/80 backdrop-blur pointer-events-none flex justify-between items-center z-10 text-[9px] md:text-xs font-mono text-neutral-500 uppercase tracking-widest">
        <div className="flex items-center gap-3 pl-2">
          <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse"></span>
          <span>Global Node Status: Active</span>
        </div>
        <div className="pr-2 hidden md:block">
          Active Connections: {activeConnections}
        </div>
      </div>
    </main>
  );
}
