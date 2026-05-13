#!/usr/bin/env python3
"""
Scout AI Task Suggestions - Intelligent follow-up recommendations
"""

import json
import os
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from dataclasses import dataclass

from scout_db import ScoutDatabase, db, Task, Deal, Contact, Activity

try:
    import openai
    openai_loaded = True
except ImportError:
    openai_loaded = False

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
class TaskSuggestion:
    title: str
    description: str
    priority: str
    due_date: Optional[str]
    reason: str
    entity_type: str  # 'deal', 'contact', 'account'
    entity_id: Optional[str]
    suggested_action: str

class ScoutAITasks:
    """AI-powered task suggestion engine"""
    
    def __init__(self, database: ScoutDatabase = db):
        self.db = database
        self.openai_key = os.getenv('OPENAI_API_KEY')
    
    def generate_all_suggestions(self, owner_id: Optional[str] = None) -> List[TaskSuggestion]:
        """Generate task suggestions across all areas"""
        suggestions = []
        
        # Deal-based suggestions
        suggestions.extend(self._suggest_deal_tasks(owner_id))
        
        # Contact-based suggestions
        suggestions.extend(self._suggest_contact_tasks(owner_id))
        
        # Win-back opportunities
        suggestions.extend(self._suggest_win_back_tasks(owner_id))
        
        # Sort by priority
        priority_order = {'urgent': 0, 'high': 1, 'medium': 2, 'low': 3}
        suggestions.sort(key=lambda x: priority_order.get(x.priority, 4))
        
        return suggestions
    
    def _suggest_deal_tasks(self, owner_id: Optional[str]) -> List[TaskSuggestion]:
        """Generate tasks based on deal status"""
        suggestions = []
        now = datetime.now()
        
        deals = self.db.list_deals(owner_id=owner_id)
        
        for deal in deals:
            if deal.stage in ['closed_won', 'closed_lost']:
                continue
            
            # Get recent activities
            activities = self.db.get_activities(deal_id=deal.id, limit=1)
            last_activity = activities[0] if activities else None
            
            days_since_activity = 999
            if last_activity:
                last_date = datetime.fromisoformat(last_activity.created_at)
                days_since_activity = (now - last_date).days
            
            # Rule 1: Proposal stage, no activity in 3 days
            if deal.stage == 'proposal' and days_since_activity >= 3:
                suggestions.append(TaskSuggestion(
                    title=f"Follow up on {deal.name} proposal",
                    description=f"Deal in proposal stage for {days_since_activity} days. Check status and address concerns.",
                    priority='high',
                    due_date=(now + timedelta(days=1)).strftime('%Y-%m-%d'),
                    reason=f"Proposal sent, no activity for {days_since_activity} days",
                    entity_type='deal',
                    entity_id=deal.id,
                    suggested_action="Send follow-up email asking for feedback"
                ))
            
            # Rule 2: Negotiation stage, no activity in 5 days
            elif deal.stage == 'negotiation' and days_since_activity >= 5:
                suggestions.append(TaskSuggestion(
                    title=f"Re-engage: {deal.name}",
                    description=f"Negotiation stalled. Identify blockers and offer concessions.",
                    priority='urgent',
                    due_date=now.strftime('%Y-%m-%d'),
                    reason="Negotiation stuck for 5+ days",
                    entity_type='deal',
                    entity_id=deal.id,
                    suggested_action="Schedule call to discuss blockers"
                ))
            
            # Rule 3: Deal closing this week, no recent activity
            if deal.expected_close_date:
                close_date = datetime.fromisoformat(deal.expected_close_date)
                days_until_close = (close_date - now).days
                
                if days_until_close <= 7 and days_since_activity >= 2:
                    suggestions.append(TaskSuggestion(
                        title=f"Check-in: {deal.name} (closes in {days_until_close} days)",
                        description=f"Deal closing soon. Confirm timeline and next steps.",
                        priority='high',
                        due_date=now.strftime('%Y-%m-%d'),
                        reason=f"Expected close: {deal.expected_close_date}",
                        entity_type='deal',
                        entity_id=deal.id,
                        suggested_action="Confirm close date and requirements"
                    ))
            
            # Rule 4: Qualification stage, no activity in 7 days
            elif deal.stage == 'qualification' and days_since_activity >= 7:
                suggestions.append(TaskSuggestion(
                    title=f"Qualify: {deal.name}",
                    description="Need to complete qualification questions and identify decision makers.",
                    priority='medium',
                    due_date=(now + timedelta(days=2)).strftime('%Y-%m-%d'),
                    reason="Qualification incomplete for 7+ days",
                    entity_type='deal',
                    entity_id=deal.id,
                    suggested_action="Schedule discovery call"
                ))
        
        return suggestions
    
    def _suggest_contact_tasks(self, owner_id: Optional[str]) -> List[TaskSuggestion]:
        """Generate tasks based on contact activity"""
        suggestions = []
        now = datetime.now()
        
        contacts = self.db.list_contacts(owner_id=owner_id, limit=200)
        
        for contact in contacts:
            # Get last activity
            activities = self.db.get_activities(contact_id=contact.id, limit=1)
            last_activity = activities[0] if activities else None
            
            if not last_activity:
                # Never contacted - suggest introduction
                suggestions.append(TaskSuggestion(
                    title=f"Introduce yourself to {contact.first_name} {contact.last_name}",
                    description=f"New contact from {contact.source or 'unknown source'}. Send welcome message.",
                    priority='medium',
                    due_date=(now + timedelta(days=3)).strftime('%Y-%m-%d'),
                    reason="Never contacted",
                    entity_type='contact',
                    entity_id=contact.id,
                    suggested_action="Send personalized welcome email"
                ))
                continue
            
            last_date = datetime.fromisoformat(last_activity.created_at)
            days_since = (now - last_date).days
            
            # No activity in 30 days
            if days_since >= 30:
                account = self.db.get_account(contact.account_id) if contact.account_id else None
                suggestions.append(TaskSuggestion(
                    title=f"Re-engage: {contact.first_name} {contact.last_name}",
                    description=f"No contact in {days_since} days. {account.name if account else ''}",
                    priority='medium',
                    due_date=(now + timedelta(days=2)).strftime('%Y-%m-%d'),
                    reason=f"Last contact {days_since} days ago",
                    entity_type='contact',
                    entity_id=contact.id,
                    suggested_action="Send helpful content or check-in"
                ))
            
            # No activity in 60 days - higher priority
            if days_since >= 60:
                suggestions.append(TaskSuggestion(
                    title=f"Risk: {contact.first_name} {contact.last_name} cooling",
                    description=f"No contact in {days_since} days. Risk of relationship decay.",
                    priority='high',
                    due_date=now.strftime('%Y-%m-%d'),
                    reason=f"Last contact {days_since} days ago",
                    entity_type='contact',
                    entity_id=contact.id,
                    suggested_action="Schedule personal outreach call"
                ))
        
        return suggestions
    
    def _suggest_win_back_tasks(self, owner_id: Optional[str]) -> List[TaskSuggestion]:
        """Suggest win-back campaigns for lost deals"""
        suggestions = []
        now = datetime.now()
        
        # Get lost deals from 90-120 days ago
        all_deals = self.db.list_deals(owner_id=owner_id)
        
        for deal in all_deals:
            if deal.stage != 'closed_lost' or not deal.actual_close_date:
                continue
            
            lost_date = datetime.fromisoformat(deal.actual_close_date)
            days_since_loss = (now - lost_date).days
            
            if 90 <= days_since_loss <= 120:
                contact = self.db.get_contact(deal.contact_id) if deal.contact_id else None
                if contact:
                    suggestions.append(TaskSuggestion(
                        title=f"Win-back: {deal.name}",
                        description=f"Deal lost {days_since_loss} days ago. Check if circumstances changed.",
                        priority='medium',
                        due_date=(now + timedelta(days=3)).strftime('%Y-%m-%d'),
                        reason=f"Lost {days_since_loss} days ago - good time to re-engage",
                        entity_type='deal',
                        entity_id=deal.id,
                        suggested_action="Send 'checking in' email with new offerings"
                    ))
        
        return suggestions
    
    def create_suggested_tasks(self, suggestions: List[TaskSuggestion], 
                               owner_id: Optional[str] = None) -> List[Task]:
        """Create tasks in database from suggestions"""
        created_tasks = []
        
        for suggestion in suggestions:
            # Check if similar task already exists
            existing = self.db.get_tasks(
                deal_id=suggestion.entity_id if suggestion.entity_type == 'deal' else None,
                contact_id=suggestion.entity_id if suggestion.entity_type == 'contact' else None,
                status='open',
                limit=10
            )
            
            # Skip if similar task exists
            if any(t.title.lower() == suggestion.title.lower() for t in existing):
                continue
            
            task = Task(
                id=f"ai_task_{datetime.now().timestamp()}_{len(created_tasks)}",
                title=suggestion.title,
                description=suggestion.description,
                contact_id=suggestion.entity_id if suggestion.entity_type == 'contact' else None,
                deal_id=suggestion.entity_id if suggestion.entity_type == 'deal' else None,
                owner_id=owner_id,
                priority=suggestion.priority,
                due_date=suggestion.due_date,
                ai_suggested=True,
                ai_reason=suggestion.reason
            )
            
            self.db.create_task(task)
            created_tasks.append(task)
        
        return created_tasks
    
    def get_ai_suggested_tasks(self, owner_id: Optional[str] = None) -> List[Task]:
        """Get all AI-suggested tasks that haven't been created yet"""
        suggestions = self.generate_all_suggestions(owner_id)
        
        # Filter out suggestions that already have tasks
        filtered = []
        for suggestion in suggestions:
            existing = self.db.get_tasks(
                deal_id=suggestion.entity_id if suggestion.entity_type == 'deal' else None,
                contact_id=suggestion.entity_id if suggestion.entity_type == 'contact' else None,
                status='open',
                limit=10
            )
            
            if not any(t.title.lower() == suggestion.title.lower() for t in existing):
                filtered.append(suggestion)
        
        return filtered
    
    def generate_ai_enhanced_suggestions(self, deal_id: str) -> List[Dict]:
        """Use OpenAI to generate enhanced suggestions for a specific deal"""
        if not openai_loaded or not self.openai_key:
            return []
        
        deal = self.db.get_deal(deal_id)
        if not deal:
            return []
        
        # Get context
        activities = self.db.get_activities(deal_id=deal_id, limit=10)
        contact = self.db.get_contact(deal.contact_id) if deal.contact_id else None
        account = self.db.get_account(deal.account_id) if deal.account_id else None
        
        context = {
            'deal_name': deal.name,
            'stage': deal.stage,
            'value': deal.value,
            'probability': deal.probability,
            'expected_close': deal.expected_close_date,
            'contact': f"{contact.first_name} {contact.last_name}" if contact else 'Unknown',
            'account': account.name if account else 'Unknown',
            'recent_activities': [
                {
                    'type': a.type,
                    'subject': a.subject,
                    'created_at': a.created_at
                }
                for a in activities[:5]
            ]
        }
        
        openai.api_key = self.openai_key
        
        prompt = f"""You are a sales coach. Based on this deal data, suggest 2-3 specific next actions.

Deal: {json.dumps(context, indent=2)}

Provide suggestions in JSON format:
{{
  "suggestions": [
    {{
      "title": "Brief task title",
      "description": "Detailed explanation",
      "priority": "low|medium|high|urgent",
      "suggested_action": "Specific next step"
    }}
  ]
}}

Focus on:
- What's the logical next step given the stage?
- What objections might they have?
- What value can we add?

Be specific and actionable."""
        
        try:
            response = openai.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are an expert sales coach."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                response_format={"type": "json_object"}
            )
            
            result = json.loads(response.choices[0].message.content)
            return result.get('suggestions', [])
        except Exception as e:
            print(f"AI suggestion failed: {e}")
            return []


# Initialize singleton
ai_tasks = ScoutAITasks()


if __name__ == "__main__":
    print("Scout AI Task Suggestions")
    print("=" * 50)
    
    suggestions = ai_tasks.generate_all_suggestions()
    
    print(f"\nGenerated {len(suggestions)} task suggestions:\n")
    
    for s in suggestions[:10]:
        priority_emoji = {'urgent': '🔴', 'high': '🟠', 'medium': '🟡', 'low': '🟢'}
        print(f"{priority_emoji.get(s.priority, '⚪')} [{s.priority.upper()}] {s.title}")
        print(f"   {s.reason}")
        print(f"   → {s.suggested_action}")
        print()
    
    # Create tasks
    print("\nCreating tasks in database...")
    created = ai_tasks.create_suggested_tasks(suggestions[:5])
    print(f"Created {len(created)} tasks")
