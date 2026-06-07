const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    // Polyfill Node.js native built-ins and binaries for Cloudflare Pages (Edge)
    const mockPath = path.resolve(__dirname, 'src/lib/edge-mocks.js')
    config.resolve.alias['child_process'] = mockPath
    config.resolve.alias['fs'] = mockPath
    config.resolve.alias['path'] = mockPath
    config.resolve.alias['crypto'] = mockPath
    config.resolve.alias['sharp'] = mockPath
    config.resolve.alias['html-to-docx'] = mockPath
    config.resolve.alias['detect-libc'] = mockPath

    return config
  },
}

module.exports = nextConfig
