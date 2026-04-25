import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://creator.hive.baby', lastModified: new Date('2026-04-24'), changeFrequency: 'monthly', priority: 1 },
    { url: 'https://creator.hive.baby/pricing', lastModified: new Date('2026-04-24'), changeFrequency: 'monthly', priority: 0.7 },
  ]
}
