
"""Continuous monitoring module - watches domains and alerts on new blind spots."""
import asyncio, json, os, time
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import src.storage as storage
from src.engine import BlindSpotEngine

class DomainMonitor:
    """Monitors domains for new blind spots over time."""
    
    def __init__(self, check_interval: int = 3600):
        self.engine = BlindSpotEngine()
        self.check_interval = check_interval
        self.running = False
    
    async def check_domain(self, domain_id: int, domain: str, description: str) -> Dict:
        """Run a single domain check and compare with previous results."""
        report = await self.engine.analyze(description)
        report_dict = report.to_dict()
        aid = storage.save_analysis(domain, report_dict)
        
        # Get previous analysis for comparison
        prev = storage.get_recent_analyses(5)
        prev_for_domain = [p for p in prev if p["domain"] == domain and p["id"] != aid]
        
        changes = {
            "new_analysis_id": aid,
            "domain": domain,
            "timestamp": datetime.now().isoformat(),
            "n_queries": len(report.anti_queries),
            "n_assumptions": len(report.assumptions),
            "n_patterns": len(report.cross_domain_matches),
            "new_insights": report.top_insights[:3],
            "previous_count": len(prev_for_domain),
        }
        
        storage.update_check_time(domain_id)
        return changes
    
    async def run_cycle(self):
        """Check all domains due for monitoring."""
        domains = storage.get_domains_due_for_check()
        results = []
        for d in domains:
            try:
                result = await self.check_domain(d["id"], d["domain"], d["description"])
                results.append(result)
                print(f"  Checked: {d['domain'][:40]}... -> {result['n_queries']} queries")
            except Exception as e:
                print(f"  Error checking {d['domain'][:40]}: {e}")
        return results
    
    async def start(self):
        """Start continuous monitoring loop."""
        self.running = True
        while self.running:
            try:
                results = await self.run_cycle()
                if results:
                    print(f"[{datetime.now().isoformat()}] Checked {len(results)} domains")
            except Exception as e:
                print(f"Monitor error: {e}")
            await asyncio.sleep(self.check_interval)
    
    def stop(self):
        self.running = False
