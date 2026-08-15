/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The design system is consumed as TypeScript source rather than a build
  // artifact, so Next compiles it as part of this app.
  transpilePackages: ["@masseurmatch/ui", "@masseurmatch/db"],
  eslint: {
    // Linting runs as its own CI step; keep `next build` focused on compiling.
    ignoreDuringBuilds: true,
  },
  experimental: {
    // Font files and package sources live above the app directory.
    outputFileTracingRoot: new URL("../../", import.meta.url).pathname,
  },
};

export default nextConfig;
