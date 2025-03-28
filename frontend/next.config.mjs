/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React Strict Mode for better performance and detecting potential issues
  reactStrictMode: true,
  
  // Typescript configuration
  typescript: {
    // Consider enabling type checking during build for better error detection
    ignoreBuildErrors: false
  },
  
  // ESLint configuration
  eslint: {
    // Consider running ESLint during builds to catch potential issues
    ignoreDuringBuilds: false
  },
  
  // Image optimization
  images: {
    domains: [
      // Add domains you'll load images from here, for example:
      // 'example.com',
      // 'cdn.yoursite.com'
    ]
  },
  
  // Webpack configuration for Netlify compatibility
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Allow Netlify to handle Next.js functions
      config.externals.push('@netlify/zip-it-and-ship-it');
    }
    return config;
  }
};

// Use ES Module export syntax
export default nextConfig;