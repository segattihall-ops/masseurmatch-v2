import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Load `.env.local` into `process.env` so the tests can be run with nothing
 * but `pnpm test`. Values already present in the environment win, which keeps
 * CI overrides working. No dependency on dotenv — the format we need is
 * `KEY=value` with `#` comments.
 */
const here = dirname(fileURLToPath(import.meta.url));

for (const candidate of [
  join(here, "..", ".env.local"),
  join(here, "..", "..", "..", ".env.local"),
]) {
  if (!existsSync(candidate)) continue;

  for (const line of readFileSync(candidate, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separator = trimmed.indexOf("=");
    if (separator === -1) continue;

    const key = trimmed.slice(0, separator).trim();
    if (process.env[key] !== undefined) continue;

    let value = trimmed.slice(separator + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn(
    "\n[db tests] NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY are not set — " +
      "RLS and ranking tests will be skipped.\n" +
      "Set them in packages/db/.env.local (or the repo root) to run them.\n",
  );
}
