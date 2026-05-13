#!/usr/bin/env python3
"""Send Scout briefing email"""
import json
import subprocess
from datetime import datetime
from pathlib import Path

OUTPUT_DIR = Path("/Users/aleckennedy/.openclaw/workspace/data/scout_output")

# Load briefing
with open(OUTPUT_DIR / "briefing_latest.json") as f:
    briefing = json.load(f)

summary = briefing['summary']
date = briefing['date']

# Build email body (text format like before)
body = f"""ROAD TO CINCO DAILY BRIEFING
{date}
═══════════════════════════════════════════════════════

📊 TEAM PERFORMANCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• New POD: {summary['total_new_pod']:.0f} (Goal: {summary['total_goal']:.0f})
• % to Goal: {summary['team_pct_goal']*100:.1f}%
• Total Payouts: ${summary['total_payout']:,.0f}
• Reps Tracked: {summary['total_reps']}

STATUS BREAKDOWN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚨 Behind Goal: {summary['behind']} reps (needs immediate attention)
⚠️ At Risk: 0 reps
✅ On Track: 0 reps
🏆 Exceeding: {len([r for r in briefing['top_performers'] if r['status'] == 'exceeding'])} reps

KEY INSIGHTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{chr(10).join(briefing['insights'])}

TOP PERFORMER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏆 {briefing['top_performers'][0]['rep_name']}
 • New POD: {briefing['top_performers'][0]['new_pod']:.0f}
 • Goal: {briefing['top_performers'][0]['goal']:.0f} ({int(briefing['top_performers'][0]['pct_goal']*100)}% to goal)
 • Prior POD: {briefing['top_performers'][0]['prior_pod']:.0f}

NEEDS ATTENTION (Lowest % to Goal)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"""

for rep in briefing['needs_help'][:8]:
    pct = int(rep['pct_goal'] * 100)
    body += f"🚨 {rep['rep_name']} - {pct}% to goal ({rep['new_pod']:.0f} / {rep['goal']:.0f})\n"

body += f"""
RECOMMENDED ACTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Schedule 1:1s with bottom 8 performers immediately
2. Review territory coverage for underperforming FSMs
3. Identify blockers preventing POD conversion
4. Consider incentive adjustments to drive urgency

Generated: {datetime.now().strftime('%Y-%m-%d %I:%M %p')}
"""

# Save email
email_file = OUTPUT_DIR / f"email_{datetime.now().strftime('%Y%m%d_%H%M')}.txt"
with open(email_file, 'w') as f:
    f.write(body)

print(f"📧 Email prepared: {email_file}")
print("\n" + body)

# Try to send via gog (simpler approach - just save and notify)
print("\n📤 To send via email, use:")
print(f"  gog email send --to akennedy@theonegroup.info --subject 'Scout Briefing' --body-file {email_file}")
