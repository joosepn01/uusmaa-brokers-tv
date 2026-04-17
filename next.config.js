/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Static export — emits plain HTML/CSS/JS into out/, hostable on any static
  // host (Cloudflare Pages, GitHub Pages, Netlify, plain nginx…).
  output: "export",
  // Cloudflare Pages / most static hosts serve /foo/ rather than /foo.html.
  trailingSlash: true,
  // next/image's optimizer is a server feature — disable it for static export.
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "uusmaanord.ee" },
      { protocol: "https", hostname: "uusmaa.ee" },
    ],
  },
};
module.exports = nextConfig;
