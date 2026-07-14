const { PrismaClient } = require('@prisma/client');
const Stripe = require('stripe');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();
const stripeKey = process.env.STRIPE_SECRET_KEY;
const REPORT_ONLY = process.argv.includes('--report');

if (!stripeKey) {
  console.error('Error: STRIPE_SECRET_KEY is missing from environment variables.');
  process.exit(1);
}

const stripe = new Stripe(stripeKey);

const MASTERS_DIR = path.resolve(__dirname, '../private-templates');
// A real 2-page workbook master is ~78-112KB; anything under this is a placeholder.
const MIN_MASTER_BYTES = 20000;

// Journey-stage sections. The UI derives its section order/labels from these
// same slugs via src/data/storeSections.ts — keep the two in sync.
const CAT = {
  JUST_ARRESTED: 'just-arrested',
  FACING_CHARGES: 'facing-charges',
  BEFORE_SENTENCING: 'before-sentencing',
  SENTENCING_SURRENDER: 'sentencing-surrender',
  ON_SUPERVISION: 'on-supervision',
  MONEY_FAMILY: 'money-family',
  AFTER_THE_CASE: 'after-the-case',
  PROFESSIONALS: 'professionals',
  BUNDLES: 'bundles'
};

const productsData = [
  // --- 1-10: original Road singles ---
  {
    slug: 'pre-sentencing-personal-history-worksheet',
    title: 'Pre-Sentencing Personal History Worksheet',
    short_description: 'Help your lawyer tell the court who you are, not just what you did. A worksheet to gather your mitigation before sentencing.',
    long_description: 'Gather and organize your personal history, family background, character letters, and mitigating evidence before your lawyer starts drafting the sentencing memorandum.',
    source_tag: 'road',
    buyer_tag: 'defendant',
    category: CAT.BEFORE_SENTENCING,
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
    category: CAT.FACING_CHARGES,
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
    category: CAT.JUST_ARRESTED,
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
    category: CAT.ON_SUPERVISION,
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
    category: CAT.ON_SUPERVISION,
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
    category: CAT.SENTENCING_SURRENDER,
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
    category: CAT.ON_SUPERVISION,
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
    source_tag: 'sesame',
    buyer_tag: 'defendant',
    category: CAT.MONEY_FAMILY,
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
    category: CAT.FACING_CHARGES,
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
    category: CAT.FACING_CHARGES,
    format: 'pdf',
    price_cents: 900,
    status: 'live',
    version: '1.0',
    search_keywords: 'calendar deadline motions discovery arraignment status conference appearance court schedule tracker',
    is_bundle: false,
    brand: 'the_road'
  },

  // --- 11-17: remaining Road singles ---
  {
    slug: 'self-surrender-prison-prep-checklist',
    title: 'Self-Surrender & Prison Prep Checklist',
    short_description: 'Everything to handle before you report: paperwork, property, family logistics, and what to expect on day one.',
    long_description: 'A step-by-step preparation checklist for the weeks before a self-surrender date. Covers designation logistics, medical and prescription documentation, allowable property, financial and legal housekeeping, family communication plans, and the intake process itself.',
    source_tag: 'road',
    buyer_tag: 'defendant',
    category: CAT.SENTENCING_SURRENDER,
    format: 'pdf',
    price_cents: 1900,
    status: 'live',
    version: '1.0',
    search_keywords: 'self surrender report date prison prep BOP designation intake checklist property medical family plan',
    is_bundle: false,
    brand: 'the_road'
  },
  {
    slug: 'collateral-consequences-checklist',
    title: 'Collateral Consequences Checklist',
    short_description: 'The consequences nobody lists for you — licensing, housing, benefits, voting, firearms — in one structured checklist.',
    long_description: 'A structured inventory of the civil and professional consequences that can follow a conviction: occupational licensing, public benefits, housing eligibility, immigration exposure, voting rights, firearm rights, and more. Know what applies before you make plea decisions, not after.',
    source_tag: 'niccc',
    buyer_tag: 'defendant',
    category: CAT.FACING_CHARGES,
    format: 'pdf',
    price_cents: 2900,
    status: 'live',
    version: '1.0',
    search_keywords: 'collateral consequences license professional housing benefits voting firearm immigration plea checklist NICCC',
    is_bundle: false,
    brand: 'the_road'
  },
  {
    slug: 'bail-and-bond-explained',
    title: 'Bail & Bond Explained',
    short_description: 'How bail actually works — cash, surety, property, conditions — explained for the family posting it.',
    long_description: 'A plain-language guide to the bail system for families: bail hearings, cash versus surety versus property bonds, bondsman fees and collateral, release conditions, and what happens to the money at the end of the case.',
    source_tag: 'road',
    buyer_tag: 'family',
    category: CAT.JUST_ARRESTED,
    format: 'pdf',
    price_cents: 1400,
    status: 'live',
    version: '1.0',
    search_keywords: 'bail bond bondsman surety cash property release conditions hearing collateral family explained',
    is_bundle: false,
    brand: 'the_road'
  },
  {
    slug: 'plea-vs-trial-decision-worksheet',
    title: 'Plea vs Trial Decision Worksheet',
    short_description: 'A structured worksheet for the hardest decision in a criminal case, built to organize the conversation with your lawyer.',
    long_description: 'Organize the plea-versus-trial decision on paper: charge exposure, evidence strengths and weaknesses, sentencing guideline scenarios, cooperation considerations, appellate waiver terms, and the questions to press your attorney on before deciding.',
    source_tag: 'road',
    buyer_tag: 'defendant',
    category: CAT.FACING_CHARGES,
    format: 'pdf',
    price_cents: 1900,
    status: 'live',
    version: '1.0',
    search_keywords: 'plea agreement trial decision worksheet guidelines exposure evidence cooperation waiver attorney questions',
    is_bundle: false,
    brand: 'the_road'
  },
  {
    slug: 'writing-to-the-judge-character-letter-guide',
    title: 'Writing to the Judge: Character Letter Guide',
    short_description: 'How family and friends write character letters judges actually read — structure, tone, and what to leave out.',
    long_description: 'A practical guide for the people writing on a defendant\'s behalf: who should write, what a sentencing judge looks for, letter structure, specific detail versus empty praise, tone pitfalls, and formatting and submission logistics through defense counsel.',
    source_tag: 'road',
    buyer_tag: 'family',
    category: CAT.BEFORE_SENTENCING,
    format: 'pdf',
    price_cents: 1400,
    status: 'live',
    version: '1.0',
    search_keywords: 'character letter judge sentencing reference family friends guide structure tone submission mitigation',
    is_bundle: false,
    brand: 'the_road'
  },
  {
    slug: 'family-budget-when-income-drops',
    title: 'Family Budget When Income Drops',
    short_description: 'A working budget for households absorbing legal fees and lost income at the same time.',
    long_description: 'A budgeting workbook for families hit by simultaneous legal costs and income loss: triaging fixed obligations, legal fee planning, insurance and benefits continuity, emergency spending tiers, and rebuilding a sustainable monthly plan.',
    source_tag: 'road',
    buyer_tag: 'family',
    category: CAT.MONEY_FAMILY,
    format: 'pdf',
    price_cents: 1400,
    status: 'live',
    version: '1.0',
    search_keywords: 'family budget income drop legal fees household planning expenses emergency financial worksheet',
    is_bundle: false,
    brand: 'the_road'
  },
  {
    slug: 'property-and-asset-inventory',
    title: 'Property & Asset Inventory',
    short_description: 'Document what you own, where it is, and who can access it — before the system does it for you.',
    long_description: 'A structured inventory of accounts, property, vehicles, digital assets, and documents, with access notes and designated custodians, so nothing is lost or frozen without a record during custody or supervision.',
    source_tag: 'road',
    buyer_tag: 'defendant',
    category: CAT.MONEY_FAMILY,
    format: 'pdf',
    price_cents: 1900,
    status: 'live',
    version: '1.0',
    search_keywords: 'property asset inventory accounts vehicles digital records custodian access forfeiture documentation',
    is_bundle: false,
    brand: 'the_road'
  },

  // --- 18-24: after-the-case & professional singles ---
  {
    slug: 'expungement-and-record-sealing-starter',
    title: 'Expungement & Record-Sealing Starter',
    short_description: 'Find out what can be cleared from your record and how to start, state by state.',
    long_description: 'A starter workbook for record relief: the difference between expungement, sealing, and set-asides; eligibility factors; the documents to gather; petition timelines; and how to track your case through the process.',
    source_tag: 'ccrc',
    buyer_tag: 'after_case',
    category: CAT.AFTER_THE_CASE,
    format: 'pdf',
    price_cents: 1900,
    status: 'live',
    version: '1.0',
    search_keywords: 'expungement record sealing set aside eligibility petition clean slate relief starter state',
    is_bundle: false,
    brand: 'the_road'
  },
  {
    slug: 'job-search-with-a-record',
    title: 'Job Search With a Record',
    short_description: 'A practical job-search system for applicants with a record: applications, background checks, and interviews.',
    long_description: 'Navigate hiring with a record: application-question strategy, ban-the-box rights, background check timing, fair-chance employers, and interview framing that is honest without being self-destructive.',
    source_tag: 'road',
    buyer_tag: 'after_case',
    category: CAT.AFTER_THE_CASE,
    format: 'pdf',
    price_cents: 1400,
    status: 'live',
    version: '1.0',
    search_keywords: 'job search record employment background check ban the box fair chance interview application hiring',
    is_bundle: false,
    brand: 'the_road'
  },
  {
    slug: 'housing-with-a-record',
    title: 'Housing With a Record',
    short_description: 'How to find and keep housing with a record: screening, applications, and your rights.',
    long_description: 'A housing workbook for people with records: how tenant screening works, application strategy, documentation that helps, public and subsidized housing rules, and steps when an application is denied.',
    source_tag: 'road',
    buyer_tag: 'after_case',
    category: CAT.AFTER_THE_CASE,
    format: 'pdf',
    price_cents: 1400,
    status: 'live',
    version: '1.0',
    search_keywords: 'housing record rental application tenant screening landlord denial subsidized rights reentry',
    is_bundle: false,
    brand: 'the_road'
  },
  {
    slug: 'rebuilding-credit-after-a-conviction',
    title: 'Rebuilding Credit After a Conviction',
    short_description: 'A step-by-step plan to repair credit damaged by legal fees, dormancy, or identity issues during a case.',
    long_description: 'Rebuild financial standing after a case: pulling and disputing credit reports, handling accounts that went delinquent during custody, secured-credit strategies, and a 12-month rebuilding sequence.',
    source_tag: 'ftc',
    buyer_tag: 'after_case',
    category: CAT.AFTER_THE_CASE,
    format: 'pdf',
    price_cents: 1400,
    status: 'live',
    version: '1.0',
    search_keywords: 'credit rebuild conviction report dispute secured card score debt collections annualcreditreport',
    is_bundle: false,
    brand: 'the_road'
  },
  {
    slug: 'talking-to-your-employer-disclosure-guide',
    title: 'Talking to Your Employer: A Disclosure Decision Guide',
    short_description: 'Decide what to tell your employer, when, and how — with scripts for each scenario.',
    long_description: 'A decision guide for employment disclosure during and after a case: what you are and are not obligated to disclose, timing considerations, licensing-board triggers, and conversation scripts for the hard versions of this talk.',
    source_tag: 'road',
    buyer_tag: 'after_case',
    category: CAT.AFTER_THE_CASE,
    format: 'pdf',
    price_cents: 1400,
    status: 'live',
    version: '1.0',
    search_keywords: 'employer disclosure guide decision scripts timing obligation licensing work conversation case',
    is_bundle: false,
    brand: 'the_road'
  },
  {
    slug: 'reentry-resource-checklist-for-case-managers',
    title: 'Reentry Resource Checklist for Case Managers',
    short_description: 'A structured intake-to-stability checklist for professionals managing reentry caseloads.',
    long_description: 'A professional-grade checklist covering the reentry stack: identification and documents, housing placement, benefits enrollment, employment pipeline, healthcare and medication continuity, transportation, and compliance calendars — organized for caseload use. A site license for organization-wide use is available.',
    source_tag: 'ssrn',
    buyer_tag: 'institution',
    category: CAT.PROFESSIONALS,
    format: 'pdf',
    price_cents: 4900,
    status: 'live',
    version: '1.0',
    search_keywords: 'reentry case manager checklist professional intake housing benefits employment healthcare compliance caseload',
    is_bundle: false,
    brand: 'the_road',
    site_license_cents: 49900
  },
  {
    slug: 'supervision-officer-quick-reference-collateral-consequences',
    title: 'Officer Quick-Reference: Collateral Consequences',
    short_description: 'A desk reference of collateral consequences for supervision officers advising people on their caseload.',
    long_description: 'A quick-reference for probation, parole, and pretrial officers: the collateral consequence categories that most often derail supervisees — licensing, housing, benefits, driving, firearms — with the screening questions to ask before problems surface.',
    source_tag: 'niccc',
    buyer_tag: 'institution',
    category: CAT.PROFESSIONALS,
    format: 'pdf',
    price_cents: 3900,
    status: 'live',
    version: '1.0',
    search_keywords: 'supervision officer probation parole quick reference collateral consequences desk screening caseload NICCC',
    is_bundle: false,
    brand: 'the_road'
  },

  // --- Clinical drafts (untouched, out of Road scope) ---
  {
    slug: 'physician-guide-healthcare-fraud-indictment',
    title: "Physician's Guide To Reviewing a Healthcare Fraud Indictment",
    short_description: 'Clinical review guidelines for defense attorneys analyzing medical fraud, billing, and kickback allegations.',
    long_description: 'Written for defense counsel by a physician-scholar. Methodologies to cross-reference billing codes (CPT/HCPCS), review OIG data, evaluate medical records, and isolate the clinical justifications that refute intent.',
    source_tag: 'ssrn',
    buyer_tag: 'defense_attorney',
    category: null,
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
    category: null,
    format: 'pdf',
    price_cents: 14900,
    status: 'draft',
    version: '1.0',
    search_keywords: 'medical necessity audit chart review clinical criteria standards of care defense motion expert witness',
    is_bundle: false,
    brand: 'clinical'
  }
];

const ROAD_SINGLE_SLUGS = productsData
  .filter(p => p.brand === 'the_road' && p.status === 'live')
  .map(p => p.slug);

const bundleData = [
  {
    slug: 'road-companion-toolkit',
    title: 'The Road Companion Toolkit',
    short_description: 'Six essential Road workbooks for the early stages of a case, bundled at a steep discount.',
    long_description: 'The core toolkit for the first stretch of a criminal case. Bundles the Pre-Sentencing Personal History Worksheet, Questions To Ask Before You Hire a Defense Attorney, The First 72 Hours After Arrest, Supervision & Probation Compliance Tracker, Restitution & Court-Fee Payment Tracker, and What To Expect at Sentencing.',
    source_tag: 'road',
    buyer_tag: 'defendant',
    category: CAT.BUNDLES,
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
  },
  {
    slug: 'after-the-case-bundle',
    title: 'After the Case Bundle',
    short_description: 'All five rebuilding workbooks — record relief, work, housing, credit, and disclosure — in one bundle.',
    long_description: 'The complete rebuilding set for life after a case: Expungement & Record-Sealing Starter, Job Search With a Record, Housing With a Record, Rebuilding Credit After a Conviction, and Talking to Your Employer: A Disclosure Decision Guide.',
    source_tag: 'road',
    buyer_tag: 'after_case',
    category: CAT.BUNDLES,
    format: 'pdf',
    price_cents: 4900,
    status: 'live',
    version: '1.0',
    search_keywords: 'bundle after case rebuilding expungement job housing credit employer disclosure record reentry',
    is_bundle: true,
    bundle_items: JSON.stringify([
      'expungement-and-record-sealing-starter',
      'job-search-with-a-record',
      'housing-with-a-record',
      'rebuilding-credit-after-a-conviction',
      'talking-to-your-employer-disclosure-guide'
    ]),
    brand: 'the_road'
  },
  {
    slug: 'reentry-staff-pack',
    title: 'Reentry Staff Pack',
    short_description: 'Both professional references — the case-manager checklist and the officer quick-reference — together.',
    long_description: 'The professional pair for reentry and supervision staff: the Reentry Resource Checklist for Case Managers and the Officer Quick-Reference on Collateral Consequences, bundled for individual professionals.',
    source_tag: 'ssrn',
    buyer_tag: 'institution',
    category: CAT.BUNDLES,
    format: 'pdf',
    price_cents: 7900,
    status: 'live',
    version: '1.0',
    search_keywords: 'bundle professional staff reentry case manager supervision officer checklist reference institution',
    is_bundle: true,
    bundle_items: JSON.stringify([
      'reentry-resource-checklist-for-case-managers',
      'supervision-officer-quick-reference-collateral-consequences'
    ]),
    brand: 'the_road'
  },
  {
    slug: 'road-full-library',
    title: 'The Full Road Library',
    short_description: 'Every Road workbook — all 24 — from arrest through rebuilding, at the deepest discount we offer.',
    long_description: 'The complete Road Workbooks library: every single workbook from the first 72 hours after arrest through supervision, sentencing, family finances, and rebuilding after the case, plus both professional references. One purchase, the whole road.',
    source_tag: 'road',
    buyer_tag: 'defendant',
    category: CAT.BUNDLES,
    format: 'pdf',
    price_cents: 19900,
    status: 'live',
    version: '1.0',
    search_keywords: 'bundle full library complete road workbooks everything all arrest sentencing supervision reentry rebuilding',
    is_bundle: true,
    bundle_items: JSON.stringify(ROAD_SINGLE_SLUGS),
    brand: 'the_road'
  }
];

async function ensureStripePrice(item, existingProduct) {
  let stripeProductId = existingProduct?.stripe_product_id || null;
  let stripePriceId = existingProduct?.stripe_price_id || null;

  // 1. Ensure the Stripe Product exists
  if (!stripeProductId) {
    const stripeProducts = await stripe.products.list({ limit: 100 });
    const match = stripeProducts.data.find(
      p => p.metadata.slug === item.slug && p.metadata.version === item.version
    );
    if (match) {
      stripeProductId = match.id;
      if (!stripePriceId && typeof match.default_price === 'string') {
        stripePriceId = match.default_price;
      }
    } else {
      const created = await stripe.products.create({
        name: item.title,
        description: item.short_description,
        metadata: {
          slug: item.slug,
          version: item.version,
          isBundle: item.is_bundle ? 'true' : 'false'
        }
      }, { idempotencyKey: `${item.slug}:v1` });
      stripeProductId = created.id;
    }
  }

  // 2. Ensure the Price exists AND matches the canonical amount.
  //    Stripe Prices are immutable: on mismatch, create a replacement price,
  //    repoint default_price, deactivate the old one.
  if (stripePriceId) {
    const price = await stripe.prices.retrieve(stripePriceId);
    if (price.unit_amount !== item.price_cents || price.currency !== 'usd') {
      console.warn(`  PRICE MISMATCH for ${item.slug}: Stripe has ${price.unit_amount}, canonical is ${item.price_cents}. Creating replacement price.`);
      const replacement = await stripe.prices.create({
        product: stripeProductId,
        unit_amount: item.price_cents,
        currency: 'usd',
        metadata: { slug: item.slug, version: item.version }
      }, { idempotencyKey: `${item.slug}:v1:price:${item.price_cents}` });
      await stripe.products.update(stripeProductId, { default_price: replacement.id });
      await stripe.prices.update(stripePriceId, { active: false });
      stripePriceId = replacement.id;
    }
  } else {
    const price = await stripe.prices.create({
      product: stripeProductId,
      unit_amount: item.price_cents,
      currency: 'usd',
      metadata: { slug: item.slug, version: item.version }
    }, { idempotencyKey: `${item.slug}:v1:price` });
    stripePriceId = price.id;
    await stripe.products.update(stripeProductId, { default_price: stripePriceId });
  }

  // 3. Optional second price (site license) on the same product.
  let siteLicensePriceId = existingProduct?.stripe_site_license_price_id || null;
  if (item.site_license_cents && !siteLicensePriceId) {
    const sl = await stripe.prices.create({
      product: stripeProductId,
      unit_amount: item.site_license_cents,
      currency: 'usd',
      nickname: 'Site license',
      metadata: { slug: item.slug, version: item.version, variant: 'site-license' }
    }, { idempotencyKey: `${item.slug}:site-license:v1` });
    siteLicensePriceId = sl.id;
  }

  return { stripeProductId, stripePriceId, siteLicensePriceId };
}

async function upsertMasterPdf(slug) {
  const filePath = path.join(MASTERS_DIR, `${slug}.pdf`);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Master PDF missing for live product "${slug}" (${filePath})`);
  }
  const pdf = fs.readFileSync(filePath);
  if (pdf.length < MIN_MASTER_BYTES) {
    throw new Error(`Master PDF for "${slug}" is only ${pdf.length} bytes — looks like a placeholder, refusing to load it`);
  }
  const { PDFDocument } = require('pdf-lib');
  const doc = await PDFDocument.load(pdf);
  const pageCount = doc.getPageCount();
  if (pageCount < 1) {
    throw new Error(`Master PDF for "${slug}" has no pages`);
  }

  await prisma.$executeRaw`
    INSERT INTO product_files (product_slug, pdf, byte_size, page_count, updated_at)
    VALUES (${slug}, ${pdf}, ${pdf.length}, ${pageCount}, now())
    ON CONFLICT (product_slug)
    DO UPDATE SET pdf = EXCLUDED.pdf, byte_size = EXCLUDED.byte_size,
                  page_count = EXCLUDED.page_count, updated_at = now()
  `;
  return { byteSize: pdf.length, pageCount };
}

async function report() {
  const allItems = [...productsData, ...bundleData];
  const rows = await prisma.$queryRaw`SELECT slug, title, price_cents, status, buyer_tag, category, is_bundle, stripe_price_id, stripe_site_license_price_id FROM "Product" ORDER BY is_bundle, slug`;
  const bySlug = new Map(rows.map(r => [r.slug, r]));

  console.log('=== DB state vs canonical catalog (report only, no writes) ===');
  let liveSingles = 0, liveBundles = 0, issues = 0;
  for (const item of allItems) {
    const row = bySlug.get(item.slug);
    if (!row) { console.log(`MISSING   ${item.slug} (canonical ${item.price_cents}c)`); issues++; continue; }
    const diffs = [];
    if (Number(row.price_cents) !== item.price_cents) diffs.push(`price ${row.price_cents}c != ${item.price_cents}c`);
    if (row.status !== item.status) diffs.push(`status ${row.status} != ${item.status}`);
    if (row.buyer_tag !== item.buyer_tag) diffs.push(`buyer ${row.buyer_tag} != ${item.buyer_tag}`);
    if ((row.category || null) !== (item.category || null)) diffs.push(`category ${row.category} != ${item.category}`);
    if (!row.stripe_price_id) diffs.push('no stripe_price_id');
    if (item.site_license_cents && !row.stripe_site_license_price_id) diffs.push('no site-license price');
    if (diffs.length) { console.log(`DRIFT     ${item.slug}: ${diffs.join('; ')}`); issues++; }
    else console.log(`OK        ${item.slug} ${row.price_cents}c ${row.stripe_price_id}`);
    if (row.status === 'live') { row.is_bundle ? liveBundles++ : liveSingles++; }
  }
  for (const row of rows) {
    if (!allItems.find(i => i.slug === row.slug)) {
      console.log(`UNKNOWN   ${row.slug} (${row.status}, ${row.price_cents}c) — in DB but not in canonical catalog`);
      issues++;
    }
  }
  const files = await prisma.$queryRaw`SELECT product_slug, byte_size, page_count FROM product_files ORDER BY product_slug`;
  console.log(`\nMaster files in DB: ${files.length}`);
  for (const f of files) console.log(`  ${f.product_slug}: ${f.byte_size} bytes, ${f.page_count} pages`);
  console.log(`\nLive singles: ${liveSingles} (expect 24 the_road + 0 clinical) | Live bundles: ${liveBundles} (expect 4) | Issues: ${issues}`);
}

async function main() {
  if (REPORT_ONLY) return report();

  console.log('Seeding products and bundles with Stripe integration...');
  const allItems = [...productsData, ...bundleData];
  const failures = [];

  for (const item of allItems) {
    try {
      const existingProduct = await prisma.product.findUnique({ where: { slug: item.slug } });

      const { stripeProductId, stripePriceId, siteLicensePriceId } = await ensureStripePrice(item, existingProduct);

      const dataToSave = {
        title: item.title,
        short_description: item.short_description,
        long_description: item.long_description,
        source_tag: item.source_tag,
        buyer_tag: item.buyer_tag,
        category: item.category || null,
        format: item.format,
        stripe_product_id: stripeProductId,
        stripe_price_id: stripePriceId,
        stripe_site_license_price_id: siteLicensePriceId,
        price_cents: item.price_cents,
        currency: 'usd',
        status: item.status,
        version: item.version,
        search_keywords: item.search_keywords,
        is_bundle: item.is_bundle,
        bundle_items: item.bundle_items || null,
        brand: item.brand
      };

      await prisma.product.upsert({
        where: { slug: item.slug },
        update: dataToSave,
        create: {
          id: existingProduct?.id || crypto.randomUUID(),
          slug: item.slug,
          ...dataToSave
        }
      });

      // Load the real master PDF for live, non-bundle Road products.
      if (!item.is_bundle && item.status === 'live' && item.brand === 'the_road') {
        const { byteSize, pageCount } = await upsertMasterPdf(item.slug);
        console.log(`Synced ${item.slug} (${item.price_cents}c, price ${stripePriceId}${siteLicensePriceId ? `, site-license ${siteLicensePriceId}` : ''}, master ${byteSize}b/${pageCount}p)`);
      } else {
        console.log(`Synced ${item.slug} (${item.price_cents}c, price ${stripePriceId})`);
      }
    } catch (error) {
      console.error(`FAILED  ${item.slug}: ${error.message}`);
      failures.push(item.slug);
    }
  }

  if (failures.length) {
    console.error(`\nSeed finished with ${failures.length} FAILURES: ${failures.join(', ')}`);
    process.exitCode = 1;
  } else {
    console.log('\nDatabase seeding & Stripe synchronization finished successfully.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
