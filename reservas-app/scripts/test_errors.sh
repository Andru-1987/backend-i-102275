#!/usr/bin/env bash
# Error-case API tests for reservas-app (4xx responses, validation, edge cases).
# Usage: bash scripts/test_errors.sh   (the server must be running: npm start)
# Requires: httpie, jq
#
# Here a 4xx is the EXPECTED outcome, so we never use `set -e` or httpie's
# --check-status: every request is captured and asserted explicitly.

set -uo pipefail

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

section "Not found resources"
req GET "${BASE_URL}/services/99999"
check "GET /services/99999 returns 404" "404" "$STATUS"
check "GET /services/99999 reports error status" "error" "$(json '.status')"

req GET "${BASE_URL}/bookings/99999"
check "GET /bookings/99999 returns 404" "404" "$STATUS"
check "GET /bookings/99999 reports error status" "error" "$(json '.status')"

section "Service validation (POST /services)"
req POST "${BASE_URL}/services" '{}'
check "POST /services with empty body returns 422" "422" "$STATUS"
check "POST /services error message mentions the missing field" "name" "$(json '.message' | sed -n 's/.*El campo \([a-zA-Z]*\).*/\1/p')"

req POST "${BASE_URL}/services" '{"name":"Incomplete","description":"missing price","duration":30,"category":"Testing","available":true}'
check "POST /services without price returns 422" "422" "$STATUS"

req POST "${BASE_URL}/services" '{"name":"Bad type","description":"available is not boolean","duration":30,"price":100,"category":"Testing","available":"yes"}'
check "POST /services with non-boolean available returns 422" "422" "$STATUS"

req PUT "${BASE_URL}/services/1" '{}'
check "PUT /services/1 with empty body returns 422" "422" "$STATUS"

section "Known bugs surfaced as failing tests"
# Expected to FAIL while bug #1 in bugs.md is open: the controller reads
# request.params.sid but the route defines /:id, so DELETE always 404s.
req DELETE "${BASE_URL}/services/1"
check "DELETE /services/1 with a valid id returns 200" "200" "$STATUS" # expected to FAIL: bug #1

# Expected to FAIL while bug #2 in bugs.md is open: `throw ValidationError(...)`
# without `new` raises a TypeError, so the response is 500 instead of 422.
req POST "${BASE_URL}/bookings" '{"clientName":""}'
check "POST /bookings with invalid fields returns 422" "422" "$STATUS" # expected to FAIL: bug #2

# Expected to FAIL while bug #4 in bugs.md is open: the global error handler
# ignores body-parser's statusCode and answers 500 for malformed JSON.
req POST "${BASE_URL}/services" '{invalid json'
check "POST /services with malformed JSON returns 400" "400" "$STATUS" # expected to FAIL: bug #4

# --------------------------------------------------------------- summary ---

printf '\n==============================\n'
printf 'Error-case results: %d passed, %d failed\n' "$PASS" "$FAIL"
printf '==============================\n'
[[ "$FAIL" -eq 0 ]]
