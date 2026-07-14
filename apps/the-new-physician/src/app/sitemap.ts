import { MetadataRoute } from 'next';
import { dbEdge } from '@/lib/db-edge';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

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
    const liveProducts = await dbEdge('SELECT slug, created_at FROM "Product" WHERE status = $1', ['live']) as any[];

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
