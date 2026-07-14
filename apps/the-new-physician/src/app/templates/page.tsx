import { dbEdge } from '@/lib/db-edge';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Search, Layers, ArrowRight } from 'lucide-react';
import { HiveFooter } from '@/components/HiveFooter';
import TheRoadMark from '@/components/TheRoadMark';
import { STORE_SECTIONS, BUYER_FILTERS, PROFESSIONAL_BUYER_TAGS, BUYER_TAG_LABELS, SORT_OPTIONS } from '@/data/storeSections';

interface PageProps {
  searchParams: Promise<{
    q?: string;
    section?: string;
    buyer?: string;
    sort?: string;
  }>;
}

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export const metadata: Metadata = {
  title: 'The Road Templates & Workbooks — hub.newphysician.org',
  description: 'Practical workbooks for every stage of a criminal case: arrest, charges, sentencing, supervision, and rebuilding after the case. For defendants, families, and the professionals who serve them.',
  alternates: { canonical: 'https://hub.newphysician.org/templates' },
};

function formatPrice(cents: number): string {
  return cents % 100 === 0 ? `$${cents / 100}` : `$${(cents / 100).toFixed(2)}`;
}

function buildQuery(params: Record<string, string | undefined>): string {
  const filtered = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v) as [string, string][]
  );
  const qs = new URLSearchParams(filtered).toString();
  return qs ? `/templates?${qs}` : '/templates';
}

export default async function TemplatesHub({ searchParams }: PageProps) {
  const params = await searchParams;
  const query = (params.q || '').trim().slice(0, 100);
  const selectedSection = params.section || 'all';
  const selectedBuyer = params.buyer || 'all';
  const selectedSort = params.sort || 'journey';

  // --- Singles query: filters + full-text search, scales past 200 items ---
  const where: string[] = [`status = 'live'`, `is_bundle = false`, `brand = 'the_road'`];
  const args: unknown[] = [];
  let i = 1;

  if (selectedSection !== 'all' && STORE_SECTIONS.some(s => s.slug === selectedSection)) {
    where.push(`category = $${i++}`);
    args.push(selectedSection);
  }
  if (selectedBuyer === 'professional') {
    where.push(`buyer_tag = ANY($${i++})`);
    args.push(PROFESSIONAL_BUYER_TAGS);
  } else if (selectedBuyer !== 'all' && BUYER_FILTERS.some(b => b.value === selectedBuyer)) {
    where.push(`buyer_tag = $${i++}`);
    args.push(selectedBuyer);
  }
  if (query) {
    // tsvector for real word matches; trigram similarity + ILIKE keep it
    // typo-tolerant for short or misspelled queries.
    where.push(`(search_tsv @@ websearch_to_tsquery('english', $${i}) OR similarity(title, $${i}) > 0.25 OR title ILIKE '%' || $${i} || '%')`);
    args.push(query);
    i++;
  }

  let orderBy = `ORDER BY category, price_cents ASC, title ASC`;
  if (query) {
    orderBy = `ORDER BY ts_rank(search_tsv, websearch_to_tsquery('english', $1)) DESC, similarity(title, $1) DESC, title ASC`;
  } else if (selectedSort === 'newest') {
    orderBy = `ORDER BY created_at DESC, title ASC`;
  } else if (selectedSort === 'price') {
    orderBy = `ORDER BY price_cents ASC, title ASC`;
  } else if (selectedSort === 'alpha') {
    orderBy = `ORDER BY title ASC`;
  }

  const singles = await dbEdge(
    `SELECT id, slug, title, short_description, price_cents, buyer_tag, category, created_at
     FROM "Product" WHERE ${where.join(' AND ')} ${orderBy}`,
    args
  ) as any[];

  // --- Bundles with honest singles totals computed from the DB ---
  const bundles = await dbEdge(
    `SELECT b.id, b.slug, b.title, b.short_description, b.price_cents, b.buyer_tag,
            (SELECT COALESCE(SUM(s.price_cents), 0)
             FROM "Product" s
             WHERE s.slug IN (SELECT jsonb_array_elements_text(b.bundle_items::jsonb))
               AND s.status = 'live') AS singles_total_cents,
            (SELECT COUNT(*)
             FROM jsonb_array_elements_text(b.bundle_items::jsonb)) AS item_count
     FROM "Product" b
     WHERE b.status = 'live' AND b.is_bundle = true AND b.brand = 'the_road'
     ORDER BY b.price_cents DESC`,
    []
  ) as any[];

  // Journey grouping applies when browsing without an explicit sort or search.
  const grouped = !query && selectedSort === 'journey';
  const sectionsToRender = grouped
    ? STORE_SECTIONS
        .filter(s => selectedSection === 'all' || s.slug === selectedSection)
        .map(s => ({ ...s, products: singles.filter((p: any) => p.category === s.slug) }))
        .filter(s => s.products.length > 0)
    : [];

  const hasResults = singles.length > 0;
  const filtersActive = query || selectedSection !== 'all' || selectedBuyer !== 'all';

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'The Road Templates & Workbooks',
    url: 'https://hub.newphysician.org/templates',
    numberOfItems: singles.length + bundles.length,
    itemListElement: [...bundles, ...singles].map((p: any, idx: number) => ({
      '@type': 'ListItem',
      position: idx + 1,
      url: `https://hub.newphysician.org/templates/${p.slug}`,
      name: p.title,
    })),
  };

  const goldText = 'text-[#D4AF37] print:text-[#8A6D14]';

  const productCard = (p: any) => (
    <Link
      key={p.slug}
      href={`/templates/${p.slug}`}
      className="group flex flex-col bg-[#111111] border border-neutral-800 hover:border-[#D4AF37]/50 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-[#D4AF37]/5"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="font-display font-bold text-white text-lg leading-snug group-hover:text-[#D4AF37] transition-colors">
          {p.title}
        </h3>
        <span className={`font-bold text-lg whitespace-nowrap ${goldText}`}>
          {formatPrice(Number(p.price_cents))}
        </span>
      </div>
      <p className="text-sm text-neutral-400 leading-relaxed flex-grow">
        {p.short_description}
      </p>
      <div className="flex items-center justify-between mt-5 pt-4 border-t border-neutral-900">
        <span className="text-[10px] font-bold tracking-widest uppercase text-neutral-500 border border-neutral-800 rounded-full px-2.5 py-1">
          {BUYER_TAG_LABELS[p.buyer_tag] || p.buyer_tag}
        </span>
        <ArrowRight className="w-4 h-4 text-neutral-600 group-hover:text-[#D4AF37] group-hover:translate-x-0.5 transition-all" />
      </div>
    </Link>
  );

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-neutral-300 font-sans selection:bg-[#D4AF37] selection:text-black flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />

      {/* Navigation — mirrors the newphysician.org front page */}
      <nav className="sticky top-0 w-full z-50 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-neutral-900">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <TheRoadMark size={34} />
            <div className="font-display font-bold text-lg tracking-wider text-white">
              THE ROAD
              <div className="h-0.5 w-full bg-[#D4AF37] mt-1 origin-left opacity-50"></div>
            </div>
          </Link>
          <div className="flex gap-6 text-sm font-medium tracking-wide items-center">
            <Link href="/" className="hover:text-[#D4AF37] transition-colors hidden sm:inline">Home</Link>
            <span className={goldText + ' font-bold'}>Templates</span>
            <a href="mailto:support@newphysician.org" className="hover:text-[#D4AF37] transition-colors hidden sm:inline">Support</a>
          </div>
        </div>
      </nav>

      <div className="flex-grow max-w-6xl mx-auto w-full px-6 py-12 md:py-16">
        {/* Hero */}
        <div className="max-w-3xl mb-12">
          <div className={`inline-block border border-[#D4AF37]/40 bg-[#D4AF37]/5 px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase mb-5 ${goldText}`}>
            The Road Workbooks
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white leading-tight mb-5">
            Templates &amp; Workbooks
          </h1>
          <p className="text-base md:text-lg text-neutral-400 leading-relaxed">
            Practical, plain-language workbooks for every stage of the road — from the first 72 hours
            after arrest through supervision, sentencing, and rebuilding after the case. Written by a
            physician-defendant and legal scholar. Educational resources, not legal advice.
          </p>
        </div>

        {/* Featured bundles */}
        {bundles.length > 0 && !filtersActive && (
          <section className="mb-14">
            <div className="flex items-center gap-2.5 mb-5">
              <Layers className={`w-5 h-5 ${goldText}`} />
              <h2 className="font-display font-bold text-white text-2xl">Bundles</h2>
              <span className="text-xs text-neutral-500 mt-1">save over buying singles</span>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {bundles.map((b: any) => {
                const singlesTotal = Number(b.singles_total_cents);
                const savings = singlesTotal - Number(b.price_cents);
                const isFlagship = b.slug === 'road-full-library';
                return (
                  <Link
                    key={b.slug}
                    href={`/templates/${b.slug}`}
                    className={`group flex flex-col rounded-2xl p-6 border transition-all duration-300 ${
                      isFlagship
                        ? 'sm:col-span-2 bg-gradient-to-br from-[#171307] to-[#111111] border-[#D4AF37]/50 hover:border-[#D4AF37]'
                        : 'bg-[#111111] border-neutral-800 hover:border-[#D4AF37]/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className={`font-display font-bold text-white leading-snug group-hover:text-[#D4AF37] transition-colors ${isFlagship ? 'text-2xl' : 'text-lg'}`}>
                        {b.title}
                      </h3>
                      <div className="text-right whitespace-nowrap">
                        <div className={`font-bold ${isFlagship ? 'text-2xl' : 'text-lg'} ${goldText}`}>
                          {formatPrice(Number(b.price_cents))}
                        </div>
                        {savings > 0 && (
                          <div className="text-[11px] text-neutral-500">
                            <span className="line-through">{formatPrice(singlesTotal)}</span> singles
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-neutral-400 leading-relaxed">{b.short_description}</p>
                    <div className="flex items-center gap-3 mt-4 pt-3 border-t border-neutral-900 text-[11px] font-bold tracking-widest uppercase">
                      <span className="text-neutral-500">{Number(b.item_count)} workbooks</span>
                      {savings > 0 && (
                        <span className={goldText}>Save {formatPrice(savings)}</span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Search / filter / sort controls */}
        <div className="bg-[#111111] border border-neutral-800 rounded-2xl p-5 mb-10">
          <form method="GET" action="/templates" className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-grow">
              <Search className="absolute left-4 top-3 w-5 h-5 text-neutral-600" />
              <input
                type="text"
                name="q"
                defaultValue={query}
                placeholder="Search workbooks (e.g. bail, expungement, character letter)…"
                className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-xl py-3 pl-12 pr-4 text-sm text-neutral-200 placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-all"
              />
              {selectedSection !== 'all' && <input type="hidden" name="section" value={selectedSection} />}
              {selectedBuyer !== 'all' && <input type="hidden" name="buyer" value={selectedBuyer} />}
            </div>
            <button
              type="submit"
              className="bg-[#D4AF37] hover:bg-[#BCA032] text-black font-bold px-8 py-3 rounded-xl transition-all text-sm cursor-pointer"
            >
              Search
            </button>
          </form>

          {/* Section chips */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
            <Link
              href={buildQuery({ q: query || undefined, buyer: selectedBuyer !== 'all' ? selectedBuyer : undefined, sort: selectedSort !== 'journey' ? selectedSort : undefined })}
              className={`whitespace-nowrap text-xs font-semibold px-3.5 py-1.5 rounded-full border transition-colors ${
                selectedSection === 'all'
                  ? 'border-[#D4AF37] text-[#D4AF37] bg-[#D4AF37]/10 print:text-[#8A6D14]'
                  : 'border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-600'
              }`}
            >
              All stages
            </Link>
            {STORE_SECTIONS.map((s) => (
              <Link
                key={s.slug}
                href={buildQuery({ q: query || undefined, section: s.slug, buyer: selectedBuyer !== 'all' ? selectedBuyer : undefined, sort: selectedSort !== 'journey' ? selectedSort : undefined })}
                className={`whitespace-nowrap text-xs font-semibold px-3.5 py-1.5 rounded-full border transition-colors ${
                  selectedSection === s.slug
                    ? 'border-[#D4AF37] text-[#D4AF37] bg-[#D4AF37]/10 print:text-[#8A6D14]'
                    : 'border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-600'
                }`}
              >
                {s.label}
              </Link>
            ))}
          </div>

          {/* Buyer + sort row */}
          <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-neutral-900">
            <span className="text-[10px] font-bold tracking-widest uppercase text-neutral-600 mr-1">Who it&apos;s for:</span>
            <Link
              href={buildQuery({ q: query || undefined, section: selectedSection !== 'all' ? selectedSection : undefined, sort: selectedSort !== 'journey' ? selectedSort : undefined })}
              className={`text-xs font-semibold px-3 py-1 rounded-full border transition-colors ${
                selectedBuyer === 'all'
                  ? 'border-[#D4AF37] text-[#D4AF37] bg-[#D4AF37]/10 print:text-[#8A6D14]'
                  : 'border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-600'
              }`}
            >
              Everyone
            </Link>
            {BUYER_FILTERS.map((b) => (
              <Link
                key={b.value}
                href={buildQuery({ q: query || undefined, section: selectedSection !== 'all' ? selectedSection : undefined, buyer: b.value, sort: selectedSort !== 'journey' ? selectedSort : undefined })}
                className={`text-xs font-semibold px-3 py-1 rounded-full border transition-colors ${
                  selectedBuyer === b.value
                    ? 'border-[#D4AF37] text-[#D4AF37] bg-[#D4AF37]/10 print:text-[#8A6D14]'
                    : 'border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-600'
                }`}
              >
                {b.label}
              </Link>
            ))}

            <span className="text-[10px] font-bold tracking-widest uppercase text-neutral-600 ml-auto mr-1 hidden sm:inline">Sort:</span>
            {SORT_OPTIONS.map((s) => (
              <Link
                key={s.value}
                href={buildQuery({ q: query || undefined, section: selectedSection !== 'all' ? selectedSection : undefined, buyer: selectedBuyer !== 'all' ? selectedBuyer : undefined, sort: s.value !== 'journey' ? s.value : undefined })}
                className={`text-xs font-semibold px-3 py-1 rounded-full border transition-colors ${
                  selectedSort === s.value
                    ? 'border-[#D4AF37] text-[#D4AF37] bg-[#D4AF37]/10 print:text-[#8A6D14]'
                    : 'border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-600'
                }`}
              >
                {s.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Results */}
        {!hasResults ? (
          <div className="text-center py-20 border border-dashed border-neutral-800 rounded-2xl">
            <p className="font-display text-xl text-white mb-2">No workbooks match{query ? ` “${query}”` : ' those filters'}.</p>
            <p className="text-sm text-neutral-500 mb-6">Try a different word, or browse the whole library.</p>
            <Link
              href="/templates"
              className="inline-block border border-[#D4AF37]/50 text-[#D4AF37] print:text-[#8A6D14] px-5 py-2 rounded-full text-sm font-bold hover:bg-[#D4AF37]/10 transition-colors"
            >
              Clear search &amp; filters
            </Link>
          </div>
        ) : grouped ? (
          <div className="space-y-14">
            {sectionsToRender.map((s) => (
              <section key={s.slug} id={s.slug}>
                <div className="flex items-baseline gap-3 mb-1.5">
                  <h2 className="font-display font-bold text-white text-2xl">{s.label}</h2>
                  <span className="text-xs text-neutral-600">{s.products.length} workbook{s.products.length === 1 ? '' : 's'}</span>
                </div>
                <p className="text-sm text-neutral-500 mb-5">{s.blurb}</p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {s.products.map(productCard)}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {singles.map(productCard)}
          </div>
        )}

        {/* Disclaimer strip */}
        <p className="text-xs text-neutral-600 leading-relaxed mt-16 border-t border-neutral-900 pt-6 max-w-3xl">
          All workbooks are educational and informational resources. They do not constitute legal advice
          and do not create an attorney-client relationship. Every purchased copy is personalized to the
          buyer with per-page watermarking.
        </p>
      </div>

      <HiveFooter />
    </main>
  );
}
