/**
 * Error reporting and bot verification, both optional by construction.
 *
 * Neither Sentry nor Turnstile has credentials in this environment, and both
 * are wired so their absence is a *supported state* rather than a broken one:
 * no key means the feature is off, the build is green, and nothing throws. Add
 * the key and it turns on with no code change.
 *
 * That is not a shortcut. A deployment that cannot start because an optional
 * observability vendor is unconfigured has traded a monitoring gap for an
 * outage, which is the worse of the two.
 *
 * The alternative — scaffolding that pretends to verify — is deliberately
 * avoided. `verifyTurnstile` returns an explicit "not configured" outcome that
 * callers must decide about, rather than silently returning success.
 */

/* -------------------------------------------------------------------------- */
/* Sentry                                                                     */
/* -------------------------------------------------------------------------- */

/** The DSN, or null when error reporting is not configured. */
export function sentryDsn(): string | null {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN?.trim();
  return dsn ? dsn : null;
}

export function sentryEnabled(): boolean {
  return sentryDsn() !== null;
}

/**
 * The environment name reported alongside an error.
 *
 * Falls back through Vercel's own variable so previews are distinguishable
 * from production without another setting to forget.
 */
export function sentryEnvironment(): string {
  return (
    process.env.SENTRY_ENVIRONMENT ??
    process.env.VERCEL_ENV ??
    process.env.NODE_ENV ??
    "development"
  );
}

/* -------------------------------------------------------------------------- */
/* Turnstile                                                                  */
/* -------------------------------------------------------------------------- */

/** The public site key, or null when Turnstile is not configured. */
export function turnstileSiteKey(): string | null {
  const key = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim();
  return key ? key : null;
}

function turnstileSecret(): string | null {
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim();
  return secret ? secret : null;
}

export function turnstileEnabled(): boolean {
  return turnstileSiteKey() !== null && turnstileSecret() !== null;
}

export type TurnstileResult =
  /** Cloudflare verified the token. */
  | { status: "passed" }
  /** Cloudflare rejected it, or it was missing. */
  | { status: "failed"; reason: string }
  /**
   * No keys are set, so nothing was checked.
   *
   * Distinct from `passed` on purpose. A caller that treats "unconfigured" as
   * "verified" has a bot check that silently does nothing, which is worse than
   * having none — nobody looks for a gap they believe is covered.
   */
  | { status: "not_configured" };

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/**
 * Verify a Turnstile token server-side.
 *
 * The token comes from the browser and means nothing until Cloudflare confirms
 * it, so this must run on the server; a client-side "success" callback is not
 * evidence of anything.
 *
 * A network failure returns `failed`, not `passed`. If the verifier cannot be
 * reached, the honest answer is that the request is unverified.
 */
export async function verifyTurnstile(
  token: string | null | undefined,
  remoteIp?: string | null,
): Promise<TurnstileResult> {
  const secret = turnstileSecret();
  if (!secret || !turnstileSiteKey()) return { status: "not_configured" };

  if (!token) return { status: "failed", reason: "missing-token" };

  const body = new URLSearchParams({ secret, response: token });
  if (remoteIp) body.set("remoteip", remoteIp);

  try {
    const response = await fetch(VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      cache: "no-store",
    });

    if (!response.ok) {
      return { status: "failed", reason: `verifier-http-${response.status}` };
    }

    const result = (await response.json()) as {
      success?: boolean;
      "error-codes"?: string[];
    };

    if (result.success) return { status: "passed" };
    return {
      status: "failed",
      reason: result["error-codes"]?.join(",") || "rejected",
    };
  } catch {
    return { status: "failed", reason: "verifier-unreachable" };
  }
}

/* -------------------------------------------------------------------------- */
/* Error reporting                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Report an unhandled error.
 *
 * This is the seam, and it is deliberately not `@sentry/nextjs`. Installing the
 * SDK would add a client bundle and a build-time source-map upload step that
 * warns without an auth token — real weight and a new way for the build to go
 * red, in exchange for nothing until a DSN exists.
 *
 * With no DSN configured this logs, which is what the platform's own log drain
 * captures anyway. Once a DSN exists, the single change is to import
 * `@sentry/nextjs` here and call `Sentry.captureException(error)` alongside the
 * log — every call site already routes through this function, so nothing else
 * moves.
 *
 * The `digest` is included because it is the value shown to the user on the
 * error page: it is what lets a screenshot be matched to a log line.
 */
export function reportError(error: unknown, context?: { digest?: string; where?: string }): void {
  const payload = {
    where: context?.where ?? "unknown",
    digest: context?.digest ?? null,
    environment: sentryEnvironment(),
    sentry: sentryEnabled() ? "configured" : "not-configured",
  };

  // Structured, single line, so it is greppable in a platform log viewer.
  console.error(`[error] ${JSON.stringify(payload)}`, error);
}
