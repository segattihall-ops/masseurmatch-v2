/**
 * How long the Available Now badge lasts per plan. `null` means the plan does
 * not include it. Mirrors production's tier rules.
 */
const TIER_HOURS: Record<string, number | null> = {
  free: null,
  standard: 1,
  pro: 2,
  elite: 3,
};

export function tierHours(tier: string | null | undefined): number | null {
  return TIER_HOURS[tier ?? "free"] ?? null;
}
