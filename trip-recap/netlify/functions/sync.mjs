// Cross-device sync for the Kennedy trip journal.
// Uses Netlify Blobs (built into Netlify Functions) so confirmations and
// quick-captures made on one phone appear on all family devices + in the recap.
//
//   GET /api/sync          → { confirmed:[...], dismissed:[...], captures:[...] }
//   POST /api/sync         → body { confirmed?:[...], dismissed?:[...], captures?:[...], deviceId? }
//                              merges arrays (union, last-write-wins per item), returns merged state
//
// Netlify Blobs is automatically available on this Pro site; no external service.

import { getStore } from "@netlify/blobs";

const BLOB_KEY = "journal-sync-v1";

async function readState() {
  const store = getStore("trip-journal");
  const blob = await store.get(BLOB_KEY, { type: "json" });
  return { confirmed: [], dismissed: [], captures: [], ...(blob || {}) };
}

function merge(key, existing, incoming) {
  if (!incoming) return existing || [];
  const map = new Map((existing || []).map((x) => [x, x]));
  (incoming || []).forEach((x) => map.set(x, x));
  return [...map.values()];
}

function mergeCaptures(existing, incoming) {
  if (!incoming) return existing || [];
  const map = new Map((existing || []).map((c) => [c.id, c]));
  (incoming || []).forEach((c) => {
    if (c && c.id) map.set(c.id, c);
  });
  // newest first
  return [...map.values()].sort((a, b) => (b.at || "").localeCompare(a.at || ""));
}

function respond(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "access-control-allow-origin": "*" },
  });
}

export default async (req) => {
  const store = getStore("trip-journal");

  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "access-control-allow-origin": "*",
        "access-control-allow-methods": "GET,POST,OPTIONS",
        "access-control-allow-headers": "content-type",
      },
    });
  }

  if (req.method === "GET") {
    let state;
    try {
      state = await readState();
    } catch (e) {
      return respond(500, { error: "failed to read store" });
    }
    return respond(200, state);
  }

  if (req.method === "POST") {
    let body = {};
    try {
      body = await req.json();
    } catch (e) {
      return respond(400, { error: "invalid JSON body" });
    }

    try {
      const current = await readState();
      const next = {
        confirmed: merge("confirmed", current.confirmed, body.confirmed),
        dismissed: merge("dismissed", current.dismissed, body.dismissed),
        captures: mergeCaptures(current.captures, body.captures),
        updatedAt: new Date().toISOString(),
      };
      await store.setJSON(BLOB_KEY, next);
      return respond(200, next);
    } catch (e) {
      return respond(500, { error: "failed to write store" });
    }
  }

  return respond(405, { error: "method not allowed" });
};
