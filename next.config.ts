import { withSentryConfig } from '@sentry/nextjs';
// Import the necessary modules
import withPWA from 'next-pwa';
/** @type {NextConfig} */

const pwaConfig = withPWA({
  dest: 'public',
  register: true,
  disable: process.env.NEXT_PUBLIC_CONTEXT === 'development',
  skipWaiting: true,
  buildExcludes: [/middleware-manifest\.json$/],
  sw: '/sw.js',
  runtimeCaching: [
    {
      urlPattern: /^https?.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'offlineCache',
        expiration: {
          maxEntries: 200,
        },
      },
    },
  ],
});

const nextConfig = {
  ...pwaConfig,
  transpilePackages: ['lamejs'],
  serverExternalPackages: ['@sentry/nextjs'],
  experimental: {
    // Optimize for modern browsers to reduce polyfills
    optimizePackageImports: [
      '@radix-ui/react-icons',
      'lucide-react',
      'date-fns',
      '@tiptap/react', // Add your heavy dependencies
      '@tiptap/starter-kit',
      '@supabase/supabase-js',
    ],
  },

  // reactStrictMode: false,
  // logging: {
  //   fetches: {
  //     fullUrl: true,
  //   },
  // },
};

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: 'cooperativ-labs',
  project: 'drill',

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: '/monitoring',

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
  // See the following for more information:
  // https://docs.sentry.io/product/crons/
  // https://vercel.com/docs/cron-jobs
  // automaticVercelMonitors: true,
});
