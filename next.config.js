/** @type {import('next').NextConfig} */

// const withPWA = require('next-pwa')({
//     dest: 'public',
// });

const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
};

module.exports = nextConfig;
// module.exports = withPWA(nextConfig);
