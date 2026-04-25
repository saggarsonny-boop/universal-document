const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['mammoth', 'pdfjs-dist'],
  webpack: (config) => {
    config.resolve.alias.canvas = false
    config.resolve.alias.encoding = false
    config.resolve.alias['@shared'] = path.resolve(__dirname, '../shared')
    // Allow shared lib to resolve packages from this app's node_modules
    config.resolve.modules = [path.resolve(__dirname, 'node_modules'), 'node_modules']
    return config
  },
}

module.exports = nextConfig
