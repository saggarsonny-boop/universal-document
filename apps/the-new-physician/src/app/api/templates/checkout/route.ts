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

export async function POST(request: Request) {
  try {
    const { productId, email } = await request.json();

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const products = await dbEdge('SELECT id, slug, status, stripe_price_id, is_bundle FROM "Product" WHERE id = $1', [productId]) as any[];
    const product = products[0];

    if (!product || product.status !== 'live') {
      return NextResponse.json({ error: 'Product not found or not available' }, { status: 404 });
    }

    if (!product.stripe_price_id) {
      return NextResponse.json({ error: 'Stripe price integration missing for this product' }, { status: 500 });
    }

    // Create Stripe Checkout Session
    const session = await getStripe().checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: product.stripe_price_id,
          quantity: 1,
        },
      ],
      mode: 'payment',
      customer_email: email || undefined,
      success_url: `${request.headers.get('origin')}/templates/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.headers.get('origin')}/templates/cancel`,
      metadata: {
        productId: product.id,
        slug: product.slug,
        isBundle: product.is_bundle ? 'true' : 'false'
      }
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Checkout Session Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
