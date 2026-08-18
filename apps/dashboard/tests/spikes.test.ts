import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Server-side Spike enforcement.
 *
 * The dashboard disables the button, but the check that matters is the one in
 * `spendSpike`. These drive it through a stubbed Supabase client so the quota
 * rules are exercised without a database.
 */

type Row = Record<string, unknown>;

const state = {
  count: 0,
  countError: null as { message: string } | null,
  insertError: null as { message: string } | null,
  updateError: null as { message: string } | null,
  inserted: [] as Row[],
  updated: [] as Row[],
};

vi.mock("@masseurmatch/db/client", () => ({
  createServiceClient: () => ({
    from(table: string) {
      if (table === "profile_spikes") {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                gte: async () => ({ count: state.count, error: state.countError }),
              }),
            }),
          }),
          insert: async (row: Row) => {
            state.inserted.push(row);
            return { error: state.insertError };
          },
        };
      }
      return {
        update: (row: Row) => ({
          eq: async () => {
            state.updated.push(row);
            return { error: state.updateError };
          },
        }),
      };
    },
  }),
}));

const { getSpikeStatus, spendSpike } = await import("@/lib/spikes");

const NOW = new Date("2026-09-15T12:00:00Z");

function profile(over: Partial<Record<string, string | null>> = {}) {
  return {
    id: "p1",
    subscription_tier: "pro",
    subscription_status: "active",
    tier_granted_until: null,
    spike_until: null,
    ...over,
  };
}

beforeEach(() => {
  state.count = 0;
  state.countError = null;
  state.insertError = null;
  state.updateError = null;
  state.inserted = [];
  state.updated = [];
});

describe("getSpikeStatus", () => {
  it("reads the allowance from the plan", async () => {
    state.count = 2;
    const s = await getSpikeStatus(profile(), NOW);
    expect(s.perMonth).toBe(6); // Pro
    expect(s.usedThisMonth).toBe(2);
    expect(s.remaining).toBe(4);
    expect(s.available).toBe(true);
  });

  it("uses the ENTITLED tier, not the column", async () => {
    // An unpaid Elite whose courtesy grant lapsed is a Free profile, and Free
    // has no Spikes — reading subscription_tier directly would hand out 12.
    const s = await getSpikeStatus(
      profile({
        subscription_tier: "elite",
        subscription_status: null,
        tier_granted_until: "2026-08-01T00:00:00Z",
      }),
      NOW,
    );
    expect(s.perMonth).toBe(0);
    expect(s.canSpend).toBe(false);
  });

  it("reports unavailable rather than crashing when the migration is pending", async () => {
    state.countError = { message: 'relation "profile_spikes" does not exist' };
    const s = await getSpikeStatus(profile(), NOW);
    expect(s.available).toBe(false);
    expect(s.canSpend).toBe(false);
  });

  it("rethrows a real database error instead of hiding it", async () => {
    state.countError = { message: "connection terminated unexpectedly" };
    await expect(getSpikeStatus(profile(), NOW)).rejects.toThrow(/connection terminated/);
  });
});

describe("spendSpike", () => {
  it("records the spend and lifts the profile", async () => {
    const result = await spendSpike(profile(), NOW);
    expect(result.ok).toBe(true);
    expect(state.inserted).toHaveLength(1);
    expect(state.inserted[0]).toMatchObject({ profile_id: "p1", source: "quota" });
    expect(state.updated).toHaveLength(1);
    // 24 hours after now.
    expect(state.updated[0]?.spike_until).toBe("2026-09-16T12:00:00.000Z");
  });

  it("refuses once the month is spent, and writes nothing", async () => {
    state.count = 6;
    const result = await spendSpike(profile(), NOW);
    expect(result.ok).toBe(false);
    expect(state.inserted).toHaveLength(0);
    expect(state.updated).toHaveLength(0);
  });

  it("refuses while one is already running", async () => {
    const result = await spendSpike(profile({ spike_until: "2026-09-15T18:00:00Z" }), NOW);
    expect(result.ok).toBe(false);
    expect(state.inserted).toHaveLength(0);
  });

  it("refuses Free and says it is about the plan", async () => {
    const result = await spendSpike(
      profile({ subscription_tier: "free", subscription_status: null }),
      NOW,
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toMatch(/Standard/);
  });

  it("returns a sentence, never an internal reason code", async () => {
    state.count = 6;
    const result = await spendSpike(profile(), NOW);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).not.toBe("quota-spent");
      expect(result.reason).toMatch(/1st/);
    }
  });

  it("does not lift the profile when the history write fails", async () => {
    // Otherwise the lift is free and repeatable.
    state.insertError = { message: "deadlock detected" };
    const result = await spendSpike(profile(), NOW);
    expect(result.ok).toBe(false);
    expect(state.updated).toHaveLength(0);
  });

  it("admits it when the credit was taken but the lift did not apply", async () => {
    state.updateError = { message: "timeout" };
    const result = await spendSpike(profile(), NOW);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toMatch(/support/i);
  });

  it("declines cleanly when the migration is pending", async () => {
    state.countError = { message: "column profiles.spike_until does not exist" };
    const result = await spendSpike(profile(), NOW);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toMatch(/not available/i);
  });
});
