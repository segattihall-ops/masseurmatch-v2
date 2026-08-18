/**
 * Coach — what this therapist should do next, and why.
 *
 * Pure functions. Takes signals the dashboard has already gathered and returns
 * a ranked list of advice, each item carrying the observation that produced it.
 *
 * ---------------------------------------------------------------------------
 * What the old AI Coach did, and why this is smaller
 * ---------------------------------------------------------------------------
 * The old one read contact rate, favourites, inquiries, per-photo AI scores and
 * ninety days of score snapshots. Measured in this database: `contact_events`,
 * `contact_inquiries` and `favorites` all hold **zero rows**, and none of the
 * `ai_*` tables exist. Porting it faithfully would produce a page of zeros
 * presented as insight — a coach telling someone their contact rate is 0% when
 * nothing has ever recorded a contact.
 *
 * So this is built only on signals that exist: the profile score, real view
 * counts, the city's demand reading, rising keywords, and how the profile
 * compares with others in the same city. Every recommendation names the number
 * behind it, so a therapist can disagree with it.
 *
 * There is no model here and no API key. The old "AI Coach" had none either —
 * it was a rules engine, and calling it AI oversold it. This one is called what
 * it is.
 */

export type CoachSignals = {
  /** From `scoreProfile`. */
  scoreTotal: number;
  /** The highest-value unfinished checks, already ordered. */
  scoreActions: { id: string; action: string | null; href: string; gap: number }[];
  /** Views in the reporting window, and the window before it. */
  views: number;
  previousViews: number;
  /** Null when the city has no usable reading. */
  demand: { score: number; direction: "rising" | "steady" | "cooling" } | null;
  /** Rising searches in this city, biggest movers first. */
  keywords: { keyword: string; change: number }[];
  /** Other publicly listed therapists in the same city. */
  cityPeers: number;
  /** Whether a Spike is available to spend right now. */
  canSpike: boolean;
  /** Whether the profile is currently marked available. */
  availableNow: boolean;
};

export type Advice = {
  id: string;
  /** What to do. */
  title: string;
  /** The observation behind it — always a real number from `CoachSignals`. */
  because: string;
  /** Where to act, when there is somewhere to go. */
  href: string | null;
  /** Higher is more urgent. Used only for ordering. */
  weight: number;
};

/**
 * Advice, most useful first.
 *
 * Deliberately capped by the caller rather than here: what "enough" means is a
 * layout question, and this should not decide it.
 */
export function coachAdvice(signals: CoachSignals): Advice[] {
  const advice: Advice[] = [];

  // 1. Profile gaps first. Distribution cannot fix a thin profile, and every
  //    other suggestion below sends more people to whatever is already there.
  for (const action of signals.scoreActions) {
    if (!action.action) continue;
    advice.push({
      id: `profile-${action.id}`,
      title: action.action,
      because: `Worth ${action.gap} points on your profile score, currently ${signals.scoreTotal}.`,
      href: action.href,
      // Scaled by what it is actually worth, so a 35-point gap outranks a
      // 5-point one rather than both landing wherever the loop put them.
      weight: 100 + action.gap,
    });
  }

  // 2. A rising city with a listing nobody is seeing is the clearest case for
  //    spending a Spike — and only worth saying when there is one to spend.
  if (signals.canSpike && signals.demand?.direction === "rising") {
    advice.push({
      id: "spike-rising-demand",
      title: "Start a Spike while your city is busy.",
      because: `Demand in your city is ${signals.demand.score} and rising, and you have a Spike available.`,
      href: null,
      weight: 90,
    });
  }

  // 3. Keywords are only advice if the therapist can act on them, which means
  //    putting the words in their profile.
  const topKeyword = signals.keywords[0];
  if (topKeyword) {
    advice.push({
      id: "keyword-opportunity",
      title: `Mention "${topKeyword.keyword}" in your headline or bio if you offer it.`,
      because: `Searches for it in your city are up ${Math.round(topKeyword.change)}% this week.`,
      href: "/profile",
      weight: 70,
    });
  }

  // 4. Falling views, said plainly and only when there is a real baseline.
  //    Below that the swing is noise and pointing at it invites a pointless fix.
  if (signals.previousViews >= 20 && signals.views < signals.previousViews * 0.75) {
    advice.push({
      id: "views-falling",
      title: "Your listing is being seen less than it was.",
      because: `${signals.views} views this period against ${signals.previousViews} before it.`,
      href: null,
      weight: 60,
    });
  }

  // 5. A crowded city is a reason to stand out, not a reason to despair —
  //    so it is phrased as the action it implies.
  if (signals.cityPeers >= 5 && signals.scoreTotal < 100) {
    advice.push({
      id: "crowded-city",
      title: "Finish your profile — your city is competitive.",
      because: `${signals.cityPeers} other therapists are listed in your city.`,
      href: "/profile",
      weight: 50,
    });
  }

  // 6. Lowest priority on purpose: it is a nudge about a tool, not a problem
  //    with the listing, and it should never outrank a real gap.
  if (!signals.availableNow && signals.demand?.direction === "rising") {
    advice.push({
      id: "available-now",
      title: "Turn on Available Now when you have a free slot today.",
      because: `Demand in your city is ${signals.demand.score} and rising this week.`,
      href: null,
      weight: 30,
    });
  }

  return advice.sort((a, b) => b.weight - a.weight || a.id.localeCompare(b.id));
}

/** One line for when there is nothing to suggest. */
export function coachAllClear(signals: CoachSignals): string {
  if (signals.scoreTotal >= 100) return "Your profile is complete. Nothing needs attention today.";
  return "Nothing urgent today.";
}
