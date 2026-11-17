#!/usr/bin/env bash
# Happy-path API tests for reservas-app.
# Usage: bash scripts/test_happy.sh   (the server must be running: npm start)
# Requires: httpie, jq

set -uo pipefail
# No `set -e` on purpose: a failed assertion is a failed test to report,
# not a reason to abort the run.

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$ROOT/.env"
DATA_DIR="$ROOT/data"
BACKUP_DIR="/tmp/opencode/reservas-app-backup-$$"

PASS=0
FAIL=0

# ------------------------------------------------------------- utilities ---

# .env uses `KEY = value` (spaces around `=`), so we cannot `source` it.
env_value() {
  grep -E "^[[:space:]]*$1[[:space:]]*=" "$ENV_FILE" \
    | head -n1 | cut -d= -f2- | tr -d '[:space:]'
}

pass() { PASS=$((PASS + 1)); printf '  \033[32mPASS\033[0m %s\n' "$1"; }
fail() { FAIL=$((FAIL + 1)); printf '  \033[31mFAIL\033[0m %s (expected %s, got %s)\n' "$1" "$2" "$3"; }

check() {
  local desc="$1" expected="$2" actual="$3"
  if [[ "$expected" == "$actual" ]]; then pass "$desc"; else fail "$desc" "$expected" "$actual"; fi
}

section() { printf '\n== %s ==\n' "$1"; }

# Sends a request with httpie and exports STATUS (status code) and BODY (raw response).
req() {
  local method="$1" url="$2" body="${3:-}" out raw
  out="$(mktemp)"
  if [[ -n "$body" ]]; then
    # Pipe the raw JSON body via stdin (--raw cannot be mixed with header items).
    printf '%s' "$body" | http --print=hb "$method" "$url" \
      Content-Type:application/json >"$out" 2>&1
  else
    http --ignore-stdin --print=hb "$method" "$url" >"$out" 2>&1
  fi
  # httpie emits CRLF line endings; normalize before splitting headers/body.
  raw="$(tr -d '\r' <"$out")"
  STATUS="$(printf '%s\n' "$raw" | awk 'NR == 1 { print $2 }')"
  BODY="$(printf '%s\n' "$raw" | sed '1,/^$/d')"
  rm -f "$out"
}

json() { printf '%s' "$BODY" | jq -r "$1" 2>/dev/null; }

# --------------------------------------------------- data backup / restore ---

mkdir -p "$BACKUP_DIR"
cp "$DATA_DIR/services.json" "$DATA_DIR/bookings.json" "$BACKUP_DIR/"
restore_data() {
  cp "$BACKUP_DIR/services.json" "$DATA_DIR/services.json"
  cp "$BACKUP_DIR/bookings.json" "$DATA_DIR/bookings.json"
  rm -rf "$BACKUP_DIR"
}
trap restore_data EXIT

# ---------------------------------------------------------------- setup ---

PORT="$(env_value PORT)"
PORT="${PORT:-3000}"
BASE_URL="http://localhost:${PORT}/api/v1"

if ! http --ignore-stdin -p h GET "http://localhost:${PORT}/health" >/dev/null 2>&1; then
  echo "Server not reachable on port ${PORT}. Start it first with: npm start" >&2
  exit 2
fi

# ----------------------------------------------------------------- tests ---

section "Health endpoints"
req GET "http://localhost:${PORT}/health"
check "GET /health returns 200" "200" "$STATUS"
check "GET /health reports ok" "ok" "$(json '.status')"

req GET "http://localhost:${PORT}/info"
check "GET /info returns 200" "200" "$STATUS"

section "Services: list and get by id"
req GET "${BASE_URL}/services"
check "GET /services returns 200" "200" "$STATUS"
check "GET /services payload is an array" "array" "$(json '.payload | type')"

req GET "${BASE_URL}/services/1"
check "GET /services/1 returns 200" "200" "$STATUS"
check "GET /services/1 payload id is 1" "1" "$(json '.payload.id')"

section "Services: create / update / delete lifecycle"
CREATE_BODY='{"name":"Test service","description":"created by test_happy.sh","duration":45,"price":1234.5,"category":"Testing","available":true}'
req POST "${BASE_URL}/services" "$CREATE_BODY"
check "POST /services returns 201" "201" "$STATUS"
SERVICE_ID="$(json '.payload.id')"
if [[ "$SERVICE_ID" =~ ^[0-9]+$ ]]; then pass "POST /services returns the created id (${SERVICE_ID})"; else fail "POST /services returns the created id" "numeric id" "$SERVICE_ID"; fi

req PUT "${BASE_URL}/services/${SERVICE_ID}" '{"name":"Test service updated"}'
check "PUT /services/:id returns 204" "204" "$STATUS"

req GET "${BASE_URL}/services/${SERVICE_ID}"
check "GET after PUT shows the updated name" "Test service updated" "$(json '.payload.name')"

req DELETE "${BASE_URL}/services/${SERVICE_ID}"
check "DELETE /services/:id returns 200" "200" "$STATUS" # expected to FAIL: bug #1 in bugs.md

req GET "${BASE_URL}/services/${SERVICE_ID}"
check "GET after DELETE returns 404" "404" "$STATUS" # expected to FAIL: consequence of bug #1

section "Bookings: list, get, create, add service"
req GET "${BASE_URL}/bookings"
check "GET /bookings returns 200" "200" "$STATUS"
check "GET /bookings payload is an array" "array" "$(json '.payload | type')"

req GET "${BASE_URL}/bookings/1"
check "GET /bookings/1 returns 200" "200" "$STATUS"
check "GET /bookings/1 payload id is 1" "1" "$(json '.payload.id')"

BOOKING_BODY='{"clientName":"Test User","clientEmail":"test@example.com","date":"01-12-2026","time":"1000"}'
req POST "${BASE_URL}/bookings" "$BOOKING_BODY"
check "POST /bookings returns 200" "200" "$STATUS"
check "POST /bookings returns the created booking id" "number" "$(json '.payload.id | type')" # expected to FAIL: bug #3 in bugs.md

req POST "${BASE_URL}/bookings/1/services/3" '{}'
check "POST /bookings/1/services/3 returns 200" "200" "$STATUS"
check "Service 3 is attached to booking 1" "3" "$(json '.payload.services[] | select(.service == 3) | .service')"

# --------------------------------------------------------------- summary ---

printf '\n==============================\n'
printf 'Happy path results: %d passed, %d failed\n' "$PASS" "$FAIL"
printf '==============================\n'
[[ "$FAIL" -eq 0 ]]
