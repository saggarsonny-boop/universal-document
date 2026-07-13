import Link from 'next/link';
import { XCircle, ArrowLeft, HelpCircle } from 'lucide-react';
import { HiveFooter } from '@/components/HiveFooter';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export default function CancelPage() {
  return (
    <div className="min-h-screen bg-[#0B0F19] text-[#E2E8F0] font-sans flex flex-col selection:bg-[#D4AF37] selection:text-[#0B0F19]">
      <header className="border-b border-[#1F293D] py-5 px-6 md:px-12 flex justify-between items-center bg-[#0D111A]/80 backdrop-blur-md">
        <span className="font-bold tracking-widest text-[#D4AF37] text-xs uppercase">The New Physician</span>
        <Link href="/templates" className="text-sm text-[#8F9CAE] hover:text-[#D4AF37] transition-colors">
          Browse Library
        </Link>
      </header>

      <main className="flex-grow max-w-xl mx-auto w-full px-6 py-16 md:py-24 flex flex-col justify-center">
        <div className="bg-[#0D111A] border border-[#1F293D] rounded-3xl p-8 md:p-10 shadow-2xl text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
          
          <h1 className="text-3xl font-extrabold text-white mb-4">
            Payment Cancelled
          </h1>
          
          <p className="text-[#ACB6C5] text-sm leading-relaxed mb-8">
            Your transaction has been cancelled. No charges were made to your credit card. You can return to the templates list or reach out to support if you encountered issues.
          </p>

          <div className="space-y-4">
            <Link
              href="/templates"
              className="w-full bg-[#1F293D] hover:bg-[#D4AF37] hover:text-[#0B0F19] text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Templates
            </Link>
            
            <a
              href="mailto:support@newphysician.org"
              className="w-full border border-[#1F293D] hover:border-[#D4AF37] hover:text-[#D4AF37] text-[#8F9CAE] font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 text-xs"
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
