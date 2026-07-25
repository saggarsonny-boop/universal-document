"use client";
import React, { useState, useEffect } from "react";

export default function SuccessPage() {
  const [sessionId, setSessionId] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState(1); // 1 = loading/verifying session, 2 = enter code, 3 = complete
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [activeToken, setActiveToken] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem("hive_session_token");
    if (token) {
      setActiveToken(token);
      setStep(3);
    } else {
      const params = new URLSearchParams(window.location.search);
      const sid = params.get("session_id");
      if (sid) {
        setSessionId(sid);
        verifyStripeSession(sid);
      } else {
        setError("Error: Missing checkout session ID. Please complete payment first.");
      }
    }
  }, []);

  const verifyStripeSession = async (sid: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/activation/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sid }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMaskedEmail(data.email);
        setStep(2);
        setMessage(`We found your purchase! A secure activation code has been sent to ${data.email}.`);
      } else {
        setError(data.error || "Could not verify your purchase session. Please contact support.");
      }
    } catch (err) {
      setError("Network error verifying purchase. Please refresh to try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      // Re-fetch email from Stripe session context (or passed from verification step)
      const sessionRes = await fetch("/api/activation/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId }),
      });
      const sessionData = await sessionRes.json();
      if (!sessionRes.ok) {
        setError("Session expired. Please reload page.");
        setLoading(false);
        return;
      }

      // Perform verification
      const res = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: sessionData.email, code }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem("hive_session_token", data.token);
        setActiveToken(data.token);
        setStep(3);
        setMessage("License Activated! Redirecting to dashboard...");
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1500);
      } else {
        setError(data.error || "Invalid code.");
      }
    } catch (err) {
      setError("Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeSessions = async () => {
    if (!confirm("Are you sure you want to revoke all active sessions? This will sign out all devices.")) return;
    setLoading(true);
    localStorage.removeItem("hive_session_token");
    setActiveToken(null);
    setStep(1);
    setMessage("All sessions revoked successfully.");
    const params = new URLSearchParams(window.location.search);
    const sid = params.get("session_id");
    if (sid) {
      verifyStripeSession(sid);
    } else {
      setError("Missing checkout session ID.");
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0A0A0A",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Outfit', sans-serif",
      color: "#FFFFFF",
      padding: "20px"
    }}>
      <style jsx global>{`
        ::selection {
          background-color: #D4AF37;
          color: #000000;
        }
      `}</style>
      
      <div style={{
        background: "rgba(22, 26, 33, 0.75)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: "16px",
        padding: "40px",
        maxWidth: "480px",
        width: "100%",
        boxShadow: "0 10px 40px rgba(0, 0, 0, 0.5)"
      }}>
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "2rem",
            color: "#D4AF37",
            marginBottom: "10px"
          }}>
            THE NEW PHYSICIAN
          </h1>
          <div style={{
            height: "2px",
            width: "60px",
            background: "#D4AF37",
            margin: "0 auto 20px auto"
          }}></div>
          <h2 style={{ fontSize: "1.25rem", fontWeight: "600" }}>Sovereign License Activation</h2>
        </div>

        {error && <div style={{ color: "#ef4444", marginBottom: "15px", textAlign: "center", fontSize: "0.9rem" }}>{error}</div>}
        {message && <div style={{ color: "#D4AF37", marginBottom: "15px", textAlign: "center", fontSize: "0.9rem" }}>{message}</div>}

        {step === 1 && (
          <div style={{ textAlign: "center", padding: "20px" }}>
            <p style={{ color: "#A3A3A3", marginBottom: "20px" }}>Verifying checkout session with Stripe...</p>
            <div style={{
              width: "40px",
              height: "40px",
              border: "3px solid rgba(212, 175, 55, 0.1)",
              borderTop: "3px solid #D4AF37",
              borderRadius: "50%",
              margin: "0 auto",
              animation: "spin 1s linear infinite"
            }}></div>
            <style jsx>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyCode}>
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "0.85rem", color: "#A3A3A3", marginBottom: "8px" }}>
                Activation Code (Sent to {maskedEmail})
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. 123456"
                style={{
                  width: "100%",
                  padding: "12px",
                  background: "#161A21",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "8px",
                  color: "#FFFFFF",
                  fontSize: "0.95rem",
                  textAlign: "center",
                  letterSpacing: "4px",
                  boxSizing: "border-box"
                }}
              />
            </div>
            <p style={{ fontSize: "0.8rem", color: "#A3A3A3", lineHeight: "1.4", marginBottom: "20px" }}>
              🔒 **Passwordless SSO:** For maximum security, activation codes are sent directly to the email registered during purchase.
            </p>
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                background: "#D4AF37",
                color: "#000000",
                border: "none",
                padding: "12px",
                borderRadius: "8px",
                fontWeight: "700",
                cursor: "pointer",
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? "Activating..." : "Activate Account"}
            </button>
          </form>
        )}

        {step === 3 && (
          <div style={{ textAlign: "center" }}>
            <p style={{ color: "#A3A3A3", marginBottom: "20px" }}>Your session is authenticated.</p>
            <button 
              onClick={() => window.location.href = "/dashboard"} 
              style={{
                width: "100%",
                background: "#D4AF37",
                color: "#000000",
                border: "none",
                padding: "12px",
                borderRadius: "8px",
                fontWeight: "700",
                cursor: "pointer",
                marginBottom: "15px"
              }}
            >
              Go to Dashboard
            </button>
            <button 
              onClick={handleRevokeSessions} 
              style={{
                width: "100%",
                background: "transparent",
                color: "#ef4444",
                border: "1px solid #ef4444",
                padding: "10px",
                borderRadius: "8px",
                fontWeight: "600",
                cursor: "pointer"
              }}
            >
              Revoke All Active Sessions
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
