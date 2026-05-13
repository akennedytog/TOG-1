# Model Routing & Efficiency Rules

**Last Updated:** 2026-04-15
**Purpose:** Minimize API costs while maximizing task completion rate

---

## The Golden Rule

> **Always try Ollama first. Only escalate if it fails or the user explicitly requests a paid model.**

---

## Model Selection Matrix

| Task | First Try | Escalate To | Never Use |
|------|-----------|-------------|-----------|
| Simple tasks | **Ollama/Kimi** (FREE) | — | — |
| Complex reasoning | **Ollama/Kimi** (test) | GPT-5.5 | Claude 3 Opus |
| Vision tasks | **GPT-5.5** or **Claude 3.5** | — | — |
| File operations | **Ollama/Kimi** | GPT-5.5 | — |
| Coding | **Ollama/Kimi** | GPT-5.5 | — |
| Creative writing | **Ollama/Kimi** | GPT-5.5 | — |
| Multi-step agents | **Ollama/Kimi** | GPT-5.5 | — |

**Key Update:** Kimi-K2.5 now ranks highly on Artificial Analysis intelligence benchmarks - it's competitive with paid models for most tasks.

---

## Cost Hierarchy (per 1M tokens)

```
Ollama/Kimi-K2.5:cloud  →  $0.00  (FREE - USE FOR SIMPLE TASKS)
GPT-4o-mini              →  $0.15 / $0.60  (CHEAP ESCALATION)
GPT-4o                   →  $2.50 / $10.00
GPT-5.5                  →  $3.00 / $15.00  (COMPLEX REASONING)
Claude 3.5 Sonnet        →  $3.00 / $15.00  (VISION + REASONING)
Claude 3 Opus            →  $15.00 / $75.00  (AVOID)
```

**New:** GPT-4o-mini is 16x cheaper than GPT-4o with nearly identical capability for simple tasks.

---

## When to Escalate (Checklist)

Before escalating to a paid model, confirm:

- [ ] Ollama was given a fair attempt (not a quick give-up)
- [ ] Task truly exceeds Ollama's capabilities
- [ ] User hasn't explicitly forbidden paid models
- [ ] The cost is justified by the task value

**Escalation path:**
1. Try **Ollama/Kimi** first for simple tasks
2. If complex reasoning needed → **GPT-5.5**
3. If vision tasks needed → **GPT-5.5** or **Claude 3.5**
4. If all else fails → Claude 3.5

**New Strategy:**
- **Simple tasks:** Ollama/Kimi (free)
- **Complex reasoning:** GPT-5.5 (paid)
- **Vision tasks:** GPT-5.5 or Claude 3.5

**Escalation message template:**
> "Ollama struggled with [specific issue]. GPT-4o-mini would handle this for ~$0.05 or Claude 3.5 for ~$0.50. Which do you prefer?"

---

## April 2026 Model Updates

### Recent Releases
- **GPT-5.5** (Apr 26, 2026) - OpenAI's latest reasoning model, now integrated
- **OpenAI Agents SDK** (Apr 15, 2026) - Major shift toward agentic workflows
- **Anthropic Computer Use** - AI that can operate your computer
- **Google Gemma 4** - Local/edge deployment focus
- **Kimi-K2.5** - Highly ranked on Artificial Analysis benchmarks

### Cost-Conscious Strategy
- **90% of tasks:** Ollama/Kimi (free)
- **8% of tasks:** GPT-4o-mini (nearly free)
- **2% of tasks:** Claude 3.5 (when reasoning matters)

---

## Efficiency Rules

### 1. Batch Operations
- Chain shell commands: `cmd1 && cmd2 && cmd3`
- Read multiple files in parallel when independent
- Avoid tight poll loops

### 2. Avoid Redundant Work
- Check memory_search before guessing about prior work
- Don't re-read files already in context
- Cache expensive computations

### 3. Be Concise
- Skip pleasantries for routine tasks
- Use bullet points over paragraphs
- One thoughtful response > three fragments

### 4. Smart Tool Use
- Use `memory_search` before asking "what were we working on?"
- Prefer `read` over `exec cat` for files
- Use `image` tool only when image analysis is required

---

## Context Management Rules

### File Reading Discipline
- Read SKILLS.md only when task matches (not speculatively)
- Don't load large files unless necessary
- Use offset/limit for large files
- Prefer `memory_search` over scanning daily files

### Session Hygiene
- Don't repeat system instructions back to user
- Avoid copying large JSON unless needed
- Use `NO_REPLY` when appropriate

---

## User Preferences

- **Simple tasks:** Ollama/Kimi-K2.5:cloud (free)
- **Complex reasoning:** GPT-5.5 (paid)
- **Vision tasks:** GPT-5.5 or Claude 3.5
- **Escalation:** Ask permission unless clearly justified

---

## Violations Log

*(Add entries here if I violate these rules)*

