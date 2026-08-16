import { entitlesListing, GRACE_PERIOD_DAYS, type SubscriptionStatus } from "./plans";
import type { BillingEventKind } from "./provider";

/**
 * What a billing event does to a subscription.
 *
 * Pure functions, deliberately. The webhook handler's job is then only to
 * verify, deduplicate, and persist what these return — none of the actual
 * policy lives in the route, so all of it is testable without a database or a
 * merchant account.
 */

export type SubscriptionState = {
  status: SubscriptionStatus;
  /** End of the paid period, ISO. Null when there has never been one. */
  currentPeriodEnd: string | null;
  /** Set when a failed payment starts the grace period. */
  graceUntil: string | null;
  /** True once the therapist has asked to cancel at period end. */
  cancelAtPeriodEnd: boolean;
};

export type Transition = {
  next: SubscriptionState;
  /** Whether the profile should be publicly listed after this event. */
  listed: boolean;
  /** One line for the audit trail. */
  note: string;
};

function addDays(from: Date, days: number): string {
  return new Date(from.getTime() + days * 24 * 60 * 60 * 1000).toISOString();
}

/**
 * Apply an event.
 *
 * `now` is injected rather than read from the clock so the grace-period
 * arithmetic is testable and the function stays pure.
 *
 * The rules, and why:
 *
 *   payment_succeeded      clears any grace period. A successful charge after a
 *                          failure is a recovery, not a second chance — leaving
 *                          `graceUntil` set would unpublish a paying therapist
 *                          days later.
 *
 *   payment_failed         starts the grace period but keeps the listing up.
 *                          Cards expire and banks decline for reasons that
 *                          resolve themselves; delisting immediately punishes
 *                          the therapist for their bank's behaviour. A second
 *                          failure does NOT extend the window — otherwise a
 *                          card that never works keeps a listing alive forever.
 *
 *   subscription_canceled  keeps the listing until the paid period ends. They
 *                          paid for it.
 *
 *   subscription_expired   ends it now. This is the provider saying the term is
 *                          over, not a request for the future.
 */
export function applyBillingEvent(
  current: SubscriptionState,
  kind: BillingEventKind,
  now: Date,
  periodEnd?: string | null,
): Transition {
  switch (kind) {
    case "payment_succeeded": {
      const next: SubscriptionState = {
        status: "active",
        currentPeriodEnd: periodEnd ?? current.currentPeriodEnd,
        graceUntil: null,
        cancelAtPeriodEnd: current.cancelAtPeriodEnd,
      };
      return {
        next,
        listed: true,
        note: current.graceUntil
          ? "Payment recovered; grace period cleared."
          : "Payment succeeded.",
      };
    }

    case "payment_failed": {
      // Keep the original deadline if one is already running.
      const graceUntil = current.graceUntil ?? addDays(now, GRACE_PERIOD_DAYS);
      return {
        next: { ...current, status: "past_due", graceUntil },
        listed: true,
        note: current.graceUntil
          ? `Payment failed again; grace period unchanged, ends ${graceUntil}.`
          : `Payment failed; ${GRACE_PERIOD_DAYS}-day grace period ends ${graceUntil}.`,
      };
    }

    case "subscription_canceled": {
      return {
        next: { ...current, status: "canceled", cancelAtPeriodEnd: true },
        // Still entitled to what was paid for.
        listed: !isPeriodOver(current.currentPeriodEnd, now),
        note: current.currentPeriodEnd
          ? `Cancelled; listing runs until ${current.currentPeriodEnd}.`
          : "Cancelled; no paid period remaining.",
      };
    }

    case "subscription_expired": {
      return {
        next: { ...current, status: "expired", graceUntil: null },
        listed: false,
        note: "Subscription expired; listing unpublished.",
      };
    }
  }
}

function isPeriodOver(periodEnd: string | null, now: Date): boolean {
  if (!periodEnd) return true;
  const end = Date.parse(periodEnd);
  return Number.isNaN(end) ? true : end <= now.getTime();
}

/**
 * Whether a state still entitles a listing *right now*.
 *
 * Separate from `applyBillingEvent` because time passes without events: a grace
 * period ends because the clock moved, not because the provider said anything.
 * A scheduled job calls this to unpublish profiles whose window has closed.
 */
export function shouldBeListed(state: SubscriptionState, now: Date): boolean {
  if (state.status === "past_due") {
    // Past due only entitles a listing while the grace window is open.
    return state.graceUntil !== null && Date.parse(state.graceUntil) > now.getTime();
  }
  if (state.status === "canceled") {
    return !isPeriodOver(state.currentPeriodEnd, now);
  }
  return entitlesListing(state.status);
}

/** A fresh subscription state for a therapist who has never paid. */
export function initialState(): SubscriptionState {
  return {
    status: "none",
    currentPeriodEnd: null,
    graceUntil: null,
    cancelAtPeriodEnd: false,
  };
}
