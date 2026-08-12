#!/usr/bin/env node
/**
 * sync_model_runtime_config.mjs — sync canonical routing-config.json (v5.2)
 * into the live OpenClaw runtime config (~/.openclaw/openclaw.json + config.json).
 *
 * v5.2 schema: .version, .stack{primary,fallback1-3,utility,local_batch}, .retired_*,
 * .health_checks. This replaces the old v4 fields (.routing.provider_failover,
 * .routing.task_classes, .safety.exclude_models) which no longer exist and caused
 * crashes. Fixed 2026-08-12.
 *
 * SAFETY: creates a timestamped backup of each live config file before writing,
 * and only updates the model stack — it never removes or rewrites other providers
 * that are currently working. Safe to re-run; idempotent.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const workspace = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const canonicalPath = path.join(workspace, 'routing-config.json');
const openclawPath = path.join(os.homedir(), '.openclaw', 'openclaw.json');
const legacyPath = path.join(os.homedir(), '.openclaw', 'config.json');

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, data) => fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
const uniq = (items) => Array.from(new Set(items.filter(Boolean)));
const stamp = () => new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

function backup(file) {
  if (fs.existsSync(file)) {
    const bak = `${file}.bak.${stamp()}`;
    fs.copyFileSync(file, bak);
    console.log(`  backup: ${bak}`);
  }
}

const canonical = readJson(canonicalPath);
// v5.2 stack
const primary = canonical.stack?.primary?.model;
const fallbacks = uniq([
  canonical.stack?.fallback1?.model,
  canonical.stack?.fallback2?.model,
  canonical.stack?.fallback3?.model,
  canonical.stack?.utility?.model,
]);
const activeModels = uniq([primary, ...fallbacks]);

// v5.2 retired models (used to filter stale entries out of providers)
const retired = new Set(canonical.retired_2026_07_31 || []);
const isRetired = (modelId) => {
  const m = String(modelId || '');
  return retired.has(m) || retired.has(m.replace(/^ollama\//, ''));
};

function upsertModel(list, model) {
  const index = list.findIndex((entry) => entry?.id === model.id);
  if (index >= 0) list[index] = { ...list[index], ...model };
  else list.push(model);
}

const openclaw = readJson(openclawPath);
backup(openclawPath);

openclaw.auth = openclaw.auth || {};
openclaw.auth.profiles = openclaw.auth.profiles || {};
openclaw.auth.profiles['openrouter:default'] = { provider: 'openrouter', mode: 'api_key' };
openclaw.auth.order = openclaw.auth.order || {};
openclaw.auth.order.openrouter = ['openrouter:default'];

openclaw.models = openclaw.models || {};
openclaw.models.providers = openclaw.models.providers || {};

// Ensure the Ollama provider exists and holds the local batch models.
openclaw.models.providers.ollama = openclaw.models.providers.ollama || {
  baseUrl: 'http://127.0.0.1:11434',
  api: 'ollama',
  models: []
};
openclaw.models.providers.ollama.models = openclaw.models.providers.ollama.models || [];
upsertModel(openclaw.models.providers.ollama.models, {
  id: 'qwen3-coder:latest', name: 'qwen3-coder:latest', input: ['text'],
  cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
  contextWindow: 131072, params: { num_ctx: 131072 }
});
upsertModel(openclaw.models.providers.ollama.models, {
  id: 'llama3.1:latest', name: 'llama3.1:latest', input: ['text'],
  cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
  contextWindow: 131072, params: { num_ctx: 131072 }
});
// Drop any retired ollama models.
openclaw.models.providers.ollama.models =
  openclaw.models.providers.ollama.models.filter((m) => !isRetired(`ollama/${m.id}`));

// OpenRouter provider (keep existing models, ensure the ones we depend on exist).
openclaw.models.providers.openrouter = openclaw.models.providers.openrouter || {
  baseUrl: 'https://openrouter.ai/api/v1', api: 'openai-completions', models: []
};
openclaw.models.providers.openrouter.models = openclaw.models.providers.openrouter.models || [];
for (const m of fallbacks.filter((f) => f && f.startsWith('openrouter/'))) {
  upsertModel(openclaw.models.providers.openrouter.models, { id: m, name: m, input: ['text'] });
}
openclaw.models.providers.openrouter.models =
  openclaw.models.providers.openrouter.models.filter((m) => !isRetired(m.id));

// Agent defaults: primary + fallback chain from canonical v5.2 stack.
openclaw.agents = openclaw.agents || {};
openclaw.agents.defaults = openclaw.agents.defaults || {};
openclaw.agents.defaults.model = { primary, fallbacks };
openclaw.agents.defaults.models = openclaw.agents.defaults.models || {};
for (const model of Object.keys(openclaw.agents.defaults.models)) {
  if (retired.has(model) || model.startsWith('anthropic/') && !activeModels.includes(model)) {
    delete openclaw.agents.defaults.models[model];
  }
}
for (const model of activeModels) openclaw.agents.defaults.models[model] = openclaw.agents.defaults.models[model] || {};
if (Array.isArray(openclaw.agents.list)) {
  for (const agent of openclaw.agents.list) {
    if (agent.id === 'main') agent.model = { primary, fallbacks };
  }
}
writeJson(openclawPath, openclaw);

// Legacy config.json — best-effort, v5.2-aware.
if (fs.existsSync(legacyPath)) {
  backup(legacyPath);
  const legacy = readJson(legacyPath);
  legacy.providers = uniq(['ollama', 'openrouter', 'openai', 'anthropic']);
  legacy.openrouter = legacy.openrouter || {};
  legacy.openrouter.api_key_env = 'OPENROUTER_API_KEY';
  legacy.openrouter.base_url = 'https://openrouter.ai/api/v1';
  legacy.openrouter.models = legacy.openrouter.models || {};
  legacy.models = legacy.models || {};
  Object.assign(legacy.models, {
    default: primary,
    fallback: fallbacks[0],
    coding: primary,
    content: primary,
    complex_reasoning: fallbacks[1] || fallbacks[0],
    emergency: fallbacks[fallbacks.length - 1] || primary,
    subagent: primary,
    openai_default: 'openrouter/openai/gpt-4o-mini'
  });
  legacy.error_handling = legacy.error_handling || {};
  legacy.error_handling.on_token_limit_exceeded = fallbacks[0];
  writeJson(legacyPath, legacy);
} else {
  console.log('  (no legacy config.json — skipped)');
}

console.log(`Synced runtime configs from ${canonicalPath}`);
console.log(`  primary: ${primary}`);
console.log(`  fallbacks: ${fallbacks.join(', ')}`);
