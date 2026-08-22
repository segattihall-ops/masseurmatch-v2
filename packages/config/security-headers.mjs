/**
 * Security response headers, shared by both apps.
 *
 * One definition rather than two, because headers that drift between a public
 * site and its dashboard are worse than headers that are merely weak: the gap
 * is invisible until someone tests the app nobody thought to check.
 *
 * Every value here is verifiable from outside — `curl -I` against a deployment
 * shows exactly what is set. Phase 8's smoke test does that rather than trusting
 * this file.
 */

/**
 * Content-Security-Policy.
 *
 * `'unsafe-inline'` and `'unsafe-eval'` are present in `script-src` and are not
 * an oversight: Next.js App Router injects inline bootstrap scripts for
 * hydration and RSC payloads, and removing them requires per-request nonces
 * plumbed through middleware. That is worth doing, but it is a change with real
 * breakage risk and it is called out here rather than quietly skipped.
 *
 * What this policy does buy today:
 *   - `frame-ancestors 'none'` — clickjacking, and it is the modern replacement
 *     for X-Frame-Options (which is also sent, for older browsers).
 *   - `object-src 'none'` — no Flash/plugin vectors.
 *   - `base-uri 'self'` — stops an injected `<base>` rewriting every relative
 *     URL on the page, which is a common way to turn one XSS into total
 *     script control.
 *   - `form-action` — stops an injected form posting credentials off-site.
 *   - a bounded `connect-src`/`img-src` allowlist, so an injected script cannot
 *     freely exfiltrate to an arbitrary host.
 *
 * @param {{ supabaseUrl?: string, extraConnect?: string[], extraFrame?: string[], extraScript?: string[] }} options
 */
export function contentSecurityPolicy(options = {}) {
  const supabase = options.supabaseUrl ? [options.supabaseUrl] : ["https://*.supabase.co"];

  const directives = {
    "default-src": ["'self'"],
    // See the note above: Next's hydration bootstrap is inline.
    "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'", ...(options.extraScript ?? [])],
    // Tailwind emits a stylesheet, but styled-jsx and Next's font loader inline
    // style attributes, so 'unsafe-inline' is required for styles too.
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": ["'self'", "data:", "blob:", "https://res.cloudinary.com", ...supabase],
    // Provider intro videos are delivered from the same Cloudinary account as
    // profile photos. Keep media explicit instead of widening default-src.
    "media-src": ["'self'", "blob:", "https://res.cloudinary.com"],
    "font-src": ["'self'", "data:"],
    "connect-src": ["'self'", ...supabase, ...(options.extraConnect ?? [])],
    // Cloudinary's signed upload endpoint is posted to directly from the
    // browser; the signature is minted server-side.
    "form-action": ["'self'", "https://api.cloudinary.com"],
    "frame-src": ["'self'", ...(options.extraFrame ?? [])],
    "frame-ancestors": ["'none'"],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "upgrade-insecure-requests": [],
  };

  return Object.entries(directives)
    .map(([name, values]) => (values.length ? `${name} ${values.join(" ")}` : name))
    .join("; ");
}

/**
 * The headers every route gets.
 *
 * @param {{ csp: string, noIndex?: boolean }} options
 */
export function securityHeaders({ csp, noIndex = false }) {
  const headers = [
    { key: "Content-Security-Policy", value: csp },
    // Two years, with preload. HSTS only takes effect over HTTPS, so it is
    // inert in local development.
    {
      key: "Strict-Transport-Security",
      value: "max-age=63072000; includeSubDomains; preload",
    },
    // Superseded by frame-ancestors, but still honoured by older browsers.
    { key: "X-Frame-Options", value: "DENY" },
    // Stops a browser second-guessing a Content-Type — the vector where an
    // uploaded "image" is sniffed as HTML and executed on our origin.
    { key: "X-Content-Type-Options", value: "nosniff" },
    // Send the full URL same-origin, only the origin cross-origin. Profile URLs
    // identify a therapist, so they should not leak into third-party logs.
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    // The public search is location-aware. Only first-party code may request
    // geolocation; camera and microphone remain disabled everywhere.
    {
      key: "Permissions-Policy",
      value: "camera=(), microphone=(), geolocation=(self), interest-cohort=()",
    },
  ];

  if (noIndex) {
    // Belt and braces with the per-page `robots` metadata: a header covers
    // route handlers and redirects, which never render metadata at all.
    headers.push({ key: "X-Robots-Tag", value: "noindex, nofollow" });
  }

  return headers;
}
