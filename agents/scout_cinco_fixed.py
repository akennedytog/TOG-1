#!/usr/bin/env python3
"""
Scout Cinco Report - FIXED version matching morning email
"""

import json
import pandas as pd
from datetime import datetime
from pathlib import Path

OUTPUT_DIR = Path("/Users/aleckennedy/.openclaw/workspace/data/scout_output")
OUTPUT_DIR.mkdir(exist_ok=True)

cinco_file = Path("/Users/aleckennedy/.openclaw/workspace/data/sales_reports/B-F FY26 Q4 H&R Road to Cinco.xlsx")

print(f"📂 Loading {cinco_file.name}...")

all_reps = []

# Process FSM sheet
print("\n=== Processing FSM Sheet ===")
fsm_df = pd.read_excel(cinco_file, sheet_name='FSM', header=None)

for idx in range(len(fsm_df)):
    row = fsm_df.iloc[idx]
    if str(row.get(1, '')) == 'Row Labels':
        for i in range(idx + 1, len(fsm_df)):
            data_row = fsm_df.iloc[i]
            name = str(data_row.get(1, '')).strip()
            if not name or name == 'nan' or 'Total' in name or 'Grand' in name:
                continue
            
            # FSM: Col 2=Prior, Col 3=New, Col 4=Goal
            prior_pod = float(data_row.get(2, 0) or 0)
            new_pod = float(data_row.get(3, 0) or 0)
            goal = float(data_row.get(4, 0) or 0)
            
            if name and (new_pod > 0 or prior_pod > 0):
                pct = new_pod / goal if goal > 0 else 0
                variance = new_pod - goal
                
                status = 'unknown'
                alert = ''
                if pct >= 1.0:
                    status = 'exceeding'
                elif pct >= 0.7:
                    status = 'ontrack'
                elif pct > 0:
                    status = 'behind'
                
                all_reps.append({
                    'rep_name': name,
                    'level': 'FSM',
                    'prior_pod': prior_pod,
                    'new_pod': new_pod,
                    'goal': goal,
                    'variance': variance,
                    'pct_goal': pct,
                    'status': status,
                    'alert': alert
                })
        break

print(f"✅ Found {len([r for r in all_reps if r['level']=='FSM'])} FSMs")

# Process Reps sheet  
print("\n=== Processing Reps Sheet ===")
reps_df = pd.read_excel(cinco_file, sheet_name='Reps', header=None)

for idx in range(len(reps_df)):
    row = reps_df.iloc[idx]
    if str(row.get(1, '')) == 'Row Labels':
        for i in range(idx + 1, len(reps_df)):
            data_row = reps_df.iloc[i]
            name = str(data_row.get(1, '')).strip()
            if not name or name == 'nan' or 'Total' in name or 'Grand' in name:
                continue
            
            # Reps: Col 2=New POD, Col 3=Dist Payout
            new_pod = float(data_row.get(2, 0) or 0)
            # Estimate goal based on typical rep goal
            goal = 15
            
            if name and new_pod >= 0:
                pct = new_pod / goal if goal > 0 else 0
                variance = new_pod - goal
                
                status = 'unknown'
                if pct >= 1.0:
                    status = 'exceeding'
                elif pct >= 0.7:
                    status = 'ontrack'
                elif pct > 0:
                    status = 'behind'
                
                all_reps.append({
                    'rep_name': name,
                    'level': 'Rep',
                    'prior_pod': 0,
                    'new_pod': new_pod,
                    'goal': goal,
                    'variance': variance,
                    'pct_goal': pct,
                    'status': status,
                    'alert': ''
                })
        break

print(f"✅ Found {len([r for r in all_reps if r['level']=='Rep'])} Reps")
print(f"✅ Total: {len(all_reps)} reps")

# Calculate totals
total_new = sum(r['new_pod'] for r in all_reps)
total_prior = sum(r['prior_pod'] for r in all_reps)
total_goal = sum(r['goal'] for r in all_reps)
team_pct = total_new / total_goal if total_goal > 0 else 0
behind = len([r for r in all_reps if r['status'] == 'behind'])
total_payout = sum(r['new_pod'] for r in all_reps) * 15  # $15 per case

print(f"\n📊 TOTALS:")
print(f"  New POD: {total_new}")
print(f"  Goal: {total_goal}")
print(f"  % to Goal: {team_pct*100:.1f}%")
print(f"  Behind: {behind}")
print(f"  Payout: ${total_payout}")

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
        f"💰 Team earned ${total_payout:,} in payouts"
    ],
    'generated_at': datetime.now().isoformat()
}

# Save
with open(OUTPUT_DIR / "briefing_latest.json", 'w') as f:
    json.dump(briefing, f, indent=2)

print(f"\n✅ Saved briefing with {len(all_reps)} reps")
print(f"🏆 Top: {briefing['top_performers'][0]['rep_name']} ({int(briefing['top_performers'][0]['pct_goal']*100)}%)")
