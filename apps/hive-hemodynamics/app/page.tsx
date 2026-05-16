"use client";

import { useState, useEffect } from "react";
import { Activity, BrainCircuit, HeartPulse, HardDriveDownload, FileText, ChevronRight } from "lucide-react";

export default function EnterpriseHemodynamics() {
  const [synced, setSynced] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  
  // Widget State
  const [sPAP, setSpap] = useState<number | "">("");
  const [dPAP, setDpap] = useState<number | "">("");
  const [mPAP, setMpap] = useState<number | "">("");
  const [rap, setRap] = useState<number | "">("");
  const [pcwp, setPcwp] = useState<number | "">("");
  const [co, setCo] = useState<number | "">("");
  const [map, setMap] = useState<number | "">("");

  const handleEpicSync = async () => {
    // Redirect to Epic Login
    window.location.href = "/api/auth/epic/login";
  };

  // Check URL for epic_sync=success when returning from callback
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('epic_sync') === 'success') {
        // Trigger the UI change
        setSynced(true);
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
        
        // Mock data populating since we have the token
        setSpap(45);
        setDpap(20);
        setMpap(30);
        setRap(15);
        setPcwp(18);
        setCo(3.2);
        setMap(65);
      }
    }
  }, []);

  const handleAiAnalyze = async () => {
    setAnalyzed(true);
  };

  // Computations
  const safeNum = (val: number | "") => (val === "" ? NaN : Number(val));
  const _spap = safeNum(sPAP);
  const _dpap = safeNum(dPAP);
  const _mpap = safeNum(mPAP);
  const _rap = safeNum(rap);
  const _pcwp = safeNum(pcwp);
  const _co = safeNum(co);
  const _map = safeNum(map);

  const papiValue = (!_spap || !_dpap || !_rap) ? "--" : ((_spap - _dpap) / _rap).toFixed(2);
  const svrValue = (!_map || !_rap || !_co) ? "--" : (((_map - _rap) / _co) * 80).toFixed(0);
  const pvrValue = (!_mpap || !_pcwp || !_co) ? "--" : (((_mpap - _pcwp) / _co) * 80).toFixed(0);
  const tpgValue = (!_mpap || !_pcwp) ? "--" : (_mpap - _pcwp).toFixed(0);
  const dpgValue = (!_dpap || !_pcwp) ? "--" : (_dpap - _pcwp).toFixed(0);

  return (
    <main className="min-h-screen bg-[#000] text-neutral-300 font-sans">
      <div className="max-w-[1600px] mx-auto min-h-screen flex flex-col bg-[#0a0a0a] border-x border-neutral-900 shadow-2xl">
      <header className="h-16 border-b border-neutral-800 bg-[#111] flex items-center justify-between px-6 lg:px-10 shrink-0">
        <div className="flex items-center gap-4">
          <HeartPulse className="text-[#D4AF37]" size={24} />
          <h1 className="font-display font-bold text-xl text-white tracking-wide">
            HIVE <span className="text-[#D4AF37]">HEMODYNAMICS</span> <span className="text-xs bg-[#D4AF37]/20 text-[#D4AF37] px-2 py-0.5 rounded ml-2 font-mono">ENTERPRISE</span>
          </h1>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleEpicSync}
            className="flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors border border-neutral-700"
          >
            <HardDriveDownload size={16} className="text-emerald-400" />
            Sync Epic FHIR
          </button>
          <button 
            onClick={handleAiAnalyze}
            className="flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors border border-neutral-700"
          >
            <BrainCircuit size={16} className="text-purple-400" />
            Anthropic Notes
          </button>
          <button className="flex items-center gap-2 bg-[#D4AF37] hover:bg-[#b5952f] text-black px-4 py-2 rounded-md text-sm font-bold transition-colors">
            <FileText size={16} />
            Export UDS
          </button>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
        {/* Sidebar Widget */}
        <aside className="w-full lg:w-[380px] shrink-0 border-b lg:border-b-0 lg:border-r border-neutral-800 bg-[#111] p-6 lg:p-10 flex flex-col gap-6 overflow-y-auto">
          <div>
            <h2 className="text-xs font-mono tracking-widest text-neutral-500 uppercase mb-4">Input Variables</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] text-neutral-400 mb-1">sPAP (mmHg)</label>
                <input type="number" value={sPAP} onChange={e => setSpap(Number(e.target.value))} className="w-full bg-[#0a0a0a] border border-neutral-800 rounded px-2 py-2 text-white font-mono text-sm focus:border-[#D4AF37] outline-none" />
              </div>
              <div>
                <label className="block text-[10px] text-neutral-400 mb-1">dPAP (mmHg)</label>
                <input type="number" value={dPAP} onChange={e => setDpap(Number(e.target.value))} className="w-full bg-[#0a0a0a] border border-neutral-800 rounded px-2 py-2 text-white font-mono text-sm focus:border-[#D4AF37] outline-none" />
              </div>
              <div>
                <label className="block text-[10px] text-neutral-400 mb-1">mPAP (mmHg)</label>
                <input type="number" value={mPAP} onChange={e => setMpap(Number(e.target.value))} className="w-full bg-[#0a0a0a] border border-neutral-800 rounded px-2 py-2 text-white font-mono text-sm focus:border-[#D4AF37] outline-none" />
              </div>
              <div>
                <label className="block text-[10px] text-neutral-400 mb-1">RAP (mmHg)</label>
                <input type="number" value={rap} onChange={e => setRap(Number(e.target.value))} className="w-full bg-[#0a0a0a] border border-neutral-800 rounded px-2 py-2 text-white font-mono text-sm focus:border-[#D4AF37] outline-none" />
              </div>
              <div>
                <label className="block text-[10px] text-neutral-400 mb-1">PCWP (mmHg)</label>
                <input type="number" value={pcwp} onChange={e => setPcwp(Number(e.target.value))} className="w-full bg-[#0a0a0a] border border-neutral-800 rounded px-2 py-2 text-white font-mono text-sm focus:border-[#D4AF37] outline-none" />
              </div>
              <div>
                <label className="block text-[10px] text-neutral-400 mb-1">CO (L/min)</label>
                <input type="number" value={co} onChange={e => setCo(Number(e.target.value))} className="w-full bg-[#0a0a0a] border border-neutral-800 rounded px-2 py-2 text-white font-mono text-sm focus:border-[#D4AF37] outline-none" />
              </div>
              <div>
                <label className="block text-[10px] text-neutral-400 mb-1">MAP (mmHg)</label>
                <input type="number" value={map} onChange={e => setMap(Number(e.target.value))} className="w-full bg-[#0a0a0a] border border-neutral-800 rounded px-2 py-2 text-white font-mono text-sm focus:border-[#D4AF37] outline-none" />
              </div>
            </div>
          </div>

          <div className="bg-[#1a1a1a] rounded-lg p-5 border border-neutral-800">
            <h2 className="text-xs font-mono tracking-widest text-neutral-500 uppercase mb-4 text-center">Derived Calculations</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-neutral-800 pb-2">
                <span className="text-sm font-medium text-neutral-300">PAPi</span>
                <span className="text-xl font-display font-bold text-[#D4AF37]">{papiValue}</span>
              </div>
              <div className="flex justify-between items-center border-b border-neutral-800 pb-2">
                <span className="text-sm font-medium text-neutral-300">SVR (dynes)</span>
                <span className="text-lg font-mono text-white">{svrValue}</span>
              </div>
              <div className="flex justify-between items-center border-b border-neutral-800 pb-2">
                <span className="text-sm font-medium text-neutral-300">PVR (dynes)</span>
                <span className="text-lg font-mono text-white">{pvrValue}</span>
              </div>
              <div className="flex justify-between items-center border-b border-neutral-800 pb-2">
                <span className="text-sm font-medium text-neutral-300">TPG (mmHg)</span>
                <span className="text-lg font-mono text-white">{tpgValue}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-neutral-300">DPG (mmHg)</span>
                <span className="text-lg font-mono text-white">{dpgValue}</span>
              </div>
            </div>
            {Number(papiValue) < 1.0 && Number(papiValue) > 0 && (
              <p className="text-red-400 text-xs mt-4 text-center font-bold bg-red-400/10 py-1.5 rounded">SEVERE RV DYSFUNCTION</p>
            )}
          </div>
        </aside>

        {/* Main Dashboard Grid */}
        <div className="flex-1 p-6 lg:p-12 overflow-y-auto bg-[#0a0a0a]">
          <div className="max-w-6xl mx-auto">
            {!synced ? (
            <div className="h-full flex flex-col items-center justify-center text-neutral-600 space-y-4 pt-20">
              <Activity size={48} className="opacity-20" />
              <p className="font-mono text-sm">Awaiting Epic FHIR Synchronization...</p>
              <button onClick={handleEpicSync} className="text-[#D4AF37] hover:underline text-sm font-medium">Click here to simulate sync</button>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in duration-700">
              {/* AI Analysis Banner */}
              {analyzed && (
                <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4 flex gap-4 items-start">
                  <BrainCircuit className="text-purple-400 shrink-0 mt-1" />
                  <div>
                    <h3 className="text-purple-300 font-bold text-sm mb-1">Anthropic Unstructured Note Analysis (Confidence: 94%)</h3>
                    <p className="text-purple-200/70 text-sm leading-relaxed">
                      Patient presents with severe RV dysfunction and bi-ventricular shock. High risk for rapid decompensation. Mechanical circulatory support (e.g., Impella RP or ECMO) evaluation is strongly recommended based on unstructured progress notes. Noted use of Milrinone and Epinephrine.
                    </p>
                  </div>
                </div>
              )}

              {/* Data Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Cardiac Output", val: `${co} L/min`, norm: "4-8 L/min" },
                  { label: "Cardiac Index", val: "1.8 L/min/m²", norm: "> 2.2" },
                  { label: "PCWP", val: `${pcwp} mmHg`, norm: "6-12 mmHg" },
                  { label: "Right Atrial", val: `${rap} mmHg`, norm: "2-6 mmHg" },
                  { label: "SVR", val: `${svrValue} dynes`, norm: "800-1200" },
                  { label: "PVR", val: `${pvrValue} dynes`, norm: "< 250" },
                  { label: "SvO2", val: "55%", norm: "> 65%" },
                  { label: "Lactate", val: "3.1 mmol/L", norm: "< 2.0" },
                  { label: "Mean PA", val: `${mPAP} mmHg`, norm: "10-20" },
                  { label: "Heart Rate", val: "105 bpm", norm: "60-100" },
                  { label: "MAP", val: `${map} mmHg`, norm: "> 65" },
                  { label: "SpO2", val: "92%", norm: "> 95%" },
                ].map((stat, i) => (
                  <div key={i} className="bg-[#111] border border-neutral-800 rounded-lg p-4 hover:border-neutral-700 transition-colors">
                    <p className="text-xs text-neutral-500 uppercase mb-2">{stat.label}</p>
                    <p className="text-xl font-mono text-white mb-1">{stat.val}</p>
                    <p className="text-[10px] text-neutral-600">Normal: {stat.norm}</p>
                  </div>
                ))}
              </div>

              {/* Waveform Mock Area */}
              <div className="bg-[#111] border border-neutral-800 rounded-lg p-6 h-64 flex flex-col relative overflow-hidden">
                <p className="text-xs text-emerald-500 uppercase tracking-widest font-mono z-10 absolute top-4 left-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Live Waveform Trace (Simulated)
                </p>
                <div className="flex-1 flex items-center justify-center">
                  <svg className="w-full h-32 text-emerald-500/30" viewBox="0 0 1000 100" preserveAspectRatio="none">
                    <path fill="none" stroke="currentColor" strokeWidth="2" d="M0,50 Q20,50 40,30 T80,50 T120,70 T160,50 T200,30 T240,50 T280,70 T320,50 T360,30 T400,50 T440,70 T480,50 T520,30 T560,50 T600,70 T640,50 T680,30 T720,50 T760,70 T800,50 T840,30 T880,50 T920,70 T960,50 T1000,30" />
                  </svg>
                </div>
                <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent_95%,rgba(16,185,129,0.2)_100%)] animate-[scan_2s_linear_infinite]" />
              </div>
              
              <div className="mt-8 text-center bg-neutral-900 border border-neutral-800 py-4 rounded-lg">
                <p className="text-neutral-400 font-mono text-xs">
                  We are in the 3-month free early-access period. Please email <a href="mailto:hive@hive.baby" className="text-[#D4AF37] hover:underline">hive@hive.baby</a> with feedback and feature suggestions.
                </p>
              </div>
            </div>
          )}
          </div>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html:`
        @keyframes scan {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}} />
      </div>
    </main>
  );
}
