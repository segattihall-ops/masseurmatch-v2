import { contentSecurityPolicy, securityHeaders } from "@masseurmatch/config/security-headers";

// The dashboard posts directly to Cloudinary's upload endpoint and sends the
// therapist to PayPal to approve a subscription, so both are allowed as form
// targets and frame sources. `noIndex` covers route handlers and redirects,
// which never render `robots` metadata.
// Turnstile is allowed unconditionally rather than only when a site key is
// set. A CSP that changes shape with configuration is a CSP nobody can review,
// and the cost of naming a host that is never contacted is nothing.
const TURNSTILE = "https://challenges.cloudflare.com";

const csp = contentSecurityPolicy({
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  extraConnect: ["https://api.cloudinary.com", TURNSTILE],
  extraFrame: ["https://www.paypal.com", "https://www.sandbox.paypal.com", TURNSTILE],
  extraScript: [TURNSTILE],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders({ csp, noIndex: true }) }];
  },
  reactStrictMode: true,
  // The design system is consumed as TypeScript source rather than a build
  // artifact, so Next compiles it as part of this app.
  transpilePackages: ["@masseurmatch/ui", "@masseurmatch/db", "@masseurmatch/config"],
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
