/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  basePath: '/admin',
  images: {
    domains: ['s3.sixfalls.me'],
  },
}

module.exports = nextConfig
