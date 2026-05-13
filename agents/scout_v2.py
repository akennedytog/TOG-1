#!/usr/bin/env python3
"""
Scout - Sales Team Performance Intelligence Agent
Analyzes rep performance vs goals, identifies top performers, flags at-risk reps
Generates daily briefings for sales managers
"""

import json
import pandas as pd
from datetime import datetime, timedelta
from pathlib import Path
from collections import defaultdict

class ScoutAgent:
    def __init__(self, config_path=None):
        self.config = self._load_config(config_path)
        self.data_cache = {}
        
    def _load_config(self, path):
        default = {
            'excel_path': '/Users/aleckennedy/.openclaw/workspace/data/sales_reports',
            'output_dir': '/Users/aleckennedy/.openclaw/workspace/data/scout_output',
            'goal_threshold': 0.8,  # 80% of goal = at risk
            'excellent_threshold': 1.0,  # 100%+ = excellent
        }
        if path and Path(path).exists():
            with open(path) as f:
                return {**default, **json.load(f)}
        return default
    
    def _load_excel(self):
        """Parse Excel sales reports - multiple sheets with rep performance"""
        report_dir = Path(self.config['excel_path'])
        all_rep_data = []
        
        for file in report_dir.glob('*.xlsx'):
            try:
                print(f"📂 Loading {file.name}...")
                xl = pd.ExcelFile(file)
                
                # Look for rep performance sheets
                for sheet_name in xl.sheet_names:
                    sheet_lower = sheet_name.lower()
                    
                    # Skip non-data sheets
                    if any(x in sheet_lower for x in ['instruction', 'summary', 'notes', 'readme', 'opp', 'salesforce']):
                        continue
                    
                    try:
                        df = pd.read_excel(file, sheet_name=sheet_name, header=None)
                        
                        if df.empty or len(df.columns) < 3:
                            continue
                        
                        # Detect sheet type
                        sheet_text = df.head(10).to_string().lower()
                        
                        if 'pod' in sheet_text or 'payout' in sheet_text or 'goal' in sheet_text:
                            # This is rep performance data
                            rep_data = self._parse_rep_performance_sheet(df, sheet_name, file.name)
                            if rep_data:
                                all_rep_data.extend(rep_data)
                                print(f"  ✅ Sheet '{sheet_name}': {len(rep_data)} reps")
                    
                    except Exception as e:
                        print(f"  ⚠️ Sheet '{sheet_name}': {e}")
                
            except Exception as e:
                print(f"❌ Error loading {file}: {e}")
        
        return pd.DataFrame(all_rep_data)
    
    def _parse_rep_performance_sheet(self, df, sheet_name, filename):
        """Parse a sheet containing rep performance data - handles multiple side-by-side tables"""
        reps = {}
        
        # Find header row (look for 'Row Labels' or 'Sum of' in row 2 typically)
        header_row = None
        for idx in range(min(5, len(df))):
            row_str = str(df.iloc[idx]).lower()
            if 'row labels' in row_str or 'sum of' in row_str:
                header_row = idx
                break
        
        if header_row is None:
            header_row = 2  # Default assumption
        
        # Parse header to find table boundaries
        header = df.iloc[header_row].fillna('')
        
        # Find all 'Row Labels' columns - each starts a new table
        table_starts = []
        for idx, val in enumerate(header):
            if str(val).lower() == 'row labels':
                table_starts.append(idx)
        
        print(f"    📊 Found {len(table_starts)} tables in {sheet_name}")
        
        # Parse each table
        for table_idx, start_col in enumerate(table_starts):
            # Determine end of this table (next 'Row Labels' or end of row)
            if table_idx + 1 < len(table_starts):
                end_col = table_starts[table_idx + 1]
            else:
                end_col = len(header)
            
            # Get column headers for this table
            table_header = header[start_col:end_col]
            
            # Map columns for this table
            col_map = {}
            for idx, val in enumerate(table_header):
                val_str = str(val).lower().strip()
                
                if val_str == 'row labels':
                    col_map['rep_name'] = start_col + idx
                elif 'new_pod' in val_str or 'herr new' in val_str:
                    col_map['new_pod'] = start_col + idx
                elif 'dist' in val_str and 'payout' in val_str:
                    col_map['dist_payout'] = start_col + idx
                elif 'print' in val_str and 'payout' in val_str:
                    col_map['print_payout'] = start_col + idx
                elif 'total' in val_str and 'payout' in val_str:
                    col_map['total_payout'] = start_col + idx
                elif 'menus' in val_str or 'features' in val_str:
                    col_map['menus'] = start_col + idx
                elif 'w/ 4+' in val_str or 'cases' in val_str:
                    col_map['cases_4plus'] = start_col + idx
                elif 'payout' in val_str:
                    col_map['payout'] = start_col + idx
            
            # Skip tables without rep names
            if 'rep_name' not in col_map:
                continue
            
            # Parse data rows
            for idx in range(header_row + 1, len(df)):
                row = df.iloc[idx]
                
                # Get rep name
                rep_name = row.iloc[col_map['rep_name']]
                
                if pd.isna(rep_name) or not rep_name or str(rep_name).strip() in ['', 'NaN', 'nan']:
                    continue
                
                rep_name = str(rep_name).strip().upper()
                
                # Skip non-rep rows
                if any(x in rep_name.lower() for x in ['total', 'grand', 'sum', 'average', 'na', 'nan']):
                    continue
                
                # Check if looks like a name (has space, or known rep format)
                if ' ' not in rep_name and len(rep_name) < 5:
                    continue
                
                # Initialize or update rep record
                if rep_name not in reps:
                    reps[rep_name] = {
                        'rep_name': rep_name,
                        'sheet': sheet_name,
                        'file': filename,
                        'parsed_at': datetime.now().isoformat(),
                        'tables_parsed': []
                    }
                
                # Extract metrics from this table
                if 'new_pod' in col_map:
                    val = row.iloc[col_map['new_pod']]
                    current = reps[rep_name].get('new_pod', 0)
                    reps[rep_name]['new_pod'] = current + self._to_float(val)
                
                if 'dist_payout' in col_map:
                    val = row.iloc[col_map['dist_payout']]
                    current = reps[rep_name].get('dist_payout', 0)
                    reps[rep_name]['dist_payout'] = current + self._to_float(val)
                
                if 'print_payout' in col_map:
                    val = row.iloc[col_map['print_payout']]
                    current = reps[rep_name].get('print_payout', 0)
                    reps[rep_name]['print_payout'] = current + self._to_float(val)
                
                if 'total_payout' in col_map:
                    val = row.iloc[col_map['total_payout']]
                    current = reps[rep_name].get('total_payout', 0)
                    reps[rep_name]['total_payout'] = current + self._to_float(val)
                
                if 'menus' in col_map:
                    val = row.iloc[col_map['menus']]
                    current = reps[rep_name].get('menus_features', 0)
                    reps[rep_name]['menus_features'] = current + self._to_float(val)
                
                if 'cases_4plus' in col_map:
                    val = row.iloc[col_map['cases_4plus']]
                    current = reps[rep_name].get('cases_4plus', 0)
                    reps[rep_name]['cases_4plus'] = current + self._to_float(val)
                
                if 'payout' in col_map and 'total_payout' not in col_map:
                    val = row.iloc[col_map['payout']]
                    current = reps[rep_name].get('payout', 0)
                    reps[rep_name]['payout'] = current + self._to_float(val)
                
                reps[rep_name]['tables_parsed'].append(f"Table{table_idx+1}")
        
        return list(reps.values())
    
    def _to_float(self, val):
        """Safely convert to float"""
        if pd.isna(val):
            return 0.0
        try:
            return float(val)
        except:
            return 0.0
    
    def analyze_reps(self, df):
        """Analyze rep performance"""
        if df.empty:
            return []
        
        today = datetime.now()
        insights = []
        
        # Calculate overall stats
        total_reps = len(df)
        
        for _, rep in df.iterrows():
            rep_name = rep.get('rep_name', 'Unknown')
            new_pod = rep.get('new_pod', 0)
            goal = rep.get('goal', 0)
            pct_goal = rep.get('pct_goal', 0)
            variance = rep.get('variance', 0)
            total_payout = rep.get('total_payout', 0)
            
            # Determine status
            if goal == 0:
                status = 'unknown'
                alert = "No goal set"
            elif pct_goal >= 1.0:
                status = 'excellent'
                alert = f"Exceeding goal by {(pct_goal-1)*100:.0f}%"
            elif pct_goal >= 0.9:
                status = 'on_track'
                alert = f"Close to goal ({pct_goal*100:.0f}%)"
            elif pct_goal >= 0.8:
                status = 'at_risk'
                alert = f"At risk ({pct_goal*100:.0f}% of goal)"
            else:
                status = 'behind'
                alert = f"Behind goal ({pct_goal*100:.0f}%)"
            
            # Calculate priority score
            priority_score = self._calculate_rep_priority(pct_goal, total_payout, goal)
            
            insights.append({
                'rep_name': rep_name,
                'new_pod': new_pod,
                'goal': goal,
                'pct_goal': round(pct_goal, 2),
                'variance': round(variance, 0),
                'total_payout': total_payout,
                'dist_payout': rep.get('dist_payout', 0),
                'print_payout': rep.get('print_payout', 0),
                'status': status,
                'alert': alert,
                'sheet': rep.get('sheet', ''),
                'priority_score': priority_score,
                'needs_attention': status in ['at_risk', 'behind']
            })
        
        # Sort by priority (high performers and at-risk both high priority)
        insights.sort(key=lambda x: x['priority_score'], reverse=True)
        return insights
    
    def _calculate_rep_priority(self, pct_goal, total_payout, goal):
        """Calculate priority score for rep"""
        score = 50  # Base
        
        # Performance score
        if pct_goal >= 1.2:
            score += 30  # Top performer
        elif pct_goal >= 1.0:
            score += 20
        elif pct_goal >= 0.9:
            score += 10
        elif pct_goal >= 0.8:
            score += 25  # Needs help
        else:
            score += 35  # Critical
        
        # Payout weight (revenue impact)
        score += min(total_payout / 50, 15)
        
        # Goal size weight (bigger goals = more important)
        score += min(goal / 50, 10)
        
        return min(score, 100)
    
    def generate_briefing(self, rep_data):
        """Generate morning briefing"""
        today = datetime.now().strftime('%A, %B %d, %Y')
        
        # Calculate stats
        total_reps = len(rep_data)
        excellent = len([r for r in rep_data if r['status'] == 'excellent'])
        on_track = len([r for r in rep_data if r['status'] == 'on_track'])
        at_risk = len([r for r in rep_data if r['status'] == 'at_risk'])
        behind = len([r for r in rep_data if r['status'] == 'behind'])
        
        # Calculate totals
        total_pod = sum(r['new_pod'] for r in rep_data if r.get('new_pod'))
        total_goal = sum(r['goal'] for r in rep_data if r.get('goal'))
        total_payout = sum(r['total_payout'] for r in rep_data if r.get('total_payout'))
        
        team_pct = total_pod / total_goal if total_goal > 0 else 0
        
        # Identify top and bottom performers
        by_performance = sorted(rep_data, key=lambda x: x['pct_goal'], reverse=True)
        top_performers = by_performance[:3]
        needs_help = [r for r in by_performance if r['status'] in ['at_risk', 'behind']][:5]
        
        # Generate insights
        insights = self._generate_rep_insights(rep_data, team_pct)
        
        briefing = {
            'date': today,
            'data_type': 'rep_performance',
            'program': 'Road to Cinco',
            'summary': {
                'total_reps': total_reps,
                'excellent': excellent,
                'on_track': on_track,
                'at_risk': at_risk,
                'behind': behind,
                'team_pct_goal': round(team_pct, 2),
                'total_new_pod': round(total_pod, 0),
                'total_goal': round(total_goal, 0),
                'total_payout': round(total_payout, 0)
            },
            'top_performers': top_performers,
            'needs_help': needs_help,
            'insights': insights,
            'generated_at': datetime.now().isoformat()
        }
        
        return briefing
    
    def _generate_rep_insights(self, rep_data, team_pct):
        """Generate natural language insights"""
        insights = []
        
        # Team performance
        if team_pct >= 1.0:
            insights.append(f"🎉 Team exceeding goal: {team_pct*100:.0f}%")
        elif team_pct >= 0.9:
            insights.append(f"✅ Team close to goal: {team_pct*100:.0f}%")
        elif team_pct >= 0.8:
            insights.append(f"⚠️ Team at risk: {team_pct*100:.0f}% of goal")
        else:
            insights.append(f"🚨 Team behind: {team_pct*100:.0f}% - urgent action needed")
        
        # Individual insights
        excellent = [r for r in rep_data if r['status'] == 'excellent']
        if excellent:
            insights.append(f"🏆 {len(excellent)} reps exceeding goal (top: {excellent[0]['rep_name']})")
        
        behind = [r for r in rep_data if r['status'] == 'behind']
        if behind:
            insights.append(f"❗ {len(behind)} reps significantly behind goal - need coaching")
        
        at_risk = [r for r in rep_data if r['status'] == 'at_risk']
        if at_risk:
            insights.append(f"⚠️ {len(at_risk)} reps at risk of missing goal")
        
        # Payout insights
        total_payout = sum(r['total_payout'] for r in rep_data)
        if total_payout > 0:
            avg_payout = total_payout / len(rep_data)
            insights.append(f"💰 Team earned ${total_payout:,.0f} in payouts (avg ${avg_payout:,.0f}/rep)")
        
        return insights
    
    def save_outputs(self, rep_data, briefing):
        """Save all outputs"""
        output_dir = Path(self.config['output_dir'])
        output_dir.mkdir(parents=True, exist_ok=True)
        
        today = datetime.now().strftime('%Y-%m-%d')
        
        # Rep performance
        with open(output_dir / f'reps_{today}.json', 'w') as f:
            json.dump(rep_data, f, indent=2, default=str)
        
        # Briefing
        with open(output_dir / f'briefing_{today}.json', 'w') as f:
            json.dump(briefing, f, indent=2)
        
        # Latest files
        with open(output_dir / 'reps_latest.json', 'w') as f:
            json.dump(rep_data, f, indent=2, default=str)
        with open(output_dir / 'briefing_latest.json', 'w') as f:
            json.dump(briefing, f, indent=2)
        
        print(f"✅ Saved outputs to {output_dir}")
        return output_dir
    
    def run(self):
        """Main execution flow"""
        print("🎯 Scout Agent - Sales Team Performance")
        print(f"📅 {datetime.now().strftime('%Y-%m-%d %H:%M')}")
        print("-" * 50)
        
        # Load data
        print("📊 Loading Excel data...")
        df = self._load_excel()
        
        if df.empty:
            print("❌ No data loaded")
            return None
        
        print(f"✅ Loaded {len(df)} rep records")
        
        # Analyze
        print("🔍 Analyzing rep performance...")
        rep_data = self.analyze_reps(df)
        print(f"✅ Analyzed {len(rep_data)} reps")
        
        # Generate briefing
        print("📋 Creating briefing...")
        briefing = self.generate_briefing(rep_data)
        
        # Save outputs
        print("💾 Saving outputs...")
        output_dir = self.save_outputs(rep_data, briefing)
        
        # Print summary
        print("-" * 50)
        print("✨ Scout analysis complete!")
        print()
        print("📊 SUMMARY:")
        summary = briefing['summary']
        print(f"   Total Reps: {summary['total_reps']}")
        print(f"   Team Performance: {summary['team_pct_goal']*100:.0f}% of goal")
        print(f"   Excellent: {summary['excellent']} | On Track: {summary['on_track']}")
        print(f"   At Risk: {summary['at_risk']} | Behind: {summary['behind']}")
        print(f"   Total Payouts: ${summary['total_payout']:,.0f}")
        print()
        print("🏆 Top Performer:", briefing['top_performers'][0]['rep_name'] if briefing['top_performers'] else 'None')
        
        return {
            'reps': rep_data,
            'briefing': briefing
        }


if __name__ == "__main__":
    import sys
    
    config_path = sys.argv[1] if len(sys.argv) > 1 else None
    
    scout = ScoutAgent(config_path)
    results = scout.run()
    
    if results:
        print("\n📁 Output files ready for dashboard and email")