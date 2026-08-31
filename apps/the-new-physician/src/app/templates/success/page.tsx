"use client";

export const runtime = 'edge';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { CheckCircle2, Download, ArrowRight, ShieldCheck, Mail } from 'lucide-react';
import { HiveFooter } from '@/components/HiveFooter';

interface PageProps {
  searchParams: Promise<{
    session_id?: string;
  }>;
}

export default function SuccessPage({ searchParams }: PageProps) {
  const params = use(searchParams);
  const sessionId = params.session_id;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'pending' | 'syncing' | 'success'>('syncing');
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    if (!sessionId) {
      setError('No Stripe session identifier found.');
      setLoading(false);
      return;
    }

    let intervalId: any;

    const checkStatus = async () => {
      try {
        const res = await fetch(`/api/templates/success-status?session_id=${sessionId}`);
        if (!res.ok) {
          throw new Error('Failed to retrieve order status');
        }
        const data = await res.json();
        if (data.error) {
          throw new Error(data.error);
        }

        if (data.status === 'success') {
          setStatus('success');
          setOrder(data.order);
          setLoading(false);
          clearInterval(intervalId);
        } else if (data.status === 'pending') {
          setStatus('pending');
          setLoading(false);
        } else {
          // syncing - keep polling
          setStatus('syncing');
        }
      } catch (err: any) {
        setError(err.message || 'Unable to verify checkout status.');
        setLoading(false);
        clearInterval(intervalId);
      }
    };

    // Initial check
    checkStatus();

    // Poll every 3 seconds for syncing state
    intervalId = setInterval(checkStatus, 3000);

    return () => clearInterval(intervalId);
  }, [sessionId]);

  if (loading || status === 'syncing') {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-neutral-300 font-sans flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 border-4 border-t-[#D4AF37] border-neutral-800 rounded-full animate-spin mb-6"></div>
        <h1 className="text-2xl font-bold text-white mb-2">Completing Order...</h1>
        <p className="text-neutral-400 max-w-md mb-6 leading-relaxed">
          We are syncing your payment confirmation and generating your watermarked files. This usually takes just a few seconds.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-neutral-300 font-sans flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-bold text-red-400 mb-2">Checkout Error</h1>
        <p className="text-neutral-400 mb-6">{error}</p>
        <Link href="/templates" className="bg-[#D4AF37] hover:bg-[#BCA032] text-black font-bold px-6 py-3 rounded-xl transition-all">
          Return to Templates
        </Link>
      </div>
    );
  }

  if (status === 'pending') {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-neutral-300 font-sans flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-bold text-[#D4AF37] mb-2">Payment Pending</h1>
        <p className="text-neutral-400 mb-6">Your payment is processing. Once complete, your download link will be active.</p>
        <Link href="/templates" className="bg-neutral-800 hover:bg-[#D4AF37] hover:text-black text-white font-bold px-6 py-3 rounded-xl transition-all">
          Return to Templates
        </Link>
      </div>
    );
  }

  const downloadLink = `/api/templates/download?token=${order.download_token}`;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-neutral-300 font-sans flex flex-col selection:bg-[#D4AF37] selection:text-black">
      <header className="border-b border-neutral-800 py-5 px-6 md:px-12 flex justify-between items-center bg-[#0a0a0a]/80 backdrop-blur-md">
        <span className="font-bold tracking-widest text-[#D4AF37] text-xs uppercase">The New Physician</span>
        <Link href="/templates" className="text-sm text-neutral-400 hover:text-[#D4AF37] transition-colors">
          Browse Library
        </Link>
      </header>

      <main className="flex-grow max-w-xl mx-auto w-full px-6 py-16 md:py-24 flex flex-col justify-center">
        <div className="bg-[#111111] border border-[rgba(212,175,55,0.3)] rounded-3xl p-8 md:p-10 shadow-2xl text-center">
          <CheckCircle2 className="w-16 h-16 text-[#D4AF37] mx-auto mb-6" />
          
          <h1 className="text-3xl font-extrabold text-white mb-4">
            Payment Confirmed
          </h1>
          
          <p className="text-neutral-400 text-sm leading-relaxed mb-8">
            Thank you for your purchase. We have compiled your secure document packages. You can download them directly below or access them via the link sent to your email.
          </p>

          {/* Secure Download Widget */}
          <div className="bg-[#0a0a0a] border border-neutral-800 rounded-2xl p-6 mb-8 text-left space-y-4">
            <div className="flex items-center justify-between text-xs text-neutral-500 font-medium border-b border-neutral-800 pb-3">
              <span>ORDER ID: #{order.id.substring(0, 8)}</span>
              <span>EXPIRES IN: 24 HOURS</span>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider block">Target Buyer Details</span>
              <div className="text-xs text-neutral-400">
                <span className="text-white block font-bold">{order.buyer_name}</span>
                <span>{order.buyer_email}</span>
              </div>
            </div>

            <a
              href={downloadLink}
              className="w-full bg-[#D4AF37] hover:bg-[#BCA032] text-black font-bold py-3.5 px-4 rounded-xl transition-all shadow-lg hover:shadow-[#D4AF37]/15 flex items-center justify-center gap-2 cursor-pointer text-sm"
            >
              <Download className="w-4 h-4" /> Download Personalized PDF
            </a>
          </div>

          <div className="space-y-3 text-xs text-neutral-400 leading-relaxed">
            <div className="flex items-center gap-2 justify-center">
              <Mail className="w-4 h-4 text-[#D4AF37] shrink-0" />
              <span>We also sent a backup copy of the link to <strong>{order.buyer_email}</strong></span>
            </div>
            <div className="flex items-center gap-2 justify-center">
              <ShieldCheck className="w-4 h-4 text-[#D4AF37] shrink-0" />
              <span>Personalized watermark stamped for anti-piracy protection</span>
            </div>
          </div>

          <div className="border-t border-neutral-900 mt-8 pt-6">
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
