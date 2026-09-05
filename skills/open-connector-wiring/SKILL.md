---
name: "open-connector-wiring"
description: "Wire connector catalog services to the local open-connector runtime at localhost:3000."
---

# OpenConnector Wiring

Add connector services to the local open-connector runtime (`http://127.0.0.1:3000`). Use when the user asks which catalog services are unused, to wire/enable a connector, or when a connection appears missing.

## Verify the service exists and its auth type first

```bash
# list all providers (auth types, display names)
curl -s http://127.0.0.1:3000/api/providers
# single provider
curl -s http://127.0.0.1:3000/api/providers/stripe
```

Read the provider's `auth.type` from the response:
- `api_key` → connect by adding the API key.
- `oauth2` → needs browser authorization (console at `http://localhost:5173`); many posting services (e.g. LinkedIn personal-profile posting) additionally require an approved provider developer app and are blocked — skip unless clearly possible.
- `no_auth` → already available as a virtual connection; nothing to do.

## Triage: only wire genuinely free tiers

Before wiring, check whether the service has a free API. Most lead-gen/SEO/outbound services are **paid-only** (Apollo, Ahrefs, Amplemarket, Autobound, Aimfox, ActiveCampaign-for-real-use). Skip those on a cost-conscious setup. Known free-to-wire: **Stripe**, **Ayrshare**, **Bannerbear**, **Abyssale**. Confirm against the provider dashboard before committing.

## Add an API-key connection

```bash
curl -s -X PUT http://127.0.0.1:3000/api/connections/stripe \
  -H 'content-type: application/json' \
  -d '{"authType":"api_key","values":{"apiKey":"YOUR_KEY"}}'
```

Key-name in `values` is `apiKey` for `api_key` providers. Verify registration:
```bash
curl -s http://127.0.0.1:3000/api/connections
```
The new service should appear with a `profile` (accountId/displayName). Then **live-test** by calling one action via `open-connector__execute_action` before declaring it done.

## Credential safety — never paste keys in chat

- API keys are never typed into chat, logs, command lines, or this file.
- The human creates the key at the service dashboard, then it is entered either (a) directly into the connector console at `http://localhost:5173`, or (b) via a masked one-shot script the human runs in their own terminal (see below).
- Do NOT rely on `secrets.request` (masked entry → OpenClaw sharee store) to complete the wiring: the protected store is **write-only to the agent**, and it is a *separate* store from the connector's `connect.sqlite`. Storing a key there does not wire the connector and the agent cannot read the value back to PUT it — so the value must be entered from the human's terminal or console.
- Give the human a masked `getpass` script that PUTs straight to the connector, so the key never appears in chat or agent context:
  ```bash
  python3 scripts/wire_connector_secret.py abyssale ABYSSALE_API_KEY  # NOTE: only works if env is injected; usually NOT
  ```
  Working approach — a small script the human runs with `getpass.getpass()` (hidden chars), sending `{"authType":"api_key","values":{"apiKey":<key>}}` to `PUT /api/connections/<service>`, reporting only masked status.
- Note: by default the runtime stores credentials in `spikes/open-connector/data/connect.sqlite` as plaintext unless `OOMOL_CONNECT_ENCRYPTION_KEY` is set — treat that DB as sensitive.

## Reading data from an .xlsx held in Google Drive

An `.xlsx` (or other binary Office file) in Drive **cannot** be read directly: `googlesheets.values_get` on it returns nothing and `googledrive.files.export` cannot export a non-Workspace file. `googlesheets.get_spreadsheet_info` works only on a Sheets-native file. To read its data:

1. Convert the binary file to a Google Sheet with `googledrive.files.copy` using the Sheets mimeType (a temporary, read-only conversion — it does not modify the original):
   ```json
   {"fileId":"<DRIVE_FILE_ID>","mimeType":"application/vnd.google-apps.spreadsheet","name":"<temp name>"}
   ```
   The response returns a new `data.id` (a different ID from the original file). Note: `parents` must contain at least one folder ID if passed.
2. Read the converted sheet with `googlesheets.values_get` using that new ID (default first tab is usually the data; or list tabs via `googlesheets.get_spreadsheet_info` first).
3. Optional: the converted copy also exports to CSV via `googledrive.files.export` (`mimeType:"text/csv"`), which returns a transit download URL, then `curl` it.

This same convert-then-read path is how to inspect any binary spreadsheet (CSV, xlsb, etc.) that lives in Drive.

## Runtime facts

- Backed by launchd service label `com.theonegroup.open-connector` (vite dev server, node).
- Admin endpoints under `/api/*` are open locally when `OOMOL_CONNECT_ADMIN_TOKEN` is unset.
- Existing per-provider skills (apollo, stripe, ayrshare, etc.) cover how to *call* actions; this skill covers *connecting* the service.
