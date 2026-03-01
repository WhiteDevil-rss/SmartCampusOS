/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Force aggressive SWC minification and production compression
  swcMinify: true,
  compress: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
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
};

export default nextConfig;
