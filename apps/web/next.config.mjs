/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The design system and data layer are consumed as TypeScript source.
  transpilePackages: ["@masseurmatch/ui", "@masseurmatch/db"],
  eslint: {
    // Linting runs as its own CI step; keep `next build` focused on compiling.
    ignoreDuringBuilds: true,
  },
  images: {
    // A custom loader must be registered globally: pages are server components,
    // and a loader function cannot be serialised across the RSC boundary.
    loader: "custom",
    loaderFile: "./src/lib/cloudinary-loader.ts",
  },
  experimental: {
    // Font files and package sources live above the app directory.
    outputFileTracingRoot: new URL("../../", import.meta.url).pathname,
  },
};

export default nextConfig;
