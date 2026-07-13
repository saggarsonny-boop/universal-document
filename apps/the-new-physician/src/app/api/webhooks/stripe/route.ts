import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/lib/db';
import crypto from 'crypto';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  let event: Stripe.Event;

  try {
    if (webhookSecret && signature) {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } else {
      // Fallback/development mode if webhook secret is not set
      const parsed = JSON.parse(body);
      event = parsed as Stripe.Event;
    }
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

    const downloadToken = crypto.randomUUID();
    const tokenExpiresAt = new Date();
    tokenExpiresAt.setHours(tokenExpiresAt.getHours() + 24); // 24 hour expiry

    // Save order in database
    try {
      await db.order.create({
        data: {
          id: crypto.randomUUID(), // we need to specify id since it doesn't default to default(uuid) or auto-increment in schema. prisma db pull shows id is a required field without default value
          product_id: productId,
          stripe_session_id: session.id,
          stripe_payment_intent: session.payment_intent as string || null,
          buyer_email: buyerEmail,
          buyer_name: buyerName,
          amount_cents: amountCents,
          status: 'completed',
          download_token: downloadToken,
          token_expires_at: tokenExpiresAt
        }
      });

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
