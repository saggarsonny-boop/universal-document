import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE_URL.replace(/\/$/, '')

  return [
    { url: base, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/governance`, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/schemas`, changeFrequency: 'weekly', priority: 0.8 },
  ]
}
