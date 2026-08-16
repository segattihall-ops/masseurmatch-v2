/**
 * RLS coverage audit.
 *
 * Runs `audit-rls.sql` against the project and reports every table in the
 * `public` schema that either has RLS disabled or is missing a policy for one
 * of select / insert / update / delete.
 *
 * Read-only. Exits non-zero when gaps are found, so it can gate CI.
 *
 *   SUPABASE_DB_URL=postgresql://… pnpm db:audit-rls
 *   SUPABASE_DB_URL=…              pnpm db:audit-rls --json
 *
 * `SUPABASE_DB_URL` is the project's pooled or direct connection string
 * (Supabase dashboard → Project Settings → Database → Connection string).
 */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

type Operation = "select" | "insert" | "update" | "delete";

interface PolicyRow {
  name: string;
  command: Operation | "all";
  roles: string[];
  permissive: boolean;
  using: string | null;
  check: string | null;
}

interface TableRow {
  table_name: string;
  rls_enabled: boolean;
  rls_forced: boolean;
  has_select: boolean;
  has_insert: boolean;
  has_update: boolean;
  has_delete: boolean;
  policies: PolicyRow[];
}

interface AuditReport {
  generated_at: string;
  tables: TableRow[];
}

const OPERATIONS: Operation[] = ["select", "insert", "update", "delete"];

function missingOperations(table: TableRow): Operation[] {
  const covered: Record<Operation, boolean> = {
    select: table.has_select,
    insert: table.has_insert,
    update: table.has_update,
    delete: table.has_delete,
  };
  return OPERATIONS.filter((operation) => !covered[operation]);
}

function runAudit(databaseUrl: string): AuditReport {
  const here = dirname(fileURLToPath(import.meta.url));
  const sql = readFileSync(join(here, "audit-rls.sql"), "utf8");

  const raw = execFileSync(
    "psql",
    [databaseUrl, "--no-psqlrc", "--tuples-only", "--no-align", "-c", sql],
    {
      encoding: "utf8",
      maxBuffer: 32 * 1024 * 1024,
    },
  );

  return JSON.parse(raw.trim()) as AuditReport;
}

function main(): void {
  const databaseUrl = process.env.SUPABASE_DB_URL;
  if (!databaseUrl) {
    console.error(
      "SUPABASE_DB_URL is not set.\n" +
        "Find it in the Supabase dashboard under Project Settings → Database → Connection string,\n" +
        "then run:  SUPABASE_DB_URL=postgresql://… pnpm db:audit-rls",
    );
    process.exit(2);
  }

  const report = runAudit(databaseUrl);
  const asJson = process.argv.includes("--json");

  if (asJson) {
    console.log(JSON.stringify(report, null, 2));
  }

  const withoutRls = report.tables.filter((table) => !table.rls_enabled);
  const withoutPolicies = report.tables.filter(
    (table) => table.rls_enabled && table.policies.length === 0,
  );
  const partiallyCovered = report.tables
    .filter((table) => table.rls_enabled && table.policies.length > 0)
    .map((table) => ({ table, missing: missingOperations(table) }))
    .filter((entry) => entry.missing.length > 0);

  if (!asJson) {
    console.log(`Audited ${report.tables.length} tables in schema "public".\n`);

    if (withoutRls.length > 0) {
      console.log(`RLS DISABLED (${withoutRls.length}):`);
      for (const table of withoutRls) console.log(`  - ${table.table_name}`);
      console.log("");
    }

    if (withoutPolicies.length > 0) {
      console.log(
        `RLS ON BUT NO POLICIES — deny-all for anon/authenticated (${withoutPolicies.length}):`,
      );
      for (const table of withoutPolicies) console.log(`  - ${table.table_name}`);
      console.log("");
    }

    if (partiallyCovered.length > 0) {
      console.log(`MISSING PER-OPERATION POLICIES (${partiallyCovered.length}):`);
      for (const { table, missing } of partiallyCovered) {
        console.log(`  - ${table.table_name}: no ${missing.join(", ")} policy`);
      }
      console.log("");
    }
  }

  const gaps = withoutRls.length + withoutPolicies.length + partiallyCovered.length;
  if (gaps === 0) {
    console.log("No gaps: every table has RLS enabled and a policy for each operation.");
    return;
  }

  console.error(`${gaps} table(s) need attention.`);
  process.exit(1);
}

main();
