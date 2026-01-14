/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  transpilePackages: ['lucide-react'],
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://backend:8000/api/:path*/',
      },
      {
        source: '/media/:path*',
        destination: '/public/media/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
