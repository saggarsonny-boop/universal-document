import { dbEdge } from '@/lib/db-edge';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft, CheckCircle2, ShieldAlert, CreditCard, Layers } from 'lucide-react';
import { HiveFooter } from '@/components/HiveFooter';
import CheckoutButton from './CheckoutButton';
import TheRoadMark from '@/components/TheRoadMark';
import { BUYER_TAG_LABELS } from '@/data/storeSections';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

function formatPrice(cents: number): string {
  return cents % 100 === 0 ? `$${cents / 100}` : `$${(cents / 100).toFixed(2)}`;
}

async function getProduct(slug: string) {
  const products = await dbEdge('SELECT * FROM "Product" WHERE slug = $1', [slug]) as any[];
  return products[0] || null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product || product.status !== 'live') {
    return { title: 'Not found — The Road Workbooks' };
  }
  return {
    title: `${product.title} — The Road Workbooks`,
    description: product.short_description,
    alternates: { canonical: `https://hub.newphysician.org/templates/${product.slug}` },
  };
}

export default async function TemplateDetails({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product || product.status !== 'live') {
    notFound();
  }

  // If this is a bundle, fetch details of the bundled products
  let bundledProducts: any[] = [];
  let singlesTotalCents = 0;
  if (product.is_bundle && product.bundle_items) {
    try {
      const itemSlugs = JSON.parse(product.bundle_items);
      bundledProducts = await dbEdge(
        'SELECT title, short_description, slug, price_cents FROM "Product" WHERE slug = ANY($1) AND status = $2 ORDER BY title',
        [itemSlugs, 'live']
      ) as any[];
      singlesTotalCents = bundledProducts.reduce((sum, p) => sum + Number(p.price_cents), 0);
    } catch (e) {
      console.error('Error parsing bundle items:', e);
    }
  }

  const isLegal = ['road', 'busted', 'ssrn', 'niccc', 'ccrc', 'ftc', 'sesame'].includes(product.source_tag);
  const savings = singlesTotalCents - Number(product.price_cents);
  const goldText = 'text-[#D4AF37] print:text-[#8A6D14]';

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-neutral-300 font-sans selection:bg-[#D4AF37] selection:text-black flex flex-col">
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

      {/* Navigation — mirrors the newphysician.org front page */}
      <nav className="sticky top-0 w-full z-50 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-neutral-900">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/templates" className="flex items-center gap-2 text-sm text-neutral-400 hover:text-[#D4AF37] transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Templates
          </Link>
          <div className="flex items-center gap-2.5 font-display font-bold tracking-widest text-white text-xs uppercase">
            <TheRoadMark size={22} />
            <span>The Road Workbooks</span>
          </div>
        </div>
      </nav>

      <div className="flex-grow max-w-5xl mx-auto w-full px-6 py-12 md:py-16">
        <div className="grid md:grid-cols-3 gap-8 md:gap-12">
          {/* Product Info (Col-Span 2) */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <span className={`text-[10px] font-bold tracking-widest uppercase bg-[#D4AF37]/5 border border-[#D4AF37]/30 px-2.5 py-1 rounded ${goldText}`}>
                {product.is_bundle ? 'Bundle' : 'PDF Workbook'}
              </span>
              <span className="text-xs font-medium uppercase tracking-wider text-neutral-500">
                {BUYER_TAG_LABELS[product.buyer_tag] || product.buyer_tag}
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-display font-bold text-white tracking-tight mb-4">
              {product.title}
            </h1>

            <p className="text-neutral-400 text-base md:text-lg leading-relaxed mb-8 border-b border-neutral-900 pb-8">
              {product.short_description}
            </p>

            <div className="max-w-none mb-8">
              <h3 className={`text-sm font-bold tracking-wider uppercase mb-4 ${goldText}`}>Overview</h3>
              <p className="text-neutral-400 text-sm leading-relaxed mb-6 whitespace-pre-line">
                {product.long_description}
              </p>
            </div>

            {/* If Bundle, show included items */}
            {product.is_bundle && bundledProducts.length > 0 && (
              <div className="bg-[#111111] border border-neutral-800 rounded-2xl p-6 mb-8">
                <h3 className={`text-sm font-bold tracking-wider uppercase mb-4 flex items-center gap-2 ${goldText}`}>
                  <Layers className="w-4 h-4" /> Included in this bundle ({bundledProducts.length} workbooks):
                </h3>
                <div className="space-y-4">
                  {bundledProducts.map((item) => (
                    <div key={item.slug} className="flex gap-3">
                      <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                      <div className="flex-grow">
                        <Link href={`/templates/${item.slug}`} className="text-xs font-bold text-white hover:text-[#D4AF37] transition-colors">
                          {item.title}
                        </Link>
                        <p className="text-neutral-500 text-[11px] leading-relaxed mt-0.5">{item.short_description}</p>
                      </div>
                      <span className="text-xs text-neutral-500 whitespace-nowrap">{formatPrice(Number(item.price_cents))}</span>
                    </div>
                  ))}
                </div>
                {savings > 0 && (
                  <p className="text-xs text-neutral-400 mt-5 pt-4 border-t border-neutral-900">
                    Bought singly these total <span className="line-through">{formatPrice(singlesTotalCents)}</span> —
                    this bundle is <span className={`font-bold ${goldText}`}>{formatPrice(Number(product.price_cents))}</span>, saving you {formatPrice(savings)}.
                  </p>
                )}
              </div>
            )}

            {/* Watermarking statement */}
            <div className="bg-[#111111] border border-neutral-800 rounded-2xl p-5 mb-8">
              <h4 className="text-xs font-bold uppercase tracking-wider mb-2 text-white">Per-Buyer Watermarking</h4>
              <p className="text-neutral-500 text-xs leading-relaxed">
                To discourage unauthorized sharing, your copy is generated at the moment of purchase.
                Every page is watermarked with the buyer&apos;s name, email address, and order ID.
              </p>
            </div>
          </div>

          {/* Checkout Widget (Col-Span 1) */}
          <div className="md:col-span-1">
            <div className="bg-[#111111] border border-neutral-800 rounded-2xl p-6 shadow-xl md:sticky md:top-24">
              <div className="text-center mb-6">
                <span className="text-xs font-semibold uppercase tracking-wider block mb-1 text-neutral-500">Price</span>
                <div className="flex items-baseline justify-center text-white">
                  <span className="text-xl font-medium mr-1">$</span>
                  <span className="text-4xl font-extrabold font-mono">
                    {(product.price_cents / 100).toFixed(2)}
                  </span>
                </div>
                <span className="text-[10px] text-neutral-600 tracking-wider block mt-1">
                  One-time purchase · Instant download{product.is_bundle ? ' (ZIP of all workbooks)' : ''}
                </span>
              </div>

              <CheckoutButton productId={product.id} />

              <div className="mt-6 space-y-4 border-t border-neutral-900 pt-6">
                <div className="flex items-center gap-3 text-xs text-neutral-500">
                  <CreditCard className="w-4 h-4 text-[#D4AF37] shrink-0" />
                  <span>Secure card processing by Stripe</span>
                </div>
                <div className="flex items-start gap-3 text-[11px] leading-relaxed p-3 rounded-lg border border-neutral-800 bg-[#0a0a0a] text-neutral-500">
                  <ShieldAlert className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block mb-0.5 text-white">Educational, Not Legal Advice</span>
                    {isLegal ? (
                      <span>This workbook is for educational and informational purposes only. It does not constitute legal advice and does not create an attorney-client relationship.</span>
                    ) : (
                      <span>This product represents professional judgment applied to documents. It does not imply active clinical practice or guarantee licensing board outcomes.</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <HiveFooter />
    </main>
  );
}
