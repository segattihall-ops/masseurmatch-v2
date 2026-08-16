import { contentSecurityPolicy, securityHeaders } from "../../packages/config/security-headers.mjs";

// The dashboard posts directly to Cloudinary's upload endpoint and sends the
// therapist to PayPal to approve a subscription, so both are allowed as form
// targets and frame sources. `noIndex` covers route handlers and redirects,
// which never render `robots` metadata.
const csp = contentSecurityPolicy({
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  extraConnect: ["https://api.cloudinary.com"],
  extraFrame: ["https://www.paypal.com", "https://www.sandbox.paypal.com"],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders({ csp, noIndex: true }) }];
  },
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
