#!/usr/bin/env python3
"""
Thread Generator - Expand single tweets into multi-part threads
"""

import json
from datetime import datetime
from pathlib import Path

STATE_FILE = Path('/Users/aleckennedy/.openclaw/workspace/state.json')

THREAD_TEMPLATES = {
    'automation_101': {
        'hook': "Most SMBs are losing $5,000+ per month to this one mistake:\n\nThey are trying to automate EVERYTHING at once.\n\nHere is the 3-step framework that actually works:\n\n🧵",
        'parts': [
            "1/ Start with your biggest time sink\n\nLook at your week. What takes hours but does not require judgment?\n\nExamples:\n• Data entry\n• Email follow-ups\n• Scheduling\n• Invoice processing\n\nPick ONE. Not two. Not three. ONE.",
            "2/ Automate the 80%, not the 100%\n\nPerfect automation takes months.\nGood automation takes days.\n\nAim for:\n• 80% of cases handled automatically\n• 20% flagged for human review\n\nLaunch fast. Iterate.",
            "3/ Measure before you build more\n\nTrack:\n• Hours saved per week\n• Errors reduced\n• Response time improved\n\nGot numbers? Great. Now pick your next automation.\n\nNo numbers? Debug before you build.",
            "The pattern:\n\nStart → Automate ONE thing → Measure → Repeat\n\nNot:\nResearch 10 tools → Buy 3 → Configure for weeks → Get overwhelmed → Abandon\n\nThe first path gets you ROI in days.\n\nThe second gets you nothing.",
            "We have implemented this for 50+ SMBs.\n\nThe ones who win?\n• Start small\n• Ship fast\n• Iterate based on data\n\nThe ones who stall?\n• Try to automate everything\n• Get paralyzed by options\n• Never ship\n\nWhich path are you on?"
        ]
    },
    'ai_roi': {
        'hook': "I just ran the numbers on a $2M revenue SMB.\n\nThey were spending $18,000/month on manual processes that AI could handle for $500.\n\nHere is the breakdown:\n\n🧵",
        'parts': [
            "The costs they did not see:\n\n• Data entry: 25 hrs/week × $25/hr = $2,500/mo\n• Follow-up delays: Lost deals = ~$8,000/mo\n• Scheduling back-and-forth: 10 hrs/week = $1,000/mo\n• Invoice chasing: 15 hrs/week = $1,500/mo\n• Reporting manually: 10 hrs/week = $1,000/mo\n\nTotal: $14,000+ in labor + $8,000 in lost revenue",
            "The AI alternative:\n\n• Data entry → Auto-sync: $200/mo\n• Follow-up → Auto-nurture: $150/mo\n• Scheduling → Self-serve booking: $50/mo\n• Invoices → Auto-reminders: $50/mo\n• Reporting → Auto-dashboard: $50/mo\n\nTotal: $500/mo",
            "But here is what most people miss:\n\nThe $500/mo tool is not the hard part.\n\nThe hard part is:\n• Mapping current workflows\n• Setting up integrations\n• Training the team\n• Monitoring early errors\n\nSetup takes 2-4 weeks. But the ROI is immediate.",
            "Real results from this client:\n\nMonth 1: Setup (net negative)\nMonth 2: 15 hrs/week saved\nMonth 3: 35 hrs/week saved + faster response times\nMonth 6: Reallocated 2 FTEs to growth activities\n\nAnnual impact: $200K+ in labor cost + opportunity gain",
            "The lesson:\n\nDo not ask 'Can AI do this?'\n\nAsk 'What is the true cost of doing this manually?'\n\nWhen you run the full numbers—labor + opportunity cost + error rates—the AI investment is obvious.\n\nWant help running these numbers for your business?\nDM me 'audit' and I will show you exactly where you are bleeding money."
        ]
    },
    'openclaw_real': {
        'hook': "I have been running OpenClaw for 6 months.\n\nHere is what nobody tells you about owning your AI infrastructure:\n\n🧵",
        'parts': [
            "The good:\n\n• No vendor lock-in\n• No per-seat pricing\n• Full control over models\n• No 'we are pivoting' surprises\n• Your data stays local\n• Cost scales with compute, not headcount\n\nFor a 20-person team, this is massive.",
            "The reality:\n\n• Setup takes actual work\n• You need to understand the system\n• Updates are YOUR responsibility\n• Debugging is harder than SaaS\n• Community support, not enterprise support\n\nIt is infrastructure, not a product.",
            "Who should use OpenClaw:\n\n✅ Technical teams\n✅ Privacy-sensitive businesses\n✅ Cost-conscious operations\n✅ People who like control\n✅ Teams with 10+ AI users\n\nWho should NOT:\n❌ Want 'it just works'\n❌ Need 24/7 enterprise support\n❌ Cannot handle config files\n❌ One-person shops without tech skills",
            "The math:\n\nSaaS AI tools: $20-50/user/mo × 20 users = $400-1000/mo\nOpenClaw: $0 (your hardware) + API costs ~$100-300/mo\n\nSavings: $500-700/mo\nSetup cost: 20-40 hours one-time\n\nBreak-even: Month 1-2",
            "My take:\n\nOpenClaw is not for everyone. But if you are running AI at scale and hate SaaS pricing, it is a game-changer.\n\nThe learning curve is real.\nThe ownership is realer.\n\nQuestions about setup?\nDrop them below—I have made all the mistakes so you do not have to."
        ]
    }
}

def generate_thread(thread_type):
    """Generate a thread from template"""
    template = THREAD_TEMPLATES.get(thread_type)
    if not template:
        return None
    
    thread_posts = []
    
    # Hook is first tweet
    thread_posts.append({
        'text': template['hook'],
        'is_hook': True
    })
    
    # Add numbered parts
    for i, part in enumerate(template['parts'], 1):
        thread_posts.append({
            'text': part,
            'part_number': i,
            'total_parts': len(template['parts'])
        })
    
    return thread_posts

def add_thread_to_queue(thread_type, scheduled_date):
    """Add thread posts to state.json queue"""
    if not Path(STATE_FILE).exists():
        print("No state.json found")
        return
    
    state = json.loads(STATE_FILE.read_text())
    
    thread = generate_thread(thread_type)
    if not thread:
        print(f"Unknown thread type: {thread_type}")
        return
    
    # Add each part to queue with thread ID
    thread_id = f"thread_{thread_type}_{scheduled_date}"
    
    for i, post in enumerate(thread):
        state['twitterQueue'].append({
            'id': f"{thread_id}_{i}",
            'status': 'queued',
            'text': post['text'],
            'thread_id': thread_id,
            'thread_position': i,
            'is_hook': post.get('is_hook', False),
            'source': f'Thread: {thread_type}',
            'createdAt': datetime.now().isoformat()
        })
    
    # Save state
    STATE_FILE.write_text(json.dumps(state, indent=2))
    
    print(f"Added thread '{thread_type}' to queue")
    print(f"   {len(thread)} posts total")

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python thread_generator.py [thread_type]")
        print()
        print("Available thread types:")
        for key in THREAD_TEMPLATES:
            print(f"  - {key}")
        sys.exit(1)
    
    thread_type = sys.argv[1]
    scheduled_date = datetime.now().strftime('%Y-%m-%d')
    
    add_thread_to_queue(thread_type, scheduled_date)
