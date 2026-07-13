import { db } from '@/lib/db';
import Link from 'next/link';
import { Search, SlidersHorizontal, BookOpen, User, DollarSign } from 'lucide-react';
import { HiveFooter } from '@/components/HiveFooter';

interface PageProps {
  searchParams: Promise<{
    q?: string;
    buyer?: string;
    source?: string;
  }>;
}

export const dynamic = 'force-dynamic';

export default async function TemplatesHub({ searchParams }: PageProps) {
  const params = await searchParams;
  const query = params.q || '';
  const selectedBuyer = params.buyer || 'all';
  const selectedSource = params.source || 'all';

  // Fetch live products
  const products = await db.product.findMany({
    where: {
      status: 'live',
      AND: [
        selectedBuyer !== 'all' ? { buyerTag: selectedBuyer } : {},
        selectedSource !== 'all' ? { sourceTag: selectedSource } : {},
        query
          ? {
              OR: [
                { title: { contains: query, mode: 'insensitive' } },
                { shortDescription: { contains: query, mode: 'insensitive' } },
                { searchKeywords: { contains: query, mode: 'insensitive' } }
              ]
            }
          : {}
      ]
    },
    orderBy: { priceCents: 'asc' }
  });

  const buyerTags = [
    { label: 'All Buyers', value: 'all' },
    { label: 'Defendants', value: 'defendant' },
    { label: 'Families', value: 'family' },
    { label: 'Attorneys', value: 'defense_attorney' },
    { label: 'Physicians', value: 'physician' },
    { label: 'Case Managers', value: 'case_manager' }
  ];

  const sourceTags = [
    { label: 'All Sources', value: 'all' },
    { label: 'The Road', value: 'road' },
    { label: 'Busted By', value: 'busted' },
    { label: 'SSRN Scholar', value: 'ssrn' }
  ];

  return (
    <div className="min-h-screen bg-[#0B0F19] text-[#E2E8F0] font-sans flex flex-col selection:bg-[#D4AF37] selection:text-[#0B0F19]">
      {/* Dynamic SEO JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            'name': 'The New Physician - Templates Hub',
            'description': 'Premium digital templates, guides, and compliance trackers authored by a physician-defendant and legal scholar.',
            'url': 'https://hub.newphysician.org/templates'
          })
        }}
      />

      {/* Header / Nav */}
      <header className="border-b border-[#1F293D] py-5 px-6 md:px-12 flex justify-between items-center bg-[#0D111A]/80 backdrop-blur-md sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded border border-[#D4AF37] flex items-center justify-center font-bold text-xs tracking-wider text-[#D4AF37] group-hover:bg-[#D4AF37] group-hover:text-[#0B0F19] transition-all duration-300">
            TNP
          </div>
          <span className="font-bold tracking-widest text-[#D4AF37] text-sm uppercase">The New Physician</span>
        </Link>
        <nav className="flex gap-6 text-sm text-[#8F9CAE]">
          <Link href="/" className="hover:text-[#D4AF37] transition-colors">Home</Link>
          <span className="text-[#D4AF37] font-semibold">Templates</span>
          <a href="mailto:support@newphysician.org" className="hover:text-[#D4AF37] transition-colors">Support</a>
        </nav>
      </header>

      {/* Main Container */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-6 md:px-12 py-12 md:py-20">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-block border border-[rgba(212,175,55,0.3)] bg-[rgba(212,175,55,0.05)] px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest text-[#D4AF37] uppercase mb-4">
            Actionable Blue-Ocean Resources
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-white via-[#E2E8F0] to-[#D4AF37] bg-clip-text text-transparent">
            Digital Knowledge Templates
          </h1>
          <p className="text-[#ACB6C5] text-base md:text-lg leading-relaxed">
            Bridging physician judgment, lived defendant experience, and legal scholarship into consumer-facing procedural guides and expert litigation blueprints.
          </p>
        </div>

        {/* Search & Filters Controls */}
        <div className="bg-[#0D111A] border border-[#1F293D] rounded-2xl p-6 mb-12 shadow-xl">
          <form method="GET" action="/templates" className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-grow">
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-[#5B6574]" />
              <input
                type="text"
                name="q"
                defaultValue={query}
                placeholder="Search templates (e.g. mitigation, exclusion, tracker)..."
                className="w-full bg-[#080B12] border border-[#1F293D] rounded-xl py-3.5 pl-12 pr-4 text-[#E2E8F0] placeholder-[#5B6574] focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all text-sm"
              />
              {/* Keep other filter values in form submission */}
              {selectedBuyer !== 'all' && <input type="hidden" name="buyer" value={selectedBuyer} />}
              {selectedSource !== 'all' && <input type="hidden" name="source" value={selectedSource} />}
            </div>
            <button
              type="submit"
              className="bg-[#D4AF37] hover:bg-[#BCA032] text-[#0B0F19] font-bold px-8 py-3.5 rounded-xl transition-all shadow-lg hover:shadow-[#D4AF37]/10 text-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              Search Hub
            </button>
          </form>

          {/* Filter Grid */}
          <div className="flex flex-col gap-5 border-t border-[#1F293D]/50 pt-5">
            {/* Buyer Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-bold tracking-wider text-[#5B6574] uppercase flex items-center gap-1.5 w-32">
                <User className="w-3.5 h-3.5" /> Buyer Target:
              </span>
              <div className="flex flex-wrap gap-2">
                {buyerTags.map((t) => (
                  <Link
                    key={t.value}
                    href={`/templates?${new URLSearchParams({
                      ...(query ? { q: query } : {}),
                      ...(t.value !== 'all' ? { buyer: t.value } : {}),
                      ...(selectedSource !== 'all' ? { source: selectedSource } : {})
                    })}`}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      selectedBuyer === t.value
                        ? 'border-[#D4AF37] bg-[rgba(212,175,55,0.1)] text-[#D4AF37]'
                        : 'border-[#1F293D] hover:border-[#ACB6C5]/30 text-[#8F9CAE]'
                    }`}
                  >
                    {t.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Source Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-bold tracking-wider text-[#5B6574] uppercase flex items-center gap-1.5 w-32">
                <BookOpen className="w-3.5 h-3.5" /> Core Source:
              </span>
              <div className="flex flex-wrap gap-2">
                {sourceTags.map((t) => (
                  <Link
                    key={t.value}
                    href={`/templates?${new URLSearchParams({
                      ...(query ? { q: query } : {}),
                      ...(selectedBuyer !== 'all' ? { buyer: selectedBuyer } : {}),
                      ...(t.value !== 'all' ? { source: t.value } : {})
                    })}`}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      selectedSource === t.value
                        ? 'border-[#D4AF37] bg-[rgba(212,175,55,0.1)] text-[#D4AF37]'
                        : 'border-[#1F293D] hover:border-[#ACB6C5]/30 text-[#8F9CAE]'
                    }`}
                  >
                    {t.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {products.length === 0 ? (
          <div className="text-center py-20 bg-[#0D111A] border border-[#1F293D] rounded-2xl p-8">
            <SlidersHorizontal className="w-12 h-12 text-[#5B6574] mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">No Templates Found</h3>
            <p className="text-[#8F9CAE] max-w-md mx-auto text-sm leading-relaxed">
              We couldn't find any templates matching your search criteria. Try removing filters or searching for alternate terms.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-[#0D111A] border border-[#1F293D] rounded-2xl p-6 flex flex-col justify-between hover:border-[#D4AF37]/50 hover:shadow-xl hover:shadow-[#D4AF37]/5 transition-all duration-300 group"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] font-bold tracking-widest text-[#D4AF37] uppercase bg-[rgba(212,175,55,0.05)] border border-[rgba(212,175,55,0.2)] px-2.5 py-1 rounded">
                      {product.format.toUpperCase()}
                    </span>
                    <span className="text-xs text-[#5B6574] font-medium uppercase tracking-wider">
                      {product.sourceTag}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white group-hover:text-[#D4AF37] transition-colors mb-2">
                    {product.title}
                  </h3>
                  <p className="text-[#8F9CAE] text-xs leading-relaxed line-clamp-3 mb-6">
                    {product.shortDescription}
                  </p>
                </div>
                <div className="flex items-center justify-between border-t border-[#1F293D]/50 pt-4 mt-4">
                  <div className="flex items-baseline text-white">
                    <span className="text-xs text-[#8F9CAE] mr-1">$</span>
                    <span className="text-xl font-bold font-mono">
                      {(product.priceCents / 100).toFixed(2)}
                    </span>
                  </div>
                  <Link
                    href={`/templates/${product.slug}`}
                    className="bg-[#1F293D] hover:bg-[#D4AF37] hover:text-[#0B0F19] text-white text-xs font-bold px-4 py-2.5 rounded-lg transition-all duration-200 cursor-pointer"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <HiveFooter />
    </div>
  );
}
