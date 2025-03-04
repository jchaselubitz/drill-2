// Import the necessary modules
import withPWA from 'next-pwa';
import type { Configuration } from 'webpack';
/** @type {NextConfig} */

const pwaConfig = withPWA({
  dest: 'public',
  register: true,
  disable: process.env.NEXT_PUBLIC_CONTEXT === 'development',
  // skipWaiting: false,
  // cacheOnFrontEndNav: true,
});

const nextConfig = {
  ...pwaConfig,
  transpilePackages: ['lamejs'],
  webpack: (config: Configuration) => {
    if (config.module?.parser?.javascript) {
      config.module.parser.javascript.dynamicImportMode = 'eager';
    }
    return config;
  },
  // reactStrictMode: false,
  // logging: {
  //   fetches: {
  //     fullUrl: true,
  //   },
  // },
};

export default nextConfig;
