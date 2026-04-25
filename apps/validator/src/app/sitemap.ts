import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://validator.hive.baby', lastModified: new Date('2026-04-24'), changeFrequency: 'monthly', priority: 1 },
  ]
}
