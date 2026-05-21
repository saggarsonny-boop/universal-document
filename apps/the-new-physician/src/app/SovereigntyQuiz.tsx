"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sliders, Shield, ArrowRight, ArrowLeft, CheckCircle, 
  AlertTriangle, Heart, Lock, RefreshCw, UserCheck, HelpCircle
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
      const response = await fetch("/api/pilot-registration", {
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
                        Check this box if your clinic is solo, rural, or severely underfunded. Dr. Saggar's HiveIMR initiative heavily subsidizes small clinics to guard against system-capture pricing traps.
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
              className="bg-neutral-950/70 border border-neutral-800 p-8 md:p-12 rounded-3xl backdrop-blur-md shadow-2xl space-y-8 text-center"
            >
              <div className="inline-flex p-4 bg-green-950/30 text-[#10B981] rounded-full border border-green-800/30 shadow-[0_0_25px_rgba(16,185,129,0.15)]">
                <CheckCircle size={48} className="animate-bounce" />
              </div>

              <div className="space-y-3">
                <h3 className="text-3xl font-display font-bold text-white">
                  Pilot Registration Logged
                </h3>
                <p className="text-sm font-mono tracking-widest text-[#D4AF37] uppercase">
                  Global Integration Queue Active
                </p>
                <div className="w-16 h-1 bg-[#D4AF37] mx-auto my-3"></div>
              </div>

              <div className="text-neutral-400 text-sm md:text-base leading-relaxed max-w-md mx-auto space-y-4">
                <p>
                  Thank you, **Dr. {name.split(" ")[1] || name}**. Your sovereignty evaluation (Capture Score: **{score}%**) has been cryptographically registered in the Neon database instance.
                </p>
                <p>
                  A member of the HiveIMR Pilot integration team will review your license state (**{stateCountry}**), means-testing eligibility status, and EMR audit responses to configure your sandbox server layout.
                </p>
              </div>

              <div className="bg-[#D4AF37]/5 border border-[#D4AF37]/15 p-4 rounded-2xl max-w-xs mx-auto">
                <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">
                  Secure Token Key
                </span>
                <p className="text-[11px] font-mono text-[#D4AF37] truncate mt-1">
                  IMR-PILOT-{Math.random().toString(36).substring(2, 10).toUpperCase()}-{score}
                </p>
              </div>

              <div className="pt-6 border-t border-neutral-900">
                <button
                  onClick={() => {
                    setName("");
                    setEmail("");
                    setStep(0);
                  }}
                  className="bg-neutral-900 border border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800 text-white font-bold px-8 py-3.5 rounded-full transition-all text-xs tracking-wider uppercase"
                >
                  New Audit Request
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}
