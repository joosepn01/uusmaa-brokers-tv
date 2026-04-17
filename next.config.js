/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "uusmaanord.ee" },
      { protocol: "https", hostname: "uusmaa.ee" },
    ],
  },
};
module.exports = nextConfig;
