import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY && process.env.NODE_ENV === 'production') {
  console.warn("⚠️ STRIPE_SECRET_KEY is missing. Billing will fail.");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
  apiVersion: '2024-04-10', // using a known recent api version
  appInfo: {
    name: 'Hive Queen Bee',
    version: '1.0.0',
  },
});

export async function createCheckoutSession(engineName: string, successUrl: string, cancelUrl: string) {
  // In a real environment, this would use a predefined Price ID from the environment.
  // We'll mock the line item structure for the Enterprise plan.
  
  if (!process.env.STRIPE_SECRET_KEY) {
    // Return a mock URL for local development to avoid crashing
    return { url: `/login?mock_stripe_success=true&engine=${engineName}` };
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Enterprise Subscription: ${engineName}`,
            description: 'Hiveware Ecosystem Access',
          },
          unit_amount: 49900, // $499.00
          recurring: {
            interval: 'month',
          },
        },
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: cancelUrl,
    metadata: {
      engine: engineName,
    },
  });

  return session;
}

export function constructWebhookEvent(body: string, signature: string) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new Error('Missing STRIPE_WEBHOOK_SECRET');
  
  return stripe.webhooks.constructEvent(body, signature, secret);
}
