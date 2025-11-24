/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable dynamic rendering for API routes and pages that need real-time data
  experimental: {
    // Ensure proper handling of dynamic routes
  },
  // Configure for Vercel deployment
  output: 'standalone',
};

export default nextConfig;
