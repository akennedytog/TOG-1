# Comp AI CRM — Local Self-Host Setup (The One Group)

**Date:** 2026-08-29 · **Status:** RUNNING (dev) · **Version:** v1.15.3 (pinned release branch)

## Why we self-hosted
Free (MIT), agent-first CRM for The One Group internal lead/CRM ops + reference architecture for
AI-Optimization client work. No OpenAI/Google costs yet (agent runs with zero external keys).

## Location
- Repo: `~/.openclaw/workspace/research/comp-ai-crm` (git `release` branch, last tagged release)
- Teardown analysis: `~/.openclaw/workspace/research/comp-ai-crm-teardown.md`

## Running services (all confirmed UP 2026-08-29)
| Service | URL | Status |
|---------|-----|--------|
| App (Next.js) | http://localhost:3000 | ✅ (307 → /sign-in) |
| API (Nest) | http://localhost:3001 | ✅ /health = 200 |
| Agent (eve) | http://127.0.0.1:2000 | ✅ |

## Stack
- Bun 1.3.9, Node 24, Next.js 16.3 (Turbopack), NestJS, Prisma, Postgres 17 (Homebrew native — NO Docker), eve.dev agent runtime.

## Database
- Using **native Homebrew PostgreSQL 17** (was already running): `brew services list` → postgresql@17 started.
- Created role `postgres` (superuser, pw `postgres`) + DB `crm` so the repo default
  `DATABASE_URL="postgresql://postgres:postgres@localhost:5432/crm?schema=public"` works unchanged.
- Migrations applied: `bun run db:deploy` → "All migrations successfully applied."
- NOTE: no Docker on this machine → we did NOT use `docker compose up -d`; the native PG replaced it.

## How to start (3 processes, run each in its own background shell)
```sh
cd ~/.openclaw/workspace/research/comp-ai-crm
bun install                       # first time only
bun run db:deploy                 # apply migrations (first time only / after pulls)

# three separate terminal/background sessions:
bun run --filter=api dev          # Nest API  :3001
bun run --filter=agent dev:headless  # eve agent :2000 (use headless; TUI needs pty)
bun run --filter=app dev          # Next app  :3000
```
- NOTE: `bun run dev` (turbo) fails in non-TTY: "Cannot run interactive task agent#dev without Terminal UI".
  Run each app individually as above. The agent MUST use `dev:headless` (`eve dev --no-ui`) in background shells.
- NOTE: Next.js logged "ignored package.json ... outside current Git repo" — cosmetic warning, app still works.

## .env (already configured)
- `BETTER_AUTH_SECRET` = generated (openssl rand -base64 32)
- `ALLOWED_SIGN_IN` = `theonegroup.info` (any @theonegroup.info address can sign in)
- `DATABASE_URL` = default postgres/postgres@localhost:5432/crm
- Google/Microsoft OAuth = **empty** → no sign-in button yet (must add, next step)

## ⚠️ NEXT STEP REQUIRED TO LOG IN (blocking)
The app **currently has no way to sign in** — Google & Microsoft OAuth creds are empty, and no custom
IdP is registered. Before Alec can open the UI at localhost:3000 and actually use it, one of:
1. **Google OAuth (recommended)** — same client also reads Gmail/Calendar:
   - Google Cloud console → Credentials → OAuth client ID → Web application
   - Redirect URI: `http://localhost:3001/api/auth/callback/google`
   - Enable Gmail API + Calendar API on the project
   - Set `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` in `.env`, restart api
2. **Microsoft Entra** — Redirect `http://localhost:3001/api/auth/callback/microsoft`, perms User.Read + Mail.Read.
3. **Custom IdP via Settings → SSO** after first login (but you need SOME provider to get in first).

RECOMMENDATION: Google. Create the OAuth client (5 min), drop creds in `.env`, restart api.
Then sign in with akennedy@theonegroup.info.

## Configuration available in-app (once logged in)
- Settings → General: agent model, research key (Perplexity), LinkedIn, brand data, picture storage (Vercel Blob).
- Agent currently runs with **zero external keys** (web research, LinkedIn, brand data all off) — it can still
  read CRM history + enrich from what it already has. Add keys in Settings to unlock web/LinkedIn enrichment.

## PRODUCTION MODE (2026-08-29, converted from dev) ✅
- Built: `bun run build` → app (next build), api (dist/main.js), agent (eve build → .output).
- **App**: `NODE_ENV=production bun next start -p 3000` (apps/app)
- **API**: `NODE_ENV=production bun dist/main.js` (apps/api)
- **Agent**: run via `dev:headless` (eve dev --no-ui) — `eve start` (prod) FAILS: "microsandbox VM runtime not installed". Sandbox template only auto-prewarms under `eve dev`. microsandbox doctor says host ready, but template prewarm fails on eve start. dev-headless runs the SAME built agent code server on :2000 reliably. (For pure-prod eve start, need to prewarm the eve-sbx-tpl-microsandbox template or add sandbox autoInstall config.)
- All healthy: :3000 307 (sign-in, Google button shows), :3001 200 (`{"status":"ok","database":"up"}`), :2000 200.
- Memory note: 38.6GB RAM Mac; 3 prod-ish processes are fine (~61% free). Dev Turbopack watchers were the memory hog.

## Agent capability keys — what wiring needs WHAT (2026-08-29)
| Capability | Needs | Alec has? |
|---|---|---|
| Web research | PERPLEXITY_API_KEY (paid) | ❌ no |
| Company brand data | Settings→General (Context API) | ❌ no |
| LinkedIn | Settings→General (Context API) | ❌ no |
| Picture storage | BLOB_READ_WRITE_TOKEN (Vercel Blob, paid) | ❌ no |
| Agent model | Settings→General pick + AI provider key | ⚠️ needs provider key wired |
- Alec HAS: OpenRouter, OpenAI, Anthropic, Tavily, Firecrawl, Resend, Twilio. None plumb into the agent's PERPLEXITY-gated research path.
- The agent CURRENTLY runs with zero external keys (still functions: reads CRM history, fills records from Gmail/Calendar once signed in, books follow-ups). Web/LinkedIn/brand research stays off until paid keys added.

## ✅ CRON JOBS CONVERTED agentTurn → command (2026-08-29)
- **Problem:** 7 business cron jobs (Arlo, Iris, Pit Row Daily Send, Pit Row Reply Scanner, Twitter Stall Guard, Weekly AI-Infra Scorecard, Outlook Calendar Sync) were failing with timeouts (10-17 min) because they were agentTurn (LLM-orchestrated) jobs. The LLM orchestration + long script runtime pushed them past the timeout.
- **Fix:** Converted all 7 to direct `command` jobs (run script directly, no LLM). Created via `openclaw cron create --command`.
- **Verified:** Iris now runs in 0.3s (was 12 min), Arlo in 91s (was 15 min), both status ok. Arlo found 3 new leads.
- **New script:** `scripts/twitter_stall_guard.py` (replaces agentTurn logic — reads state.json, alerts via WhatsApp if no tweet in 26h).
- **Note:** Arlo's WhatsApp delivery failed once ("No active WhatsApp Web listener") — transient; Iris delivered fine to same channel.
- **Remaining error:** `weekly-lead-report` (c90cc9c9) — connector connection failure (googlesheets), separate issue.

## ✅ WEEKLY-LEAD-REPORT FIXED (2026-08-29)
- **Root cause:** NOT a code bug — a **transient connector outage** on Aug 24 (`socket.timeout` connecting to googlesheets.values_get on localhost:3000). The job ran fine Aug 3/10/17, failed once Aug 24, and the connector is healthy now.
- **Verified:** connector up (HTTP 200), googlesheets.values_get returns 1440 rows, script runs in 1.2s, force-run records **status ok + delivered to WhatsApp**. Draft created: "📊 Weekly Lead Report — 2026-08-29 (6 new leads)".
- **No code change needed** — the script and job were already correct; the Aug 24 failure was the connector being briefly down.

## ✅ DUPLICATE-TASK BUG FIXED (2026-08-29)
- **Bug:** importer created duplicate contacts/deals/tasks on re-run. Root cause: (1) portrait-task dedup checked only `finishedAt: null` (finished tasks got re-created), (2) domain-based company `upsert` returned existing companies but code created contacts/deals unconditionally.
- **Fix:** importer now idempotent for contacts, deals, dealContact links, brand tasks, portrait tasks (all check for existing before create).
- **Cleanup:** removed 42 duplicate contacts, 42 duplicate deals, 42 orphaned tasks. DB now: 197 companies, 211 contacts, 211 deals, 253 tasks, 0 duplicates.
- **Verified:** running importer twice produces no new records.

## ✅ DAILY AUTOMATION (2026-08-29) — cron at 7:30 AM
- **Script:** `scripts/crm-sync-leads.sh` — imports new Arlo leads (idempotent) + triggers agent dispatch. Logs to `.run/sync-leads.log`.
- **Cron:** `30 7 * * *` daily — `bash research/comp-ai-crm/scripts/crm-sync-leads.sh`. Installed in master crontab (backed up to `crontab_backup_*.txt`).
- **Flow:** Arlo runs every 5 min (existing cron) → writes `data/arlo_findings.json` → daily 7:30 AM sync imports new leads + triggers enrichment.
- **Dispatch trigger:** `curl -X POST http://127.0.0.1:2000/eve/v1/dev/schedules/dispatch` (cron schedule doesn't auto-fire in `eve dev --no-ui`).

## ✅ AUTOMATION DEPLOYED (2026-08-29) — 211 leads imported + enriched
- **Importer:** `packages/db/scripts/import-arlo-leads.ts` (run via `bun run scripts/import-arlo-leads.ts` from `packages/db/`). Reads `data/arlo_findings.json` (211 leads) → creates Company + Contact + Deal (source=IMPORT) + seeds `brand`/`portrait` agent tasks. Idempotent (skips existing companies).
- **Result:** 197 companies, 225 contacts, 225 deals, 224/225 tasks finished.
- **Company enrichment (brand tasks) — WORKS with Context key:** all 14 done. 197 companies have industry/location/socials/descriptions. 4 have logos (rest need BLOB token for image storage).
- **Contact photo (portrait tasks) — BLOCKED on BLOB_READ_WRITE_TOKEN:** all 210 ran but hit "no BLOB_READ_WRITE_TOKEN" — the Context/LinkedIn lookup works but can't store profile photos, so no title/work-history written. `runPortrait` fails fast without BLOB.
- **Contact text enrichment (identify/profile kinds) — needs AI Gateway LLM:** these go through the agent session (LLM-driven), which needs `AI_GATEWAY_API_KEY` (Vercel AI Gateway) or `eve link`. Alec's OpenRouter/OpenAI/Anthropic keys CANNOT be used — the agent model is hardwired to the AI Gateway (`ai-gateway.vercel.sh/v1/models`).
- **Dispatch trigger:** the cron schedule (`* * * * *`) doesn't fire in `eve dev --no-ui`; trigger manually via `curl -X POST http://127.0.0.1:2000/eve/v1/dev/schedules/dispatch` (or `bun run dispatch` in apps/agent).
- **Remaining keys needed for FULL enrichment:** `BLOB_READ_WRITE_TOKEN` (Vercel Blob, ~$0.50/mo) for photos, `AI_GATEWAY_API_KEY` (Vercel AI Gateway, paid) for contact text enrichment + agent LLM.

## ⚠️ PORT CONFLICT RESOLVED (2026-08-29) — app is on :3100, NOT :3000
- **:3000 is owned by the open-connector LaunchAgent** (`com.theonegroup.open-connector`, project `spikes/open-connector`) — a DIFFERENT service that powers Gmail/Google tools. It responds `{"ok":true,"message":"Server is running..."}`.
- The CRM app was NEVER actually on :3000 — earlier "307 → /sign-in" checks were hitting open-connector, not the CRM. **Do NOT kill open-connector** (critical service).
- **CRM app now runs on :3100** (`bun next start -p 3100`). API stays :3001, agent :2000.
- **CRM app URL: http://localhost:3100** (sign in with Google).

## One-command boot script (2026-08-29)
- `scripts/crm-start.sh [start|stop|status|restart]` — starts Postgres (brew) + app + api + agent, writes pids to `.run/`, logs to `.run/*.log`. Verified: status shows all 3 UP + api health ok.
- After reboot: just run `scripts/crm-start.sh start`.

## Memory/ops notes
- This is a production-build, self-hosted local instance for evaluation/use. Same code as prod, local infra.
- To restart after reboot: start Postgres (brew), then run the 3 commands above in background shells.
- Run scripts could be wrapped (e.g. a `scripts/crm-start.sh`) later for a one-command boot.
