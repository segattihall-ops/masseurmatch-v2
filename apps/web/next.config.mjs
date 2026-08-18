import { normaliseOrigin } from "@masseurmatch/config/origin";
import { contentSecurityPolicy, securityHeaders } from "@masseurmatch/config/security-headers";

// A real workspace package, not a relative import. That distinction is not
// tidiness: Turbo hashes each task's inputs from the workspace graph, so a file
// reached by `../../packages/...` is invisible to it. Editing the headers
// produced a FULL TURBO cache hit and a build that still contained the old
// policy — verified, not theorised.
const csp = contentSecurityPolicy({
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
});

/**
 * The old site's auth entry points, which live on this host and move to the
 * dashboard at cutover.
 *
 * `/signup`, `/register` and `/login` are real URLs on the site running at
 * `www` today. The moment this app owns that hostname they become 404s for
 * anyone with a bookmark or an old link, so they are forwarded to the dashboard
 * instead. They are robots-disallowed on the old site, so nothing here is about
 * search — it is about people.
 *
 * Only emitted when the dashboard's origin is known: a redirect to a guessed
 * host is worse than the 404 it replaces. Temporary (307) rather than permanent
 * on purpose — a 308 is cached by browsers indefinitely, and this points at a
 * hostname that could still change.
 */
function authRedirects() {
  // Normalised, not trusted: the variable was set to a bare hostname in
  // production and every destination below silently became a relative path.
  const dashboard = normaliseOrigin(process.env.NEXT_PUBLIC_DASHBOARD_URL);
  if (!dashboard) return [];

  return [
    { source: "/signup", destination: `${dashboard}/sign-up`, permanent: false },
    { source: "/signup/:path*", destination: `${dashboard}/sign-up`, permanent: false },
    { source: "/register", destination: `${dashboard}/sign-up`, permanent: false },
    { source: "/login", destination: `${dashboard}/sign-in`, permanent: false },
    { source: "/forgot-password", destination: `${dashboard}/forgot-password`, permanent: false },
  ];
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders({ csp }) }];
  },
  async redirects() {
    return authRedirects();
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
