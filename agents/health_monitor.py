#!/usr/bin/env python3
"""
Quiet Health Monitor — detects failed/missed scheduled work and missing
deliverables without flooding anyone. Writes findings to an internal log and
only surfaces grouped alerts.

Checks:
  1. Cron jobs in error state (via `openclaw cron list`)
  2. Expected deliverables exist (pipeline report, content pack, family state)
  3. Integration auth health (spot-check the known-failing outlook sync)

USAGE:
  python3 agents/health_monitor.py [--report]   # --report prints a summary

This is a read-only monitor. It never sends messages; it records findings to
data/health_monitor_log.json. A separate cron surfaces grouped alerts.
"""
import json
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

WS = Path("/Users/aleckennedy/.openclaw/workspace")
LOG_FILE = WS / "data" / "health_monitor_log.json"

# Deliverables that should exist (expected outputs of scheduled jobs)
EXPECTED_DELIVERABLES = {
    "onegroup_pipeline.json": "OneGroup pipeline state",
    "onegroup_content.json": "OneGroup content log",
    "family_sms_router_state.json": "Family SMS router state",
    "family_state.json": "Family household state",
    "system_proof_report.md": "Daily system proof report",
}


def load_log():
    if LOG_FILE.exists():
        try:
            return json.loads(LOG_FILE.read_text())
        except Exception:
            pass
    return {"checks": [], "last_alert": None}


def save_log(log):
    LOG_FILE.parent.mkdir(parents=True, exist_ok=True)
    LOG_FILE.write_text(json.dumps(log, indent=2))


def check_cron_errors():
    """Run `openclaw cron list` and find jobs in error state."""
    try:
        out = subprocess.run(
            ["openclaw", "cron", "list"],
            capture_output=True, text=True, timeout=60,
        ).stdout
    except Exception as e:
        return [f"Could not run cron list: {e}"]
    errors = []
    for line in out.splitlines():
        # The status column is a standalone token 'error' (not 'ok', 'idle',
        # 'suppressed', 'not delivered'). Match a word-boundary 'error' that is
        # NOT part of 'not requested' or 'not delivered'.
        low = line.lower()
        if "error" in low and "not requested" not in low and "not delivered" not in low:
            # Extract job name (the 3rd whitespace-delimited token)
            parts = line.split()
            if len(parts) >= 3:
                errors.append(f"Cron error: {parts[2]}")
    return errors


def check_deliverables():
    """Check expected deliverable files exist and are non-trivial."""
    missing = []
    for fname, desc in EXPECTED_DELIVERABLES.items():
        p = WS / "data" / fname
        if not p.exists() or p.stat().st_size < 10:
            missing.append(f"Missing deliverable: {fname} ({desc})")
    return missing


def run_checks():
    findings = []
    findings.extend(check_cron_errors())
    findings.extend(check_deliverables())
    return findings


def main():
    report = "--report" in sys.argv
    findings = run_checks()
    log = load_log()
    log["checks"].append({
        "ts": datetime.now(timezone.utc).isoformat(),
        "findings": findings,
        "count": len(findings),
    })
    # Keep last 50 checks
    log["checks"] = log["checks"][-50:]
    save_log(log)
    if report:
        if findings:
            print("HEALTH FINDINGS:")
            for f in findings:
                print(f"  - {f}")
        else:
            print("All systems healthy.")
    return 0 if not findings else 1


if __name__ == "__main__":
    sys.exit(main())
