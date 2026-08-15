#!/usr/bin/env bash
#
# Fail the build if a tracked file contains something shaped like a live
# credential. Deliberately self-contained: no third-party action, no license
# gate, so it can safely be a required status check.
#
# Run locally with:  bash scripts/scan-secrets.sh
set -euo pipefail

cd "$(dirname "$0")/.."

# Provider-specific prefixes. Generic high-entropy detection is intentionally
# left out — it produces false positives on lockfile hashes and font subsets.
PATTERNS=(
  'sk_live_[0-9a-zA-Z]{16,}'                  # Stripe secret key
  'sk_test_[0-9a-zA-Z]{16,}'                  # Stripe test secret key
  'rk_live_[0-9a-zA-Z]{16,}'                  # Stripe restricted key
  'whsec_[0-9a-zA-Z]{16,}'                    # Stripe webhook secret
  're_[0-9A-Za-z_]{20,}'                      # Resend API key
  'sk-(proj-)?[A-Za-z0-9_-]{20,}'             # OpenAI API key
  'sk-ant-[A-Za-z0-9_-]{20,}'                 # Anthropic API key
  'AIza[0-9A-Za-z_-]{35}'                     # Google API key
  'SG\.[A-Za-z0-9_-]{20,}'                    # SendGrid
  'AC[0-9a-f]{32}'                            # Twilio account SID
  'ghp_[0-9A-Za-z]{36}'                       # GitHub personal access token
  'github_pat_[0-9A-Za-z_]{40,}'              # GitHub fine-grained PAT
  'AKIA[0-9A-Z]{16}'                          # AWS access key ID
  'eyJhbGciOi[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{20,}\.'  # JWT (Supabase keys)
  '-----BEGIN [A-Z ]*PRIVATE KEY-----'        # PEM private key
  'postgres(ql)?://[^:@/[:space:]]+:[^@/[:space:]]+@'   # Postgres URL with password
)

# Files that legitimately describe secret *shapes* rather than carrying values.
EXCLUDES=(
  ':!:pnpm-lock.yaml'
  ':!:scripts/scan-secrets.sh'
)

status=0

for pattern in "${PATTERNS[@]}"; do
  if matches="$(git grep -nIE "$pattern" -- . "${EXCLUDES[@]}" 2>/dev/null)"; then
    echo "::error::Possible secret matching /${pattern}/:"
    echo "$matches"
    status=1
  fi
done

if [ "$status" -eq 0 ]; then
  echo "No credential-shaped strings found in tracked files."
fi

exit "$status"
