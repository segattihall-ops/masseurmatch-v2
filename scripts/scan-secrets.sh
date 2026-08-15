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
#
# Every token pattern is anchored with \b so a prefix cannot match mid-word:
# without it, /re_.../ fires on `require_identity_verification` and /sk-.../
# on `task-...`. Character classes exclude `_` for the same reason — real keys
# are unbroken base62 runs, snake_case identifiers are not.
PATTERNS=(
  '\bsk_live_[0-9a-zA-Z]{16,}'                # Stripe secret key
  '\bsk_test_[0-9a-zA-Z]{16,}'                # Stripe test secret key
  '\brk_live_[0-9a-zA-Z]{16,}'                # Stripe restricted key
  '\bwhsec_[0-9a-zA-Z]{16,}'                  # Stripe webhook secret
  '\bre_[0-9A-Za-z]{24,}'                     # Resend API key
  '\bsk-(proj-)?[A-Za-z0-9-]{20,}'            # OpenAI API key
  '\bsk-ant-[A-Za-z0-9-]{20,}'                # Anthropic API key
  '\bAIza[0-9A-Za-z_-]{35}'                   # Google API key
  '\bSG\.[A-Za-z0-9_-]{20,}'                  # SendGrid
  '\bAC[0-9a-f]{32}\b'                        # Twilio account SID
  '\bghp_[0-9A-Za-z]{36}'                     # GitHub personal access token
  '\bgithub_pat_[0-9A-Za-z_]{40,}'            # GitHub fine-grained PAT
  '\bAKIA[0-9A-Z]{16}\b'                      # AWS access key ID
  '\beyJhbGciOi[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{20,}\.'  # JWT (Supabase keys)
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
