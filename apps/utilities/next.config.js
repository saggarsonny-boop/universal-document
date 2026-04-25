const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['pdf-lib', 'tesseract.js'],
  webpack: (config) => {
    config.resolve.alias.canvas = false
    config.resolve.alias.encoding = false
    config.resolve.alias['@shared'] = path.resolve(__dirname, '../shared')
    config.resolve.modules = [path.resolve(__dirname, 'node_modules'), 'node_modules']
    return config
  },
}

module.exports = nextConfig
