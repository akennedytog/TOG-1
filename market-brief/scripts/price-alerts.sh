#!/bin/bash
# Price Alert Monitor
# Checks if prices hit support/resistance levels

TICKERS=("ASTS" "TE")
ALERT_CONFIG="$HOME/.openclaw/workspace/market-brief/config/price-alerts.json"
ALERTS_FILE="$HOME/.openclaw/workspace/market-brief/output/price-alerts.json"
TIMESTAMP=$(date +"%Y-%m-%d %H:%M")

mkdir -p "$HOME/.openclaw/workspace/market-brief/config"

# Initialize alert config if not exists
if [ ! -f "$ALERT_CONFIG" ]; then
  cat > "$ALERT_CONFIG" << 'EOF'
{
  "ASTS": {
    "resistance": [30.00, 32.00, 35.00],
    "support": [26.00, 24.00, 22.00],
    "current_price": 28.50,
    "last_alert": null
  },
  "TE": {
    "resistance": [9.00, 9.45, 10.00],
    "support": [8.20, 8.00, 7.50],
    "current_price": 8.50,
    "last_alert": null
  }
}
EOF
fi

echo "🔔 Price Alert Monitor - $TIMESTAMP"
echo "=================================="

# Simulated current prices (in production, fetch from API)
ASTS_PRICE=28.85
TE_PRICE=8.35

ALERTS=()

# Check ASTS
if (( $(echo "$ASTS_PRICE >= 30.00" | bc -l) )); then
  ALERTS+=("{\"symbol\":\"ASTS\",\"price\":$ASTS_PRICE,\"level\":\"resistance\",\"message\":\"BREAKOUT: ASTS hit \$30 resistance with momentum\",\"timestamp\":\"$TIMESTAMP\"}")
elif (( $(echo "$ASTS_PRICE <= 26.00" | bc -l) )); then
  ALERTS+=("{\"symbol\":\"ASTS\",\"price\":$ASTS_PRICE,\"level\":\"support\",\"message\":\"ALERT: ASTS broke \$26 support. Consider stop loss.\",\"timestamp\":\"$TIMESTAMP\"}")
fi

# Check TE
if (( $(echo "$TE_PRICE >= 9.45" | bc -l) )); then
  ALERTS+=("{\"symbol\":\"TE\",\"price\":$TE_PRICE,\"level\":\"resistance\",\"message\":\"TE approaching \$9.45 resistance pre-earnings\",\"timestamp\":\"$TIMESTAMP\"}")
elif (( $(echo "$TE_PRICE <= 8.20" | bc -l) )); then
  ALERTS+=("{\"symbol\":\"TE\",\"price\":$TE_PRICE,\"level\":\"support\",\"message\":\"TE testing \$8.20 support level\",\"timestamp\":\"$TIMESTAMP\"}")
fi

# Save alerts
if [ ${#ALERTS[@]} -gt 0 ]; then
  echo "[{ $(IFS=,; echo "${ALERTS[*]}") }]" > "$ALERTS_FILE"
  echo ""
  echo "🚨 PRICE ALERTS:"
  for alert in "${ALERTS[@]}"; do
    echo "  • $(echo $alert | grep -o '"message":"[^"]*' | cut -d'"' -f4)"
  done
  
  # Send notification (if notify-send available)
  if command -v notify-send &> /dev/null; then
    notify-send "📈 Market Alert" "Price levels triggered!"
  fi
else
  echo "[]" > "$ALERTS_FILE"
  echo "✅ No price alerts triggered"
  echo ""
  echo "Current levels:"
  echo "  ASTS: \$28.85 | Resistance: \$30 | Support: \$26"
  echo "  TE: \$8.35 | Resistance: \$9.45 | Support: \$8.20"
fi

echo ""
echo "📄 Alerts: $ALERTS_FILE"