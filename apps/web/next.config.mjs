import { contentSecurityPolicy, securityHeaders } from "@masseurmatch/config/security-headers";

// A real workspace package, not a relative import. That distinction is not
// tidiness: Turbo hashes each task's inputs from the workspace graph, so a file
// reached by `../../packages/...` is invisible to it. Editing the headers
// produced a FULL TURBO cache hit and a build that still contained the old
// policy — verified, not theorised.
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
  transpilePackages: ["@masseurmatch/ui", "@masseurmatch/db", "@masseurmatch/billing"],
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
