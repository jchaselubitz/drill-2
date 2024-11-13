// // Import the necessary modules
// import withPWA from 'next-pwa';
// /** @type {NextConfig} */

// const pwaConfig = withPWA({
//   dest: 'public',
//   register: true,
//   disable: process.env.NEXT_PUBLIC_CONTEXT === 'development',
//   // skipWaiting: false,
//   // cacheOnFrontEndNav: true,
// });

// const nextConfig = {
//   ...pwaConfig,

//   // reactStrictMode: false,
//   // logging: {
//   //   fetches: {
//   //     fullUrl: true,
//   //   },
//   // },
// };

// export default nextConfig;
/** @type {import('next').NextConfig} */

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  disable: process.env.NEXT_PUBLIC_CONTEXT === 'development',
  // skipWaiting: false,
  // cacheOnFrontEndNav: true,
});

const nextConfig = withPWA({
  swcMinify: true,

  // reactStrictMode: false,
  // logging: {
  //   fetches: {
  //     fullUrl: true,
  //   },
  // },
});

module.exports = nextConfig;
