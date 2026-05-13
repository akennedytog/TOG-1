#!/usr/bin/env python3
"""
Scout Expert Report Analyzer - Universal sales report reader with multi-team support
"""

import json
import os
import sys
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Any, Optional
from collections import defaultdict

REPORTS_DIR = Path('/Users/aleckennedy/.openclaw/workspace/scout_reports')
REPORTS_DIR.mkdir(exist_ok=True)

def load_dotenv(filepath='.env'):
    env_path = Path(filepath)
    if not env_path.exists():
        env_path = Path(__file__).parent / '.env'
    if env_path.exists():
        with open(env_path) as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    os.environ.setdefault(key, value)

load_dotenv()

def read_file(filepath: str) -> tuple:
    """Read any file type and return data + metadata"""
    ext = Path(filepath).suffix.lower()
    
    if ext in ['.csv']:
        return read_csv(filepath), 'csv'
    elif ext in ['.xlsx', '.xls', '.xlsm']:
        return read_excel(filepath), 'excel'
    elif ext in ['.pdf']:
        return read_pdf(filepath), 'pdf'
    else:
        raise ValueError(f"Unsupported: {ext}")

def read_csv(filepath: str) -> List[Dict]:
    import csv
    for enc in ['utf-8-sig', 'utf-8', 'latin-1']:
        try:
            with open(filepath, 'r', encoding=enc) as f:
                return list(csv.DictReader(f))
        except:
            continue
    return []

def read_excel(filepath: str) -> List[Dict]:
    import pandas as pd
    try:
        xl = pd.ExcelFile(filepath)
        all_data = []
        for sheet in xl.sheet_names:
            df = pd.read_excel(filepath, sheet_name=sheet)
            if len(df) > 0:
                df['_sheet'] = sheet
                all_data.extend(df.to_dict('records'))
        return all_data
    except Exception as e:
        print(f"Excel error: {e}")
        return []

def read_pdf(filepath: str) -> str:
    try:
        import PyPDF2
        text = ""
        with open(filepath, 'rb') as f:
            reader = PyPDF2.PdfReader(f)
            for page in reader.pages:
                text += page.extract_text() + "\n"
        return text
    except:
        return ""

def detect_columns(data: List[Dict]) -> Dict[str, str]:
    """Smart column detection"""
    if not data:
        return {}
    
    columns = {}
    sample = data[0]
    
    # Common column patterns
    patterns = {
        'monetary': ['revenue', 'sales', 'amount', 'value', 'price', 'total', 'commission', 'margin'],
        'entity': ['customer', 'client', 'account', 'company', 'prospect', 'lead'],
        'product': ['product', 'sku', 'item', 'service'],
        'team': ['sales_team', 'team', 'division', 'group', 'territory', 'region', 'area', 'dept', 'department'],
        'person': ['sales_rep', 'rep', 'salesperson', 'agent', 'consultant', 'ae', 'am', 'owner'],
        'date': ['date', 'month', 'year', 'period', 'quarter'],
        'quantity': ['quantity', 'count', 'units', 'volume', 'deals', 'opps'],
    }
    
    for col in sample.keys():
        col_lower = col.lower().replace(' ', '_').replace('-', '_')
        found = False
        for ptype, keywords in patterns.items():
            if any(k in col_lower for k in keywords):
                columns[col] = ptype
                found = True
                break
        if not found:
            columns[col] = 'other'
    
    return columns

def analyze_teams(data: List[Dict], columns: Dict[str, str]) -> List[Dict]:
    """Analyze performance by team"""
    # Find team column
    team_col = None
    for col, ctype in columns.items():
        if ctype == 'team':
            team_col = col
            break
    
    # If no team column, check for person column
    person_col = None
    for col, ctype in columns.items():
        if ctype == 'person':
            person_col = col
            break
    
    if not team_col and not person_col:
        return []
    
    # Find monetary column
    money_col = None
    for col, ctype in columns.items():
        if ctype == 'monetary':
            money_col = col
            break
    
    # Aggregate by team
    teams = defaultdict(lambda: {'count': 0, 'revenue': 0, 'reps': set()})
    
    for row in data:
        team = row.get(team_col, 'Unknown') if team_col else row.get(person_col, 'Unknown')
        if team_col and person_col:
            person = row.get(person_col, '')
            if person:
                teams[team]['reps'].add(person)
        
        teams[team]['count'] += 1
        
        if money_col:
            try:
                val = float(str(row.get(money_col, 0)).replace('$', '').replace(',', ''))
                teams[team]['revenue'] += val
            except:
                pass
    
    # Convert to list and sort by revenue
    team_list = []
    for name, stats in teams.items():
        team_list.append({
            'name': name,
            'deals': stats['count'],
            'revenue': stats['revenue'],
            'reps': len(stats['reps']),
            'avg_deal': stats['revenue'] / stats['count'] if stats['count'] > 0 else 0
        })
    
    return sorted(team_list, key=lambda x: x['revenue'], reverse=True)

def analyze_with_ai(data: List[Dict], filename: str, columns: Dict[str, str]) -> Dict:
    """AI analysis with team focus"""
    
    # Extract team data
    teams = analyze_teams(data, columns)
    
    try:
        import openai
        openai.api_key = os.getenv('OPENAI_API_KEY')
        
        if not openai.api_key:
            return generate_fallback(data, columns, teams)
        
        # Build prompt
        sample = json.dumps(data[:30], indent=2, default=str)
        
        team_summary = "\n".join([
            f"- {t['name']}: ${t['revenue']:,.0f} ({t['deals']} deals, {t['reps']} reps)"
            for t in teams[:5]
        ]) if teams else "No teams detected"
        
        prompt = f"""Analyze this sales report with {len(data)} records.

TEAM PERFORMANCE:
{team_summary}

Sample data:
{sample}

Return JSON:
{{
  "summary": "Executive summary with team breakdown",
  "team_rankings": [
    {{"rank": 1, "team": "name", "revenue": "$X", "deals": N, "reps": N, "performance": "excellent/good/average", "insights": "why"}}
  ],
  "top_performers": [{{"name": "rep", "team": "team", "metric": "revenue", "value": "$X"}}],
  "accounts_at_risk": [{{"name": "account", "team": "owner", "reason": "why", "action": "fix"}}],
  "call_today": [{{"name": "who", "team": "team", "priority": "high", "reason": "why"}}],
  "opportunities": [{{"description": "what", "team": "which", "potential": "$X"}}],
  "alerts": ["urgent"],
  "recommendations": ["strategic"]
}}"""
        
        resp = openai.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You analyze sales reports. Be specific about teams and rankings."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.3
        )
        
        return json.loads(resp.choices[0].message.content)
        
    except Exception as e:
        print(f"AI error: {e}")
        return generate_fallback(data, columns, teams)

def generate_fallback(data, columns, teams) -> Dict:
    """Fallback when AI unavailable"""
    
    # Get top team
    top_team = teams[0] if teams else None
    
    return {
        "summary": f"Report has {len(data)} records across {len(teams)} teams. Top team: {top_team['name'] if top_team else 'N/A'}.",
        "team_rankings": [
            {
                "rank": i+1,
                "team": t['name'],
                "revenue": f"${t['revenue']:,.0f}",
                "deals": t['deals'],
                "reps": t['reps'],
                "performance": "excellent" if i == 0 else "good" if i == 1 else "average",
                "insights": "Based on total revenue"
            }
            for i, t in enumerate(teams[:5])
        ] if teams else [],
        "top_performers": [{"name": teams[0]['name'], "team": teams[0]['name'], "metric": "revenue", "value": f"${teams[0]['revenue']:,.0f}"}] if teams else [],
        "accounts_at_risk": [],
        "call_today": [],
        "opportunities": [],
        "alerts": ["Set OPENAI_API_KEY for AI analysis"],
        "recommendations": ["Review team rankings above"]
    }

def analyze_report(filepath: str) -> Dict:
    """Main analysis"""
    try:
        data, ftype = read_file(filepath)
        path = Path(filepath)
        
        if isinstance(data, str):  # PDF text
            return {
                "id": f"pdf_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                "filename": path.name,
                "file_type": "pdf",
                "insights": {
                    "summary": "PDF text extracted. AI analysis available with OPENAI_API_KEY.",
                    "team_rankings": [], "top_performers": [], "alerts": ["PDF analysis limited"]
                }
            }
        
        # Analyze structure
        columns = detect_columns(data)
        
        # AI Analysis
        insights = analyze_with_ai(data, path.name, columns)
        
        # Build report
        report_id = f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{path.stem}"
        
        report = {
            "id": report_id,
            "filename": path.name,
            "uploaded_at": datetime.now().isoformat(),
            "file_type": ftype,
            "row_count": len(data),
            "columns_detected": columns,
            "insights": insights
        }
        
        # Save
        with open(REPORTS_DIR / f"{report_id}.json", 'w') as f:
            json.dump(report, f, indent=2)
        
        return report
        
    except Exception as e:
        return {
            "error": str(e),
            "insights": {"summary": f"Error: {str(e)}", "team_rankings": [], "alerts": ["Failed"]}
        }

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python scout_analyzer.py <file>")
        sys.exit(1)
    
    result = analyze_report(sys.argv[1])
    print(json.dumps(result, indent=2))
