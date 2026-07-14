import { dbEdge } from '@/lib/db-edge';
import { watermarkPdf } from '@/lib/watermarker';
import { zipSync } from 'fflate';

export const runtime = 'edge';

// Master PDFs are stored as bytea in product_files (loaded by prisma/seed.js
// from private-templates/). base64 round-trip keeps the bytes driver-agnostic.
async function fetchMaster(slug: string): Promise<Buffer> {
  const rows = await dbEdge(
    `SELECT encode(pdf, 'base64') AS pdf_b64, byte_size FROM product_files WHERE product_slug = $1`,
    [slug]
  ) as any[];
  const row = rows[0];
  if (!row?.pdf_b64) {
    throw new Error(`No master PDF stored for product "${slug}"`);
  }
  const bytes = Buffer.from(row.pdf_b64, 'base64');
  if (bytes.length !== Number(row.byte_size)) {
    throw new Error(`Master PDF for "${slug}" failed integrity check (${bytes.length} != ${row.byte_size})`);
  }
  return bytes;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return new Response('Download token is required', { status: 400 });
    }

    const orders = await dbEdge(
      'SELECT id, product_id, buyer_email, buyer_name, token_expires_at FROM orders WHERE download_token = $1',
      [token]
    ) as any[];
    const order = orders[0];

    if (!order) {
      return new Response('Invalid download link', { status: 404 });
    }

    if (order.token_expires_at && new Date() > new Date(order.token_expires_at)) {
      return new Response('This download link has expired (valid for 24h only)', { status: 410 });
    }

    const products = await dbEdge(
      'SELECT id, slug, is_bundle, bundle_items, title FROM "Product" WHERE id = $1',
      [order.product_id]
    ) as any[];
    const product = products[0];

    if (!product) {
      return new Response('Associated product not found', { status: 404 });
    }

    const watermarkOptions = {
      buyerName: order.buyer_name,
      buyerEmail: order.buyer_email,
      orderId: order.id
    };

    if (product.is_bundle && product.bundle_items) {
      // Bundle: watermark every included master and deliver one ZIP.
      const itemSlugs: string[] = JSON.parse(product.bundle_items);
      const entries: Record<string, Uint8Array> = {};

      for (const slug of itemSlugs) {
        const master = await fetchMaster(slug);
        const watermarked = await watermarkPdf(master, watermarkOptions);
        entries[`${slug}.pdf`] = new Uint8Array(watermarked);
      }

      const zipped = zipSync(entries, { level: 6 });

      return new Response(new Uint8Array(zipped), {
        headers: {
          'Content-Type': 'application/zip',
          'Content-Disposition': `attachment; filename="${product.slug}.zip"`,
          'Content-Length': zipped.length.toString()
        }
      });
    }

    // Single product: watermark the real master. No placeholder fallback —
    // a product without a stored master must fail loudly, not deliver a blank.
    const master = await fetchMaster(product.slug);
    const watermarkedBytes = await watermarkPdf(master, watermarkOptions);

    return new Response(new Uint8Array(watermarkedBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${product.slug}.pdf"`,
        'Content-Length': watermarkedBytes.length.toString()
      }
    });
  } catch (error: any) {
    console.error('Download route error:', error);
    return new Response('We could not prepare your download. Please contact support@newphysician.org with your order email.', { status: 500 });
  }
}
