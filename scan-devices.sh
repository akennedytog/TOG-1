#!/bin/bash
# Scan unknown devices to identify them

echo "🔍 Scanning unknown smart devices..."
echo "================================"
echo ""

# Device IPs to scan
DEVICES=(
  "192.168.4.23"
  "192.168.4.61"
  "192.168.4.210"
  "192.168.4.223"
  "192.168.4.224"
)

for ip in "${DEVICES[@]}"; do
  echo "Scanning $ip..."
  
  # Check common smart home ports
  for port in 80 443 8080 8888 8008 8009 6466 1400 13000; do
    (timeout 1 bash -c "echo >/dev/tcp/$ip/$port" 2>/dev/null && echo "  ✓ Port $port open") &
  done
  wait
  
  echo ""
done

echo ""
echo "Device Identification Guide:"
echo "  Port 80/443    - Web interface (cameras, routers, smart devices)"
echo "  Port 8080      - Many smart TVs, hubs"
echo "  Port 8008/8009 - Google Cast/Chromecast"
echo "  Port 1400      - Sonos (already found)"
echo "  Port 6466      - Ring devices"
echo "  Port 13000     - Yale/August locks"