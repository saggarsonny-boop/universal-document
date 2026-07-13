import { MetadataRoute } from 'next';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://hub.newphysician.org';

  // Base routes
  const routes = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/templates`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
  ];

  // Fetch all live products to populate dynamic pages
  try {
    const liveProducts = await db.product.findMany({
      where: { status: 'live' },
      select: { slug: true, created_at: true }
    });

    const productUrls = liveProducts.map((p: any) => ({
      url: `${baseUrl}/templates/${p.slug}`,
      lastModified: p.created_at,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    return [...routes, ...productUrls];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return routes;
  }
}
