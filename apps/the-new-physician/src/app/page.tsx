"use client";

import { Playfair_Display } from "next/font/google";
import { motion } from "framer-motion";
import HeartbeatTimestamp from "./HeartbeatTimestamp";
import MagneticCard from "./MagneticCard";
import { Mic, BookOpen, FileText, PlaySquare, Mail, ExternalLink, ArrowRight, Layout } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { TNP_EPISODES } from "../data/tnpSeries";

const playfair = Playfair_Display({ subsets: ["latin"] });

export default function Home() {
  const [latestEssay, setLatestEssay] = useState<{ title: string, link: string } | null>(null);
  const [liveEpisodes, setLiveEpisodes] = useState<Record<number, string>>({});
  const [waitlistStatus, setWaitlistStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const scrollRef = useRef<HTMLDivElement>(null);

  const liveEpisodeIds = Object.keys(liveEpisodes).map(Number);
  const highestLive = liveEpisodeIds.length > 0 ? Math.max(...liveEpisodeIds) : null;

  const handleWaitlist = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setWaitlistStatus("loading");
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        body: JSON.stringify({ email }),
        headers: { "Content-Type": "application/json" }
      });
      if (res.ok) setWaitlistStatus("success");
      else setWaitlistStatus("error");
    } catch {
      setWaitlistStatus("error");
    }
  };

  useEffect(() => {
    fetch("https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/@saggarsonny")
      .then(res => res.json())
      .then(data => {
        if (data?.items?.length > 0) {
          setLatestEssay({ title: data.items[0].title, link: data.items[0].link });
          
          const liveMap: Record<number, string> = {};
          data.items.forEach((item: any) => {
             const cleanItem = item.title.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
             const isTNP = cleanItem.includes("tnp") || cleanItem.includes("new physician");
             
             TNP_EPISODES.forEach(ep => {
                const cleanEp = ep.title.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
                const titleMatch = cleanItem.includes(cleanEp.substring(0, 30));
                const partMatch = isTNP && new RegExp(`part\\s*#?\\s*${ep.id}\\b`).test(cleanItem);
                
                if (titleMatch || partMatch) {
                   liveMap[ep.id] = item.link;
                }
             });
          });
          setLiveEpisodes(liveMap);
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
     if (highestLive && scrollRef.current) {
        setTimeout(() => {
           const element = document.getElementById(`tnp-episode-${highestLive}`);
           if (element && scrollRef.current) {
              scrollRef.current.scrollTo({
                top: element.offsetTop - scrollRef.current.clientHeight / 2 + element.clientHeight / 2,
                behavior: 'smooth'
              });
           }
        }, 500);
     }
  }, [highestLive]);
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: "easeOut" }
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-neutral-300 font-sans selection:bg-[#D4AF37] selection:text-black">
      
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-neutral-900">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="font-display font-bold text-xl tracking-wider text-white">
            THE NEW PHYSICIAN
            <div className="h-0.5 w-full bg-[#D4AF37] mt-1 origin-left opacity-50"></div>
          </div>
          <div className="hidden md:flex gap-8 text-sm font-medium tracking-wide items-center">
            <a href="https://hub.newphysician.org" className="text-[#D4AF37] border border-[#D4AF37]/50 px-4 py-1.5 rounded-full hover:bg-[#D4AF37]/10 transition-colors font-bold">Enter Hub</a>
            <a href="#about" className="hover:text-[#D4AF37] transition-colors">About</a>
            <a href="https://www.youtube.com/@TheNewPhysician" target="_blank" rel="noreferrer" className="hover:text-[#D4AF37] transition-colors">Podcasts</a>
            <a href="#book" className="hover:text-[#D4AF37] transition-colors">Book</a>
            <a href="#series-index" className="hover:text-[#D4AF37] transition-colors">TNP Series</a>
            <a href="#articles" className="hover:text-[#D4AF37] transition-colors">Essays</a>
            <a href="#contact" className="hover:text-[#D4AF37] transition-colors">Contact</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-20 px-6 overflow-hidden">
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-transparent via-[#0a0a0a]/50 to-[#0a0a0a]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#D4AF37]/5 rounded-full blur-[120px] pointer-events-none"></div>

        <motion.div 
          className="relative z-10 max-w-4xl mx-auto text-center space-y-8"
          initial="initial"
          animate="animate"
          variants={fadeIn}
        >
          <motion.img 
            src="/shield-logo.png" 
            alt="The New Physician Kintsugi Shield" 
            className="w-48 h-48 md:w-64 md:h-64 mx-auto drop-shadow-[0_0_30px_rgba(212,175,55,0.3)] object-contain mb-8"
            variants={fadeIn}
          />
          <div className="inline-flex items-center gap-2 border border-[#D4AF37]/30 bg-[#D4AF37]/5 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest text-[#D4AF37] uppercase">
            Sonny Saggar MD
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-bold text-white leading-tight">
            From Collapse to <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB]">Reinvention</span>
          </h1>
          <p className="text-xl md:text-2xl text-[#d4d4d4] font-light tracking-wide max-w-2xl mx-auto mb-6">
            Physician • Innovator • Author
          </p>
          
          <div className="flex justify-center mb-10">
            <HeartbeatTimestamp />
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <a href="https://hub.newphysician.org" className="bg-[#D4AF37] text-black px-8 py-4 rounded-full font-bold hover:bg-[#b5952f] transition-all flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(212,175,55,0.3)] hover:shadow-[0_0_40px_rgba(212,175,55,0.5)]">
              <ExternalLink size={18} />
              Enter the Premium Hub
            </a>
            <a href="https://www.youtube.com/@TheNewPhysician" target="_blank" rel="noreferrer" className="bg-neutral-800 text-white hover:bg-neutral-700 px-8 py-4 rounded-full font-bold transition-all flex items-center justify-center gap-2">
              <Mic size={18} />
              Podcasts
            </a>
            <a href="#book" className="border border-neutral-700 hover:border-[#D4AF37] text-white px-8 py-4 rounded-full font-bold transition-all flex items-center justify-center gap-2 bg-neutral-900/50 backdrop-blur-sm">
              <BookOpen size={18} />
              Book
            </a>
          </div>
        </motion.div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 px-6 bg-neutral-950 relative border-t border-neutral-900">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <h2 className="text-4xl font-display font-bold text-white">The Rebirth of Purpose</h2>
              <div className="w-12 h-1 bg-[#D4AF37]"></div>
              <p className="text-neutral-400 leading-relaxed text-lg">
                Medicine is a crucible. Sometimes it tempers us; sometimes it shatters us. But like the Japanese art of Kintsugi, the broken pieces can be mended with gold, creating something more resilient and beautiful than before.
              </p>
              <p className="text-neutral-400 leading-relaxed text-lg">
                This space is dedicated to the physicians, the healers, and the leaders who have faced systemic collapse and chosen to rebuild themselves—and the system—anew.
              </p>
            </motion.div>
            <div className="relative aspect-square rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-900 group">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#D4AF37]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"></div>
              {/* Sonny's professional portrait extracted from YouTube */}
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-700 group-hover:scale-105" 
                style={{ backgroundImage: "url('/portrait.jpg')" }}
              ></div>
            </div>
          </div>
        </div>
      </section>

      {/* Ecosystem Grid */}
      <section id="articles" className="py-24 px-6 relative">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-display font-bold text-white">The Ecosystem</h2>
            <p className="text-neutral-500 max-w-2xl mx-auto">Explore the ideas, the voice, and the movement across multiple channels.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Podcast Card */}
            <MagneticCard className="bg-neutral-900/50 border border-neutral-800 hover:border-[#D4AF37]/50 rounded-2xl p-8 transition-all hover:bg-neutral-900 flex flex-col h-full">
              <div className="w-12 h-12 bg-[#D4AF37]/10 text-[#D4AF37] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Mic size={24} />
              </div>
              <h3 className="text-2xl font-display font-bold text-white mb-3">The Podcasts</h3>
              <p className="text-neutral-400 mb-8 flex-grow">
                Deep, unscripted conversations with medical leaders who have survived the crucible and reinvented their careers.
              </p>
              <div className="flex flex-col gap-4 mt-auto border-t border-neutral-800/50 pt-6">
                <a href="https://www.youtube.com/@TheNewPhysician" target="_blank" rel="noreferrer" className="flex items-center justify-between text-sm font-bold text-[#D4AF37] hover:text-white transition-colors group/link">
                  The New Physician <ExternalLink size={14} className="group-hover/link:translate-x-1 transition-transform" />
                </a>
                <a href="#systems-check" className="flex items-center justify-between text-sm font-bold text-neutral-500 hover:text-white transition-colors group/link">
                  Systems Check (Coming Soon) <ExternalLink size={14} className="group-hover/link:translate-x-1 transition-transform" />
                </a>
              </div>
            </MagneticCard>

            {/* Articles / SSRN Card */}
            <MagneticCard className="bg-neutral-900/50 border border-neutral-800 hover:border-[#D4AF37]/50 rounded-2xl p-8 transition-all hover:bg-neutral-900 flex flex-col h-full">
              <div className="w-12 h-12 bg-[#D4AF37]/10 text-[#D4AF37] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <FileText size={24} />
              </div>
              <h3 className="text-2xl font-display font-bold text-white mb-3">The Crucible: Systems Autopsies</h3>
              <p className="text-neutral-400 mb-6 flex-grow">
                Reflective essays and peer-reviewed architecture detailing the future of healthcare. Designed for critical thinkers willing to look past the headlines, hear all sides, and analyze the mechanics of systemic failure and reinvention.
              </p>
              
              {/* Scrolling TNP Series Device */}
              <div className="bg-neutral-950/50 rounded-lg border border-neutral-800/50 relative overflow-hidden flex flex-col h-[350px]">
                <div className="p-4 border-b border-neutral-800/50 shrink-0 bg-neutral-950 flex justify-between items-center">
                  <div className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider">The TNP Series</div>
                  <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest bg-neutral-900 px-2 py-1 rounded">Auto-Synced</div>
                </div>
                <div ref={scrollRef} className="p-4 overflow-y-auto space-y-4 relative scroll-smooth flex-grow custom-scrollbar">
                  {TNP_EPISODES.map((ep, idx) => {
                    const isLive = !!liveEpisodes[ep.id];
                    const link = liveEpisodes[ep.id];
                    const isNewPhase = idx === 0 || TNP_EPISODES[idx - 1].phase !== ep.phase;

                    return (
                      <div key={ep.id} id={`tnp-episode-${ep.id}`}>
                        {isNewPhase && (
                          <div className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest mb-2 mt-4 first:mt-0 sticky top-0 bg-neutral-950/90 backdrop-blur-sm py-1 z-10 border-b border-neutral-900">
                            Phase {ep.phase}: {ep.phaseTitle}
                          </div>
                        )}
                        <a 
                          href={isLive ? link : undefined}
                          target={isLive ? "_blank" : undefined}
                          rel={isLive ? "noreferrer" : undefined}
                          className={`group flex items-start gap-3 p-2 rounded-lg transition-all border ${
                            isLive 
                              ? ep.id === highestLive
                                ? 'bg-[#D4AF37]/15 border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.25)] cursor-pointer'
                                : 'bg-[#D4AF37]/5 border-[#D4AF37]/15 hover:bg-[#D4AF37]/10 hover:border-[#D4AF37]/35 cursor-pointer shadow-[0_0_10px_rgba(212,175,55,0.03)]'
                              : 'opacity-40 pointer-events-none grayscale border-transparent'
                          }`}
                        >
                          <div className={`mt-0.5 shrink-0 text-xs font-bold px-1.5 py-0.5 rounded border ${
                            isLive 
                              ? ep.id === highestLive
                                ? 'bg-[#D4AF37] text-black border-[#D4AF37]'
                                : 'bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/40' 
                              : 'bg-neutral-900 text-neutral-500 border-neutral-800'
                          }`}>
                            {ep.id}
                          </div>
                          <div>
                            <div className={`text-sm font-bold leading-tight ${isLive ? 'text-[#D4AF37] group-hover:text-white transition-colors' : 'text-neutral-500'}`}>
                              {ep.title}
                            </div>
                            <div className="text-xs mt-1 flex items-center gap-1.5">
                              {isLive ? (
                                ep.id === highestLive ? (
                                  <>
                                    <span className="relative flex h-2 w-2">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4AF37] opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D4AF37]"></span>
                                    </span>
                                    <span className="text-[#D4AF37] font-bold tracking-wide">CURRENT BENCHMARK</span>
                                  </>
                                ) : (
                                  <span className="text-[#D4AF37]/80 font-bold tracking-wide">LIVE</span>
                                )
                              ) : (
                                <span className="text-neutral-500">UPCOMING</span>
                              )}
                            </div>
                          </div>
                        </a>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-6 text-sm font-bold text-[#D4AF37] mt-auto">
                <a href="https://medium.com/@saggarsonny" target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-white transition-colors">
                  Medium <ExternalLink size={14} />
                </a>
                <a href="https://papers.ssrn.com/sol3/cf_dev/AbsByAuth.cfm?per_id=10558116" target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-white transition-colors">
                  SSRN <ExternalLink size={14} />
                </a>
              </div>
            </MagneticCard>

            {/* Videos Card */}
            <MagneticCard className="bg-neutral-900/50 border border-neutral-800 hover:border-[#D4AF37]/50 rounded-2xl p-8 transition-all hover:bg-neutral-900 flex flex-col h-full md:col-span-2 lg:col-span-1 block">
              <a href="https://youtube.com/shorts/EPwICA7vr0k" target="_blank" rel="noreferrer" className="flex flex-col h-full">
                <div className="w-12 h-12 bg-[#D4AF37]/10 text-[#D4AF37] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <PlaySquare size={24} />
                </div>
                <h3 className="text-2xl font-display font-bold text-white mb-3">Visual Storytelling</h3>
                <p className="text-neutral-400 mb-8 flex-grow">
                  Short-form insights and raw video reflections. The upcoming YouTube channel documenting the rebuild.
                </p>
                <div className="flex items-center gap-2 text-sm font-bold text-[#D4AF37]">
                  Watch Shorts <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </a>
            </MagneticCard>

          </div>
        </div>
      </section>

      {/* TNP Series Roadmap - Deprecated by scrolling component, removed to avoid duplication */}

      {/* Book Teaser Section */}
      <section id="book" className="py-24 px-6 bg-[#D4AF37]/5 border-y border-[#D4AF37]/10">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="w-full md:w-1/3 aspect-[2/3] bg-neutral-900 border border-neutral-800 rounded-lg shadow-2xl relative flex items-center justify-center overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80 z-10"></div>
              <div className="text-center z-20 p-6">
                <h3 className="font-display text-2xl font-bold text-[#D4AF37] mb-2 tracking-widest">THE NEW</h3>
                <h3 className="font-display text-4xl font-bold text-white uppercase tracking-widest">Physician</h3>
                <div className="w-8 h-px bg-[#D4AF37] mx-auto my-4"></div>
                <p className="text-xs tracking-widest text-neutral-400 uppercase">Sonny Saggar MD</p>
              </div>
            </div>
            <div className="w-full md:w-2/3 space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-[#D4AF37] uppercase">
                Upcoming Release
              </div>
              <h2 className="text-4xl md:text-5xl font-display font-bold text-white">The Blueprint for Reinvention</h2>
              <p className="text-neutral-400 text-lg leading-relaxed max-w-2xl">
                A definitive guide for doctors navigating burnout, systemic failure, and the transition into a completely reimagined career. The book weaves personal narrative with actionable strategy, proving that the end of one path is simply the foundation for the next.
              </p>
              {waitlistStatus === 'success' ? (
                <div className="mt-6 inline-flex items-center gap-2 bg-[#D4AF37]/20 border border-[#D4AF37] px-6 py-4 rounded-full text-[#D4AF37] font-bold">
                  ✓ Successfully added to the waitlist.
                </div>
              ) : (
                <form onSubmit={handleWaitlist} className="mt-6 flex flex-col sm:flex-row gap-4 max-w-md">
                  <input type="email" name="email" required placeholder="Enter your email address" className="flex-1 bg-neutral-900 border border-neutral-800 rounded-full px-6 py-4 text-white focus:outline-none focus:border-[#D4AF37] transition-colors" />
                  <button type="submit" disabled={waitlistStatus === 'loading'} className="bg-white text-black px-8 py-4 rounded-full font-bold hover:bg-neutral-200 transition-all whitespace-nowrap disabled:opacity-50">
                    {waitlistStatus === 'loading' ? 'Joining...' : 'Join Waitlist'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Architecture & Ecosystem Section */}
      <section id="architecture" className="py-24 px-6 bg-neutral-900 border-t border-neutral-800">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] mb-4">
            <Layout size={32} />
          </div>
          <h2 className="text-4xl font-display font-bold text-white">Architecture & Ecosystem</h2>
          <p className="text-neutral-400 text-lg max-w-3xl mx-auto">
            The New Physician is a philosophy of systemic reinvention. But philosophies need infrastructure to become reality. While I am simply a peripheral consultant to these projects, I am sharing them because they represent the open-source, decentralized future required to fix the structural failures of modern medicine.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12 text-left">
            <a href="https://ud.hive.baby" target="_blank" rel="noreferrer" className="block bg-black border border-neutral-800 hover:border-[#D4AF37]/50 p-8 rounded-2xl transition-colors group">
              <h3 className="text-2xl font-bold text-white mb-2 flex items-center justify-between">
                Universal Document™
                <ExternalLink size={18} className="text-neutral-600 group-hover:text-[#D4AF37] transition-colors" />
              </h3>
              <p className="text-sm text-neutral-500 mb-4 uppercase tracking-widest font-bold">The Open Standard</p>
              <p className="text-neutral-400">
                An open, free, AI-native document format designed as the modern successor to PDF and DOCX. Structured, tamper-evident, and built for the age of AI.
              </p>
            </a>
            
            <a href="https://hive.baby" target="_blank" rel="noreferrer" className="block bg-black border border-neutral-800 hover:border-[#D4AF37]/50 p-8 rounded-2xl transition-colors group">
              <h3 className="text-2xl font-bold text-white mb-2 flex items-center justify-between">
                The Hive
                <ExternalLink size={18} className="text-neutral-600 group-hover:text-[#D4AF37] transition-colors" />
              </h3>
              <p className="text-sm text-neutral-500 mb-4 uppercase tracking-widest font-bold">The Engine Network</p>
              <p className="text-neutral-400">
                The decentralized network of autonomous engines powering Universal Document and modern clinical infrastructure. Machine Over Human governance.
              </p>
            </a>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 px-6 relative">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <Mail className="mx-auto text-[#D4AF37]" size={40} />
          <h2 className="text-4xl font-display font-bold text-white">Connect</h2>
          <p className="text-neutral-400 text-lg">
            For podcast interviews, speaking engagements, or collaborations, reach out directly.
          </p>
          <a href="https://www.linkedin.com/in/thenewphysician" target="_blank" rel="noreferrer" className="inline-flex items-center gap-3 bg-[#0077b5] hover:bg-[#005e93] text-white px-10 py-5 rounded-full font-bold text-lg transition-all shadow-lg hover:shadow-[#0077b5]/30 mt-4">
            Connect on LinkedIn <ExternalLink size={20} />
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-900 py-12 px-6 text-center flex flex-col items-center gap-6">
        <div className="flex gap-8 text-neutral-400 font-mono text-sm">
          <a href="https://www.linkedin.com/company/the-hive-ecosystem" target="_blank" rel="noreferrer" className="hover:text-[#D4AF37] transition-colors">The Hive (LinkedIn)</a>
          <a href="https://www.reddit.com/r/TheNewPhysician/" target="_blank" rel="noreferrer" className="hover:text-[#D4AF37] transition-colors">r/TheNewPhysician</a>
        </div>
        <p className="text-neutral-600 font-medium text-sm">
          © {new Date().getFullYear()} The New Physician & Sonny Saggar MD. All rights reserved.
        </p>
      </footer>

    </main>
  );
}
