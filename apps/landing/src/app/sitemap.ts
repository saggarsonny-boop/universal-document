import { MetadataRoute } from 'next'

const ROUTES = [
  '/',
  '/whitepaper',
  '/isdk',
  '/csdk',
  '/support',
  '/certified',
  '/demos',
  '/docs',
]

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map(route => ({
    url: `https://ud.hive.baby${route}`,
    lastModified: new Date('2026-04-24'),
    changeFrequency: 'monthly',
    priority: route === '/' ? 1 : 0.8,
  }))
}
