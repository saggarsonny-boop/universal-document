const { PrismaClient } = require('@prisma/client');
const Stripe = require('stripe');
const path = require('path');
const crypto = require('crypto');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();
const stripeKey = process.env.STRIPE_SECRET_KEY;

if (!stripeKey) {
  console.error('Error: STRIPE_SECRET_KEY is missing from environment variables.');
  process.exit(1);
}

const stripe = new Stripe(stripeKey);

const productsData = [
  {
    slug: 'pre-sentencing-personal-history-worksheet',
    title: 'Pre-Sentencing Personal History Worksheet',
    short_description: 'Help your lawyer tell the court who you are, not just what you did. A worksheet to gather your mitigation before sentencing.',
    long_description: 'Gather and organize your personal history, family background, character letters, and mitigating evidence before your lawyer starts drafting the sentencing memorandum.',
    source_tag: 'road',
    buyer_tag: 'defendant',
    format: 'pdf',
    price_cents: 1900,
    status: 'live',
    version: '1.0',
    search_keywords: 'sentencing mitigation history checklist lawyer personal background family federal state',
    is_bundle: false,
    brand: 'the_road'
  },
  {
    slug: 'questions-before-you-hire-a-defense-attorney',
    title: 'Questions To Ask Before You Hire a Defense Attorney',
    short_description: 'The right questions to bring to every attorney consultation, before you sign anything or pay a retainer.',
    long_description: 'A direct qualification framework of critical questions regarding fee structures, trial experience, jurisdiction familiarity, communication schedules, and OIG/exclusion strategy.',
    source_tag: 'road',
    buyer_tag: 'defendant',
    format: 'pdf',
    price_cents: 900,
    status: 'live',
    version: '1.0',
    search_keywords: 'attorney hiring interview questions fee structure defense lawyer selection retainer contract',
    is_bundle: false,
    brand: 'the_road'
  },
  {
    slug: 'first-72-hours-after-arrest',
    title: 'The First 72 Hours After Arrest',
    short_description: 'What to do, in order, in the first three days after someone you love is arrested.',
    long_description: 'A critical checklist for families when a loved one is in custody. Covers locating the defendant, managing communication, legal representation, bail mechanics, and navigating the immediate administrative shockwaves.',
    source_tag: 'road',
    buyer_tag: 'family',
    format: 'pdf',
    price_cents: 1400,
    status: 'live',
    version: '1.0',
    search_keywords: 'arrest jail bail custody family emergency checklist location booking holding cell first days',
    is_bundle: false,
    brand: 'the_road'
  },
  {
    slug: 'supervision-probation-compliance-tracker',
    title: 'Supervision & Probation Compliance Tracker',
    short_description: 'A simple system for meeting every condition of supervision and keeping proof that you did.',
    long_description: 'Track court-ordered conditions, probation officer meetings, community service hours, drug testing, and travel requests in one verifiable document.',
    source_tag: 'ssrn',
    buyer_tag: 'defendant',
    format: 'pdf',
    price_cents: 1900,
    status: 'live',
    version: '1.0',
    search_keywords: 'supervised release probation parole officer travel requests drug testing compliance log requirements tracker',
    is_bundle: false,
    brand: 'the_road'
  },
  {
    slug: 'restitution-court-fee-payment-tracker',
    title: 'Restitution & Court-Fee Payment Tracker',
    short_description: 'Track every restitution and court-fee payment, receipt, and balance in one place.',
    long_description: 'Organize your court-mandated financial obligations. Track restitution payments, special assessments, and court costs. Maintain clear receipts and transaction records to demonstrate good-faith compliance to your supervision officer.',
    source_tag: 'road',
    buyer_tag: 'defendant',
    format: 'pdf',
    price_cents: 900,
    status: 'live',
    version: '1.0',
    search_keywords: 'restitution court fees financial assessment payment log special assessment fines clerk of court',
    is_bundle: false,
    brand: 'the_road'
  },
  {
    slug: 'what-to-expect-at-sentencing',
    title: 'What To Expect at Sentencing',
    short_description: 'A calm walkthrough of the sentencing day, so nothing catches you off guard.',
    long_description: 'A reassuring, procedural walkthrough of your sentencing day. Understand courtroom layout, the order of statements (prosecutor, defense, defendant elocution, judge), and the transition into custody or supervised release.',
    source_tag: 'road',
    buyer_tag: 'defendant',
    format: 'pdf',
    price_cents: 1400,
    status: 'live',
    version: '1.0',
    search_keywords: 'sentencing courtroom allocution judge plea agreement hearing guidelines walkthrough schedule',
    is_bundle: false,
    brand: 'the_road'
  },
  {
    slug: 'halfway-house-reentry-readiness-kit',
    title: 'Halfway House & Reentry Readiness Kit',
    short_description: 'A practical checklist for the weeks around coming home from custody.',
    long_description: 'Navigate the transition from custody to a halfway house, secure home confinement approvals, manage job search protocols, and organize case manager check-ins effectively.',
    source_tag: 'ssrn',
    buyer_tag: 'case_manager',
    format: 'pdf',
    price_cents: 2900,
    status: 'live',
    version: '1.0',
    search_keywords: 'reentry halfway house RRC home confinement job placement case manager transition blueprint integration',
    is_bundle: false,
    brand: 'the_road'
  },
  {
    slug: 'talking-to-your-kids-about-your-case',
    title: 'Talking To Your Kids About Your Case',
    short_description: 'Honest, age-appropriate words for telling your children about your case.',
    long_description: 'An emotionally resonant guide offering age-appropriate scripts, boundaries, and communication frameworks to explain legal proceedings and potential incarceration to children. Authored from lived experience.',
    source_tag: 'road',
    buyer_tag: 'defendant',
    format: 'pdf',
    price_cents: 1400,
    status: 'live',
    version: '1.0',
    search_keywords: 'children parenting family counseling talking points script case disclosure explanation incarceration',
    is_bundle: false,
    brand: 'the_road'
  },
  {
    slug: 'how-to-read-a-charging-document',
    title: 'How To Read a Charging Document',
    short_description: 'Understand your indictment or complaint in plain language, part by part.',
    long_description: 'Demystify charging documents. Learn to map out specific counts, identify statutory maximums/minimums, analyze overt acts in conspiracy charges, and decipher criminal forfeiture tables.',
    source_tag: 'busted',
    buyer_tag: 'defendant',
    format: 'pdf',
    price_cents: 1900,
    status: 'live',
    version: '1.0',
    search_keywords: 'indictment charges conspiracy counts criminal complaint discovery forfeiture grand jury prosecution information',
    is_bundle: false,
    brand: 'the_road'
  },
  {
    slug: 'court-date-deadline-tracker',
    title: 'Court Date & Deadline Tracker',
    short_description: 'Keep every court date and filing deadline in one place. Missing one is one of the worst things that can happen.',
    long_description: 'Never miss a procedural filing or appearance. Log arraignments, status conferences, motion deadlines, discovery responses, and pre-sentencing report review cycles.',
    source_tag: 'road',
    buyer_tag: 'defendant',
    format: 'pdf',
    price_cents: 900,
    status: 'live',
    version: '1.0',
    search_keywords: 'calendar deadline motions discovery arraignment status conference appearance court schedule tracker',
    is_bundle: false,
    brand: 'the_road'
  },

  // Other clinical templates (draft)
  {
    slug: 'physician-guide-healthcare-fraud-indictment',
    title: "Physician's Guide To Reviewing a Healthcare Fraud Indictment",
    short_description: 'Clinical review guidelines for defense attorneys analyzing medical fraud, billing, and kickback allegations.',
    long_description: 'Written for defense counsel by a physician-scholar. Methodologies to cross-reference billing codes (CPT/HCPCS), review OIG data, evaluate medical records, and isolate the clinical justifications that refute intent.',
    source_tag: 'ssrn',
    buyer_tag: 'defense_attorney',
    format: 'pdf',
    price_cents: 19900,
    status: 'draft',
    version: '1.0',
    search_keywords: 'healthcare fraud medicare audit billing compliance cpt codes medical review defense attorney cigna blue cross',
    is_bundle: false,
    brand: 'clinical'
  },
  {
    slug: 'clinical-plausibility-checklist',
    title: 'Clinical Plausibility Checklist for Medical Necessity Defenses',
    short_description: 'Framework to assess medical record charts and challenge the government\'s billing audit conclusions.',
    long_description: 'Establish robust standard-of-care defenses. Run medical charts through a structured plausibility matrix to challenge the validity of government audits and establish medical necessity thresholds in civil and criminal litigation.',
    source_tag: 'ssrn',
    buyer_tag: 'defense_attorney',
    format: 'pdf',
    price_cents: 14900,
    status: 'draft',
    version: '1.0',
    search_keywords: 'medical necessity audit chart review clinical criteria standards of care defense motion expert witness',
    is_bundle: false,
    brand: 'clinical'
  }
];

const bundleData = [
  {
    slug: 'road-companion-toolkit',
    title: 'The Road Companion Toolkit',
    short_description: 'Six essential Road workbooks for the early stages of a case, bundled. Sold singly they total $84.',
    long_description: 'The ultimate action toolkit for navigating the federal or state criminal justice system. Bundles the Pre-Sentencing Personal History Worksheet, Questions To Ask Before You Hire a Defense Attorney, The First 72 Hours, Supervised Release Compliance Tracker, Restitution and Court-Fee Tracker, and What to Expect at Sentencing Walkthrough at a highly discounted price.',
    source_tag: 'road',
    buyer_tag: 'defendant',
    format: 'pdf',
    price_cents: 4900,
    status: 'live',
    version: '1.0',
    search_keywords: 'bundle toolkit road mitigation defense sentencing supervision checklist prep tracker family',
    is_bundle: true,
    bundle_items: JSON.stringify([
      'pre-sentencing-personal-history-worksheet',
      'questions-before-you-hire-a-defense-attorney',
      'first-72-hours-after-arrest',
      'supervision-probation-compliance-tracker',
      'restitution-court-fee-payment-tracker',
      'what-to-expect-at-sentencing'
    ]),
    brand: 'the_road'
  }
];

async function main() {
  console.log('Seeding products and bundles with Stripe integration...');

  const allItems = [...productsData, ...bundleData];

  for (const item of allItems) {
    try {
      // 1. Check if product already exists in DB
      let existingProduct = await prisma.product.findUnique({
        where: { slug: item.slug }
      });

      let stripeProductId = existingProduct?.stripe_product_id;
      let stripePriceId = existingProduct?.stripe_price_id;

      // 2. Stripe integration (Idempotent creation using API)
      if (!stripeProductId || !stripePriceId) {
        console.log(`Creating Stripe product/price for slug: ${item.slug}...`);

        const stripeProducts = await stripe.products.list({ limit: 100 });
        const existingStripeProduct = stripeProducts.data.find(
          p => p.metadata.slug === item.slug && p.metadata.version === item.version
        );

        if (existingStripeProduct) {
          stripeProductId = existingStripeProduct.id;
          stripePriceId = existingStripeProduct.default_price;
          console.log(`Reusing existing Stripe product (${stripeProductId}) and price (${stripePriceId})`);
        } else {
          // Create product in Stripe with idempotency key
          const idempotencyKey = `${item.slug}:v1`;
          const stripeProduct = await stripe.products.create({
            name: item.title,
            description: item.short_description,
            metadata: {
              slug: item.slug,
              version: item.version,
              isBundle: item.is_bundle ? 'true' : 'false'
            }
          }, { idempotencyKey });

          stripeProductId = stripeProduct.id;

          // Create price in Stripe
          const stripePrice = await stripe.prices.create({
            product: stripeProductId,
            unit_amount: item.price_cents,
            currency: 'usd',
            metadata: {
              slug: item.slug,
              version: item.version
            }
          }, { idempotencyKey: `${idempotencyKey}:price` });

          stripePriceId = stripePrice.id;

          // Update default_price on product
          await stripe.products.update(stripeProductId, {
            default_price: stripePriceId
          });

          console.log(`Created Stripe Product ID: ${stripeProductId}, Price ID: ${stripePriceId}`);
        }
      }

      // 3. Upsert product in DB (casing mapped to Neon columns)
      const dataToSave = {
        title: item.title,
        short_description: item.short_description,
        long_description: item.long_description,
        source_tag: item.source_tag,
        buyer_tag: item.buyer_tag,
        format: item.format,
        stripe_product_id: stripeProductId,
        stripe_price_id: stripePriceId,
        price_cents: item.price_cents,
        currency: 'usd',
        status: item.status,
        version: item.version,
        search_keywords: item.search_keywords,
        is_bundle: item.is_bundle,
        bundle_items: item.bundle_items || null,
        brand: item.brand
      };

      const finalId = existingProduct?.id || crypto.randomUUID();

      await prisma.product.upsert({
        where: { slug: item.slug },
        update: dataToSave,
        create: {
          id: finalId,
          slug: item.slug,
          ...dataToSave
        }
      });

      console.log(`Successfully synced database row for: ${item.slug}`);
    } catch (error) {
      console.error(`Failed to sync product "${item.slug}":`, error.message);
    }
  }

  console.log('Database seeding & Stripe synchronization finished successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
