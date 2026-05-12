const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['mammoth', 'pdfjs-dist'],
  webpack: (config) => {
    config.resolve.alias.canvas = false
    config.resolve.alias.encoding = false
    config.resolve.alias['@shared'] = path.resolve(__dirname, '../shared')
    // @hive/onboarding source is inlined at src/lib/hive-onboarding/ —
    // see that directory's README. The alias lets engine code import
    // as if from the canonical npm package.
    config.resolve.alias['@hive/onboarding'] = path.resolve(__dirname, 'src', 'lib', 'hive-onboarding')
    // Allow shared lib to resolve packages from this app's node_modules
    config.resolve.modules = [path.resolve(__dirname, 'node_modules'), 'node_modules']
    return config
  },
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
}

module.exports = nextConfig
