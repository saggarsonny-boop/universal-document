"use client";

import React, { useState, useEffect } from "react";
import { 
  Shield, Lock, Unlock, Eye, Search, Filter, Mail, Globe, 
  User, Database, RefreshCw, AlertTriangle, ArrowLeft, Download
} from "lucide-react";
import { motion } from "framer-motion";

interface Registration {
  id: string;
  name: string;
  email: string;
  practiceType: "SOLO" | "CLINIC" | "SYSTEM";
  stateCountry: string;
  meansTested: boolean;
  systemicCaptureScore: number;
  answers: string; // JSON string of answers
  createdAt: string;
}

const QUESTIONS = [
  "1. Daily EMR Checklist Overhead",
  "2. Billing-Driven Note Structuring",
  "3. Retrospective Audit & Denial Anxiety",
  "4. EMR Workflow Rigidity",
  "5. Algorithmic Decision Overrides",
  "6. Administrative Purpose Alienation"
];

export default function PilotApplicants() {
  const [passcode, setPasscode] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(false);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null);
  
  // Search and Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [practiceFilter, setPracticeFilter] = useState("ALL");
  const [meansTestedFilter, setMeansTestedFilter] = useState("ALL");
  const [scoreFilter, setScoreFilter] = useState("ALL"); // ALL, SOVEREIGN, CAPTIVE, PRISONER, HOSTAGE

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode.trim() === "MOH-PILOT-2026") {
      setIsAuthenticated(true);
      setAuthError("");
      sessionStorage.setItem("pilot_admin_passcode", passcode);
      fetchData(passcode);
    } else {
      setAuthError("Invalid administrative credentials. Please verify passcode.");
    }
  };

  const fetchData = async (code: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/pilot-registration?passcode=${code}`);
      const data = await response.json();
      if (response.ok) {
        setRegistrations(data.registrations || []);
      } else {
        setIsAuthenticated(false);
        setAuthError(data.error || "Session expired or unauthorized.");
      }
    } catch (err) {
      setAuthError("Failed to communicate with database server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedCode = sessionStorage.getItem("pilot_admin_passcode");
    if (savedCode === "MOH-PILOT-2026") {
      setPasscode(savedCode);
      setIsAuthenticated(true);
      fetchData(savedCode);
    }
  }, []);

  // Filter logic
  const filteredRegs = registrations.filter(reg => {
    const matchesSearch = 
      reg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.stateCountry.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPractice = practiceFilter === "ALL" || reg.practiceType === practiceFilter;
    
    const matchesMeans = 
      meansTestedFilter === "ALL" || 
      (meansTestedFilter === "SUBSIDIZED" && reg.meansTested) ||
      (meansTestedFilter === "STANDARD" && !reg.meansTested);

    const matchesScore = 
      scoreFilter === "ALL" ||
      (scoreFilter === "SOVEREIGN" && reg.systemicCaptureScore <= 25) ||
      (scoreFilter === "CAPTIVE" && reg.systemicCaptureScore > 25 && reg.systemicCaptureScore <= 50) ||
      (scoreFilter === "PRISONER" && reg.systemicCaptureScore > 50 && reg.systemicCaptureScore <= 75) ||
      (scoreFilter === "HOSTAGE" && reg.systemicCaptureScore > 75);

    return matchesSearch && matchesPractice && matchesMeans && matchesScore;
  });

  const getTierBadge = (score: number) => {
    if (score <= 25) {
      return <span className="bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 px-2 py-0.5 rounded text-xs font-mono">Sovereign ({score}%)</span>;
    } else if (score <= 50) {
      return <span className="bg-amber-950/40 border border-amber-800/40 text-amber-400 px-2 py-0.5 rounded text-xs font-mono">Captive ({score}%)</span>;
    } else if (score <= 75) {
      return <span className="bg-orange-950/40 border border-orange-800/40 text-orange-400 px-2 py-0.5 rounded text-xs font-mono">Prisoner ({score}%)</span>;
    } else {
      return <span className="bg-red-950/40 border border-red-800/40 text-red-400 px-2 py-0.5 rounded text-xs font-mono animate-pulse">Hostage ({score}%)</span>;
    }
  };

  const getAnswersList = (answersStr: string) => {
    try {
      const parsed = JSON.parse(answersStr);
      return Object.keys(parsed).map(key => {
        const questionIdx = parseInt(key) - 1;
        const score = parsed[key];
        return {
          question: QUESTIONS[questionIdx] || `Metric ${key}`,
          score
        };
      });
    } catch {
      return [];
    }
  };

  // Metrics calculations
  const totalCount = registrations.length;
  const subsidizedCount = registrations.filter(r => r.meansTested).length;
  const averageScore = totalCount > 0 
    ? Math.round(registrations.reduce((sum, r) => sum + r.systemicCaptureScore, 0) / totalCount) 
    : 0;
  const hostageCount = registrations.filter(r => r.systemicCaptureScore > 75).length;

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredRegs.length === 0) return;
    
    const headers = ["ID", "Name", "Email", "Practice Type", "State/Country", "Subsidized/Means Tested", "Systemic Capture Score", "Signup Date"];
    const rows = filteredRegs.map(r => [
      r.id,
      r.name,
      r.email,
      r.practiceType,
      r.stateCountry,
      r.meansTested ? "YES" : "NO",
      r.systemicCaptureScore,
      new Date(r.createdAt).toLocaleDateString()
    ]);

    const csvContent = [headers, ...rows].map(e => e.map(val => `"${val}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `IMR_Pilot_Applicants_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] text-neutral-300 font-sans flex items-center justify-center p-6 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#D4AF37]/5 rounded-full blur-[80px] pointer-events-none z-0"></div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-neutral-950 border border-neutral-800 p-8 rounded-3xl backdrop-blur-md shadow-2xl max-w-md w-full space-y-6 z-10 text-center"
        >
          <div className="space-y-3">
            <div className="inline-flex p-3.5 bg-[#D4AF37]/10 text-[#D4AF37] rounded-full border border-[#D4AF37]/20">
              <Lock size={32} />
            </div>
            <h2 className="text-2xl font-display font-bold text-white">
              Sovereign console
            </h2>
            <p className="text-xs font-mono uppercase tracking-widest text-[#D4AF37]">
              HiveIMR Pilot Admin Gateway
            </p>
          </div>

          {authError && (
            <div className="bg-red-950/40 border border-red-800 text-red-300 p-4 rounded-xl text-xs flex items-start gap-2.5 text-left">
              <AlertTriangle className="shrink-0 mt-0.5 text-red-500" size={14} />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5 text-left">
              <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-500">
                Administrative Passcode
              </label>
              <input
                type="password"
                required
                placeholder="Enter administrative credentials"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-white text-center focus:outline-none focus:border-[#D4AF37] transition-colors text-sm"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#D4AF37] text-black font-bold py-3.5 rounded-xl hover:bg-[#b5952f] transition-all text-sm shadow-[0_0_20px_rgba(212,175,55,0.15)] flex items-center justify-center gap-2"
            >
              <Unlock size={16} />
              Authenticate Console
            </button>
          </form>

          <a 
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-white transition-colors"
          >
            <ArrowLeft size={12} />
            Return to Homepage
          </a>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-neutral-300 font-sans pt-28 pb-16 px-6 relative">
      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        
        {/* Navigation / Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-900 pb-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#D4AF37]">
              <Database size={14} />
              Secured Neon Registry
            </div>
            <h1 className="text-3xl font-display font-bold text-white tracking-wide">
              HiveIMR Pilot Applicants
            </h1>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => fetchData(passcode)}
              disabled={loading}
              className="border border-neutral-800 hover:border-neutral-700 bg-neutral-950 hover:bg-neutral-900 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              Refresh Sync
            </button>

            <button
              onClick={handleExportCSV}
              disabled={filteredRegs.length === 0}
              className="bg-[#D4AF37] text-black hover:bg-[#b5952f] px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all disabled:opacity-40"
            >
              <Download size={14} />
              Export CSV
            </button>

            <button
              onClick={() => {
                sessionStorage.removeItem("pilot_admin_passcode");
                setIsAuthenticated(false);
              }}
              className="border border-red-900/40 hover:border-red-800 bg-red-950/10 text-red-400 px-4 py-2.5 rounded-xl text-xs font-bold transition-all"
            >
              Lock Console
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-neutral-950 border border-neutral-900 p-5 rounded-2xl space-y-1">
            <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block">Total Submissions</span>
            <span className="text-3xl font-mono font-bold text-white">{totalCount}</span>
          </div>

          <div className="bg-neutral-950 border border-neutral-900 p-5 rounded-2xl space-y-1">
            <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block">Subsidized Placement (Means-Tested)</span>
            <span className="text-3xl font-mono font-bold text-[#D4AF37]">{subsidizedCount}</span>
          </div>

          <div className="bg-neutral-950 border border-neutral-900 p-5 rounded-2xl space-y-1">
            <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block">Avg Systemic Capture</span>
            <span className="text-3xl font-mono font-bold text-orange-400">{averageScore}%</span>
          </div>

          <div className="bg-neutral-950 border border-neutral-900 p-5 rounded-2xl space-y-1">
            <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block">Systemic Hostages</span>
            <span className="text-3xl font-mono font-bold text-red-400">{hostageCount}</span>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-neutral-950 border border-neutral-900 p-5 rounded-2xl flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={16} />
            <input
              type="text"
              placeholder="Search by credential name, email, license state..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-850 rounded-xl pl-11 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37] transition-colors"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="flex items-center gap-2 bg-neutral-900 px-3 py-2 rounded-xl border border-neutral-850">
              <Filter size={12} className="text-neutral-500" />
              <select
                value={practiceFilter}
                onChange={(e) => setPracticeFilter(e.target.value)}
                className="bg-transparent text-xs text-neutral-300 focus:outline-none cursor-pointer w-full"
              >
                <option value="ALL">Practice: All</option>
                <option value="SOLO">Solo Practice</option>
                <option value="CLINIC">Group Clinic</option>
                <option value="SYSTEM">Hospital System</option>
              </select>
            </div>

            <div className="flex items-center gap-2 bg-neutral-900 px-3 py-2 rounded-xl border border-neutral-850">
              <Filter size={12} className="text-neutral-500" />
              <select
                value={meansTestedFilter}
                onChange={(e) => setMeansTestedFilter(e.target.value)}
                className="bg-transparent text-xs text-neutral-300 focus:outline-none cursor-pointer w-full"
              >
                <option value="ALL">Means Tested: All</option>
                <option value="SUBSIDIZED">Subsidized</option>
                <option value="STANDARD">Standard</option>
              </select>
            </div>

            <div className="flex items-center gap-2 bg-neutral-900 px-3 py-2 rounded-xl border border-neutral-850">
              <Filter size={12} className="text-neutral-500" />
              <select
                value={scoreFilter}
                onChange={(e) => setScoreFilter(e.target.value)}
                className="bg-transparent text-xs text-neutral-300 focus:outline-none cursor-pointer w-full"
              >
                <option value="ALL">Score Tier: All</option>
                <option value="SOVEREIGN">Sovereign (0-25%)</option>
                <option value="CAPTIVE">Captive (26-50%)</option>
                <option value="PRISONER">Prisoner (51-75%)</option>
                <option value="HOSTAGE">Hostage (76-100%)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Applicants Grid/Table */}
        <div className="bg-neutral-950 border border-neutral-900 rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-900 bg-neutral-950 text-[10px] font-mono uppercase tracking-wider text-neutral-500">
                  <th className="py-4 px-6">Date</th>
                  <th className="py-4 px-6">Applicant Name</th>
                  <th className="py-4 px-6">Secure Email</th>
                  <th className="py-4 px-6">Classification</th>
                  <th className="py-4 px-6">Licensure Location</th>
                  <th className="py-4 px-6">Means Subsidy</th>
                  <th className="py-4 px-6">Capture Tier</th>
                  <th className="py-4 px-6 text-center">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-900 text-xs">
                {filteredRegs.length > 0 ? (
                  filteredRegs.map((reg) => (
                    <tr 
                      key={reg.id} 
                      className="hover:bg-neutral-900/30 transition-colors"
                    >
                      <td className="py-4 px-6 text-neutral-500 font-mono">
                        {new Date(reg.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6 font-bold text-white flex items-center gap-2">
                        <User size={12} className="text-neutral-500" />
                        {reg.name}
                      </td>
                      <td className="py-4 px-6 font-mono text-neutral-400">
                        <a 
                          href={`mailto:${reg.email}`}
                          className="hover:text-[#D4AF37] hover:underline flex items-center gap-1.5"
                        >
                          <Mail size={12} className="text-neutral-500" />
                          {reg.email}
                        </a>
                      </td>
                      <td className="py-4 px-6 font-bold">
                        {reg.practiceType === "SOLO" && "Solo Clinic"}
                        {reg.practiceType === "CLINIC" && "Independent Group"}
                        {reg.practiceType === "SYSTEM" && "Hospital System"}
                      </td>
                      <td className="py-4 px-6 text-neutral-400 flex-wrap">
                        <span className="inline-flex items-center gap-1">
                          <Globe size={11} className="text-neutral-500" />
                          {reg.stateCountry}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        {reg.meansTested ? (
                          <span className="bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                            SUBSIDIZED
                          </span>
                        ) : (
                          <span className="text-neutral-600 font-mono">-</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        {getTierBadge(reg.systemicCaptureScore)}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => setSelectedReg(reg)}
                          className="text-neutral-400 hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 p-1.5 rounded-lg transition-all"
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-neutral-600 font-mono uppercase tracking-widest">
                      No matching records found in this registry.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Answer Inspection Overlay Modal */}
      {selectedReg && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-neutral-950 border border-neutral-850 p-6 md:p-8 rounded-3xl max-w-lg w-full space-y-6 shadow-2xl relative"
          >
            {/* Header info */}
            <div className="border-b border-neutral-900 pb-4 pr-8">
              <span className="text-[10px] font-mono text-[#D4AF37] uppercase tracking-widest">Applicant Audit Profile</span>
              <h3 className="text-2xl font-bold font-display text-white mt-1">{selectedReg.name}</h3>
              <p className="text-xs text-neutral-500 font-mono mt-0.5">{selectedReg.email}</p>
            </div>

            {/* Questions breakdown */}
            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
              <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 block mb-2">Individual Metric Responses</span>
              {getAnswersList(selectedReg.answers).map((item, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-neutral-300">{item.question}</span>
                    <span className="font-mono font-bold text-[#D4AF37]">{item.score}%</span>
                  </div>
                  <div className="w-full bg-neutral-900 h-1 rounded-full overflow-hidden border border-neutral-950">
                    <div 
                      className="bg-[#D4AF37] h-full"
                      style={{ width: `${item.score}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Score & Profile Footer */}
            <div className="bg-[#D4AF37]/5 border border-[#D4AF37]/20 p-4 rounded-2xl flex justify-between items-center">
              <div>
                <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest block">Systemic Capture Score</span>
                <span className="text-xl font-bold text-white font-mono">{selectedReg.systemicCaptureScore}%</span>
              </div>
              <div>
                <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest block">Recruitment Placement</span>
                <div className="mt-0.5">{getTierBadge(selectedReg.systemicCaptureScore)}</div>
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={() => setSelectedReg(null)}
              className="absolute top-4 right-4 text-neutral-500 hover:text-white bg-neutral-900 border border-neutral-850 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            >
              ✕
            </button>
          </motion.div>
        </div>
      )}
    </main>
  );
}
