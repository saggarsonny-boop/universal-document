import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/templates/success', '/templates/cancel'],
    },
    sitemap: 'https://hub.newphysician.org/sitemap.xml',
  };
}
