#!/usr/bin/env python3
"""
Scout Database - Core data layer for Scout Sales CRM
SQLite with JSON support for flexible schema
"""

import json
import sqlite3
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
from enum import Enum

DB_PATH = Path('/Users/aleckennedy/.openclaw/workspace/scout_data.db')

class DealStage(Enum):
    PROSPECTING = "prospecting"
    QUALIFICATION = "qualification"
    PROPOSAL = "proposal"
    NEGOTIATION = "negotiation"
    CLOSED_WON = "closed_won"
    CLOSED_LOST = "closed_lost"

class ActivityType(Enum):
    CALL = "call"
    EMAIL = "email"
    MEETING = "meeting"
    NOTE = "note"
    TASK = "task"

@dataclass
class Contact:
    id: str
    first_name: str
    last_name: str
    email: str
    phone: Optional[str] = None
    title: Optional[str] = None
    account_id: Optional[str] = None
    owner_id: Optional[str] = None
    source: Optional[str] = None
    tags: List[str] = None
    custom_fields: Dict = None
    created_at: str = None
    updated_at: str = None
    
    def __post_init__(self):
        if self.tags is None:
            self.tags = []
        if self.custom_fields is None:
            self.custom_fields = {}
        if self.created_at is None:
            self.created_at = datetime.now().isoformat()
        if self.updated_at is None:
            self.updated_at = datetime.now().isoformat()

@dataclass
class Account:
    id: str
    name: str
    domain: Optional[str] = None
    industry: Optional[str] = None
    size: Optional[str] = None  # employee count range
    annual_revenue: Optional[float] = None
    website: Optional[str] = None
    address: Optional[str] = None
    billing_address: Optional[str] = None
    owner_id: Optional[str] = None
    status: str = "active"  # active, churned, prospect
    health_score: Optional[int] = None  # 0-100
    last_activity_at: Optional[str] = None
    next_activity_at: Optional[str] = None
    tags: List[str] = None
    custom_fields: Dict = None
    created_at: str = None
    updated_at: str = None
    
    def __post_init__(self):
        if self.tags is None:
            self.tags = []
        if self.custom_fields is None:
            self.custom_fields = {}
        if self.created_at is None:
            self.created_at = datetime.now().isoformat()
        if self.updated_at is None:
            self.updated_at = datetime.now().isoformat()

@dataclass
class Deal:
    id: str
    name: str
    account_id: str
    contact_id: Optional[str] = None
    owner_id: Optional[str] = None
    stage: str = DealStage.PROSPECTING.value
    value: float = 0.0
    currency: str = "USD"
    probability: Optional[int] = None  # 0-100, auto-calculated or manual
    expected_close_date: Optional[str] = None
    actual_close_date: Optional[str] = None
    source: Optional[str] = None
    priority: str = "medium"  # low, medium, high, urgent
    competitors: List[str] = None
    notes: Optional[str] = None
    tags: List[str] = None
    custom_fields: Dict = None
    created_at: str = None
    updated_at: str = None
    
    def __post_init__(self):
        if self.competitors is None:
            self.competitors = []
        if self.tags is None:
            self.tags = []
        if self.custom_fields is None:
            self.custom_fields = {}
        if self.created_at is None:
            self.created_at = datetime.now().isoformat()
        if self.updated_at is None:
            self.updated_at = datetime.now().isoformat()

@dataclass
class Activity:
    id: str
    type: str  # call, email, meeting, note, task
    contact_id: Optional[str] = None
    account_id: Optional[str] = None
    deal_id: Optional[str] = None
    owner_id: Optional[str] = None
    subject: Optional[str] = None
    description: Optional[str] = None
    outcome: Optional[str] = None  # completed, no_answer, scheduled, etc.
    duration_minutes: Optional[int] = None
    scheduled_at: Optional[str] = None  # for future activities
    completed_at: Optional[str] = None
    metadata: Dict = None  # email thread id, call recording, etc.
    created_at: str = None
    
    def __post_init__(self):
        if self.metadata is None:
            self.metadata = {}
        if self.created_at is None:
            self.created_at = datetime.now().isoformat()

@dataclass
class Task:
    id: str
    title: str
    description: Optional[str] = None
    contact_id: Optional[str] = None
    account_id: Optional[str] = None
    deal_id: Optional[str] = None
    owner_id: Optional[str] = None
    priority: str = "medium"  # low, medium, high, urgent
    status: str = "open"  # open, in_progress, completed, cancelled
    due_date: Optional[str] = None
    completed_at: Optional[str] = None
    ai_suggested: bool = False
    ai_reason: Optional[str] = None
    created_at: str = None
    
    def __post_init__(self):
        if self.created_at is None:
            self.created_at = datetime.now().isoformat()


@dataclass
class EmailTemplate:
    id: str
    name: str
    subject: str
    body: str
    html_body: Optional[str] = None
    category: str = "general"
    variables: List[str] = None
    created_by: Optional[str] = None
    is_default: bool = False
    usage_count: int = 0
    created_at: str = None
    updated_at: str = None
    
    def __post_init__(self):
        if self.variables is None:
            self.variables = []
        if self.created_at is None:
            self.created_at = datetime.now().isoformat()
        if self.updated_at is None:
            self.updated_at = datetime.now().isoformat()

class ScoutDatabase:
    """Main database interface for Scout CRM"""
    
    def __init__(self, db_path: Path = DB_PATH):
        self.db_path = db_path
        self.init_db()
    
    def get_connection(self):
        conn = sqlite3.connect(str(self.db_path))
        conn.row_factory = sqlite3.Row
        return conn
    
    def init_db(self):
        """Initialize database with all tables"""
        with self.get_connection() as conn:
            # Contacts table
            conn.execute("""
                CREATE TABLE IF NOT EXISTS contacts (
                    id TEXT PRIMARY KEY,
                    first_name TEXT NOT NULL,
                    last_name TEXT NOT NULL,
                    email TEXT UNIQUE NOT NULL,
                    phone TEXT,
                    title TEXT,
                    account_id TEXT,
                    owner_id TEXT,
                    source TEXT,
                    tags TEXT,  -- JSON array
                    custom_fields TEXT,  -- JSON object
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                )
            """)
            
            # Accounts table
            conn.execute("""
                CREATE TABLE IF NOT EXISTS accounts (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    domain TEXT,
                    industry TEXT,
                    size TEXT,
                    annual_revenue REAL,
                    website TEXT,
                    address TEXT,
                    billing_address TEXT,
                    owner_id TEXT,
                    status TEXT DEFAULT 'active',
                    health_score INTEGER,
                    last_activity_at TEXT,
                    next_activity_at TEXT,
                    tags TEXT,  -- JSON array
                    custom_fields TEXT,  -- JSON object
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                )
            """)
            
            # Deals table
            conn.execute("""
                CREATE TABLE IF NOT EXISTS deals (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    account_id TEXT NOT NULL,
                    contact_id TEXT,
                    owner_id TEXT,
                    stage TEXT DEFAULT 'prospecting',
                    value REAL DEFAULT 0,
                    currency TEXT DEFAULT 'USD',
                    probability INTEGER,
                    expected_close_date TEXT,
                    actual_close_date TEXT,
                    source TEXT,
                    priority TEXT DEFAULT 'medium',
                    competitors TEXT,  -- JSON array
                    notes TEXT,
                    tags TEXT,  -- JSON array
                    custom_fields TEXT,  -- JSON object
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                )
            """)
            
            # Activities table
            conn.execute("""
                CREATE TABLE IF NOT EXISTS activities (
                    id TEXT PRIMARY KEY,
                    type TEXT NOT NULL,
                    contact_id TEXT,
                    account_id TEXT,
                    deal_id TEXT,
                    owner_id TEXT,
                    subject TEXT,
                    description TEXT,
                    outcome TEXT,
                    duration_minutes INTEGER,
                    scheduled_at TEXT,
                    completed_at TEXT,
                    metadata TEXT,  -- JSON object
                    created_at TEXT NOT NULL
                )
            """)
            
            # Tasks table
            conn.execute("""
                CREATE TABLE IF NOT EXISTS tasks (
                    id TEXT PRIMARY KEY,
                    title TEXT NOT NULL,
                    description TEXT,
                    contact_id TEXT,
                    account_id TEXT,
                    deal_id TEXT,
                    owner_id TEXT,
                    priority TEXT DEFAULT 'medium',
                    status TEXT DEFAULT 'open',
                    due_date TEXT,
                    completed_at TEXT,
                    ai_suggested BOOLEAN DEFAULT 0,
                    ai_reason TEXT,
                    created_at TEXT NOT NULL
                )
            """)
            
            # Email Templates table
            conn.execute("""
                CREATE TABLE IF NOT EXISTS email_templates (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    subject TEXT NOT NULL,
                    body TEXT NOT NULL,
                    html_body TEXT,
                    category TEXT DEFAULT 'general',
                    variables TEXT,  -- JSON array of variable names
                    created_by TEXT,
                    is_default BOOLEAN DEFAULT 0,
                    usage_count INTEGER DEFAULT 0,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                )
            """)
            
            # Indexes for performance
            conn.execute("CREATE INDEX IF NOT EXISTS idx_contacts_account ON contacts(account_id)")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email)")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_deals_account ON deals(account_id)")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_deals_stage ON deals(stage)")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_deals_owner ON deals(owner_id)")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_deals_close_date ON deals(expected_close_date)")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_activities_contact ON activities(contact_id)")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_activities_account ON activities(account_id)")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_activities_deal ON activities(deal_id)")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_tasks_owner ON tasks(owner_id)")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status)")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_tasks_due ON tasks(due_date)")
            
            conn.commit()
    
    # Contact operations
    def create_contact(self, contact: Contact) -> Contact:
        with self.get_connection() as conn:
            conn.execute("""
                INSERT INTO contacts (id, first_name, last_name, email, phone, title, 
                    account_id, owner_id, source, tags, custom_fields, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                contact.id, contact.first_name, contact.last_name, contact.email,
                contact.phone, contact.title, contact.account_id, contact.owner_id,
                contact.source, json.dumps(contact.tags), json.dumps(contact.custom_fields),
                contact.created_at, contact.updated_at
            ))
            conn.commit()
        return contact
    
    def get_contact(self, contact_id: str) -> Optional[Contact]:
        with self.get_connection() as conn:
            row = conn.execute(
                "SELECT * FROM contacts WHERE id = ?", (contact_id,)
            ).fetchone()
            if row:
                return self._row_to_contact(row)
            return None
    
    def get_contact_by_email(self, email: str) -> Optional[Contact]:
        with self.get_connection() as conn:
            row = conn.execute(
                "SELECT * FROM contacts WHERE email = ?", (email,)
            ).fetchone()
            if row:
                return self._row_to_contact(row)
            return None
    
    def list_contacts(self, account_id: Optional[str] = None, 
                     owner_id: Optional[str] = None,
                     limit: int = 100, offset: int = 0) -> List[Contact]:
        with self.get_connection() as conn:
            query = "SELECT * FROM contacts WHERE 1=1"
            params = []
            if account_id:
                query += " AND account_id = ?"
                params.append(account_id)
            if owner_id:
                query += " AND owner_id = ?"
                params.append(owner_id)
            query += " ORDER BY updated_at DESC LIMIT ? OFFSET ?"
            params.extend([limit, offset])
            
            rows = conn.execute(query, params).fetchall()
            return [self._row_to_contact(row) for row in rows]
    
    def update_contact(self, contact_id: str, updates: Dict) -> Optional[Contact]:
        updates['updated_at'] = datetime.now().isoformat()
        
        # Handle JSON fields
        if 'tags' in updates:
            updates['tags'] = json.dumps(updates['tags'])
        if 'custom_fields' in updates:
            updates['custom_fields'] = json.dumps(updates['custom_fields'])
        
        set_clause = ', '.join([f"{k} = ?" for k in updates.keys()])
        values = list(updates.values()) + [contact_id]
        
        with self.get_connection() as conn:
            conn.execute(f"UPDATE contacts SET {set_clause} WHERE id = ?", values)
            conn.commit()
        
        return self.get_contact(contact_id)
    
    # Account operations
    def create_account(self, account: Account) -> Account:
        with self.get_connection() as conn:
            conn.execute("""
                INSERT INTO accounts (id, name, domain, industry, size, annual_revenue,
                    website, address, billing_address, owner_id, status, health_score,
                    last_activity_at, next_activity_at, tags, custom_fields, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                account.id, account.name, account.domain, account.industry,
                account.size, account.annual_revenue, account.website, account.address,
                account.billing_address, account.owner_id, account.status, account.health_score,
                account.last_activity_at, account.next_activity_at,
                json.dumps(account.tags), json.dumps(account.custom_fields),
                account.created_at, account.updated_at
            ))
            conn.commit()
        return account
    
    def get_account(self, account_id: str) -> Optional[Account]:
        with self.get_connection() as conn:
            row = conn.execute(
                "SELECT * FROM accounts WHERE id = ?", (account_id,)
            ).fetchone()
            if row:
                return self._row_to_account(row)
            return None
    
    def list_accounts(self, owner_id: Optional[str] = None,
                     status: Optional[str] = None,
                     limit: int = 100, offset: int = 0) -> List[Account]:
        with self.get_connection() as conn:
            query = "SELECT * FROM accounts WHERE 1=1"
            params = []
            if owner_id:
                query += " AND owner_id = ?"
                params.append(owner_id)
            if status:
                query += " AND status = ?"
                params.append(status)
            query += " ORDER BY updated_at DESC LIMIT ? OFFSET ?"
            params.extend([limit, offset])
            
            rows = conn.execute(query, params).fetchall()
            return [self._row_to_account(row) for row in rows]
    
    def update_account(self, account_id: str, updates: Dict) -> Optional[Account]:
        updates['updated_at'] = datetime.now().isoformat()
        
        if 'tags' in updates:
            updates['tags'] = json.dumps(updates['tags'])
        if 'custom_fields' in updates:
            updates['custom_fields'] = json.dumps(updates['custom_fields'])
        
        set_clause = ', '.join([f"{k} = ?" for k in updates.keys()])
        values = list(updates.values()) + [account_id]
        
        with self.get_connection() as conn:
            conn.execute(f"UPDATE accounts SET {set_clause} WHERE id = ?", values)
            conn.commit()
        
        return self.get_account(account_id)
    
    # Deal operations
    def create_deal(self, deal: Deal) -> Deal:
        with self.get_connection() as conn:
            conn.execute("""
                INSERT INTO deals (id, name, account_id, contact_id, owner_id, stage,
                    value, currency, probability, expected_close_date, actual_close_date,
                    source, priority, competitors, notes, tags, custom_fields, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                deal.id, deal.name, deal.account_id, deal.contact_id, deal.owner_id,
                deal.stage, deal.value, deal.currency, deal.probability,
                deal.expected_close_date, deal.actual_close_date, deal.source,
                deal.priority, json.dumps(deal.competitors), deal.notes,
                json.dumps(deal.tags), json.dumps(deal.custom_fields),
                deal.created_at, deal.updated_at
            ))
            conn.commit()
        return deal
    
    def get_deal(self, deal_id: str) -> Optional[Deal]:
        with self.get_connection() as conn:
            row = conn.execute(
                "SELECT * FROM deals WHERE id = ?", (deal_id,)
            ).fetchone()
            if row:
                return self._row_to_deal(row)
            return None
    
    def list_deals(self, account_id: Optional[str] = None,
                  owner_id: Optional[str] = None,
                  stage: Optional[str] = None,
                  priority: Optional[str] = None,
                  limit: int = 100, offset: int = 0) -> List[Deal]:
        with self.get_connection() as conn:
            query = "SELECT * FROM deals WHERE 1=1"
            params = []
            if account_id:
                query += " AND account_id = ?"
                params.append(account_id)
            if owner_id:
                query += " AND owner_id = ?"
                params.append(owner_id)
            if stage:
                query += " AND stage = ?"
                params.append(stage)
            if priority:
                query += " AND priority = ?"
                params.append(priority)
            query += " ORDER BY updated_at DESC LIMIT ? OFFSET ?"
            params.extend([limit, offset])
            
            rows = conn.execute(query, params).fetchall()
            return [self._row_to_deal(row) for row in rows]
    
    def update_deal(self, deal_id: str, updates: Dict) -> Optional[Deal]:
        updates['updated_at'] = datetime.now().isoformat()
        
        if 'competitors' in updates:
            updates['competitors'] = json.dumps(updates['competitors'])
        if 'tags' in updates:
            updates['tags'] = json.dumps(updates['tags'])
        if 'custom_fields' in updates:
            updates['custom_fields'] = json.dumps(updates['custom_fields'])
        
        set_clause = ', '.join([f"{k} = ?" for k in updates.keys()])
        values = list(updates.values()) + [deal_id]
        
        with self.get_connection() as conn:
            conn.execute(f"UPDATE deals SET {set_clause} WHERE id = ?", values)
            conn.commit()
        
        return self.get_deal(deal_id)
    
    def get_pipeline_summary(self, owner_id: Optional[str] = None) -> Dict:
        """Get pipeline summary by stage"""
        with self.get_connection() as conn:
            query = """
                SELECT stage, COUNT(*) as count, SUM(value) as total_value
                FROM deals
                WHERE stage NOT IN ('closed_won', 'closed_lost')
            """
            params = []
            if owner_id:
                query += " AND owner_id = ?"
                params.append(owner_id)
            query += " GROUP BY stage"
            
            rows = conn.execute(query, params).fetchall()
            
            stages = {}
            total_value = 0
            total_deals = 0
            for row in rows:
                stages[row['stage']] = {
                    'count': row['count'],
                    'value': row['total_value'] or 0
                }
                total_deals += row['count']
                total_value += row['total_value'] or 0
            
            return {
                'stages': stages,
                'total_deals': total_deals,
                'total_value': total_value
            }
    
    # Activity operations
    def create_activity(self, activity: Activity) -> Activity:
        with self.get_connection() as conn:
            conn.execute("""
                INSERT INTO activities (id, type, contact_id, account_id, deal_id,
                    owner_id, subject, description, outcome, duration_minutes,
                    scheduled_at, completed_at, metadata, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                activity.id, activity.type, activity.contact_id, activity.account_id,
                activity.deal_id, activity.owner_id, activity.subject, activity.description,
                activity.outcome, activity.duration_minutes, activity.scheduled_at,
                activity.completed_at, json.dumps(activity.metadata), activity.created_at
            ))
            conn.commit()
        return activity
    
    def get_activities(self, contact_id: Optional[str] = None,
                      account_id: Optional[str] = None,
                      deal_id: Optional[str] = None,
                      owner_id: Optional[str] = None,
                      activity_type: Optional[str] = None,
                      limit: int = 50) -> List[Activity]:
        with self.get_connection() as conn:
            query = "SELECT * FROM activities WHERE 1=1"
            params = []
            if contact_id:
                query += " AND contact_id = ?"
                params.append(contact_id)
            if account_id:
                query += " AND account_id = ?"
                params.append(account_id)
            if deal_id:
                query += " AND deal_id = ?"
                params.append(deal_id)
            if owner_id:
                query += " AND owner_id = ?"
                params.append(owner_id)
            if activity_type:
                query += " AND type = ?"
                params.append(activity_type)
            query += " ORDER BY created_at DESC LIMIT ?"
            params.append(limit)
            
            rows = conn.execute(query, params).fetchall()
            return [self._row_to_activity(row) for row in rows]
    
    # Task operations
    def create_task(self, task: Task) -> Task:
        with self.get_connection() as conn:
            conn.execute("""
                INSERT INTO tasks (id, title, description, contact_id, account_id,
                    deal_id, owner_id, priority, status, due_date, completed_at,
                    ai_suggested, ai_reason, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                task.id, task.title, task.description, task.contact_id, task.account_id,
                task.deal_id, task.owner_id, task.priority, task.status, task.due_date,
                task.completed_at, task.ai_suggested, task.ai_reason, task.created_at
            ))
            conn.commit()
        return task
    
    def get_tasks(self, owner_id: Optional[str] = None,
                 status: Optional[str] = None,
                 priority: Optional[str] = None,
                 due_before: Optional[str] = None,
                 limit: int = 100) -> List[Task]:
        with self.get_connection() as conn:
            query = "SELECT * FROM tasks WHERE 1=1"
            params = []
            if owner_id:
                query += " AND owner_id = ?"
                params.append(owner_id)
            if status:
                query += " AND status = ?"
                params.append(status)
            if priority:
                query += " AND priority = ?"
                params.append(priority)
            if due_before:
                query += " AND due_date <= ?"
                params.append(due_before)
            query += " ORDER BY due_date ASC, priority DESC LIMIT ?"
            params.append(limit)
            
            rows = conn.execute(query, params).fetchall()
            return [self._row_to_task(row) for row in rows]
    
    def complete_task(self, task_id: str) -> Optional[Task]:
        with self.get_connection() as conn:
            conn.execute(
                "UPDATE tasks SET status = 'completed', completed_at = ? WHERE id = ?",
                (datetime.now().isoformat(), task_id)
            )
            conn.commit()
        return self.get_task(task_id)
    
    def get_task(self, task_id: str) -> Optional[Task]:
        with self.get_connection() as conn:
            row = conn.execute(
                "SELECT * FROM tasks WHERE id = ?", (task_id,)
            ).fetchone()
            if row:
                return self._row_to_task(row)
            return None
    
    # Row converters
    def _row_to_contact(self, row: sqlite3.Row) -> Contact:
        return Contact(
            id=row['id'],
            first_name=row['first_name'],
            last_name=row['last_name'],
            email=row['email'],
            phone=row['phone'],
            title=row['title'],
            account_id=row['account_id'],
            owner_id=row['owner_id'],
            source=row['source'],
            tags=json.loads(row['tags'] or '[]'),
            custom_fields=json.loads(row['custom_fields'] or '{}'),
            created_at=row['created_at'],
            updated_at=row['updated_at']
        )
    
    def _row_to_account(self, row: sqlite3.Row) -> Account:
        return Account(
            id=row['id'],
            name=row['name'],
            domain=row['domain'],
            industry=row['industry'],
            size=row['size'],
            annual_revenue=row['annual_revenue'],
            website=row['website'],
            address=row['address'],
            billing_address=row['billing_address'],
            owner_id=row['owner_id'],
            status=row['status'],
            health_score=row['health_score'],
            last_activity_at=row['last_activity_at'],
            next_activity_at=row['next_activity_at'],
            tags=json.loads(row['tags'] or '[]'),
            custom_fields=json.loads(row['custom_fields'] or '{}'),
            created_at=row['created_at'],
            updated_at=row['updated_at']
        )
    
    def _row_to_deal(self, row: sqlite3.Row) -> Deal:
        return Deal(
            id=row['id'],
            name=row['name'],
            account_id=row['account_id'],
            contact_id=row['contact_id'],
            owner_id=row['owner_id'],
            stage=row['stage'],
            value=row['value'],
            currency=row['currency'],
            probability=row['probability'],
            expected_close_date=row['expected_close_date'],
            actual_close_date=row['actual_close_date'],
            source=row['source'],
            priority=row['priority'],
            competitors=json.loads(row['competitors'] or '[]'),
            notes=row['notes'],
            tags=json.loads(row['tags'] or '[]'),
            custom_fields=json.loads(row['custom_fields'] or '{}'),
            created_at=row['created_at'],
            updated_at=row['updated_at']
        )
    
    def _row_to_activity(self, row: sqlite3.Row) -> Activity:
        return Activity(
            id=row['id'],
            type=row['type'],
            contact_id=row['contact_id'],
            account_id=row['account_id'],
            deal_id=row['deal_id'],
            owner_id=row['owner_id'],
            subject=row['subject'],
            description=row['description'],
            outcome=row['outcome'],
            duration_minutes=row['duration_minutes'],
            scheduled_at=row['scheduled_at'],
            completed_at=row['completed_at'],
            metadata=json.loads(row['metadata'] or '{}'),
            created_at=row['created_at']
        )
    
    def _row_to_task(self, row: sqlite3.Row) -> Task:
        return Task(
            id=row['id'],
            title=row['title'],
            description=row['description'],
            contact_id=row['contact_id'],
            account_id=row['account_id'],
            deal_id=row['deal_id'],
            owner_id=row['owner_id'],
            priority=row['priority'],
            status=row['status'],
            due_date=row['due_date'],
            completed_at=row['completed_at'],
            ai_suggested=bool(row['ai_suggested']),
            ai_reason=row['ai_reason'],
            created_at=row['created_at']
        )
    
    # Dashboard data
    def get_dashboard_metrics(self, owner_id: Optional[str] = None) -> Dict:
        """Get key metrics for dashboard"""
        with self.get_connection() as conn:
            metrics = {}
            
            # Pipeline value (open deals)
            query = """
                SELECT COUNT(*) as deal_count, SUM(value * probability / 100.0) as weighted_value
                FROM deals
                WHERE stage NOT IN ('closed_won', 'closed_lost')
            """
            params = []
            if owner_id:
                query += " AND owner_id = ?"
                params.append(owner_id)
            
            row = conn.execute(query, params).fetchone()
            metrics['open_deals'] = row['deal_count'] or 0
            metrics['weighted_pipeline'] = round(row['weighted_value'] or 0, 2)
            
            # Revenue this month
            query = """
                SELECT SUM(value) as revenue
                FROM deals
                WHERE stage = 'closed_won'
                AND strftime('%Y-%m', actual_close_date) = strftime('%Y-%m', 'now')
            """
            params = []
            if owner_id:
                query += " AND owner_id = ?"
                params.append(owner_id)
            
            row = conn.execute(query, params).fetchone()
            metrics['month_revenue'] = row['revenue'] or 0
            
            # Tasks due today
            today = datetime.now().strftime('%Y-%m-%d')
            query = "SELECT COUNT(*) as count FROM tasks WHERE status != 'completed' AND due_date <= ?"
            params = [today]
            if owner_id:
                query += " AND owner_id = ?"
                params.append(owner_id)
            
            row = conn.execute(query, params).fetchone()
            metrics['tasks_today'] = row['count'] or 0
            
            # Activities this week
            week_ago = (datetime.now() - timedelta(days=7)).isoformat()
            query = "SELECT COUNT(*) as count FROM activities WHERE created_at > ?"
            params = [week_ago]
            if owner_id:
                query += " AND owner_id = ?"
                params.append(owner_id)
            
            row = conn.execute(query, params).fetchone()
            metrics['activities_this_week'] = row['count'] or 0
            
            return metrics


# Initialize singleton
db = ScoutDatabase()

if __name__ == "__main__":
    print("Scout Database initialized!")
    print(f"Database location: {DB_PATH}")
    
    # Test insert
    from uuid import uuid4
    
    test_account = Account(
        id=str(uuid4()),
        name="Test Company Inc",
        industry="Technology",
        size="50-200"
    )
    
    db.create_account(test_account)
    print(f"Created test account: {test_account.name}")
    
    # Test query
    accounts = db.list_accounts()
    print(f"Total accounts: {len(accounts)}")
