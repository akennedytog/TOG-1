#!/usr/bin/env python3
"""
Scout - Sales Intelligence Agent
Real-time territory insights from Excel/Sheets data
Generates route recommendations, account alerts, and strategy briefings
"""

import json
import pandas as pd
from datetime import datetime, timedelta
from pathlib import Path
import re
from collections import defaultdict

# Optional Google Sheets support
try:
    import gspread
    from oauth2client.service_account import ServiceAccountCredentials
    GSPREAD_AVAILABLE = True
except ImportError:
    GSPREAD_AVAILABLE = False

class ScoutAgent:
    def __init__(self, config_path=None):
        self.config = self._load_config(config_path)
        self.data_cache = {}
        self.insights = []
        
    def _load_config(self, path):
        default = {
            'excel_path': '/Users/aleckennedy/.openclaw/workspace/data/sales_reports',
            'sheets_id': None,  # Google Sheets ID if using Sheets
            'output_dir': '/Users/aleckennedy/.openclaw/workspace/data/scout_output',
            'territory_geojson': None,  # Optional territory boundaries
            'min_visit_frequency_days': 30,
            'down_account_threshold': 0.7,  # 70% of avg monthly volume
            'hot_account_threshold': 1.3   # 130% of avg monthly volume
        }
        if path and Path(path).exists():
            with open(path) as f:
                return {**default, **json.load(f)}
        return default
    
    def load_data(self, source='excel'):
        """Load sales data from Excel or Google Sheets"""
        if source == 'excel':
            return self._load_excel()
        elif source == 'sheets':
            return self._load_sheets()
    
    def _load_excel(self):
        """Parse Excel sales reports - handles multiple sheets with different schemas"""
        report_dir = Path(self.config['excel_path'])
        sales_data = []
        field_data = []
        
        for file in report_dir.glob('*.xlsx'):
            try:
                print(f"📂 Loading {file.name}...")
                # Load all sheets
                xl = pd.ExcelFile(file)
                
                for sheet_name in xl.sheet_names:
                    # Skip sheets that are obviously not data (instructions, summary, etc.)
                    if any(x in sheet_name.lower() for x in ['instruction', 'summary', 'notes', 'readme', 'am', 'fsm', 'reps']):
                        continue
                    
                    try:
                        df = pd.read_excel(file, sheet_name=sheet_name)
                        
                        # Skip empty sheets
                        if df.empty:
                            continue
                        
                        # Skip sheets with only metadata
                        if len(df.columns) < 3:
                            continue
                        
                        df['source_file'] = file.name
                        df['source_sheet'] = sheet_name
                        df['loaded_at'] = datetime.now().isoformat()
                        
                        # Detect and normalize based on type
                        df.columns = [col.lower().strip() for col in df.columns]
                        data_type = self._detect_data_type(df)
                        
                        if data_type == 'field_activity':
                            df_normalized = self._normalize_field_activity(df)
                            if 'account_name' in df_normalized.columns:
                                field_data.append(df_normalized)
                                print(f"  ✅ Sheet '{sheet_name}': {len(df_normalized)} field activity records")
                        else:
                            df_normalized = self._normalize_sales_data(df)
                            if 'account_name' in df_normalized.columns:
                                sales_data.append(df_normalized)
                                print(f"  ✅ Sheet '{sheet_name}': {len(df_normalized)} sales records")
                        
                    except Exception as e:
                        print(f"  ❌ Error loading sheet '{sheet_name}': {e}")
                
            except Exception as e:
                print(f"Error loading {file}: {e}")
        
        # Store both types separately
        self.data_cache['sales_raw'] = sales_data
        self.data_cache['field_raw'] = field_data
        
        # Return field data if available (preferred), otherwise sales data
        if field_data:
            # Normalize column sets before concatenation
            all_cols = set()
            for df in field_data:
                all_cols.update(df.columns)
            all_cols = list(all_cols)
            
            # Add missing columns to each df with NaN values
            normalized_dfs = []
            for df in field_data:
                for col in all_cols:
                    if col not in df.columns:
                        df[col] = pd.NA
                normalized_dfs.append(df[all_cols])
            
            combined = pd.concat(normalized_dfs, ignore_index=True)
            self.data_cache['raw'] = combined
            self.data_cache['data_type'] = 'field_activity'
            print(f"\n📊 Using FIELD ACTIVITY data: {len(combined)} records")
            return combined
        elif sales_data:
            # Normalize column sets before concatenation
            all_cols = set()
            for df in sales_data:
                all_cols.update(df.columns)
            all_cols = list(all_cols)
            
            # Add missing columns to each df with NaN values
            normalized_dfs = []
            for df in sales_data:
                for col in all_cols:
                    if col not in df.columns:
                        df[col] = pd.NA
                normalized_dfs.append(df[all_cols])
            
            combined = pd.concat(normalized_dfs, ignore_index=True)
            self.data_cache['raw'] = combined
            self.data_cache['data_type'] = 'sales'
            print(f"\n📊 Using SALES data: {len(combined)} records")
            return combined
        
        return pd.DataFrame()
    
    def _load_sheets(self):
        """Load from Google Sheets"""
        if not self.config.get('sheets_id'):
            return pd.DataFrame()
        
        scope = ['https://spreadsheets.google.com/feeds',
                 'https://www.googleapis.com/auth/drive']
        
        # Check for credentials
        creds_path = Path.home() / '.openclaw' / 'credentials' / 'google-sheets.json'
        if not creds_path.exists():
            print("Google Sheets credentials not found")
            return pd.DataFrame()
        
        creds = ServiceAccountCredentials.from_json_keyfile_name(str(creds_path), scope)
        client = gspread.authorize(creds)
        
        sheet = client.open_by_key(self.config['sheets_id'])
        worksheet = sheet.get_worksheet(0)
        data = worksheet.get_all_records()
        
        df = pd.DataFrame(data)
        self.data_cache['raw'] = df
        return self._normalize_data(df)
    
    def _normalize_data(self, df):
        """Normalize column names and data types - handles both sales data and field activity"""
        # Rename columns (case insensitive, handle spaces)
        df.columns = [col.lower().strip() for col in df.columns]
        
        # Detect data type
        data_type = self._detect_data_type(df)
        print(f"📊 Detected data type: {data_type}")
        
        if data_type == 'field_activity':
            return self._normalize_field_activity(df)
        else:
            return self._normalize_sales_data(df)
    
    def _detect_data_type(self, df):
        """Detect whether this is sales data or field activity data"""
        cols = set(df.columns)
        
        # Field activity indicators
        field_indicators = {'promo #', 'photo taker', 'promotion type', 'dba', 'theme', 'photo'}
        sales_indicators = {'amount', 'revenue', 'sales', 'total', 'order_date', 'sale_date'}
        
        field_matches = len(cols.intersection(field_indicators))
        sales_matches = len(cols.intersection(sales_indicators))
        
        if field_matches >= 2:
            return 'field_activity'
        elif sales_matches >= 2:
            return 'sales'
        else:
            # Check content for clues
            sample = df.head(5).to_string()
            if 'promo' in sample.lower() or 'photo' in sample.lower():
                return 'field_activity'
            return 'sales'
    
    def _normalize_field_activity(self, df):
        """Normalize field activity/promo tracking data"""
        # Field activity column mappings
        column_map = {
            'dba': 'account_name',  # Doing Business As
            'account #': 'account_id',
            'account id': 'account_id',
            'photo taker': 'sales_rep',
            "photo taker's role": 'rep_role',
            'date/time': 'activity_date',
            'datetime': 'activity_date',
            'date': 'activity_date',
            'time': 'activity_time',
            'address': 'address',
            'city': 'city',
            'state': 'state',
            'zip': 'zipcode',
            'theme': 'activity_type',
            'promotion type': 'activity_type',
            'promo #': 'promo_id',
            'photo': 'has_photo',
        }
        
        df.rename(columns=column_map, inplace=True)
        
        # Try to identify account name if DBA not available
        if 'account_name' not in df.columns:
            for col in df.columns:
                if any(x in col for x in ['name', 'account', 'location', 'venue', 'business']):
                    df.rename(columns={col: 'account_name'}, inplace=True)
                    break
        
        # Try to identify rep
        if 'sales_rep' not in df.columns:
            for col in df.columns:
                if any(x in col for x in ['rep', 'am', 'ads', 'name']):
                    df.rename(columns={col: 'sales_rep'}, inplace=True)
                    break
        
        # Try to identify date
        if 'activity_date' not in df.columns:
            for col in df.columns:
                if 'date' in col or 'time' in col:
                    df.rename(columns={col: 'activity_date'}, inplace=True)
                    break
        
        # Convert date
        if 'activity_date' in df.columns:
            df['activity_date'] = pd.to_datetime(df['activity_date'], errors='coerce')
            df['sale_date'] = df['activity_date']  # Alias for compatibility
        
        # Add synthetic fields for unified processing
        df['data_type'] = 'field_activity'
        df['sales_amount'] = 0  # No revenue in field tracking
        
        # Extract city/state from address if available
        if 'city' in df.columns and df['city'].isna().all() and 'address' in df.columns:
            df['city'] = df['address'].str.extract(r',\s*([A-Za-z\s]+),?\s*[A-Z]{2}')
        
        return df
    
    def _normalize_sales_data(self, df):
        """Normalize traditional sales data"""
        # Sales column mappings
        column_map = {
            'customer': 'account_name',
            'client': 'account_name',
            'company': 'account_name',
            'customer_name': 'account_name',
            'account': 'account_name',
            'revenue': 'sales_amount',
            'amount': 'sales_amount',
            'total': 'sales_amount',
            'sales': 'sales_amount',
            'date': 'sale_date',
            'order_date': 'sale_date',
            'transaction_date': 'sale_date',
            'order date': 'sale_date',
            'rep': 'sales_rep',
            'representative': 'sales_rep',
            'salesperson': 'sales_rep',
            'territory': 'territory_code',
            'region': 'territory_code',
            'industry': 'industry'
        }
        
        df.rename(columns=column_map, inplace=True)
        
        # Try to identify amount column
        if 'sales_amount' not in df.columns:
            for col in df.columns:
                if any(x in col for x in ['amount', 'revenue', 'total', 'sales', 'price', 'value']):
                    df.rename(columns={col: 'sales_amount'}, inplace=True)
                    break
        
        # Try to identify date
        if 'sale_date' not in df.columns:
            for col in df.columns:
                if 'date' in col:
                    df.rename(columns={col: 'sale_date'}, inplace=True)
                    break
        
        # Try to identify account name
        if 'account_name' not in df.columns:
            for col in df.columns:
                if any(x in col for x in ['customer', 'client', 'company', 'account', 'name']):
                    df.rename(columns={col: 'account_name'}, inplace=True)
                    break
        
        df['data_type'] = 'sales'
        
        # Convert types
        if 'sale_date' in df.columns:
            df['sale_date'] = pd.to_datetime(df['sale_date'], errors='coerce')
        if 'sales_amount' in df.columns:
            df['sales_amount'] = pd.to_numeric(df['sales_amount'], errors='coerce')
        
        return df
    
    def analyze_accounts(self, df=None):
        """Generate account-level insights - handles both sales and field activity"""
        if df is None:
            df = self.data_cache.get('processed', pd.DataFrame())
        
        if df.empty:
            return {}
        
        # Check data type and route to appropriate analyzer
        data_type = df.get('data_type', ['sales']).iloc[0] if 'data_type' in df.columns else 'sales'
        
        if data_type == 'field_activity':
            return self._analyze_field_activity(df)
        else:
            return self._analyze_sales(df)
    
    def _analyze_field_activity(self, df):
        """Analyze field activity/promo visit data"""
        today = datetime.now()
        
        # Group by account - aggregate sales_rep and activity_type separately to avoid multi-col issues
        base_stats = df.groupby('account_name').agg({
            'activity_date': ['count', 'max', 'min', 'nunique'],
            'city': 'first',
            'address': 'first'
        }).reset_index()
        # Flatten multi-level columns
        base_stats.columns = ['account_name', 'total_visits', 'last_visit', 'first_visit',
                               'unique_visit_days', 'city', 'address']
        
        # Aggregate sales_rep and activity_type separately as Series
        def get_unique_values(x):
            if isinstance(x, pd.DataFrame):
                # x is a DataFrame when using groupby with column selection
                vals = x.iloc[:, 0].dropna().unique().tolist() if len(x) > 0 else []
            else:
                # x is a Series
                vals = x.dropna().unique().tolist() if len(x) > 0 else []
            return vals
        
        rep_stats = df.groupby('account_name')['sales_rep'].apply(get_unique_values)
        activity_stats = df.groupby('account_name')['activity_type'].apply(get_unique_values)
        
        # Add these as columns to base_stats
        base_stats['reps'] = base_stats['account_name'].map(rep_stats)
        base_stats['activity_types'] = base_stats['account_name'].map(activity_stats)
        
        account_stats = base_stats
        
        insights = []
        
        for _, account in account_stats.iterrows():
            account_name = account['account_name']
            
            # Calculate visit metrics
            days_since = (today - account['last_visit']).days if pd.notna(account['last_visit']) else 999
            
            # Visit frequency (visits per week over lifetime)
            if pd.notna(account['first_visit']) and pd.notna(account['last_visit']):
                days_span = (account['last_visit'] - account['first_visit']).days
                weeks = max(days_span / 7, 1)
                visits_per_week = account['total_visits'] / weeks
            else:
                visits_per_week = 0
            
            # Multi-rep visits (account has multiple reps visiting - coordination needed?)
            unique_reps = account['reps'] if isinstance(account['reps'], list) else [account['reps']] if pd.notna(account['reps']) else []
            rep_count = len(unique_reps)
            
            # Handle activity_types
            activity_types = account['activity_types'] if isinstance(account['activity_types'], list) else [account['activity_types']] if pd.notna(account['activity_types']) else []
            
            # Status classification for field activity
            status = 'active'
            alert = None
            suggested_action = 'Standard visit'
            
            if days_since > 21:  # 3 weeks no visit
                status = 'at_risk'
                alert = f"No visits in {days_since} days"
                suggested_action = 'Priority visit - re-engage account'
            elif days_since > 14:  # 2 weeks
                status = 'needs_visit'
                alert = f"{days_since} days since last visit"
                suggested_action = 'Schedule routine check-in'
            elif visits_per_week > 2:
                status = 'hot'
                alert = f"High activity ({visits_per_week:.1f} visits/week)"
                suggested_action = 'Capitalize momentum - plan promotion'
            elif rep_count > 1:
                status = 'active'
                alert = f"Multiple reps ({rep_count}) visiting"
                suggested_action = 'Coordinate with team'
            
            insights.append({
                'account_name': account_name,
                'total_visits': account['total_visits'],
                'unique_visit_days': account['unique_visit_days'],
                'visits_per_week': round(visits_per_week, 1),
                'last_visit': account['last_visit'].strftime('%Y-%m-%d') if pd.notna(account['last_visit']) else None,
                'days_since_visit': days_since,
                'reps': unique_reps,
                'rep_count': rep_count,
                'city': account['city'],
                'address': account['address'],
                'activity_types': activity_types,
                'status': status,
                'alert': alert,
                'suggested_action': suggested_action,
                'priority_score': self._calculate_field_priority(days_since, visits_per_week, rep_count, account['total_visits'])
            })
        
        # Sort by priority
        insights.sort(key=lambda x: x['priority_score'], reverse=True)
        return insights
    
    def _calculate_field_priority(self, days_since, visits_per_week, rep_count, total_visits):
        """Calculate priority score for field activity"""
        score = 50  # Base
        
        # Recency weight (missing accounts = high priority)
        if days_since > 30:
            score += 30
        elif days_since > 14:
            score += 20
        elif days_since > 7:
            score += 10
        
        # Momentum weight (high activity = opportunity)
        if visits_per_week > 2:
            score += 15
        elif visits_per_week > 1:
            score += 10
        
        # Total visits weight (established relationships matter)
        score += min(total_visits / 10, 10)
        
        # Multi-rep coordination bonus
        if rep_count > 1:
            score += 5
        
        return min(score, 100)
    
    def _analyze_sales(self, df):
        """Analyze traditional sales data"""
        # Original sales analysis code...
        today = datetime.now()
        thirty_days_ago = today - timedelta(days=30)
        sixty_days_ago = today - timedelta(days=60)
        
        account_stats = df.groupby('account_name').agg({
            'sales_amount': ['sum', 'mean', 'count'],
            'sale_date': ['max', 'min']
        }).reset_index()
        
        account_stats.columns = ['account_name', 'total_revenue', 'avg_order', 
                                  'order_count', 'last_order', 'first_order']
        
        insights = []
        
        for _, account in account_stats.iterrows():
            account_name = account['account_name']
            account_data = df[df['account_name'] == account_name]
            
            # Monthly trend
            monthly = account_data.groupby(account_data['sale_date'].dt.to_period('M'))['sales_amount'].sum()
            
            if len(monthly) >= 2:
                recent_months = monthly.tail(3).mean()
                earlier_months = monthly.head(len(monthly)-3).mean() if len(monthly) > 3 else monthly.iloc[0]
                trend = (recent_months / earlier_months - 1) if earlier_months > 0 else 0
            else:
                trend = 0
            
            # Days since last order
            days_since = (today - account['last_order']).days if pd.notna(account['last_order']) else 999
            
            # Status classification
            status = 'active'
            alert = None
            
            if days_since > 45:
                status = 'at_risk'
                alert = f"No orders in {days_since} days"
            elif trend < -0.3:
                status = 'down'
                alert = f"Revenue down {abs(trend)*100:.0f}% vs earlier period"
            elif trend > 0.3:
                status = 'hot'
                alert = f"Revenue up {trend*100:.0f}% - growth opportunity"
            elif days_since > 30:
                status = 'needs_visit'
                alert = f"{days_since} days since last order"
            
            insights.append({
                'account_name': account_name,
                'total_revenue': account['total_revenue'],
                'avg_order': account['avg_order'],
                'order_count': account['order_count'],
                'last_order': account['last_order'].strftime('%Y-%m-%d') if pd.notna(account['last_order']) else None,
                'days_since_order': days_since,
                'trend_3mo': trend,
                'status': status,
                'alert': alert,
                'priority_score': self._calculate_sales_priority(account, trend, days_since)
            })
        
        insights.sort(key=lambda x: x['priority_score'], reverse=True)
        return insights
    
    def _calculate_sales_priority(self, account, trend, days_since):
        """Original sales priority calculation"""
        score = 50  # Base
        
        # Revenue weight
        revenue_score = min(account['total_revenue'] / 10000, 25)
        score += revenue_score
        
        # Trend weight
        if trend < -0.2:
            score += 20
        elif trend > 0.3:
            score += 15
        
        # Recency weight
        if days_since > 30:
            score += min(days_since / 2, 20)
        
        return min(score, 100)
    
    def generate_route_recommendations(self, accounts_data, rep_location=None, max_stops=5):
        """Generate optimized route for today/next visit - works with both data types"""
        if not accounts_data:
            return []
        
        # Detect data type from first account
        first_account = accounts_data[0]
        is_field_activity = 'total_visits' in first_account
        
        if is_field_activity:
            return self._generate_field_route(accounts_data, max_stops)
        else:
            return self._generate_sales_route(accounts_data, max_stops)
    
    def _generate_field_route(self, accounts_data, max_stops):
        """Generate route for field activity data"""
        # Filter to accounts needing visits
        needs_visit = [a for a in accounts_data 
                      if a['status'] in ['at_risk', 'needs_visit', 'hot']]
        
        # Sort by priority
        needs_visit.sort(key=lambda x: x['priority_score'], reverse=True)
        
        route = []
        for account in needs_visit[:max_stops]:
            route.append({
                'account_name': account['account_name'],
                'priority_score': account['priority_score'],
                'status': account['status'],
                'alert': account['alert'],
                'last_visit': account['last_visit'],
                'days_since_visit': account['days_since_visit'],
                'total_visits': account['total_visits'],
                'visits_per_week': account['visits_per_week'],
                'city': account.get('city', ''),
                'address': account.get('address', ''),
                'reps': account.get('reps', []),
                'suggested_action': account['suggested_action'],
                'estimated_time': '30-45 min'
            })
        
        return route
    
    def _generate_sales_route(self, accounts_data, max_stops):
        """Generate route for sales data"""
        needs_visit = [a for a in accounts_data 
                      if a['status'] in ['at_risk', 'down', 'needs_visit', 'hot']]
        
        needs_visit.sort(key=lambda x: x['priority_score'], reverse=True)
        
        route = []
        for account in needs_visit[:max_stops]:
            route.append({
                'account_name': account['account_name'],
                'priority_score': account['priority_score'],
                'status': account['status'],
                'alert': account['alert'],
                'last_order': account['last_order'],
                'total_revenue': account.get('total_revenue', 0),
                'suggested_action': self._get_action_for_status(account['status']),
                'estimated_time': '30-45 min'
            })
        
        return route
    
    def _get_action_for_status(self, status):
        """Get recommended action based on account status"""
        actions = {
            'at_risk': 'Priority visit - address churn risk',
            'down': 'Investigate decline - offer support/promotions',
            'hot': 'Capitalize on growth - upsell opportunity',
            'needs_visit': 'Relationship maintenance visit',
            'active': 'Routine check-in'
        }
        return actions.get(status, 'Standard visit')
    
    def generate_briefing(self, accounts_data, route_data):
        """Generate morning briefing email/digest - works with both data types"""
        today = datetime.now().strftime('%A, %B %d, %Y')
        
        # Detect data type from first account
        first_account = accounts_data[0] if accounts_data else {}
        is_field_activity = 'total_visits' in first_account
        
        if is_field_activity:
            return self._generate_field_briefing(accounts_data, route_data, today)
        else:
            return self._generate_sales_briefing(accounts_data, route_data, today)
    
    def _generate_field_briefing(self, accounts_data, route_data, today):
        """Generate briefing for field activity data"""
        # Count by status
        status_counts = defaultdict(int)
        total_visits = sum(a.get('total_visits', 0) for a in accounts_data)
        avg_days_since = sum(a.get('days_since_visit', 0) for a in accounts_data) / len(accounts_data) if accounts_data else 0
        
        for a in accounts_data:
            status_counts[a['status']] += 1
        
        # Rep activity summary
        all_reps = set()
        for a in accounts_data:
            reps = a.get('reps', [])
            if isinstance(reps, list):
                all_reps.update(reps)
            else:
                all_reps.add(str(reps))
        
        briefing = {
            'date': today,
            'data_type': 'field_activity',
            'summary': {
                'total_accounts': len(accounts_data),
                'total_visits': total_visits,
                'avg_days_since_visit': round(avg_days_since, 1),
                'hot': status_counts.get('hot', 0),
                'active': status_counts.get('active', 0),
                'needs_visit': status_counts.get('needs_visit', 0),
                'at_risk': status_counts.get('at_risk', 0),
                'unique_reps': len(all_reps)
            },
            'top_priorities': route_data[:3] if route_data else [],
            'full_route': route_data,
            'rep_activity': list(all_reps),
            'insights': self._generate_field_insights(accounts_data),
            'generated_at': datetime.now().isoformat()
        }
        
        return briefing
    
    def _generate_field_insights(self, accounts_data):
        """Generate natural language insights for field activity"""
        insights = []
        
        at_risk = [a for a in accounts_data if a['status'] == 'at_risk']
        if at_risk:
            insights.append(f"🚨 {len(at_risk)} accounts haven't been visited in 21+ days")
        
        hot = [a for a in accounts_data if a['status'] == 'hot']
        if hot:
            insights.append(f"🔥 {len(hot)} accounts showing high visit activity (opportunity)")
        
        needs_visit = [a for a in accounts_data if a['status'] == 'needs_visit']
        if needs_visit:
            insights.append(f"📍 {len(needs_visit)} accounts due for routine visit (14+ days)")
        
        multi_rep = [a for a in accounts_data if a.get('rep_count', 0) > 1]
        if multi_rep:
            insights.append(f"👥 {len(multi_rep)} accounts visited by multiple reps (coordinate)")
        
        # Geographic insight if cities available
        cities = [a.get('city', '') for a in accounts_data if a.get('city')]
        if cities:
            city_counts = defaultdict(int)
            for city in cities:
                if city:
                    city_counts[city] += 1
            if city_counts:
                top_city = max(city_counts.items(), key=lambda x: x[1])
                insights.append(f"📍 Top territory: {top_city[0]} ({top_city[1]} accounts)")
        
        return insights
    
    def _generate_sales_briefing(self, accounts_data, route_data, today):
        """Generate briefing for sales data"""
        # Count by status
        status_counts = defaultdict(int)
        for a in accounts_data:
            status_counts[a['status']] += 1
        
        briefing = {
            'date': today,
            'data_type': 'sales',
            'summary': {
                'total_accounts': len(accounts_data),
                'active': status_counts.get('active', 0),
                'hot': status_counts.get('hot', 0),
                'needs_visit': status_counts.get('needs_visit', 0),
                'at_risk': status_counts.get('at_risk', 0),
                'down': status_counts.get('down', 0)
            },
            'top_priorities': route_data[:3] if route_data else [],
            'full_route': route_data,
            'insights': self._generate_insights_text(accounts_data),
            'generated_at': datetime.now().isoformat()
        }
        
        return briefing
    
    def _generate_insights_text(self, accounts_data):
        """Generate natural language insights"""
        insights = []
        
        at_risk = [a for a in accounts_data if a['status'] == 'at_risk']
        if at_risk:
            insights.append(f"🚨 {len(at_risk)} accounts at risk of churning")
        
        hot = [a for a in accounts_data if a['status'] == 'hot']
        if hot:
            insights.append(f"🔥 {len(hot)} accounts showing growth momentum")
        
        down = [a for a in accounts_data if a['status'] == 'down']
        if down:
            insights.append(f"📉 {len(down)} accounts with declining revenue")
        
        no_order = [a for a in accounts_data if a['days_since_order'] > 45]
        if no_order:
            insights.append(f"⏰ {len(no_order)} accounts haven't ordered in 45+ days")
        
        return insights
    
    def save_outputs(self, accounts_data, route_data, briefing):
        """Save all outputs to JSON for dashboard/email consumption"""
        output_dir = Path(self.config['output_dir'])
        output_dir.mkdir(parents=True, exist_ok=True)
        
        today = datetime.now().strftime('%Y-%m-%d')
        
        # Account status
        with open(output_dir / f'accounts_{today}.json', 'w') as f:
            json.dump(accounts_data, f, indent=2, default=str)
        
        # Route recommendation
        with open(output_dir / f'route_{today}.json', 'w') as f:
            json.dump(route_data, f, indent=2)
        
        # Briefing
        with open(output_dir / f'briefing_{today}.json', 'w') as f:
            json.dump(briefing, f, indent=2)
        
        # Latest files (overwritten each run)
        with open(output_dir / 'accounts_latest.json', 'w') as f:
            json.dump(accounts_data, f, indent=2, default=str)
        with open(output_dir / 'route_latest.json', 'w') as f:
            json.dump(route_data, f, indent=2)
        with open(output_dir / 'briefing_latest.json', 'w') as f:
            json.dump(briefing, f, indent=2)
        
        print(f"✅ Saved outputs to {output_dir}")
        return output_dir
    
    def run(self, source='excel'):
        """Main execution flow"""
        print("🎯 Scout Agent Starting...")
        print(f"📅 {datetime.now().strftime('%Y-%m-%d %H:%M')}")
        print("-" * 50)
        
        # Load data
        print(f"📊 Loading data from {source}...")
        df = self.load_data(source)
        
        if df.empty:
            print("❌ No data loaded")
            return None
        
        print(f"✅ Loaded {len(df)} records")
        
        # Process
        print("🔍 Analyzing accounts...")
        accounts_data = self.analyze_accounts(df)
        print(f"✅ Analyzed {len(accounts_data)} accounts")
        
        # Generate route
        print("🗺️ Generating route recommendations...")
        route_data = self.generate_route_recommendations(accounts_data)
        print(f"✅ Generated route with {len(route_data)} stops")
        
        # Create briefing
        print("📋 Creating briefing...")
        briefing = self.generate_briefing(accounts_data, route_data)
        
        # Save outputs
        print("💾 Saving outputs...")
        output_dir = self.save_outputs(accounts_data, route_data, briefing)
        
        print("-" * 50)
        print("✨ Scout analysis complete!")
        print(f"📁 Output: {output_dir}")
        
        return {
            'accounts': accounts_data,
            'route': route_data,
            'briefing': briefing
        }


if __name__ == "__main__":
    import sys
    
    # Allow config path from command line
    config_path = sys.argv[1] if len(sys.argv) > 1 else None
    source = sys.argv[2] if len(sys.argv) > 2 else 'excel'
    
    scout = ScoutAgent(config_path)
    results = scout.run(source)
    
    if results:
        # Print summary
        print("\n📊 SUMMARY:")
        print(f"Accounts analyzed: {len(results['accounts'])}")
        print(f"Route stops: {len(results['route'])}")
        print(f"\nTop Priority: {results['route'][0]['account_name'] if results['route'] else 'None'}")
