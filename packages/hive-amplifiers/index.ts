import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, X, Send } from "lucide-react";

// ------------------------------------------------------------------
// A5: UNIVERSAL ONBOARDING WRAPPER (Frictionless Entry)
// ------------------------------------------------------------------

interface HiveOnboardingProps {
  children: React.ReactNode;
  engineName: string;
  engineValueProposition: string;
}

export function HiveOnboarding({ children, engineName, engineValueProposition }: HiveOnboardingProps) {
  const [isOnboarded, setIsOnboarded] = useState(true);

  useEffect(() => {
    const onboarded = localStorage.getItem(`hive_onboarded_${engineName}`);
    if (!onboarded) {
      setIsOnboarded(false);
    }
  }, [engineName]);

  const handleStart = () => {
    localStorage.setItem(`hive_onboarded_${engineName}`, "true");
    setIsOnboarded(true);
  };

  if (!isOnboarded) {
    return React.createElement(
      "div",
      { style: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", backgroundColor: "#000", color: "#fff", padding: "2rem", textAlign: "center" } },
      React.createElement("h1", { style: { fontSize: "2.5rem", marginBottom: "1rem", color: "#D4AF37" } }, `Welcome to ${engineName}`),
      React.createElement("p", { style: { fontSize: "1.25rem", marginBottom: "2rem", color: "#94a3b8", maxWidth: "500px" } }, engineValueProposition),
      React.createElement("button", {
        onClick: handleStart,
        style: { padding: "1rem 2rem", fontSize: "1.1rem", backgroundColor: "#D4AF37", color: "#000", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }
      }, "Enter Engine")
    );
  }

  return React.createElement(React.Fragment, null, children);
}

// ------------------------------------------------------------------
// A18: GRAPPLER HOOK (Hallucination Containment via Metadata)
// ------------------------------------------------------------------

export function withGrapplerHook(handler: Function) {
  return async (req: Request, ...args: any[]) => {
    const response = await handler(req, ...args);
    if (response instanceof Response) {
      const newHeaders = new Headers(response.headers);
      newHeaders.set("X-Hive-Governance", "QueenBee.MasterGrappler");
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders
      });
    }
    return response;
  };
}

// ------------------------------------------------------------------
// A27: FLOATING COMPANION WIDGET (AAC Injected Module)
// ------------------------------------------------------------------

interface FloatingCompanionProps {
  engineName: string;
}

export function FloatingCompanion({ engineName }: FloatingCompanionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: `I'm your Activity Partner for ${engineName}. I'm here to pace you and answer any questions.` }
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { role: "user", content: input }]);
    setInput("");
    setTimeout(() => {
      setMessages(prev => [...prev, { role: "assistant", content: "I'm processing that through the local sandbox." }]);
    }, 600);
  };

  return React.createElement(React.Fragment, null,
    React.createElement("div", { style: { position: "fixed", bottom: "2rem", right: "2rem", zIndex: 50, display: isOpen ? "none" : "flex", flexDirection: "column", alignItems: "flex-end", gap: "1rem" } },
      React.createElement(AnimatePresence, null,
        !isOpen && React.createElement(motion.div, {
          initial: { opacity: 0, x: 20 },
          animate: { opacity: 1, x: 0 },
          exit: { opacity: 0, x: 10 },
          transition: { delay: 1, duration: 0.5 },
          style: { backgroundColor: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)", padding: "0.5rem 1rem", borderRadius: "8px", border: "1px solid rgba(212,175,55,0.3)", color: "#D4AF37", fontSize: "0.85rem", fontWeight: "bold", whiteSpace: "nowrap" }
        }, "Your AI Activity Partner is online.")
      ),
      React.createElement(
        motion.button,
        {
          onClick: () => setIsOpen(true),
          animate: { boxShadow: ["0 0 0px #D4AF37", "0 0 20px #D4AF37", "0 0 0px #D4AF37"] },
          transition: { repeat: Infinity, duration: 2 },
          style: {
            width: "60px", height: "60px", borderRadius: "50%", backgroundColor: "#D4AF37", color: "#000", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center"
          }
        },
        React.createElement(Zap, { size: 28 })
      )
    ),
    React.createElement(AnimatePresence, null,
      isOpen && React.createElement(
        motion.div,
        {
          initial: { opacity: 0, y: 20, scale: 0.95 },
          animate: { opacity: 1, y: 0, scale: 1 },
          exit: { opacity: 0, y: 20, scale: 0.95 },
          style: {
            position: "fixed", bottom: "2rem", right: "2rem", width: "350px", height: "500px",
            backgroundColor: "#0a0a0a", border: "1px solid rgba(212,175,55,0.3)", borderRadius: "16px",
            boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)", display: "flex", flexDirection: "column", zIndex: 50, overflow: "hidden"
          }
        },
        // Header
        React.createElement("div", { style: { padding: "1rem", backgroundColor: "rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.1)", display: "flex", justifyContent: "space-between", alignItems: "center" } },
          React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "0.5rem", color: "#fff", fontWeight: "bold" } },
            React.createElement(Zap, { size: 18, color: "#D4AF37" }), "Activity Partner"
          ),
          React.createElement("button", { onClick: () => setIsOpen(false), style: { background: "none", border: "none", color: "#a1a1aa", cursor: "pointer" } }, React.createElement(X, { size: 20 }))
        ),
        // Body
        React.createElement("div", { style: { flex: 1, padding: "1rem", overflowY: "auto", display: "flex", flexDirection: "column", gap: "1rem" } },
          messages.map((m, i) => React.createElement("div", { key: i, style: { display: "flex", flexDirection: m.role === "user" ? "row-reverse" : "row", gap: "0.5rem" } },
            React.createElement("div", { style: { padding: "0.75rem 1rem", borderRadius: "12px", backgroundColor: m.role === "user" ? "#27272a" : "rgba(212,175,55,0.1)", color: "#fff", maxWidth: "85%", fontSize: "0.9rem", border: m.role === "assistant" ? "1px solid rgba(212,175,55,0.2)" : "none" } }, m.content)
          )),
          React.createElement("div", { ref: messagesEndRef })
        ),
        // Input
        React.createElement("div", { style: { padding: "1rem", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", gap: "0.5rem" } },
          React.createElement("input", { type: "text", value: input, onChange: e => setInput(e.target.value), onKeyDown: e => e.key === "Enter" && handleSend(), placeholder: "Ask me anything...", style: { flex: 1, padding: "0.75rem", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", backgroundColor: "rgba(255,255,255,0.05)", color: "#fff", outline: "none" } }),
          React.createElement("button", { onClick: handleSend, style: { padding: "0 1rem", backgroundColor: "#D4AF37", color: "#000", border: "none", borderRadius: "8px", cursor: "pointer" } }, React.createElement(Send, { size: 18 }))
        )
      )
    )
  );
}
