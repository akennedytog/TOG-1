#!/usr/bin/env python3
"""
Arlo standalone runner — runs lead research only.
Split from arlo_iris_pipeline.py (2026-08-08) so research doesn't block
Iris outreach and each stage gets its own realistic cron timeout.
"""
import subprocess, sys, time
from datetime import datetime
from pathlib import Path

WS = Path("/Users/aleckennedy/.openclaw/workspace")
ARLO = WS / "agents/arlo_real.py"

def main():
    print(f"🔍 Arlo standalone starting {datetime.now():%Y-%m-%d %H:%M:%S}")
    t0 = time.time()
    try:
        r = subprocess.run([sys.executable, str(ARLO)], capture_output=True, text=True, timeout=1200)
        print(r.stdout)
        if r.returncode != 0:
            print(f"⚠️ Arlo stderr: {r.stderr}")
            sys.exit(1)
    except subprocess.TimeoutExpired:
        print("❌ Arlo timed out after 1200s")
        sys.exit(1)
    print(f"✅ Arlo finished in {round(time.time()-t0,1)}s")

if __name__ == "__main__":
    main()
