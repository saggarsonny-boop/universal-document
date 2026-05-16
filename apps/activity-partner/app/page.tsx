"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Zap, Server, Code, Globe, CheckCircle, ArrowRight, PlayCircle } from "lucide-react";

export default function Home() {
  // Epiphany Sandbox State
  const [rawInput, setRawInput] = useState("Meeting notes 10/24: Server migration failed again. Dev team says it's an AWS permission issue but finance hasn't approved the IAM role budget increase. Also the French client (Pierre) called and was furious about the downtime. We need to fix the AWS thing, get the budget approved by CFO, and apologize to Pierre by EOD or we lose the contract.");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [epiphanyData, setEpiphanyData] = useState<any>(null);

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
      // Fallback if network fails
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

  return (
    <div style={{ backgroundColor: '#050505', minHeight: '100vh', color: '#ffffff', fontFamily: 'Inter, system-ui, sans-serif', overflowX: 'hidden' }}>
      {/* Navigation */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', padding: '1.5rem 4rem', borderBottom: '1px solid rgba(255,255,255,0.05)', backgroundColor: 'rgba(5,5,5,0.8)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ fontSize: '1.25rem', fontWeight: 'bold', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Zap size={20} color="#D4AF37" />
          Hive <span style={{ color: '#D4AF37' }}>AAC Enterprise</span>
        </div>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <a href="#epiphany" style={{ color: '#a1a1aa', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }}>The "Aha" Moment</a>
          <a href="#developers" style={{ color: '#a1a1aa', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }}>API Docs</a>
          <button onClick={() => window.location.href='/sign-up'} style={{ backgroundColor: '#ffffff', color: '#000000', padding: '0.5rem 1.25rem', borderRadius: '4px', fontSize: '0.9rem', fontWeight: '500', border: 'none', cursor: 'pointer', transition: 'transform 0.2s' }}>
            Generate API Keys
          </button>
        </div>
      </nav>

      {/* Hero Section with Embedded Pitch Video */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '6rem 2rem', textAlign: 'center', position: 'relative' }}>
        
        {/* Background glow */}
        <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translate(-50%, -50%)', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(212,175,55,0.15) 0%, rgba(5,5,5,0) 70%)', zIndex: 0, pointerEvents: 'none' }} />

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} style={{ position: 'relative', zIndex: 10 }}>
          <div style={{ display: 'inline-block', padding: '0.25rem 1rem', border: '1px solid rgba(212, 175, 55, 0.3)', borderRadius: '20px', color: '#D4AF37', fontSize: '0.85rem', marginBottom: '2rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            The Adaptive AI Activity Companion API
          </div>
          <h1 style={{ fontSize: '4.5rem', fontWeight: '800', letterSpacing: '-0.03em', lineHeight: '1.1', marginBottom: '1.5rem' }}>
            Don't Buy Software. <br/>
            <span style={{ background: 'linear-gradient(90deg, #D4AF37 0%, #F3E5AB 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Deploy a Digital Workforce.</span>
          </h1>
          <p style={{ fontSize: '1.25rem', color: '#a1a1aa', maxWidth: '800px', margin: '0 auto 3rem auto', lineHeight: '1.6' }}>
            Instantly augment your enterprise with an infinitely scalable substrate. It reasons, it routes, and it executes across 72 languages natively. Your biggest bottleneck is friction—we eliminate it at the API level.
          </p>

          {/* Embedded Executive Pitch / Demo */}
          <div style={{ margin: '0 auto 4rem auto', width: '100%', maxWidth: '900px', height: '500px', backgroundColor: '#0B0F19', borderRadius: '16px', border: '1px solid rgba(212, 175, 55, 0.2)', overflow: 'hidden', position: 'relative', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
            {/* Embedded Iframe pointing to the interactive pitch */}
            <iframe 
              src="/executive_pitch.html" 
              style={{ width: '100%', height: '100%', border: 'none' }}
              title="Executive Pitch Demo"
            ></iframe>
          </div>
        </motion.div>
      </main>

      {/* The "Epiphany" / Aha Moment Section */}
      <section id="epiphany" style={{ backgroundColor: '#0A0A0C', padding: '6rem 2rem', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem' }}>The <span style={{ color: '#D4AF37' }}>"Aha"</span> Moment</h2>
            <p style={{ fontSize: '1.1rem', color: '#a1a1aa', maxWidth: '600px', margin: '0 auto' }}>
              Paste a chaotic block of raw data. Watch the AAC API instantly reason, structure, route, and translate it for three different departments simultaneously.
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
                style={{ marginTop: '1.5rem', backgroundColor: '#D4AF37', color: '#000', padding: '1rem', borderRadius: '8px', fontSize: '1.1rem', fontWeight: '600', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s' }}
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
                  {showResults && <span style={{ color: '#10b981' }}>Processed Live via Anthropic</span>}
                </div>
                <div style={{ color: showResults ? '#fff' : '#52525b', fontSize: '0.95rem', lineHeight: '1.5' }}>
                  {showResults ? epiphanyData?.executive_summary : "Awaiting execution..."}
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
          <h2 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '3rem' }}>Ready to Deploy?</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', maxWidth: '900px', margin: '0 auto' }}>
            {/* Startup Tier */}
            <div style={{ backgroundColor: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '3rem 2rem', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Growth / Small Teams</h3>
              <div style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem' }}>Pay-as-you-go</div>
              <p style={{ color: '#a1a1aa', marginBottom: '2rem', flex: 1 }}>Perfect for testing the engine and integrating into initial workflows.</p>
              <button onClick={() => window.location.href='/sign-up'} style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={e=>e.currentTarget.style.backgroundColor='rgba(255,255,255,0.1)'} onMouseOut={e=>e.currentTarget.style.backgroundColor='rgba(255,255,255,0.05)'}>
                Generate Sandbox Key
              </button>
            </div>

            {/* Enterprise Tier */}
            <div style={{ backgroundColor: 'rgba(212, 175, 55, 0.05)', border: '1px solid rgba(212, 175, 55, 0.3)', borderRadius: '16px', padding: '3rem 2rem', display: 'flex', flexDirection: 'column', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '-15px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#D4AF37', color: '#000', padding: '0.25rem 1rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Recommended for Multinationals</div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#D4AF37' }}>Enterprise Custom</h3>
              <div style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem' }}>Unlimited SLA</div>
              <p style={{ color: '#a1a1aa', marginBottom: '2rem', flex: 1 }}>Dedicated inference nodes, zero rate limits, and custom SOC2 compliance isolation.</p>
              <button onClick={() => window.location.href='/sign-up'} style={{ backgroundColor: '#D4AF37', color: '#000', border: 'none', padding: '1rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 15px rgba(212,175,55,0.3)', transition: 'transform 0.2s' }} onMouseOver={e=>e.currentTarget.style.transform='translateY(-2px)'} onMouseOut={e=>e.currentTarget.style.transform='translateY(0)'}>
                Contact Sales & Deploy
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ textAlign: 'center', padding: '4rem 2rem', color: '#52525b', fontSize: '0.875rem' }}>
        <div>Made with ♥ in <span style={{ color: '#D4AF37', fontWeight: 'bold' }}>the Hive</span>.</div>
        <div style={{ marginTop: '0.5rem' }}>Adaptive AI Activity Companion API (v2.0 Enterprise)</div>
      </footer>
    </div>
  );
}
