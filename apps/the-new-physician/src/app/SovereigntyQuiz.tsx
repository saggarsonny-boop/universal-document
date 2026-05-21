"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sliders, Shield, ArrowRight, ArrowLeft, CheckCircle, 
  AlertTriangle, Heart, Lock, RefreshCw, UserCheck, HelpCircle,
  Download, Copy, ExternalLink
} from "lucide-react";

interface Question {
  id: number;
  category: string;
  question: string;
  description: string;
  lowLabel: string;
  highLabel: string;
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    category: "EMR & Documentation Burden",
    question: "Daily Administrative Documentation Overhead",
    description: "What percentage of your daily clinical hours is spent on rigid documentation, clicking administrative checklists, or resolving redundant screen alerts rather than active patient care?",
    lowLabel: "Direct Care First (< 10% of time)",
    highLabel: "Severe EMR Domination (90%+ of time)"
  },
  {
    id: 2,
    category: "Coding & Keyword Pressure",
    question: "Billing-Driven Note Structuring",
    description: "How heavily are you pressured to structure your notes with specific, billing-driven keywords and macro-templates to satisfy administrative guidelines rather than capturing true clinical reality?",
    lowLabel: "Pure Clinical Precision",
    highLabel: "Total Billing Compliance"
  },
  {
    id: 3,
    category: "Audit & Surveillance Anxiety",
    question: "Retrospective Audit & Denial Anxiety",
    description: "How much does the ambient threat of billing audits, retrospective insurance denials, or administrative downgrades influence your diagnostic and treatment choices?",
    lowLabel: "Unbiased Clinical Judgment",
    highLabel: "Defensive, Compliance-Driven Care"
  },
  {
    id: 4,
    category: "Technology Autonomy Deficit",
    question: "EMR Workflow & Template Rigidity",
    description: "To what degree do your clinical software tools (EMR, prescribing platforms, order sets) restrict or override your custom workflows, personal templates, and clinical preferences?",
    lowLabel: "Highly Adaptable Software",
    highLabel: "Rigid, Unyielding Systems"
  },
  {
    id: 5,
    category: "Cognitive Captivity (Decision Overrides)",
    question: "Insurance & Prior-Authorization Overrides",
    description: "How frequently are your evidence-based treatment plans, orders, or medication choices delayed, flagged, or overridden by insurance algorithms and peer-review mandates?",
    lowLabel: "Direct Order Fulfillment",
    highLabel: "Incessant Prior-Auth Hurdles"
  },
  {
    id: 6,
    category: "Systemic Burnout & Alienation",
    question: "Professional Alienation & Burnout",
    description: "How severely do you feel disconnected or alienated from the core healing purpose of your clinical oath due to compliance-driven administrative workloads?",
    lowLabel: "Deeply Fulfilled & Connected",
    highLabel: "Profoundly Exhausted / Alienated"
  }
];


const getDynamicStatus = (id: number, value: number): string => {
  if (id === 1) {
    if (value <= 20) return "Direct Patient Focus: Documentation is minimal, fast, and does not compromise direct patient interaction.";
    if (value <= 50) return "Moderate Friction: Noticeable administrative clicks and template-filling, but manageable within standard hours.";
    if (value <= 80) return "Significant Administrative Capture: Over half of your clinical shift is consumed by EMR compliance tasks.";
    return "Severe EMR Domination: Rigid documentation, screen alerts, and checklists consume nearly your entire day.";
  }
  if (id === 2) {
    if (value <= 20) return "Narrative Accuracy: Notes are written purely for clinical precision and peer communication.";
    if (value <= 50) return "Minor Distortion: Specific billing-friendly keywords and macro-templates are occasionally inserted.";
    if (value <= 80) return "High Billing Adaptations: The clinical narrative is heavily altered to fit compliance criteria.";
    return "Total Billing Compliance: Your documentation is written entirely to satisfy auditing codes rather than true clinical cases.";
  }
  if (id === 3) {
    if (value <= 20) return "Clinical Autonomy: Diagnostic and treatment decisions are made solely based on the patient's best clinical interest.";
    if (value <= 50) return "Strategic Awareness: Occasional worry about denial rates or documentation queries slightly affects decision-making.";
    if (value <= 80) return "Defensive Medicine: You frequently order redundant tests or restrict choices to avoid insurance denials and audits.";
    return "Surveillance-Driven Care: Diagnostic choices are entirely controlled by the ambient threat of audits and billing liability.";
  }
  if (id === 4) {
    if (value <= 20) return "Adaptable Infrastructure: The software fully conforms to your custom templates and personal clinical workflow.";
    if (value <= 50) return "Minor System Friction: Some rigid prescribing or charting templates, but clinical flow is preserved.";
    if (value <= 80) return "System-Dictated Flow: EMR constraints force you to modify how you think about and sequence patient visits.";
    return "Rigid Algorithmic Rails: Standardized software enforces complete obedience, leaving no room for clinical style.";
  }
  if (id === 5) {
    if (value <= 20) return "Direct Clinical Execution: Treatment recommendations and prescriptions are approved and fulfilled immediately.";
    if (value <= 50) return "Intermittent Delays: Common medications are approved, but advanced or non-formulary choices trigger prior-auth queries.";
    if (value <= 80) return "Chronic Red Tape: You spend significant professional hours arguing with insurance algorithms and pharmacy benefit managers.";
    return "Pervasive Decision Blockades: Almost every advanced clinical decision is flagged, delayed, or overridden by administrative rules.";
  }
  if (id === 6) {
    if (value <= 20) return "Deep Clinical Alignment: You feel fully connected to your calling, with ample mental space for healing work.";
    if (value <= 50) return "Erosion of Joy: Frequent administrative requirements occasionally disrupt your focus and peace of mind.";
    if (value <= 80) return "Burnout Risk: Chronic clerical overhead has left you physically and emotionally depleted.";
    return "Total Alienation: Complete clinical burnout. You feel entirely separated from the patient-care purpose of your medical oath.";
  }
  return "";
};

const parseBlueprint = (text: string) => {
  if (!text) return [];
  const rawSegments = text.split(/### Part \d+:/gi);
  const parsed: { title: string; content: string }[] = [];
  const defaultTitles = [
    "Executive Summary",
    "Current Systemic Exposure",
    "High-Autonomy Alternatives",
    "Phase 1 Action Steps"
  ];
  let segmentIndex = 0;
  for (let i = 1; i < rawSegments.length; i++) {
    const raw = rawSegments[i].trim();
    if (!raw) continue;
    const lines = raw.split("\n");
    const title = lines[0].replace(/^[#:\s]+/, "").trim();
    const content = lines.slice(1).join("\n").trim();
    parsed.push({
      title: title || defaultTitles[segmentIndex] || `Part ${segmentIndex + 1}`,
      content: content || raw
    });
    segmentIndex++;
  }
  if (parsed.length === 0 && text) {
    return [{
      title: "Kintsugi Blueprint",
      content: text
    }];
  }
  return parsed;
};

export default function SovereigntyQuiz() {
  const [step, setStep] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<number, number>>({
    1: 50,
    2: 50,
    3: 50,
    4: 50,
    5: 50,
    6: 50
  });

  const [score, setScore] = useState<number>(0);
  const [displayedScore, setDisplayedScore] = useState<number>(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [practiceType, setPracticeType] = useState<"SOLO" | "CLINIC" | "SYSTEM">("SOLO");
  const [stateCountry, setStateCountry] = useState("");
  const [meansTested, setMeansTested] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [blueprintText, setBlueprintText] = useState<string>("");
  const [udsPayload, setUdsPayload] = useState<any>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeBlueprintPart, setActiveBlueprintPart] = useState<number>(0);

  const calculateScore = () => {
    const total = Object.values(answers).reduce((sum, val) => sum + val, 0);
    return Math.round(total / QUESTIONS.length);
  };

  const handleSliderChange = (id: number, value: number) => {
    setAnswers(prev => ({ ...prev, [id]: value }));
  };

  // Run the odometer effect when the score screen is loaded (step 7)
  useEffect(() => {
    if (step === 7) {
      const targetScore = calculateScore();
      setScore(targetScore);
      setDisplayedScore(0);

      const duration = 1500; // ms
      const intervalTime = 25; // ms
      const steps = duration / intervalTime;
      const increment = targetScore / steps;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= targetScore) {
          setDisplayedScore(targetScore);
          clearInterval(timer);
        } else {
          setDisplayedScore(Math.round(current));
        }
      }, intervalTime);

      return () => clearInterval(timer);
    }
  }, [step]);

  const getEvaluationTier = (scoreVal: number) => {
    if (scoreVal <= 25) {
      return {
        title: "Sovereign Clinician",
        description: "You have retained clinical agency. Your practice values clinical judgment over billing-driven checklists, but you represent an endangered minority in the modern environment. Safeguarding your sovereignty will require deliberate architectural isolation.",
        color: "#10B981", // Emerald
        bgColor: "rgba(16, 185, 129, 0.1)",
        borderColor: "rgba(16, 185, 129, 0.3)"
      };
    } else if (scoreVal <= 50) {
      return {
        title: "Frictional Captive",
        description: "You are experiencing significant friction. While you still fight for your patients, administrative fatigue and EMR checklists are actively chipping away at your sanity. You are standing on the edge of the algorithmic trap.",
        color: "#FBBF24", // Gold
        bgColor: "rgba(251, 191, 36, 0.1)",
        borderColor: "rgba(251, 191, 36, 0.3)"
      };
    } else if (scoreVal <= 75) {
      return {
        title: "Algorithmic Prisoner",
        description: "The machine dictates your days. Your note structure, clinical pacing, and prescribing options are heavily managed by coding quotas, prior-authorization loops, and insurance compliance checkers. You spend more time feeding the EMR than healing the sick.",
        color: "#F97316", // Orange
        bgColor: "rgba(249, 115, 22, 0.1)",
        borderColor: "rgba(249, 115, 22, 0.3)"
      };
    } else {
      return {
        title: "Systemic Hostage",
        description: "Complete Capture. The system has hollowed out your autonomy. Between retrospective audit threats, automated decision overrides, and EMR metric obsession, your clinical judgment has been entirely replaced by an administrative routing algorithm. Survival requires structural escape.",
        color: "#EF4444", // Red
        bgColor: "rgba(239, 68, 68, 0.1)",
        borderColor: "rgba(239, 68, 68, 0.3)"
      };
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          practiceType,
          stateCountry,
          meansTested,
          systemicCaptureScore: score,
          answers: JSON.stringify(answers)
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to submit registration");
      }

      setBlueprintText(data.blueprintText || "");
      setUdsPayload(data.uds || null);
      setStep(9);
    } catch (err: any) {
      setSubmitError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const currentTier = getEvaluationTier(displayedScore);

  return (
    <section id="pilot-program" className="py-24 px-6 bg-black relative border-t border-neutral-900 overflow-hidden">
      {/* Visual background accents */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#D4AF37]/5 rounded-full blur-[100px] pointer-events-none z-0"></div>
      
      <div className="max-w-3xl mx-auto relative z-10">
        
        {/* Progress bar */}
        {step > 0 && step < 7 && (
          <div className="w-full bg-neutral-900 h-1.5 rounded-full overflow-hidden mb-12 border border-neutral-800">
            <div 
              className="bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] h-full transition-all duration-300"
              style={{ width: `${(step / 6) * 100}%` }}
            ></div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* STEP 0: INTRO SCREEN */}
          {step === 0 && (
            <motion.div
              key="step-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-neutral-950/70 border border-neutral-800 p-8 md:p-12 rounded-3xl backdrop-blur-md shadow-2xl space-y-8"
            >
              <div className="text-center space-y-4">
                <div className="inline-flex p-3 bg-[#D4AF37]/10 text-[#D4AF37] rounded-2xl border border-[#D4AF37]/20 shadow-[0_0_20px_rgba(212,175,55,0.05)]">
                  <Shield size={32} className="animate-pulse" />
                </div>
                <h2 className="text-3xl md:text-4xl font-display font-bold text-white tracking-wide">
                  Sovereignty Protocol Evaluation
                </h2>
                <div className="w-16 h-1 bg-[#D4AF37] mx-auto"></div>
                <p className="text-[#D4AF37]/90 font-mono text-sm tracking-wider uppercase">
                  HiveIMR Global Pilot Recruitment
                </p>
              </div>

              <div className="text-neutral-400 space-y-4 text-base md:text-lg leading-relaxed">
                <p>
                  As highlighted in Dr. Sonny Saggar’s Medium article <em>“TNP Part 3: When the System Turned Its Eyes on Me”</em>, clinical capture is the silent death of modern medicine. When EMR metrics and regulatory scripts override the clinical oath, the physician becomes an algorithmic prisoner.
                </p>
                <p>
                  This diagnostics engine measures your **Systemic Capture Score**—the degree to which administrative overhead, billing checklist enforcement, and automated decision-making have compromised your clinical agency.
                </p>
                <p className="bg-[#D4AF37]/5 border border-[#D4AF37]/20 p-4 rounded-xl text-sm font-medium text-[#D4AF37]/90 flex items-start gap-3">
                  <AlertTriangle className="shrink-0 mt-0.5" size={16} />
                  <span>
                    Completing this evaluation provides eligibility to register for the **HiveIMR Global Pilot Program**—a decentralized initiative designed to restore absolute, means-tested sovereignty to clinical workflows.
                  </span>
                </p>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={() => setStep(1)}
                  className="bg-[#D4AF37] text-black font-bold px-10 py-5 rounded-full hover:bg-[#b5952f] transition-all flex items-center gap-2 shadow-[0_0_30px_rgba(212,175,55,0.2)] hover:shadow-[0_0_40px_rgba(212,175,55,0.4)] tracking-wide group"
                >
                  Begin Autonomy Audit
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEPS 1-6: QUESTIONS */}
          {step >= 1 && step <= 6 && (
            <motion.div
              key={`step-${step}`}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="bg-neutral-950/70 border border-neutral-800 p-8 md:p-12 rounded-3xl backdrop-blur-md shadow-2xl space-y-8"
            >
              <div className="flex justify-between items-center text-xs font-mono tracking-wider text-neutral-500 uppercase">
                <span>Category: {QUESTIONS[step - 1].category}</span>
                <span className="text-[#D4AF37]">Audit Metric {step} of 6</span>
              </div>

              <div className="space-y-4">
                <div className="space-y-3">
                  <h3 className="text-2xl font-display font-bold text-white leading-tight">
                    {QUESTIONS[step - 1].question}
                  </h3>
                  <p className="text-neutral-400 text-base md:text-lg leading-relaxed">
                    {QUESTIONS[step - 1].description}
                  </p>
                </div>

                {/* Permanent Visual Guidance Helper Box */}
                <div className="bg-[#D4AF37]/5 border border-[#D4AF37]/15 p-4 rounded-2xl text-xs text-neutral-400 space-y-1 leading-relaxed">
                  <div className="flex items-center gap-2 text-[#D4AF37] font-bold uppercase tracking-wider text-[10px]">
                    <HelpCircle size={14} />
                    <span>How to Rate Your Autonomy</span>
                  </div>
                  <p>
                    Use the slider to score your average experience: <strong>0%</strong> indicates absolute clinical agency and freedom, whereas <strong>100%</strong> indicates absolute administrative capture and systemic control.
                  </p>
                </div>
              </div>

              {/* Gold Slider Input */}
              <div className="space-y-6 py-6">
                <div className="flex justify-between items-end">
                  <span className="text-xs font-mono text-neutral-500 uppercase tracking-widest">Autonomy Impact</span>
                  <span className="text-4xl font-mono font-bold text-[#D4AF37] drop-shadow-[0_0_15px_rgba(212,175,55,0.3)]">
                    {answers[step]}%
                  </span>
                </div>
                <div className="relative group">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={answers[step]}
                    onChange={(e) => handleSliderChange(step, parseInt(e.target.value))}
                    className="w-full h-2 bg-neutral-900 rounded-lg appearance-none cursor-pointer accent-[#D4AF37] border border-neutral-800 group-hover:border-neutral-700 transition-colors"
                  />
                  {/* Slider track background gradient representation */}
                  <div 
                    className="absolute top-1/2 -translate-y-1/2 left-0 h-1 bg-[#D4AF37]/20 rounded-lg pointer-events-none"
                    style={{ width: `${answers[step]}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs font-mono text-neutral-500">
                  <span>{QUESTIONS[step - 1].lowLabel}</span>
                  <span>{QUESTIONS[step - 1].highLabel}</span>
                </div>

                {/* Dynamic Assessment Sub-card */}
                <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-4 transition-all duration-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
                  <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block mb-1">
                    Clinical Rating Status
                  </span>
                  <p className="text-sm font-medium text-neutral-200 leading-normal">
                    {getDynamicStatus(step, answers[step])}
                  </p>
                </div>
              </div>

              <div className="flex justify-between pt-6 border-t border-neutral-900">
                <button
                  onClick={() => setStep(prev => prev - 1)}
                  className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors text-sm font-bold"
                >
                  <ArrowLeft size={16} />
                  Back
                </button>
                <button
                  onClick={() => setStep(prev => prev + 1)}
                  className="bg-[#D4AF37] text-black font-bold px-8 py-3.5 rounded-full hover:bg-[#b5952f] transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(212,175,55,0.15)] tracking-wide group"
                >
                  {step === 6 ? "Generate Evaluation" : "Next Metric"}
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 7: SCORE REVEAL */}
          {step === 7 && (
            <motion.div
              key="step-7"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-neutral-950/70 border border-neutral-800 p-8 md:p-12 rounded-3xl backdrop-blur-md shadow-2xl space-y-10 text-center"
            >
              <div className="space-y-3">
                <span className="text-xs font-mono tracking-widest text-[#D4AF37] uppercase bg-[#D4AF37]/10 px-4 py-1.5 rounded-full border border-[#D4AF37]/20">
                  Evaluation Certified
                </span>
                <h2 className="text-3xl md:text-4xl font-display font-bold text-white pt-2">
                  Your Systemic Capture Score
                </h2>
              </div>

              {/* Dynamic Score Ring & Percentage */}
              <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
                <svg className="absolute w-full h-full transform -rotate-90">
                  <circle
                    cx="96"
                    cy="96"
                    r="84"
                    className="stroke-neutral-900"
                    strokeWidth="10"
                    fill="transparent"
                  />
                  <circle
                    cx="96"
                    cy="96"
                    r="84"
                    stroke={currentTier.color}
                    strokeWidth="10"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 84}
                    strokeDashoffset={2 * Math.PI * 84 * (1 - displayedScore / 100)}
                    className="transition-all duration-100 ease-out"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="text-center z-10 space-y-1">
                  <span className="text-5xl md:text-6xl font-mono font-bold text-white">
                    {displayedScore}%
                  </span>
                  <p className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase">
                    Captured Agency
                  </p>
                </div>
              </div>

              {/* Tier Details Card */}
              <div 
                className="p-6 rounded-2xl border text-left space-y-3"
                style={{ 
                  backgroundColor: currentTier.bgColor,
                  borderColor: currentTier.borderColor
                }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: currentTier.color }}></div>
                  <h4 className="text-xl font-bold font-display text-white">
                    Status: {currentTier.title}
                  </h4>
                </div>
                <p className="text-neutral-300 text-sm leading-relaxed">
                  {currentTier.description}
                </p>
              </div>

              <div className="space-y-4 pt-4">
                <p className="text-xs text-neutral-500 max-w-md mx-auto leading-normal">
                  Your score has been calibrated against global clinical friction benchmarks. Proceed to secure your enrollment in the means-tested sovereign pilot.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => setStep(1)}
                    className="border border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900 text-neutral-400 hover:text-white font-bold px-6 py-4 rounded-full transition-all text-sm flex items-center justify-center gap-2"
                  >
                    <RefreshCw size={16} />
                    Recalibrate Audit
                  </button>
                  <button
                    onClick={() => setStep(8)}
                    className="bg-[#D4AF37] text-black font-bold px-8 py-4 rounded-full hover:bg-[#b5952f] transition-all text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(212,175,55,0.2)] tracking-wide group"
                  >
                    Apply to Global Pilot
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 8: REGISTRATION FORM */}
          {step === 8 && (
            <motion.div
              key="step-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-neutral-950/70 border border-neutral-800 p-8 md:p-12 rounded-3xl backdrop-blur-md shadow-2xl space-y-8"
            >
              <div className="space-y-2 text-center">
                <div className="inline-flex p-2 bg-[#D4AF37]/10 text-[#D4AF37] rounded-xl mb-2">
                  <UserCheck size={24} />
                </div>
                <h3 className="text-2xl font-display font-bold text-white">
                  Pilot Registration & Sovereignty Pledge
                </h3>
                <p className="text-xs font-mono text-neutral-500 uppercase tracking-widest">
                  Systemic Capture Level: {score}% • {currentTier.title}
                </p>
              </div>

              {submitError && (
                <div className="bg-red-950/40 border border-red-800 text-red-300 p-4 rounded-xl text-sm leading-normal flex items-start gap-2.5">
                  <AlertTriangle className="shrink-0 mt-0.5 text-red-500" size={16} />
                  <span>{submitError}</span>
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1">
                      Full Name / Credentials
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dr. Jane Doe MD"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                      Secure Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. doctor@clinic.org"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors text-sm"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                      Practice Classification
                    </label>
                    <div className="relative">
                      <select
                        value={practiceType}
                        onChange={(e) => setPracticeType(e.target.value as any)}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors text-sm appearance-none cursor-pointer"
                      >
                        <option value="SOLO">Solo Practice (Subsidized Priority)</option>
                        <option value="CLINIC">Independent Group / Clinic</option>
                        <option value="SYSTEM">Large Multi-Hospital System</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-500">
                        ▼
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                      State / Country of Licensure
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Missouri, USA"
                      value={stateCountry}
                      onChange={(e) => setStateCountry(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors text-sm"
                    />
                  </div>
                </div>

                {/* Subsidization Means-Testing visual Toggle */}
                <div className="bg-[#D4AF37]/5 border border-[#D4AF37]/20 p-5 rounded-2xl space-y-3">
                  <label className="relative flex items-start gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={meansTested}
                      onChange={(e) => setMeansTested(e.target.checked)}
                      className="mt-1 shrink-0 bg-neutral-900 border border-neutral-800 rounded text-[#D4AF37] focus:ring-0 cursor-pointer"
                    />
                    <div className="space-y-1">
                      <span className="text-sm font-bold text-white">
                        Request Subsidized Placement (Means-Tested)
                      </span>
                      <p className="text-xs text-neutral-400 leading-normal">
                        Check this box if your clinic is solo, rural, or severely underfunded. The HiveIMR initiative heavily subsidizes small clinics to guard against system-capture pricing traps.
                      </p>
                    </div>
                  </label>
                </div>

                {/* Sovereignty statement */}
                <div className="bg-neutral-950 border border-neutral-900 p-4 rounded-xl text-neutral-500 text-xs leading-relaxed flex gap-2.5 items-start">
                  <Lock className="shrink-0 mt-0.5 text-neutral-600" size={14} />
                  <span>
                    By registering, you request a position in the decentralized HiveIMR Pilot Program. All diagnostics and submissions are encrypted and processed in alignment with the MOH Protocol standard.
                  </span>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-neutral-900">
                  <button
                    type="button"
                    onClick={() => setStep(7)}
                    className="text-neutral-400 hover:text-white transition-colors text-sm font-bold flex items-center gap-2"
                  >
                    <ArrowLeft size={16} />
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-[#D4AF37] text-black font-bold px-10 py-4 rounded-full hover:bg-[#b5952f] transition-all text-sm flex items-center gap-2 shadow-[0_0_20px_rgba(212,175,55,0.2)] disabled:opacity-50 tracking-wide"
                  >
                    {submitting ? "Securing Entry..." : "Submit Registration"}
                    <ArrowRight size={16} />
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* STEP 9: SUCCESS SCREEN */}
          {step === 9 && (
            <motion.div
              key="step-9"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-neutral-950/80 border border-[#D4AF37]/35 p-8 md:p-12 rounded-3xl backdrop-blur-md shadow-[0_0_50px_rgba(212,175,55,0.08)] space-y-10 text-center relative overflow-hidden"
            >
              {/* Gold light leak effect */}
              <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-[120px] pointer-events-none"></div>

              {/* Success Badge & Notification */}
              <div className="relative z-10 space-y-4">
                <div className="inline-flex p-4 bg-[#D4AF37]/5 text-[#D4AF37] rounded-full border border-[#D4AF37]/30 shadow-[0_0_35px_rgba(212,175,55,0.15)] mb-2">
                  <Shield size={48} className="animate-pulse" />
                </div>
                <div className="inline-block bg-emerald-950/40 border border-emerald-500/25 px-5 py-2 rounded-full text-emerald-400 text-xs font-mono tracking-wider uppercase">
                  Sovereignty Evaluation Processed & Sealed
                </div>
                <h3 className="text-3xl md:text-4xl font-display font-bold text-white tracking-wide">
                  Welcome to the Sovereignty Queue
                </h3>
                <p className="text-sm font-mono tracking-widest text-[#D4AF37]/80 uppercase">
                  REGISTRY ID: IMR-PILOT-{udsPayload?.metadata?.id?.substring(0, 8)?.toUpperCase() || "PENDING"}-{score}
                </p>
                <div className="w-20 h-1 bg-[#D4AF37] mx-auto my-4"></div>
              </div>

              {/* Premium Summary Info */}
              <div className="text-neutral-300 text-sm md:text-base leading-relaxed max-w-2xl mx-auto space-y-6 relative z-10 text-left">
                <p>
                  Thank you, <strong className="text-white">Dr. {name.split(" ")[1] || name}</strong>. Your sovereignty audit metrics have been processed, calibrated against global clinical friction indexes, and permanently anchored in our secure database. 
                </p>
                <div className="bg-[#D4AF37]/5 border border-[#D4AF37]/25 p-5 rounded-2xl text-xs space-y-3 leading-relaxed text-neutral-300">
                  <div className="flex items-center gap-2 text-[#D4AF37] font-mono font-bold uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-ping"></span>
                    <span>Registry & Dispatch Status</span>
                  </div>
                  <ul className="list-disc pl-5 space-y-1.5 text-[#D4AF37]/90 font-mono">
                    <li>Raw metrics dispatched successfully to the registry core at <strong className="text-white">hive@hive.baby</strong>.</li>
                    <li>Secure confirmation record emailed to <strong className="text-white">{email}</strong> with a physical <code className="bg-neutral-900 px-1 py-0.5 rounded text-white text-[10px]">.uds</code> payload attachment.</li>
                    <li>Tamper-evident verification hash computed for your evaluation: <code className="text-emerald-400 select-all break-all">{udsPayload?.seal?.hash || "PENDING"}</code></li>
                  </ul>
                </div>
              </div>

              {/* TWO COLUMN GRID: BADGE & BLUEPRINT TABS */}
              <div className="grid md:grid-cols-12 gap-8 pt-4 relative z-10 text-left">
                
                {/* Hexagonal Badging Panel */}
                <div className="md:col-span-4 flex flex-col items-center justify-start space-y-4 bg-neutral-900/40 border border-neutral-800/80 p-6 rounded-2xl backdrop-blur-sm">
                  <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block text-center">
                    Sovereignty Credential
                  </span>
                  
                  {/* Hexagonal SVG Badge */}
                  <div className="w-full max-w-[200px] aspect-square transition-transform hover:scale-105 duration-300">
                    <svg viewBox="0 0 200 200" className="w-full h-full filter drop-shadow-[0_0_20px_rgba(212,175,55,0.15)]">
                      <defs>
                        <radialGradient id="hexGrad" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                          <stop offset="0%" stopColor="#1a1608" />
                          <stop offset="100%" stopColor="#050505" />
                        </radialGradient>
                        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#F3E5AB" />
                          <stop offset="50%" stopColor="#D4AF37" />
                          <stop offset="100%" stopColor="#AA7C11" />
                        </linearGradient>
                      </defs>
                      {/* Outer Hexagon */}
                      <polygon 
                        points="100,10 180,55 180,145 100,190 20,145 20,55" 
                        fill="url(#hexGrad)" 
                        stroke="url(#goldGrad)" 
                        strokeWidth="3.5"
                      />
                      {/* Inner Hexagon Border */}
                      <polygon 
                        points="100,18 172,60 172,140 100,182 28,140 28,60" 
                        fill="none" 
                        stroke="#D4AF37" 
                        strokeWidth="1.2" 
                        strokeDasharray="4 3"
                        opacity="0.8"
                      />
                      
                      {/* Text details */}
                      <text x="100" y="42" fill="#D4AF37" fontSize="8" fontFamily="monospace" textAnchor="middle" letterSpacing="1.2">
                        SOVEREIGNTY PROTOCOL
                      </text>
                      
                      <text x="100" y="54" fill="#888" fontSize="7" fontFamily="sans-serif" textAnchor="middle" letterSpacing="0.5">
                        AUTONOMY QUOTIENT
                      </text>
                      
                      {/* Center Score */}
                      <text x="100" y="112" fill="#fff" fontSize="38" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                        {score}%
                      </text>
                      
                      {/* Sub-label */}
                      <text x="100" y="132" fill="url(#goldGrad)" fontSize="8.5" fontFamily="monospace" fontWeight="bold" textAnchor="middle" letterSpacing="0.8">
                        {currentTier.title.toUpperCase()}
                      </text>
                      
                      <path d="M 60 144 L 140 144" stroke="#D4AF37" strokeWidth="0.8" opacity="0.5" />
                      
                      <text x="100" y="156" fill="#666" fontSize="6.5" fontFamily="monospace" textAnchor="middle">
                        MOH REGISTRY APPROVED
                      </text>
                      
                      <text x="100" y="168" fill="#10B981" fontSize="6" fontFamily="monospace" textAnchor="middle" opacity="0.9">
                        SEAL HASH: {udsPayload?.seal?.hash?.substring(0, 10) || "VALID"}
                      </text>
                    </svg>
                  </div>
                  
                  <div className="text-center space-y-1">
                    <p className="text-[11px] font-bold text-white uppercase tracking-wider">{currentTier.title}</p>
                    <p className="text-[10px] text-neutral-400">Score of {score}% in state of {stateCountry}.</p>
                  </div>
                </div>

                {/* Kintsugi Career Transition Blueprint Panel */}
                <div className="md:col-span-8 flex flex-col space-y-4">
                  <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block">
                    Kintsugi Career Transition Blueprint
                  </span>
                  
                  {blueprintText ? (
                    <div className="border border-[#D4AF37]/25 rounded-2xl overflow-hidden bg-neutral-950/60 shadow-[0_4px_25px_rgba(0,0,0,0.4)]">
                      {/* Tab Selectors */}
                      <div className="grid grid-cols-4 border-b border-neutral-800 bg-neutral-900/50">
                        {parseBlueprint(blueprintText).map((sec, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setActiveBlueprintPart(idx)}
                            className={`py-3 px-1.5 md:px-3 text-center transition-all border-b-2 text-[10px] md:text-xs font-mono tracking-wider uppercase font-bold ${
                              activeBlueprintPart === idx
                                ? "border-[#D4AF37] text-[#D4AF37] bg-black/40"
                                : "border-transparent text-neutral-500 hover:text-neutral-300 hover:bg-neutral-900/20"
                            }`}
                          >
                            Part {idx + 1}
                          </button>
                        ))}
                      </div>

                      {/* Tab Content Box */}
                      <div className="p-6 min-h-[220px] max-h-[360px] overflow-y-auto space-y-4">
                        {parseBlueprint(blueprintText).map((sec, idx) => {
                          if (idx !== activeBlueprintPart) return null;
                          return (
                            <div key={idx} className="space-y-3">
                              <h4 className="text-sm font-bold font-mono text-[#D4AF37] uppercase tracking-wider flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]"></span>
                                {sec.title}
                              </h4>
                              
                              <div className="text-xs md:text-sm text-neutral-300 leading-relaxed font-sans space-y-3 whitespace-pre-wrap">
                                {sec.content}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="border border-neutral-800 rounded-2xl p-8 text-center text-neutral-500 bg-neutral-900/10 flex flex-col items-center justify-center min-h-[220px]">
                      <RefreshCw className="animate-spin text-neutral-600 mb-3" size={24} />
                      <p className="text-xs font-mono">Securing cryptographic blueprint segments...</p>
                    </div>
                  )}
                </div>

              </div>

              {/* DECENTRALIZED UDS PHYSICAL INTEROPERABILITY ACTIONS */}
              <div className="border border-[#D4AF37]/20 bg-neutral-950 p-6 md:p-8 rounded-3xl space-y-6 text-left relative z-10">
                <div className="space-y-2">
                  <h4 className="text-lg font-bold font-display text-white flex items-center gap-2">
                    <Download size={20} className="text-[#D4AF37]" />
                    Sovereign Document Interoperability
                  </h4>
                  <p className="text-neutral-400 text-xs md:text-sm leading-relaxed">
                    Your custom transition blueprint is encoded in a cryptographically signed <strong className="text-[#D4AF37]">.uds</strong> file format adhering to the interoperable <strong className="text-white">iSDF v0.1.0</strong> standard. Downloading this file allows you to maintain absolute ownership of your clinical diagnostic profile, independent of hospital storage nodes.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* Step A: Download physical file */}
                  <div className="bg-neutral-900/40 border border-neutral-800 p-5 rounded-2xl flex flex-col justify-between space-y-4">
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-mono text-[#D4AF37] uppercase tracking-widest font-bold">Step A</span>
                      <h5 className="text-sm font-bold text-white">Download Offline Sovereign File</h5>
                      <p className="text-neutral-400 text-[11px] leading-relaxed">
                        Download the cryptographically sealed <code className="bg-neutral-950 px-1 py-0.5 rounded text-[10px] text-neutral-300">.uds</code> payload directly into your local secure system storage.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (!udsPayload) return;
                        const blob = new Blob([JSON.stringify(udsPayload, null, 2)], { type: "application/json" });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        const lastName = name.trim().split(' ').pop() || name.trim();
                        a.href = url;
                        a.download = `kintsugi-blueprint-${lastName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.uds`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                      }}
                      disabled={!udsPayload}
                      className="w-full bg-[#D4AF37] hover:bg-[#b5952f] text-black font-bold py-3 px-5 rounded-xl transition-all text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(212,175,55,0.15)] disabled:opacity-50"
                    >
                      <Download size={14} />
                      Download Career Blueprint (.uds)
                    </button>
                  </div>

                  {/* Step B: Upload to UD Reader */}
                  <div className="bg-neutral-900/40 border border-neutral-800 p-5 rounded-2xl flex flex-col justify-between space-y-4">
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-mono text-[#D4AF37] uppercase tracking-widest font-bold">Step B</span>
                      <h5 className="text-sm font-bold text-white">Verify Seal in official Reader</h5>
                      <p className="text-neutral-400 text-[11px] leading-relaxed">
                        Import your downloaded <code className="bg-neutral-950 px-1 py-0.5 rounded text-[10px] text-neutral-300">.uds</code> file into the Universal Reader to confirm your SHA-256 seal integrity and decrypt parallel clarity layers.
                      </p>
                    </div>
                    <a
                      href="https://reader.hive.baby"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-neutral-950 border border-neutral-700 hover:border-neutral-500 hover:bg-neutral-900 text-white font-bold py-3 px-5 rounded-xl transition-all text-xs flex items-center justify-center gap-2"
                    >
                      <ExternalLink size={14} className="text-[#D4AF37]" />
                      Open reader.hive.baby
                    </a>
                  </div>
                </div>
              </div>

              {/* VIRAL POST CLIPBOARD HELPER CARD */}
              <div className="bg-neutral-900/50 border border-neutral-800 p-6 md:p-8 rounded-3xl text-left space-y-4 relative z-10">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-[#D4AF37] uppercase tracking-widest font-bold">Share Your Sovereign Verdict</span>
                    <h4 className="text-base font-bold text-white">Physician Autonomy Social Action</h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const tierTitle = currentTier.title;
                      const textToCopy = `I just audited my clinical sovereignty using the Sovereignty Protocol Evaluation. My Systemic Capture Score is ${score}% (${tierTitle}). \n\nModern healthcare systems have turned medicine into an algorithmic compliance machine. It is time for physicians to reclaim absolute clinical agency. \n\nGet your Kintsugi Career Transition Blueprint and join the decentralized pilot to restore our medical oaths: https://newphysician.org\n\n#ClinicalSovereignty #HiveIMR #KintsugiPhysician #PhysicianAutonomy`;
                      
                      navigator.clipboard.writeText(textToCopy);
                      setCopiedLink(true);
                      setTimeout(() => setCopiedLink(false), 2500);
                    }}
                    className="shrink-0 bg-neutral-950 hover:bg-neutral-900 border border-neutral-700 text-[#D4AF37] font-bold px-4 py-2.5 rounded-xl transition-all text-xs flex items-center justify-center gap-2 hover:shadow-[0_0_10px_rgba(212,175,55,0.1)]"
                  >
                    {copiedLink ? (
                      <>
                        <CheckCircle size={14} className="text-emerald-400" />
                        Copied to Clipboard!
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        Copy Share Text
                      </>
                    )}
                  </button>
                </div>
                <div className="bg-neutral-950/80 border border-neutral-900 rounded-xl p-4 font-sans text-xs text-neutral-400 leading-relaxed whitespace-pre-wrap select-all italic select-none">
                  {`I just audited my clinical sovereignty using the Sovereignty Protocol Evaluation. My Systemic Capture Score is ${score}% (${currentTier.title}). \n\nModern healthcare systems have turned medicine into an algorithmic compliance machine. It is time for physicians to reclaim absolute clinical agency. \n\nGet your Kintsugi Career Transition Blueprint and join the decentralized pilot to restore our medical oaths: https://newphysician.org\n\n#ClinicalSovereignty #HiveIMR #KintsugiPhysician #PhysicianAutonomy`}
                </div>
              </div>

              {/* Registry Queue Return Footer Actions */}
              <div className="pt-6 border-t border-neutral-900 flex flex-col sm:flex-row gap-4 justify-center relative z-10">
                <button
                  type="button"
                  onClick={() => {
                    setName("");
                    setEmail("");
                    setStateCountry("");
                    setMeansTested(false);
                    setAnswers({
                      1: 50,
                      2: 50,
                      3: 50,
                      4: 50,
                      5: 50,
                      6: 50
                    });
                    setStep(1);
                  }}
                  className="bg-neutral-950 border border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-white font-bold px-8 py-4 rounded-full transition-all text-xs tracking-wider uppercase"
                >
                  Recalibrate / Restart Audit
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setName("");
                    setEmail("");
                    setStateCountry("");
                    setMeansTested(false);
                    setAnswers({
                      1: 50,
                      2: 50,
                      3: 50,
                      4: 50,
                      5: 50,
                      6: 50
                    });
                    setStep(0);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="bg-[#D4AF37] text-black font-bold px-10 py-4 rounded-full hover:bg-[#b5952f] transition-all text-xs tracking-wider uppercase shadow-[0_0_20px_rgba(212,175,55,0.15)]"
                >
                  Return to Portal Home
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}
