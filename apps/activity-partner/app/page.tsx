'use client';

import { useState } from "react";
import { ArrowRight, ShieldCheck, Zap, Activity } from "lucide-react";

const GOLD = "#D4AF37";
const GOLD_MUTED = "#C5A880";
const PAPER = "#f5f1e6";
const MUTED = "#888";

export default function Home() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle'|'loading'|'sent'>('idle');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    
    // Generate a temporary session ID for the unauthenticated user
    const tempSessionId = crypto.randomUUID();
    
    try {
      const res = await fetch('/api/auth/send-magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, session_id: tempSessionId })
      });
      if (res.ok) {
        setStatus('sent');
      } else {
        setStatus('idle');
      }
    } catch {
      setStatus('idle');
    }
  };

  return (
    <main style={mainStyle}>
      <div style={glowStyle} />
      
      <div style={containerStyle}>
        <div style={heroStyle}>
          <div style={badgeStyle}>Adaptive AI Activity Companion</div>
          <h1 style={titleStyle}>Enterprise-Grade Intelligence.<br/><span style={{ color: GOLD }}>Zero Hallucinations.</span></h1>
          <p style={taglineStyle}>
            Deploy tenant-isolated, highly configurable AI agents into your clinical, practice, or corporate environment. Built on Anthropic's Claude 3.
          </p>
        </div>

        <div style={authCardStyle}>
          {status === 'sent' ? (
            <div style={{ textAlign: "center", padding: "24px 0" }}>
              <ShieldCheck size={48} color={GOLD} style={{ margin: "0 auto 16px" }} />
              <h3 style={{ margin: "0 0 8px", color: PAPER, fontSize: 20 }}>Secure Link Sent</h3>
              <p style={{ color: MUTED, margin: 0, fontSize: 14 }}>Check {email} for your authentication link.</p>
            </div>
          ) : (
            <form onSubmit={handleLogin} style={formStyle}>
              <h3 style={{ margin: "0 0 16px", color: PAPER, fontSize: 18, fontWeight: 500 }}>Access Portal</h3>
              <div style={{ display: "flex", gap: 12 }}>
                <input 
                  type="email" 
                  placeholder="name@company.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={inputStyle}
                  required
                />
                <button type="submit" disabled={status === 'loading'} style={submitBtnStyle}>
                  {status === 'loading' ? 'Authenticating...' : <><ArrowRight size={18} /> Continue</>}
                </button>
              </div>
            </form>
          )}
        </div>

        <div style={gridStyle}>
          <div style={featureCardStyle}>
            <Activity size={24} color={GOLD_MUTED} style={{ marginBottom: 16 }} />
            <h4 style={featureTitleStyle}>Tenant Isolated</h4>
            <p style={featureBodyStyle}>Data never bleeds. Every deployment sits within its own secure Neon Postgres silo.</p>
          </div>
          <div style={featureCardStyle}>
            <ShieldCheck size={24} color={GOLD_MUTED} style={{ marginBottom: 16 }} />
            <h4 style={featureTitleStyle}>Strict Guardrails</h4>
            <p style={featureBodyStyle}>Machine-level safety limits engineered for high-liability environments.</p>
          </div>
          <div style={featureCardStyle}>
            <Zap size={24} color={GOLD_MUTED} style={{ marginBottom: 16 }} />
            <h4 style={featureTitleStyle}>Instant Provisioning</h4>
            <p style={featureBodyStyle}>Automated seat-license billing means scaling your intelligence layer takes seconds.</p>
          </div>
        </div>
      </div>
    </main>
  );
}

const mainStyle: React.CSSProperties = {
  position: "relative",
  overflow: "hidden",
  fontFamily: "system-ui, sans-serif",
  backgroundColor: "#050505",
  minHeight: "100dvh",
  color: PAPER
};

const glowStyle: React.CSSProperties = {
  position: "absolute",
  top: "-20%",
  left: "50%",
  transform: "translateX(-50%)",
  width: "80vw",
  height: "50vh",
  background: "radial-gradient(ellipse at center, rgba(212, 175, 55, 0.15) 0%, rgba(5,5,5,0) 70%)",
  pointerEvents: "none",
  zIndex: 0
};

const containerStyle: React.CSSProperties = {
  position: "relative",
  zIndex: 1,
  maxWidth: 1000,
  margin: "0 auto",
  padding: "80px 24px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center"
};

const heroStyle: React.CSSProperties = {
  textAlign: "center",
  marginBottom: 64,
  maxWidth: 800
};

const badgeStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "6px 16px",
  borderRadius: 100,
  border: `1px solid rgba(212, 175, 55, 0.3)`,
  color: GOLD,
  fontSize: 13,
  fontWeight: 600,
  letterSpacing: "0.05em",
  textTransform: "uppercase",
  marginBottom: 24,
  backgroundColor: "rgba(212, 175, 55, 0.05)"
};

const titleStyle: React.CSSProperties = {
  margin: "0 0 24px",
  fontSize: "clamp(32px, 5vw, 56px)",
  lineHeight: 1.1,
  letterSpacing: "-0.03em",
  fontWeight: 600,
};

const taglineStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "clamp(16px, 2vw, 20px)",
  color: MUTED,
  lineHeight: 1.6,
  maxWidth: 600,
  marginInline: "auto"
};

const authCardStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: 480,
  background: "rgba(15, 15, 15, 0.6)",
  backdropFilter: "blur(20px)",
  border: "1px solid rgba(255, 255, 255, 0.08)",
  borderRadius: 16,
  padding: 32,
  marginBottom: 80,
  boxShadow: "0 24px 48px rgba(0,0,0,0.4)"
};

const formStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column"
};

const inputStyle: React.CSSProperties = {
  flex: 1,
  padding: "14px 16px",
  background: "#0a0a0a",
  border: "1px solid #333",
  borderRadius: 8,
  color: PAPER,
  fontSize: 15,
  outline: "none",
  transition: "border-color 0.2s"
};

const submitBtnStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "0 24px",
  background: GOLD,
  color: "#000",
  border: "none",
  borderRadius: 8,
  fontWeight: 600,
  fontSize: 15,
  cursor: "pointer",
  transition: "opacity 0.2s"
};

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: 24,
  width: "100%"
};

const featureCardStyle: React.CSSProperties = {
  padding: 32,
  background: "#0a0a0a",
  border: "1px solid #1a1a1a",
  borderRadius: 16,
  transition: "border-color 0.3s"
};

const featureTitleStyle: React.CSSProperties = {
  margin: "0 0 12px",
  fontSize: 18,
  fontWeight: 500,
  color: PAPER
};

const featureBodyStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 15,
  color: MUTED,
  lineHeight: 1.6
};
