#!/bin/bash
# The One Group - Compliance Content Generation
# Generates HIPAA/GDPR/SOC2 content for all industries

WORKSPACE="$HOME/.openclaw/workspace"
LOG_FILE="$WORKSPACE/logs/compliance-content.log"

mkdir -p "$WORKSPACE/logs"
mkdir -p "$WORKSPACE/compliance-content/generated"

echo "=== Generating Compliance Content ===" | tee -a "$LOG_FILE"
echo "Started at $(date)" | tee -a "$LOG_FILE"

cd "$WORKSPACE/compliance-content"

# Generate for all industries
python3 compliance_generator.py all 2>&1 | tee -a "$LOG_FILE"

# Create markdown summaries for easy review
for json_file in generated/*.json; do
    if [ -f "$json_file" ]; then
        industry=$(basename "$json_file" | cut -d'_' -f1)
        md_file="generated/${industry}_summary_$(date +%Y%m%d).md"
        
        echo "# $industry Compliance Content" > "$md_file"
        echo "" >> "$md_file"
        echo "Generated: $(date)" >> "$md_file"
        echo "" >> "$md_file"
        
        # Extract key sections from JSON
        python3 -c "
import json
with open('$json_file') as f:
    data = json.load(f)
    print(f'## Regulation: {data[\"regulation\"]}')
    print()
    print('### Twitter Thread Preview:')
    print(data['content']['twitter_thread'][:500] + '...')
    print()
    print('### LinkedIn Article Preview:')
    print(data['content']['linkedin_article'][:500] + '...')
" >> "$md_file" 2>/dev/null
        
        echo "Created: $md_file" | tee -a "$LOG_FILE"
    fi
done

echo "" | tee -a "$LOG_FILE"
echo "Done at $(date)" | tee -a "$LOG_FILE"
echo "Output: $WORKSPACE/compliance-content/generated/" | tee -a "$LOG_FILE"
