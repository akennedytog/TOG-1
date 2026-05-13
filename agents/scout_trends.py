#!/usr/bin/env python3
"""
Scout Trend Analysis Module
Compare current vs previous period data
"""

import json
import pandas as pd
from datetime import datetime, timedelta
from pathlib import Path
import sys

HISTORY_DIR = Path('/Users/aleckennedy/.openclaw/workspace/data/scout_history')
HISTORY_DIR.mkdir(parents=True, exist_ok=True)

def save_historical_data(data, filename=None):
    """Save data snapshot for trend analysis"""
    if filename is None:
        filename = f"scout_data_{datetime.now().strftime('%Y%m%d')}.json"
    
    filepath = HISTORY_DIR / filename
    with open(filepath, 'w') as f:
        json.dump(data, f, indent=2, default=str)
    
    print(f"✅ Data archived: {filepath}")
    return filepath

def load_previous_data(days_back=7):
    """Load data from X days ago"""
    target_date = datetime.now() - timedelta(days=days_back)
    target_filename = f"scout_data_{target_date.strftime('%Y%m%d')}.json"
    
    # Try exact date first
    filepath = HISTORY_DIR / target_filename
    if filepath.exists():
        with open(filepath) as f:
            return json.load(f)
    
    # Find most recent file
    files = sorted(HISTORY_DIR.glob('scout_data_*.json'), key=lambda x: x.stat().st_mtime, reverse=True)
    
    if len(files) >= 2:
        # Return second most recent (previous snapshot)
        with open(files[1]) as f:
            return json.load(f)
    elif files:
        with open(files[0]) as f:
            return json.load(f)
    
    return None

def calculate_trends(current_data, previous_data):
    """Calculate week-over-week trends"""
    if not previous_data:
        return {'message': 'No previous data available for comparison'}
    
    trends = {
        'team_performance': {},
        'rep_changes': [],
        'alerts': [],
        'summary': {}
    }
    
    # Team-level trends
    curr_summary = current_data.get('summary', {})
    prev_summary = previous_data.get('summary', {})
    
    curr_team_pct = curr_summary.get('team_pct_goal', 0)
    prev_team_pct = prev_summary.get('team_pct_goal', 0)
    team_change = (curr_team_pct - prev_team_pct) * 100
    
    trends['team_performance'] = {
        'current_pct': curr_team_pct * 100,
        'previous_pct': prev_team_pct * 100,
        'change': team_change,
        'direction': 'up' if team_change > 0 else 'down' if team_change < 0 else 'flat',
        'current_new_pod': curr_summary.get('total_new_pod', 0),
        'previous_new_pod': prev_summary.get('total_new_pod', 0),
        'new_pod_change': curr_summary.get('total_new_pod', 0) - prev_summary.get('total_new_pod', 0)
    }
    
    # Rep-level trends
    curr_reps = {r['rep_name']: r for r in current_data.get('reps', [])}
    prev_reps = {r['rep_name']: r for r in previous_data.get('reps', [])}
    
    for rep_name, curr_rep in curr_reps.items():
        if rep_name in prev_reps:
            prev_rep = prev_reps[rep_name]
            
            curr_pct = curr_rep.get('pct_goal', 0)
            prev_pct = prev_rep.get('pct_goal', 0)
            pct_change = (curr_pct - prev_pct) * 100
            
            curr_pod = curr_rep.get('new_pod', 0)
            prev_pod = prev_rep.get('new_pod', 0)
            pod_change = curr_pod - prev_pod
            
            change_data = {
                'rep_name': rep_name,
                'current_pct': curr_pct * 100,
                'previous_pct': prev_pct * 100,
                'pct_change': pct_change,
                'current_pod': curr_pod,
                'previous_pod': prev_pod,
                'pod_change': pod_change,
                'direction': 'up' if pct_change > 5 else 'down' if pct_change < -5 else 'stable'
            }
            
            trends['rep_changes'].append(change_data)
            
            # Generate alerts
            if pct_change >= 20:
                trends['alerts'].append({
                    'type': 'positive',
                    'priority': 'high',
                    'message': f"🚀 {rep_name} jumped {pct_change:.0f} percentage points",
                    'icon': '🚀',
                    'rep': rep_name
                })
            elif pct_change <= -20:
                trends['alerts'].append({
                    'type': 'negative',
                    'priority': 'critical',
                    'message': f"🚨 {rep_name} dropped {abs(pct_change):.0f} percentage points",
                    'icon': '🚨',
                    'rep': rep_name
                })
            elif pct_change < 0 and curr_pct < 0.5:
                trends['alerts'].append({
                    'type': 'negative',
                    'priority': 'high',
                    'message': f"⚠️ {rep_name} declining and under 50%",
                    'icon': '⚠️',
                    'rep': rep_name
                })
    
    # Sort rep changes by absolute change
    trends['rep_changes'].sort(key=lambda x: abs(x['pct_change']), reverse=True)
    
    # Sort alerts by priority
    priority_order = {'critical': 0, 'high': 1, 'medium': 2, 'low': 3}
    trends['alerts'].sort(key=lambda x: priority_order.get(x['priority'], 4))
    
    # Summary stats
    improving = len([r for r in trends['rep_changes'] if r['direction'] == 'up'])
    declining = len([r for r in trends['rep_changes'] if r['direction'] == 'down'])
    
    trends['summary'] = {
        'total_reps_tracked': len(trends['rep_changes']),
        'improving': improving,
        'declining': declining,
        'stable': len(trends['rep_changes']) - improving - declining,
        'critical_alerts': len([a for a in trends['alerts'] if a['priority'] == 'critical']),
        'positive_alerts': len([a for a in trends['alerts'] if a['type'] == 'positive'])
    }
    
    return trends

def generate_trend_report(current_data, trends):
    """Generate a trend report for VP"""
    if 'message' in trends:
        return f"TREND ANALYSIS\n==============\n{trends['message']}"
    
    lines = []
    lines.append("TREND ANALYSIS")
    lines.append("==============")
    lines.append(f"Period: Week-over-week comparison")
    lines.append("")
    
    # Team trend
    team = trends['team_performance']
    direction = "↗️ UP" if team['direction'] == 'up' else "↘️ DOWN" if team['direction'] == 'down' else "➡️ FLAT"
    lines.append(f"TEAM PERFORMANCE: {direction}")
    lines.append(f"  Current: {team['current_pct']:.1f}% to goal")
    lines.append(f"  Previous: {team['previous_pct']:.1f}% to goal")
    lines.append(f"  Change: {team['change']:+.1f} percentage points")
    lines.append(f"  New POD Added: {team['new_pod_change']:+.0f}")
    lines.append("")
    
    # Alerts
    if trends['alerts']:
        lines.append("SMART ALERTS")
        lines.append("------------")
        for alert in trends['alerts'][:5]:
            lines.append(f"{alert['icon']} {alert['message']}")
        lines.append("")
    
    # Top movers
    lines.append("TOP MOVERS")
    lines.append("----------")
    
    # Improving
    improving = [r for r in trends['rep_changes'] if r['direction'] == 'up'][:3]
    if improving:
        lines.append("↗️ Most Improved:")
        for r in improving:
            lines.append(f"  {r['rep_name']}: +{r['pct_change']:.0f}pp ({r['previous_pct']:.0f}% → {r['current_pct']:.0f}%)")
        lines.append("")
    
    # Declining
    declining = [r for r in trends['rep_changes'] if r['direction'] == 'down'][:3]
    if declining:
        lines.append("↘️ Biggest Drops:")
        for r in declining:
            lines.append(f"  {r['rep_name']}: {r['pct_change']:.0f}pp ({r['previous_pct']:.0f}% → {r['current_pct']:.0f}%)")
        lines.append("")
    
    # Summary
    summary = trends['summary']
    lines.append("SUMMARY")
    lines.append("-------")
    lines.append(f"  Reps Tracked: {summary['total_reps_tracked']}")
    lines.append(f"  Improving: {summary['improving']} 🚀")
    lines.append(f"  Declining: {summary['declining']} 🚨")
    lines.append(f"  Stable: {summary['stable']} ➡️")
    if summary['critical_alerts'] > 0:
        lines.append(f"  Critical Alerts: {summary['critical_alerts']}")
    
    return "\\n".join(lines)

def main():
    # Load current data
    current_file = Path('/Users/aleckennedy/.openclaw/workspace/data/scout_output/bf_performance_latest.json')
    
    if not current_file.exists():
        print("❌ No current data found")
        return 1
    
    with open(current_file) as f:
        current_data = json.load(f)
    
    # Save current data as historical snapshot
    save_historical_data(current_data)
    
    # Load previous data
    previous_data = load_previous_data(days_back=7)
    
    if not previous_data:
        print("⚠️ No previous data available. Trends will be available after next run.")
        # Save anyway for future comparison
        return 0
    
    # Calculate trends
    print("📊 Calculating trends...")
    trends = calculate_trends(current_data, previous_data)
    
    # Save trends
    trends_file = HISTORY_DIR / f"trends_{datetime.now().strftime('%Y%m%d')}.json"
    with open(trends_file, 'w') as f:
        json.dump(trends, f, indent=2)
    
    # Generate report
    report = generate_trend_report(current_data, trends)
    
    report_file = HISTORY_DIR / f"trend_report_{datetime.now().strftime('%Y%m%d')}.txt"
    with open(report_file, 'w') as f:
        f.write(report)
    
    print("✅ Trend analysis complete!")
    print(f"📁 Trends saved: {trends_file}")
    print(f"📁 Report saved: {report_file}")
    print()
    print(report)
    
    return 0

if __name__ == "__main__":
    sys.exit(main())