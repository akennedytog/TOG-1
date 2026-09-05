# OpenClaw v2026.9.1-beta.1 — Feature Assessment for The One Group

**Date:** 2026-08-29
**Current install:** stable `2026.7.1-2` (npm `latest`)
**Assessment question:** Adopt any 9.1-beta features NOW vs. wait for a 9.x stable?

---

## TL;DR Verdict

### STAY ON STABLE (2026.7.1-2). Do NOT jump to 9.1-beta.

Every one of the five researched features is **absent from stable 2026.7.1-2** (they were merged to `main` Aug 26–28, after the Aug 4 stable cutoff) and is **only available in the 9.1-beta**. Two of the five (restart recovery #130491, worker recovery #130446) are directly relevant to the exact failure classes we hit this week. BUT:

1. **No 2026.8.x stable exists.** The `latest` tag jumped from `2026.7.1-2` straight to beta `2026.9.1-beta.1`; the 8.1 line only ever shipped `-beta.1/2/3` (never a stable). So there is **no stable release path between us and these fixes** right now.
2. **9.1-beta.1 is 1 day old** (tagged Aug 28) and two of its marquee fixes had **live P1 review findings at merge**: #130446 (worker recovery) was flagged for reusing an expired credential on re-arm, and #130491 (restart recovery) touched durable session-state serialization (merge-risk: session-state — the exact kind of change that could bite a heavy-cron farm).
3. Our situation is a **29-cron production farm** with family/business-critical jobs. That is precisely the environment that should be last to ride a week-0 beta.

**Recommended plan:** Stay on 2026.7.1-2. Watch for a **9.x stable** (likely days-to-weeks out, given the 7.1-2 → 9.1-beta cadence and 8.x being abandoned). When a **9.x stable ships**, upgrade to it — it directly fixes our two recurring failure classes (interrupted turns on gateway restart, dead-worker "agent run aborted" cron failures). Before upgrading, back up state (these fixes touch durable session/worker state).

---

## Version Timeline (verified via `npm view openclaw dist-tags` + versions list + GitHub releases)

| Tag | Version | Status | Date |
|-----|---------|--------|------|
| `latest` | **2026.7.1-2** | Stable (ours) | Aug 4, 2026 |
| `extended-stable` | 2026.6.34 | Stable (LTS-ish) | Aug 8, 2026 |
| `beta` | **2026.9.1-beta.1** | Pre-release | Aug 28, 2026 |
| — | 2026.8.1-beta.1/2/3 | Pre-release only | Aug 15–24, 2026 |
| — | 2026.7.2-beta.1–7 | Pre-release, never went stable | Jul 15–Aug 2, 2026 |

**Key findings:**

- **There is NO 2026.8.x stable.** The 8.1 line shipped only three betas and was superseded by 9.1-beta.1. (The `OpenClaw 2026.8.1 (ccadcbb)` string seen in a GitHub PR's live-verification log is a **dev/CI build from git `main`**, not a published npm stable.)
- The nearest stable **after** our 2026.7.1-2 is a **9.x release, which does not exist yet**. `latest` points at 7.1-2; the 9.1 line is beta-only.
- So: any fix that requires leaving 7.1-2 **forces us onto beta** today. There is no safe middle stable to adopt.

---

## Per-Feature Assessment

### 1. Gateway restart recovery — admitted turns across repeated restarts (#130491)

**What it does:** On a forced Gateway restart, an admitted in-flight turn could be missed (startup never dispatched the restart-safe recovery) when transient chat-run cleanup ran first. The fix derives interrupted-session marking from the authoritative **session-work admission owner** instead of the narrower chat-run/recovery maps, so in-flight channel turns survive repeated Gateway restarts through each checkpoint and still deliver their final response.

**Has-it-on-stable?** **NO.** Merged Aug 27, 2026 to `main`; not in our 7.1-2 stable (Aug 4). Only in 9.1-beta.1 (release highlight).

**Real-world value to our setup: HIGH.** This is the *exact* failure we hit today: a turn interrupted by a Gateway restart lost its admitted state across the restart. We run 29 crons; interrupted turns on restart is a recurring real cost. This is the single most on-point fix for us.

**Caution:** ClawSweeper flagged `merge-risk: 🚨 session-state` — it changes persisted restart-recovery marking (durable session serialization: `store-maintenance-preserve.ts`, `session-lifecycle-admission.ts`). Requires migration/upgrade-compatibility proof. That's the class of change that can regress a cron-heavy farm.

**Action:** Adopt on a **9.x stable** (not beta). Value is high but does not justify beta riding by itself, given the state-serialization risk.

---

### 2. Worker recovery — re-arm admission-deadline launches, terminalize dead-worker turns (#130446)

**What it does:** Three lifecycle fixes proven in a 50-worker farm campaign:
- **Re-arm** worker launches that die on a fixed 120s admission deadline after a network blip (up to 5 attempts, backoff+jitter) so a farm node surviving a partition finishes its turns instead of burying them.
- **Terminalize** provably-dead worker turns after a grace period instead of `keep_lane` forever (was: stuck turns only ended via caller timeout after 25+ min of skipped recovery logs).
- **Defer** orphan git/workspace cleanup off the readiness path so a Gateway with many failed placements restarts promptly.

**Has-it-on-stable?** **NO.** Merged Aug 27, 2026. Only in 9.1-beta.1 (release highlight).

**Real-world value to our setup: HIGH.** Directly matches our "**agent run aborted**" cron failures this week — dead-worker turns that never terminalized and were stuck. Terminalizing dead turns *visibly within seconds instead of 25-min waits* is a meaningful ops improvement for cron monitoring.

**Caution:** This is the riskiest of the five. **At merge it carried an unresolved P1 finding:** the re-arm reuses the *original* 600s-expiring credential for every attempt, so the 5th attempt (start ~495s) can be rejected as credential-expired, defeating recovery on a prolonged outage. Production delta +229 lines. Multiple durable storage files touched (`node-launch-adapter`, `worker-turn-admission`, `worker-turn-failure`, etc.) → data-model changes requiring migration proof.

**Action:** Adopt on a **9.x stable**, and verify the credential-refresh finding is resolved in the stable cut before upgrading. Highest value + highest risk of the five.

---

### 3. Configurable model-selection scopes (#127813)

**What it does:** Adds explicit `-s/--session`, `-a/--agent`, `-g/--global` flags to model-switch commands, plus an optional `agents.defaults.modelSelectionScope: "session" | "agent" | "global"` preference. **Crucially: when unset, behavior is unchanged** (bare `/model` still updates agent-primary-or-shared-default, as today). It's a strictly opt-in feature — no silent behavior change.

**Has-it-on-stable?** **NO.** Merged Aug 26, 2026. Only in 9.1-beta.1 (release note).

**Could it have helped the utilityModel issue?** **NO — not directly.** The utilityModel failure was a *dead/misconfigured model* killing cron jobs. Model-selection scopes control *where a model change persists* (session vs agent vs global), not *whether a chosen model is dead or routed correctly*. Scopes would not have prevented the dead utilityModel; that's a separate model-health/routing concern. Scopes *would* help going forward if the failure was caused by a botched global model patch propagating to many crons — scopes let you pin a cron/agent/session model without contaminating the shared default.

**Real-world value to our setup:** MEDIUM (forward-looking). With 29 crons and multi-agent routing, explicit scoping is genuinely useful to keep a model change local and avoid it cascading into inherited defaults for other crons/agents. But it's an **opt-in nicety, not a fix** for anything we're currently bleeding on.

**Action:** Nice-to-have on a future stable. Not a reason to go beta. (Also: config preference grants **no authority** — bare non-admin selections stay session-only by design, which is a safety feature.)

---

### 4. Model browsing reliability after plugin activation (#130481)

**What it does:** Fixes `models.list` returning UNAVAILABLE after automatic provider-plugin activation. The Gateway publishes one lifecycle-owned plugin-metadata snapshot, but the model catalog worker discarded it and rediscovered metadata from an individual agent's workspace/runtime — which can mismatch. The fix transfers the exact metadata graph into the catalog worker so model browsing and auth refresh don't lose the selected provider catalog.

**Has-it-on-stable?** **NO.** Merged Aug 27, 2026. Only in 9.1-beta.1 (release highlight).

**Real-world value to our setup:** LOW-MEDIUM. We don't frequently re-browse/re-auth models after plugin activation; this is more of an interactive/Control-UI polish fix than a cron-reliability fix. The utilityModel dead-model issue is related but separate (it's about routing to a dead model, not catalog *listing* unavailable).

**Action:** Low priority. Not a beta driver.

---

### 5. Gateway config-write reliability / watcher handoff (#131515)

**What it does:** Fixes `config.patch`/`config.apply` reporting UNAVAILABLE ("persisted but not applied") when a config write is superseded by the file watcher replaying the same write. Config writes now stay **pending** through watcher handoff and acknowledge only when the watcher observes the committed generation — a same-write reload settles against the observed generation instead of failing during source transfer.

**Has-it-on-stable?** **NO.** Merged Aug 28, 2026 (the newest). Only in 9.1-beta.1 (release highlight).

**Real-world value to our setup:** MEDIUM. If we've ever seen a config change "stick to disk but report UNAVAILABLE," this is the fix. It also matters for the family-tracker/agent scripts that patch config. But it's a false-negative acknowledgement bug — **cosmetic-ish** (the write still lands; the report was wrong), lower severity than dead-worker/aborted-run issues.

**Action:** Nice-to-have on a future stable. Not a beta driver.

---

## Overall Risk/Reward

| # | Feature | On stable 7.1-2 | Value to us | Risk at merge |
|---|---------|:---:|:---:|:---:|
| 1 | Gateway restart recovery | ❌ No | High | Med (session-state) |
| 2 | Worker recovery / terminalization | ❌ No | High | **High (open P1, schema)** |
| 3 | Model-selection scopes | ❌ No | Med (opt-in) | Low |
| 4 | Model browsing after plugin activation | ❌ No | Low-Med | Low |
| 5 | Config-write / watcher handoff | ❌ No | Med | Low |

**Bottom line:** the two fixes we most want (1, 2) are **not available on any stable**, and they're precisely the ones that (a) touch durable state and (b) carried live review findings at merge. Adopting them today means adopting 9.1-beta.1 — a 1-day-old beta with state-mutation risk — to fix a production cron farm.

**STAY ON STABLE 2026.7.1-2 → upgrade to 9.x STABLE when it lands.**

---

## Concrete Next Steps

1. **Do not install 9.1-beta.1 on the production gateway.**
2. **Watch for a 9.x stable tag** (npm `latest` moving off 2026.7.1-2). Check `openclaw --version` / npm weekly.
3. **Before upgrade:** back up `~/.openclaw` state (sessions, config, crons). The restart-recovery and worker-recovery fixes change persistent worker/session state.
4. **Verify post-stable-release:** confirm #130446's credential-refresh P1 finding is resolved in the stable cut (check release notes / changelog) before adopting worker recovery.
5. **Optional interim mitigation on stable** for the dead-worker/"agent run aborted" cron class (since we can't patch it): add a cron self-check/restart watchdog and review cron failure logs so aborts are detected quickly rather than relying on openclaw to terminalize them.

---

## Method & Sources
- GitHub PRs #130491, #130446, #127813, #130481, #131515 (descriptions, ClawSweeper reviews, live-verification logs, review findings).
- GitHub release notes `v2026.9.1-beta.1`.
- npm registry: `npm view openclaw dist-tags` and `npm view openclaw versions`.
- Release history aggregator open-claw.me/releases to confirm stable/pre-release status of 7.1/8.1/9.1.
- docs.openclaw.ai (release-notes and model-selection pages are 404 in current docs bundle; not covered on stable docs yet, consistent with these being beta features).
