/**
 * Moderation vocabulary.
 *
 * Plain module — no `server-only` — so the checklist can be rendered in the
 * browser and enforced in the server action from the same definition. Two
 * copies would let the UI show four checks while the server enforced three.
 */

export const MODERATION_ACTIONS = ["approve", "reject", "suspend"] as const;
export type ModerationAction = (typeof MODERATION_ACTIONS)[number];

export const ACTION_LABELS: Record<ModerationAction, string> = {
  approve: "Approve",
  reject: "Reject",
  suspend: "Suspend",
};

/**
 * FOSTA-SESTA review checklist.
 *
 * Every item must be affirmed before a profile can be approved. This is a
 * legal-exposure control, not a UI nicety: the point is that a reviewer cannot
 * approve a listing without having looked at each surface where prohibited
 * content appears, and that the affirmation is recorded in the audit log
 * alongside who made it.
 *
 * Enforced server-side in `moderateProfile`. Approval only — see the comment
 * there for why rejecting must never require a completed checklist.
 */
export const FOSTA_CHECKS = [
  {
    id: "photos",
    label: "Photos",
    detail: "No nudity, no sexual content, no imagery suggesting commercial sexual services.",
  },
  {
    id: "description",
    label: "Description",
    detail: "No coded or explicit solicitation, no rates tied to anything other than massage.",
  },
  {
    id: "services",
    label: "Services",
    detail: "Every listed service is a legitimate bodywork modality.",
  },
  {
    id: "links",
    label: "External links",
    detail: "No links to escort directories, adult platforms, or off-site solicitation.",
  },
] as const;

export type FostaCheckId = (typeof FOSTA_CHECKS)[number]["id"];
