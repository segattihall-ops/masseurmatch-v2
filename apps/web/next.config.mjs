import { contentSecurityPolicy, securityHeaders } from "../../packages/config/security-headers.mjs";

// Imported by relative path rather than as a workspace package: `next.config`
// is evaluated by Node before any bundler resolution, and two exported
// functions do not justify a package.json.
const csp = contentSecurityPolicy({
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders({ csp }) }];
  },
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
