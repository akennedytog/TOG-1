#!/usr/bin/env python3
"""
Iris standalone runner — runs outreach drafting only.
Split from arlo_iris_pipeline.py (2026-08-08) so outreach runs independently
of Arlo research, with its own realistic cron timeout.
"""
import subprocess, sys, time
from datetime import datetime
from pathlib import Path

WS = Path("/Users/aleckennedy/.openclaw/workspace")
IRIS = WS / "agents/iris_real.py"

def main():
    print(f"✉️ Iris standalone starting {datetime.now():%Y-%m-%d %H:%M:%S}")
    t0 = time.time()
    try:
        r = subprocess.run([sys.executable, str(IRIS)], capture_output=True, text=True, timeout=900)
        print(r.stdout)
        if r.returncode != 0:
            print(f"⚠️ Iris stderr: {r.stderr}")
            sys.exit(1)
    except subprocess.TimeoutExpired:
        print("❌ Iris timed out after 900s")
        sys.exit(1)
    print(f"✅ Iris finished in {round(time.time()-t0,1)}s")

if __name__ == "__main__":
    main()
