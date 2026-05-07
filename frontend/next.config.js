/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    styledComponents: true
  },
  images: {
    domains: ['img.clerk.com']
  }
};

module.exports = nextConfig;