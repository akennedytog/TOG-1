#!/bin/bash
# openclaw-research.sh - Uses OpenClaw's native summarize via sessions_spawn
# This leverages your existing OpenAI config without exposing keys

INPUT="$1"
MODE="${2:-standard}"
OUTPUT_DIR="${HOME}/.openclaw/workspace/research"

mkdir -p "$OUTPUT_DIR"

if [[ -z "$INPUT" ]]; then
    echo "Usage: openclaw-research <url> [mode]"
    echo "Modes: standard, competitor, content"
    exit 1
fi

echo "🔍 OpenClaw Research Mode"
echo "📄 Input: $INPUT"
echo "📊 Mode: $MODE"
echo ""

# Create timestamped output file
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
SAFE_INPUT=$(echo "$INPUT" | tr -cd '[:alnum:]._-' | head -20)
OUTPUT="$OUTPUT_DIR/${MODE}_${SAFE_INPUT}_${TIMESTAMP}.md"

# Use OpenClaw's native web_fetch + agent to summarize
# This uses your configured OpenAI credentials securely
cat > /tmp/research_task.txt << EOF
Research task: Summarize the content at $INPUT

Instructions:
1. Fetch the content from the URL
2. Provide a detailed summary (300-500 words)
3. If in competitor mode, analyze:
   - What they do well
   - Potential gaps/opportunities
   - AI automation opportunities
4. If in content mode, suggest:
   - Twitter thread angles
   - Key takeaways
   - Related content ideas

Output format: Markdown with headers
EOF

echo "🤖 Delegating to OpenClaw agent..."
echo ""

# The actual summarization happens via OpenClaw's secure pipeline
# Your API key stays protected in OpenClaw's credential store
openclaw sessions_spawn --task "Summarize $INPUT and save insights to $OUTPUT" --mode run

echo ""
echo "✅ Research initiated"
echo "💾 Results will be saved to: $OUTPUT"
