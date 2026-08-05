// SUPERSEDED — DO NOT RUN.
// The live Advisory Fees Payment Link was already created on 2026-08-05
// (product prod_V0yy0VU6D4BkM6, link https://buy.stripe.com/14AfZj7Qz5AZeEa9vr0RG19)
// by a separate agent using different idempotency keys. Running this script
// would create a DUPLICATE product/price/link. Kept for reference only.
process.exit(1);
// Creates the live "Advisory Fees" Stripe Payment Link:
//   - customer chooses the amount ($10 minimum)
//   - required "Invoice # / purpose of payment" text box
//   - optional "Your name / anything else" text box
// Idempotent: safe to re-run, will not create duplicates.
// Usage: STRIPE_SECRET_KEY=sk_live_... node scripts/create-advisory-payment-link.js
const Stripe = require('stripe');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const stripeKey = process.env.STRIPE_SECRET_KEY;
if (!stripeKey) {
  console.error('Error: STRIPE_SECRET_KEY is missing.');
  process.exit(1);
}
const stripe = new Stripe(stripeKey);

async function main() {
  const product = await stripe.products.create({
    name: 'Advisory Fees',
    description: 'Payment of advisory fees as invoiced or agreed (email, text, verbal, or invoice).',
    metadata: { slug: 'advisory-fees', version: '1.0' }
  }, { idempotencyKey: 'advisory-fees:v1' });

  const price = await stripe.prices.create({
    product: product.id,
    currency: 'usd',
    custom_unit_amount: { enabled: true, minimum: 1000 },
    metadata: { slug: 'advisory-fees' }
  }, { idempotencyKey: 'advisory-fees:custom-price:v1' });

  const link = await stripe.paymentLinks.create({
    line_items: [{ price: price.id, quantity: 1 }],
    custom_fields: [
      {
        key: 'invoice_purpose',
        label: { type: 'custom', custom: 'Invoice # / purpose of payment' },
        type: 'text'
      },
      {
        key: 'notes',
        label: { type: 'custom', custom: 'Your name / anything else' },
        type: 'text',
        optional: true
      }
    ],
    after_completion: {
      type: 'hosted_confirmation',
      hosted_confirmation: { custom_message: 'Thank you — your payment has been received. A receipt has been emailed to you.' }
    }
  }, { idempotencyKey: 'advisory-fees:link:v1' });

  console.log('Product:      ', product.id);
  console.log('Price:        ', price.id, '(custom amount, min $10)');
  console.log('Payment Link: ', link.url);
  console.log('Live mode:    ', link.livemode);
  console.log('\nPaste this URL into the PAYMENT_LINK_URL placeholder in scripts/advisory-pay-button.html');
}

main().catch((e) => { console.error(e.message); process.exit(1); });
