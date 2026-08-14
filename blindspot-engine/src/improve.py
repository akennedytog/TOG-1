"""Auto-improvement loop - learns from past analyses to get better over time."""
import json
import os
import sqlite3
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from pathlib import Path

DB_DIR = Path(__file__).parent.parent / "data"
DB_PATH = DB_DIR / "blindspot.db"

def get_db():
    DB_DIR.mkdir(exist_ok=True)
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn

def init_improvement_tables():
    conn = get_db()
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS improvement_feedback (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            analysis_id INTEGER,
            insight_type TEXT,
            insight_text TEXT,
            rating INTEGER DEFAULT 0,
            feedback TEXT,
            created_at TEXT DEFAULT (datetime('now'))
        );
        CREATE TABLE IF NOT EXISTS improvement_metrics (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            metric_name TEXT UNIQUE,
            metric_value REAL,
            updated_at TEXT DEFAULT (datetime('now'))
        );
        CREATE TABLE IF NOT EXISTS improvement_patterns (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            pattern_name TEXT UNIQUE,
            pattern_data TEXT,
            success_count INTEGER DEFAULT 0,
            fail_count INTEGER DEFAULT 0,
            last_used TEXT
        );
    """)
    conn.commit()
    conn.close()

class AutoImprover:
    """Learns from analysis results to improve future outputs."""
    
    def __init__(self):
        init_improvement_tables()
    
    def record_feedback(self, analysis_id: int, insight_type: str, 
                        insight_text: str, rating: int, feedback: str = ""):
        """Record user feedback on an insight."""
        conn = get_db()
        conn.execute("""
            INSERT INTO improvement_feedback 
            (analysis_id, insight_type, insight_text, rating, feedback)
            VALUES (?, ?, ?, ?, ?)
        """, (analysis_id, insight_type, insight_text, rating, feedback))
        conn.commit()
        conn.close()
    
    def get_best_patterns(self, limit: int = 5) -> List[Dict]:
        """Get the highest-success patterns."""
        conn = get_db()
        rows = conn.execute("""
            SELECT * FROM improvement_patterns 
            WHERE success_count > fail_count
            ORDER BY (success_count * 1.0 / MAX(success_count + fail_count, 1)) DESC
            LIMIT ?
        """, (limit,)).fetchall()
        conn.close()
        return [dict(r) for r in rows]
    
    def get_metrics(self) -> Dict:
        """Get all improvement metrics."""
        conn = get_db()
        rows = conn.execute("SELECT * FROM improvement_metrics").fetchall()
        conn.close()
        return {r["metric_name"]: r["metric_value"] for r in rows}
    
    def update_metric(self, name: str, value: float):
        conn = get_db()
        conn.execute("""
            INSERT INTO improvement_metrics (metric_name, metric_value, updated_at)
            VALUES (?, ?, datetime('now'))
            ON CONFLICT(metric_name) DO UPDATE SET 
                metric_value = excluded.metric_value,
                updated_at = datetime('now')
        """, (name, value))
        conn.commit()
        conn.close()
    
    def get_average_rating(self, days: int = 7) -> float:
        """Get average feedback rating from recent analyses."""
        conn = get_db()
        row = conn.execute("""
            SELECT AVG(rating) as avg_rating 
            FROM improvement_feedback 
            WHERE created_at >= datetime('now', ?)
        """, (f"-{days} days",)).fetchone()
        conn.close()
        return row["avg_rating"] if row and row["avg_rating"] else 0.0

# Initialize on import
init_improvement_tables()
