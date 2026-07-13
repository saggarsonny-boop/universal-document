const { PrismaClient } = require('@prisma/client');
const Stripe = require('stripe');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();
const stripeKey = process.env.STRIPE_SECRET_KEY;

if (!stripeKey) {
  console.error('Error: STRIPE_SECRET_KEY is missing from environment variables.');
  process.exit(1);
}

const stripe = new Stripe(stripeKey);

const productsData = [
  // Defendant-facing (live)
  {
    slug: 'pre-sentencing-worksheet',
    title: 'Pre-Sentencing Personal History Worksheet',
    shortDescription: 'Helps defendants and their families assemble crucial mitigation material for their defense attorney before sentencing.',
    longDescription: 'Assemble structured personal history, character reference sources, family background, and lived-experience mitigation evidence before your lawyer starts drafting the sentencing memorandum. Formatted as an action-oriented fillable PDF.',
    sourceTag: 'road',
    buyerTag: 'defendant',
    format: 'pdf',
    priceCents: 1900,
    status: 'live',
    version: '1.0',
    searchKeywords: 'sentencing mitigation history checklist lawyer personal background family federal state',
    isBundle: false
  },
  {
    slug: 'questions-to-ask-attorney',
    title: 'Questions To Ask Before You Hire a Criminal Defense Attorney',
    shortDescription: 'Free checklist to qualify and interview criminal defense lawyers, ensuring you hire the right fit for your case.',
    longDescription: 'A direct qualification framework of critical questions regarding fee structures, trial experience, jurisdiction familiarity, communication schedules, and OIG/exclusion strategy. Perfect lead magnet to navigate the initial panic.',
    sourceTag: 'road',
    buyerTag: 'defendant',
    format: 'pdf',
    priceCents: 900, // or free in UI
    status: 'live',
    version: '1.0',
    searchKeywords: 'attorney hiring interview questions fee structure defense lawyer selection retainer contract',
    isBundle: false
  },
  {
    slug: 'collateral-consequences-checklist',
    title: 'Collateral Consequences Checklist',
    shortDescription: 'Detailed checklist mapping post-conviction consequences across licensing, housing, employment, voting, and firearms.',
    longDescription: 'Derived from legal scholarship on the automaticity of civil disabilities, this decoder translates law review research into a plain-language checklist by category: licensing, housing, employment, voting, firearms, and immigration.',
    sourceTag: 'ssrn',
    buyerTag: 'defendant',
    format: 'pdf',
    priceCents: 2900,
    status: 'live',
    version: '1.0',
    searchKeywords: 'collateral consequences felony record civil rights voting firearms licensing housing employment civil disability',
    isBundle: false
  },
  {
    slug: 'first-72-hours-arrest',
    title: 'The First 72 Hours After Arrest',
    shortDescription: 'A tactical emergency guide for families immediately following a defendant\'s arrest.',
    longDescription: 'A critical checklist for families when a loved one is in custody. Covers locating the defendant, managing communication, legal representation, bail mechanics, and navigating the immediate administrative shockwaves.',
    sourceTag: 'road',
    buyerTag: 'family',
    format: 'pdf',
    priceCents: 1400,
    status: 'live',
    version: '1.0',
    searchKeywords: 'arrest jail bail custody family emergency checklist location booking holding cell first days',
    isBundle: false
  },
  {
    slug: 'supervision-compliance-tracker',
    title: 'Supervised Release & Probation Compliance Tracker',
    shortDescription: 'Actionable tracking template to monitor requirements, travel requests, and reporting compliance on supervision.',
    longDescription: 'Lived experience combined with supervised release reform scholarship. Track court-ordered conditions, probation officer meetings, community service hours, drug testing, and travel requests in one verifiable document.',
    sourceTag: 'ssrn',
    buyerTag: 'defendant',
    format: 'pdf',
    priceCents: 1900,
    status: 'live',
    version: '1.0',
    searchKeywords: 'supervised release probation parole officer travel requests drug testing compliance log requirements tracker',
    isBundle: false
  },
  {
    slug: 'restitution-payment-tracker',
    title: 'Restitution and Court-Fee Payment Tracker',
    shortDescription: 'Log book to record, calculate, and verify financial obligations, payments, and remaining balances.',
    longDescription: 'Organize your court-mandated financial obligations. Track restitution payments, special assessments, and court costs. Maintain clear receipts and transaction records to demonstrate good-faith compliance to your supervision officer.',
    sourceTag: 'road',
    buyerTag: 'defendant',
    format: 'pdf',
    priceCents: 900,
    status: 'live',
    version: '1.0',
    searchKeywords: 'restitution court fees financial assessment payment log special assessment fines clerk of court',
    isBundle: false
  },
  {
    slug: 'sentencing-walkthrough',
    title: 'What To Expect at Sentencing Walkthrough',
    shortDescription: 'Checklist and walkthrough of the sentencing hearing sequence, courtroom layout, and process.',
    longDescription: 'A reassuring, procedural walkthrough of your sentencing day. Understand courtroom layout, the order of statements (prosecutor, defense, defendant elocution, judge), and the transition into custody or supervised release.',
    sourceTag: 'road',
    buyerTag: 'defendant',
    format: 'pdf',
    priceCents: 1400,
    status: 'live',
    version: '1.0',
    searchKeywords: 'sentencing courtroom allocution judge plea agreement hearing guidelines walkthrough schedule',
    isBundle: false
  },
  {
    slug: 'self-surrender-bop-prep',
    title: 'Self-Surrender and Bureau of Prisons Prep Checklist',
    shortDescription: 'Preparation checklist covering medical records, banking, communication accounts, and immediate custody arrival.',
    longDescription: 'A direct, lived-experience checklist for self-surrender to federal custody. Prepare medical history, coordinate the trust fund account, set up email/phone access lists, and know what to pack and expect on day one.',
    sourceTag: 'road', // lived
    buyerTag: 'defendant',
    format: 'pdf',
    priceCents: 1900,
    status: 'live',
    version: '1.0',
    searchKeywords: 'self surrender bop prison trust fund commissary phone list packing list federal custody inmate registry',
    isBundle: false
  },
  {
    slug: 'halfway-house-reentry-kit',
    title: 'Halfway House & Reentry Readiness Kit',
    shortDescription: 'Blueprints for navigating residential reentry centers (RRC), home confinement, and job acquisition.',
    longDescription: 'A human, detailed reentry blueprint. Navigate the transition from custody to a halfway house, secure home confinement approvals, manage job search protocols, and organize case manager check-ins effectively.',
    sourceTag: 'ssrn', // lived + ssrn
    buyerTag: 'defendant',
    format: 'pdf',
    priceCents: 2900,
    status: 'live',
    version: '1.0',
    searchKeywords: 'reentry halfway house RRC home confinement job placement case manager transition blueprint integration',
    isBundle: false
  },
  {
    slug: 'talking-to-kids-case',
    title: 'Talking To Your Kids About Your Case',
    shortDescription: 'Age-appropriate communication frameworks and conversation scripts for defendant parents.',
    longDescription: 'An emotionally resonant guide offering age-appropriate scripts, boundaries, and communication frameworks to explain legal proceedings and potential incarceration to children. Authored from lived experience.',
    sourceTag: 'road',
    buyerTag: 'family', // defendant-parent
    format: 'pdf',
    priceCents: 1400,
    status: 'live',
    version: '1.0',
    searchKeywords: 'children parenting family counseling talking points script case disclosure explanation incarceration',
    isBundle: false
  },
  {
    slug: 'family-communication-plan',
    title: 'Family Communication Plan During Incarceration',
    shortDescription: 'Coordinating schedules, budgets, visitation guidelines, and phone accounts during custody.',
    longDescription: 'A practical logistics coordinator for families. Organize CorrLinks/TRULINCS budgets, visitation application procedures, telephone schedules, photo ticket purchasing, and emergency contact lists.',
    sourceTag: 'road',
    buyerTag: 'family',
    format: 'pdf',
    priceCents: 1200,
    status: 'live',
    version: '1.0',
    searchKeywords: 'family contact telephone corrlinks trulincs commissary budget visitation application mail guidelines',
    isBundle: false
  },
  {
    slug: 'how-to-read-indictment',
    title: 'How To Read a Charging Document / Indictment',
    shortDescription: 'A plain-language decoder template mapping allegations, counts, statutes, and forfeiture provisions.',
    longDescription: 'Demystify charging documents. Learn to map out specific counts, identify statutory maximums/minimums, analyze overt acts in conspiracy charges, and decipher criminal forfeiture tables. Plain language, annotated examples.',
    sourceTag: 'busted', // busted + ssrn
    buyerTag: 'defendant',
    format: 'pdf',
    priceCents: 1900,
    status: 'live',
    version: '1.0',
    searchKeywords: 'indictment charges conspiracy counts criminal complaint discovery forfeiture grand jury prosecution information',
    isBundle: false
  },
  {
    slug: 'court-date-deadline-tracker',
    title: 'Court Date and Deadline Tracker',
    shortDescription: 'A visual case-management calendar tracker designed specifically for criminal procedure stages.',
    longDescription: 'Never miss a procedural filing or appearance. Log arraignments, status conferences, motion deadlines, discovery responses, and pre-sentencing report review cycles. Tailored specifically for criminal defense calendars.',
    sourceTag: 'busted',
    buyerTag: 'defendant',
    format: 'pdf',
    priceCents: 900,
    status: 'live',
    version: '1.0',
    searchKeywords: 'calendar deadline motions discovery arraignment status conference appearance court schedule tracker',
    isBundle: false
  },

  // Attorney-facing (draft until finalized)
  {
    slug: 'physician-guide-healthcare-fraud-indictment',
    title: 'Physician\'s Guide To Reviewing a Healthcare Fraud Indictment',
    shortDescription: 'Clinical review guidelines for defense attorneys analyzing medical fraud, billing, and kickback allegations.',
    longDescription: 'Written for defense counsel by a physician-scholar. Methodologies to cross-reference billing codes (CPT/HCPCS), review OIG data, evaluate medical records, and isolate the clinical justifications that refute intent.',
    sourceTag: 'ssrn', // ssrn + clinical
    buyerTag: 'defense_attorney',
    format: 'pdf',
    priceCents: 19900,
    status: 'draft',
    version: '1.0',
    searchKeywords: 'healthcare fraud medicare audit billing compliance cpt codes medical review defense attorney cigna blue cross',
    isBundle: false
  },
  {
    slug: 'clinical-plausibility-checklist',
    title: 'Clinical Plausibility Checklist for Medical Necessity Defenses',
    shortDescription: 'Framework to assess medical record charts and challenge the government\'s billing audit conclusions.',
    longDescription: 'Establish robust standard-of-care defenses. Run medical charts through a structured plausibility matrix to challenge the validity of government audits and establish medical necessity thresholds in civil and criminal litigation.',
    sourceTag: 'ssrn', // ssrn + clinical
    buyerTag: 'defense_attorney',
    format: 'pdf',
    priceCents: 14900,
    status: 'draft',
    version: '1.0',
    searchKeywords: 'medical necessity audit chart review clinical criteria standards of care defense motion expert witness',
    isBundle: false
  },
  {
    slug: 'physician-expert-declaration-template',
    title: 'Physician Expert Declaration Template / Framework',
    shortDescription: 'A structured, physician-authored framework for standard-of-care and billing-necessity declarations.',
    longDescription: 'Draft highly persuasive physician declarations. A complete framework mapping qualifications, record review methodology, clinical analysis, statutory definitions, and final professional opinions for litigation.',
    sourceTag: 'er_clinical',
    buyerTag: 'defense_attorney', // or plaintiff_attorney
    format: 'pdf',
    priceCents: 9900,
    status: 'draft',
    version: '1.0',
    searchKeywords: 'expert witness declaration affidavit medical report litigation exhibit standard of care billing necessity',
    isBundle: false
  },
  {
    slug: 'medical-record-review-request',
    title: 'Medical Record Review Request Framework',
    shortDescription: 'Structured guidelines and intake sheets for litigation attorneys preparing records for expert physician review.',
    longDescription: 'Prepare medical files cleanly for expert review. Streamline litigation preparation with checklists for chronologies, imaging, labs, billing audits, and targeted questions that optimize the expert\'s billable review hours.',
    sourceTag: 'er_clinical',
    buyerTag: 'plaintiff_attorney', // or defense
    format: 'pdf',
    priceCents: 9900,
    status: 'draft',
    version: '1.0',
    searchKeywords: 'record review request medical chronology litigation intake personal injury malpractice expert analysis',
    isBundle: false
  },
  {
    slug: 'credentialing-board-action-defense',
    title: 'Credentialing and Board-Action Defense Primer',
    shortDescription: 'Digital handbook detailing strategies for physicians defending licensing and credentialing board challenges.',
    longDescription: 'A critical guide for doctors facing certification, hospital credentialing, or state medical board actions. Covers rights during investigations, administrative appeals, and active certification litigation.',
    sourceTag: 'ssrn',
    buyerTag: 'physician',
    format: 'pdf',
    priceCents: 14900,
    status: 'draft',
    version: '1.0',
    searchKeywords: 'licensing board credentialing abim state medical board certification hospital privileges peer review defense',
    isBundle: false
  },

  // Officer / system-facing (draft)
  {
    slug: 'reentry-resource-case-managers',
    title: 'Reentry Resource Checklist for Case Managers',
    shortDescription: 'Systematic client-intake checklist and resource-mapping guide for reentry specialists and nonprofit organizations.',
    longDescription: 'Equip reentry professionals with a systematic intake checklist. Standardize documentation for housing placement, government benefits, employment sourcing, ID acquisition, and healthcare continuity.',
    sourceTag: 'ssrn', // ssrn + lived
    buyerTag: 'case_manager',
    format: 'pdf',
    priceCents: 4900,
    status: 'draft',
    version: '1.0',
    searchKeywords: 'case manager reentry nonprofit housing placement social services intake form client assessment',
    isBundle: false
  },
  {
    slug: 'supervision-officer-quick-reference',
    title: 'Supervision Officer\'s Quick-Reference: Collateral Consequences',
    shortDescription: 'Quick reference chart for probation and pretrial officers outlining automatic restrictions on parolees.',
    longDescription: 'A quick-reference guide helping probation, pretrial, and parole officers understand overlapping state and federal collateral consequences to assist clients in avoiding technical violations and securing employment.',
    sourceTag: 'ssrn',
    buyerTag: 'probation_officer',
    format: 'pdf',
    priceCents: 3900,
    status: 'draft',
    version: '1.0',
    searchKeywords: 'probation officer parole officer pretrial release supervision checklist collateral consequences guide',
    isBundle: false
  },

  // Physician-career-facing (draft)
  {
    slug: 'non-clinical-pivot-guide',
    title: 'Non-Clinical Pivot Guide for Physicians With Licensing Issues',
    shortDescription: 'Career pivot handbook outlining non-clinical roles (writing, consulting, reviews) for restricted clinicians.',
    longDescription: 'Step-by-step career transition handbook for doctors facing licensing restrictions, board issues, or OIG exclusions. Map out high-yield non-clinical paths: medical writing, corporate consulting, and record reviews.',
    sourceTag: 'physician_career',
    buyerTag: 'physician',
    format: 'pdf',
    priceCents: 7900,
    status: 'draft',
    version: '1.0',
    searchKeywords: 'career pivot non clinical consulting medical writing record review transition advisory coaching',
    isBundle: false
  },
  {
    slug: 'physician-guide-oig-exclusion',
    title: 'Physician\'s Guide To Understanding an OIG Exclusion',
    shortDescription: 'Handbook outlining the legal scope, restrictions, and appeal processes of HHS OIG program exclusions.',
    longDescription: 'Navigate the complex reality of an OIG exclusion. Learn what activities are prohibited, how exclusions affect employment, steps for administrative appeals (DAB), and the pathway toward eventual reinstatement.',
    sourceTag: 'ssrn',
    buyerTag: 'physician',
    format: 'pdf',
    priceCents: 9900,
    status: 'draft',
    version: '1.0',
    searchKeywords: 'oig exclusion hhs exclusion debarment reinstatement administrative appeal certification medicare ban',
    isBundle: false
  }
];

const bundleData = [
  {
    slug: 'road-companion-toolkit',
    title: 'The Road Companion Toolkit',
    shortDescription: 'The comprehensive defendant toolkit combining 6 essential mitigation, tracking, and preparation guides.',
    longDescription: 'The ultimate action toolkit for navigating the federal or state criminal justice system. Bundles the Pre-Sentencing Personal History Worksheet, Questions to Ask a Criminal Defense Attorney, The First 72 Hours, Supervised Release Compliance Tracker, Restitution and Court-Fee Tracker, and What to Expect at Sentencing Walkthrough at a highly discounted price.',
    sourceTag: 'road',
    buyerTag: 'defendant',
    format: 'pdf',
    priceCents: 4900,
    status: 'live',
    version: '1.0',
    searchKeywords: 'bundle toolkit road mitigation defense sentencing supervision checklist prep tracker family',
    isBundle: true,
    bundleItems: JSON.stringify([
      'pre-sentencing-worksheet',
      'questions-to-ask-attorney',
      'first-72-hours-arrest',
      'supervision-compliance-tracker',
      'restitution-payment-tracker',
      'sentencing-walkthrough'
    ])
  }
];

async function main() {
  console.log('Seeding products and bundles with Stripe integration...');

  // Merge products and bundles for processing
  const allItems = [...productsData, ...bundleData];

  for (const item of allItems) {
    try {
      // 1. Check if product already exists in DB
      let existingProduct = await prisma.product.findUnique({
        where: { slug: item.slug }
      });

      let stripeProductId = existingProduct?.stripeProductId;
      let stripePriceId = existingProduct?.stripePriceId;

      // 2. Stripe integration (Live Mode based on your keys)
      if (!stripeProductId || !stripePriceId) {
        console.log(`Creating Stripe product/price for slug: ${item.slug}...`);

        // Check if Stripe product already exists by name/slug metadata to ensure idempotency
        const stripeProducts = await stripe.products.list({ limit: 100 });
        const existingStripeProduct = stripeProducts.data.find(
          p => p.metadata.slug === item.slug && p.metadata.version === item.version
        );

        if (existingStripeProduct) {
          stripeProductId = existingStripeProduct.id;
          stripePriceId = existingStripeProduct.default_price;
          console.log(`Reusing existing Stripe product (${stripeProductId}) and price (${stripePriceId})`);
        } else {
          // Create product in Stripe
          const stripeProduct = await stripe.products.create({
            name: item.title,
            description: item.shortDescription,
            metadata: {
              slug: item.slug,
              version: item.version,
              isBundle: item.isBundle ? 'true' : 'false'
            }
          });
          stripeProductId = stripeProduct.id;

          // Create price in Stripe
          const stripePrice = await stripe.prices.create({
            product: stripeProductId,
            unit_amount: item.priceCents,
            currency: item.currency || 'usd',
            metadata: {
              slug: item.slug,
              version: item.version
            }
          });
          stripePriceId = stripePrice.id;

          // Update default_price on product
          await stripe.products.update(stripeProductId, {
            default_price: stripePriceId
          });

          console.log(`Created Stripe Product ID: ${stripeProductId}, Price ID: ${stripePriceId}`);
        }
      }

      // 3. Upsert product in DB
      const dataToSave = {
        title: item.title,
        shortDescription: item.shortDescription,
        longDescription: item.longDescription,
        sourceTag: item.sourceTag,
        buyerTag: item.buyerTag,
        format: item.format,
        stripeProductId: stripeProductId,
        stripePriceId: stripePriceId,
        priceCents: item.priceCents,
        currency: item.currency || 'usd',
        status: item.status,
        version: item.version,
        searchKeywords: item.searchKeywords,
        isBundle: item.isBundle,
        bundleItems: item.bundleItems || null
      };

      await prisma.product.upsert({
        where: { slug: item.slug },
        update: dataToSave,
        create: {
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
