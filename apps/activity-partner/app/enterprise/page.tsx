'use client';

import { Check, Building2, Users } from "lucide-react";

const GOLD = "#D4AF37";
const PAPER = "#f5f1e6";
const MUTED = "#888";

export default function EnterprisePortal() {
  
  const handleCheckout = async (action: 'subscribe_base' | 'add_seats') => {
    try {
      const res = await fetch('/api/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, quantity: action === 'add_seats' ? 10 : 1 })
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <main style={mainStyle}>
      <header style={headerStyle}>
        <div style={logoStyle}>AAC <span style={{ color: MUTED }}>Enterprise</span></div>
      </header>

      <div style={contentStyle}>
        <div style={heroStyle}>
          <h1 style={titleStyle}>Scale Your Intelligence Layer</h1>
          <p style={taglineStyle}>Select the provisioning tier that matches your organizational footprint.</p>
        </div>

        <div style={pricingGridStyle}>
          <div style={{...cardStyle, borderColor: "rgba(212, 175, 55, 0.3)"}}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
              <div>
                <Building2 size={32} color={GOLD} style={{ marginBottom: 16 }} />
                <h2 style={cardTitleStyle}>Base Enterprise Platform</h2>
                <p style={cardDescStyle}>Dedicated tenant isolation, priority SLA, and core infrastructure.</p>
              </div>
              <div style={badgeStyle}>Annual License</div>
            </div>
            
            <div style={{ margin: "24px 0", paddingBottom: 24, borderBottom: "1px solid #222" }}>
              <span style={priceStyle}>$12,000</span><span style={periodStyle}>/year</span>
            </div>

            <ul style={listStyle}>
              <li style={listItemStyle}><Check size={18} color={GOLD} /> Complete Data Siloing (Neon Postgres)</li>
              <li style={listItemStyle}><Check size={18} color={GOLD} /> Advanced Anthropic Guardrails</li>
              <li style={listItemStyle}><Check size={18} color={GOLD} /> SOC2 Compliant Architecture</li>
              <li style={listItemStyle}><Check size={18} color={GOLD} /> 24/7 Priority Support Desk</li>
            </ul>

            <button onClick={() => handleCheckout('subscribe_base')} style={primaryBtnStyle}>
              Provision Platform
            </button>
          </div>

          <div style={cardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
              <div>
                <Users size={32} color={MUTED} style={{ marginBottom: 16 }} />
                <h2 style={cardTitleStyle}>AAC Seat Licenses</h2>
                <p style={cardDescStyle}>Scale access to the AI companion across your clinical or corporate staff.</p>
              </div>
            </div>
            
            <div style={{ margin: "24px 0", paddingBottom: 24, borderBottom: "1px solid #222" }}>
              <span style={priceStyle}>$49</span><span style={periodStyle}>/seat/mo</span>
            </div>

            <ul style={listStyle}>
              <li style={listItemStyle}><Check size={18} color={MUTED} /> Unlimited Anthropic Opus Tokens</li>
              <li style={listItemStyle}><Check size={18} color={MUTED} /> Vertical-Specific Workflows</li>
              <li style={listItemStyle}><Check size={18} color={MUTED} /> Individual Safety Logs</li>
              <li style={listItemStyle}><Check size={18} color={MUTED} /> Automated De-provisioning</li>
            </ul>

            <button onClick={() => handleCheckout('add_seats')} style={secondaryBtnStyle}>
              Add Seats
            </button>
          </div>
        </div>

        <div style={{ marginTop: 64 }}>
          <h2 style={{ fontSize: 28, fontWeight: 600, textAlign: 'center', marginBottom: 32 }}>Premium Dashboard Add-Ons</h2>
          <div style={pricingGridStyle}>
            {/* Voice Upgrade */}
            <div style={{...cardStyle, padding: 32}}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div>
                  <h3 style={{ margin: "0 0 8px", fontSize: 20 }}>Voice & Telemetry Module</h3>
                  <p style={{ margin: 0, fontSize: 14, color: MUTED }}>Enable zero-latency voice input and native text-to-speech for hands-free workflows.</p>
                </div>
              </div>
              <div style={{ margin: "16px 0 24px", paddingBottom: 24, borderBottom: "1px solid #222" }}>
                <span style={{ fontSize: 36, fontWeight: 600 }}>$199</span><span style={periodStyle}>/mo flat rate</span>
              </div>
              <button onClick={() => handleCheckout('upgrade_voice')} style={secondaryBtnStyle}>Enable Voice Module</button>
            </div>

            {/* Imagery Upgrade */}
            <div style={{...cardStyle, padding: 32}}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div>
                  <h3 style={{ margin: "0 0 8px", fontSize: 20 }}>Custom Avatar Module</h3>
                  <p style={{ margin: 0, fontSize: 14, color: MUTED }}>Upload custom branded imagery or select from our premium 3D holographic gallery.</p>
                </div>
              </div>
              <div style={{ margin: "16px 0 24px", paddingBottom: 24, borderBottom: "1px solid #222" }}>
                <span style={{ fontSize: 36, fontWeight: 600 }}>$99</span><span style={periodStyle}>/mo flat rate</span>
              </div>
              <button onClick={() => handleCheckout('upgrade_imagery')} style={secondaryBtnStyle}>Enable Imagery Module</button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

const mainStyle: React.CSSProperties = {
  fontFamily: "system-ui, sans-serif",
  backgroundColor: "#050505",
  color: PAPER,
  minHeight: "100dvh"
};

const headerStyle: React.CSSProperties = {
  padding: "24px 48px",
  borderBottom: "1px solid #111",
  display: "flex",
  justifyContent: "space-between"
};

const logoStyle: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 600,
  letterSpacing: "-0.02em"
};

const contentStyle: React.CSSProperties = {
  padding: "80px 24px",
  maxWidth: 1000,
  margin: "0 auto"
};

const heroStyle: React.CSSProperties = {
  textAlign: "center",
  marginBottom: 64
};

const titleStyle: React.CSSProperties = {
  margin: "0 0 16px",
  fontSize: 42,
  fontWeight: 600,
  letterSpacing: "-0.03em"
};

const taglineStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 18,
  color: MUTED
};

const pricingGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
  gap: 32
};

const cardStyle: React.CSSProperties = {
  backgroundColor: "#0a0a0a",
  border: "1px solid #1a1a1a",
  borderRadius: 24,
  padding: 40,
  display: "flex",
  flexDirection: "column",
  transition: "transform 0.2s"
};

const badgeStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: GOLD,
  backgroundColor: "rgba(212, 175, 55, 0.1)",
  padding: "4px 12px",
  borderRadius: 100,
  textTransform: "uppercase",
  letterSpacing: "0.05em"
};

const cardTitleStyle: React.CSSProperties = {
  margin: "0 0 8px",
  fontSize: 24,
  fontWeight: 600
};

const cardDescStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 14,
  color: MUTED,
  lineHeight: 1.5
};

const priceStyle: React.CSSProperties = {
  fontSize: 48,
  fontWeight: 600,
  letterSpacing: "-0.03em"
};

const periodStyle: React.CSSProperties = {
  fontSize: 16,
  color: MUTED,
  marginLeft: 8
};

const listStyle: React.CSSProperties = {
  listStyle: "none",
  padding: 0,
  margin: "0 0 40px",
  flex: 1
};

const listItemStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  fontSize: 15,
  color: "#ccc",
  marginBottom: 16
};

const primaryBtnStyle: React.CSSProperties = {
  width: "100%",
  padding: "16px",
  backgroundColor: GOLD,
  color: "#000",
  border: "none",
  borderRadius: 12,
  fontSize: 16,
  fontWeight: 600,
  cursor: "pointer"
};

const secondaryBtnStyle: React.CSSProperties = {
  width: "100%",
  padding: "16px",
  backgroundColor: "#111",
  color: PAPER,
  border: "1px solid #333",
  borderRadius: 12,
  fontSize: 16,
  fontWeight: 600,
  cursor: "pointer"
};
