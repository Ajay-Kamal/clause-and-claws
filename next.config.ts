/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbo: false, // Disable turbopack temporarily
  },
  eslint: {
    ignoreDuringBuilds: true,
  }
}

module.exports = nextConfig