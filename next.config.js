/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Tell Next.js to bundle the data file with every server function.
  outputFileTracingIncludes: {
    "/*": ["./data/**"],
    "/api/*": ["./data/**"],
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "uusmaanord.ee" },
      { protocol: "https", hostname: "uusmaa.ee" },
    ],
  },
};
module.exports = nextConfig;
