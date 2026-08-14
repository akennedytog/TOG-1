"""Persistent storage for Blind Spot Engine analyses."""

import json
import os
import sqlite3
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from pathlib import Path

DB_DIR = Path(__file__).parent.parent / "data"
DB_PATH = DB_DIR / "blindspot.db"

def get_db() -> sqlite3.Connection:
    DB_DIR.mkdir(exist_ok=True)
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    conn.executescript('''
        CREATE TABLE IF NOT EXISTS analyses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            domain TEXT NOT NULL,
            domain_hash TEXT UNIQUE,
            created_at TEXT DEFAULT (datetime('now')),
            n_queries INTEGER DEFAULT 0,
            n_assumptions INTEGER DEFAULT 0,
            n_patterns INTEGER DEFAULT 0,
            top_insights TEXT,
            report_json TEXT
        );
        CREATE TABLE IF NOT EXISTS watched_domains (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            domain TEXT NOT NULL,
            description TEXT,
            interval_hours INTEGER DEFAULT 24,
            last_checked TEXT,
            next_check TEXT,
            active INTEGER DEFAULT 1,
            created_at TEXT DEFAULT (datetime('now'))
        );
    ''')
    conn.commit()
    conn.close()

def save_analysis(domain: str, report_dict: Dict) -> int:
    import hashlib
    domain_hash = hashlib.md5(domain.encode()).hexdigest()
    conn = get_db()
    
    existing = conn.execute("SELECT id FROM analyses WHERE domain_hash = ?", (domain_hash,)).fetchone()
    if existing:
        conn.execute("""
            UPDATE analyses SET 
                n_queries=?, n_assumptions=?, n_patterns=?, 
                top_insights=?, report_json=?, created_at=datetime('now')
            WHERE domain_hash=?
        """, (
            len(report_dict.get('anti_queries', [])),
            len(report_dict.get('assumptions', [])),
            len(report_dict.get('cross_domain_matches', [])),
            json.dumps(report_dict.get('top_insights', [])),
            json.dumps(report_dict),
            domain_hash
        ))
        analysis_id = existing[0]
    else:
        c = conn.execute("""
            INSERT INTO analyses (domain, domain_hash, n_queries, n_assumptions, n_patterns, top_insights, report_json)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            domain[:500],
            domain_hash,
            len(report_dict.get('anti_queries', [])),
            len(report_dict.get('assumptions', [])),
            len(report_dict.get('cross_domain_matches', [])),
            json.dumps(report_dict.get('top_insights', [])),
            json.dumps(report_dict)
        ))
        analysis_id = c.lastrowid
    
    conn.commit()
    conn.close()
    return analysis_id

def get_recent_analyses(limit: int = 10) -> List[Dict]:
    conn = get_db()
    rows = conn.execute("""
        SELECT id, domain, created_at, n_queries, n_assumptions, n_patterns
        FROM analyses ORDER BY created_at DESC LIMIT ?
    """, (limit,)).fetchall()
    conn.close()
    return [dict(r) for r in rows]

def get_analysis(id: int) -> Optional[Dict]:
    conn = get_db()
    row = conn.execute("SELECT * FROM analyses WHERE id = ?", (id,)).fetchone()
    conn.close()
    if row:
        d = dict(row)
        if d.get('report_json'):
            d['report'] = json.loads(d['report_json'])
        if d.get('top_insights'):
            d['top_insights'] = json.loads(d['top_insights'])
        return d
    return None

def add_watched_domain(domain: str, description: str = "", interval_hours: int = 24) -> int:
    conn = get_db()
    next_check = (datetime.now() + timedelta(hours=interval_hours)).isoformat()
    c = conn.execute("""
        INSERT INTO watched_domains (domain, description, interval_hours, next_check)
        VALUES (?, ?, ?, ?)
    """, (domain[:500], description[:1000], interval_hours, next_check))
    conn.commit()
    conn.close()
    return c.lastrowid

def get_domains_due_for_check() -> List[Dict]:
    conn = get_db()
    now = datetime.now().isoformat()
    rows = conn.execute("""
        SELECT * FROM watched_domains 
        WHERE active = 1 AND (next_check IS NULL OR next_check <= ?)
    """, (now,)).fetchall()
    conn.close()
    return [dict(r) for r in rows]

def update_check_time(domain_id: int):
    conn = get_db()
    row = conn.execute("SELECT interval_hours FROM watched_domains WHERE id = ?", (domain_id,)).fetchone()
    if row:
        next_check = (datetime.now() + timedelta(hours=row['interval_hours'])).isoformat()
        conn.execute("""
            UPDATE watched_domains SET last_checked=datetime('now'), next_check=?
            WHERE id=?
        """, (next_check, domain_id))
    conn.commit()
    conn.close()

# Initialize on import
init_db()
