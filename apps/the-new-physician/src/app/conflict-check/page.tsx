import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conflict Check Intake: Sonny Saggar MD",
  description:
    "Submit a two-hour conflict clearance request for retained clinical consulting, EMR forensics, or expert witness engagement.",
};

export default function ConflictCheckPage() {
  return (
    <>
      {/* Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ContactPage",
            "name": "Conflict Check Intake: Sonny Saggar MD",
            "description":
              "Submit a two-hour conflict clearance request for retained clinical consulting, EMR forensics, or expert witness engagement.",
            "url": "https://newphysician.org/conflict-check",
            "mainEntity": {
              "@type": "Person",
              "@id": "https://newphysician.org/#person",
              "name": "Sonny Saggar, MD",
              "jobTitle": "Emergency Medicine Physician and Legal Scholar",
            },
          }),
        }}
      />

      <main style={{
        backgroundColor: "#0A0A0A",
        color: "#FFFFFF",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px"
      }}>
        <div style={{
          maxWidth: "600px",
          width: "100%",
          backgroundColor: "#121212",
          border: "1px solid #1F1F1F",
          borderRadius: "12px",
          padding: "40px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.5)"
        }}>
          
          <h1 style={{
            fontSize: "2rem",
            fontWeight: 800,
            marginBottom: "12px",
            letterSpacing: "-0.5px",
            color: "#FFFFFF"
          }}>
            Conflict Check <span style={{ color: "#D4AF37" }}>Intake</span>
          </h1>
          
          <p style={{
            color: "#A0A0A0",
            fontSize: "0.95rem",
            lineHeight: 1.6,
            marginBottom: "32px"
          }}>
            Submit the details below to initiate a formal conflict clearance check. Requests are typically processed and resolved within a <strong>two-hour window</strong>.
          </p>

          <form action="https://formspree.io/f/xoqgypyd" method="POST" style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px"
          }}>
            {/* Hidden field for routing target email */}
            <input type="hidden" name="_to" value="saggarsonny@gmail.com" />

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label htmlFor="name" style={{ fontSize: "0.85rem", fontWeight: 600, color: "#D4AF37", textTransform: "uppercase", letterSpacing: "1px" }}>Full Name</label>
              <input 
                type="text" 
                id="name" 
                name="name" 
                required 
                placeholder="Dr./Mr./Ms. Attorney Name"
                style={{
                  backgroundColor: "#0A0A0A",
                  border: "1px solid #1F1F1F",
                  borderRadius: "6px",
                  padding: "12px 16px",
                  color: "#FFFFFF",
                  fontSize: "0.95rem",
                  outline: "none"
                }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label htmlFor="firm" style={{ fontSize: "0.85rem", fontWeight: 600, color: "#D4AF37", textTransform: "uppercase", letterSpacing: "1px" }}>Firm or Organization</label>
              <input 
                type="text" 
                id="firm" 
                name="firm" 
                required 
                placeholder="Law Firm / Investment Fund Name"
                style={{
                  backgroundColor: "#0A0A0A",
                  border: "1px solid #1F1F1F",
                  borderRadius: "6px",
                  padding: "12px 16px",
                  color: "#FFFFFF",
                  fontSize: "0.95rem",
                  outline: "none"
                }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label htmlFor="email" style={{ fontSize: "0.85rem", fontWeight: 600, color: "#D4AF37", textTransform: "uppercase", letterSpacing: "1px" }}>Email Address</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                required 
                placeholder="name@firm.com"
                style={{
                  backgroundColor: "#0A0A0A",
                  border: "1px solid #1F1F1F",
                  borderRadius: "6px",
                  padding: "12px 16px",
                  color: "#FFFFFF",
                  fontSize: "0.95rem",
                  outline: "none"
                }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label htmlFor="phone" style={{ fontSize: "0.85rem", fontWeight: 600, color: "#D4AF37", textTransform: "uppercase", letterSpacing: "1px" }}>Phone Number</label>
              <input 
                type="tel" 
                id="phone" 
                name="phone" 
                required 
                placeholder="+1 (555) 012-3456"
                style={{
                  backgroundColor: "#0A0A0A",
                  border: "1px solid #1F1F1F",
                  borderRadius: "6px",
                  padding: "12px 16px",
                  color: "#FFFFFF",
                  fontSize: "0.95rem",
                  outline: "none"
                }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label htmlFor="description" style={{ fontSize: "0.85rem", fontWeight: 600, color: "#D4AF37", textTransform: "uppercase", letterSpacing: "1px" }}>Brief Matter Description</label>
              <textarea 
                id="description" 
                name="description" 
                required 
                placeholder="Please describe the adverse parties or specific matter scope to clear checks..."
                rows={5}
                style={{
                  backgroundColor: "#0A0A0A",
                  border: "1px solid #1F1F1F",
                  borderRadius: "6px",
                  padding: "12px 16px",
                  color: "#FFFFFF",
                  fontSize: "0.95rem",
                  outline: "none",
                  resize: "vertical"
                }}
              />
            </div>

            <button type="submit" style={{
              marginTop: "12px",
              backgroundColor: "#D4AF37",
              color: "#0A0A0A",
              border: "none",
              borderRadius: "6px",
              padding: "14px",
              fontSize: "1rem",
              fontWeight: 700,
              cursor: "pointer",
              transition: "background-color 0.2s ease"
            }}>
              Submit Request
            </button>
          </form>

        </div>
      </main>
    </>
  );
}
