import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { dbEdge } from '@/lib/db-edge';

let _stripe: Stripe | null = null;
// Lazy init so builds without STRIPE_SECRET_KEY don't fail at module load.
function getStripe(): Stripe {
  if (!_stripe) _stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');
  return _stripe;
}
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export const runtime = 'edge';

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  let event: Stripe.Event;

  // Fail closed: an unsigned or unverifiable event must never mint orders
  // or download tokens. constructEventAsync is required on the Edge runtime
  // (the sync variant throws under SubtleCrypto).
  if (!webhookSecret || !signature) {
    console.error('Webhook rejected: missing STRIPE_WEBHOOK_SECRET or stripe-signature header');
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 400 });
  }

  try {
    event = await getStripe().webhooks.constructEventAsync(body, signature, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;

    const productId = session.metadata?.productId;
    const buyerEmail = session.customer_details?.email || session.customer_email;
    const buyerName = session.customer_details?.name || 'Customer';
    const amountCents = session.amount_total || 0;

    if (!productId || !buyerEmail) {
      console.error('Webhook error: Missing productId or buyerEmail in session');
      return NextResponse.json({ received: true });
    }

    const downloadToken = globalThis.crypto.randomUUID();
    const tokenExpiresAt = new Date();
    tokenExpiresAt.setHours(tokenExpiresAt.getHours() + 24); // 24 hour expiry

    // Save order in database
    try {
      await dbEdge(`
        INSERT INTO orders 
        (id, product_id, stripe_session_id, stripe_payment_intent, buyer_email, buyer_name, amount_cents, status, download_token, token_expires_at) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [
        globalThis.crypto.randomUUID(),
        productId,
        session.id,
        session.payment_intent as string || null,
        buyerEmail,
        buyerName,
        amountCents,
        'completed',
        downloadToken,
        tokenExpiresAt
      ]);

      console.log(`Order successfully created for session: ${session.id}`);

      // Send email notification via Resend
      const resendApiKey = process.env.RESEND_API_KEY;
      const emailFrom = process.env.EMAIL_FROM || 'onboarding@resend.dev';
      const downloadLink = `${new URL(request.url).origin}/api/templates/download?token=${downloadToken}`;

      if (resendApiKey) {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: `The New Physician <${emailFrom}>`,
            to: [buyerEmail],
            subject: 'Your Digital Download is Ready',
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #d4af37; border-radius: 8px;">
                <h2 style="color: #d4af37;">Thank you for your purchase!</h2>
                <p>Hello ${buyerName},</p>
                <p>Your template order is complete. You can download your personalized PDF guide using the link below:</p>
                <p style="margin: 24px 0;">
                  <a href="${downloadLink}" style="background-color: #d4af37; color: #000; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 4px; display: inline-block;">Download PDF</a>
                </p>
                <p style="color: #666; font-size: 12px;">This download link is personalized and will expire in 24 hours.</p>
                <hr style="border: 0; border-top: 1px solid #eee;" />
                <p style="font-size: 11px; color: #999;">If you did not make this purchase, please ignore this email.</p>
              </div>
            `
          })
        });
      }
    } catch (dbErr: any) {
      console.error('Error recording order in webhook:', dbErr.message);
    }
  }

  return NextResponse.json({ received: true });
}
