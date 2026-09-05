---
name: "openclaw-cron-command"
description: "Create silent command-based cron jobs via the openclaw CLI. Use when adding a scheduled shell/script job that runs headless without chat delivery."
---

# Create a Silent Command-Based Cron Job

## When to use
Add a scheduled shell/script job (meeting-inbox watcher, calendar sync, scraper, report generator) that should run headless on the Gateway without delivering output to a chat.

## Steps
1. **Do NOT use the `automations` tool for command jobs.** Its `payload.kind` only accepts `systemEvent`, `agentTurn`, or `script` — a `command` payload is rejected with a validation error. Command jobs go through the CLI.
2. **Add the job with the CLI:**
   ```bash
   openclaw cron add "<job-name>" \
     --cron "<5-field-expr>" \
     --tz "<IANA-timezone>" \
     --command "cd <workspace> && python3 <script>.py" \
     --command-cwd "<workspace>" \
     --no-deliver
   ```
3. **Use `--no-deliver` for silent background jobs.** Without it, cron announce delivery requires an explicit `--channel` when multiple channels are configured (e.g. sms + whatsapp) and the add fails. `--no-deliver` sets `delivery.mode=none`.
4. **Verify it registered:** `openclaw automations list --all | grep <job-name>` — confirm the schedule and that the first run reports `ok`.
5. **Confirm the script is idempotent** (safe to run every interval): it should skip already-processed work and exit cleanly when there's nothing to do.

## Pitfalls
- The `automations` tool is fine for `agentTurn`/`script`/`systemEvent` jobs; only command payloads must use the CLI.
- **`script` payloads are JavaScript, not shell.** A `script` payload runs in the code-mode executor and parses the body as JS — passing a shell command like `python3 /path/script.py` fails with a syntax error (`Unexpected token`). To run a Python/shell script via the `automations` tool, use an `agentTurn` payload whose message tells the agent to run it with the `exec` tool (e.g. `python3 /abs/path/script.py` with the workspace as workdir), and set `delivery.mode=none` for silent runs. Reserve `script` payloads for actual JavaScript.
- **When adding an `agentTurn` job via the `automations` tool with announce delivery, set `delivery.channel` AND `delivery.to` explicitly.** With multiple channels configured (e.g. sms + whatsapp), an announce job without an explicit channel fails with "cron announce delivery requires an explicit channel". Pass both fields (e.g. `{"channel":"whatsapp","to":"+1..."}`) in the job's `delivery` object. This is the `automations`-tool equivalent of the CLI `--channel`/`--to` flags.
- Always pass `--tz` for wall-clock cron expressions; never pre-convert to UTC.
- For a job that only acts when new work exists, keep delivery `none` so it doesn't spam a channel on every no-op run.

## When the macOS `crontab` install hangs
On macOS the `crontab <file>` install can hang indefinitely when the cron daemon is stuck (symptom: `/var/at/tabs` is empty, `cron.pid` stale, `crontab -l` still works but install never returns). Without passwordless sudo you cannot restart the daemon (`sudo kill <cronpid>` + `launchctl unload/load com.vix.cron`). Do not fight it.

**Working recovery — self-throttle in the script instead of editing crontab:** keep the existing cron line untouched and add a budget guard inside the script so the expensive work only runs a few times per day while the cheap ticks no-op. Pattern:
- A small state file (e.g. `data/<job>_throttle.json`) holding `{"date": null, "runs": 0}`.
- On each run, if `date != today` reset `runs=0`; if `runs < MAX_PER_DAY` run the expensive step and increment, else print a "throttled" line and skip.
- This keeps the cron harmless (no wasted API/credits) without needing a crontab edit, and the throttle state is visible for verification.

## Editing an existing job
- The `automations` tool only sees jobs owned by the current session; many schedule-wide jobs are invisible to it. Use `openclaw automations get <id>` (not `update`) to read any job by id.
- To change an existing job's delivery route, the command is `edit` (there is no `update`): `openclaw automations edit <id> --channel <whatsapp|sms|...> --to <number> --announce`. This fixes the "delivery channel `last` has no route, will fail-closed" warning on announce jobs.
- A manual debug run with `--run-mode force` on a one-shot / agentTurn job can **auto-disable it**. After testing via a forced run, check the job is still enabled and re-enable if not.
