# Comp AI CRM — Deep Teardown for The One Group

**Date:** 2026-08-29 · **Analyst:** subagent (AI CRM research) · **For:** Alec Kennedy / The One Group
**Repo:** github.com/Trycompai/crm · **Homepage:** trycrm.ai · **Company:** Comp AI (trycomp.ai)

---

## 1. What it is

**Comp AI CRM** is an open-source, **agentic-first CRM**: not a human-CRM with an AI chat bolted on, but a CRM where the AI agent is the primary operator and the CRM is "where the agent keeps its notes." It runs a durable research/enrichment agent on its own deployment, own schedule, and own work queue — independent of the browser. It reads your team's inbox, enriches companies/contacts, books its own follow-ups (with stated reasons), and stops when its research budget runs out.

**Core philosophy (direct from README, worth quoting internally):**
> "Nothing about a person is guessed. No tool accepts a confidence score... Strong evidence writes to the record. Weak evidence becomes a suggestion a human settles. A confidently wrong fact about a customer is worse than a blank field."

This evidence-weighted / confidence-ledger design is its signature differentiation.

### Key agent capabilities
- **Records fill themselves in:** new person on a thread → contact; company arrives with logo, industry, last activity pre-populated.
- **Agents that build agents:** describe a process in a sentence; the agent writes another agent to run it on its own queue/schedule.
- **Self-scheduled research:** `schedule_recheck` books follow-ups with a *reason shown to the rep* ("Recheck Paula 14d", "Brief owner before renewal 2d").
- **Ask any record a question:** reads the target's site + the org's own history with them, shows its working.
- **Per-record Agent tab:** humans can watch steps, see leads thrown away and why, and answer in-place when the agent can't decide between two people.
- **Durable sessions:** survive redeploys and reloads (eve.dev runtime).

## 2. Architecture & Stack (verified from README + repo)

**Monorepo:** Turborepo on **Bun**, deployed on **Vercel**.

| Layer | Tech |
|---|---|
| Agent runtime | **eve.dev** (Vercel's filesystem-first durable-agent framework — tools/skills/schedules are files) |
| Model | Vercel AI Gateway (OIDC, no provider key) |
| Sandbox | Vercel Sandbox (prod) / Docker or microsandbox (local) |
| Front end | **Next.js** App Router · shadcn/ui · nuqs (URL state) |
| API | **NestJS** + nestjs-trpc (HTTP, auth, tRPC, mailbox sync) |
| Data | **Prisma** · **Postgres** (Neon) · optional Redis (Upstash) |
| Auth | Better Auth (Google / Microsoft / custom IdP, allow-list) |
| Files | Vercel Blob (profile pic mirroring) |
| Tooling | Biome · TypeScript everywhere |

**Layout:** `apps/agent` (research agent), `apps/app` (Next.js :3000), `apps/api` (NestJS :3001), `packages/db|auth|ui|env`.

**The agent (how it operates):**
- **18 authored tools:** `read_crm_history`, `search_crm`, `identify_contact`, `research_person`, `enrich_company`, `record_fact`, `schedule_recheck`, + `crm.signature-block`, `github.account-identity`, etc.
- **4 skills:** `evidence.md`, `identity-matching.md`, `data-boundaries.md`, `writing-a-brief.md` (prose the agent reads, versioned like code).
- **1 schedule:** `dispatch.ts` — leases due rows with `FOR UPDATE SKIP LOCKED`; multiple dispatchers take disjoint work; a died run frees its row on lease expiry. **No cron** — due dates live in a task's `dueAt`.
- **Sandbox:** bash/grep/glob + `/workspace`, **deny-all egress**, and crucially the shell is **never given DATABASE_URL** (exfiltration-shaped prevention). Web research runs in the app runtime, not the shell.
- **Works with zero external keys:** reads your own threads/meetings/signature blocks for free; each optional key (Perplexity, Context/LinkedIn) adds one more surface to look at. It's told at session start which keys this install has and plans accordingly.

**Important structural note:** Comp AI is **deliberately single-tenant** — "no organizations," by design (stated as a codebase rule). This matters for whether it can be multi-client.

## 3. Maturity (hard data — GitHub API, fetched today)

| Metric | Value |
|---|---|
| Stars | **~9,083** (~9k, matches task) |
| Forks | **1,123** |
| Open issues | **15** (low, healthy) |
| License | **MIT** |
| Created | **2026-07-31** (repo ~1 month old) |
| Last push | **2026-08-21** (8 days ago) |
| Language | TypeScript, 100% |
| Contributors | **6 total** — core is 2 humans: `carhartlewis` (132 commits) + `ripgrim` (31); rest bot + minor |
| Releases | **v1.0.0 on 2026-08-06 → v1.15.3 on 2026-08-21** (~15 releases in 15 days; heavy burst around Aug 11, e.g. v1.5→v1.9 same day) |
| Default branch | `release` (main is unreleased work) |

**Maturity read:**
- **Traction is excellent for a 1-month-old repo** — 9k stars, 1.1k forks, only 15 open issues → real signal this is capturing the market.
- **Bus factor is the concern.** Feature velocity is extreme (15 releases in 15 days) but that velocity rests almost entirely on one or two people. If `carhartlewis` steps back, momentum likely stalls.
- Extremely well-engineered and disciplined (ADRs, anti-slop lint, SECURITY.md, documented codebase rules). This is a serious, professional OSS project — not a toy.

## 4. Deployment / Pricing

- **Self-hosted:** Yes. Clone → `bun install` → `docker compose up` for Postgres → `bun run db:deploy` → `bun run dev`. Runs on localhost:3000 (app) / 3001 (api).
- **Cloud:** Built for **Vercel** deployment (agent uses Vercel Sandbox/Blob/AI Gateway/OIDC).
- **Pricing:** **Free, open source (MIT)**. Parent company Comp AI (trycomp.ai) is a funded startup monetizing adjacent products (compliance, Context), using the CRM as an open-source moat/lead-gen. No paywall in the repo.
- **Hosting cost reality:** The agent needs Postgres (can self-host), an AI model through Vercel Gateway (bring a provider key or OIDC), optionally Perplexity/LinkedIn keys. Cost scales with research volume.

## 5. Fit for The One Group — concrete use-cases

**Context:** The One Group = AI-automation agency for SMBs, founder Alec Kennedy, sells AI-Optimization service at $2,500–$10k. Comp AI is agentic-first, MIT, self-hostable, and built exactly to let agents run CRM ops.

### (a) Internal lead/CRM ops — **STRONG FIT (fastest win)**
Use it to run The One Group's own pipeline: agents auto-enrich inbound leads, fill records from email threads, qualify, and book re-checks. Because it runs on your own schedule/queue and is free to self-host, it's a low-cost internal force-multiplier and a genuine reference point for your own agentic systems.
- **Note:** single-tenant means "your own CRM," not a multi-client workspace — fine for internal use.

### (b) White-label / client offering — **MODERATE-BUT-PROMISING (medium-term)**
MIT license = you **can legally fork, rebrand, and resell** it ("Fork it. It's yours." is literally their tagline). Two realistic angles:
  1. **Stand up per-client instances** (self-hosted or Vercel) for SMB clients who want an AI-run CRM — white-label the UI, charge setup + monthly on top. This is a concrete productized deliverable.
  2. **As the connective tissue** for your AI-Optimization service — the agent model (queue, evidence ledger, schedule_recheck, no-guessing policy) is a great default architecture for the automations you build clients.
- **The catch:** it's **single-tenant and not yet multi-org**. Multi-client means either one instance per client (ops overhead) or adding org support yourself (dev work). Not a plug-and-play multi-tenant SaaS yet.

### (c) Reference architecture for the AI-Optimization service — **HIGH VALUE (free, immediate)**
Regardless of adoption, the agent pattern here is a strong blueprint for what you pitch clients:
- **Facts over guesses** (evidence-weighted ledger; weak evidence → human suggestion).
- **Durable, scheduled agents on a work queue** (`dueAt` over cron, `FOR UPDATE SKIP LOCKED` leases so runs survive restarts/die cleanly).
- **Sandboxing principle** — shell with no egress and *no database credentials* as the exfiltration guard; web research kept out of the shell.
- **Agents that build agents; every follow-up has a stated reason.**
These are directly reusable talking points and design patterns for $2.5k–$10k client engagements — showing you've studied the frontier of agentic ops.

**Net: (a) and (c) are immediate; (b) is a real product opportunity but needs a per-client-instance model or adding multi-tenancy.**

## 6. Secondary candidates

### FusionClaw (Fusion-Data-Company/FusionClaw) — **PASS (watch at most)**
- **3 stars, 0 forks, 1 open issue — effectively no traction.** Created 2026-03-20, last push **2026-06-28 (~2 months stale)**.
- Ambitious feature set: Next.js 16 + Drizzle, **234 MCP tools**, Skill Forge, Karpathy self-improvement loop, Council mode (3 agents debate deals), voice agent, cost-optimized model routing, wiki memory.
- **Problem (vs Comp AI):** 8k more stars behind, single-maintainer energy (Fusion Data Company), stale for 2 months, and the feature list is *larger than what the star count suggests is actually battle-tested*. Comp AI is strictly more credible on traction.
- **Verdict:** the concept overlaps with what you want (agent-native business OS, MCP-driven), but with 3 stars and no commits since June, it's unproven. Re-check only if Comp AI fails to materialize.

### T-one (alisanmtd-oss/T-one) — **PASS / skip**
- **1 star, 1 fork, 3 issues**, Apache-2.0, **Python/Electron**, Windows desktop app.
- **Chinese-language** focus (跨境电商/外贸 = cross-border e-commerce / foreign trade), local-first, desktop workspace with CLI (mouse/keyboard/browser automation), Windows installer.
- Actively maintained (push 2026-08-28), but it's a personal/local tool aimed at Chinese-market solo operators — **not appropriate as a business platform for US-facing SMBs or as white-label** for The One Group. Different audience, different runtime (desktop/Windows, not web SaaS).

## 7. Risks & Watch-outs

1. **Bus factor (highest risk).** ~9k stars but the code has only 2 meaningful human contributors and the repo is 1 month old. If `carhartlewis`/`ripgrim` deprioritize, the project could stall or pivot. **Mitigation:** pin a known release; self-host so you're not hostage to their roadmap.
2. **Young + fast-moving.** v1.15.x after ~1 month means breaking changes are likely early. **Pin versions, test upgrades.**
3. **Single-tenant by design.** Fine for internal; a blocker for true multi-client white-label without per-instance ops or your own multi-tenancy work.
4. **Vercel-centric runtime.** Agent hard-depends on Vercel pieces (eve.dev, Sandbox, AI Gateway, Blob). Fully off-Vercel self-hosting (AWS/Docker server) is harder than the local quick-start suggests.
5. **AI costs are open-ended** — agent spends a "research budget" on model calls you must size/cap.
6. **Security surface:** it ingests email and web data and runs a shell — sensible sandboxing (deny-all egress, no DB creds) is already thoughtfully handled, but you'd still want to review SECURITY.md before pointing it at client data.

## 8. Bottom Line / Recommendation

**MATURITY VERDICT: 💚 ADOPT (with pinning)** — for internal use + as reference architecture. **WATCH/conditional** for white-label.

- **Adopt now (free, low-risk):** self-host Comp AI CRM for The One Group's **internal lead/CRM ops**, and mine its **agent design patterns** to sharpen your AI-Optimization service pitch. Both are immediate and cheap.
- **Medium-term: explore white-label** per-client instances for SMBs; legal via MIT. Budget for either per-instance ops or adding multi-tenancy before scaling it as a client product.
- **Do not build your core client product on it today** until you've (a) run it yourself, (b) confirmed the 2-person team sustains momentum, and (c) solved the single-tenant gap.
- **Skip FusionClaw (untested, 3 stars, stale) and T-one (wrong market/audience).**

**One-line:** An exceptionally well-engineered, MIT, *free* agent-first CRM with explosive early traction (9k stars in a month) and a genuinely differentiated confidence-ledger design — adopt it to run your own pipeline and as a blueprint, but hold off making it a multi-client white-label until it matures and multi-tenancy is solved.

---

### Appendix — Data snapshot (as of 2026-08-29)
- Comp AI: 9,083★ / 1,123 fork / 15 issues / MIT / created 2026-07-31 / pushed 2026-08-21 / v1.15.3 / TS 100% / 6 contributors (2 core).
- FusionClaw: 3★ / 0 fork / 1 issue / MIT / created 2026-03-20 / pushed 2026-06-28 / Next.js 16 + Drizzle / 234 MCP tools.
- T-one: 1★ / 1 fork / 3 issues / Apache-2.0 / created 2026-07-18 / pushed 2026-08-28 / Python/Electron / Chinese-market, Windows desktop, local-first.
