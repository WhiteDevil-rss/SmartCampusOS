/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Force aggressive SWC minification and production compression
  swcMinify: true,
  compress: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  incremental: true,
  transpilePackages: ['@smartcampus-os/types', '@smartcampus-os/validation'],
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    // Optimize package imports, preventing heavy libraries from increasing initial chunk sizes
    optimizePackageImports: [
      '@radix-ui/react-icons',
      'lucide-react',
      'react-icons',
      'recharts',
      'date-fns'
    ],
  },
  async rewrites() {
    return [
      {
        source: '/v1/:path*',
        destination: 'http://127.0.0.1:5001/v1/:path*',
      },
      {
        source: '/v2/:path*',
        destination: 'http://127.0.0.1:5001/v2/:path*',
      },
    ];
  },
};

export default nextConfig;
