# Row Level Security policies

Every table in the `public` schema, the access rule it should carry, and why.

## Status of this document

The rules below are the **target state**, established by
[`supabase/migrations/20260815000000_rls_baseline.sql`](../../supabase/migrations/20260815000000_rls_baseline.sql).

Two of them — `profiles` and `keyword_trends` — are written out explicitly in
that migration. Every other table is brought to a safe floor by the migration's
backstop block: RLS on, and a deny-all policy for any operation not already
covered. A table showing `_deny_default` policies in the audit output is a
table that still needs a deliberate rule; it is safe, not finished.

**The live policy state has not been verified against the production database.**
The Supabase connector was unavailable when this was written, so the rules here
are derived from the schema and from the previous repo's migration history
(notably `20260322000000_rls_audit_fix.sql` and
`20260720192214_fix_rls_policies_launch_v3.sql`). Run the audit to get ground
truth:

```bash
SUPABASE_DB_URL=postgresql://… pnpm db:audit-rls
```

It reports every table with RLS disabled, with no policies, or missing a
policy for one of select/insert/update/delete, and exits non-zero if any gap
exists — so it can gate CI.

## Principles

| Principle                                                   | Why                                                                                                                                                                               |
| ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **RLS on every table, no exceptions**                       | Postgres denies by default only once RLS is enabled. A table without it is fully readable by anyone holding the anon key, which ships in the browser.                             |
| **Deny by default, allow deliberately**                     | Every operation needs a policy that says yes. Absence of a policy means "no", never "maybe".                                                                                      |
| **`service_role` bypasses RLS, so it never needs a policy** | Back-end jobs — the Python collector, cron, webhooks — authenticate as `service_role`. Writing a policy for them would only widen the surface reachable with a leaked user token. |
| **Ownership is `user_id = (select auth.uid())`**            | The scalar subselect makes Postgres evaluate `auth.uid()` once per statement instead of once per row (`auth_rls_initplan`).                                                       |
| **Admin override is `public.is_admin()`**                   | One role check, defined once, so admin access is auditable in a single place.                                                                                                     |
| **`NEXT_PUBLIC_*` implies public**                          | The anon key is in the browser. Anything anon can read is effectively published.                                                                                                  |

Policy naming: `<table>_<operation>_<who>` — e.g. `profiles_update_self_or_admin`.

---

## 1. Public directory

Read by logged-out visitors; this is the product surface. Writes are owner-only
or admin-only.

### `profiles` — the central table

```sql
select  using ((status in ('active','approved') and (is_active = true or is_active is null))
               or user_id = (select auth.uid())
               or public.is_admin())
insert  with check (user_id = (select auth.uid()) or public.is_admin())
update  using/check (user_id = (select auth.uid()) or public.is_admin())
delete  using (public.is_admin())
```

| Rule                                        | Reason                                                                                                                                                                       |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public read limited to `active`/`approved`  | Drafts, suspended and pending-moderation profiles must never appear in the directory or be scrapeable via the anon key. Status is the single gate the whole site depends on. |
| `is_active is null` counts as active        | Rows predating the column are live on the current site; treating null as inactive would silently delist them.                                                                |
| Owner always sees their own row             | A therapist must be able to load their profile while it is still pending.                                                                                                    |
| Writes restricted to `user_id = auth.uid()` | The isolation guarantee: one therapist can never edit another's profile, which is what the cross-tenant test asserts.                                                        |
| Delete is admin-only                        | Deletion cascades to photos, reviews and subscriptions. It is an operator action with an audit trail, not self-service.                                                      |

### Other public-read tables

| Table                                                                                                         | Rule                                                           | Reason                                                                                                                                |
| ------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `therapists`, `therapist_profiles`                                                                            | public read of listed rows; owner write; admin all             | Directory projections of `profiles`; must match its visibility gate or they become a bypass.                                          |
| `therapist_services`, `therapist_pricing`, `therapist_locations`, `therapist_availability`, `provider_travel` | public read; owner write                                       | Shown on the public profile. Owner-scoped so a therapist edits only their own offering.                                               |
| `therapist_photos`, `profile_photos`                                                                          | public read of approved; owner write; admin moderate           | Unapproved imagery must not be publicly reachable before moderation clears it.                                                        |
| `profile_sections`                                                                                            | public read; owner write                                       | Free-text profile blocks rendered publicly.                                                                                           |
| `reviews`, `profile_reviews`, `imported_reviews`                                                              | public read of published; authenticated insert; admin moderate | Reviews are the trust signal. Anyone signed in may submit; only admins may edit or unpublish, so a therapist cannot delete criticism. |
| `cities`                                                                                                      | public read; admin write                                       | Directory taxonomy driving `search_public_therapists`.                                                                                |
| `keywords`                                                                                                    | public read; admin write                                       | Public SEO landing terms — distinct from `keyword_trends`, which is private.                                                          |
| `blog_posts`                                                                                                  | public read of published; admin write                          | Marketing content.                                                                                                                    |
| `featured_masters`                                                                                            | public read; admin write                                       | Editorial placement; must not be self-assignable.                                                                                     |
| `subscription_plans`                                                                                          | public read; admin write                                       | Pricing is shown on the public pricing page.                                                                                          |
| `site_settings`, `admin_content`                                                                              | public read; admin write                                       | Copy and flags rendered on public pages.                                                                                              |

---

## 2. Owner-scoped

Private to one user. No public read at all: read and write require
`user_id = (select auth.uid())`, with `public.is_admin()` as override.

| Table                                                                                                                                                                                                              | Reason the data is owner-only                                                                                                                   |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `subscriptions`, `therapist_subscriptions`, `visibility_addons`                                                                                                                                                    | Billing state. Exposing tier or lapse status publicly would reveal commercial standing.                                                         |
| `payment_transactions`, `checkout_sessions`                                                                                                                                                                        | Payment history. Written by Stripe webhooks under `service_role`; the user only reads.                                                          |
| `identity_verifications`, `text_verifications`, `profile_documents`                                                                                                                                                | Government ID and verification artifacts — the most sensitive data in the system. Read by the owner, written only by the verification pipeline. |
| `user_mfa`, `mfa_pending`                                                                                                                                                                                          | Authentication factors. Never readable cross-user.                                                                                              |
| `sms_profiles`                                                                                                                                                                                                     | Phone numbers.                                                                                                                                  |
| `push_subscriptions`, `notification_deliveries`, `notifications`                                                                                                                                                   | Delivery endpoints and per-user message history.                                                                                                |
| `user_notification_preferences`, `marketing_preferences`, `contact_preferences`                                                                                                                                    | Consent state. Must be editable by its owner and by nobody else, for CAN-SPAM/GDPR.                                                             |
| `favorites`, `client_favorites`                                                                                                                                                                                    | Reveals who a client is interested in.                                                                                                          |
| `search_history`                                                                                                                                                                                                   | Behavioural history tied to an identity.                                                                                                        |
| `appointments`, `booking_inquiries`, `contact_inquiries`, `contact_events`                                                                                                                                         | Visible to the two parties on the booking only.                                                                                                 |
| `conversations`, `messages`                                                                                                                                                                                        | Private messaging: readable only by participants.                                                                                               |
| `support_tickets`, `support_ticket_messages`                                                                                                                                                                       | Reporter plus admin.                                                                                                                            |
| `complaints`, `profile_reports`                                                                                                                                                                                    | Reporter plus admin — the subject must not see who reported them.                                                                               |
| `referral_codes`, `referral_signups`                                                                                                                                                                               | Owner reads their own referral funnel; awards are written by `service_role` so rewards cannot be self-granted.                                  |
| `ai_profile_coach_daily_snapshots`, `ai_profile_coach_email_preferences`, `ai_profile_analysis_runs`, `ai_profile_optimization_runs`, `ai_profile_photo_scores`, `ai_profile_content_drafts`, `ai_profile_reports` | Per-therapist coaching output, including weaknesses. Competitively sensitive; owner-read, pipeline-write.                                       |
| `trial_feedback_responses`                                                                                                                                                                                         | Marked service-role-only in the schema comment: confidential questionnaire responses.                                                           |

---

## 3. Admin-only

No anon or owner access. Read and write both gated on `public.is_admin()`.

| Table                                                                                                                                                                | Reason                                                                          |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `admin_actions`, `audit_log`                                                                                                                                         | The audit trail. If a user could write it, it would stop being evidence.        |
| `moderation_queue`, `moderation_actions`, `photo_moderations`                                                                                                        | Moderation decisions and reviewer notes about users.                            |
| `user_roles`, `users`                                                                                                                                                | Role assignment. Self-service write here is privilege escalation.               |
| `user_suspensions`                                                                                                                                                   | Enforcement state; the suspended user must not be able to clear it.             |
| `runtime_config`                                                                                                                                                     | Feature flags and operational switches.                                         |
| `admin_email_templates`, `admin_email_campaigns`                                                                                                                     | Outbound campaigns to the whole user base.                                      |
| `messaging_settings`, `messaging_contacts`, `messaging_campaigns`, `messaging_campaign_contacts`, `messaging_conversations`, `messaging_messages`, `messaging_queue` | Admin outreach, explicitly separate from user messaging per the schema comment. |
| `bruno_agent_config`, `bruno_conversations`                                                                                                                          | Internal agent configuration and transcripts.                                   |
| `imported_profile_data`, `profile_migrations`, `profile_status_debug_log`, `profile_status_invalid_log`                                                              | Migration internals and debug traces.                                           |
| `keyword_insights`, `keyword_alerts`, `keyword_content_map`                                                                                                          | Derived SEO strategy — same reasoning as `keyword_trends`.                      |

---

## 4. Service-role only

RLS on, **no policy granting anyone anything**. Written and read exclusively by
back-end jobs authenticating as `service_role`, which bypasses RLS. Admin
surfaces read these through server routes that authorise the caller first, not
through the anon key.

The absence of a policy here is the design, not an oversight: it means a
compromised anon or user JWT reaches none of it.

### `keyword_trends` — specified explicitly

```sql
select  using (public.is_admin())
insert  with check (false)
update  using/check (false)
delete  using (false)
grant select, insert, update, delete on public.keyword_trends to service_role;
```

Admins read it in the dashboard. Nobody writes it through PostgREST — the
Python collector connects with the service-role key and so bypasses RLS
entirely, which is why the write policies deny everyone and the collector keeps
working unchanged. Trend history is competitive intelligence: it must not leak,
and it must not be forgeable with a stolen user token.

### The rest

| Table                                                                                                                                                                                                                 | Reason                                                                                                                                             |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `demand_scores`, `demand_collection_runs`, `demand_radar_collection_runs`, `demand_radar_market_interest`, `demand_radar_trend_metrics`, `demand_radar_ads_historical_metrics`, `demand_radar_spike_alert_deliveries` | Demand Radar market signals. The schema comment already states client access is blocked and reads go through authenticated server APIs.            |
| `analytics_events`, `search_analytics`, `profile_view_analytics`, `inquiry_analytics`, `booking_analytics`                                                                                                            | Aggregate behavioural data across all users.                                                                                                       |
| `ranking_events`, `therapist_learning_scores`, `upgrade_opportunities`                                                                                                                                                | Ranking inputs. Readable ranking weights would be directly gameable by therapists competing for placement.                                         |
| `email_queue`, `email_workflows`, `email_decisions`, `email_deliveries`, `email_suppressions`, `email_provider_events`, `lifecycle_email_queue`, `lifecycle_email_log`                                                | Delivery pipeline. Suppressions especially: writable suppressions would let one user unsubscribe another.                                          |
| `background_jobs`                                                                                                                                                                                                     | Job runner state.                                                                                                                                  |
| `stripe_events`                                                                                                                                                                                                       | Raw webhook payloads, the idempotency ledger for billing.                                                                                          |
| `sms_logs`, `sms_follow_up_alerts`, `vapi_sms_sessions`                                                                                                                                                               | Message logs containing phone numbers.                                                                                                             |
| `newsletter_subscribers`, `waitlist_signups`, `waitlist_events`, `waitlist_rate_limits`, `waitlist_voice_ai`                                                                                                          | Email lists. Readable via anon key, this is a harvestable address book; `waitlist_rate_limits` must also be unwritable or the limit is bypassable. |

---

## Views

Views do not carry their own RLS — they run with the privileges of their owner
and inherit the policies of their underlying tables only when defined with
`security_invoker = on`.

| View                                                              | Note                                                                                                                                                      |
| ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `public_profiles`, `public_therapists`, `public_imported_reviews` | Intended as the anon-facing projections. Their `WHERE` clause is the visibility gate; confirm `security_invoker` is set, otherwise they bypass table RLS. |
| `provider_profiles_private`                                       | Must not be reachable by anon.                                                                                                                            |
| `ai_profile_coach_source`, `therapist_analytics_daily`            | Internal; server-side reads only.                                                                                                                         |

Verifying `security_invoker` on all six is the first follow-up once database
access is restored — a `security_definer` view over `profiles` would defeat
every rule above.

---

## Testing

`packages/db/tests/rls.test.ts` asserts the behaviour, not the policy text:

1. Anonymous read of `keyword_trends` returns empty (or is refused).
2. Anonymous read of `profiles` returns only `active`/`approved` rows.
3. Anonymous write to `profiles` affects zero rows.
4. An authenticated therapist updating another therapist's profile affects zero rows.

`packages/db/tests/ranking.test.ts` asserts `search_public_therapists` returns
rows for a real city, ordered by `priority_rank`.

They need `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and
skip cleanly without them. The cross-therapist test additionally needs
`TEST_THERAPIST_A_EMAIL`, `TEST_THERAPIST_A_PASSWORD` and
`TEST_THERAPIST_B_PROFILE_ID`. Point them at staging where possible.
