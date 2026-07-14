import { dbEdge } from '@/lib/db-edge';
import Link from 'next/link';
import { Search, SlidersHorizontal, BookOpen, User, DollarSign } from 'lucide-react';
import { HiveFooter } from '@/components/HiveFooter';
import TheRoadMark from '@/components/TheRoadMark';

interface PageProps {
  searchParams: Promise<{
    q?: string;
    buyer?: string;
    source?: string;
    brand?: string;
  }>;
}

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export default async function TemplatesHub({ searchParams }: PageProps) {
  const params = await searchParams;
  const query = params.q || '';
  const selectedBuyer = params.buyer || 'all';
  const selectedSource = params.source || 'all';
  const selectedBrand = params.brand || 'all';

  // Fetch live products via dbEdge
  let sqlText = `SELECT * FROM "Product" WHERE status = 'live'`;
  const queryParams: any[] = [];
  let paramIdx = 1;

  if (selectedBuyer !== 'all') {
    sqlText += ` AND buyer_tag = $${paramIdx++}`;
    queryParams.push(selectedBuyer);
  }
  if (selectedSource !== 'all') {
    sqlText += ` AND source_tag = $${paramIdx++}`;
    queryParams.push(selectedSource);
  }
  if (selectedBrand !== 'all') {
    sqlText += ` AND brand = $${paramIdx++}`;
    queryParams.push(selectedBrand);
  }
  if (query) {
    sqlText += ` AND (title ILIKE $${paramIdx} OR short_description ILIKE $${paramIdx} OR search_keywords ILIKE $${paramIdx})`;
    queryParams.push(`%${query}%`);
  }

  sqlText += ` ORDER BY price_cents ASC`;

  const products = await dbEdge(sqlText, queryParams) as any[];

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

  const isRoadView = selectedBrand === 'the_road';
  const pageBgClass = isRoadView ? 'bg-[#F4F1EA] text-[#1A1A1A]' : 'bg-[#0B0F19] text-[#E2E8F0]';
  const fontFamilyClass = isRoadView ? 'font-serif' : 'font-sans';
  const headerBgClass = isRoadView ? 'bg-[#EBE7DF]/95 border-b border-[#D4AF37]/30' : 'bg-[#0D111A]/80 border-b border-[#1F293D]';
  const headerTextClass = isRoadView ? 'text-[#1A1A1A]' : 'text-white';
  const borderClass = isRoadView ? 'border-[#D4AF37]/20' : 'border-[#1F293D]';

  const roadProducts = products.filter((p: any) => p.brand === 'the_road');
  const clinicalProducts = products.filter((p: any) => p.brand === 'clinical');

  return (
    <div className={`min-h-screen ${pageBgClass} ${fontFamilyClass} flex flex-col selection:bg-[#D4AF37] selection:text-[#0B0F19] transition-colors duration-300`}>
      {/* Dynamic SEO JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            'name': 'The Road Workbooks & Templates Hub',
            'description': 'Premium digital templates, guides, and compliance trackers from The Road Workbook series and clinical defense tools.',
            'url': 'https://hub.newphysician.org/templates'
          })
        }}
      />

      {/* Header / Nav */}
      <header className={`py-5 px-6 md:px-12 flex justify-between items-center ${headerBgClass} backdrop-blur-md sticky top-0 z-50 transition-all duration-300`}>
        <Link href="/" className="flex items-center gap-3 group">
          {isRoadView ? (
            <TheRoadMark size={32} />
          ) : (
            <div className="w-8 h-8 rounded border border-[#D4AF37] flex items-center justify-center font-bold text-xs tracking-wider text-[#D4AF37] group-hover:bg-[#D4AF37] group-hover:text-[#0B0F19] transition-all duration-300">
              TNP
            </div>
          )}
          <span className={`font-bold tracking-widest text-[#D4AF37] text-sm uppercase ${isRoadView ? 'font-sans' : ''}`}>
            {isRoadView ? 'THE ROAD' : 'The New Physician'}
          </span>
        </Link>
        <nav className={`flex gap-6 text-sm ${isRoadView ? 'text-[#4A4A4A]' : 'text-[#8F9CAE]'}`}>
          <Link href="/" className="hover:text-[#D4AF37] transition-colors">Home</Link>
          <span className="text-[#D4AF37] font-semibold">Templates</span>
          <a href="mailto:support@newphysician.org" className="hover:text-[#D4AF37] transition-colors">Support</a>
        </nav>
      </header>

      {/* Main Container */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-6 md:px-12 py-12 md:py-20">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className={`inline-block border ${isRoadView ? 'border-[#D4AF37]/40 bg-[#D4AF37]/5 text-[#B28F1B]' : 'border-[rgba(212,175,55,0.3)] bg-[rgba(212,175,55,0.05)] text-[#D4AF37]'} px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase mb-4`}>
            {isRoadView ? 'THE ROAD WORKBOOKS' : 'Actionable Blue-Ocean Resources'}
          </div>
          {isRoadView ? (
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-[#1A1A1A]">
              The Road Workbooks
            </h1>
          ) : (
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-white via-[#E2E8F0] to-[#D4AF37] bg-clip-text text-transparent">
              Digital Knowledge Templates
            </h1>
          )}
          <p className={`text-base md:text-lg leading-relaxed ${isRoadView ? 'text-[#3D3A36]' : 'text-[#ACB6C5]'}`}>
            {isRoadView 
              ? 'Calm-guide resources and workbook templates for justice-impacted defendants and families, authored by a physician-defendant and legal scholar.'
              : 'Bridging physician judgment, lived defendant experience, and legal scholarship into consumer-facing procedural guides and expert litigation blueprints.'}
          </p>
        </div>

        {/* Brand Selector Tabs */}
        <div className={`flex justify-center border-b ${borderClass} mb-10 pb-px`}>
          <div className="flex gap-8">
            {[
              { label: 'All Libraries', value: 'all' },
              { label: 'The Road Workbooks', value: 'the_road' },
              { label: 'Clinical Defense Library', value: 'clinical' }
            ].map((tab) => (
              <Link
                key={tab.value}
                href={`/templates?${new URLSearchParams({
                  ...(query ? { q: query } : {}),
                  ...(selectedBuyer !== 'all' ? { buyer: selectedBuyer } : {}),
                  ...(selectedSource !== 'all' ? { source: selectedSource } : {}),
                  brand: tab.value
                })}`}
                className={`pb-4 text-sm font-semibold tracking-wider uppercase border-b-2 transition-all ${
                  selectedBrand === tab.value
                    ? 'border-[#D4AF37] text-[#D4AF37]'
                    : `border-transparent ${isRoadView ? 'text-[#6A6560] hover:text-[#1A1A1A]' : 'text-[#8F9CAE] hover:text-white'}`
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Search & Filters Controls */}
        <div className={`border ${borderClass} rounded-2xl p-6 mb-12 shadow-xl ${isRoadView ? 'bg-white' : 'bg-[#0D111A]'}`}>
          <form method="GET" action="/templates" className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-grow">
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-[#5B6574]" />
              <input
                type="text"
                name="q"
                defaultValue={query}
                placeholder="Search templates (e.g. mitigation, exclusion, tracker)..."
                className={`w-full border rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-1 focus:ring-[#D4AF37] transition-all text-sm ${
                  isRoadView 
                    ? 'bg-[#F4F1EA] border-[#D4AF37]/20 text-[#1A1A1A] placeholder-[#8C847A] focus:border-[#D4AF37]' 
                    : 'bg-[#080B12] border-[#1F293D] text-[#E2E8F0] placeholder-[#5B6574] focus:border-[#D4AF37]'
                }`}
              />
              {selectedBuyer !== 'all' && <input type="hidden" name="buyer" value={selectedBuyer} />}
              {selectedSource !== 'all' && <input type="hidden" name="source" value={selectedSource} />}
              {selectedBrand !== 'all' && <input type="hidden" name="brand" value={selectedBrand} />}
            </div>
            <button
              type="submit"
              className="bg-[#D4AF37] hover:bg-[#BCA032] text-[#0B0F19] font-bold px-8 py-3.5 rounded-xl transition-all shadow-lg hover:shadow-[#D4AF37]/10 text-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              Search Hub
            </button>
          </form>

          {/* Filter Grid */}
          <div className={`flex flex-col gap-5 border-t ${borderClass} pt-5`}>
            {/* Buyer Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <span className={`text-xs font-bold tracking-wider uppercase flex items-center gap-1.5 w-32 ${isRoadView ? 'text-[#8C847A]' : 'text-[#5B6574]'}`}>
                <User className="w-3.5 h-3.5" /> Buyer Target:
              </span>
              <div className="flex flex-wrap gap-2">
                {buyerTags.map((t) => (
                  <Link
                    key={t.value}
                    href={`/templates?${new URLSearchParams({
                      ...(query ? { q: query } : {}),
                      ...(t.value !== 'all' ? { buyer: t.value } : {}),
                      ...(selectedSource !== 'all' ? { source: selectedSource } : {}),
                      ...(selectedBrand !== 'all' ? { brand: selectedBrand } : {})
                    })}`}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      selectedBuyer === t.value
                        ? 'border-[#D4AF37] bg-[rgba(212,175,55,0.1)] text-[#D4AF37]'
                        : `${isRoadView ? 'border-[#EBE7DF] hover:border-[#D4AF37]/40 text-[#6A6560]' : 'border-[#1F293D] hover:border-[#ACB6C5]/30 text-[#8F9CAE]'}`
                    }`}
                  >
                    {t.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Source Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <span className={`text-xs font-bold tracking-wider uppercase flex items-center gap-1.5 w-32 ${isRoadView ? 'text-[#8C847A]' : 'text-[#5B6574]'}`}>
                <BookOpen className="w-3.5 h-3.5" /> Core Source:
              </span>
              <div className="flex flex-wrap gap-2">
                {sourceTags.map((t) => (
                  <Link
                    key={t.value}
                    href={`/templates?${new URLSearchParams({
                      ...(query ? { q: query } : {}),
                      ...(selectedBuyer !== 'all' ? { buyer: selectedBuyer } : {}),
                      ...(t.value !== 'all' ? { source: t.value } : {}),
                      ...(selectedBrand !== 'all' ? { brand: selectedBrand } : {})
                    })}`}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      selectedSource === t.value
                        ? 'border-[#D4AF37] bg-[rgba(212,175,55,0.1)] text-[#D4AF37]'
                        : `${isRoadView ? 'border-[#EBE7DF] hover:border-[#D4AF37]/40 text-[#6A6560]' : 'border-[#1F293D] hover:border-[#ACB6C5]/30 text-[#8F9CAE]'}`
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
          <div className={`text-center py-20 border ${borderClass} rounded-2xl p-8 ${isRoadView ? 'bg-white' : 'bg-[#0D111A]'}`}>
            <SlidersHorizontal className="w-12 h-12 text-[#5B6574] mx-auto mb-4" />
            <h3 className={`text-lg font-bold mb-2 ${isRoadView ? 'text-[#1A1A1A]' : 'text-white'}`}>No Templates Found</h3>
            <p className={`${isRoadView ? 'text-[#6A6560]' : 'text-[#8F9CAE]'} max-w-md mx-auto text-sm leading-relaxed`}>
              We couldn't find any templates matching your search criteria. Try removing filters or searching for alternate terms.
            </p>
          </div>
        ) : (
          <div className="space-y-16">
            {/* The Road Section */}
            {(selectedBrand === 'all' || selectedBrand === 'the_road') && roadProducts.length > 0 && (
              <div>
                <div className={`flex items-center gap-3 border-b pb-4 mb-8 ${borderClass}`}>
                  <TheRoadMark size={40} />
                  <div>
                    <h2 className={`text-2xl font-bold tracking-tight ${isRoadView ? 'text-[#1A1A1A]' : 'text-white'}`}>
                      The Road Workbooks
                    </h2>
                    <p className={`text-xs mt-1 ${isRoadView ? 'text-[#6A6560]' : 'text-[#8F9CAE]'}`}>
                      Calm-guide defendant resources mended with gold.
                    </p>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {roadProducts.map((product: any) => (
                    <div
                      key={product.id}
                      className="bg-white border border-[#D4AF37]/20 rounded-2xl p-6 flex flex-col justify-between hover:border-[#D4AF37] hover:shadow-xl hover:shadow-[#D4AF37]/5 transition-all duration-300 group text-[#1A1A1A]"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <span className="text-[10px] font-bold tracking-widest text-[#D4AF37] uppercase bg-[#D4AF37]/5 border border-[#D4AF37]/30 px-2.5 py-1 rounded font-sans">
                            {product.format.toUpperCase()}
                          </span>
                          <span className="text-xs text-[#8C847A] font-medium uppercase tracking-wider font-sans">
                            {product.source_tag}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-[#1A1A1A] group-hover:text-[#D4AF37] transition-colors mb-2">
                          {product.title}
                        </h3>
                        <p className="text-[#5A5550] text-xs leading-relaxed line-clamp-3 mb-6 font-sans">
                          {product.short_description}
                        </p>
                      </div>
                      <div className="flex items-center justify-between border-t border-[#EBE7DF] pt-4 mt-4">
                        <div className="flex items-baseline text-[#1A1A1A]">
                          <span className="text-xs text-[#8C847A] mr-1">$</span>
                          <span className="text-xl font-bold font-mono">
                            {(product.price_cents / 100).toFixed(2)}
                          </span>
                        </div>
                        <Link
                          href={`/templates/${product.slug}`}
                          className="bg-[#2A2622] hover:bg-[#D4AF37] hover:text-[#0B0F19] text-white text-xs font-bold px-4 py-2.5 rounded-lg transition-all duration-200 cursor-pointer font-sans"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Clinical Section */}
            {(selectedBrand === 'all' || selectedBrand === 'clinical') && clinicalProducts.length > 0 && (
              <div>
                <div className={`flex items-center gap-3 border-b pb-4 mb-8 ${borderClass}`}>
                  <div className="w-10 h-10 rounded border border-[#D4AF37] flex items-center justify-center font-bold text-xs tracking-wider text-[#D4AF37]">
                    TNP
                  </div>
                  <div>
                    <h2 className="text-2xl font-extrabold tracking-tight text-white">
                      Clinical Defense Library
                    </h2>
                    <p className="text-xs text-[#8F9CAE] mt-1">
                      Professional frameworks, medical necessity defenses, and career pivot primers.
                    </p>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {clinicalProducts.map((product: any) => (
                    <div
                      key={product.id}
                      className="bg-[#0D111A] border border-[#1F293D] rounded-2xl p-6 flex flex-col justify-between hover:border-[#D4AF37]/50 hover:shadow-xl hover:shadow-[#D4AF37]/5 transition-all duration-300 group text-white"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <span className="text-[10px] font-bold tracking-widest text-[#D4AF37] uppercase bg-[rgba(212,175,55,0.05)] border border-[rgba(212,175,55,0.2)] px-2.5 py-1 rounded">
                            {product.format.toUpperCase()}
                          </span>
                          <span className="text-xs text-[#5B6574] font-medium uppercase tracking-wider">
                            {product.source_tag}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-white group-hover:text-[#D4AF37] transition-colors mb-2">
                          {product.title}
                        </h3>
                        <p className="text-[#8F9CAE] text-xs leading-relaxed line-clamp-3 mb-6">
                          {product.short_description}
                        </p>
                      </div>
                      <div className="flex items-center justify-between border-t border-[#1F293D]/50 pt-4 mt-4">
                        <div className="flex items-baseline text-white">
                          <span className="text-xs text-[#8F9CAE] mr-1">$</span>
                          <span className="text-xl font-bold font-mono">
                            {(product.price_cents / 100).toFixed(2)}
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
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <HiveFooter />
    </div>
  );
}
