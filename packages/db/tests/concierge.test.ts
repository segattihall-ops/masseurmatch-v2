import { describe, expect, it } from "vitest";

import {
  conciergeReply,
  matchListings,
  SAFE_REDIRECT,
  screenMessage,
  understand,
  type ConciergeListing,
} from "../concierge";

/**
 * Knotty concierge.
 *
 * This is a public chat box on a marketplace for massage. The failure that
 * matters most is not a clumsy recommendation — it is the box being usable to
 * broker sex work.
 */

const listing = (over: Partial<ConciergeListing> = {}): ConciergeListing => ({
  slug: "sam-1",
  city: "Denver",
  state: "CO",
  headline: "Deep tissue and sports massage",
  service_categories: ["Deep tissue"],
  specialties: null,
  offers_outcall: false,
  is_verified_identity: false,
  incall_price: 120,
  rating_average: null,
  review_count: null,
  ...over,
});

describe("screenMessage", () => {
  it("blocks solicitation", () => {
    for (const message of [
      "looking for a happy ending",
      "any FBSM in Denver",
      "do you offer extras",
      "sensual massage please",
      "need an escort tonight",
      "HAPPY   ENDING",
    ]) {
      expect(screenMessage(message).blocked, message).toBe(true);
    }
  });

  it("lets ordinary requests through", () => {
    for (const message of [
      "deep tissue in Denver tonight",
      "who is available now",
      "someone who can come to my hotel",
      "sports massage for a runner",
    ]) {
      expect(screenMessage(message).blocked, message).toBe(false);
    }
  });

  it("does not accuse the person who is declining", () => {
    // "I'm not looking for anything sexual" trips the word and is still
    // blocked — the list stays strict on purpose — but the reply must read the
    // same whether they were soliciting or refusing.
    const screening = screenMessage("not looking for anything sexual, just deep tissue");
    expect(screening.blocked).toBe(true);
    expect(screening.reply).toBe(SAFE_REDIRECT);
    expect(SAFE_REDIRECT).not.toMatch(/that.s not what we do/i);
  });

  it("survives junk input", () => {
    expect(screenMessage("").blocked).toBe(false);
    expect(screenMessage("x".repeat(50_000)).blocked).toBe(false);
  });
});

describe("understand", () => {
  it("picks up intent, technique and city", () => {
    const want = understand("need deep tissue in Denver, can you come to my hotel tonight", [
      "Denver",
      "Austin",
    ]);
    expect(want.technique).toBe("deep tissue");
    expect(want.city).toBe("Denver");
    expect(want.intents).toEqual(expect.arrayContaining(["outcall", "available_now"]));
  });

  it("prefers the longest city name so one does not shadow another", () => {
    // "York" inside "New York" must not win.
    const want = understand("massage in new york please", ["York", "New York"]);
    expect(want.city).toBe("New York");
  });

  it("returns nothing rather than guessing", () => {
    const want = understand("hello", ["Denver"]);
    expect(want).toEqual({ intents: [], technique: null, city: null });
  });
});

describe("matchListings", () => {
  it("excludes anyone outside the city that was asked for", () => {
    const matches = matchListings(
      [listing({ slug: "a" }), listing({ slug: "b", city: "Austin" })],
      understand("deep tissue in denver", ["Denver", "Austin"]),
    );
    expect(matches.map((m) => m.listing.slug)).toEqual(["a"]);
  });

  it("excludes anyone who does not offer the technique asked for", () => {
    const matches = matchListings(
      [
        listing({ slug: "a" }),
        listing({ slug: "b", service_categories: ["Swedish"], headline: null }),
      ],
      understand("deep tissue", []),
    );
    expect(matches.map((m) => m.listing.slug)).toEqual(["a"]);
  });

  it("never recommends someone who matched nothing", () => {
    // Returning "here is someone" for a query nothing satisfied is an advert.
    expect(matchListings([listing()], understand("hello", []))).toEqual([]);
  });

  it("says why it suggested each person", () => {
    const matches = matchListings(
      [listing({ offers_outcall: true, is_verified_identity: true })],
      understand("verified deep tissue in denver who can come to me", ["Denver"]),
    );
    expect(matches[0]?.reasons).toEqual(
      expect.arrayContaining([
        "in Denver",
        "offers deep tissue",
        "travels to you",
        "identity verified",
      ]),
    );
  });

  it("ignores a rating backed by almost no reviews", () => {
    const matches = matchListings(
      [listing({ rating_average: 5, review_count: 1 })],
      understand("deep tissue", []),
    );
    expect(matches[0]?.reasons.join(" ")).not.toContain("reviews");
  });

  it("is deterministic and respects the limit", () => {
    const many = Array.from({ length: 8 }, (_, i) => listing({ slug: `s${i}` }));
    const want = understand("deep tissue", []);
    expect(matchListings(many, want, 3)).toHaveLength(3);
    expect(matchListings(many, want, 3).map((m) => m.listing.slug)).toEqual(
      matchListings(many, want, 3).map((m) => m.listing.slug),
    );
  });
});

describe("conciergeReply", () => {
  it("asks for what it needs when it has nothing", () => {
    expect(conciergeReply(understand("hi", []), [])).toMatch(/tell me the city/i);
  });

  it("admits an empty result rather than deflecting", () => {
    expect(conciergeReply(understand("reflexology in denver", ["Denver"]), [])).toMatch(
      /could not find anyone/i,
    );
  });

  it("counts what it found", () => {
    const want = understand("deep tissue in denver", ["Denver"]);
    const matches = matchListings([listing(), listing({ slug: "b" })], want);
    expect(conciergeReply(want, matches)).toBe("Here are 2 deep tissue therapists in Denver.");
  });
});
