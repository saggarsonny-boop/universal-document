import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://converter.hive.baby', lastModified: new Date('2026-04-24'), changeFrequency: 'monthly', priority: 1 },
    { url: 'https://converter.hive.baby/pricing', lastModified: new Date('2026-04-24'), changeFrequency: 'monthly', priority: 0.7 },
    { url: 'https://converter.hive.baby/pro', lastModified: new Date('2026-04-24'), changeFrequency: 'monthly', priority: 0.7 },
  ]
}
