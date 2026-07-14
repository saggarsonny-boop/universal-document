import Link from 'next/link';
import { XCircle, ArrowLeft, HelpCircle } from 'lucide-react';
import { HiveFooter } from '@/components/HiveFooter';



export default function CancelPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-neutral-300 font-sans flex flex-col selection:bg-[#D4AF37] selection:text-black">
      <header className="border-b border-neutral-800 py-5 px-6 md:px-12 flex justify-between items-center bg-[#0a0a0a]/80 backdrop-blur-md">
        <span className="font-bold tracking-widest text-[#D4AF37] text-xs uppercase">The New Physician</span>
        <Link href="/templates" className="text-sm text-neutral-400 hover:text-[#D4AF37] transition-colors">
          Browse Library
        </Link>
      </header>

      <main className="flex-grow max-w-xl mx-auto w-full px-6 py-16 md:py-24 flex flex-col justify-center">
        <div className="bg-[#111111] border border-neutral-800 rounded-3xl p-8 md:p-10 shadow-2xl text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
          
          <h1 className="text-3xl font-extrabold text-white mb-4">
            Payment Cancelled
          </h1>
          
          <p className="text-neutral-400 text-sm leading-relaxed mb-8">
            Your transaction has been cancelled. No charges were made to your credit card. You can return to the templates list or reach out to support if you encountered issues.
          </p>

          <div className="space-y-4">
            <Link
              href="/templates"
              className="w-full bg-neutral-800 hover:bg-[#D4AF37] hover:text-black text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Templates
            </Link>
            
            <a
              href="mailto:support@newphysician.org"
              className="w-full border border-neutral-800 hover:border-[#D4AF37] hover:text-[#D4AF37] text-neutral-400 font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 text-xs"
            >
              <HelpCircle className="w-4 h-4" /> Contact Support
            </a>
          </div>
        </div>
      </main>

      <HiveFooter />
    </div>
  );
}
