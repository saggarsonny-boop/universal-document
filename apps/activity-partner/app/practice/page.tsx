'use client';

import { Briefcase } from 'lucide-react';
import { AACLiveCompanion } from '../_components/AACLiveCompanion';

export default function PracticeVertical() {
  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <div style={logoStyle}>AAC <span style={{ color: "#888" }}>Practice Management</span></div>
        <div style={statusBadgeStyle}><Briefcase size={14} /> Active Seat</div>
      </header>

      <main style={mainStyle}>
        <div style={layoutStyle}>
          <div style={sidebarStyle}>
            <h3 style={sectionTitleStyle}>Operations Context</h3>
            <p style={contextTextStyle}>
              This tenant isolation runs on a rapid-response configuration optimized for operational tasks, scheduling, and billing queries.
            </p>
            <div style={dataCardStyle}>
              <div style={dataLabelStyle}>Current Workflow</div>
              <div style={dataValueStyle}>Intake Optimization</div>
            </div>
            <div style={dataCardStyle}>
              <div style={dataLabelStyle}>Active LLM</div>
              <div style={dataValueStyle}>Claude 3 Haiku (Fast)</div>
            </div>
            <div style={dataCardStyle}>
              <div style={dataLabelStyle}>Seat License</div>
              <div style={dataValueStyle}>#A-7782-B</div>
            </div>
          </div>
          
          <div style={companionAreaStyle}>
            <AACLiveCompanion />
          </div>
        </div>
      </main>
    </div>
  );
}

const containerStyle: React.CSSProperties = {
  fontFamily: "system-ui, sans-serif",
  backgroundColor: "#050505",
  minHeight: "100dvh",
  color: "#f5f1e6"
};

const headerStyle: React.CSSProperties = {
  padding: "24px 48px",
  borderBottom: "1px solid #111",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  backgroundColor: "#0a0a0a"
};

const logoStyle: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 600,
  letterSpacing: "-0.02em"
};

const statusBadgeStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  fontSize: 12,
  padding: "6px 12px",
  backgroundColor: "rgba(212, 175, 55, 0.1)",
  color: "#D4AF37",
  borderRadius: 100,
  fontWeight: 500,
  textTransform: "uppercase",
  letterSpacing: "0.05em"
};

const mainStyle: React.CSSProperties = {
  padding: "48px 48px",
  maxWidth: 1400,
  margin: "0 auto"
};

const layoutStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "300px 1fr",
  gap: 48
};

const sidebarStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 24
};

const sectionTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 14,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  color: "#888",
  fontWeight: 600
};

const contextTextStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 14,
  lineHeight: 1.6,
  color: "#aaa"
};

const dataCardStyle: React.CSSProperties = {
  backgroundColor: "#0a0a0a",
  border: "1px solid #1a1a1a",
  borderRadius: 12,
  padding: 16
};

const dataLabelStyle: React.CSSProperties = {
  fontSize: 12,
  color: "#666",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  marginBottom: 8
};

const dataValueStyle: React.CSSProperties = {
  fontSize: 15,
  color: "#D4AF37",
  fontWeight: 500
};

const companionAreaStyle: React.CSSProperties = {
  flex: 1
};
