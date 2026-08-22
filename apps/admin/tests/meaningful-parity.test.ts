import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const adminRoot = fileURLToPath(new URL("../", import.meta.url));
const repoRoot = fileURLToPath(new URL("../../../", import.meta.url));

function read(relative: string): string {
  return readFileSync(`${repoRoot}${relative}`, "utf8");
}

describe("meaningful Admin parity", () => {
  it.each(["emails", "messaging", "migrations", "blog", "cities", "tools"])(
    "has a real %s page",
    (route) => {
      expect(existsSync(`${adminRoot}src/app/admin/${route}/page.tsx`)).toBe(true);
    },
  );

  it("routes obsolete legacy names to working V2 successors", () => {
    const config = read("apps/admin/next.config.mjs");
    expect(config).toContain('{ source: "/admin/profile-cms", destination: "/people"');
    expect(config).toContain('{ source: "/admin/sms", destination: "/messaging"');
    expect(config).toContain('{ source: "/admin/resend-topics", destination: "/emails"');
    expect(config).toContain('{ source: "/admin/keywords", destination: "/demand-radar"');
  });

  it("keeps imported-review moderation service-role only and atomic", () => {
    const migration = read(
      "packages/db/migrations/20260822193000_admin_profile_import_review.sql",
    );
    expect(migration).toContain("create or replace function public.admin_review_profile_migration");
    expect(migration).toContain("security definer");
    expect(migration).toContain(
      "grant execute on function public.admin_review_profile_migration(uuid, uuid, jsonb) to service_role",
    );
    expect(migration).toContain(
      "revoke all on function public.admin_review_profile_migration(uuid, uuid, jsonb) from authenticated",
    );
  });

  it("keeps manual messaging queue creation service-role only and atomic", () => {
    const migration = read(
      "packages/db/migrations/20260822194500_admin_messaging_queue.sql",
    );
    expect(migration).toContain("create or replace function public.admin_queue_messaging_message");
    expect(migration).toContain("security definer");
    expect(migration).toContain(
      "grant execute on function public.admin_queue_messaging_message(uuid, uuid, text) to service_role",
    );
    expect(migration).toContain(
      "revoke all on function public.admin_queue_messaging_message(uuid, uuid, text) from authenticated",
    );
  });
});
