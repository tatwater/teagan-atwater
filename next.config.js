/** @type { import('next').NextConfig } */

const path = require('path');
const runtimeCaching = require('next-pwa/cache');

const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching,
});

const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: 'cdn.sanity.io',
        protocol: 'https',
      }
    ]
  },
  sassOptions: {
    includePaths: [
      path.join(__dirname, 'app'),
      path.join(__dirname, 'components'),
      path.join(__dirname, 'styles'),
    ]
  }
};


module.exports = withPWA(nextConfig);
