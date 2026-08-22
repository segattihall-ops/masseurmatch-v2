import "server-only";

type StripeIdentityStatus = "canceled" | "processing" | "requires_input" | "verified";

export type StripeIdentitySession = {
  id: string;
  status: StripeIdentityStatus;
  last_error: { code?: string | null; reason?: string | null } | null;
  last_verification_report: string | null;
  livemode: boolean;
};

export function hasStripeIdentityKey(): boolean {
  return Boolean(
    process.env.STRIPE_IDENTITY_RESTRICTED_KEY?.trim() || process.env.STRIPE_SECRET_KEY?.trim(),
  );
}

function stripeIdentityKey(): string {
  const key =
    process.env.STRIPE_IDENTITY_RESTRICTED_KEY?.trim() || process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) {
    throw new Error(
      "Stripe Identity sync is not configured. Add STRIPE_IDENTITY_RESTRICTED_KEY (preferred) or STRIPE_SECRET_KEY to the Admin environment.",
    );
  }
  return key;
}

export async function retrieveStripeIdentitySession(
  sessionId: string,
): Promise<StripeIdentitySession> {
  if (!sessionId.startsWith("vs_")) {
    throw new Error("The stored Stripe Identity session id is invalid.");
  }

  const response = await fetch(
    `https://api.stripe.com/v1/identity/verification_sessions/${encodeURIComponent(sessionId)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${stripeIdentityKey()}`,
      },
      cache: "no-store",
    },
  );

  const payload = (await response.json().catch(() => null)) as
    (Partial<StripeIdentitySession> & { error?: { message?: string } }) | null;

  if (!response.ok) {
    throw new Error(payload?.error?.message || `Stripe Identity returned HTTP ${response.status}.`);
  }

  if (
    !payload ||
    typeof payload.id !== "string" ||
    !["canceled", "processing", "requires_input", "verified"].includes(String(payload.status))
  ) {
    throw new Error("Stripe Identity returned an unexpected verification-session response.");
  }

  return {
    id: payload.id,
    status: payload.status as StripeIdentityStatus,
    last_error:
      payload.last_error && typeof payload.last_error === "object" ? payload.last_error : null,
    last_verification_report:
      typeof payload.last_verification_report === "string"
        ? payload.last_verification_report
        : null,
    livemode: payload.livemode === true,
  };
}
