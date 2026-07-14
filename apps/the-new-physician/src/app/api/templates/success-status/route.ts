import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { dbEdge } from '@/lib/db-edge';

let _stripe: Stripe | null = null;
// Lazy init so builds without STRIPE_SECRET_KEY don't fail at module load.
function getStripe(): Stripe {
  if (!_stripe) _stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');
  return _stripe;
}

export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    // Fetch Checkout Session from Stripe
    let session: any;
    try {
      session = await getStripe().checkout.sessions.retrieve(sessionId);
    } catch (e: any) {
      console.error('Stripe Session Retrieval Error:', e.message);
      return NextResponse.json({ error: 'Stripe session retrieval failed' }, { status: 500 });
    }

    if (session.payment_status !== 'paid') {
      return NextResponse.json({ status: 'pending', message: 'Payment pending' });
    }

    // Query DB to find the order and retrieve the download token via dbEdge
    const orders = await dbEdge('SELECT id, download_token, buyer_name, buyer_email, token_expires_at FROM orders WHERE stripe_session_id = $1', [sessionId]) as any[];
    const order = orders[0];

    if (!order) {
      return NextResponse.json({ status: 'syncing', message: 'Order syncing' });
    }

    return NextResponse.json({
      status: 'success',
      order: {
        id: order.id,
        download_token: order.download_token,
        buyer_name: order.buyer_name,
        buyer_email: order.buyer_email,
        token_expires_at: order.token_expires_at
      }
    });
  } catch (error: any) {
    console.error('Success status API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
