/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { hostname: 'images.unsplash.com' },
      { hostname: 'avatars.githubusercontent.com' },
      { hostname: 'vimeo.com' }
    ],
  },
  // Optimize build performance
  swcMinify: true,
  // Reduce bundle size
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Optimize for Vercel deployment
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  // Increase build timeout
  staticPageGenerationTimeout: 180,
  // Optimize output
  output: 'standalone',
};

export default nextConfig;
