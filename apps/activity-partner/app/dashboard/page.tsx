'use client';

import { Activity, ShieldAlert, Cpu, Network, ArrowUpRight } from "lucide-react";

const GOLD = "#D4AF37";
const PAPER = "#f5f1e6";
const MUTED = "#888";
const BG_DARK = "#050505";
const CARD_BG = "#0a0a0a";

export default function Dashboard() {
  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={logoStyle}>AAC</div>
          <div style={tenantBadgeStyle}>ACME Corp Deployment</div>
        </div>
        <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
          <div style={statusDotStyle}><span className="dot" style={{ backgroundColor: "#10b981", width: 8, height: 8, borderRadius: "50%", display: "inline-block" }}></span> Operational</div>
          <button style={manageBtnStyle}>Manage Seats (12/50)</button>
        </div>
      </header>

      <div style={layoutStyle}>
        <nav style={navStyle}>
          <a href="#" style={navItemActiveStyle}>System Overview</a>
          <a href="#" style={navItemStyle}>Intelligence Routing</a>
          <a href="#" style={navItemStyle}>Safety & Guardrails</a>
          <a href="#" style={navItemStyle}>Billing & Provisioning</a>
          <a href="#" style={navItemStyle}>API & Webhooks</a>
        </nav>

        <main style={mainContentStyle}>
          <div style={gridTopStyle}>
            <div style={statCardStyle}>
              <div style={statHeaderStyle}>
                <Activity size={18} color={MUTED} />
                <span style={statLabelStyle}>Token Volume (30d)</span>
              </div>
              <div style={statValueStyle}>1.24M <ArrowUpRight size={20} color="#10b981" /></div>
            </div>
            
            <div style={statCardStyle}>
              <div style={statHeaderStyle}>
                <Cpu size={18} color={MUTED} />
                <span style={statLabelStyle}>Active Inference Nodes</span>
              </div>
              <div style={statValueStyle}>12 <span style={{fontSize: 14, color: MUTED}}>/ 50 allocated</span></div>
            </div>

            <div style={{...statCardStyle, borderColor: "rgba(212, 175, 55, 0.3)"}}>
              <div style={statHeaderStyle}>
                <ShieldAlert size={18} color={GOLD} />
                <span style={statLabelStyle}>Safety Interventions</span>
              </div>
              <div style={{...statValueStyle, color: GOLD}}>0</div>
            </div>
          </div>

          <div style={tableContainerStyle}>
            <div style={tableHeaderStyle}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 500 }}>Active Vertical Deployments</h3>
              <Network size={18} color={MUTED} />
            </div>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th>Environment Name</th>
                  <th>Model Profile</th>
                  <th>Last Sync</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Clinical Assistant v2.1</td>
                  <td>Claude 3 Opus (Strict)</td>
                  <td>2 mins ago</td>
                  <td><span style={statusBadgeStyle}>Active</span></td>
                </tr>
                <tr>
                  <td>Practice Manager Hub</td>
                  <td>Claude 3 Haiku (Fast)</td>
                  <td>1 hour ago</td>
                  <td><span style={statusBadgeStyle}>Active</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}

const containerStyle: React.CSSProperties = {
  fontFamily: "var(--font-mono), ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  backgroundColor: BG_DARK,
  color: PAPER,
  minHeight: "100dvh",
  fontSize: 14
};

const headerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "16px 32px",
  borderBottom: "1px solid #1a1a1a",
  backgroundColor: CARD_BG
};

const logoStyle: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 700,
  letterSpacing: "-0.02em",
  color: GOLD
};

const tenantBadgeStyle: React.CSSProperties = {
  fontSize: 12,
  padding: "4px 8px",
  backgroundColor: "#111",
  border: "1px solid #222",
  borderRadius: 4,
  color: "#aaa"
};

const statusDotStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  fontSize: 12,
  color: "#aaa"
};

const manageBtnStyle: React.CSSProperties = {
  backgroundColor: "#111",
  color: PAPER,
  border: "1px solid #333",
  padding: "6px 12px",
  borderRadius: 6,
  cursor: "pointer",
  fontFamily: "inherit",
  fontSize: 12
};

const layoutStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "240px 1fr",
  minHeight: "calc(100dvh - 61px)"
};

const navStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  padding: "24px 16px",
  borderRight: "1px solid #1a1a1a",
  backgroundColor: CARD_BG
};

const navItemStyle: React.CSSProperties = {
  padding: "10px 16px",
  color: MUTED,
  textDecoration: "none",
  borderRadius: 6,
  marginBottom: 4,
  transition: "background 0.2s"
};

const navItemActiveStyle: React.CSSProperties = {
  ...navItemStyle,
  color: GOLD,
  backgroundColor: "rgba(212, 175, 55, 0.05)",
  fontWeight: 500
};

const mainContentStyle: React.CSSProperties = {
  padding: 40,
  maxWidth: 1200
};

const gridTopStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: 24,
  marginBottom: 40
};

const statCardStyle: React.CSSProperties = {
  backgroundColor: CARD_BG,
  border: "1px solid #1a1a1a",
  borderRadius: 8,
  padding: 24
};

const statHeaderStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  marginBottom: 16
};

const statLabelStyle: React.CSSProperties = {
  color: MUTED,
  fontSize: 13,
  textTransform: "uppercase",
  letterSpacing: "0.05em"
};

const statValueStyle: React.CSSProperties = {
  fontSize: 32,
  fontWeight: 400,
  display: "flex",
  alignItems: "center",
  gap: 8
};

const tableContainerStyle: React.CSSProperties = {
  backgroundColor: CARD_BG,
  border: "1px solid #1a1a1a",
  borderRadius: 8,
  overflow: "hidden"
};

const tableHeaderStyle: React.CSSProperties = {
  padding: "20px 24px",
  borderBottom: "1px solid #1a1a1a",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center"
};

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  textAlign: "left"
};

const statusBadgeStyle: React.CSSProperties = {
  padding: "4px 8px",
  backgroundColor: "rgba(16, 185, 129, 0.1)",
  color: "#10b981",
  borderRadius: 4,
  fontSize: 12
};
