/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ["localhost", "blob.vercel-storage.com"],
    unoptimized: true,
  },
  experimental: {
    serverComponentsExternalPackages: ["sharp"],
  },
}

module.exports = nextConfig
