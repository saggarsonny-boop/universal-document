import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, ShieldAlert, CreditCard, Layers } from 'lucide-react';
import { HiveFooter } from '@/components/HiveFooter';
import CheckoutButton from './CheckoutButton';
import TheRoadMark from '@/components/TheRoadMark';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export const dynamic = 'force-dynamic';

export default async function TemplateDetails({ params }: PageProps) {
  const { slug } = await params;

  const product = await db.product.findUnique({
    where: { slug }
  });

  if (!product || product.status !== 'live') {
    notFound();
  }

  // If this is a bundle, fetch details of the bundled products
  let bundledProducts: any[] = [];
  if (product.is_bundle && product.bundle_items) {
    try {
      const itemSlugs = JSON.parse(product.bundle_items);
      bundledProducts = await db.product.findMany({
        where: {
          slug: { in: itemSlugs }
        },
        select: {
          title: true,
          short_description: true,
          slug: true
        }
      });
    } catch (e) {
      console.error('Error parsing bundle items:', e);
    }
  }

  // Determine specific disclaimer based on tags
  const isLegal = ['road', 'busted', 'ssrn'].includes(product.source_tag);
  const isClinicalOrCareer = ['er_clinical', 'atls', 'physician_career'].includes(product.source_tag);

  const isRoad = product.brand === 'the_road';
  const pageBgClass = isRoad ? 'bg-[#F4F1EA] text-[#1A1A1A] font-serif' : 'bg-[#0B0F19] text-[#E2E8F0] font-sans';
  const headerBorderClass = isRoad ? 'border-[#D4AF37]/20 bg-[#EBE7DF]/90' : 'border-[#1F293D] bg-[#0D111A]/80';
  const headerLinkClass = isRoad ? 'text-[#4A4A4A]' : 'text-[#8F9CAE]';
  const titleTextClass = isRoad ? 'text-[#1A1A1A]' : 'text-white';
  const descriptionTextClass = isRoad ? 'text-[#3D3A36]' : 'text-[#ACB6C5]';
  const borderClass = isRoad ? 'border-[#D4AF37]/20' : 'border-[#1F293D]';
  const longDescClass = isRoad ? 'text-[#4A4A4A] font-sans' : 'text-[#8F9CAE]';
  const containerBgClass = isRoad ? 'bg-white border-[#D4AF37]/30' : 'bg-[#0D111A] border-[rgba(212,175,55,0.2)]';
  const itemTitleClass = isRoad ? 'text-[#1A1A1A]' : 'text-white';
  const itemDescClass = isRoad ? 'text-[#5A5550]' : 'text-[#8F9CAE]';
  const securityBoxClass = isRoad ? 'bg-white border-[#D4AF37]/20' : 'bg-[#0D111A] border-[#1F293D]';
  const securityTitleClass = isRoad ? 'text-[#1A1A1A]' : 'text-white';
  const securityBodyClass = isRoad ? 'text-[#5A5550]' : 'text-[#8F9CAE]';
  const widgetClass = isRoad ? 'bg-white border-[#D4AF37]/30' : 'bg-[#0D111A] border-[#1F293D]';
  const priceLabelClass = isRoad ? 'text-[#5A5550]' : 'text-[#8F9CAE]';
  const priceTextClass = isRoad ? 'text-[#1A1A1A]' : 'text-white';
  const stripeTextClass = isRoad ? 'text-[#5A5550]' : 'text-[#8F9CAE]';
  const disclaimerBoxClass = isRoad ? 'bg-[#F4F1EA] border-[#D4AF37]/20 text-[#5A5550]' : 'bg-[#080B12] border-[#1F293D]/50 text-[#8F9CAE]';
  const disclaimerTitleClass = isRoad ? 'text-[#1A1A1A]' : 'text-white';

  return (
    <div className={`min-h-screen ${pageBgClass} flex flex-col selection:bg-[#D4AF37] selection:text-[#0B0F19] transition-colors duration-300`}>
      {/* Dynamic SEO JSON-LD Product & Offer Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            'name': product.title,
            'description': product.short_description,
            'offers': {
              '@type': 'Offer',
              'price': (product.price_cents / 100).toFixed(2),
              'priceCurrency': product.currency.toUpperCase(),
              'availability': 'https://schema.org/InStock',
              'url': `https://hub.newphysician.org/templates/${product.slug}`
            }
          })
        }}
      />

      <header className={`border-b ${headerBorderClass} py-5 px-6 md:px-12 flex justify-between items-center backdrop-blur-md sticky top-0 z-50 transition-all duration-300`}>
        <Link href="/templates" className={`flex items-center gap-2 hover:text-[#D4AF37] transition-colors text-sm ${headerLinkClass}`}>
          <ArrowLeft className="w-4 h-4" /> Back to Templates
        </Link>
        {isRoad ? (
          <div className="flex items-center gap-2 font-sans font-bold tracking-widest text-[#D4AF37] text-xs uppercase">
            <TheRoadMark size={20} />
            <span>THE ROAD WORKBOOKS</span>
          </div>
        ) : (
          <span className="font-bold tracking-widest text-[#D4AF37] text-xs uppercase">The New Physician</span>
        )}
      </header>

      <main className="flex-grow max-w-5xl mx-auto w-full px-6 py-12 md:py-16">
        <div className="grid md:grid-cols-3 gap-8 md:gap-12">
          {/* Product Info (Col-Span 2) */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[10px] font-bold tracking-widest text-[#D4AF37] uppercase bg-[rgba(212,175,55,0.05)] border border-[rgba(212,175,55,0.2)] px-2.5 py-1 rounded">
                {product.format.toUpperCase()}
              </span>
              <span className={`text-xs font-medium uppercase tracking-wider ${isRoad ? 'text-[#8C847A]' : 'text-[#5B6574]'}`}>
                Source: {product.source_tag}
              </span>
            </div>

            <h1 className={`text-3xl md:text-4xl font-extrabold tracking-tight mb-4 ${titleTextClass}`}>
              {product.title}
            </h1>

            <p className={`${descriptionTextClass} text-base md:text-lg leading-relaxed mb-8 border-b ${borderClass} pb-8`}>
              {product.short_description}
            </p>

            <div className="prose prose-invert max-w-none mb-8">
              <h3 className="text-sm font-bold tracking-wider text-[#D4AF37] uppercase mb-4">Product Overview</h3>
              <p className={`${longDescClass} text-sm leading-relaxed mb-6 whitespace-pre-line`}>
                {product.long_description}
              </p>
            </div>

            {/* If Bundle, show included items */}
            {product.is_bundle && bundledProducts.length > 0 && (
              <div className={`border rounded-2xl p-6 mb-8 ${containerBgClass}`}>
                <h3 className={`text-sm font-bold tracking-wider text-[#D4AF37] uppercase mb-4 flex items-center gap-2 ${isRoad ? 'font-sans' : ''}`}>
                  <Layers className="w-4 h-4" /> Included in this Toolkit:
                </h3>
                <div className="space-y-4">
                  {bundledProducts.map((item) => (
                    <div key={item.slug} className="flex gap-3">
                      <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                      <div>
                        <h4 className={`text-xs font-bold ${itemTitleClass}`}>{item.title}</h4>
                        <p className={`${itemDescClass} text-[11px] leading-relaxed mt-0.5`}>{item.short_description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Security Stamp Statement */}
            <div className={`border rounded-2xl p-5 mb-8 ${securityBoxClass}`}>
              <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 ${securityTitleClass}`}>Dynamic Anti-Piracy Protection</h4>
              <p className={`${securityBodyClass} text-xs leading-relaxed`}>
                To prevent unauthorized sharing, this document is dynamically generated at the moment of purchase. Every page is watermarked with the buyer's verified name, email address, and transaction ID.
              </p>
            </div>
          </div>

          {/* Checkout Widget (Col-Span 1) */}
          <div className="md:col-span-1">
            <div className={`border rounded-2xl p-6 shadow-xl sticky top-24 ${widgetClass}`}>
              <div className="text-center mb-6">
                <span className={`text-xs font-semibold uppercase tracking-wider block mb-1 ${priceLabelClass}`}>Pricing</span>
                <div className={`flex items-baseline justify-center ${priceTextClass}`}>
                  <span className="text-xl font-medium mr-1">$</span>
                  <span className="text-4xl font-extrabold font-mono">
                    {(product.price_cents / 100).toFixed(2)}
                  </span>
                </div>
                <span className="text-[10px] text-[#5B6574] tracking-wider block mt-1 font-sans">One-time purchase · Instant download</span>
              </div>

              {/* Checkout Interactive Client Component Button */}
              <CheckoutButton productId={product.id} />

              <div className={`mt-6 space-y-4 border-t ${borderClass} pt-6`}>
                <div className={`flex items-center gap-3 text-xs ${stripeTextClass}`}>
                  <CreditCard className="w-4 h-4 text-[#D4AF37] shrink-0" />
                  <span>Secure credit card processing by Stripe</span>
                </div>
                <div className={`flex items-start gap-3 text-[11px] leading-relaxed p-3 rounded-lg border ${disclaimerBoxClass}`}>
                  <ShieldAlert className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                  <div>
                    <span className={`font-bold block mb-0.5 ${disclaimerTitleClass}`}>Procedural Disclaimer</span>
                    {isLegal && (
                      <span>This template is for educational and informational purposes only. It does not constitute formal legal advice, nor does it establish an attorney-client relationship.</span>
                    )}
                    {isClinicalOrCareer && (
                      <span>This product represents professional judgment applied to documents. It does not imply active, federally-reimbursed clinical practice or guarantee state licensing board outcomes.</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <HiveFooter />
    </div>
  );
}

