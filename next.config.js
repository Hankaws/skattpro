/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { remotePatterns: [{ protocol: "https", hostname: "**" }] },
  // output: "standalone",  // Removed for Vercel compatibility. Standalone is for Docker/self-hosted.
  // Vercel uses its own optimized Next.js builder.
};

export default nextConfig;

import('@opennextjs/cloudflare').then(m => m.initOpenNextCloudflareForDev());
