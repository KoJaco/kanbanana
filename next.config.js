/** @type {import('next').NextConfig} */

const withPWA = require('next-pwa')({
    dest: 'public',
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === 'development',
    fallbacks: {
        document: '/pages/_offline.tsx',
    },
});

const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
};

// module.exports = nextConfig;
module.exports = withPWA(nextConfig);

// const withPWA = require('next-pwa');

// module.exports = withPWA({
//     pwa: {
//         dest: 'public',
//         register: true,
//         skipWaiting: true,
//     },
// });
