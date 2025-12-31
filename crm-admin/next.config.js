/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    optimizeCss: true
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://162.43.91.102:5000/api/:path*',
      },
    ];
  },
}

module.exports = nextConfig
