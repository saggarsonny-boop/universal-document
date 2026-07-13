import { db } from '@/lib/db';
import Stripe from 'stripe';
import Link from 'next/link';
import { CheckCircle2, Download, ArrowRight, ShieldCheck, Mail } from 'lucide-react';
import { HiveFooter } from '@/components/HiveFooter';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

interface PageProps {
  searchParams: Promise<{
    session_id?: string;
  }>;
}

export const dynamic = 'force-dynamic';

export default async function SuccessPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const sessionId = params.session_id;

  if (!sessionId) {
    return (
      <div className="min-h-screen bg-[#0B0F19] text-[#E2E8F0] font-sans flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-bold text-red-400 mb-2">Invalid Session</h1>
        <p className="text-[#8F9CAE] mb-6">No Stripe session identifier found.</p>
        <Link href="/templates" className="bg-[#D4AF37] hover:bg-[#BCA032] text-[#0B0F19] font-bold px-6 py-3 rounded-xl transition-all">
          Return to Templates
        </Link>
      </div>
    );
  }

  // Fetch Checkout Session from Stripe
  let session: any;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch (e: any) {
    console.error('Stripe Session Retrieval Error:', e.message);
    return (
      <div className="min-h-screen bg-[#0B0F19] text-[#E2E8F0] font-sans flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-bold text-red-400 mb-2">Checkout Error</h1>
        <p className="text-[#8F9CAE] mb-6">Unable to verify checkout status from Stripe.</p>
        <Link href="/templates" className="bg-[#D4AF37] hover:bg-[#BCA032] text-[#0B0F19] font-bold px-6 py-3 rounded-xl transition-all">
          Return to Templates
        </Link>
      </div>
    );
  }

  if (session.payment_status !== 'paid') {
    return (
      <div className="min-h-screen bg-[#0B0F19] text-[#E2E8F0] font-sans flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-bold text-[#D4AF37] mb-2">Payment Pending</h1>
        <p className="text-[#8F9CAE] mb-6">Your payment is processing. Once complete, your download link will be active.</p>
        <Link href="/templates" className="bg-[#1F293D] hover:bg-[#D4AF37] hover:text-[#0B0F19] text-white font-bold px-6 py-3 rounded-xl transition-all">
          Return to Templates
        </Link>
      </div>
    );
  }

  // Query DB to find the order and retrieve the download token
  const order = await db.order.findFirst({
    where: { stripe_session_id: sessionId }
  });

  // If the order isn't in the database yet (webhook latency), show processing message
  if (!order) {
    return (
      <div className="min-h-screen bg-[#0B0F19] text-[#E2E8F0] font-sans flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 border-4 border-t-[#D4AF37] border-[#1F293D] rounded-full animate-spin mb-6"></div>
        <h1 className="text-2xl font-bold text-white mb-2">Completing Order...</h1>
        <p className="text-[#8F9CAE] max-w-md mb-6 leading-relaxed">
          We are syncing your payment confirmation and generating your watermarked files. This usually takes just a few seconds. Please refresh this page.
        </p>
        <Link
          href={`/templates/success?session_id=${sessionId}`}
          className="bg-[#D4AF37] hover:bg-[#BCA032] text-[#0B0F19] font-bold px-8 py-3 rounded-xl transition-all inline-block"
        >
          Check Status / Refresh
        </Link>
      </div>
    );
  }

  const downloadLink = `/api/templates/download?token=${order.download_token}`;

  return (
    <div className="min-h-screen bg-[#0B0F19] text-[#E2E8F0] font-sans flex flex-col selection:bg-[#D4AF37] selection:text-[#0B0F19]">
      <header className="border-b border-[#1F293D] py-5 px-6 md:px-12 flex justify-between items-center bg-[#0D111A]/80 backdrop-blur-md">
        <span className="font-bold tracking-widest text-[#D4AF37] text-xs uppercase">The New Physician</span>
        <Link href="/templates" className="text-sm text-[#8F9CAE] hover:text-[#D4AF37] transition-colors">
          Browse Library
        </Link>
      </header>

      <main className="flex-grow max-w-xl mx-auto w-full px-6 py-16 md:py-24 flex flex-col justify-center">
        <div className="bg-[#0D111A] border border-[rgba(212,175,55,0.3)] rounded-3xl p-8 md:p-10 shadow-2xl text-center">
          <CheckCircle2 className="w-16 h-16 text-[#D4AF37] mx-auto mb-6" />
          
          <h1 className="text-3xl font-extrabold text-white mb-4">
            Payment Confirmed
          </h1>
          
          <p className="text-[#ACB6C5] text-sm leading-relaxed mb-8">
            Thank you for your purchase. We have compiled your secure document packages. You can download them directly below or access them via the link sent to your email.
          </p>

          {/* Secure Download Widget */}
          <div className="bg-[#080B12] border border-[#1F293D] rounded-2xl p-6 mb-8 text-left space-y-4">
            <div className="flex items-center justify-between text-xs text-[#5B6574] font-medium border-b border-[#1F293D] pb-3">
              <span>ORDER ID: #{order.id.substring(0, 8)}</span>
              <span>EXPIRES IN: 24 HOURS</span>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] text-[#5B6574] font-bold uppercase tracking-wider block">Target Buyer Details</span>
              <div className="text-xs text-[#8F9CAE]">
                <span className="text-white block font-bold">{order.buyer_name}</span>
                <span>{order.buyer_email}</span>
              </div>
            </div>

            <a
              href={downloadLink}
              className="w-full bg-[#D4AF37] hover:bg-[#BCA032] text-[#0B0F19] font-bold py-3.5 px-4 rounded-xl transition-all shadow-lg hover:shadow-[#D4AF37]/15 flex items-center justify-center gap-2 cursor-pointer text-sm"
            >
              <Download className="w-4 h-4" /> Download Personalized PDF
            </a>
          </div>

          <div className="space-y-3 text-xs text-[#8F9CAE] leading-relaxed">
            <div className="flex items-center gap-2 justify-center">
              <Mail className="w-4 h-4 text-[#D4AF37] shrink-0" />
              <span>We also sent a backup copy of the link to <strong>{order.buyer_email}</strong></span>
            </div>
            <div className="flex items-center gap-2 justify-center">
              <ShieldCheck className="w-4 h-4 text-[#D4AF37] shrink-0" />
              <span>Personalized watermark stamped for anti-piracy protection</span>
            </div>
          </div>

          <div className="border-t border-[#1F293D]/50 mt-8 pt-6">
            <Link href="/templates" className="text-xs font-bold text-[#D4AF37] hover:underline flex items-center justify-center gap-1.5">
              Explore other templates & guides <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </main>

      <HiveFooter />
    </div>
  );
}
