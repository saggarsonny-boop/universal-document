import { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Ud Trust | Hive',
    short_name: 'Ud Trust',
    description: 'Sovereign-Lite tactical engine by the Hive.',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#D4AF37',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  }
}