/** The `type` values Supabase puts on an email link. */
export const EMAIL_LINK_TYPES = [
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email",
] as const;

export type EmailLinkType = (typeof EMAIL_LINK_TYPES)[number];

export function emailLinkType(value: string | null): EmailLinkType | null {
  return EMAIL_LINK_TYPES.find((type) => type === value) ?? null;
}
