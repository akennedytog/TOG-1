#!/usr/bin/env python3
"""
Scout Cinco Report - Process Road to Cinco Excel
Handles multi-table structure
"""

import json
import pandas as pd
from datetime import datetime
from pathlib import Path

OUTPUT_DIR = Path("/Users/aleckennedy/.openclaw/workspace/data/scout_output")
OUTPUT_DIR.mkdir(exist_ok=True)

cinco_file = Path("/Users/aleckennedy/.openclaw/workspace/data/sales_reports/B-F FY26 Q4 H&R Road to Cinco.xlsx")

print(f"📂 Loading {cinco_file.name}...")

# Process FSM sheet only (per user request)
print("\n=== Processing FSM Sheet ===")
fsm_df = pd.read_excel(cinco_file, sheet_name='FSM', header=None)

# Find data section (look for "Row Labels" in row 2)
fsm_reps = []
for idx in range(len(fsm_df)):
    row = fsm_df.iloc[idx]
    if str(row.get(1, '')) == 'Row Labels':
        # Found header row, process data after this
        for i in range(idx + 1, len(fsm_df)):
            data_row = fsm_df.iloc[i]
            name = str(data_row.get(1, '')).strip()
            if not name or name == 'nan' or 'Total' in name or 'Grand' in name:
                continue
            
            prior_pod = float(data_row.get(2, 0) or 0)
            new_pod = float(data_row.get(3, 0) or 0)
            goal = float(data_row.get(4, 0) or 0)
            
            if name and new_pod >= 0:
                pct = new_pod / goal if goal > 0 else 0
                variance = new_pod - goal
                
                status = 'unknown'
                alert = ''
                if pct >= 1.0:
                    status = 'exceeding'
                    alert = f"Exceeding goal ({int(pct*100)}%)"
                elif pct >= 0.7:
                    status = 'ontrack'
                    alert = f"On track ({int(pct*100)}%)"
                elif pct > 0:
                    status = 'behind'
                    alert = f"Behind goal ({int(pct*100)}%)"
                
                fsm_reps.append({
                    'rep_name': name,
                    'level': 'FSM',
                    'prior_pod': prior_pod,
                    'new_pod': new_pod,
                    'goal': goal,
                    'variance': variance,
                    'pct_goal': pct,
                    'status': status,
                    'alert': alert,
                    'priority_score': int((1 - min(pct, 1)) * 100 + prior_pod * 0.01)
                })
        break

print(f"✅ Found {len(fsm_reps)} FSMs")

# Skip Reps sheet
rep_reps = []
print("\n=== Skipping Reps Sheet (focusing on FSMs only) ===")

# Combine (only FSMs)
all_reps = fsm_reps

# Calculate totals
total_new = sum(r['new_pod'] for r in all_reps)
total_prior = sum(r['prior_pod'] for r in all_reps)
total_goal = sum(r['goal'] for r in all_reps)
team_pct = total_new / total_goal if total_goal > 0 else 0
behind = len([r for r in all_reps if r['status'] == 'behind'])
total_payout = sum(r.get('total_payout', r['new_pod'] * 15) for r in all_reps)

# Create briefing
briefing = {
    'date': datetime.now().strftime('%A, %B %d, %Y'),
    'program': 'Road to Cinco - B-F FY26 Q4 H&R',
    'summary': {
        'total_reps': len(all_reps),
        'total_new_pod': total_new,
        'total_prior_pod': total_prior,
        'total_goal': total_goal,
        'team_pct_goal': team_pct,
        'behind': behind,
        'total_payout': total_payout
    },
    'top_performers': sorted(all_reps, key=lambda x: x['pct_goal'], reverse=True)[:10],
    'needs_help': sorted(all_reps, key=lambda x: x['pct_goal'])[:10],
    'insights': [
        f"🚨 Team at {int(team_pct*100)}% of goal - {'urgent action needed' if team_pct < 0.8 else 'making progress'}",
        f"❗ {behind} reps behind - need coaching",
        f"💰 Team earned ${total_payout:,.0f} in payouts"
    ],
    'generated_at': datetime.now().isoformat()
}

# Save
with open(OUTPUT_DIR / "briefing_latest.json", 'w') as f:
    json.dump(briefing, f, indent=2)

with open(OUTPUT_DIR / f"briefing_{datetime.now().strftime('%Y-%m-%d')}.json", 'w') as f:
    json.dump(briefing, f, indent=2)

# Print summary
print(f"\n📊 SUMMARY:")
print(f"  Total Reps: {len(all_reps)}")
print(f"  FSMs: {len(fsm_reps)}")
print(f"  Reps: {len(rep_reps)}")
print(f"  New POD: {total_new}")
print(f"  Goal: {total_goal}")
print(f"  % to Goal: {int(team_pct*100)}%")
print(f"  Behind: {behind}")
print(f"  Total Payout: ${total_payout:,.0f}")

if all_reps:
    print(f"\n🏆 Top: {briefing['top_performers'][0]['rep_name']} ({int(briefing['top_performers'][0]['pct_goal']*100)}%)")
    print(f"🚨 Needs Help: {briefing['needs_help'][0]['rep_name']} ({int(briefing['needs_help'][0]['pct_goal']*100)}%)")

print("\n✅ Done! Dashboard will auto-load this data.")
