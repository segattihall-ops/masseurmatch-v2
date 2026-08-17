/**
 * Profile Score — how strong a listing is, and what to do about it.
 *
 * Pure functions, no database access, no `server-only`: the dashboard renders
 * this and the tests exercise it directly. Same shape as `spikes.ts` and
 * `tier-grants.ts`.
 *
 * ---------------------------------------------------------------------------
 * Computed on read. Never stored.
 * ---------------------------------------------------------------------------
 * `profiles` already carries FOUR columns that claim to be this number —
 * `completion_percentage`, `completion_score`, `profile_completeness` and
 * `profile_completion_score`. In the old codebase nothing computes any of them:
 * they appear only as type declarations and as free-text number inputs in an
 * admin CMS form, while the pro dashboard displayed one of them as "Production
 * profile completeness". A number a human types into an admin panel and a
 * number derived from the profile are two sources of truth, and this is what
 * that looks like after a while — four of them, none authoritative.
 *
 * So this derives the score every time it is read, like `currentStep()` derives
 * onboarding progress and `resolveTier()` derives entitlement. Nothing to
 * migrate, nothing to backfill, and no way for the score to disagree with the
 * profile it describes.
 *
 * ---------------------------------------------------------------------------
 * What it does and does not measure
 * ---------------------------------------------------------------------------
 * Only fields the therapist can actually change in this app: the eleven the
 * profile form writes, plus photos. Scoring `years_experience` or `languages`
 * would be scoring 181 columns' worth of things with no field behind them —
 * the score would tell someone to fix what they cannot reach.
 *
 * Moderation status is deliberately absent. A profile waiting on review would
 * otherwise score lower for something its owner cannot influence, which is
 * demoralising and not actionable. Status has its own card.
 *
 * Verification is absent for the same reason: there is no verification flow in
 * this app yet, and it was decided that verification is not a paywall.
 */

/** Weights, out of 100. Photos dominate because listings live or die on them. */
const WEIGHTS = {
  photos: 35,
  bio: 25,
  headline: 15,
  services: 15,
  rates: 10,
} as const;

export type ScoreCheckId = keyof typeof WEIGHTS;

/**
 * Targets for full marks. Every one sits above what onboarding demands —
 * onboarding gets a profile live, this gets it booked.
 */
const GOOD_PHOTOS = 5;
const GOOD_BIO = 300;
const GOOD_HEADLINE = 40;
const GOOD_SERVICES = 3;

export type ScoreCheck = {
  id: ScoreCheckId;
  /** Shown to the therapist. */
  label: string;
  earned: number;
  possible: number;
  /** What to do about it, or null when there is nothing left to do. */
  action: string | null;
  /** Where in the dashboard it gets fixed. */
  href: string;
};

export type ProfileScore = {
  /** 0–100. */
  total: number;
  checks: ScoreCheck[];
  /** Unfinished checks, most points available first. Empty at 100. */
  todo: ScoreCheck[];
};

export type ProfileScoreInput = {
  headline: string | null;
  bio: string | null;
  service_categories: string[] | null;
  incall_price: number | null;
  outcall_price: number | null;
  photoCount: number;
  /**
   * The therapist's photo allowance.
   *
   * Passed in rather than derived here: `@masseurmatch/billing` depends on this
   * package, so this package must not reach back into it. The dashboard already
   * composes both and knows the resolved tier.
   */
  photoLimit: number;
};

/** How far along a target something is, clamped to 0–1. */
function portion(actual: number, target: number): number {
  if (target <= 0) return 1;
  return Math.min(1, Math.max(0, actual / target));
}

function textLength(value: string | null): number {
  return (value ?? "").trim().length;
}

/**
 * How many photos count as a full score for this therapist.
 *
 * `min(limit, GOOD_PHOTOS)` rather than the limit itself, so that **upgrading a
 * plan never lowers the score**. Scoring against the raw limit would drop a
 * therapist from 100 to 65 the moment they paid for more slots, which is a
 * remarkable way to punish someone for subscribing. It also means every tier,
 * Free included, can reach 100 — the score measures whether you have made the
 * most of your plan, not which plan you bought.
 */
function photoTarget(photoLimit: number): number {
  return Math.max(1, Math.min(Math.trunc(photoLimit), GOOD_PHOTOS));
}

function plural(n: number, one: string, many: string): string {
  return n === 1 ? one : many;
}

function photosCheck(input: ProfileScoreInput): ScoreCheck {
  const target = photoTarget(input.photoLimit);
  const have = Math.max(0, Math.trunc(input.photoCount));
  const missing = Math.max(0, target - have);

  return {
    id: "photos",
    label: "Photos",
    earned: Math.round(WEIGHTS.photos * portion(have, target)),
    possible: WEIGHTS.photos,
    action:
      missing === 0
        ? null
        : have === 0
          ? "Add a photo. A listing without one is rarely opened."
          : `Add ${missing} more ${plural(missing, "photo", "photos")}.`,
    href: "/onboarding?step=photos",
  };
}

function bioCheck(input: ProfileScoreInput): ScoreCheck {
  const length = textLength(input.bio);

  return {
    id: "bio",
    label: "About you",
    earned: Math.round(WEIGHTS.bio * portion(length, GOOD_BIO)),
    possible: WEIGHTS.bio,
    action:
      length >= GOOD_BIO
        ? null
        : "Your bio is brief. A few more sentences on how you work helps clients choose you.",
    href: "/profile",
  };
}

function headlineCheck(input: ProfileScoreInput): ScoreCheck {
  const length = textLength(input.headline);

  return {
    id: "headline",
    label: "Headline",
    earned: Math.round(WEIGHTS.headline * portion(length, GOOD_HEADLINE)),
    possible: WEIGHTS.headline,
    action:
      length >= GOOD_HEADLINE
        ? null
        : "Your headline is short. Say what makes your work different.",
    href: "/profile",
  };
}

function servicesCheck(input: ProfileScoreInput): ScoreCheck {
  const count = (input.service_categories ?? []).filter((s) => s.trim().length > 0).length;

  return {
    id: "services",
    label: "Services",
    earned: Math.round(WEIGHTS.services * portion(count, GOOD_SERVICES)),
    possible: WEIGHTS.services,
    action:
      count >= GOOD_SERVICES
        ? null
        : "Add the other services you offer, so you appear for more searches.",
    href: "/profile",
  };
}

/**
 * Both rates, or one.
 *
 * Not proportional: there are two, and having neither should not be possible
 * for a profile that passed onboarding. Half marks for one is the honest split.
 */
function ratesCheck(input: ProfileScoreInput): ScoreCheck {
  const hasIncall = input.incall_price !== null;
  const hasOutcall = input.outcall_price !== null;
  const set = Number(hasIncall) + Number(hasOutcall);

  let action: string | null = null;
  if (set === 0) action = "Add your rates so clients know what to expect.";
  else if (!hasIncall) action = "Add your incall rate, for clients who can come to you.";
  else if (!hasOutcall) action = "Add your outcall rate, for clients who need you to travel.";

  return {
    id: "rates",
    label: "Rates",
    earned: Math.round(WEIGHTS.rates * (set / 2)),
    possible: WEIGHTS.rates,
    action,
    href: "/profile",
  };
}

/**
 * Score a profile.
 *
 * `todo` is sorted by the points still on the table, so the first item is
 * always the one worth doing first. That ordering is the entire point of the
 * feature: a bare percentage tells a therapist they are lacking without telling
 * them what to do, which is the worst of both.
 */
export function scoreProfile(input: ProfileScoreInput): ProfileScore {
  const checks = [
    photosCheck(input),
    bioCheck(input),
    headlineCheck(input),
    servicesCheck(input),
    ratesCheck(input),
  ];

  const todo = checks
    .filter((c) => c.action !== null)
    .sort((a, b) => b.possible - b.earned - (a.possible - a.earned));

  return {
    total: checks.reduce((sum, c) => sum + c.earned, 0),
    checks,
    todo,
  };
}

/**
 * One line summarising where the profile stands.
 *
 * Deliberately not a grade or a badge. A therapist at 64 needs to know what to
 * do next, not that they are a "Bronze" profile.
 */
export function scoreSummary(score: ProfileScore): string {
  if (score.total >= 100) return "Your profile is as complete as it gets.";
  if (score.total >= 80) return "Strong profile. A couple of things left.";
  if (score.total >= 50) return "Good start. The items below make the biggest difference.";
  return "Your listing is missing things clients look for.";
}
