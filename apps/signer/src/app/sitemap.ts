import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://signer.hive.baby', lastModified: new Date('2026-04-24'), changeFrequency: 'monthly', priority: 1 },
    { url: 'https://signer.hive.baby/sign', lastModified: new Date('2026-04-24'), changeFrequency: 'monthly', priority: 0.8 },
    { url: 'https://signer.hive.baby/verify', lastModified: new Date('2026-04-24'), changeFrequency: 'monthly', priority: 0.8 },
  ]
}
