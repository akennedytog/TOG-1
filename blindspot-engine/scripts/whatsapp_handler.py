#!/usr/bin/env python3
"""WhatsApp handler for Blind Spot Engine - processes domain descriptions and returns reports."""

import sys
import os
import json
import asyncio
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from src.engine import BlindSpotEngine

async def analyze_and_format(domain: str) -> str:
    """Run analysis and format for WhatsApp."""
    engine = BlindSpotEngine()
    report = await engine.analyze(domain)
    
    # Format for WhatsApp (no markdown tables, short and punchy)
    lines = ["🔍 *BLIND SPOT REPORT*", ""]
    
    # Top insights
    if report.top_insights:
        lines.append("*🔥 Top Blind Spots:*")
        for i, insight in enumerate(report.top_insights[:5], 1):
            # Clean up markdown for WhatsApp
            clean = insight.replace('**', '*').replace('🤔', '').replace('🧠', '').replace('🔄', '').strip()
            lines.append(f"{i}. {clean[:200]}")
        lines.append("")
    
    # Best anti-queries
    if report.anti_queries:
        lines.append("*🤔 Questions You're Not Asking:*")
        for q in report.anti_queries[:5]:
            lines.append(f"• {q['question'][:200]}")
        lines.append("")
    
    # Best assumptions
    if report.assumptions:
        lines.append("*🧠 Hidden Assumptions:*")
        for a in report.assumptions[:3]:
            lines.append(f"• {a['statement'][:200]}")
        lines.append("")
    
    # Best cross-domain patterns
    if report.cross_domain_matches:
        lines.append("*🔄 Cross-Domain Insights:*")
        for m in report.cross_domain_matches[:3]:
            p = m.get('pattern', {})
            lines.append(f"• [{p.get('source_domain', '?')}] {m.get('question', '')[:200]}")
        lines.append("")
    
    lines.append(f"_{len(report.anti_queries)} questions · {len(report.assumptions)} assumptions · {len(report.cross_domain_matches)} patterns_")
    lines.append("")
    lines.append("Send me another domain to analyze, or visit the web UI at http://localhost:8766")
    
    return "\n".join(lines)

async def main():
    if len(sys.argv) < 2:
        print("Usage: python whatsapp_handler.py <domain-description>")
        sys.exit(1)
    
    domain = " ".join(sys.argv[1:])
    result = await analyze_and_format(domain)
    print(result)

if __name__ == "__main__":
    asyncio.run(main())
