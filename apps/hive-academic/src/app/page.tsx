"use client";

import { useState } from "react";
import { UploadCloud, Link as LinkIcon, FileText, ChevronRight, Zap, GraduationCap, ArrowRight } from "lucide-react";
import FlashcardPlayer, { Flashcard } from "@/components/FlashcardPlayer";

export default function AcademicUpload() {
  const [dragActive, setDragActive] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const generateCards = async (source: string) => {
    setIsProcessing(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        body: JSON.stringify({ text: source })
      });
      const data = await res.json();
      if (data.flashcards) {
        setFlashcards(data.flashcards);
      } else {
        alert("Generation failed.");
      }
    } catch (err) {
      console.error(err);
      alert("API Error.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFile = (file: File) => {
    // In production: send to UD API to parse PDF/Audio first
    generateCards(`Simulated text extraction from ${file.name}`);
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput) return;
    generateCards(`Simulated text extraction from ${urlInput}`);
  };

  return (
    <main className="min-h-screen bg-black text-white font-sans flex flex-col relative overflow-hidden">
      {/* Background aesthetics */}
      <div className="absolute inset-0 z-0 bg-[url('/lightning-bg.png')] bg-cover bg-center opacity-10 mix-blend-screen pointer-events-none"></div>
      
      {/* Navbar */}
      <nav className="w-full flex justify-between items-center p-6 border-b border-neutral-900 z-10 bg-black/50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <GraduationCap className="w-6 h-6 text-[#D4AF37]" />
          <span className="font-bold tracking-[0.15em] uppercase text-sm">UD Academic</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="#" className="text-xs font-mono text-neutral-400 hover:text-white transition-colors uppercase tracking-widest">Sign In</a>
          <button className="bg-[#D4AF37] text-black px-4 py-2 rounded text-xs font-bold tracking-widest uppercase hover:bg-[#b0902c] transition-colors">
            Get Pro
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 z-10 w-full">
        {flashcards.length > 0 ? (
          <FlashcardPlayer cards={flashcards} onReset={() => setFlashcards([])} />
        ) : (
          <>
            {/* Header */}
            <div className="text-center mb-12 max-w-2xl">
              <h1 className="text-4xl md:text-5xl font-bold tracking-[0.05em] mb-4">
                Upload <span className="text-[#D4AF37]">Knowledge.</span><br />
                Download Mastery.
              </h1>
              <p className="text-neutral-400 font-mono text-sm tracking-widest uppercase leading-relaxed">
                Drop your syllabus, medical PDF, or lecture recording. <br className="hidden md:block" />
                We generate the entire semester's flashcards in 4 seconds.
              </p>
            </div>

            {/* Upload Interface */}
            <div className="w-full max-w-2xl bg-neutral-950/80 backdrop-blur-xl border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
              
              {/* File Drag & Drop (Left Side) */}
              <div 
                className={`flex-1 p-10 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-neutral-800 relative transition-all duration-300 ${dragActive ? 'bg-[#D4AF37]/5 border-[#D4AF37]' : 'hover:bg-neutral-900/50'}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input 
                  type="file" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                  onChange={handleChange}
                  accept=".pdf,.doc,.docx,.txt,.mp3,.mp4"
                />
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 transition-colors duration-300 ${dragActive ? 'bg-[#D4AF37] text-black' : 'bg-neutral-900 text-[#D4AF37]'}`}>
                  <UploadCloud size={28} />
                </div>
                <h3 className="font-bold tracking-widest uppercase text-sm mb-2 text-center">Drag & Drop Document</h3>
                <p className="text-xs text-neutral-500 font-mono text-center">PDF, Word, Audio, or Video</p>
              </div>

              {/* URL Input (Right Side) */}
              <div className="flex-1 p-10 flex flex-col justify-center bg-black/40">
                <div className="flex items-center gap-3 mb-6">
                  <LinkIcon className="w-5 h-5 text-neutral-500" />
                  <h3 className="font-bold tracking-widest uppercase text-sm">Paste Link</h3>
                </div>
                
                <form onSubmit={handleUrlSubmit} className="flex flex-col gap-4">
                  <input 
                    type="url" 
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="YouTube or Article URL..." 
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-[#D4AF37] font-mono transition-colors"
                    required
                  />
                  <button 
                    type="submit"
                    disabled={isProcessing}
                    className="w-full flex items-center justify-center gap-2 bg-neutral-800 hover:bg-[#D4AF37] hover:text-black text-white p-3 rounded-lg text-xs font-bold tracking-widest uppercase transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? 'Extracting...' : (
                      <>Generate Study Set <ArrowRight size={14} /></>
                    )}
                  </button>
                </form>

                <div className="mt-6 flex items-center justify-between text-[10px] text-neutral-500 font-mono uppercase tracking-widest border-t border-neutral-800 pt-4">
                  <span className="flex items-center gap-1"><FileText size={12}/> 200k Context</span>
                  <span className="flex items-center gap-1"><Zap size={12} className="text-[#D4AF37]"/> Instant</span>
                </div>
              </div>

            </div>
          </>
        )}
      </div>

      {/* HiveOps Canonical Footer & Adoption Amplifiers */}
      <footer className="w-full mt-12 py-10 px-6 border-t border-white/10 text-center text-[#a0a0a0] text-sm z-10 bg-black/50">
        <div className="flex flex-wrap justify-center items-center gap-3 mb-4">
          <a href="https://hive.baby" className="font-semibold hover:text-white transition-colors">hive.baby</a>
          <span>&middot;</span>
          <a href="https://universaldocument.org" className="hover:text-white transition-colors">universal document</a>
          <span>&middot;</span>
          <a href="https://hive.baby/about.html" className="hover:text-white transition-colors">social experiment</a>
          <span>&middot;</span>
          <a href="https://hive.baby/contribute.html" className="hover:text-white transition-colors">contribute</a>
          <span>&middot;</span>
          <a href="https://hive.baby/patrons.html" className="hover:text-white transition-colors">patronage</a>
          <span>&middot;</span>
          <a href="https://hive.baby/privacy.html" className="hover:text-white transition-colors">privacy</a>
        </div>
        <div className="mt-4 tracking-wide">
          Made with <span className="text-[#D4AF37] text-base">&hearts;</span> in the <a href="https://hive.baby" className="font-bold text-white hover:text-[#D4AF37] transition-colors">Hive</a>
        </div>
      </footer>

    </main>
  );
}
