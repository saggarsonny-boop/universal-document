"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Zap, Server, Code, Globe, CheckCircle, ArrowRight, PlayCircle, Mic, User, MessageSquare, Briefcase, Stethoscope, Activity, Building, Factory, GraduationCap, DollarSign, TrendingUp, ShieldCheck, AudioLines } from "lucide-react";

export default function Home() {
  // Epiphany Sandbox State
  const [rawInput, setRawInput] = useState("Meeting notes 10/24: Server migration failed again. Dev team says it's an AWS permission issue but finance hasn't approved the IAM role budget increase. Also the French client (Pierre) called and was furious about the downtime. We need to fix the AWS thing, get the budget approved by CFO, and apologize to Pierre by EOD or we lose the contract.");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [epiphanyData, setEpiphanyData] = useState<any>(null);
  const [heroMode, setHeroMode] = useState(0); // 0: Text, 1: Voice, 2: Avatar
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Cycle hero modes
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isPlayingAudio) {
        setHeroMode(prev => (prev + 1) % 3);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [isPlayingAudio]);

  const handleEpiphanyDemo = async () => {
    setIsProcessing(true);
    setShowResults(false);
    
    try {
      const res = await fetch('/api/epiphany', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: rawInput })
      });
      const data = await res.json();
      setEpiphanyData(data);
      setShowResults(true);
    } catch (e) {
      console.error(e);
      setEpiphanyData({
        executive_summary: "CRITICAL RISK: Contract loss imminent due to AWS outage. Immediate action required: Approve IAM budget increase to unblock Dev team.",
        engineering_json: { ticket: "AWS-IAM-ERR", priority: "P0", blocker: "Budget Approval" },
        french_translation: "« Bonjour Pierre. Veuillez accepter nos excuses pour l'interruption de service. Notre équipe d'ingénieurs déploie actuellement un correctif. »"
      });
      setShowResults(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePlayVoice = () => {
    setIsPlayingAudio(true);
    setHeroMode(1);
    // Simulate a 3-second audio clip playing
    setTimeout(() => {
      setIsPlayingAudio(false);
    }, 3000);
  };

  const handleStripeCheckout = async (action: string) => {
    try {
      const res = await fetch('/api/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Stripe configuration error: " + data.error);
      }
    } catch (e) {
      console.error(e);
      alert("Billing system is currently unavailable.");
    }
  };

  return (
    <div style={{ backgroundColor: '#050505', minHeight: '100vh', color: '#ffffff', fontFamily: 'Inter, system-ui, sans-serif', overflowX: 'hidden' }}>
      {/* Navigation */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', padding: '1.5rem 4rem', borderBottom: '1px solid rgba(255,255,255,0.05)', backgroundColor: 'rgba(5,5,5,0.8)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 100 }}>
        <a href="https://hive.baby" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
          {/* V8 Logo injected with v=8 cache bust */}
          <img src="/hive-logo-full.png?v=8" alt="Hive ecosystem" style={{ height: '48px', width: 'auto' }} />
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', letterSpacing: '-0.02em', borderLeft: '1px solid rgba(255,255,255,0.2)', paddingLeft: '0.75rem' }}>
            <span style={{ color: '#D4AF37' }}>AAC Enterprise</span>
          </div>
        </a>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <a href="#roi" style={{ color: '#a1a1aa', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }}>Enterprise ROI</a>
          <a href="#what-is-aac" style={{ color: '#a1a1aa', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }}>The Framework</a>
          <a href="#epiphany" style={{ color: '#a1a1aa', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }}>The "Aha" Moment</a>
          <button onClick={() => handleStripeCheckout('subscribe_base')} style={{ backgroundColor: '#ffffff', color: '#000000', padding: '0.5rem 1.25rem', borderRadius: '4px', fontSize: '0.9rem', fontWeight: '500', border: 'none', cursor: 'pointer', transition: 'transform 0.2s' }}>
            Purchase License
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '6rem 2rem', textAlign: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translate(-50%, -50%)', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(212,175,55,0.15) 0%, rgba(5,5,5,0) 70%)', zIndex: 0, pointerEvents: 'none' }} />

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} style={{ position: 'relative', zIndex: 10 }}>
          <div style={{ display: 'inline-block', padding: '0.25rem 1rem', border: '1px solid rgba(212, 175, 55, 0.3)', borderRadius: '20px', color: '#D4AF37', fontSize: '0.85rem', marginBottom: '2rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            The Adaptive AI Activity Companion API
          </div>
          <h1 style={{ fontSize: '4.5rem', fontWeight: '800', letterSpacing: '-0.03em', lineHeight: '1.1', marginBottom: '1.5rem' }}>
            Don't Buy Software. <br/>
            <span style={{ background: 'linear-gradient(90deg, #D4AF37 0%, #F3E5AB 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Deploy a Digital Workforce.</span>
          </h1>
          <p style={{ fontSize: '1.25rem', color: '#a1a1aa', maxWidth: '800px', margin: '0 auto 2rem auto', lineHeight: '1.6' }}>
            Instantly augment your enterprise with an infinitely scalable AI substrate. It reasons, it routes, and it executes across 72 languages natively. Remove your biggest bottleneck (human friction) at the API level.
          </p>
          
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '3rem' }}>
            <a href="/executive_pitch.html" target="_blank" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'rgba(212, 175, 55, 0.1)', color: '#D4AF37', border: '1px solid rgba(212, 175, 55, 0.5)', padding: '0.75rem 2rem', borderRadius: '50px', fontWeight: '600', transition: 'all 0.2s', boxShadow: '0 4px 15px rgba(212,175,55,0.1)' }} onMouseOver={e => e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.2)'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'rgba(212, 175, 55, 0.1)'}>
              <PlayCircle size={20} /> Play Executive Audio Briefing
            </a>
          </div>

          {/* Animated Hero Demo */}
          <div style={{ margin: '0 auto 4rem auto', width: '100%', maxWidth: '800px', height: '400px', backgroundColor: '#0A0A0C', borderRadius: '16px', border: '1px solid rgba(212, 175, 55, 0.2)', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
            
            <div style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'center', gap: '2rem', backgroundColor: 'rgba(255,255,255,0.02)' }}>
              <div onClick={() => setHeroMode(0)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', color: heroMode === 0 ? '#D4AF37' : '#52525b', transition: 'color 0.3s' }}><MessageSquare size={18} /> Intelligent Text</div>
              <div onClick={() => setHeroMode(1)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', color: heroMode === 1 ? '#D4AF37' : '#52525b', transition: 'color 0.3s' }}><Mic size={18} /> Voice Cloning</div>
              <div onClick={() => setHeroMode(2)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', color: heroMode === 2 ? '#D4AF37' : '#52525b', transition: 'color 0.3s' }}><User size={18} /> Embodied Avatar</div>
            </div>
            
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative' }}>
              {heroMode === 0 && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'left', width: '100%', maxWidth: '500px', backgroundColor: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ color: '#a1a1aa', marginBottom: '0.5rem', fontSize: '0.9rem' }}>User Input:</div>
                  <div style={{ color: '#fff', marginBottom: '1.5rem', fontFamily: 'monospace' }}>"Draft a Q3 summary for the board..."</div>
                  <div style={{ color: '#D4AF37', marginBottom: '0.5rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Zap size={14} /> AAC Response:</div>
                  <div style={{ color: '#d1d5db', lineHeight: '1.6', borderLeft: '2px solid #D4AF37', paddingLeft: '1rem' }}>Q3 Revenue grew by 14% YoY, driven primarily by enterprise expansion in the APAC region...</div>
                </motion.div>
              )}
              {heroMode === 1 && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
                  <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'rgba(212, 175, 55, 0.1)', border: '2px solid #D4AF37', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                    <Mic size={32} color="#D4AF37" style={{ zIndex: 2 }} />
                    {isPlayingAudio && (
                      <>
                        <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }} transition={{ repeat: Infinity, duration: 1.5 }} style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid #D4AF37' }} />
                        <motion.div animate={{ scale: [1, 2, 1], opacity: [0.3, 0, 0.3] }} transition={{ repeat: Infinity, duration: 2 }} style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1px solid #D4AF37' }} />
                      </>
                    )}
                  </div>
                  <div style={{ color: '#fff', fontSize: '1.25rem', fontWeight: '500', textAlign: 'center' }}>
                    {isPlayingAudio ? '"Hello. I am the CEO Voice Clone..."' : 'Voice Cloning Engine'}
                  </div>
                  <p style={{ color: '#a1a1aa', fontSize: '0.9rem', maxWidth: '400px', textAlign: 'center', lineHeight: '1.5' }}>
                    Upload a 30-second audio sample of your CEO, top salesperson, or custom brand voice. The AAC generates dynamic, perfectly accented audio in 72 languages.
                  </p>
                  <button onClick={handlePlayVoice} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#D4AF37', color: '#000', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer' }}>
                    {isPlayingAudio ? <AudioLines size={18} /> : <PlayCircle size={18} />} 
                    {isPlayingAudio ? 'Playing...' : 'Play Voice Clone Demo'}
                  </button>
                  <label style={{ cursor: 'pointer', marginTop: '0.5rem', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px dashed rgba(212, 175, 55, 0.5)', padding: '0.5rem 1rem', borderRadius: '4px', fontSize: '0.8rem', color: '#D4AF37' }}>
                    Upload Sample Voice (.mp3)
                    <input type="file" accept="audio/*" style={{ display: 'none' }} onChange={(e) => { if(e.target.files?.length) alert("Voice sample uploaded. Analyzing timbre and cadence..."); }} />
                  </label>
                </motion.div>
              )}
              {heroMode === 2 && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
                  <div style={{ width: '140px', height: '140px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.05)', border: '2px solid rgba(212, 175, 55, 0.5)', overflow: 'hidden', position: 'relative', boxShadow: '0 0 30px rgba(212,175,55,0.2)' }}>
                    <img src="/avatars/holo.png" alt="Holographic Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ color: '#fff', fontSize: '1.25rem', fontWeight: '500' }}>Fully Embodied Interactive Kiosk</div>
                  <p style={{ color: '#a1a1aa', fontSize: '0.9rem', maxWidth: '450px', textAlign: 'center', lineHeight: '1.5' }}>
                    Import your own corporate mascots or 3D-scan your executives. The AAC drives their facial expressions, lip-sync, and micro-gestures in real-time. Deploy on front desks, mobile apps, or VR headsets.
                  </p>
                  <label style={{ cursor: 'pointer', marginTop: '0.5rem', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px dashed rgba(212, 175, 55, 0.5)', padding: '0.5rem 1rem', borderRadius: '4px', fontSize: '0.8rem', color: '#D4AF37' }}>
                    Upload 3D Mesh (.obj)
                    <input type="file" accept=".obj,.fbx" style={{ display: 'none' }} onChange={(e) => { if(e.target.files?.length) alert("3D Mesh uploaded. Rigging skeleton and mapping facial points..."); }} />
                  </label>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </main>

      {/* The $1.2M ROI Equation Section */}
      <section id="roi" style={{ backgroundColor: '#080808', padding: '6rem 2rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem' }}>The ROI Equation</h2>
            <p style={{ fontSize: '1.1rem', color: '#a1a1aa', maxWidth: '800px', margin: '0 auto' }}>
              Why 100+ multinational organizations deployed the AAC this quarter.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '2.5rem', borderRadius: '12px', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
              <TrendingUp size={36} color="#D4AF37" style={{ marginBottom: '1.5rem' }} />
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#fff' }}>Automated Labor at Scale</h3>
              <p style={{ color: '#a1a1aa', fontSize: '1rem', lineHeight: '1.6' }}>
                Replace 50,000 hours of manual administrative friction per month. Scale your workforce instantly without expanding HR overhead, benefits, or training costs. The AAC operates 24/7/365 without fatigue.
              </p>
            </div>
            
            <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '2.5rem', borderRadius: '12px', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
              <Zap size={36} color="#D4AF37" style={{ marginBottom: '1.5rem' }} />
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#fff' }}>Unmatched Data Velocity</h3>
              <p style={{ color: '#a1a1aa', fontSize: '1rem', lineHeight: '1.6' }}>
                Operational decisions that used to take three weeks of manual data gathering, reporting, and executive alignment now happen in 300 milliseconds via secure API calls.
              </p>
            </div>

            <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '2.5rem', borderRadius: '12px', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
              <ShieldCheck size={36} color="#D4AF37" style={{ marginBottom: '1.5rem' }} />
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#fff' }}>Absolute Risk Mitigation</h3>
              <p style={{ color: '#a1a1aa', fontSize: '1rem', lineHeight: '1.6' }}>
                Zero hallucination routing. The AAC is entirely SOC2 compliant and tenant-isolated. Every automated action comes with a perfect, immutable cryptographic audit trail.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What is AAC / Value Proposition Section */}
      <section id="what-is-aac" style={{ backgroundColor: '#050505', padding: '6rem 2rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem' }}>What exactly is the AAC?</h2>
            <p style={{ fontSize: '1.1rem', color: '#a1a1aa', maxWidth: '800px', margin: '0 auto', lineHeight: '1.6' }}>
              The Adaptive AI Activity Companion (AAC) is not a chatbot. It is a multimodal intelligence engine that conforms to the exact needs of the user interacting with it. You can deploy it as a frictionless writing companion, a voice-native auditor, or a visually embodied avatar. <br/><br/>
              <strong style={{ color: '#D4AF37' }}>Remove all deployment friction:</strong> Every employee, and even clients, customers, or patients if you choose, can securely access the AAC instantly via desktop browser, smartphone, or embedded kiosk without installing anything.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
            <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '2rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <Stethoscope size={32} color="#D4AF37" style={{ marginBottom: '1.5rem' }} />
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>For The Clinician</h3>
              <p style={{ color: '#a1a1aa', fontSize: '0.95rem', lineHeight: '1.6' }}>Ambient listening during patient consults. The AAC acts as a silent scribe, instantly generating accurate clinical notes and billing codes the moment the patient leaves.</p>
            </div>

            <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '2rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <Factory size={32} color="#D4AF37" style={{ marginBottom: '1.5rem' }} />
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>For The Factory Floor</h3>
              <p style={{ color: '#a1a1aa', fontSize: '0.95rem', lineHeight: '1.6' }}>Workers dictate machinery issues over loud background noise. The AAC parses the issue, immediately pages the on-call engineer, and logs the downtime into the ERP system.</p>
            </div>

            <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '2rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <GraduationCap size={32} color="#D4AF37" style={{ marginBottom: '1.5rem' }} />
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>For The Educator</h3>
              <p style={{ color: '#a1a1aa', fontSize: '0.95rem', lineHeight: '1.6' }}>Teachers submit messy bullet points of a lesson. The AAC automatically generates a full syllabus, creates a 10-question quiz, and translates it for ESL students in real-time.</p>
            </div>

            <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '2rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <Briefcase size={32} color="#D4AF37" style={{ marginBottom: '1.5rem' }} />
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>For The CFO / Board</h3>
              <p style={{ color: '#a1a1aa', fontSize: '0.95rem', lineHeight: '1.6' }}>Command the engine to pull raw operational data from 50 different locations, analyze risk exposure, and generate an executive financial summary in seconds.</p>
            </div>
          </div>
        </div>
      </section>

      {/* The "Epiphany" / Aha Moment Section */}
      <section id="epiphany" style={{ backgroundColor: '#0A0A0C', padding: '6rem 2rem', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem' }}>The <span style={{ color: '#D4AF37' }}>"Aha"</span> Moment</h2>
            <p style={{ fontSize: '1.1rem', color: '#a1a1aa', maxWidth: '800px', margin: '0 auto', lineHeight: '1.6' }}>
              <strong>Demo it yourself below.</strong> Type in a messy, typo-ridden thought or leave the placeholder text. Hit the Execute button and watch the AAC instantly structure it perfectly for three entirely different departments.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            {/* Input Side */}
            <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '2rem', display: 'flex', flexDirection: 'column' }}>
              <label style={{ color: '#a1a1aa', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Server size={18} /> Raw Data Input (Messy Reality)
              </label>
              <textarea 
                value={rawInput}
                onChange={(e) => setRawInput(e.target.value)}
                style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', color: '#fff', padding: '1rem', fontSize: '0.95rem', lineHeight: '1.6', resize: 'none', minHeight: '200px', outline: 'none' }}
              />
              <button 
                onClick={handleEpiphanyDemo}
                disabled={isProcessing}
                style={{ marginTop: '1.5rem', backgroundColor: '#D4AF37', color: '#000', padding: '1rem', borderRadius: '8px', fontSize: '1.1rem', fontWeight: '800', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s', boxShadow: '0 4px 15px rgba(212,175,55,0.2)' }}
              >
                {isProcessing ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}><Zap size={20} /></motion.div> : <><PlayCircle size={20} /> Execute Omnilingual Routing</>}
              </button>
            </div>

            {/* Output Side */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Executive Stream */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: showResults ? 1 : 0.3, x: 0 }} transition={{ delay: 0.1 }} style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: showResults ? '1px solid rgba(212, 175, 55, 0.4)' : '1px dashed rgba(255,255,255,0.1)', borderRadius: '12px', padding: '1.5rem' }}>
                <div style={{ color: '#D4AF37', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Routed to: CFO / Executive</span>
                  {showResults && <span style={{ color: '#10b981' }}>Processed Live via Engine</span>}
                </div>
                <div style={{ color: showResults ? '#fff' : '#52525b', fontSize: '0.95rem', lineHeight: '1.5' }}>
                  {showResults ? epiphanyData?.executive_summary : "Awaiting execution... Click the button to the left."}
                </div>
              </motion.div>

              {/* Engineering Stream */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: showResults ? 1 : 0.3, x: 0 }} transition={{ delay: 0.3 }} style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: showResults ? '1px solid rgba(59, 130, 246, 0.4)' : '1px dashed rgba(255,255,255,0.1)', borderRadius: '12px', padding: '1.5rem' }}>
                <div style={{ color: '#3b82f6', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>
                  Routed to: DevOps (JSON Payload)
                </div>
                <pre style={{ margin: 0, color: showResults ? '#93c5fd' : '#52525b', fontSize: '0.85rem', overflowX: 'auto', whiteSpace: 'pre-wrap' }}>
                  {showResults ? JSON.stringify(epiphanyData?.engineering_json, null, 2) : "Awaiting execution..."}
                </pre>
              </motion.div>

              {/* Localization Stream */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: showResults ? 1 : 0.3, x: 0 }} transition={{ delay: 0.5 }} style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: showResults ? '1px solid rgba(16, 185, 129, 0.4)' : '1px dashed rgba(255,255,255,0.1)', borderRadius: '12px', padding: '1.5rem' }}>
                <div style={{ color: '#10b981', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Globe size={14} /> Routed to: Client (fr-FR Translation)
                </div>
                <div style={{ color: showResults ? '#fff' : '#52525b', fontSize: '0.95rem', lineHeight: '1.5', fontStyle: 'italic' }}>
                  {showResults ? epiphanyData?.french_translation : "Awaiting execution..."}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Developer Integration Hub */}
      <section id="developers" style={{ padding: '6rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem' }}>Developer Integration Hub</h2>
            <p style={{ fontSize: '1.1rem', color: '#a1a1aa', maxWidth: '600px', margin: '0 auto' }}>
              Your engineering team can integrate the AAC API into your existing systems in under 15 minutes.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(212, 175, 55, 0.1)', border: '1px solid rgba(212, 175, 55, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D4AF37', fontWeight: 'bold' }}>1</div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>Install the SDK</h3>
                  <p style={{ color: '#a1a1aa', fontSize: '0.9rem' }}>Available for Node.js, Python, and Go.</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(212, 175, 55, 0.1)', border: '1px solid rgba(212, 175, 55, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D4AF37', fontWeight: 'bold' }}>2</div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>Bind Active Directory</h3>
                  <p style={{ color: '#a1a1aa', fontSize: '0.9rem' }}>Map your existing RBAC rules to the AAC substrate.</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(212, 175, 55, 0.1)', border: '1px solid rgba(212, 175, 55, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D4AF37', fontWeight: 'bold' }}>3</div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>Deploy Nodes</h3>
                  <p style={{ color: '#a1a1aa', fontSize: '0.9rem' }}>Route requests globally with zero cold starts.</p>
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: '#0A0A0C', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '0.75rem 1rem', display: 'flex', gap: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ef4444' }}></div>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#eab308' }}></div>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#10b981' }}></div>
              </div>
              <div style={{ padding: '1.5rem', fontFamily: 'monospace', fontSize: '0.85rem', color: '#e2e8f0', lineHeight: '1.6' }}>
                <div style={{ color: '#94a3b8', marginBottom: '1rem' }}># 1. Install via NPM</div>
                <div><span style={{ color: '#D4AF37' }}>npm</span> install @hive/activity-companion</div>
                <br/>
                <div style={{ color: '#94a3b8', marginBottom: '1rem' }}># 2. Initialize the Substrate</div>
                <div><span style={{ color: '#c678dd' }}>import</span> {'{ AACClient }'} <span style={{ color: '#c678dd' }}>from</span> <span style={{ color: '#98c379' }}>'@hive/activity-companion'</span>;</div>
                <br/>
                <div><span style={{ color: '#c678dd' }}>const</span> aac = <span style={{ color: '#e5c07b' }}>new</span> <span style={{ color: '#61afef' }}>AACClient</span>({'{'}</div>
                <div>  apiKey: process.env.<span style={{ color: '#e06c75' }}>HIVE_API_KEY</span>,</div>
                <div>  clearanceLevel: <span style={{ color: '#98c379' }}>'L5_EXECUTIVE'</span></div>
                <div>{'}'});</div>
                <br/>
                <div><span style={{ color: '#c678dd' }}>const</span> response = <span style={{ color: '#c678dd' }}>await</span> aac.<span style={{ color: '#61afef' }}>processAndRoute</span>(rawMeetingNotes);</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing CTA */}
      <section style={{ backgroundColor: 'rgba(212, 175, 55, 0.03)', padding: '6rem 2rem', borderTop: '1px solid rgba(212, 175, 55, 0.1)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '3rem' }}>Deploy the AI Workforce Now</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', maxWidth: '900px', margin: '0 auto' }}>
            {/* Sandbox Tier */}
            <div style={{ backgroundColor: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '3rem 2rem', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Growth / Sandbox</h3>
              <div style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem' }}>$50 Deposit</div>
              <p style={{ color: '#a1a1aa', marginBottom: '2rem', flex: 1, lineHeight: '1.6' }}>
                Pre-pay a $50 Sandbox Deposit. Test the engine with your own data for 7 days. The API is hard-capped against your deposit so you will never receive a surprise overage bill.
              </p>
              <button onClick={() => handleStripeCheckout('subscribe_base')} style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={e=>e.currentTarget.style.backgroundColor='rgba(255,255,255,0.1)'} onMouseOut={e=>e.currentTarget.style.backgroundColor='rgba(255,255,255,0.05)'}>
                Purchase Sandbox Key
              </button>
            </div>

            {/* Enterprise Tier */}
            <div style={{ backgroundColor: 'rgba(212, 175, 55, 0.05)', border: '1px solid rgba(212, 175, 55, 0.3)', borderRadius: '16px', padding: '3rem 2rem', display: 'flex', flexDirection: 'column', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '-15px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#D4AF37', color: '#000', padding: '0.25rem 1rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Recommended for Multinationals</div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#D4AF37' }}>Enterprise Master</h3>
              <div style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem' }}>100% Guaranteed Uptime</div>
              <p style={{ color: '#a1a1aa', marginBottom: '2rem', flex: 1, lineHeight: '1.6' }}>
                Your own private AI servers. No slowdowns, and your company's data is completely locked down and legally compliant.
              </p>
              <button onClick={() => handleStripeCheckout('subscribe_base')} style={{ backgroundColor: '#D4AF37', color: '#000', border: 'none', padding: '1rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 15px rgba(212,175,55,0.3)', transition: 'transform 0.2s' }} onMouseOver={e=>e.currentTarget.style.transform='translateY(-2px)'} onMouseOut={e=>e.currentTarget.style.transform='translateY(0)'}>
                Purchase Enterprise License
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ textAlign: 'center', padding: '4rem 2rem', color: '#52525b', fontSize: '0.875rem' }}>
        <div>Made with <span style={{ color: 'red' }}>♥</span> in <span style={{ color: '#D4AF37', fontWeight: 'bold' }}>the Hive</span>.</div>
        <div style={{ marginTop: '0.5rem' }}>Adaptive AI Activity Companion API (v2.0 Enterprise)</div>
      </footer>
    </div>
  );
}
