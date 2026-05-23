/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      const alias = config.resolve.alias || {};
      const mockPath = '/Users/sonnyneo/.gemini/antigravity/scratch/universal-document/apps/hive-teleprompter/src/lib/edge-mocks.js';
      
      alias['crypto'] = mockPath;
      alias['node:crypto'] = mockPath;
      alias['url'] = mockPath;
      alias['node:url'] = mockPath;
      alias['querystring'] = mockPath;
      alias['node:querystring'] = mockPath;
      alias['http'] = mockPath;
      alias['node:http'] = mockPath;
      alias['https'] = mockPath;
      alias['node:https'] = mockPath;
      alias['stream'] = mockPath;
      alias['node:stream'] = mockPath;
      alias['net'] = mockPath;
      alias['node:net'] = mockPath;
      alias['tls'] = mockPath;
      alias['node:tls'] = mockPath;
      alias['fs'] = mockPath;
      alias['node:fs'] = mockPath;

      config.resolve.alias = alias;
    }
    return config;
  }
};

export default nextConfig;
