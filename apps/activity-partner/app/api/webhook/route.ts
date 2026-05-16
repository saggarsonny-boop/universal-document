import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { sql } from '@/app/_lib/db';

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'dummy_key', {
    apiVersion: '2024-04-10',
  });
  
  const sig = req.headers.get('stripe-signature');
  const body = await req.text();

  let event;

  try {
    if (!sig || !endpointSecret) {
      throw new Error('Missing stripe signature or endpoint secret');
    }
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;
      // In a real implementation, we would pass the client's email or session_id via client_reference_id
      const clientEmail = session.customer_details?.email;
      
      if (clientEmail) {
        try {
          // Provision the premium access in Neon
          await sql`
            UPDATE aac_sessions 
            SET is_premium = TRUE, 
                seats_allocated = seats_allocated + 1 
            WHERE email = ${clientEmail}
          `;
          console.log(`✅ Provisioned AAC access for ${clientEmail}`);
        } catch (e) {
          console.error(`❌ Failed to provision DB for ${clientEmail}`, e);
        }
      }
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
