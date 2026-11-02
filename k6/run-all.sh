#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:5000}"
RESULTS_DIR="k6/results"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
RUN_DIR="${RESULTS_DIR}/${TIMESTAMP}"
SUMMARY="${RUN_DIR}/summary.txt"

mkdir -p "${RUN_DIR}"

GREEN="\033[0;32m"
RED="\033[0;31m"
YELLOW="\033[1;33m"
NC="\033[0m"

PASS=0
FAIL=0
SKIP=0

log()  { echo -e "${NC}[k6] $*"; }
ok()   { echo -e "${GREEN}[PASS]${NC} $*"; PASS=$((PASS + 1)); }
fail() { echo -e "${RED}[FAIL]${NC} $*"; FAIL=$((FAIL + 1)); }
warn() { echo -e "${YELLOW}[SKIP]${NC} $*"; SKIP=$((SKIP + 1)); }

record() {
  local name="$1"
  local exit_code="$2"
  local report="$3"
  if [ "$exit_code" -eq 0 ]; then
    ok "$name"
    echo "PASS  $name  $report" >> "$SUMMARY"
  else
    fail "$name"
    echo "FAIL  $name  $report" >> "$SUMMARY"
  fi
}

run_scenario() {
  local name="$1"
  local file="$2"
  shift 2
  local extra_args=("$@")

  log "Running: ${name}"
  local report="${RUN_DIR}/${name}.json"

  set +e
  k6 run \
    --env BASE_URL="${BASE_URL}" \
    --env CUSTOMER_EMAIL="${CUSTOMER_EMAIL:-loadtest.customer@example.com}" \
    --env CUSTOMER_PASSWORD="${CUSTOMER_PASSWORD:-LoadTest@123}" \
    --env DEALER_EMAIL="${DEALER_EMAIL:-loadtest.dealer@example.com}" \
    --env DEALER_PASSWORD="${DEALER_PASSWORD:-LoadTest@123}" \
    --env ADMIN_EMAIL="${ADMIN_EMAIL:-admin@example.com}" \
    --env ADMIN_PASSWORD="${ADMIN_PASSWORD:-Admin@123}" \
    --summary-export="${report}" \
    --out "json=${RUN_DIR}/${name}_metrics.json" \
    "${extra_args[@]}" \
    "$file"
  local exit_code=$?
  set -e

  record "$name" "$exit_code" "$report"
  echo ""
}

check_k6() {
  if ! command -v k6 &>/dev/null; then
    echo -e "${RED}k6 is not installed.${NC}"
    echo "Install it from https://k6.io/docs/get-started/installation/"
    echo ""
    echo "  Linux (Debian/Ubuntu):"
    echo "    sudo gpg -k"
    echo "    sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69"
    echo "    echo 'deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main' | sudo tee /etc/apt/sources.list.d/k6.list"
    echo "    sudo apt-get update && sudo apt-get install k6"
    echo ""
    echo "  macOS: brew install k6"
    exit 1
  fi
}

check_server() {
  log "Checking server at ${BASE_URL}/health ..."
  local status
  status=$(curl -sf -o /dev/null -w "%{http_code}" "${BASE_URL}/health" || echo "000")
  if [ "$status" != "200" ]; then
    echo -e "${RED}Server is not reachable at ${BASE_URL} (got HTTP ${status}).${NC}"
    echo "Start the server before running load tests."
    exit 1
  fi
  log "Server is up."
  echo ""
}

print_header() {
  echo ""
  echo "========================================"
  echo "  k6 Load Test Suite — Used Car App"
  echo "  Target:    ${BASE_URL}"
  echo "  Timestamp: ${TIMESTAMP}"
  echo "  Results:   ${RUN_DIR}"
  echo "========================================"
  echo ""
}

print_footer() {
  local total=$((PASS + FAIL + SKIP))
  echo ""
  echo "========================================"
  echo "  Results Summary"
  echo "----------------------------------------"
  echo -e "  ${GREEN}PASSED${NC}: ${PASS}"
  echo -e "  ${RED}FAILED${NC}: ${FAIL}"
  echo -e "  ${YELLOW}SKIPPED${NC}: ${SKIP}"
  echo "  TOTAL:  ${total}"
  echo "========================================"
  echo ""
  echo "Full reports saved to: ${RUN_DIR}"
  echo ""

  cat >> "$SUMMARY" <<EOF

========================================
Total: ${total}  Passed: ${PASS}  Failed: ${FAIL}  Skipped: ${SKIP}
Run dir: ${RUN_DIR}
EOF

  if [ "$FAIL" -gt 0 ]; then
    exit 1
  fi
}

check_k6
check_server
print_header

{
  echo "k6 Load Test Summary — ${TIMESTAMP}"
  echo "Target: ${BASE_URL}"
  echo ""
} > "$SUMMARY"

SCENARIO="${SCENARIO:-all}"

case "$SCENARIO" in
  smoke)
    run_scenario "smoke" "k6/scenarios/smoke.test.js"
    ;;
  auth)
    run_scenario "auth" "k6/scenarios/auth.test.js"
    ;;
  public)
    run_scenario "public" "k6/scenarios/public.test.js"
    ;;
  cars)
    run_scenario "cars" "k6/scenarios/cars.test.js"
    ;;
  authenticated)
    run_scenario "authenticated" "k6/scenarios/authenticated.test.js"
    ;;
  stress)
    run_scenario "stress" "k6/scenarios/stress.test.js" --env SCENARIO=stress
    ;;
  spike)
    run_scenario "spike" "k6/scenarios/stress.test.js" --env SCENARIO=spike
    ;;
  soak)
    run_scenario "soak" "k6/scenarios/stress.test.js" --env SCENARIO=soak
    ;;
  all)
    run_scenario "01_smoke"         "k6/scenarios/smoke.test.js"
    run_scenario "02_public"        "k6/scenarios/public.test.js"
    run_scenario "03_auth"          "k6/scenarios/auth.test.js"
    run_scenario "04_cars"          "k6/scenarios/cars.test.js"
    run_scenario "05_authenticated" "k6/scenarios/authenticated.test.js"
    run_scenario "06_stress"        "k6/scenarios/stress.test.js" --env SCENARIO=stress
    ;;
  *)
    echo "Unknown scenario: ${SCENARIO}"
    echo "Valid values: smoke | auth | public | cars | authenticated | stress | spike | soak | all"
    exit 1
    ;;
esac

print_footer
