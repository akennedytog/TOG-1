#!/usr/bin/env python3
"""
Scout v3.1 - Optimized Brown Forman Sales Performance Intelligence
Uses caching and efficient Excel parsing
"""

import pandas as pd
from datetime import datetime
from pathlib import Path
import json
import hashlib
import os
import time

# Configuration
DATA_DIR = Path('/Users/aleckennedy/.openclaw/workspace/data')
OUTPUT_DIR = DATA_DIR / 'scout_output'
CACHE_DIR = DATA_DIR / '.scout_cache'
EXCEL_FILE = DATA_DIR / 'sales_reports/B-F FY26 Q4 H&R Road to Cinco.xlsx'

def get_file_hash(filepath):
    """Get MD5 hash of file for cache invalidation"""
    if not filepath.exists():
        return None
    return hashlib.md5(filepath.read_bytes()).hexdigest()

def load_cached_or_parse(filepath, parser_func, cache_key):
    """Load from cache if file hasn't changed"""
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    cache_file = CACHE_DIR / f"{cache_key}.json"
    hash_file = CACHE_DIR / f"{cache_key}.hash"
    
    current_hash = get_file_hash(filepath)
    
    # Check if cache is valid
    if cache_file.exists() and hash_file.exists():
        cached_hash = hash_file.read_text().strip()
        if cached_hash == current_hash:
            print(f"📦 Using cached {cache_key} (file unchanged)")
            return json.loads(cache_file.read_text())
    
    # Parse fresh data
    print(f"📊 Parsing {cache_key} from Excel...")
    start = time.time()
    data = parser_func(filepath)
    elapsed = time.time() - start
    print(f"✅ Parsed in {elapsed:.1f}s")
    
    # Save cache
    cache_file.write_text(json.dumps(data, default=str))
    hash_file.write_text(current_hash)
    
    return data

def parse_fsm_sheet_fast(file):
    """Parse FSM sheet - optimized version"""
    # Only read the FSM sheet, skip others
    df = pd.read_excel(file, sheet_name='FSM', header=None, engine='openpyxl')
    
    reps = []
    
    # Find header row quickly
    header_row = None
    for idx in range(min(10, len(df))):
        if 'row labels' in str(df.iloc[idx]).lower():
            header_row = idx
            break
    
    if header_row is None:
        return reps
    
    # Parse data rows using vectorized operations where possible
    data_rows = df.iloc[header_row + 1:].copy()
    
    for idx, row in data_rows.iterrows():
        rep_name = row.iloc[1] if len(row) > 1 else None
        
        if pd.isna(rep_name):
            continue
        
        rep_name = str(rep_name).strip().upper()
        
        # Skip totals and invalid names
        if any(x in rep_name.lower() for x in ['total', 'grand', 'average', 'sum']) or ' ' not in rep_name:
            continue
        
        def to_num(val):
            if pd.isna(val):
                return 0
            try:
                return float(val)
            except:
                return 0
        
        reps.append({
            'rep_name': rep_name,
            'level': 'FSM',
            'prior_pod': to_num(row.iloc[2]),
            'new_pod': to_num(row.iloc[3]),
            'goal': to_num(row.iloc[4]),
            'variance': to_num(row.iloc[5]),
            'pct_goal': to_num(row.iloc[6]),
        })
    
    return reps

def parse_reps_sheet_fast(file):
    """Parse Reps sheet - optimized version"""
    df = pd.read_excel(file, sheet_name='Reps', header=None, engine='openpyxl')
    
    reps_data = {}
    
    # Find header row
    header_row = None
    for idx in range(min(10, len(df))):
        row_str = str(df.iloc[idx]).lower()
        if 'row labels' in row_str:
            header_row = idx
            break
    
    if header_row is None:
        header_row = 2
    
    def to_num(val):
        if pd.isna(val):
            return 0
        try:
            return float(val)
        except:
            return 0
    
    # Only process data rows, not entire sheet
    data_start = header_row + 1
    data_end = min(data_start + 500, len(df))  # Limit to 500 rows max
    
    # Parse Herradura table
    for idx in range(data_start, data_end):
        row = df.iloc[idx]
        rep_name = row.iloc[1] if len(row) > 1 else None
        
        if pd.isna(rep_name):
            continue
        
        rep_name = str(rep_name).strip().upper()
        if ' ' not in rep_name or any(x in rep_name.lower() for x in ['total', 'grand']):
            continue
        
        if rep_name not in reps_data:
            reps_data[rep_name] = {'rep_name': rep_name, 'level': 'Rep'}
        
        reps_data[rep_name]['new_pod'] = to_num(row.iloc[2]) if len(row) > 2 else 0
        reps_data[rep_name]['dist_payout'] = to_num(row.iloc[3]) if len(row) > 3 else 0
        reps_data[rep_name]['print_payout'] = to_num(row.iloc[4]) if len(row) > 4 else 0
        reps_data[rep_name]['total_payout'] = to_num(row.iloc[5]) if len(row) > 5 else 0
    
    # Parse Menus/Features table
    for idx in range(data_start, data_end):
        row = df.iloc[idx]
        rep_name = row.iloc[7] if len(row) > 7 else None
        
        if pd.isna(rep_name):
            continue
        
        rep_name = str(rep_name).strip().upper()
        if ' ' not in rep_name:
            continue
        
        if rep_name not in reps_data:
            reps_data[rep_name] = {'rep_name': rep_name, 'level': 'Rep'}
        
        reps_data[rep_name]['menus_features'] = to_num(row.iloc[8]) if len(row) > 8 else 0
        reps_data[rep_name]['cases_4plus'] = to_num(row.iloc[9]) if len(row) > 9 else 0
        reps_data[rep_name]['menu_payout'] = to_num(row.iloc[10]) if len(row) > 10 else 0
    
    return list(reps_data.values())

def analyze_performance(reps):
    """Analyze rep performance - optimized"""
    
    total_new_pod = sum(r.get('new_pod', 0) for r in reps)
    total_payout = sum(r.get('total_payout', 0) for r in reps)
    total_goal = sum(r.get('goal', 0) for r in reps)
    
    exceeding = on_track = at_risk = behind = 0
    
    for r in reps:
        goal = r.get('goal', 0)
        new_pod = r.get('new_pod', 0)
        
        if goal > 0:
            r['pct_goal'] = new_pod / goal
            r['variance'] = new_pod - goal
        else:
            r['pct_goal'] = 0
            r['variance'] = 0
        
        pct = r['pct_goal']
        if pct >= 1.0:
            r['status'] = 'exceeding'
            r['alert'] = f"Exceeding goal by {(pct-1)*100:.0f}%"
            exceeding += 1
        elif pct >= 0.9:
            r['status'] = 'on_track'
            r['alert'] = f"Close to goal ({pct*100:.0f}%)"
            on_track += 1
        elif pct >= 0.8:
            r['status'] = 'at_risk'
            r['alert'] = f"At risk ({pct*100:.0f}%)"
            at_risk += 1
        elif pct > 0:
            r['status'] = 'behind'
            r['alert'] = f"Behind goal ({pct*100:.0f}%)"
            behind += 1
        else:
            r['status'] = 'unknown'
            r['alert'] = "No data available"
    
    reps_sorted = sorted(reps, key=lambda x: x.get('new_pod', 0), reverse=True)
    reps_by_perf = sorted(reps, key=lambda x: x.get('pct_goal', 0))
    
    return {
        'reps': reps,
        'summary': {
            'total_reps': len(reps),
            'total_new_pod': total_new_pod,
            'total_goal': total_goal,
            'team_pct_goal': total_new_pod / total_goal if total_goal > 0 else 0,
            'total_payout': total_payout,
            'exceeding': exceeding,
            'on_track': on_track,
            'at_risk': at_risk,
            'behind': behind,
        },
        'top_performers': [r for r in reps_sorted if r.get('new_pod', 0) > 0][:10],
        'needs_help': [r for r in reps_by_perf if r['status'] in ['at_risk', 'behind']][:10]
    }

def generate_briefing(analysis):
    """Generate morning briefing"""
    today = datetime.now().strftime('%A, %B %d, %Y')
    summary = analysis['summary']
    
    insights = []
    
    if summary['team_pct_goal'] >= 1.0:
        insights.append(f"🎉 Team exceeding goal: {summary['team_pct_goal']*100:.0f}%")
    elif summary['team_pct_goal'] >= 0.9:
        insights.append(f"✅ Team close to goal: {summary['team_pct_goal']*100:.0f}%")
    elif summary['team_pct_goal'] >= 0.8:
        insights.append(f"⚠️ Team at risk: {summary['team_pct_goal']*100:.0f}% of goal")
    else:
        insights.append(f"🚨 Team behind: {summary['team_pct_goal']*100:.0f}% - urgent action needed")
    
    if summary['exceeding'] > 0:
        top = analysis['top_performers'][0]
        insights.append(f"🏆 {summary['exceeding']} reps exceeding goal (top: {top['rep_name']} with {top['new_pod']} new POD)")
    
    if summary['behind'] > 0:
        insights.append(f"❗ {summary['behind']} reps significantly behind - need coaching")
    
    if summary['at_risk'] > 0:
        insights.append(f"⚠️ {summary['at_risk']} reps at risk of missing goal")
    
    if summary['total_payout'] > 0:
        insights.append(f"💰 Team earned ${summary['total_payout']:,.0f} in payouts")
    
    return {
        'date': today,
        'program': 'Road to Cinco - B-F FY26 Q4 H&R',
        'summary': summary,
        'top_performers': analysis['top_performers'],
        'needs_help': analysis['needs_help'],
        'insights': insights,
        'generated_at': datetime.now().isoformat()
    }

def main():
    start_time = time.time()
    
    print("🎯 Scout v3.1 - Optimized B-F Sales Performance")
    print("-" * 50)
    
    if not EXCEL_FILE.exists():
        print(f"❌ Excel file not found: {EXCEL_FILE}")
        return
    
    # Load cached or parse fresh
    fsm_reps = load_cached_or_parse(EXCEL_FILE, parse_fsm_sheet_fast, 'fsm_data')
    print(f"✅ Loaded {len(fsm_reps)} FSMs")
    
    rep_data = load_cached_or_parse(EXCEL_FILE, parse_reps_sheet_fast, 'reps_data')
    print(f"✅ Loaded {len(rep_data)} reps")
    
    # Merge data
    all_reps = {r['rep_name']: r for r in rep_data}
    for fsm in fsm_reps:
        if fsm['rep_name'] in all_reps:
            all_reps[fsm['rep_name']].update(fsm)
        else:
            all_reps[fsm['rep_name']] = fsm
    
    reps = list(all_reps.values())
    print(f"✅ Total unique reps: {len(reps)}")
    
    # Analyze
    print("🔍 Analyzing performance...")
    analysis = analyze_performance(reps)
    
    # Generate briefing
    print("📋 Creating briefing...")
    briefing = generate_briefing(analysis)
    
    # Save outputs
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    today = datetime.now().strftime('%Y-%m-%d')
    
    with open(OUTPUT_DIR / f'bf_performance_{today}.json', 'w') as f:
        json.dump(analysis, f, indent=2)
    
    with open(OUTPUT_DIR / 'bf_performance_latest.json', 'w') as f:
        json.dump(analysis, f, indent=2)
    
    with open(OUTPUT_DIR / f'briefing_{today}.json', 'w') as f:
        json.dump(briefing, f, indent=2)
    
    with open(OUTPUT_DIR / 'briefing_latest.json', 'w') as f:
        json.dump(briefing, f, indent=2)
    
    # Summary
    total_time = time.time() - start_time
    print("-" * 50)
    print(f"✨ COMPLETE in {total_time:.1f}s")
    print()
    
    summary = analysis['summary']
    print(f"📊 ROAD TO CINCO SUMMARY:")
    print(f"   Total Reps: {summary['total_reps']}")
    print(f"   New POD: {summary['total_new_pod']:.0f} (Goal: {summary['total_goal']:.0f})")
    print(f"   Team % to Goal: {summary['team_pct_goal']*100:.1f}%")
    print(f"   Total Payouts: ${summary['total_payout']:,.0f}")
    print(f"   🏆 {summary['exceeding']} | ✅ {summary['on_track']} | ⚠️ {summary['at_risk']} | ❗ {summary['behind']}")
    print()
    print("📁 Files saved to scout_output/")

if __name__ == "__main__":
    main()
