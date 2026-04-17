/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Tell Vercel's bundler to include the data file inside
  // each serverless function so readData() can find it.
  outputFileTracingIncludes: {
    "/**": ["./data/**"],
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "uusmaanord.ee" },
      { protocol: "https", hostname: "uusmaa.ee" },
    ],
  },
};
module.exports = nextConfig;
