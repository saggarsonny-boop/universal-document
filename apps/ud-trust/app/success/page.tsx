"use client";
import React, { useState, useEffect } from "react";

export default function SuccessPage() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState(1); // 1 = enter email, 2 = enter code
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [activeToken, setActiveToken] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem("hive_session_token");
    if (token) {
      setActiveToken(token);
    }
  }, []);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setStep(2);
        setMessage("Verification code sent to your email!");
      } else {
        setError(data.error || "Failed to send code.");
      }
    } catch (err) {
      setError("Network error. Try again.");
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
      const res = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem("hive_session_token", data.token);
        localStorage.setItem("hive_user_email", email.toLowerCase());
        setActiveToken(data.token);
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
    localStorage.removeItem("hive_user_email");
    setActiveToken(null);
    setStep(1);
    setMessage("All sessions revoked successfully. Please sign in again.");
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
          <p style={{ fontSize: "0.9rem", color: "#A3A3A3", marginTop: "8px", lineHeight: "1.4" }}>
            Stripe payment received! Access is now ready to deploy.
          </p>
        </div>

        {error && <div style={{ color: "#ef4444", marginBottom: "15px", textAlign: "center", fontSize: "0.9rem" }}>{error}</div>}
        {message && <div style={{ color: "#D4AF37", marginBottom: "15px", textAlign: "center", fontSize: "0.9rem" }}>{message}</div>}

        {activeToken ? (
          <div style={{ textAlign: "center" }}>
            <p style={{ color: "#A3A3A3", marginBottom: "20px" }}>You have an active premium session.</p>
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
        ) : (
          <>
            {step === 1 ? (
              <form onSubmit={handleSendCode}>
                <div style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", fontSize: "0.85rem", color: "#A3A3A3", marginBottom: "8px" }}>
                    Account Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter the email used for purchase"
                    style={{
                      width: "100%",
                      padding: "12px",
                      background: "#161A21",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      borderRadius: "8px",
                      color: "#FFFFFF",
                      fontSize: "0.95rem",
                      boxSizing: "border-box"
                    }}
                  />
                </div>
                <p style={{ fontSize: "0.8rem", color: "#A3A3A3", lineHeight: "1.4", marginBottom: "20px" }}>
                  🔒 **Passwordless SSO:** We do not use passwords. A one-time activation code will be delivered directly to your email inbox.
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
                  {loading ? "Requesting Code..." : "Send Activation Code"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyCode}>
                <div style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", fontSize: "0.85rem", color: "#A3A3A3", marginBottom: "8px" }}>
                    Enter 6-Digit Activation Code
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
                  {loading ? "Verifying..." : "Activate Account"}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
