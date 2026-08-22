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
      // Meaningful legacy replacements. Keep these above the generic /admin/*
      // bridge so an old bookmark lands on the real V2 successor in one hop.
      { source: "/admin/profile-cms", destination: "/people", permanent: true },
      { source: "/admin/keywords", destination: "/demand-radar", permanent: true },
      {
        source: "/admin/dashboard/keyword-trends",
        destination: "/demand-radar",
        permanent: true,
      },
      { source: "/admin/sms", destination: "/messaging", permanent: true },
      { source: "/admin/resend-topics", destination: "/emails", permanent: true },
      { source: "/admin/settings", destination: "/tools", permanent: true },
      { source: "/admin/seo", destination: "/tools", permanent: true },
      {
        source: "/admin/legal",
        destination: "https://www.masseurmatch.com/legal",
        permanent: true,
      },
      {
        source: "/admin/onboarding",
        destination: "https://dashboard.masseurmatch.com/sign-up",
        permanent: true,
      },
      { source: "/admin/login", destination: "/sign-in", permanent: true },
      { source: "/admin/bookings", destination: "/tools", permanent: true },
      { source: "/admin/ab-tests", destination: "/tools", permanent: true },
      {
        source: "/admin/spike/design-system/buttons",
        destination: "/tools",
        permanent: true,
      },

      // Root-form aliases also exist because the dedicated Admin app removes
      // /admin from canonical URLs.
      { source: "/profile-cms", destination: "/people", permanent: true },
      { source: "/keywords", destination: "/demand-radar", permanent: true },
      {
        source: "/dashboard/keyword-trends",
        destination: "/demand-radar",
        permanent: true,
      },
      { source: "/sms", destination: "/messaging", permanent: true },
      { source: "/resend-topics", destination: "/emails", permanent: true },
      { source: "/settings", destination: "/tools", permanent: true },
      { source: "/seo", destination: "/tools", permanent: true },
      { source: "/legal", destination: "https://www.masseurmatch.com/legal", permanent: true },
      {
        source: "/onboarding",
        destination: "https://dashboard.masseurmatch.com/sign-up",
        permanent: true,
      },
      { source: "/login", destination: "/sign-in", permanent: true },
      { source: "/bookings", destination: "/tools", permanent: true },
      { source: "/ab-tests", destination: "/tools", permanent: true },
      { source: "/spike/design-system/buttons", destination: "/tools", permanent: true },

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
      { source: "/emails", destination: "/admin/emails" },
      { source: "/messaging", destination: "/admin/messaging" },
      { source: "/migrations", destination: "/admin/migrations" },
      { source: "/blog", destination: "/admin/blog" },
      { source: "/cities", destination: "/admin/cities" },
      { source: "/tools", destination: "/admin/tools" },
    ];
  },
  reactStrictMode: true,
  transpilePackages: [
    "@masseurmatch/ui",
    "@masseurmatch/db",
    "@masseurmatch/config",
    "@masseurmatch/billing",
  ],
  eslint: { ignoreDuringBuilds: true },
  experimental: {
    outputFileTracingRoot: new URL("../../", import.meta.url).pathname,
  },
};

export default nextConfig;
