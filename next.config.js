/** @type {import('next').NextConfig} */

const withPWA = require('next-pwa')({
    dest: 'public',
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === 'development',
});

const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,

    async headers() {
        return [
            {
                source: '/:path*{/}',
                headers: [
                    {
                        key: 'Content-Type',
                        value: 'text/html; charset=UTF-8',
                    },
                ],
            },
        ];
    },
};

module.exports = withPWA(nextConfig);
