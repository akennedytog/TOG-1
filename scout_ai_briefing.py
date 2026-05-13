#!/usr/bin/env python3
"""
Scout AI Briefing - Daily intelligence and recommendations
"""

import json
import os
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from dataclasses import dataclass

from scout_db import ScoutDatabase, db, Deal, Task, Activity, Contact, Account

# Load OpenAI for AI analysis
try:
    import openai
    openai_loaded = True
except ImportError:
    openai_loaded = False

# Load dotenv
from pathlib import Path
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

@dataclass
class BriefingItem:
    type: str  # 'call', 'follow_up', 'at_risk', 'opportunity', 'task', 'insight'
    priority: str  # 'urgent', 'high', 'medium', 'low'
    title: str
    description: str
    entity_id: Optional[str] = None  # deal_id, contact_id, etc.
    entity_type: Optional[str] = None  # 'deal', 'contact', 'account'
    reason: Optional[str] = None
    suggested_action: Optional[str] = None

class ScoutAIBriefing:
    """AI-powered daily briefing generator"""
    
    def __init__(self, database: ScoutDatabase = db):
        self.db = database
        self.openai_key = os.getenv('OPENAI_API_KEY')
    
    def generate_daily_briefing(self, owner_id: Optional[str] = None) -> Dict:
        """Generate complete daily briefing"""
        briefing = {
            'generated_at': datetime.now().isoformat(),
            'owner_id': owner_id,
            'summary': {},
            'priority_actions': [],
            'insights': [],
            'metrics': {}
        }
        
        # Gather raw data
        data = self._gather_data(owner_id)
        briefing['metrics'] = data['metrics']
        
        # Generate AI-powered insights
        if openai_loaded and self.openai_key:
            ai_insights = self._generate_ai_insights(data)
            briefing['insights'] = ai_insights
        
        # Rule-based priority detection
        priorities = self._detect_priorities(data)
        briefing['priority_actions'] = priorities
        
        # Generate summary
        briefing['summary'] = self._generate_summary(data, priorities)
        
        return briefing
    
    def _gather_data(self, owner_id: Optional[str]) -> Dict:
        """Gather all relevant data for briefing"""
        today = datetime.now()
        yesterday = today - timedelta(days=1)
        week_ago = today - timedelta(days=7)
        
        data = {
            'today': today,
            'deals': {},
            'tasks': {},
            'activities': {},
            'contacts': {},
            'metrics': {}
        }
        
        # Deals
        all_deals = self.db.list_deals(owner_id=owner_id)
        data['deals']['all'] = all_deals
        data['deals']['active'] = [d for d in all_deals if d.stage not in ['closed_won', 'closed_lost']]
        data['deals']['closing_this_month'] = [
            d for d in all_deals 
            if d.expected_close_date and 
            d.expected_close_date.startswith(today.strftime('%Y-%m'))
        ]
        data['deals']['stalled'] = [
            d for d in all_deals
            if d.stage not in ['closed_won', 'closed_lost']
            and d.updated_at < (today - timedelta(days=14)).isoformat()
        ]
        
        # Tasks
        due_today = self.db.get_tasks(
            owner_id=owner_id,
            status='open',
            due_before=today.strftime('%Y-%m-%d'),
            limit=50
        )
        data['tasks']['due_today'] = due_today
        data['tasks']['overdue'] = [
            t for t in due_today 
            if t.due_date and t.due_date < today.strftime('%Y-%m-%d')
        ]
        
        # Activities
        week_activities = self.db.get_activities(
            owner_id=owner_id,
            limit=100
        )
        data['activities']['this_week'] = [
            a for a in week_activities 
            if a.created_at > week_ago.isoformat()
        ]
        data['activities']['yesterday'] = [
            a for a in week_activities
            if a.created_at > yesterday.strftime('%Y-%m-%d')
        ]
        
        # Contacts needing attention
        contacts = self.db.list_contacts(owner_id=owner_id, limit=200)
        data['contacts']['all'] = contacts
        data['contacts']['no_activity_30d'] = []
        
        for contact in contacts:
            activities = self.db.get_activities(contact_id=contact.id, limit=1)
            if not activities or activities[0].created_at < (today - timedelta(days=30)).isoformat():
                data['contacts']['no_activity_30d'].append(contact)
        
        # Calculate metrics
        data['metrics'] = {
            'total_pipeline': sum(d.value for d in data['deals']['active']),
            'deals_closing_this_month': len(data['deals']['closing_this_month']),
            'tasks_due_today': len(due_today),
            'tasks_overdue': len(data['tasks']['overdue']),
            'stalled_deals': len(data['deals']['stalled']),
            'activities_this_week': len(data['activities']['this_week']),
            'contacts_no_activity': len(data['contacts']['no_activity_30d'])
        }
        
        return data
    
    def _detect_priorities(self, data: Dict) -> List[BriefingItem]:
        """Detect priority actions based on rules"""
        priorities = []
        
        # Urgent: Overdue tasks
        for task in data['tasks']['overdue']:
            priorities.append(BriefingItem(
                type='task',
                priority='urgent',
                title=f"Overdue: {task.title}",
                description=task.description or '',
                entity_id=task.id,
                entity_type='task',
                reason=f"Due {task.due_date}",
                suggested_action="Complete or reschedule"
            ))
        
        # High: Deals closing this week with no recent activity
        today = data['today']
        for deal in data['deals']['closing_this_month']:
            activities = self.db.get_activities(deal_id=deal.id, limit=1)
            if not activities or activities[0].created_at < (today - timedelta(days=7)).isoformat():
                priorities.append(BriefingItem(
                    type='follow_up',
                    priority='high',
                    title=f"Follow up: {deal.name}",
                    description=f"${deal.value:,.0f} deal closing soon",
                    entity_id=deal.id,
                    entity_type='deal',
                    reason=f"Expected close: {deal.expected_close_date}",
                    suggested_action="Schedule check-in call"
                ))
        
        # High: Stalled deals
        for deal in data['deals']['stalled'][:3]:
            priorities.append(BriefingItem(
                type='at_risk',
                priority='high',
                title=f"Stalled: {deal.name}",
                description=f"No activity for 14+ days",
                entity_id=deal.id,
                entity_type='deal',
                reason=f"Stage: {deal.stage}",
                suggested_action="Re-engage with value-add message"
            ))
        
        # Medium: Contacts with no activity
        for contact in data['contacts']['no_activity_30d'][:5]:
            account = self.db.get_account(contact.account_id) if contact.account_id else None
            priorities.append(BriefingItem(
                type='call',
                priority='medium',
                title=f"Touch base: {contact.first_name} {contact.last_name}",
                description=f"{account.name if account else 'No account'} - No contact in 30 days",
                entity_id=contact.id,
                entity_type='contact',
                reason="Relationship maintenance",
                suggested_action="Send helpful content or check-in"
            ))
        
        # Sort by priority
        priority_order = {'urgent': 0, 'high': 1, 'medium': 2, 'low': 3}
        priorities.sort(key=lambda x: priority_order.get(x.priority, 4))
        
        return priorities
    
    def _generate_ai_insights(self, data: Dict) -> List[Dict]:
        """Generate AI-powered insights using OpenAI"""
        if not openai_loaded or not self.openai_key:
            return []
        
        openai.api_key = self.openai_key
        
        # Build context for AI
        context = {
            'deals': [
                {
                    'name': d.name,
                    'stage': d.stage,
                    'value': d.value,
                    'probability': d.probability,
                    'expected_close': d.expected_close_date
                }
                for d in data['deals']['active'][:10]
            ],
            'metrics': data['metrics'],
            'activities_count': len(data['activities']['this_week'])
        }
        
        prompt = f"""You are a sales coach analyzing this week's pipeline.

Pipeline Summary:
- Total pipeline: ${context['metrics']['total_pipeline']:,.0f}
- Active deals: {len(data['deals']['active'])}
- Deals closing this month: {context['metrics']['deals_closing_this_month']}
- Stalled deals (14+ days no activity): {context['metrics']['stalled_deals']}
- Activities this week: {context['activities_count']}

Top Active Deals:
{json.dumps(context['deals'], indent=2)}

Provide 2-3 specific, actionable insights in JSON format:
[
  {{
    "type": "risk|opportunity|pattern",
    "title": "Short insight title",
    "description": "Detailed explanation",
    "recommended_action": "Specific next step"
  }}
]

Focus on:
1. Pipeline risks (deals at risk of stalling or losing)
2. Opportunities (quick wins, upsell potential)
3. Patterns (trends in your sales activity)

Be specific and actionable."""
        
        try:
            response = openai.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are an expert sales coach. Provide concise, actionable insights."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                response_format={"type": "json_object"}
            )
            
            result = json.loads(response.choices[0].message.content)
            return result.get('insights', [])
        except Exception as e:
            print(f"AI insight generation failed: {e}")
            return []
    
    def _generate_summary(self, data: Dict, priorities: List[BriefingItem]) -> Dict:
        """Generate human-readable summary"""
        today = data['today']
        
        urgent_count = len([p for p in priorities if p.priority == 'urgent'])
        high_count = len([p for p in priorities if p.priority == 'high'])
        medium_count = len([p for p in priorities if p.priority == 'medium'])
        
        # Determine focus area
        focus = ""
        if urgent_count > 0:
            focus = f"You have {urgent_count} urgent items requiring immediate attention."
        elif data['metrics']['stalled_deals'] > 3:
            focus = f"You have {data['metrics']['stalled_deals']} stalled deals that need re-engagement."
        elif data['metrics']['deals_closing_this_month'] > 0:
            focus = f"You have {data['metrics']['deals_closing_this_month']} deals closing this month."
        else:
            focus = "Focus on prospecting and building pipeline this week."
        
        return {
            'greeting': f"Good {self._get_time_of_day(today)}, Alec",
            'focus': focus,
            'stats': {
                'urgent': urgent_count,
                'high': high_count,
                'medium': medium_count,
                'pipeline_value': data['metrics']['total_pipeline']
            },
            'top_priority': priorities[0].title if priorities else "No urgent priorities"
        }
    
    def _get_time_of_day(self, dt: datetime) -> str:
        """Get time of day greeting"""
        hour = dt.hour
        if hour < 12:
            return "morning"
        elif hour < 17:
            return "afternoon"
        else:
            return "evening"
    
    def get_deal_velocity(self, deal_id: str) -> Dict:
        """Calculate deal velocity metrics"""
        deal = self.db.get_deal(deal_id)
        if not deal:
            return None
        
        activities = self.db.get_activities(deal_id=deal_id, limit=100)
        
        if len(activities) < 2:
            return {
                'deal_id': deal_id,
                'deal_name': deal.name,
                'velocity_score': None,
                'days_in_stage': (datetime.now() - datetime.fromisoformat(deal.created_at)).days,
                'activity_frequency': 'low',
                'trend': 'insufficient_data'
            }
        
        # Sort by date
        activities.sort(key=lambda a: a.created_at)
        
        # Calculate days between first and last activity
        first_activity = datetime.fromisoformat(activities[0].created_at)
        last_activity = datetime.fromisoformat(activities[-1].created_at)
        total_days = (last_activity - first_activity).days
        
        # Activity frequency (activities per week)
        if total_days > 0:
            activity_per_week = (len(activities) / total_days) * 7
        else:
            activity_per_week = len(activities)
        
        # Days in current stage
        stage_activities = [a for a in activities if a.created_at >= (datetime.now() - timedelta(days=30)).isoformat()]
        if stage_activities:
            last_stage_change = max(datetime.fromisoformat(a.created_at) for a in stage_activities)
            days_in_stage = (datetime.now() - last_stage_change).days
        else:
            days_in_stage = (datetime.now() - datetime.fromisoformat(deal.created_at)).days
        
        # Velocity score (0-100)
        # Higher is better - based on activity frequency and stage progression
        velocity_score = min(100, int(activity_per_week * 10))
        
        # Trend
        if activity_per_week >= 2:
            trend = 'accelerating'
        elif activity_per_week >= 1:
            trend = 'stable'
        else:
            trend = 'slowing'
        
        return {
            'deal_id': deal_id,
            'deal_name': deal.name,
            'velocity_score': velocity_score,
            'activity_per_week': round(activity_per_week, 1),
            'days_in_stage': days_in_stage,
            'total_activities': len(activities),
            'activity_frequency': 'high' if activity_per_week >= 2 else 'medium' if activity_per_week >= 1 else 'low',
            'trend': trend,
            'created_at': deal.created_at,
            'stage': deal.stage
        }
    
    def get_win_loss_analysis(self, owner_id: Optional[str] = None, 
                             days: int = 90) -> Dict:
        """Analyze win/loss patterns"""
        all_deals = self.db.list_deals(owner_id=owner_id)
        
        cutoff = (datetime.now() - timedelta(days=days)).isoformat()
        
        closed_won = [d for d in all_deals if d.stage == 'closed_won' and d.actual_close_date and d.actual_close_date > cutoff]
        closed_lost = [d for d in all_deals if d.stage == 'closed_lost' and d.actual_close_date and d.actual_close_date > cutoff]
        
        total_closed = len(closed_won) + len(closed_lost)
        
        if total_closed == 0:
            return {
                'period_days': days,
                'total_closed': 0,
                'win_rate': None,
                'avg_deal_size': None,
                'avg_sales_cycle': None,
                'common_loss_reasons': []
            }
        
        win_rate = (len(closed_won) / total_closed) * 100
        avg_deal_size = sum(d.value for d in closed_won) / len(closed_won) if closed_won else 0
        
        # Average sales cycle (days from creation to close)
        cycles = []
        for deal in closed_won:
            created = datetime.fromisoformat(deal.created_at)
            closed = datetime.fromisoformat(deal.actual_close_date) if deal.actual_close_date else datetime.now()
            cycles.append((closed - created).days)
        
        avg_cycle = sum(cycles) / len(cycles) if cycles else 0
        
        return {
            'period_days': days,
            'total_closed': total_closed,
            'won': len(closed_won),
            'lost': len(closed_lost),
            'win_rate': round(win_rate, 1),
            'avg_deal_size': round(avg_deal_size, 2),
            'avg_sales_cycle_days': round(avg_cycle, 0),
            'total_revenue': sum(d.value for d in closed_won)
        }
    
    def calculate_deal_score(self, deal_id: str) -> Dict:
        """Calculate comprehensive deal score (0-100)"""
        deal = self.db.get_deal(deal_id)
        if not deal:
            return None
        
        now = datetime.now()
        
        # Get context
        activities = self.db.get_activities(deal_id=deal_id, limit=20)
        account = self.db.get_account(deal.account_id) if deal.account_id else None
        
        score_components = {}
        
        # 1. Activity recency (0-25 points)
        if activities:
            last_activity = max(datetime.fromisoformat(a.created_at) for a in activities)
            days_since = (now - last_activity).days
            if days_since <= 2:
                score_components['activity_recency'] = 25
            elif days_since <= 7:
                score_components['activity_recency'] = 20
            elif days_since <= 14:
                score_components['activity_recency'] = 15
            elif days_since <= 30:
                score_components['activity_recency'] = 10
            else:
                score_components['activity_recency'] = 5
        else:
            score_components['activity_recency'] = 0
        
        # 2. Stage progression (0-25 points)
        stage_scores = {
            'prospecting': 5,
            'qualification': 10,
            'proposal': 15,
            'negotiation': 20,
            'closed_won': 25,
            'closed_lost': 0
        }
        score_components['stage'] = stage_scores.get(deal.stage, 5)
        
        # 3. Activity frequency (0-20 points)
        if len(activities) >= 10:
            score_components['activity_frequency'] = 20
        elif len(activities) >= 5:
            score_components['activity_frequency'] = 15
        elif len(activities) >= 3:
            score_components['activity_frequency'] = 10
        elif len(activities) >= 1:
            score_components['activity_frequency'] = 5
        else:
            score_components['activity_frequency'] = 0
        
        # 4. Deal value (0-15 points) - log scale
        if deal.value >= 50000:
            score_components['deal_value'] = 15
        elif deal.value >= 20000:
            score_components['deal_value'] = 12
        elif deal.value >= 10000:
            score_components['deal_value'] = 9
        elif deal.value >= 5000:
            score_components['deal_value'] = 6
        elif deal.value > 0:
            score_components['deal_value'] = 3
        else:
            score_components['deal_value'] = 0
        
        # 5. Account health (0-15 points)
        if account and account.health_score:
            score_components['account_health'] = int(account.health_score * 0.15)
        else:
            score_components['account_health'] = 7  # Neutral
        
        # Calculate total score
        total_score = sum(score_components.values())
        
        # Determine risk category
        if total_score >= 70:
            risk_category = 'On Track'
            risk_color = 'green'
        elif total_score >= 40:
            risk_category = 'Needs Attention'
            risk_color = 'yellow'
        else:
            risk_category = 'At Risk'
            risk_color = 'red'
        
        # Calculate close probability based on score
        base_probability = min(100, int(total_score * 1.2))
        
        return {
            'deal_id': deal_id,
            'deal_name': deal.name,
            'total_score': total_score,
            'components': score_components,
            'risk_category': risk_category,
            'risk_color': risk_color,
            'predicted_close_probability': base_probability,
            'recommendation': self._get_deal_recommendation(total_score, deal.stage)
        }
    
    def _get_deal_recommendation(self, score: int, stage: str) -> str:
        """Get recommendation based on score"""
        if score >= 70:
            return "Deal is healthy. Maintain momentum and push for close."
        elif score >= 50:
            return "Deal needs attention. Schedule activity to advance."
        elif score >= 30:
            return "Deal at risk. Identify blockers and re-engage decision makers."
        else:
            return "Deal critical. Consider qualification review or nurture sequence."
    
    def score_all_deals(self, owner_id: Optional[str] = None) -> List[Dict]:
        """Score all active deals"""
        deals = self.db.list_deals(owner_id=owner_id)
        active_deals = [d for d in deals if d.stage not in ['closed_won', 'closed_lost']]
        
        scored_deals = []
        for deal in active_deals:
            score = self.calculate_deal_score(deal.id)
            if score:
                scored_deals.append(score)
        
        # Sort by score (highest first)
        scored_deals.sort(key=lambda x: x['total_score'], reverse=True)
        
        return scored_deals
    
    def get_score_distribution(self, owner_id: Optional[str] = None) -> Dict:
        """Get distribution of deal scores"""
        scores = self.score_all_deals(owner_id)
        
        distribution = {
            'on_track': len([s for s in scores if s['risk_category'] == 'On Track']),
            'needs_attention': len([s for s in scores if s['risk_category'] == 'Needs Attention']),
            'at_risk': len([s for s in scores if s['risk_category'] == 'At Risk'])
        }
        
        avg_score = sum(s['total_score'] for s in scores) / len(scores) if scores else 0
        
        return {
            'distribution': distribution,
            'total_scored': len(scores),
            'average_score': round(avg_score, 1)
        }


# Singleton instance
ai_briefing = ScoutAIBriefing()


if __name__ == "__main__":
    print("Generating daily briefing...")
    
    briefing = ai_briefing.generate_daily_briefing()
    
    print(f"\n{briefing['summary']['greeting']}")
    print(f"Focus: {briefing['summary']['focus']}")
    print(f"\nTop Priority: {briefing['summary']['top_priority']}")
    
    print(f"\n📊 Metrics:")
    for key, value in briefing['metrics'].items():
        print(f"  {key}: {value}")
    
    print(f"\n🎯 Priority Actions ({len(briefing['priority_actions'])}):")
    for item in briefing['priority_actions'][:5]:
        print(f"  [{item.priority.upper()}] {item.title}")
        print(f"      {item.reason}")
        print(f"      → {item.suggested_action}")
    
    if briefing['insights']:
        print(f"\n💡 AI Insights:")
        for insight in briefing['insights']:
            print(f"  {insight.get('title', '')}")
            print(f"    {insight.get('description', '')}")
    
    # Test velocity
    print("\n" + "="*50)
    print("Testing deal velocity...")
    
    deals = db.list_deals(limit=5)
    for deal in deals:
        velocity = ai_briefing.get_deal_velocity(deal.id)
        if velocity:
            print(f"\n{velocity['deal_name']}: {velocity['velocity_score']}/100")
            print(f"  {velocity['activity_per_week']} activities/week, {velocity['days_in_stage']} days in stage")
            print(f"  Trend: {velocity['trend']}")
