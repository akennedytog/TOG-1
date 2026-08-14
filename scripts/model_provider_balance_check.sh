#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CONFIG="$ROOT_DIR/routing-config.json"
ENV_FILE="${OPENCLAW_ENV_FILE:-/Users/aleckennedy/.openclaw/.env}"

if [[ -f "$ENV_FILE" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
fi

if ! command -v jq >/dev/null 2>&1; then
  echo "jq is required for model_provider_balance_check.sh" >&2
  exit 1
fi

if ! command -v curl >/dev/null 2>&1; then
  echo "curl is required for model_provider_balance_check.sh" >&2
  exit 1
fi

jq empty "$CONFIG" >/dev/null

threshold="$(jq -r '.health_checks.balance_alerts.openrouter_min_remaining_credits_usd // 2' "$CONFIG")"

echo "Model provider balance check"
echo "Time: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"

overall=0
if [[ -z "${OPENROUTER_API_KEY:-}" ]]; then
  echo "FAIL  openrouter  OPENROUTER_API_KEY missing"
  exit 1
fi

response="$(
  curl -sS --max-time 20 https://openrouter.ai/api/v1/credits \
    -H "Authorization: Bearer $OPENROUTER_API_KEY" \
    2>&1
)" || {
  echo "FAIL  openrouter  credits request error"
  exit 1
}

if jq -e '.error' >/dev/null 2>&1 <<<"$response"; then
  message="$(jq -r '.error.message // .error // "unknown error"' <<<"$response")"
  echo "FAIL  openrouter  $message"
  exit 1
fi

total="$(jq -r '.data.total_credits // 0' <<<"$response")"
usage="$(jq -r '.data.total_usage // 0' <<<"$response")"
remaining="$(jq -n --argjson total "$total" --argjson usage "$usage" '$total - $usage')"

if jq -e --argjson remaining "$remaining" --argjson threshold "$threshold" '$remaining < $threshold' >/dev/null; then
  printf 'WARN  openrouter  remaining=$%.4f threshold=$%.2f\n' "$remaining" "$threshold"
  overall=1
else
  printf 'PASS  openrouter  remaining=$%.4f threshold=$%.2f\n' "$remaining" "$threshold"
fi

echo "INFO  openai  balance endpoint unavailable; smoke checks cover direct OpenAI backup"
exit "$overall"
