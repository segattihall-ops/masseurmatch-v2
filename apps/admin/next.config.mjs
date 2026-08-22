import { contentSecurityPolicy, securityHeaders } from "@masseurmatch/config/security-headers";

const TURNSTILE = "https://challenges.cloudflare.com";

const csp = contentSecurityPolicy({
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  extraConnect: [TURNSTILE],
  extraFrame: [TURNSTILE],
  extraScript: [TURNSTILE],
});

const nextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders({ csp, noIndex: true }) }];
  },
  async redirects() {
    return [
      { source: "/admin", destination: "/", permanent: true },
      { source: "/admin/:path*", destination: "/:path*", permanent: true },
      { source: "/support", destination: "/tickets", permanent: true },
      { source: "/therapists", destination: "/people", permanent: true },
      { source: "/users", destination: "/people", permanent: true },
    ];
  },
  async rewrites() {
    return [
      { source: "/", destination: "/admin" },
      { source: "/people", destination: "/admin/people" },
      { source: "/people/:id", destination: "/admin/people/:id" },
      { source: "/analytics", destination: "/admin/analytics" },
      { source: "/billing", destination: "/admin/billing" },
      { source: "/moderation", destination: "/admin/moderation" },
      { source: "/photos", destination: "/admin/photos" },
      { source: "/verifications", destination: "/admin/verifications" },
      { source: "/verifications/manual", destination: "/admin/verifications/manual" },
      { source: "/verification", destination: "/admin/verification" },
      { source: "/verification/manual", destination: "/admin/verification/manual" },
      { source: "/profile-reports", destination: "/admin/profile-reports" },
      { source: "/reports", destination: "/admin/reports" },
      { source: "/tickets", destination: "/admin/tickets" },
      { source: "/tickets/:id", destination: "/admin/tickets/:id" },
      { source: "/audit-log", destination: "/admin/audit-log" },
      { source: "/demand-radar", destination: "/admin/demand-radar" },
      { source: "/approvals", destination: "/admin/approvals" },
      { source: "/approvals/:id", destination: "/admin/approvals/:id" },
      { source: "/complaints", destination: "/admin/complaints" },
      { source: "/logs", destination: "/admin/logs" },
    ];
  },
  reactStrictMode: true,
  transpilePackages: ["@masseurmatch/ui", "@masseurmatch/db", "@masseurmatch/config"],
  eslint: { ignoreDuringBuilds: true },
  experimental: {
    outputFileTracingRoot: new URL("../../", import.meta.url).pathname,
  },
};

export default nextConfig;
