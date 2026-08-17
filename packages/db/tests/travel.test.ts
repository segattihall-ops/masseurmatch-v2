import { describe, expect, it } from "vitest";

import {
  formatVisitDates,
  parseTravelSchedule,
  tourPagePath,
  travelBadge,
  travelVisit,
  upcomingVisits,
  VISITING_LOOKAHEAD_DAYS,
} from "../travel";

/**
 * Travel schedules.
 *
 * The bugs worth pinning are the ones the old implementation had: a visit that
 * starts or ends on the wrong day because of the viewer's timezone, a city that
 * matches by name in one place and by slug in another, and malformed JSON
 * reaching a public page.
 */

const AUG_17 = new Date(2026, 7, 17, 12, 0, 0); // local noon, deliberately not UTC

const trip = (city: string, start: string, end: string, state = "NY") => ({
  city,
  state,
  start_date: start,
  end_date: end,
});

describe("parseTravelSchedule", () => {
  it("drops entries that would render as garbage", () => {
    const schedule = [
      trip("New York", "2026-09-01", "2026-09-05"),
      { city: "", start_date: "2026-09-01", end_date: "2026-09-05" },
      { city: "Miami", start_date: "not-a-date", end_date: "2026-09-05" },
      { city: "Austin", start_date: "2026-09-01" },
      // Backwards range: a data-entry slip, not a visit.
      trip("Denver", "2026-09-10", "2026-09-02"),
      null,
      "Chicago",
      42,
    ];

    const parsed = parseTravelSchedule(schedule);
    expect(parsed.map((e) => e.city)).toEqual(["New York"]);
  });

  it("returns nothing for a column that is not an array", () => {
    for (const value of [null, undefined, {}, "", 0, { city: "New York" }]) {
      expect(parseTravelSchedule(value), JSON.stringify(value)).toEqual([]);
    }
  });

  it("normalises the state code and keeps null when absent", () => {
    const [withState, withoutState] = parseTravelSchedule([
      trip("Austin", "2026-09-01", "2026-09-05", "tx"),
      { city: "Miami", start_date: "2026-09-06", end_date: "2026-09-08" },
    ]);

    expect(withState?.state).toBe("TX");
    expect(withoutState?.state).toBeNull();
  });

  it("sorts by start date so 'the next one' is simply the first", () => {
    const parsed = parseTravelSchedule([
      trip("Denver", "2026-10-01", "2026-10-04"),
      trip("Austin", "2026-09-01", "2026-09-05"),
    ]);
    expect(parsed.map((e) => e.city)).toEqual(["Austin", "Denver"]);
  });
});

describe("travelVisit — the timezone fix", () => {
  it("counts a visit that starts today as running now", () => {
    // The old code compared Date.parse("2026-08-17") — midnight UTC — against
    // Date.now(). West of Greenwich this only flipped to "now" late in the day.
    const visit = travelVisit([trip("Austin", "2026-08-17", "2026-08-20")], null, AUG_17);
    expect(visit?.status).toBe("now");
  });

  it("keeps a visit that ends today, all day", () => {
    const visit = travelVisit([trip("Austin", "2026-08-10", "2026-08-17")], null, AUG_17);
    expect(visit?.status).toBe("now");
  });

  it("drops a visit that ended yesterday", () => {
    expect(travelVisit([trip("Austin", "2026-08-01", "2026-08-16")], null, AUG_17)).toBeNull();
  });

  it("gives the same answer at any hour of the day", () => {
    const schedule = [trip("Austin", "2026-08-17", "2026-08-17")];
    for (const hour of [0, 6, 12, 18, 23]) {
      const at = new Date(2026, 7, 17, hour, 30);
      expect(travelVisit(schedule, null, at)?.status, `${hour}h`).toBe("now");
    }
  });
});

describe("travelVisit — choosing what to show", () => {
  it("prefers a running visit over a nearer-looking upcoming one", () => {
    const visit = travelVisit(
      [trip("Austin", "2026-08-15", "2026-08-19"), trip("Denver", "2026-08-18", "2026-08-22")],
      null,
      AUG_17,
    );
    expect(visit?.status).toBe("now");
    expect(visit?.entry.city).toBe("Austin");
  });

  it("counts days until an upcoming visit", () => {
    const visit = travelVisit([trip("Denver", "2026-08-20", "2026-08-24")], null, AUG_17);
    expect(visit?.status).toBe("soon");
    expect(visit?.daysUntil).toBe(3);
  });

  it("says nothing about a visit beyond the lookahead window", () => {
    const justInside = new Date(2026, 7, 17 + VISITING_LOOKAHEAD_DAYS);
    const inside = `2026-08-${String(justInside.getDate()).padStart(2, "0")}`;

    expect(travelVisit([trip("Denver", inside, inside)], null, AUG_17)?.status).toBe("soon");
    expect(travelVisit([trip("Denver", "2026-12-01", "2026-12-05")], null, AUG_17)).toBeNull();
  });

  it("matches a city by slug however the caller spells it", () => {
    // The old code compared a display name in one place and a URL slug in
    // another, so "New York" matched on the card and missed on the tour page.
    const schedule = [trip("New York", "2026-08-15", "2026-08-20")];
    for (const spelling of ["New York", "new-york", "  new york  ", "NEW YORK"]) {
      expect(travelVisit(schedule, spelling, AUG_17)?.status, spelling).toBe("now");
    }
    expect(travelVisit(schedule, "denver", AUG_17)).toBeNull();
  });
});

describe("upcomingVisits", () => {
  it("returns every unfinished visit, soonest first", () => {
    const visits = upcomingVisits(
      [
        trip("Austin", "2026-07-01", "2026-07-05"), // over
        trip("Austin", "2026-09-01", "2026-09-05"),
        trip("Austin", "2026-08-15", "2026-08-19"), // running
      ],
      "austin",
      AUG_17,
    );

    expect(visits.map((v) => v.start_date)).toEqual(["2026-08-15", "2026-09-01"]);
  });
});

describe("travelBadge", () => {
  it("says something a client can act on", () => {
    expect(travelBadge(null)).toBeNull();
    expect(
      travelBadge(travelVisit([trip("Austin", "2026-08-15", "2026-08-20")], null, AUG_17)),
    ).toBe("Visiting now");
    expect(
      travelBadge(travelVisit([trip("Austin", "2026-08-18", "2026-08-20")], null, AUG_17)),
    ).toBe("Visiting tomorrow");
    expect(
      travelBadge(travelVisit([trip("Austin", "2026-08-22", "2026-08-24")], null, AUG_17)),
    ).toBe("Visiting in 5 days");
  });
});

describe("formatVisitDates", () => {
  it("does not shift the month for readers west of Greenwich", () => {
    // `new Date("2026-09-01").toLocaleDateString()` is August 31 in most of the
    // Americas. The dates are formatted from their parts for exactly this.
    expect(formatVisitDates(trip("Austin", "2026-09-01", "2026-09-05"))).toBe("Sep 1–5, 2026");
  });

  it("spells out both months when a visit crosses one", () => {
    expect(formatVisitDates(trip("Austin", "2026-09-28", "2026-10-02"))).toBe(
      "Sep 28 – Oct 2, 2026",
    );
  });

  it("spells out both years when a visit crosses one", () => {
    expect(formatVisitDates(trip("Austin", "2026-12-28", "2027-01-03"))).toBe(
      "Dec 28, 2026 – Jan 3, 2027",
    );
  });
});

describe("tourPagePath", () => {
  it("matches the directory's own URL shape", () => {
    expect(tourPagePath("NY", "New York", "joe-123")).toBe("/ny/new-york/visiting/joe-123");
  });
});
