#!/bin/bash
# Install multiple OpenClaw skills

echo "Installing skills..."
echo ""

SKILLS=(
  "perplexity"
  "tavily"
  "firecrawl"
  "browser-tools"
  "quickcharts"
  "yfinance"
  "notion"
  "obsidian"
  "todoist"
  "docker"
  "stripe"
  "ahrefs"
)

for skill in "${SKILLS[@]}"; do
  echo "Installing: $skill"
  npx clawhub install "$skill" --force 2>/dev/null || echo "  ✗ Failed or not found"
  echo ""
done

echo "Installation complete!"