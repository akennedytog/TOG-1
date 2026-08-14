#!/usr/bin/env python3
"""
The One Group - Competitor Intelligence Service
$297/month product: Alert within 1 hour of competitor changes
"""

import json
import os
import hashlib
import time
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional
from dataclasses import dataclass, asdict
import subprocess

@dataclass
class CompetitorSnapshot:
    competitor: str
    url: str
    timestamp: datetime
    content_hash: str
    key_data: Dict
    
class CompetitorIntelService:
    """Monitor competitors and alert on changes"""
    
    CHANGE_TYPES = {
        "pricing": "💰 Pricing Change Detected",
        "feature": "✨ New Feature Launched",
        "hiring": "👥 Hiring Spree (Growth Signal)",
        "content": "📝 Major Content/SEO Update",
        "design": "🎨 Website Redesign",
        "press": "📰 Press Coverage"
    }
    
    def __init__(self):
        self.workspace = Path(os.path.expanduser("~/.openclaw/workspace"))
        self.data_dir = self.workspace / "products" / "competitor-intel" / "data"
        self.data_dir.mkdir(parents=True, exist_ok=True)
        
        self.config_file = self.data_dir / "monitored_competitors.json"
        self.snapshots_dir = self.data_dir / "snapshots"
        self.snapshots_dir.mkdir(exist_ok=True)
        self.alerts_dir = self.data_dir / "alerts"
        self.alerts_dir.mkdir(exist_ok=True)
        
        self._load_config()
        
    def _load_config(self):
        """Load monitored competitors config"""
        if self.config_file.exists():
            with open(self.config_file) as f:
                self.config = json.load(f)
        else:
            self.config = {"competitors": [], "check_interval_minutes": 60}
            self._save_config()
            
    def _save_config(self):
        """Save config to file"""
        with open(self.config_file, 'w') as f:
            json.dump(self.config, f, indent=2)
            
    def add_competitor(self, name: str, url: str, **metadata) -> Dict:
        """Add a competitor to monitoring"""
        competitor = {
            "name": name,
            "url": url,
            "added_at": datetime.now().isoformat(),
            "last_check": None,
            "check_count": 0,
            "alert_count": 0,
            "metadata": metadata
        }
        
        # Check if already exists
        existing = [c for c in self.config["competitors"] if c["name"] == name]
        if existing:
            return {"status": "error", "message": f"{name} already monitored"}
            
        self.config["competitors"].append(competitor)
        self._save_config()
        
        # Take initial snapshot
        self.take_snapshot(name, url)
        
        return {"status": "ok", "competitor": competitor}
    
    def take_snapshot(self, name: str, url: str) -> Optional[CompetitorSnapshot]:
        """Take a snapshot of competitor's current state"""
        try:
            # Use firecrawl to get page content
            result = subprocess.run(
                ["firecrawl", "scrape", url, "--format", "markdown"],
                capture_output=True,
                text=True,
                timeout=30
            )
            
            content = result.stdout
            content_hash = hashlib.sha256(content.encode()).hexdigest()[:16]
            
            # Extract key data
            key_data = self._extract_key_data(content, url)
            
            snapshot = CompetitorSnapshot(
                competitor=name,
                url=url,
                timestamp=datetime.now(),
                content_hash=content_hash,
                key_data=key_data
            )
            
            # Save snapshot
            filename = f"{name}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
            filepath = self.snapshots_dir / filename
            with open(filepath, 'w') as f:
                json.dump(asdict(snapshot), f, indent=2, default=str)
                
            # Update config
            for c in self.config["competitors"]:
                if c["name"] == name:
                    c["last_check"] = datetime.now().isoformat()
                    c["check_count"] = c.get("check_count", 0) + 1
                    break
            self._save_config()
            
            return snapshot
            
        except Exception as e:
            print(f"Error taking snapshot for {name}: {e}")
            return None
    
    def _extract_key_data(self, content: str, url: str) -> Dict:
        """Extract key data points from page content"""
        data = {
            "word_count": len(content.split()),
            "pricing_mentions": len([m for m in content.lower().split() if '$' in m or 'price' in m or 'pricing' in m]),
            "feature_keywords": [],
            "has_careers_page": 'career' in content.lower() or 'jobs' in content.lower() or 'hiring' in content.lower(),
            "has_blog": 'blog' in content.lower() or 'news' in content.lower()
        }
        
        # Look for feature keywords
        feature_words = ['ai', 'automation', 'workflow', 'integration', 'api', 'dashboard']
        for word in feature_words:
            if word in content.lower():
                data["feature_keywords"].append(word)
                
        return data
    
    def check_for_changes(self, name: str) -> List[Dict]:
        """Check for changes since last snapshot"""
        competitor = None
        for c in self.config["competitors"]:
            if c["name"] == name:
                competitor = c
                break
                
        if not competitor:
            return [{"error": f"Competitor {name} not found"}]
            
        # Get latest snapshot
        snapshots = sorted(
            self.snapshots_dir.glob(f"{name}_*.json"),
            key=lambda p: p.stat().st_mtime,
            reverse=True
        )
        
        if len(snapshots) < 2:
            # Take new snapshot for comparison
            new_snapshot = self.take_snapshot(name, competitor["url"])
            return [{"status": "first_snapshot", "message": "Initial baseline established"}]
            
        # Load last two snapshots
        with open(snapshots[0]) as f:
            current = json.load(f)
        with open(snapshots[1]) as f:
            previous = json.load(f)
            
        changes = self._detect_changes(previous, current)
        
        if changes:
            # Record alert
            alert_file = self.alerts_dir / f"{name}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
            with open(alert_file, 'w') as f:
                json.dump({
                    "competitor": name,
                    "detected_at": datetime.now().isoformat(),
                    "changes": changes
                }, f, indent=2)
                
            # Update alert count
            for c in self.config["competitors"]:
                if c["name"] == name:
                    c["alert_count"] = c.get("alert_count", 0) + 1
                    break
            self._save_config()
            
        return changes
    
    def _detect_changes(self, previous: Dict, current: Dict) -> List[Dict]:
        """Detect changes between snapshots"""
        changes = []
        
        prev_data = previous.get("key_data", {})
        curr_data = current.get("key_data", {})
        
        # Check content hash
        if previous.get("content_hash") != current.get("content_hash"):
            # Content changed - determine what changed
            
            # Check if pricing mentions increased
            if curr_data.get("pricing_mentions", 0) > prev_data.get("pricing_mentions", 0):
                changes.append({
                    "type": "pricing",
                    "severity": "high",
                    "message": f"Pricing page content changed significantly",
                    "timestamp": current.get("timestamp")
                })
            
            # Check for new feature keywords
            new_features = set(curr_data.get("feature_keywords", [])) - set(prev_data.get("feature_keywords", []))
            if new_features:
                changes.append({
                    "type": "feature",
                    "severity": "medium",
                    "message": f"New features detected: {', '.join(new_features)}",
                    "timestamp": current.get("timestamp")
                })
            
            # General content change
            if not changes:
                changes.append({
                    "type": "content",
                    "severity": "low",
                    "message": "Website content updated",
                    "timestamp": current.get("timestamp")
                })
                
        return changes
    
    def run_full_check(self) -> Dict:
        """Run check on all monitored competitors"""
        results = {
            "checked_at": datetime.now().isoformat(),
            "competitors_checked": 0,
            "changes_detected": 0,
            "alerts": []
        }
        
        for competitor in self.config["competitors"]:
            name = competitor["name"]
            print(f"Checking {name}...")
            
            # Take new snapshot
            snapshot = self.take_snapshot(name, competitor["url"])
            if snapshot:
                results["competitors_checked"] += 1
                
                # Check for changes
                changes = self.check_for_changes(name)
                if changes and not any("first_snapshot" in str(c) for c in changes):
                    results["changes_detected"] += len(changes)
                    results["alerts"].append({
                        "competitor": name,
                        "changes": changes
                    })
                    
        return results
    
    def get_status(self) -> Dict:
        """Get monitoring status"""
        return {
            "monitored_competitors": len(self.config["competitors"]),
            "competitors": [
                {
                    "name": c["name"],
                    "url": c["url"],
                    "last_check": c.get("last_check"),
                    "total_checks": c.get("check_count", 0),
                    "alerts_triggered": c.get("alert_count", 0)
                }
                for c in self.config["competitors"]
            ],
            "total_snapshots": len(list(self.snapshots_dir.glob("*.json"))),
            "total_alerts": len(list(self.alerts_dir.glob("*.json")))
        }
    
    def generate_alert_email(self, competitor: str, changes: List[Dict]) -> str:
        """Generate alert email content"""
        subject = f"🚨 Competitor Alert: {competitor} just made a move"
        
        body = f"""Your competitor intelligence service detected changes:

Competitor: {competitor}
Detected: {datetime.now().strftime('%Y-%m-%d %H:%M')} ET

Changes Detected:
"""
        for change in changes:
            emoji = self.CHANGE_TYPES.get(change["type"], "📊")[:1]
            body += f"\n{emoji} {change['message']}"
            body += f"\n   Severity: {change.get('severity', 'unknown').upper()}"
            
        body += """

---
Next Steps:
• Review the changes at their website
• Consider your response strategy
• Update your positioning if needed

Reply to this email for strategic recommendations.

The One Group Competitor Intelligence
"""
        return f"Subject: {subject}\n\n{body}"

if __name__ == "__main__":
    import sys
    
    service = CompetitorIntelService()
    
    if len(sys.argv) > 1:
        command = sys.argv[1]
        
        if command == "add" and len(sys.argv) >= 4:
            # python monitor_service.py add "CompetitorName" "https://competitor.com"
            result = service.add_competitor(sys.argv[2], sys.argv[3])
            print(json.dumps(result, indent=2))
            
        elif command == "check" and len(sys.argv) > 2:
            # python monitor_service.py check "CompetitorName"
            changes = service.check_for_changes(sys.argv[2])
            print(json.dumps(changes, indent=2))
            
        elif command == "run":
            # python monitor_service.py run
            results = service.run_full_check()
            print(json.dumps(results, indent=2))
            
        elif command == "status":
            # python monitor_service.py status
            print(json.dumps(service.get_status(), indent=2))
            
        else:
            print("Usage:")
            print("  python monitor_service.py add 'Name' 'URL'")
            print("  python monitor_service.py check 'Name'")
            print("  python monitor_service.py run")
            print("  python monitor_service.py status")
    else:
        print(json.dumps(service.get_status(), indent=2))
