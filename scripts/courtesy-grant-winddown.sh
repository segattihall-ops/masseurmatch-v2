#!/bin/bash
# Courtesy Grant Wind-Down — Execute Steps 1-3
# This script must be run on the day the email will be sent
# The 30-day deadline clock starts when this runs

set -eu

# Check environment
if [ -z "${SUPABASE_DB_URL:-}" ]; then
  echo "Error: SUPABASE_DB_URL environment variable not set"
  exit 1
fi

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MIGRATION_FILE="$REPO_ROOT/packages/db/migrations/courtesy_tier_grants.sql"
QUERY_FILE="$REPO_ROOT/packages/db/queries/courtesy-grant-notice.sql"
OUTPUT_FILE="/tmp/courtesy-grant-notice.csv"

echo "🔷 Courtesy Grant Wind-Down — Steps 1-3"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 1: Apply the migration
echo "📍 Step 1: Applying migration..."
psql "$SUPABASE_DB_URL" -f "$MIGRATION_FILE"
echo "✓ Migration applied"
echo ""

# Step 2: Verify the results
echo "📍 Step 2: Verifying results..."
VERIFY=$(psql "$SUPABASE_DB_URL" -c "
select count(*) filter (where tier_granted_until is not null) as com_prazo,
       count(*) filter (where coalesce(subscription_tier,'free') <> 'free'
                          and subscription_status is null
                          and tier_granted_until is null)      as sem_prazo_erro,
       min(tier_granted_until)::date                           as prazo
from public.profiles;" 2>&1)

echo "$VERIFY"
echo ""

# Extract the verification data
COM_PRAZO=$(echo "$VERIFY" | grep -E '^\s+[0-9]' | awk '{print $1}')
SEM_PRAZO_ERRO=$(echo "$VERIFY" | grep -E '^\s+[0-9]' | awk '{print $2}')
PRAZO=$(echo "$VERIFY" | grep -E '^\s+[0-9]' | awk '{print $3}')

echo "Results:"
echo "  com_prazo: $COM_PRAZO (expected: 26)"
echo "  sem_prazo_erro: $SEM_PRAZO_ERRO (expected: 0)"
echo "  prazo: $PRAZO (expected: 30 days from today)"
echo ""

# Check for errors
if [ "$COM_PRAZO" != "26" ]; then
  echo "⚠️  WARNING: com_prazo is $COM_PRAZO, expected 26"
fi

if [ "$SEM_PRAZO_ERRO" != "0" ]; then
  echo "❌ ERROR: sem_prazo_erro is $SEM_PRAZO_ERRO, expected 0"
  echo "   Someone has no deadline behind their notice. DO NOT SEND."
  exit 1
fi

echo "✓ Verification passed"
echo ""

# Step 3: Pull the mailing list
echo "📍 Step 3: Pulling mailing list..."
psql "$SUPABASE_DB_URL" -f "$QUERY_FILE" > "$OUTPUT_FILE"
RECIPIENT_COUNT=$(wc -l < "$OUTPUT_FILE" || echo 0)
echo "✓ Mailing list saved to: $OUTPUT_FILE"
echo "  Recipients: $RECIPIENT_COUNT (expected: 26)"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Steps 1-3 complete!"
echo ""
echo "📋 Next: Send emails from the mailing list"
echo ""
echo "Email template: docs/COURTESY-GRANT-WINDDOWN.md (Step 4)"
echo "Mailing list: $OUTPUT_FILE"
echo "Deadline: $PRAZO"
echo ""
echo "Critical reminders:"
echo "  • Photo numbers MUST match packages/billing/plans.ts"
echo "  • Use prazo from the query output, never hand-typed"
echo "  • Do NOT mention featured placement"
echo "  • Send to publicly visible profiles first"
echo ""
