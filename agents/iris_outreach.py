#!/usr/bin/env python3
"""
Iris Outreach Agent
Handles email sequences for AI Assessment leads and general outreach.
"""

import json
import os
from datetime import datetime, timedelta
from typing import Dict, List, Optional


class IrisOutreach:
    """Email outreach automation for The One Group"""
    
    def __init__(self, config_path: str = None):
        self.config_path = config_path or os.path.expanduser(
            "~/.openclaw/workspace/config/iris_config.json"
        )
        self.state_path = os.path.expanduser(
            "~/.openclaw/workspace/state/iris_leads.json"
        )
        self.load_config()
        self.load_state()
    
    def load_config(self):
        """Load email configuration"""
        if os.path.exists(self.config_path):
            with open(self.config_path, 'r') as f:
                self.config = json.load(f)
        else:
            self.config = {
                "sender_name": "Alec Kennedy",
                "sender_email": "akennedy@theonegroup.info",
                "company": "The One Group",
                "reply_to": "akennedy@theonegroup.info"
            }
    
    def load_state(self):
        """Load lead tracking state"""
        if os.path.exists(self.state_path):
            with open(self.state_path, 'r') as f:
                self.state = json.load(f)
        else:
            self.state = {
                "leads": [],
                "sequences": {},
                "last_run": None
            }
    
    def save_state(self):
        """Save lead tracking state"""
        os.makedirs(os.path.dirname(self.state_path), exist_ok=True)
        with open(self.state_path, 'w') as f:
            json.dump(self.state, f, indent=2)
    
    # AI Assessment Email Sequence Templates
    ASSESSMENT_SEQUENCE = {
        "name": "AI Assessment Nurture",
        "description": "3-email sequence for AI Assessment leads",
        "emails": [
            {
                "step": 1,
                "delay_days": 0,
                "subject": "Your competitors are using AI wrong",
                "type": "value",
                "body": """Hi {first_name},

I spent last week analyzing how local businesses are using AI in {city}.

Here's what I found:

Most are making the same three mistakes:

1. They bought tools they don't use
   → 8+ AI subscriptions, using 2 regularly

2. They automated the wrong things first
   → Built complex workflows before fixing basic availability

3. They overpaid for implementation
   → $15K+ projects that take 6 months

Meanwhile, the smart ones?

They're running a simple $999 system that:
✅ Answers calls 24/7
✅ Books appointments automatically
✅ Qualifies leads while they sleep

Same result. Fraction of the cost. Live in 48 hours.

The difference isn't budget. It's strategy.

I put together a quick 5-minute assessment that shows exactly where your business stands.

No sales pitch. Just a clear picture of your AI readiness.

Want me to send it over?

Best,
{sender_name}
The One Group

P.S. - If you're already using AI effectively, I'll tell you that too. No point wasting time on solutions you don't need."""
            },
            {
                "step": 2,
                "delay_days": 3,
                "subject": "How {business_type} got 6 hours back every week",
                "type": "case_study",
                "body": """Hi {first_name},

Quick case study from last month:

{business_type} in {city} — similar size to yours.

THE PROBLEM:
• 40% of calls went to voicemail
• Playing phone tag with potential clients
• Spending 2+ hours/day on scheduling alone

THE SOLUTION:
We set up a simple AI phone system:
• Answers calls 24/7
• Qualifies leads before they reach {first_name}
• Books appointments directly into their calendar
• Sends automatic follow-up texts

THE RESULTS (30 days in):
• 6 hours saved per week
• 23% increase in booked consultations
• Zero missed after-hours calls
• Client satisfaction up (faster response times)

Total investment: $999 setup + $299/month

Break-even: Month one (one extra client per month covers it)

Here's the key insight:

They didn't need a "digital transformation."
They needed ONE system that handled the basics exceptionally well.

Most businesses overthink AI.

The winners? They start small, get results, then scale.

Curious what this could look like for {company_name}?

I can show you in a 15-minute call — no commitment, just a clear roadmap.

Book here: {calendar_link}

Or reply with "SHOW ME" and I'll send over the assessment.

Best,
{sender_name}
The One Group"""
            },
            {
                "step": 3,
                "delay_days": 7,
                "subject": "15 minutes to find your AI quick wins",
                "type": "cta",
                "body": """Hi {first_name},

I'll keep this short.

You've got two options:

OPTION A: Keep doing what you're doing
• Answer calls when you can
• Handle scheduling manually
• Hope competitors don't move faster

OPTION B: Book a free 15-minute AI audit
• I'll identify your highest-ROI automation opportunities
• Show you exactly what implementation looks like
• Give you a clear yes/no on whether AI makes sense for {company_name}

No sales pitch. No pressure.

Just 15 minutes to get clarity.

If it's not a fit, I'll tell you.

If it is, I'll show you the fastest path to results.

→ Book your slot: {calendar_link}

Or reply CALL and I'll send you a few times that work.

Talk soon,
{sender_name}

---
The One Group | AI Automation for South Florida SMBs
{sender_email} | 502-403-7201

P.S. — The businesses I work with typically see ROI in the first month. One extra client, one saved emergency call, one after-hours booking. That's all it takes."""
            }
        ]
    }
    
    def create_assessment_lead(self, 
                                email: str,
                                first_name: str,
                                company_name: str,
                                business_type: str,
                                city: str = "South Florida") -> Dict:
        """Create a new AI Assessment lead and start the sequence"""
        lead_id = f"assessment_{datetime.now().strftime('%Y%m%d')}_{hash(email) % 10000}"
        
        lead = {
            "id": lead_id,
            "email": email,
            "first_name": first_name,
            "company_name": company_name,
            "business_type": business_type,
            "city": city,
            "source": "ai_assessment",
            "status": "active",
            "created_at": datetime.now().isoformat(),
            "sequence_started": True,
            "current_step": 0,
            "emails_sent": []
        }
        
        self.state["leads"].append(lead)
        self.state["sequences"][lead_id] = {
            "type": "assessment_nurture",
            "started_at": datetime.now().isoformat(),
            "next_send": datetime.now().isoformat(),
            "emails_remaining": 3
        }
        
        self.save_state()
        return lead
    
    def generate_email(self, lead: Dict, step: int) -> Optional[Dict]:
        """Generate email content for a specific step in the sequence"""
        sequence = self.ASSESSMENT_SEQUENCE["emails"]
        
        if step < 1 or step > len(sequence):
            return None
        
        email_template = sequence[step - 1]
        
        # Build personalization variables
        vars_dict = {
            "first_name": lead.get("first_name", "there"),
            "company_name": lead.get("company_name", "your business"),
            "business_type": lead.get("business_type", "local business"),
            "city": lead.get("city", "South Florida"),
            "sender_name": self.config.get("sender_name", "Alec Kennedy"),
            "sender_email": self.config.get("sender_email", "akennedy@theonegroup.info"),
            "calendar_link": self.config.get("calendar_link", "https://calendly.com/akennedy-theonegroup")
        }
        
        # Generate personalized content
        subject = email_template["subject"].format(**vars_dict)
        body = email_template["body"].format(**vars_dict)
        
        return {
            "step": step,
            "type": email_template["type"],
            "to": lead["email"],
            "subject": subject,
            "body": body,
            "lead_id": lead["id"],
            "send_at": None  # Immediate or scheduled
        }
    
    def get_pending_emails(self) -> List[Dict]:
        """Get all emails that need to be sent now"""
        pending = []
        now = datetime.now()
        
        for lead in self.state["leads"]:
            if lead.get("status") != "active" or not lead.get("sequence_started"):
                continue
            
            lead_id = lead["id"]
            seq_state = self.state["sequences"].get(lead_id)
            
            if not seq_state:
                continue
            
            # Check if it's time to send next email
            next_send = datetime.fromisoformat(seq_state["next_send"].replace('Z', '+00:00'))
            
            if now >= next_send and seq_state["emails_remaining"] > 0:
                current_step = lead.get("current_step", 0) + 1
                email = self.generate_email(lead, current_step)
                
                if email:
                    pending.append(email)
        
        return pending
    
    def mark_email_sent(self, lead_id: str, step: int):
        """Mark an email as sent and update sequence state"""
        # Find lead
        for lead in self.state["leads"]:
            if lead["id"] == lead_id:
                lead["current_step"] = step
                lead["emails_sent"].append({
                    "step": step,
                    "sent_at": datetime.now().isoformat()
                })
                break
        
        # Update sequence state
        seq_state = self.state["sequences"].get(lead_id)
        if seq_state:
            seq_state["emails_remaining"] -= 1
            
            # Calculate next send time based on template
            email_template = self.ASSESSMENT_SEQUENCE["emails"][step - 1]
            delay_days = email_template.get("delay_days", 3)
            next_send = datetime.now() + timedelta(days=delay_days)
            seq_state["next_send"] = next_send.isoformat()
        
        self.save_state()
    
    def get_lead_status(self, lead_id: str = None) -> Dict:
        """Get status of leads and sequences"""
        if lead_id:
            for lead in self.state["leads"]:
                if lead["id"] == lead_id:
                    return lead
            return None
        
        # Summary stats
        total_leads = len(self.state["leads"])
        active_leads = sum(1 for l in self.state["leads"] if l.get("status") == "active")
        completed_sequences = sum(
            1 for s in self.state["sequences"].values() 
            if s.get("emails_remaining", 0) == 0
        )
        
        return {
            "total_leads": total_leads,
            "active_leads": active_leads,
            "completed_sequences": completed_sequences,
            "pending_sends": len(self.get_pending_emails())
        }


# Convenience functions for agent integration
def create_assessment_lead(email: str, first_name: str, company_name: str, 
                           business_type: str, city: str = "South Florida") -> Dict:
    """Create a new AI Assessment lead"""
    iris = IrisOutreach()
    return iris.create_assessment_lead(email, first_name, company_name, business_type, city)


def get_pending_emails() -> List[Dict]:
    """Get emails ready to send"""
    iris = IrisOutreach()
    return iris.get_pending_emails()


def mark_sent(lead_id: str, step: int):
    """Mark an email as sent"""
    iris = IrisOutreach()
    iris.mark_email_sent(lead_id, step)


def get_status(lead_id: str = None) -> Dict:
    """Get lead status"""
    iris = IrisOutreach()
    return iris.get_lead_status(lead_id)


if __name__ == "__main__":
    # Test the module
    iris = IrisOutreach()
    
    # Create test lead
    test_lead = iris.create_assessment_lead(
        email="test@example.com",
        first_name="John",
        company_name="Test Business",
        business_type="HVAC Company",
        city="Boca Raton"
    )
    
    print(f"Created lead: {test_lead['id']}")
    
    # Generate first email
    email = iris.generate_email(test_lead, 1)
    print(f"\nEmail 1 Subject: {email['subject']}")
    print(f"Body preview: {email['body'][:200]}...")
    
    print("\n✓ Iris Outreach module ready")
