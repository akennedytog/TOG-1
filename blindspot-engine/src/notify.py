"""Notification integrations for Blind Spot Engine - Slack, WhatsApp, Email alerts."""
import json
import os
import asyncio
from typing import Dict, List, Optional
from datetime import datetime

class Notifier:
    """Send blind spot alerts via Slack, WhatsApp, or email."""
    
    def __init__(self):
        self.slack_webhook = os.environ.get("BLINDSPOT_SLACK_WEBHOOK", "")
        self.whatsapp_enabled = False  # Requires OpenClaw WhatsApp channel
    
    async def send_slack(self, message: str, webhook: str = "") -> bool:
        """Send a Slack message via webhook."""
        url = webhook or self.slack_webhook
        if not url:
            return False
        import httpx
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.post(url, json={"text": message})
                return resp.status_code == 200
        except Exception:
            return False
    
    async def send_alert(self, domain: str, top_insights: List[str], 
                         n_queries: int, n_assumptions: int, channel: str = "slack") -> bool:
        """Send a formatted blind spot alert."""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M")
        
        if channel == "slack":
            blocks = [
                {
                    "type": "header",
                    "text": {"type": "plain_text", "text": f"🔍 Blind Spot Alert: {domain[:50]}"}
                },
                {
                    "type": "section",
                    "text": {"type": "mrkdwn", "text": f"*Analysis complete* | {n_queries} questions, {n_assumptions} assumptions"}
                }
            ]
            
            if top_insights:
                insights_text = "\n".join([f"• {i[:200]}" for i in top_insights[:3]])
                blocks.append({
                    "type": "section",
                    "text": {"type": "mrkdwn", "text": f"*Top Insights:*\n{insights_text}"}
                })
            
            blocks.append({
                "type": "context",
                "elements": [{"type": "mrkdwn", "text": f"Generated {timestamp} | Blind Spot Engine v1.0"}]
            })
            
            return await self.send_slack(json.dumps({"blocks": blocks}))
        
        return False
    
    async def send_whatsapp(self, message: str) -> bool:
        """Send a WhatsApp message (requires OpenClaw WhatsApp integration)."""
        if not self.whatsapp_enabled:
            return False
        # WhatsApp integration would use OpenClaw's messaging API
        # Placeholder for future implementation
        return False

# Convenience function
async def alert(domain: str, insights: List[str], n_q: int, n_a: int):
    notifier = Notifier()
    await notifier.send_alert(domain, insights, n_q, n_a)
