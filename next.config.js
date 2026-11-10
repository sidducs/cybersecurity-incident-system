/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Support server external packages for native Node modules
  experimental: {
    serverComponentsExternalPackages: ['pg', 'bcryptjs']
  }
};

module.exports = nextConfig;

