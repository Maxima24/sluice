import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Standalone output for a small Docker image (deploys separately from the backend).
  output: 'standalone',
};

export default nextConfig;
