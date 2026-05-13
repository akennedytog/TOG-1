#!/usr/bin/env python3
"""
Scout Sales API - REST API for Scout CRM
"""

import json
import os
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional
from uuid import uuid4

from flask import Flask, request, jsonify
from flask_cors import CORS

from scout_db import ScoutDatabase, Contact, Account, Deal, Activity, Task
from scout_db import DealStage, ActivityType, db
from scout_ai_briefing import ScoutAIBriefing, ai_briefing
from scout_ai_tasks import ScoutAITasks, ai_tasks
from scout_email import ScoutEmail, scout_email

app = Flask(__name__)
CORS(app)

# Utility functions
def generate_id():
    return str(uuid4())

def get_now():
    return datetime.now().isoformat()

def get_today():
    return datetime.now().strftime('%Y-%m-%d')

def get_week_later():
    return (datetime.now() + timedelta(days=7)).isoformat()

# ============ EMAIL TEMPLATES (INLINE) ============

DEFAULT_TEMPLATES = [
    {
        'name': 'Follow-up After Call',
        'subject': 'Following up on our call - {{company}}',
        'body': '''Hi {{first_name}},\n\nThanks for taking the time to speak with me today. I enjoyed learning about {{company}} and your goals.\n\nAs discussed, I've attached the proposal for {{deal_value}}.\n\nNext steps: {{next_steps}}\n\nLet me know if you have any questions.\n\nBest,\n{{sender_name}}''',
        'category': 'follow_up'
    },
    {
        'name': 'Proposal Check-in',
        'subject': 'Quick check-in: {{deal_name}} proposal',
        'body': '''Hi {{first_name}},\n\nI wanted to follow up on the proposal I sent for {{deal_name}}.\n\nHave you had a chance to review it? I'd be happy to walk through any questions.\n\nBest,\n{{sender_name}}''',
        'category': 'follow_up'
    },
    {
        'name': 'Re-engagement',
        'subject': 'Catching up with {{company}}',
        'body': '''Hi {{first_name}},\n\nIt's been a while since we last connected. I wanted to reach out and see how things are going at {{company}}.\n\nWe've launched some new capabilities that might be relevant.\n\nWould you be open to a brief 15-minute catch-up call next week?\n\nBest,\n{{sender_name}}''',
        'category': 're_engagement'
    },
    {
        'name': 'Introduction',
        'subject': 'Welcome to Scout CRM',
        'body': '''Hi {{first_name}},\n\nWelcome! I'm excited to help {{company}} with {{goal}}.\n\nHere are a few resources to get started.\n\nLet me know if you have any questions.\n\nBest,\n{{sender_name}}''',
        'category': 'introduction'
    }
]

def insert_default_templates():
    """Insert default templates if none exist"""
    try:
        with db.get_connection() as conn:
            conn.execute('''
                CREATE TABLE IF NOT EXISTS email_templates (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    subject TEXT NOT NULL,
                    body TEXT NOT NULL,
                    html_body TEXT,
                    category TEXT DEFAULT 'general',
                    variables TEXT,
                    created_by TEXT,
                    is_default BOOLEAN DEFAULT 0,
                    usage_count INTEGER DEFAULT 0,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                )
            ''')
            
            count = conn.execute("SELECT COUNT(*) FROM email_templates").fetchone()[0]
            if count == 0:
                for template in DEFAULT_TEMPLATES:
                    template_id = str(uuid4())
                    import re
                    variables = re.findall(r'\{\{(\w+)\}\}', template['body'])
                    variables = list(set(variables))
                    
                    conn.execute("""
                        INSERT INTO email_templates (id, name, subject, body, category, 
                            variables, is_default, usage_count, created_at, updated_at)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (
                        template_id, template['name'], template['subject'], 
                        template['body'], template['category'],
                        json.dumps(variables), True, 0,
                        datetime.now().isoformat(), datetime.now().isoformat()
                    ))
                conn.commit()
                print(f"Inserted {len(DEFAULT_TEMPLATES)} default templates")
    except Exception as e:
        print(f"Error inserting templates: {e}")

# Initialize default templates on startup
insert_default_templates()

# Health check
@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'timestamp': get_now()})

# ============ AI BRIEFING ============

@app.route('/api/briefing', methods=['GET'])
def get_daily_briefing():
    """Get AI-generated daily briefing"""
    owner_id = request.args.get('owner_id')
    briefing = ai_briefing.generate_daily_briefing(owner_id=owner_id)
    return jsonify(briefing)

@app.route('/api/briefing/win-loss', methods=['GET'])
def get_win_loss():
    """Get win/loss analysis"""
    owner_id = request.args.get('owner_id')
    days = int(request.args.get('days', 90))
    analysis = ai_briefing.get_win_loss_analysis(owner_id=owner_id, days=days)
    return jsonify(analysis)

# ============ CONTACTS ============

@app.route('/api/contacts', methods=['GET'])
def list_contacts():
    """List contacts with optional filters"""
    account_id = request.args.get('account_id')
    owner_id = request.args.get('owner_id')
    limit = int(request.args.get('limit', 100))
    offset = int(request.args.get('offset', 0))
    
    contacts = db.list_contacts(
        account_id=account_id,
        owner_id=owner_id,
        limit=limit,
        offset=offset
    )
    
    return jsonify({
        'contacts': [
            {
                'id': c.id,
                'first_name': c.first_name,
                'last_name': c.last_name,
                'email': c.email,
                'phone': c.phone,
                'title': c.title,
                'account_id': c.account_id,
                'owner_id': c.owner_id,
                'tags': c.tags,
                'created_at': c.created_at
            }
            for c in contacts
        ]
    })

@app.route('/api/contacts', methods=['POST'])
def create_contact():
    """Create a new contact"""
    data = request.json
    
    contact = Contact(
        id=generate_id(),
        first_name=data.get('first_name', ''),
        last_name=data.get('last_name', ''),
        email=data.get('email', ''),
        phone=data.get('phone'),
        title=data.get('title'),
        account_id=data.get('account_id'),
        owner_id=data.get('owner_id'),
        source=data.get('source'),
        tags=data.get('tags', []),
        custom_fields=data.get('custom_fields', {})
    )
    
    db.create_contact(contact)
    
    # If assigned to an account, update account activity
    if contact.account_id:
        db.update_account(contact.account_id, {
            'last_activity_at': get_now()
        })
    
    return jsonify({
        'id': contact.id,
        'message': 'Contact created successfully'
    }), 201

@app.route('/api/contacts/<contact_id>', methods=['GET'])
def get_contact(contact_id):
    """Get a specific contact with full history"""
    contact = db.get_contact(contact_id)
    if not contact:
        return jsonify({'error': 'Contact not found'}), 404
    
    # Get related account
    account = None
    if contact.account_id:
        account = db.get_account(contact.account_id)
    
    # Get activities
    activities = db.get_activities(contact_id=contact_id, limit=20)
    
    # Get tasks
    tasks = db.get_tasks(contact_id=contact_id, status='open')
    
    return jsonify({
        'contact': {
            'id': contact.id,
            'first_name': contact.first_name,
            'last_name': contact.last_name,
            'email': contact.email,
            'phone': contact.phone,
            'title': contact.title,
            'account_id': contact.account_id,
            'owner_id': contact.owner_id,
            'source': contact.source,
            'tags': contact.tags,
            'custom_fields': contact.custom_fields,
            'created_at': contact.created_at,
            'updated_at': contact.updated_at
        },
        'account': {
            'id': account.id,
            'name': account.name
        } if account else None,
        'activities': [
            {
                'id': a.id,
                'type': a.type,
                'subject': a.subject,
                'description': a.description,
                'outcome': a.outcome,
                'scheduled_at': a.scheduled_at,
                'completed_at': a.completed_at,
                'created_at': a.created_at
            }
            for a in activities
        ],
        'tasks': [
            {
                'id': t.id,
                'title': t.title,
                'priority': t.priority,
                'due_date': t.due_date,
                'status': t.status
            }
            for t in tasks
        ]
    })

@app.route('/api/contacts/<contact_id>', methods=['PATCH'])
def update_contact(contact_id):
    """Update a contact"""
    data = request.json
    contact = db.update_contact(contact_id, data)
    if not contact:
        return jsonify({'error': 'Contact not found'}), 404
    
    return jsonify({'message': 'Contact updated successfully'})

# ============ ACCOUNTS ============

@app.route('/api/accounts', methods=['GET'])
def list_accounts():
    """List accounts with optional filters"""
    owner_id = request.args.get('owner_id')
    status = request.args.get('status')
    limit = int(request.args.get('limit', 100))
    offset = int(request.args.get('offset', 0))
    
    accounts = db.list_accounts(
        owner_id=owner_id,
        status=status,
        limit=limit,
        offset=offset
    )
    
    return jsonify({
        'accounts': [
            {
                'id': a.id,
                'name': a.name,
                'domain': a.domain,
                'industry': a.industry,
                'size': a.size,
                'annual_revenue': a.annual_revenue,
                'website': a.website,
                'owner_id': a.owner_id,
                'status': a.status,
                'health_score': a.health_score,
                'last_activity_at': a.last_activity_at,
                'tags': a.tags
            }
            for a in accounts
        ]
    })

@app.route('/api/accounts', methods=['POST'])
def create_account():
    """Create a new account"""
    data = request.json
    
    account = Account(
        id=generate_id(),
        name=data.get('name', ''),
        domain=data.get('domain'),
        industry=data.get('industry'),
        size=data.get('size'),
        annual_revenue=data.get('annual_revenue'),
        website=data.get('website'),
        address=data.get('address'),
        billing_address=data.get('billing_address'),
        owner_id=data.get('owner_id'),
        status=data.get('status', 'active'),
        tags=data.get('tags', []),
        custom_fields=data.get('custom_fields', {})
    )
    
    db.create_account(account)
    
    return jsonify({
        'id': account.id,
        'message': 'Account created successfully'
    }), 201

@app.route('/api/accounts/<account_id>', methods=['GET'])
def get_account(account_id):
    """Get a specific account with related data"""
    account = db.get_account(account_id)
    if not account:
        return jsonify({'error': 'Account not found'}), 404
    
    # Get contacts
    contacts = db.list_contacts(account_id=account_id)
    
    # Get deals
    deals = db.list_deals(account_id=account_id)
    
    # Get activities
    activities = db.get_activities(account_id=account_id, limit=20)
    
    return jsonify({
        'account': {
            'id': account.id,
            'name': account.name,
            'domain': account.domain,
            'industry': account.industry,
            'size': account.size,
            'annual_revenue': account.annual_revenue,
            'website': account.website,
            'address': account.address,
            'billing_address': account.billing_address,
            'owner_id': account.owner_id,
            'status': account.status,
            'health_score': account.health_score,
            'last_activity_at': account.last_activity_at,
            'next_activity_at': account.next_activity_at,
            'tags': account.tags,
            'custom_fields': account.custom_fields,
            'created_at': account.created_at,
            'updated_at': account.updated_at
        },
        'contacts': [
            {
                'id': c.id,
                'first_name': c.first_name,
                'last_name': c.last_name,
                'email': c.email,
                'title': c.title
            }
            for c in contacts
        ],
        'deals': [
            {
                'id': d.id,
                'name': d.name,
                'stage': d.stage,
                'value': d.value,
                'probability': d.probability,
                'expected_close_date': d.expected_close_date
            }
            for d in deals
        ],
        'activities': [
            {
                'id': a.id,
                'type': a.type,
                'subject': a.subject,
                'description': a.description,
                'created_at': a.created_at
            }
            for a in activities
        ]
    })

@app.route('/api/accounts/<account_id>', methods=['PATCH'])
def update_account(account_id):
    """Update an account"""
    data = request.json
    account = db.update_account(account_id, data)
    if not account:
        return jsonify({'error': 'Account not found'}), 404
    
    return jsonify({'message': 'Account updated successfully'})

# ============ DEALS ============

@app.route('/api/deals', methods=['GET'])
def list_deals():
    """List deals with optional filters"""
    account_id = request.args.get('account_id')
    owner_id = request.args.get('owner_id')
    stage = request.args.get('stage')
    priority = request.args.get('priority')
    limit = int(request.args.get('limit', 100))
    offset = int(request.args.get('offset', 0))
    
    deals = db.list_deals(
        account_id=account_id,
        owner_id=owner_id,
        stage=stage,
        priority=priority,
        limit=limit,
        offset=offset
    )
    
    # Enrich with account names
    enriched_deals = []
    for deal in deals:
        account = db.get_account(deal.account_id) if deal.account_id else None
        enriched_deals.append({
            'id': deal.id,
            'name': deal.name,
            'account_id': deal.account_id,
            'account_name': account.name if account else None,
            'contact_id': deal.contact_id,
            'owner_id': deal.owner_id,
            'stage': deal.stage,
            'value': deal.value,
            'currency': deal.currency,
            'probability': deal.probability,
            'expected_close_date': deal.expected_close_date,
            'priority': deal.priority,
            'tags': deal.tags,
            'created_at': deal.created_at
        })
    
    return jsonify({'deals': enriched_deals})

@app.route('/api/deals', methods=['POST'])
def create_deal():
    """Create a new deal"""
    data = request.json
    
    # Calculate probability based on stage
    stage = data.get('stage', DealStage.PROSPECTING.value)
    stage_probabilities = {
        DealStage.PROSPECTING.value: 10,
        DealStage.QUALIFICATION.value: 25,
        DealStage.PROPOSAL.value: 50,
        DealStage.NEGOTIATION.value: 75,
        DealStage.CLOSED_WON.value: 100,
        DealStage.CLOSED_LOST.value: 0
    }
    probability = data.get('probability', stage_probabilities.get(stage, 10))
    
    deal = Deal(
        id=generate_id(),
        name=data.get('name', ''),
        account_id=data.get('account_id'),
        contact_id=data.get('contact_id'),
        owner_id=data.get('owner_id'),
        stage=stage,
        value=data.get('value', 0),
        currency=data.get('currency', 'USD'),
        probability=probability,
        expected_close_date=data.get('expected_close_date'),
        source=data.get('source'),
        priority=data.get('priority', 'medium'),
        tags=data.get('tags', []),
        notes=data.get('notes'),
        custom_fields=data.get('custom_fields', {})
    )
    
    db.create_deal(deal)
    
    # Update account activity
    if deal.account_id:
        db.update_account(deal.account_id, {
            'last_activity_at': get_now()
        })
    
    return jsonify({
        'id': deal.id,
        'message': 'Deal created successfully'
    }), 201

@app.route('/api/deals/<deal_id>', methods=['GET'])
def get_deal(deal_id):
    """Get a specific deal with full timeline"""
    deal = db.get_deal(deal_id)
    if not deal:
        return jsonify({'error': 'Deal not found'}), 404
    
    # Get account
    account = db.get_account(deal.account_id) if deal.account_id else None
    
    # Get primary contact
    contact = db.get_contact(deal.contact_id) if deal.contact_id else None
    
    # Get activities
    activities = db.get_activities(deal_id=deal_id, limit=30)
    
    # Get tasks
    tasks = db.get_tasks(deal_id=deal_id, status='open')
    
    return jsonify({
        'deal': {
            'id': deal.id,
            'name': deal.name,
            'account_id': deal.account_id,
            'account_name': account.name if account else None,
            'contact_id': deal.contact_id,
            'contact_name': f"{contact.first_name} {contact.last_name}" if contact else None,
            'owner_id': deal.owner_id,
            'stage': deal.stage,
            'value': deal.value,
            'currency': deal.currency,
            'probability': deal.probability,
            'expected_close_date': deal.expected_close_date,
            'actual_close_date': deal.actual_close_date,
            'source': deal.source,
            'priority': deal.priority,
            'competitors': deal.competitors,
            'notes': deal.notes,
            'tags': deal.tags,
            'custom_fields': deal.custom_fields,
            'created_at': deal.created_at,
            'updated_at': deal.updated_at
        },
        'timeline': [
            {
                'id': a.id,
                'type': a.type,
                'subject': a.subject,
                'description': a.description,
                'outcome': a.outcome,
                'scheduled_at': a.scheduled_at,
                'completed_at': a.completed_at,
                'created_at': a.created_at
            }
            for a in activities
        ],
        'tasks': [
            {
                'id': t.id,
                'title': t.title,
                'priority': t.priority,
                'due_date': t.due_date,
                'ai_suggested': t.ai_suggested
            }
            for t in tasks
        ]
    })

@app.route('/api/deals/<deal_id>', methods=['PATCH'])
def update_deal(deal_id):
    """Update a deal"""
    data = request.json
    
    # Recalculate probability if stage changed
    if 'stage' in data and 'probability' not in data:
        stage_probabilities = {
            DealStage.PROSPECTING.value: 10,
            DealStage.QUALIFICATION.value: 25,
            DealStage.PROPOSAL.value: 50,
            DealStage.NEGOTIATION.value: 75,
            DealStage.CLOSED_WON.value: 100,
            DealStage.CLOSED_LOST.value: 0
        }
        data['probability'] = stage_probabilities.get(data['stage'], 10)
    
    # Set close date if won/lost
    if data.get('stage') in [DealStage.CLOSED_WON.value, DealStage.CLOSED_LOST.value]:
        data['actual_close_date'] = get_today()
    
    deal = db.update_deal(deal_id, data)
    if not deal:
        return jsonify({'error': 'Deal not found'}), 404
    
    return jsonify({'message': 'Deal updated successfully'})

@app.route('/api/deals/pipeline', methods=['GET'])
def get_pipeline():
    """Get pipeline summary by stage"""
    owner_id = request.args.get('owner_id')
    
    pipeline = db.get_pipeline_summary(owner_id=owner_id)
    
    # Define stage order and names
    stage_info = {
        'prospecting': {'name': 'Prospecting', 'color': '#64748b'},
        'qualification': {'name': 'Qualification', 'color': '#3b82f6'},
        'proposal': {'name': 'Proposal', 'color': '#8b5cf6'},
        'negotiation': {'name': 'Negotiation', 'color': '#f59e0b'},
        'closed_won': {'name': 'Closed Won', 'color': '#10b981'},
        'closed_lost': {'name': 'Closed Lost', 'color': '#ef4444'}
    }
    
    formatted_stages = []
    for stage_key, info in stage_info.items():
        stage_data = pipeline.get('stages', {}).get(stage_key, {'count': 0, 'value': 0})
        formatted_stages.append({
            'stage': stage_key,
            'name': info['name'],
            'color': info['color'],
            'count': stage_data['count'],
            'value': stage_data['value']
        })
    
    return jsonify({
        'stages': formatted_stages,
        'total_deals': pipeline['total_deals'],
        'total_value': pipeline['total_value']
    })

# ============ DEAL VELOCITY ============

@app.route('/api/deals/<deal_id>/velocity', methods=['GET'])
def get_deal_velocity_endpoint(deal_id):
    """Get velocity metrics for a specific deal"""
    velocity = ai_briefing.get_deal_velocity(deal_id)
    if not velocity:
        return jsonify({'error': 'Deal not found'}), 404
    return jsonify(velocity)

# ============ ACTIVITIES ============

@app.route('/api/activities', methods=['GET'])
def list_activities():
    """List activities with filters"""
    contact_id = request.args.get('contact_id')
    account_id = request.args.get('account_id')
    deal_id = request.args.get('deal_id')
    activity_type = request.args.get('type')
    limit = int(request.args.get('limit', 50))
    
    activities = db.get_activities(
        contact_id=contact_id,
        account_id=account_id,
        deal_id=deal_id,
        activity_type=activity_type,
        limit=limit
    )
    
    return jsonify({
        'activities': [
            {
                'id': a.id,
                'type': a.type,
                'contact_id': a.contact_id,
                'account_id': a.account_id,
                'deal_id': a.deal_id,
                'subject': a.subject,
                'description': a.description,
                'outcome': a.outcome,
                'duration_minutes': a.duration_minutes,
                'scheduled_at': a.scheduled_at,
                'completed_at': a.completed_at,
                'created_at': a.created_at
            }
            for a in activities
        ]
    })

@app.route('/api/activities', methods=['POST'])
def create_activity():
    """Log an activity"""
    data = request.json
    
    activity = Activity(
        id=generate_id(),
        type=data.get('type', ActivityType.NOTE.value),
        contact_id=data.get('contact_id'),
        account_id=data.get('account_id'),
        deal_id=data.get('deal_id'),
        owner_id=data.get('owner_id'),
        subject=data.get('subject'),
        description=data.get('description'),
        outcome=data.get('outcome'),
        duration_minutes=data.get('duration_minutes'),
        scheduled_at=data.get('scheduled_at'),
        completed_at=data.get('completed_at'),
        metadata=data.get('metadata', {})
    )
    
    db.create_activity(activity)
    
    # Update last activity timestamps
    if activity.account_id:
        db.update_account(activity.account_id, {
            'last_activity_at': get_now()
        })
    
    return jsonify({
        'id': activity.id,
        'message': 'Activity logged successfully'
    }), 201

# ============ TASKS ============

@app.route('/api/tasks', methods=['GET'])
def list_tasks():
    """List tasks with filters"""
    owner_id = request.args.get('owner_id')
    status = request.args.get('status', 'open')
    priority = request.args.get('priority')
    due_before = request.args.get('due_before')
    limit = int(request.args.get('limit', 100))
    
    tasks = db.get_tasks(
        owner_id=owner_id,
        status=status,
        priority=priority,
        due_before=due_before,
        limit=limit
    )
    
    return jsonify({
        'tasks': [
            {
                'id': t.id,
                'title': t.title,
                'description': t.description,
                'contact_id': t.contact_id,
                'account_id': t.account_id,
                'deal_id': t.deal_id,
                'priority': t.priority,
                'status': t.status,
                'due_date': t.due_date,
                'ai_suggested': t.ai_suggested,
                'ai_reason': t.ai_reason,
                'created_at': t.created_at
            }
            for t in tasks
        ]
    })

@app.route('/api/tasks', methods=['POST'])
def create_task():
    """Create a task"""
    data = request.json
    
    task = Task(
        id=generate_id(),
        title=data.get('title', ''),
        description=data.get('description'),
        contact_id=data.get('contact_id'),
        account_id=data.get('account_id'),
        deal_id=data.get('deal_id'),
        owner_id=data.get('owner_id'),
        priority=data.get('priority', 'medium'),
        due_date=data.get('due_date'),
        ai_suggested=data.get('ai_suggested', False),
        ai_reason=data.get('ai_reason')
    )
    
    db.create_task(task)
    
    return jsonify({
        'id': task.id,
        'message': 'Task created successfully'
    }), 201

@app.route('/api/tasks/<task_id>/complete', methods=['POST'])
def complete_task(task_id):
    """Mark a task as complete"""
    task = db.complete_task(task_id)
    if not task:
        return jsonify({'error': 'Task not found'}), 404
    
    return jsonify({'message': 'Task completed'})

# ============ DASHBOARD ============

@app.route('/api/dashboard', methods=['GET'])
def get_dashboard():
    """Get dashboard metrics"""
    owner_id = request.args.get('owner_id')
    
    metrics = db.get_dashboard_metrics(owner_id=owner_id)
    
    # Get recent deals
    recent_deals = db.list_deals(owner_id=owner_id, limit=5)
    
    # Get today's tasks
    today = get_today()
    tasks_today = db.get_tasks(
        owner_id=owner_id,
        status='open',
        due_before=today,
        limit=10
    )
    
    # Get upcoming activities
    upcoming = db.get_activities(owner_id=owner_id, limit=5)
    
    return jsonify({
        'metrics': metrics,
        'recent_deals': [
            {
                'id': d.id,
                'name': d.name,
                'stage': d.stage,
                'value': d.value,
                'probability': d.probability
            }
            for d in recent_deals
        ],
        'tasks_today': [
            {
                'id': t.id,
                'title': t.title,
                'priority': t.priority,
                'due_date': t.due_date,
                'contact_id': t.contact_id,
                'deal_id': t.deal_id
            }
            for t in tasks_today
        ],
        'upcoming_activities': [
            {
                'id': a.id,
                'type': a.type,
                'subject': a.subject,
                'scheduled_at': a.scheduled_at
            }
            for a in upcoming
        ]
    })

# ============ SEARCH ============

@app.route('/api/search', methods=['GET'])
def search():
    """Global search across contacts, accounts, deals"""
    query = request.args.get('q', '').lower()
    if len(query) < 2:
        return jsonify({'results': []})
    
    results = []
    
    # Search contacts
    contacts = db.list_contacts(limit=100)
    for c in contacts:
        if query in c.first_name.lower() or query in c.last_name.lower() or query in c.email.lower():
            results.append({
                'type': 'contact',
                'id': c.id,
                'name': f"{c.first_name} {c.last_name}",
                'email': c.email,
                'title': c.title
            })
    
    # Search accounts
    accounts = db.list_accounts(limit=100)
    for a in accounts:
        if query in a.name.lower() or (a.domain and query in a.domain.lower()):
            results.append({
                'type': 'account',
                'id': a.id,
                'name': a.name,
                'industry': a.industry
            })
    
    # Search deals
    deals = db.list_deals(limit=100)
    for d in deals:
        if query in d.name.lower():
            results.append({
                'type': 'deal',
                'id': d.id,
                'name': d.name,
                'value': d.value,
                'stage': d.stage
            })
    
    return jsonify({'results': results[:20]})

# ============ AI TASKS ============

@app.route('/api/ai/generate-tasks', methods=['POST'])
def generate_ai_tasks():
    """Generate AI task suggestions"""
    owner_id = request.json.get('owner_id')
    suggestions = ai_tasks.generate_all_suggestions(owner_id)
    
    return jsonify({
        'suggestions': [
            {
                'title': s.title,
                'description': s.description,
                'priority': s.priority,
                'due_date': s.due_date,
                'reason': s.reason,
                'entity_type': s.entity_type,
                'entity_id': s.entity_id,
                'suggested_action': s.suggested_action
            }
            for s in suggestions[:20]
        ]
    })

@app.route('/api/ai/create-tasks', methods=['POST'])
def create_ai_tasks():
    """Create AI-suggested tasks in database"""
    owner_id = request.json.get('owner_id')
    limit = request.json.get('limit', 10)
    
    suggestions = ai_tasks.generate_all_suggestions(owner_id)
    created = ai_tasks.create_suggested_tasks(suggestions[:limit], owner_id)
    
    return jsonify({
        'created_count': len(created),
        'tasks': [
            {
                'id': t.id,
                'title': t.title,
                'priority': t.priority,
                'due_date': t.due_date
            }
            for t in created
        ]
    })

@app.route('/api/tasks/ai-suggested', methods=['GET'])
def get_ai_suggested_tasks():
    """Get AI-suggested tasks that haven't been created"""
    owner_id = request.args.get('owner_id')
    suggestions = ai_tasks.get_ai_suggested_tasks(owner_id)
    
    return jsonify({
        'suggestions': [
            {
                'title': s.title,
                'description': s.description,
                'priority': s.priority,
                'due_date': s.due_date,
                'reason': s.reason,
                'entity_type': s.entity_type,
                'entity_id': s.entity_id
            }
            for s in suggestions[:20]
        ]
    })

@app.route('/api/deals/<deal_id>/ai-suggestions', methods=['GET'])
def get_deal_ai_suggestions(deal_id):
    """Get AI-enhanced suggestions for a specific deal"""
    suggestions = ai_tasks.generate_ai_enhanced_suggestions(deal_id)
    return jsonify({'suggestions': suggestions})

# ============ EMAIL ============

@app.route('/api/emails/send', methods=['POST'])
def send_email():
    """Send email via Gmail"""
    data = request.json
    
    result = scout_email.send_email(
        to=data.get('to'),
        subject=data.get('subject'),
        body=data.get('body'),
        html_body=data.get('html_body')
    )
    
    if result:
        # Log as activity if contact specified
        if data.get('contact_id'):
            scout_email.log_sent_email(
                to=data.get('to'),
                subject=data.get('subject'),
                body=data.get('body'),
                contact_id=data.get('contact_id'),
                deal_id=data.get('deal_id')
            )
        
        return jsonify({'message': 'Email sent', 'id': result['id']})
    else:
        return jsonify({'error': 'Failed to send email'}), 500

@app.route('/api/emails/sync', methods=['POST'])
def sync_emails():
    """Sync Gmail inbox"""
    days = request.json.get('days', 7)
    synced = scout_email.sync_inbox(days_back=days)
    
    return jsonify({
        'synced_count': len(synced),
        'emails': synced
    })

# ============ CALENDAR ============

from scout_calendar import scout_calendar

@app.route('/api/calendar/events', methods=['GET'])
def get_calendar_events():
    """Get upcoming calendar events"""
    days = int(request.args.get('days', 7))
    events = scout_calendar.get_upcoming_meetings(days=days)
    return jsonify({'events': events})

@app.route('/api/calendar/events', methods=['POST'])
def create_calendar_event():
    """Create calendar event"""
    data = request.json
    
    from datetime import datetime
    start_time = datetime.fromisoformat(data.get('start_time'))
    end_time = datetime.fromisoformat(data.get('end_time'))
    
    result = scout_calendar.create_meeting(
        title=data.get('title'),
        start_time=start_time,
        end_time=end_time,
        attendees=data.get('attendees', []),
        description=data.get('description', ''),
        contact_id=data.get('contact_id'),
        deal_id=data.get('deal_id')
    )
    
    if result:
        return jsonify({'message': 'Event created', 'event': result})
    else:
        return jsonify({'error': 'Failed to create event'}), 500

@app.route('/api/calendar/sync', methods=['POST'])
def sync_calendar():
    """Sync calendar to activities"""
    days = request.json.get('days', 30)
    synced = scout_calendar.sync_meetings_to_activities(days=days)
    return jsonify({'synced_count': synced})

# ============ DEAL SCORING ============

@app.route('/api/deals/<deal_id>/score', methods=['GET'])
def get_deal_score(deal_id):
    """Get deal score"""
    score = ai_briefing.calculate_deal_score(deal_id)
    if not score:
        return jsonify({'error': 'Deal not found'}), 404
    return jsonify(score)

@app.route('/api/deals/score-all', methods=['POST'])
def score_all_deals():
    """Score all deals"""
    owner_id = request.json.get('owner_id')
    scored = ai_briefing.score_all_deals(owner_id)
    return jsonify({
        'scored_count': len(scored),
        'deals': scored[:20]
    })

@app.route('/api/deals/score-distribution', methods=['GET'])
def get_score_distribution():
    """Get distribution of deal scores"""
    owner_id = request.args.get('owner_id')
    distribution = ai_briefing.get_score_distribution(owner_id)
    return jsonify(distribution)

# ============ EMAIL TEMPLATES ============

@app.route('/api/templates', methods=['GET'])
def list_templates():
    """List all email templates"""
    category = request.args.get('category')
    
    with db.get_connection() as conn:
        query = "SELECT * FROM email_templates WHERE 1=1"
        params = []
        if category:
            query += " AND category = ?"
            params.append(category)
        query += " ORDER BY usage_count DESC"
        
        rows = conn.execute(query, params).fetchall()
        
        return jsonify({
            'templates': [
                {
                    'id': row['id'],
                    'name': row['name'],
                    'subject': row['subject'],
                    'body': row['body'][:200] + '...' if len(row['body']) > 200 else row['body'],
                    'category': row['category'],
                    'variables': json.loads(row['variables'] or '[]'),
                    'usage_count': row['usage_count'],
                    'is_default': row['is_default']
                }
                for row in rows
            ]
        })

@app.route('/api/templates', methods=['POST'])
def create_template():
    """Create new email template"""
    data = request.json
    
    template_id = generate_id()
    now = datetime.now().isoformat()
    
    # Extract variables from body using regex {{variable}}
    import re
    variables = re.findall(r'\{\{(\w+)\}\}', data.get('body', ''))
    variables = list(set(variables))  # Remove duplicates
    
    with db.get_connection() as conn:
        conn.execute("""
            INSERT INTO email_templates (id, name, subject, body, html_body, category, 
                variables, created_by, is_default, usage_count, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            template_id,
            data.get('name', ''),
            data.get('subject', ''),
            data.get('body', ''),
            data.get('html_body'),
            data.get('category', 'general'),
            json.dumps(variables),
            data.get('created_by'),
            data.get('is_default', False),
            0,
            now,
            now
        ))
        conn.commit()
    
    return jsonify({'id': template_id, 'message': 'Template created'}), 201

@app.route('/api/templates/<template_id>', methods=['GET'])
def get_template(template_id):
    """Get specific template"""
    with db.get_connection() as conn:
        row = conn.execute(
            "SELECT * FROM email_templates WHERE id = ?", (template_id,)
        ).fetchone()
        
        if not row:
            return jsonify({'error': 'Template not found'}), 404
        
        return jsonify({
            'id': row['id'],
            'name': row['name'],
            'subject': row['subject'],
            'body': row['body'],
            'html_body': row['html_body'],
            'category': row['category'],
            'variables': json.loads(row['variables'] or '[]'),
            'usage_count': row['usage_count'],
            'is_default': row['is_default']
        })

@app.route('/api/templates/<template_id>/render', methods=['POST'])
def render_template(template_id):
    """Render template with variables"""
    data = request.json
    variables = data.get('variables', {})
    
    with db.get_connection() as conn:
        row = conn.execute(
            "SELECT * FROM email_templates WHERE id = ?", (template_id,)
        ).fetchone()
        
        if not row:
            return jsonify({'error': 'Template not found'}), 404
        
        # Replace variables
        subject = row['subject']
        body = row['body']
        
        for key, value in variables.items():
            placeholder = '{{' + key + '}}'
            subject = subject.replace(placeholder, str(value))
            body = body.replace(placeholder, str(value))
        
        return jsonify({
            'subject': subject,
            'body': body
        })


# ============ REPORT UPLOAD ============

@app.route('/api/reports/upload', methods=['POST'])
def upload_report():
    """Upload and analyze sales report"""
    from scout_analyzer import analyze_report
    
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    # Save uploaded file
    from werkzeug.utils import secure_filename
    import os
    
    uploads_dir = Path('/Users/aleckennedy/.openclaw/workspace/scout_reports')
    uploads_dir.mkdir(exist_ok=True)
    
    filename = secure_filename(file.filename)
    filepath = uploads_dir / f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{filename}"
    file.save(filepath)
    
    try:
        # Analyze with AI
        result = analyze_report(str(filepath))
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': f'Analysis failed: {str(e)}'}), 500


if __name__ == '__main__':
    print("Scout Sales API starting...")
    print(f"Database: {db.db_path}")
    app.run(host='0.0.0.0', port=5001, debug=True)
