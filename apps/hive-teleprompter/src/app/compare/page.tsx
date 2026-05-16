import Link from 'next/link';

export default function ComparePage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-[#D4AF37] selection:text-black font-sans">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-900 via-black to-black -z-10"></div>
      
      <div className="max-w-5xl mx-auto px-6 py-24">
        {/* Header */}
        <div className="text-center mb-20 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 text-[#D4AF37] text-sm font-bold tracking-widest uppercase mb-4">
            <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse"></span>
            Machine Over Human
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-tight">
            The era of clunky <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-neutral-500 to-neutral-700">prompters is over.</span>
          </h1>
          <p className="text-xl text-neutral-400 max-w-2xl mx-auto">
            See exactly why high-end creators, executives, and physicians are abandoning Legacy SaaS for the Hive Engine.
          </p>
        </div>

        {/* The Matrix */}
        <div className="relative overflow-x-auto rounded-2xl border border-neutral-800 bg-neutral-900/50 backdrop-blur-xl shadow-2xl mb-16">
          <table className="w-full text-left text-sm md:text-base">
            <thead className="bg-black/50 text-xs uppercase tracking-widest text-neutral-400 border-b border-neutral-800">
              <tr>
                <th scope="col" className="px-6 py-6 font-bold w-1/4">Capability</th>
                <th scope="col" className="px-6 py-6 font-black text-[#D4AF37] w-1/4 bg-[#D4AF37]/5">HiveTeleprompter</th>
                <th scope="col" className="px-6 py-6 font-medium text-neutral-500 w-1/4">Speakeasy</th>
                <th scope="col" className="px-6 py-6 font-medium text-neutral-500 w-1/4">PromptSmart</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/50">
              <tr className="hover:bg-neutral-800/20 transition-colors">
                <td className="px-6 py-5 font-bold text-neutral-200">Voice Tracking Physics</td>
                <td className="px-6 py-5 text-[#D4AF37] font-bold bg-[#D4AF37]/5">Continuous PID Auto-Flow</td>
                <td className="px-6 py-5 text-neutral-500">Jittery Jump Scroll</td>
                <td className="px-6 py-5 text-neutral-500">Often Gets Trapped</td>
              </tr>
              <tr className="hover:bg-neutral-800/20 transition-colors">
                <td className="px-6 py-5 font-bold text-neutral-200">AI Eye-Contact</td>
                <td className="px-6 py-5 text-white font-medium bg-[#D4AF37]/5">Native Neural Redirection</td>
                <td className="px-6 py-5 text-neutral-500">Requires App Install</td>
                <td className="px-6 py-5 text-neutral-500">Requires Glass Rig</td>
              </tr>
              <tr className="hover:bg-neutral-800/20 transition-colors">
                <td className="px-6 py-5 font-bold text-neutral-200">Time to Record</td>
                <td className="px-6 py-5 text-white font-medium bg-[#D4AF37]/5">&lt; 3 Seconds (Zero Install)</td>
                <td className="px-6 py-5 text-neutral-500">App Download Required</td>
                <td className="px-6 py-5 text-neutral-500">Heavy Desktop App</td>
              </tr>
              <tr className="hover:bg-neutral-800/20 transition-colors">
                <td className="px-6 py-5 font-bold text-neutral-200">Architecture</td>
                <td className="px-6 py-5 text-white font-medium bg-[#D4AF37]/5">100% Local (Privacy First)</td>
                <td className="px-6 py-5 text-neutral-500">Cloud Dependent</td>
                <td className="px-6 py-5 text-neutral-500">Cloud Dependent</td>
              </tr>
              <tr className="hover:bg-neutral-800/20 transition-colors">
                <td className="px-6 py-5 font-bold text-neutral-200">Aesthetic</td>
                <td className="px-6 py-5 text-white font-medium bg-[#D4AF37]/5">Glassmorphism HUD</td>
                <td className="px-6 py-5 text-neutral-500">Cluttered Widgets</td>
                <td className="px-6 py-5 text-neutral-500">Legacy 2010s UI</td>
              </tr>
              <tr className="hover:bg-neutral-800/20 transition-colors">
                <td className="px-6 py-5 font-bold text-neutral-200">Pricing</td>
                <td className="px-6 py-5 text-[#D4AF37] font-bold bg-[#D4AF37]/5">$29/yr</td>
                <td className="px-6 py-5 text-neutral-500">$99/yr</td>
                <td className="px-6 py-5 text-neutral-500">$200+ Hardware</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* CTA */}
        <div className="text-center mt-20">
          <Link href="/" className="inline-flex items-center justify-center px-8 py-4 text-sm font-bold tracking-widest text-black uppercase transition-all bg-[#D4AF37] rounded-lg hover:bg-[#b0902c] hover:scale-105 shadow-[0_0_30px_rgba(212,175,55,0.3)]">
            Launch Engine Now
          </Link>
          <p className="mt-6 text-sm text-neutral-500 font-mono">No credit card required for standard engine.</p>
        </div>
      </div>
    </div>
  );
}
