/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compress: true,
  transpilePackages: ['@smartcampus-os/types', '@smartcampus-os/validation'],
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    viewTransition: true,
    // Optimize package imports, preventing heavy libraries from increasing initial chunk sizes
    optimizePackageImports: [
      '@radix-ui/react-icons',
      'lucide-react',
      'react-icons',
      'recharts',
      'date-fns'
    ],
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
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
