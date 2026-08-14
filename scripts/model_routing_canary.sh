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
  echo "jq is required for model_routing_canary.sh" >&2
  exit 1
fi

if ! command -v openclaw >/dev/null 2>&1; then
  echo "openclaw CLI not found" >&2
  exit 1
fi

jq empty "$CONFIG" >/dev/null

echo "Model routing canary"
echo "Time: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"

overall=0
while IFS= read -r model; do
  [[ -z "$model" ]] && continue
  start="$(date +%s)"
  if output="$(openclaw infer model run --local --model "$model" --prompt "Reply exactly OK" --json 2>/dev/null)"; then
    elapsed="$(( $(date +%s) - start ))"
    if jq -e '.ok == true and ((.outputs[0].text // "") | test("OK"))' >/dev/null 2>&1 <<<"$output"; then
      echo "PASS  $model  ${elapsed}s"
    else
      echo "WARN  $model  ${elapsed}s  unexpected output"
      overall=1
    fi
  else
    echo "FAIL  $model  run error"
    overall=1
  fi
done < <(jq -r '.health_checks.canary_models[]?' "$CONFIG")

exit "$overall"
