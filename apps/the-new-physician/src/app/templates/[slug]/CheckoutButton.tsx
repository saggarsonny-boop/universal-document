'use client';

import { useState } from 'react';
import { ShoppingCart, Loader2 } from 'lucide-react';

interface CheckoutButtonProps {
  productId: string;
}

export default function CheckoutButton({ productId }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/templates/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong during checkout initialization');
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('Checkout URL not returned from server');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to initialize payment flow');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <button
        onClick={handleCheckout}
        disabled={loading}
        className="w-full bg-[#D4AF37] hover:bg-[#BCA032] disabled:bg-[#1F293D] disabled:text-[#5B6574] text-[#0B0F19] font-bold py-3.5 px-4 rounded-xl transition-all shadow-lg hover:shadow-[#D4AF37]/15 flex items-center justify-center gap-2 cursor-pointer text-sm"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Initializing checkout...
          </>
        ) : (
          <>
            <ShoppingCart className="w-4 h-4" />
            Buy Template Now
          </>
        )}
      </button>
      {error && (
        <p className="text-red-400 text-[11px] text-center border border-red-500/20 bg-red-500/5 p-2.5 rounded-lg leading-relaxed">
          {error}
        </p>
      )}
    </div>
  );
}
