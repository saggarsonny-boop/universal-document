"use client";

import { useState, useRef } from "react";
import { UploadCloud, CheckCircle, FileText, ChevronRight, Briefcase, Lock, SearchCode, HardDriveDownload } from "lucide-react";

export default function HiveCV() {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [complete, setComplete] = useState(false);

  const [isPro, setIsPro] = useState(false);
  const [downloadBlob, setDownloadBlob] = useState<{blob: Blob, name: string} | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleProcess = async () => {
    if (!file) return;
    setProcessing(true);
    
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('isPro', String(isPro));

      const res = await fetch('/api/parse-cv', {
        method: 'POST',
        body: form
      });

      if (!res.ok) throw new Error('Failed to process');
      const payload = await res.json();

      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      setDownloadBlob({ blob, name: "Resume_Verified.uds" });
      setComplete(true);
    } catch (e) {
      console.error(e);
      alert('Error processing file');
    }
    setProcessing(false);
  };

  const downloadUds = () => {
    if (!downloadBlob) return;
    const url = URL.createObjectURL(downloadBlob.blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = downloadBlob.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-neutral-300 font-sans flex flex-col items-center py-20 px-6">
      {/* Header */}
      <div className="max-w-3xl w-full text-center space-y-4 mb-16">
        <div className="inline-flex items-center gap-2 bg-[#D4AF37]/10 text-[#D4AF37] px-3 py-1 rounded-full text-xs font-mono font-bold tracking-widest mb-4 border border-[#D4AF37]/20">
          <Briefcase size={14} />
          HIVE CV
        </div>
        <h1 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tight">
          The End of the <span className="text-[#D4AF37] relative">
            PDF Resume
            <svg className="absolute w-full h-3 -bottom-1 left-0 text-[#D4AF37]/30" viewBox="0 0 100 10" preserveAspectRatio="none"><path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="2" fill="none"/></svg>
          </span>
        </h1>
        <p className="text-neutral-400 text-lg max-w-2xl mx-auto leading-relaxed">
          Upload your standard resume. Convert it to a Universal Document (UDS) instantly for free, or use our Pro Anthropic engine to rewrite and optimize it for ATS.
        </p>
      </div>

      {/* Main Action Area */}
      <div className="max-w-xl w-full bg-[#111] border border-neutral-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        {!complete ? (
          <div className="space-y-6">
            {/* Tier Selector */}
            <div className="flex bg-neutral-900 rounded-xl p-1 border border-neutral-800">
              <button 
                onClick={() => setIsPro(false)}
                className={"flex-1 py-3 text-sm font-bold rounded-lg transition-colors " + (!isPro ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-500 hover:text-white')}
              >
                Free Conversion
              </button>
              <button 
                onClick={() => setIsPro(true)}
                className={"flex-1 py-3 text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2 " + (isPro ? 'bg-[#D4AF37] text-black shadow-[0_0_15px_rgba(212,175,55,0.2)]' : 'text-neutral-500 hover:text-[#D4AF37]')}
              >
                <SearchCode size={16} />
                Pro AI Rewrite
              </button>
            </div>

            {isPro && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <a href="https://buy.stripe.com/14A6oJ6Mv3sReEa0YV0RG00" target="_blank" rel="noreferrer" className="flex flex-col items-center p-4 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-xl hover:bg-[#D4AF37]/20 transition-colors">
                  <span className="text-xs text-[#D4AF37] font-bold uppercase tracking-wider mb-1">Monthly</span>
                  <span className="text-xl font-display font-bold text-white mb-2">$1.99<span className="text-sm text-neutral-500 font-sans font-normal">/mo</span></span>
                  <span className="text-[10px] text-neutral-400 text-center">Unlimited ATS rewriting</span>
                </a>
                <a href="https://buy.stripe.com/7sYcN79YHe7v53AcHD0RG01" target="_blank" rel="noreferrer" className="flex flex-col items-center p-4 bg-[#D4AF37]/20 border border-[#D4AF37] rounded-xl hover:bg-[#D4AF37]/30 transition-colors relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-[#D4AF37] text-black text-[8px] font-bold px-2 py-0.5 rounded-bl">BEST VALUE</div>
                  <span className="text-xs text-[#D4AF37] font-bold uppercase tracking-wider mb-1">Yearly</span>
                  <span className="text-xl font-display font-bold text-white mb-2">$19<span className="text-sm text-neutral-500 font-sans font-normal">/yr</span></span>
                  <span className="text-[10px] text-neutral-400 text-center">Save ~20% annually</span>
                </a>
                <a href="https://buy.stripe.com/9B6aEZ7Qzd3rcw2bDz0RG02" target="_blank" rel="noreferrer" className="flex flex-col items-center p-4 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-xl hover:bg-[#D4AF37]/20 transition-colors">
                  <span className="text-xs text-[#D4AF37] font-bold uppercase tracking-wider mb-1">One-Time</span>
                  <span className="text-xl font-display font-bold text-white mb-2">$5<span className="text-sm text-neutral-500 font-sans font-normal"> pass</span></span>
                  <span className="text-[10px] text-neutral-400 text-center">Single CV rewrite</span>
                </a>
              </div>
            )}

            {/* Upload Zone */}
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".pdf,.doc,.docx" />
            <div 
              onDragOver={e => e.preventDefault()} 
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={"cursor-pointer border-2 border-dashed rounded-xl p-10 text-center transition-all " + (file ? 'border-[#D4AF37] bg-[#D4AF37]/5' : 'border-neutral-700 hover:border-neutral-500 bg-[#161616]')}
            >
              {!file ? (
                <>
                  <UploadCloud className="mx-auto text-neutral-500 mb-4" size={40} />
                  <p className="text-neutral-300 font-medium mb-1">Drag and drop your PDF or DOCX</p>
                  <p className="text-[#D4AF37] hover:underline text-sm font-medium">or click to browse files</p>
                </>
              ) : (
                <>
                  <FileText className="mx-auto text-[#D4AF37] mb-4" size={40} />
                  <p className="text-[#D4AF37] font-medium">{file.name}</p>
                  <p className="text-neutral-500 text-sm mt-1">{(file.size / 1024).toFixed(1)} KB</p>
                </>
              )}
            </div>

            <button 
              onClick={handleProcess}
              disabled={!file || processing}
              className={"w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all " + (file && !processing ? 'bg-[#D4AF37] text-black hover:bg-[#b5952f]' : 'bg-neutral-800 text-neutral-500 cursor-not-allowed')}
            >
              {processing ? (
                <span className="animate-pulse flex items-center gap-2">
                  <SearchCode size={20} />
                  {isPro ? "AI Rewriting & Sealing..." : "Converting & Sealing..."}
                </span>
              ) : (
                <>
                  <Lock size={20} />
                  {isPro ? "Execute Pro AI Rewrite" : "Convert to UDS"}
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="text-center py-8 space-y-6 animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
              <CheckCircle className="text-emerald-500" size={40} />
            </div>
            <h2 className="text-2xl font-bold text-white">Resume Cryptographically Sealed</h2>
            <p className="text-neutral-400 text-sm max-w-md mx-auto">
              Your resume has been converted into a tamper-evident Universal Document. It is now 100% machine-readable for modern ATS systems.
            </p>
            
            <button 
              onClick={downloadUds}
              className="w-full bg-[#D4AF37] hover:bg-[#b5952f] text-black py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors mt-6"
            >
              <HardDriveDownload size={20} />
              Download Resume_Verified.uds
            </button>

            <div className="pt-6 border-t border-neutral-800 mt-6 text-left">
              <p className="text-neutral-500 text-sm font-medium mb-3">
                <span className="text-[#D4AF37]">Important:</span> Recruiters must use the Universal Document Reader to view your private Clarity Layers (like References and Salary History). Never send a PDF again.
              </p>
              <a href="https://reader.hive.baby" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-white bg-neutral-800 hover:bg-neutral-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                <SearchCode size={16} />
                Test in UD Reader 
              </a>
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-20 text-neutral-600 text-sm">
        <p>A Universal Document Ecosystem Protocol</p>
      </div>
    </main>
  );
}
