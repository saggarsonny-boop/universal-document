export const REGISTRY_SITE_URL =
  process.env.NEXT_PUBLIC_REGISTRY_URL || 'https://registry.universaldocument.org'

export const REGISTRY_PATHS = {
  home: '/registry',
  governance: '/registry/governance',
  schemas: '/registry/schemas',
} as const
