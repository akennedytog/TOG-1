#!/usr/bin/env python3
"""Blind Spot Engine - CLI entry point for WhatsApp and terminal use."""

import sys
import os
import json
import asyncio
from pathlib import Path

# Add project root
sys.path.insert(0, str(Path(__file__).parent.parent))

from src.engine import BlindSpotEngine

async def analyze(domain: str, format: str = "text"):
    """Run blind spot analysis and return formatted results."""
    engine = BlindSpotEngine()
    report = await engine.analyze(domain)
    
    if format == "json":
        return json.dumps(report.to_dict(), indent=2)
    else:
        return report.to_markdown()

def main():
    if len(sys.argv) < 2:
        print("Usage: python blindspot.py <domain-description>")
        print("   or:  python blindspot.py --file <path>")
        sys.exit(1)
    
    if sys.argv[1] == "--file":
        with open(sys.argv[2]) as f:
            domain = f.read()
    else:
        domain = " ".join(sys.argv[1:])
    
    result = asyncio.run(analyze(domain))
    print(result)

if __name__ == "__main__":
    main()
