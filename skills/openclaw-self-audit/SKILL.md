---
name: "openclaw-self-audit"
description: "Audit an OpenClaw install after an update: run doctor, fix consent, cron reauthorization, migration, bootstrap-size, invalid skills, stale device-auth findings."
---

# OpenClaw Self-Audit

Audit and repair an OpenClaw install, primarily after an update. Use when the user asks to "run an audit on yourself," "fix everything," "check for problems," or after any OpenClaw version update produced warnings or failing cron jobs.

## Steps

1. Run the full read-only audit and read the findings as JSON so the structured `checkId`/`severity`/`message`/`fixHint` are usable:
   ```
   openclaw doctor --all --lint --json
   ```
   Use `--all` (≈128 checks). A plain `--lint` (≈60 checks) is shallower and can miss findings; re-check with `--all` to confirm a fix truly landed.

2. Workspace state migration error (`Legacy workspace setup state requires migration ... run openclaw doctor --fix`) — do NOT run `doctor --fix` from a second shell. It spawns a gateway that owns the state and refuses ("another Gateway owns that state directory"). Only the owning gateway applies the migration, on its own managed restart: `openclaw gateway restart`. This drops the current session mid-turn; expect the interruption and resume after reconnect.

3. Plugin capability consent (`Plugin "X" requires capability consent`) — the plugin is already enabled; re-approve consent: `openclaw plugins enable <id> --accept-capabilities` for each flagged id.

4. Cron reauthorization (`N tool-bearing automations require explicit scheduled authority reauthorization`) — read each job's current `toolsAllow` with `openclaw cron get <id>`, then reissue the exact same list: `openclaw cron edit <id> --tools <comma-list>`. Preserve the job's exact allow-list; the `legacy-cron-store` finding clears once every flagged job is reissued.

5. Missing governance artifact (`policy.jsonc is missing`) — if no policy is authored or used, the Policy plugin is dead weight. Disable it (`openclaw plugins disable policy`) and delete the orphaned `plugins.entries.policy` + its `plugins.allow` ref from `openclaw.json`, then `openclaw config validate`.

6. `core/doctor/bootstrap-size` (a workspace file over `bootstrapMaxChars`, default 20000, is truncated on load) — trim the flagged file under the limit by moving stale/superseded sections to `memory/archive/` (e.g. `memory/archive/model-routing-history.md`), keeping live info inline. Verify with `wc -c`.

7. Plaintext-secret finding — check whether the flagged value is a real credential or a placeholder (e.g. `ollama-local` against a loopback `baseUrl`). If it is a dummy for a localhost server, remove the field and confirm with `openclaw config validate`.

8. Invalid skill (`description is required`) — add YAML frontmatter at the top of `SKILL.md`:
   ```
   ---
   name: <skill>
   description: "<one-liner>"
   ---
   ```
   Then confirm the loader stops skipping it.

9. Apply config/plugin changes with `openclaw gateway restart`, then re-run `openclaw doctor --all --lint --json` to confirm.

10. Memory search broken after changing the embedding provider/model (`memory_search` fails with "index was built for model X, expected Y") — rebuild the index with the new model: `openclaw memory index --force --agent main`. Confirm it finished before treating it as done; the command can appear to hang under a bare `exec` (it still completes) — run it with a bounded wait and watch for "Memory index updated ... files indexed" in the log. Verify the embedding model is actually reachable first with `curl <baseUrl>/api/embeddings`.

## Stale device-auth warning: leave it

A doctor `core/doctor/device-pairing` finding like "Local cached ... device auth for `cli` no longer has a matching active gateway token" is benign and cosmetic. The terminal CLI authenticates via `OPENCLAW_GATEWAY_TOKEN` in `~/.openclaw/.env`, NOT the device token. Verify the real auth path first; do not "fix" it with `openclaw connect` (that enrolls the Mac as a node host — a different state change), nor `openclaw devices remove`/`rotate`/`revoke` (all denied for a stale/unapproved device). Leave the warning. Node-hosting findings (`gateway.bind` loopback, `device-pair` plugin off) are the secure default — accept them, never widen the attack surface to silence them.

## Pitfalls

- Restarting the gateway (steps 2 and 9) ends the active turn; schedule it, then resume after the session reconnects.
- `cron edit --tools` must pass the job's exact current allow-list; a wrong list can break that job's tool access.
- Re-check cleanliness with `--all`, not the shallower `--lint`.
