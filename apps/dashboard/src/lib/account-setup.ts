import "server-only";

import { createServiceClient } from "@masseurmatch/db/client";
import { HIDDEN } from "@masseurmatch/db/visibility";

import { claimReferralSignup } from "./referral-rewards";

/**
 * Everything a brand-new account needs before the dashboard will load for it.
 *
 * ---------------------------------------------------------------------------
 * Why this runs with the service key
 * ---------------------------------------------------------------------------
 * `user_roles` is admin-and-service-role only, on purpose: POLICIES.md files it
 * under "Role assignment. Self-service write here is privilege escalation." So
 * the row cannot be written by the account it describes, and there is no
 * database trigger doing it either (this phase changes policies, types and the
 * access layer — not the schema). Without a row, `getRole()` falls through to
 * `client`, `requireTherapist()` refuses, and every person who signs up lands
 * on `/not-authorized` instead of their dashboard.
 *
 * So the grant happens here, on the server, at the one moment the application
 * knows an account was just created and knows which id it belongs to.
 *
 * ---------------------------------------------------------------------------
 * Why granting `provider` at sign-up is not the escalation the policy warns of
 * ---------------------------------------------------------------------------
 * `provider` unlocks one thing: the therapist's own dashboard and their own
 * profile row, both already scoped to them by RLS. It grants nothing over
 * anyone else's data, and it is not `admin`. The listing itself stays invisible
 * to the public until a human approves it — the profile is created `draft` and
 * `hidden`, and moderation is what publishes it. That is the gate; the role is
 * just the key to their own front door.
 *
 * ---------------------------------------------------------------------------
 * Idempotent, and called twice on purpose
 * ---------------------------------------------------------------------------
 * Sign-up calls it, and so does the email-confirmation callback. Reads come
 * first so a second call writes nothing. Two attempts because the first one can
 * fail — a network blip against Supabase at sign-up would otherwise leave a
 * confirmed account permanently roleless, and the callback quietly repairs it.
 */

export type NewAccount = {
  fullName?: string | null;
  email?: string | null;
  /**
   * The code from the `/r/<code>` link this person arrived through, when there
   * was one. Claiming it costs nothing if the account never confirms: the
   * signup only becomes a reward once the referred therapist pays for a month,
   * which an abandoned account never does.
   */
  referralCode?: string | null;
};

/** The database's word for a therapist. See the `Role` doc in packages/db/auth.ts. */
const PROVIDER = "provider";

export async function ensureProviderAccount(
  userId: string,
  account: NewAccount = {},
): Promise<void> {
  const supabase = createServiceClient();

  const existingRole = await supabase
    .from("user_roles")
    .select("user_id,role")
    .eq("user_id", userId)
    .maybeSingle();

  if (existingRole.error) {
    throw new Error(`Could not read the account's role: ${existingRole.error.message}`);
  }

  // Never overwrite. An admin who somehow arrives here — the same person
  // signing up twice, a seeded account — must not be demoted to `provider` by
  // a sign-up flow.
  if (!existingRole.data) {
    const granted = await supabase.from("user_roles").insert({ user_id: userId, role: PROVIDER });
    if (granted.error) {
      throw new Error(`Could not set up the account: ${granted.error.message}`);
    }
  }

  // Attribution, before the early return below, so the confirmation callback
  // reaches it too — the profile usually already exists by then and this would
  // otherwise only ever run on the sign-up call. Never allowed to throw: a
  // missing row in a rewards table is worth far less than stranding somebody
  // who has just signed up on an error page. The RPC decides what an unknown
  // code, a repeat claim or a self-referral mean, and a repeat is a no-op.
  await claimReferralSignup(account.referralCode, userId);

  const existingProfile = await supabase
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .maybeSingle();

  if (existingProfile.error) {
    throw new Error(`Could not read the account's profile: ${existingProfile.error.message}`);
  }

  if (existingProfile.data) return;

  // `getOrCreateMyProfile` would create this row on the first dashboard load
  // anyway, and still will for every account that predates this flow. Seeding
  // it here is what carries the name and email across from the form — the
  // dashboard greets them by name and onboarding starts one field further on,
  // rather than asking again for something they just typed.
  //
  // The column set matches `getOrCreateMyProfile` exactly: `id = user_id = the
  // auth user id` is the convention this database has verified everywhere, and
  // `draft` + hidden keeps an empty profile out of the moderation queue.
  const fullName = account.fullName?.trim() || null;
  const created = await supabase.from("profiles").insert({
    id: userId,
    user_id: userId,
    role: PROVIDER,
    profile_status: "draft",
    visibility_status: HIDDEN,
    display_name: fullName,
    full_name: fullName,
    email: account.email?.trim() || null,
  });

  if (created.error) {
    throw new Error(`Could not start the account's profile: ${created.error.message}`);
  }
}
