#!/usr/bin/env bash
#
# PayPal admin helper — read-only by default.
#
# Everything the deploy needs from PayPal can be done from here instead of
# clicking through the dashboard: find the webhook that is failing, fix its
# URL, read the plan ids that go in PAYPAL_PLAN_*, and list the subscriptions
# that need backfilling into `therapist_subscriptions`.
#
# Usage:
#   export PAYPAL_CLIENT_ID=...
#   export PAYPAL_CLIENT_SECRET=...
#   scripts/paypal-admin.sh webhooks            # list webhooks + their URLs
#   scripts/paypal-admin.sh plans               # list plans with prices
#   scripts/paypal-admin.sh subscriptions       # active subs, for backfill
#   scripts/paypal-admin.sh fix-webhook <id>    # WRITES: apex -> www
#   scripts/paypal-admin.sh create-webhook <url>  # WRITES: register v2's hook
#
# Sandbox: export PAYPAL_API_BASE=https://api-m.sandbox.paypal.com
#
# Only `fix-webhook` and `create-webhook` write anything, and both print what
# they are about to do and ask first.

set -euo pipefail

API="${PAYPAL_API_BASE:-https://api-m.paypal.com}"

if [ -z "${PAYPAL_CLIENT_ID:-}" ] || [ -z "${PAYPAL_CLIENT_SECRET:-}" ]; then
  echo "Set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET first." >&2
  echo "They are in the PayPal dashboard under Apps & Credentials." >&2
  exit 1
fi

token() {
  curl -sS -X POST "$API/v1/oauth2/token" \
    -u "$PAYPAL_CLIENT_ID:$PAYPAL_CLIENT_SECRET" \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d grant_type=client_credentials |
    python3 -c 'import sys,json; print(json.load(sys.stdin)["access_token"])'
}

api() {
  local method="$1" path="$2"
  shift 2
  curl -sS -X "$method" "$API$path" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" "$@"
}

TOKEN="$(token)"

case "${1:-}" in
webhooks)
  # A webhook on the apex domain is the bug: Vercel 308-redirects apex to www
  # and PayPal refuses to follow redirects, so every delivery fails.
  api GET /v1/notifications/webhooks | python3 -c '
import sys, json
hooks = json.load(sys.stdin).get("webhooks", [])
if not hooks:
    print("No webhooks registered.")
for h in hooks:
    hid = h["id"]
    url = h["url"]
    events = len(h.get("event_types", []))
    print(f"{hid}  {url}")
    print(f"    events: {events}")
    if "://masseurmatch.com" in url:
        print("    ^^ APEX DOMAIN — this is the one that never delivers.")
        print(f"    fix: scripts/paypal-admin.sh fix-webhook {hid}")
'
  ;;

plans)
  # The ids are opaque and cannot be derived from our names, which is why they
  # are environment variables. Match by PRICE: 39 -> STANDARD, 79 -> PRO,
  # 99 -> ELITE. A price with no plan needs one created.
  WANT='{"39":"PAYPAL_PLAN_STANDARD","79":"PAYPAL_PLAN_PRO","99":"PAYPAL_PLAN_ELITE"}'
  # The list endpoint omits billing_cycles, so every plan would look priceless
  # and the mapping would tell you to create plans that already exist. Ask for
  # the full representation.
  api GET "/v1/billing/plans?page_size=20&total_required=true" \
    -H "Prefer: return=representation" |
    WANT="$WANT" python3 -c '
import sys, json, os
want = json.loads(os.environ["WANT"])
plans = json.load(sys.stdin).get("plans", [])
if not plans:
    print("No plans found.")
seen = {}
for p in plans:
    pid = p["id"]
    status = p["status"]
    name = p.get("name", "")
    price = ""
    trial = ""
    # These plans lead with a 14-day $0.00 TRIAL cycle. Reading the first cycle
    # would price every plan at zero and match nothing, so use REGULAR.
    for c in p.get("billing_cycles") or []:
        fp = (c.get("pricing_scheme") or {}).get("fixed_price")
        if not fp:
            continue
        value = fp["value"]
        currency = fp["currency_code"]
        if c.get("tenure_type") == "TRIAL":
            freq = c.get("frequency") or {}
            count = freq.get("interval_count")
            unit = freq.get("interval_unit")
            if float(value) == 0:
                trial = f"  (+{count} {unit} free trial)"
            continue
        price = f"{value} {currency}"
        whole = value.split(".")[0]
        if whole in want and status == "ACTIVE":
            seen.setdefault(whole, []).append((pid, name))
    print(f"{pid}  {status:<8} {price:<12} {name}{trial}")
print()
print("Set these on the DASHBOARD project (masseurmatch-v2-kftd):")
for whole, var in want.items():
    matches = seen.get(whole, [])
    if not matches:
        print(f"  {var}=<no active ${whole}.00 plan — create one>")
        continue
    pid, name = matches[0]
    print(f"  {var}={pid}   # {name}")
    if len(matches) > 1:
        # Price alone does not identify a plan when two share one. Say so
        # rather than pick silently — the wrong id bills the wrong product.
        others = ", ".join(f"{p} ({n})" for p, n in matches[1:])
        print(f"      ^ AMBIGUOUS: ${whole}.00 also matches {others}")
        print(f"        Confirm by name before using this id.")
'
  ;;

subscriptions)
  # therapist_subscriptions is empty, so v2 cannot match incoming events to a
  # subscriber. PayPal has no "list all subscriptions" endpoint, so this walks
  # the plans and reports what each one needs looked up.
  echo "PayPal has no list-all-subscriptions API."
  echo "Get the ids from Reports -> Transactions, or from the failed webhook"
  echo "payloads (resource.id, e.g. I-EXY5H8HCTVPN), then run:"
  echo
  echo "  scripts/paypal-admin.sh subscription I-XXXXXXXXXX"
  ;;

subscription)
  # custom_id is the profile id — that is the join key for the backfill.
  api GET "/v1/billing/subscriptions/${2:?usage: subscription <I-...>}" |
    python3 -c '
import sys, json
s = json.load(sys.stdin)
print("id:         ", s.get("id"))
print("status:     ", s.get("status"))
print("plan_id:    ", s.get("plan_id"))
print("custom_id:  ", s.get("custom_id"), " <- profiles.id")
print("start_time: ", s.get("start_time"))
b = s.get("billing_info") or {}
print("next_bill:  ", b.get("next_billing_time"))
'
  ;;

create-webhook)
  # PayPal rejects a URL that is already registered ("Webhook URL already
  # exists"), so this checks first and says so plainly rather than surfacing
  # that as a raw API error. v2 listens on a different host AND a different
  # path (/api/webhooks/billing, not /api/webhooks/paypal), so it does not
  # collide with the old site's hook.
  URL="${2:?usage: create-webhook https://<dashboard-host>/api/webhooks/billing}"

  EXISTING="$(api GET /v1/notifications/webhooks |
    python3 -c 'import sys,json;print("\n".join(w["url"] for w in json.load(sys.stdin).get("webhooks",[])))')"
  if printf '%s\n' "$EXISTING" | grep -Fxq "$URL"; then
    echo "That URL is already registered — nothing to do:"
    echo "  $URL"
    exit 0
  fi

  echo "Registering a NEW webhook (the existing ones are left alone):"
  echo "  $URL"
  echo "Already registered:"
  printf '  %s\n' $EXISTING
  read -r -p "Create? [y/N] " reply
  [ "$reply" = "y" ] || { echo "Not created."; exit 0; }

  # Only the events the handler understands. A wildcard would deliver hundreds
  # of unrelated event types that all get filed as "unhandled".
  api POST /v1/notifications/webhooks -d "{
    \"url\": \"$URL\",
    \"event_types\": [
      {\"name\": \"BILLING.SUBSCRIPTION.ACTIVATED\"},
      {\"name\": \"BILLING.SUBSCRIPTION.CANCELLED\"},
      {\"name\": \"BILLING.SUBSCRIPTION.EXPIRED\"},
      {\"name\": \"BILLING.SUBSCRIPTION.SUSPENDED\"},
      {\"name\": \"BILLING.SUBSCRIPTION.PAYMENT.FAILED\"},
      {\"name\": \"PAYMENT.SALE.COMPLETED\"},
      {\"name\": \"PAYMENT.SALE.DENIED\"}
    ]
  }" | python3 -c '
import sys, json
d = json.load(sys.stdin)
wid = d.get("id")
if wid:
    print()
    print("Created. Set this on the dashboard project and redeploy:")
    print("  PAYPAL_WEBHOOK_ID=" + wid)
    print()
    print("Use THIS id, not the old webhook id. Signature verification is")
    print("per-webhook: v2 checking events against a different webhook id")
    print("rejects every event it receives.")
else:
    name = d.get("name") or d.get("message") or "unknown error"
    print("FAILED: " + str(name))
    for det in d.get("details", []):
        print("  " + str(det.get("issue","")) + " " + str(det.get("description","")))
'
  ;;

fix-webhook)
  ID="${2:?usage: fix-webhook <webhook-id>}"
  CURRENT="$(api GET "/v1/notifications/webhooks/$ID" |
    python3 -c 'import sys,json; print(json.load(sys.stdin)["url"])')"
  FIXED="${CURRENT/:\/\/masseurmatch.com/://www.masseurmatch.com}"

  if [ "$CURRENT" = "$FIXED" ]; then
    echo "Already correct: $CURRENT"
    exit 0
  fi

  echo "  from: $CURRENT"
  echo "    to: $FIXED"
  read -r -p "Apply? [y/N] " reply
  [ "$reply" = "y" ] || { echo "Not changed."; exit 0; }

  api PATCH "/v1/notifications/webhooks/$ID" \
    -d "[{\"op\":\"replace\",\"path\":\"/url\",\"value\":\"$FIXED\"}]" \
    -o /dev/null -w "HTTP %{http_code}\n"
  echo "Now replay the failed events with 'Resend' in the dashboard."
  ;;

*)
  sed -n '3,20p' "$0" | sed 's/^# \{0,1\}//'
  exit 1
  ;;
esac
