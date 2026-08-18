/**
 * Knotty — the concierge that helps a visitor find a therapist.
 *
 * Pure functions: screening, intent, and matching over listings the caller has
 * already loaded. No network, no model, no keys.
 *
 * ---------------------------------------------------------------------------
 * What is here and what is not
 * ---------------------------------------------------------------------------
 * The old Knotty had three layers: deterministic screening and matching, an LLM
 * that turned the result into conversation, and a VAPI voice agent. Only the
 * first is portable — the other two need `OPENAI_API_KEY` / `GEMINI_API_KEY`
 * and four `VAPI_*` variables, none of which exist for this project.
 *
 * That split is not a loss. The deterministic layer is the part that actually
 * finds people: a visitor asking for "deep tissue in Denver tonight" is
 * answered by filtering the directory, not by a model. The model makes it
 * conversational. So this ships working, and the conversational layer can sit
 * on top of it later without any of this changing.
 *
 * ---------------------------------------------------------------------------
 * Screening comes first, and stays strict
 * ---------------------------------------------------------------------------
 * This is a public chat box on a marketplace for massage. If it can be used to
 * broker sex work, it will be. The block list is deliberately broad and stays
 * that way: a false positive costs one awkward redirect, a false negative makes
 * the platform a solicitation channel. That asymmetry justifies the noise, so
 * the list below is NOT to be trimmed for elegance.
 *
 * One thing is fixed from the original: its reply was "That's not what we do
 * here", which accuses. The same word appears when a visitor is *declining* —
 * "I'm not looking for anything sexual, just deep tissue" trips `sexual` and
 * gets lectured for saying so. The message no longer assumes intent; it states
 * what the site is and offers to help.
 */

/** Terms that end the matching conversation. Broad on purpose — see above. */
const BLOCKED = [
  /\bsex(?:ual)?\b/i,
  /\bescort\b/i,
  /\bexplicit\b/i,
  /\bhappy\s*ending\b/i,
  /\bfull\s*service\b/i,
  /\bfbsm\b/i,
  /\bgfe\b/i,
  /\bextras\b/i,
  /\bsensual\b/i,
  /\berotic\b/i,
  /\bnuru\b/i,
  /\bhand[\s-]?job\b/i,
  /\bblow[\s-]?job\b/i,
] as const;

/**
 * States what the site is without accusing the person of asking for anything.
 * It reads the same whether they were soliciting or declining.
 */
export const SAFE_REDIRECT =
  "MasseurMatch lists licensed, professional massage therapists — that is all we cover. " +
  "Tell me the city and the kind of massage you want and I will find someone.";

export type Screening = { blocked: boolean; reply: string | null };

export function screenMessage(message: string): Screening {
  const text = (message ?? "").slice(0, 2000);
  const blocked = BLOCKED.some((pattern) => pattern.test(text));
  return { blocked, reply: blocked ? SAFE_REDIRECT : null };
}

export type Intent = "available_now" | "outcall" | "verified" | "budget" | "premium" | "visiting";

const INTENT_TERMS: Record<Intent, string[]> = {
  available_now: ["available now", "right now", "asap", "tonight", "today", "immediately"],
  outcall: ["outcall", "come to me", "my hotel", "house call", "travel to me", "mobile"],
  verified: ["verified", "trusted", "reviewed", "legit"],
  budget: ["budget", "affordable", "cheap", "low cost", "best price"],
  premium: ["premium", "luxury", "top tier", "best therapist"],
  visiting: ["visiting", "in town", "passing through"],
};

/** Techniques the directory actually stores, so a match can filter on them. */
const TECHNIQUES = [
  "deep tissue",
  "swedish",
  "sports",
  "trigger point",
  "myofascial",
  "prenatal",
  "hot stone",
  "reflexology",
  "lymphatic",
  "stretch",
] as const;

export type Understanding = {
  intents: Intent[];
  /** A technique named in the message, lowercased, or null. */
  technique: string | null;
  /** A city named in the message, matched against the ones supplied. */
  city: string | null;
};

/**
 * What the visitor appears to want.
 *
 * `cities` is passed in rather than imported so this stays pure and the caller
 * decides which cities exist — the directory is the authority on that, and it
 * changes.
 */
export function understand(message: string, cities: string[] = []): Understanding {
  const text = (message ?? "").toLowerCase();

  const intents = (Object.keys(INTENT_TERMS) as Intent[]).filter((intent) =>
    INTENT_TERMS[intent].some((term) => text.includes(term)),
  );

  const technique = TECHNIQUES.find((term) => text.includes(term)) ?? null;

  // Longest first, so "New York" is not shadowed by a shorter city that happens
  // to be a substring of it.
  const city =
    [...cities]
      .filter((name) => name.trim().length > 0)
      .sort((a, b) => b.length - a.length)
      .find((name) => text.includes(name.toLowerCase())) ?? null;

  return { intents, technique, city };
}

/** The shape matching needs — a subset of a directory listing. */
export type ConciergeListing = {
  slug: string;
  city: string | null;
  state: string | null;
  headline: string | null;
  service_categories: string[] | null;
  specialties: string[] | null;
  offers_outcall: boolean | null;
  is_verified_identity: boolean | null;
  incall_price: number | null;
  rating_average: number | null;
  review_count: number | null;
};

export type Match = { listing: ConciergeListing; score: number; reasons: string[] };

function offersTechnique(listing: ConciergeListing, technique: string): boolean {
  const haystack = [
    ...(listing.service_categories ?? []),
    ...(listing.specialties ?? []),
    listing.headline ?? "",
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(technique);
}

/**
 * Rank listings against what the visitor asked for.
 *
 * Every match carries the reasons it scored, because the concierge should be
 * able to say *why* it suggested someone. An opaque recommendation on a
 * marketplace is indistinguishable from an advert.
 *
 * Deliberately does **not** rank by tier. The directory already orders paid
 * tiers above free ones on its own pages, which is what was sold; doing it
 * again inside a tool that claims to answer "who fits what I need" would make
 * the answer a placement rather than a recommendation.
 */
export function matchListings(
  listings: ConciergeListing[],
  want: Understanding,
  limit = 3,
): Match[] {
  const scored: Match[] = [];

  for (const listing of listings) {
    const reasons: string[] = [];
    let score = 0;

    if (want.city) {
      if ((listing.city ?? "").toLowerCase() !== want.city.toLowerCase()) continue;
      score += 5;
      reasons.push(`in ${listing.city}`);
    }

    if (want.technique) {
      if (!offersTechnique(listing, want.technique)) continue;
      score += 4;
      reasons.push(`offers ${want.technique}`);
    }

    if (want.intents.includes("outcall") && listing.offers_outcall) {
      score += 3;
      reasons.push("travels to you");
    }

    if (want.intents.includes("verified") && listing.is_verified_identity) {
      score += 3;
      reasons.push("identity verified");
    }

    // Reviews are evidence a stranger can weigh, so they break ties — but only
    // when there are enough of them to mean anything.
    if ((listing.review_count ?? 0) >= 3 && (listing.rating_average ?? 0) > 0) {
      score += 1;
      reasons.push(`${listing.rating_average} from ${listing.review_count} reviews`);
    }

    // A listing that matched nothing asked for is not a recommendation.
    if (score === 0) continue;

    scored.push({ listing, score, reasons });
  }

  return scored
    .sort((a, b) => b.score - a.score || a.listing.slug.localeCompare(b.listing.slug))
    .slice(0, limit);
}

/**
 * What to say back, with no model involved.
 *
 * Returns the sentence only; the caller renders the matches, because a chat
 * bubble and a list of therapist cards are different things and stitching them
 * into one string would make both worse.
 */
export function conciergeReply(want: Understanding, matches: Match[]): string {
  if (matches.length === 0) {
    if (want.city || want.technique) {
      return "I could not find anyone matching that yet. Try a nearby city, or a different kind of massage.";
    }
    return "Tell me the city you are in and the kind of massage you want, and I will find someone.";
  }

  const what = want.technique ? `${want.technique} therapists` : "therapists";
  const where = want.city ? ` in ${want.city}` : "";
  return `Here ${matches.length === 1 ? "is one" : `are ${matches.length}`} ${what}${where}.`;
}
