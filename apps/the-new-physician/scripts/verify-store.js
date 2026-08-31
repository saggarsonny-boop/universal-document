// Definition-of-done verification for The Road templates store.
// Usage: node scripts/verify-store.js   (needs DATABASE_URL + STRIPE_SECRET_KEY)
// Checks, against LIVE systems, that:
//   1. https://hub.newphysician.org/templates returns 200 with product cards
//   2. DB has exactly 24 live singles + 4 live bundles (brand the_road)
//   3. Every live product has a real Stripe Price at the correct amount
//   4. Every live single has a real master PDF stored (size + page count)
//   5. sitemap.xml lists all 28 product URLs
const { PrismaClient } = require('@prisma/client');
const Stripe = require('stripe');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const BASE = process.env.STORE_BASE_URL || 'https://hub.newphysician.org';
const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

let failures = 0;
function check(ok, label, detail = '') {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? ` — ${detail}` : ''}`);
  if (!ok) failures++;
}

async function main() {
  // --- 1. Live store page ---
  const storeRes = await fetch(`${BASE}/templates`);
  const storeHtml = await storeRes.text();
  check(storeRes.status === 200, `GET ${BASE}/templates`, `HTTP ${storeRes.status}`);
  check(storeHtml.includes('/templates/'), 'store HTML contains product links');
  check(storeHtml.includes('road-full-library'), 'store HTML features the full library bundle');

  // --- 2. Catalog counts ---
  const singles = await prisma.$queryRaw`SELECT slug, title, price_cents, stripe_price_id, stripe_site_license_price_id FROM "Product" WHERE status = 'live' AND is_bundle = false AND brand = 'the_road' ORDER BY slug`;
  const bundles = await prisma.$queryRaw`SELECT slug, title, price_cents, stripe_price_id FROM "Product" WHERE status = 'live' AND is_bundle = true AND brand = 'the_road' ORDER BY slug`;
  check(singles.length === 24, 'exactly 24 live singles', `found ${singles.length}`);
  check(bundles.length === 4, 'exactly 4 live bundles', `found ${bundles.length}`);

  // --- 3. Stripe prices are real and correct ---
  for (const p of [...singles, ...bundles]) {
    if (!p.stripe_price_id) { check(false, `stripe price for ${p.slug}`, 'missing'); continue; }
    try {
      const price = await stripe.prices.retrieve(p.stripe_price_id);
      check(
        price.unit_amount === Number(p.price_cents) && price.active && price.livemode,
        `stripe price ${p.stripe_price_id} for ${p.slug}`,
        `${price.unit_amount}c active=${price.active} livemode=${price.livemode} (DB ${p.price_cents}c)`
      );
    } catch (e) {
      check(false, `stripe price for ${p.slug}`, e.message);
    }
    if (p.stripe_site_license_price_id) {
      const sl = await stripe.prices.retrieve(p.stripe_site_license_price_id);
      check(sl.unit_amount === 49900 && sl.active && sl.livemode, `site-license price for ${p.slug}`, `${sl.unit_amount}c`);
    }
  }

  // --- 4. Master PDFs stored ---
  const files = await prisma.$queryRaw`SELECT product_slug, byte_size, page_count FROM product_files ORDER BY product_slug`;
  const fileMap = new Map(files.map(f => [f.product_slug, f]));
  for (const p of singles) {
    const f = fileMap.get(p.slug);
    check(!!f && f.byte_size > 20000 && f.page_count >= 1, `master PDF for ${p.slug}`, f ? `${f.byte_size}b/${f.page_count}p` : 'MISSING');
  }

  // --- 5. Sitemap ---
  const smRes = await fetch(`${BASE}/sitemap.xml`);
  const sm = await smRes.text();
  check(smRes.status === 200, `GET ${BASE}/sitemap.xml`, `HTTP ${smRes.status}`);
  let missing = 0;
  for (const p of [...singles, ...bundles]) {
    if (!sm.includes(`${BASE}/templates/${p.slug}`)) { missing++; console.log(`      sitemap missing: ${p.slug}`); }
  }
  check(missing === 0, 'sitemap lists all 28 product URLs', `${28 - missing}/28 present`);

  console.log(`\n${failures === 0 ? 'ALL CHECKS PASSED' : `${failures} CHECK(S) FAILED`}`);
  process.exitCode = failures === 0 ? 0 : 1;
}

main().finally(() => prisma.$disconnect());
