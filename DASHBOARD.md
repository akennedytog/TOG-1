# The One Group - Mission Control

## 🚀 Quick Access Links

### Communication Channels
| Platform | URL | Purpose | Cost |
|----------|-----|---------|------|
| **Discord** | (Create free server) | Agent notifications, daily reports | **FREE** |
| **Telegram** | @TheOneGroupBot | Alerts, quick updates | **FREE** |
| **OpenClaw Control** | This UI | Main agent interface | - |
| **Twitter** | https://twitter.com/TheOneGroupAI | Brand account | - |

> 💡 **Note:** Slack requires paid workspace for bot integration. Using Discord or Telegram instead.

### Agent System (8 Agents)
| Agent | Role | Model | Skills | Status |
|-------|------|-------|--------|--------|
| 🔍 Arlo | Research | Ollama/Kimi | Web Search, Apollo.io, **Browser-use** | ✅ Active |
| ✍️ Dante | Content | Claude Sonnet | Twitter, Canva, ElevenLabs | ✅ Active |
| 📧 Iris | Outreach | Claude Sonnet | Gmail, Email Sequences | ✅ Active |
| ✅ Abby | QA | o3-mini | Content Review, Code Review | ✅ Active |
| 💻 Dev | Development | Claude Sonnet | GitHub, Netlify, VS Code, **Browser-use** | ✅ Active |
| ⚙️ Opal | Operations | Ollama/Kimi | Calendar, Todoist, **1Password** | ✅ Active |
| 📊 Rico | Analytics | o3-mini | Reporting, **1Password** | ✅ Active |
| 🎧 Jerry | Support | Ollama/Kimi | General, Research, Documentation | ✅ Active |

### New Skills Installed (2026-04-05)
| Skill | Use Case | Status |
|-------|----------|--------|
| **Browser-use** | Fill forms, scrape gated content, navigate complex sites | ✅ Ready |
| **1Password** | Secure API key retrieval, team credential sharing | ✅ Ready |
| ~~Slack~~ | ~~Agent notifications~~ | ❌ Skipped (requires paid workspace) |

### Free Alternative for Notifications
Instead of Slack, I can:
- 📧 **Email** you daily reports (via Gmail skill)
- 🐦 **Tweet** status updates from @TheOneGroupAI
- 📱 **Telegram** messages (if you set up a free bot)
- 📊 **Update DASHBOARD.md** with live stats (what I do now)

---

## 📊 Data & Tracking
- [Lead Database](/data/arlo_findings.json) - South Florida prospects
- [Email Tracker](/data/email_tracker.json) - Outreach sequences
- [Twitter Queue](/state.json) - Content pipeline
- [Content Calendar](/content-calendar.json) - Scheduled posts

## 🎯 Active Campaigns
| Campaign | Status | Leads | Next Action |
|----------|--------|-------|-------------|
| South Florida HVAC | 🟡 Ready to send | 3 | Send cold emails |
| South Florida Legal | 🟡 Ready to send | 3 | Send cold emails |
| South Florida Accounting | 🟡 Ready to send | 2 | Send cold emails |

## 📈 Today's Stats
- Tweets posted: 10
- Emails queued: 8
- Templates pending: 5
- Leads researched: 10
- **New skills added: 3** (Slack, Browser-use, 1Password)

## 🔧 Technical Stack
- **Routing:** Smart token-based model selection
- **Cost:** ~$150/month (vs $30,000 for 8 employees)
- **Models:** Ollama → Haiku → o3-mini → Claude Sonnet
- **Budget Alert:** $100/$150 monthly
- **Backup:** agents-backup-20260405-181414

---
*Last updated: 2026-04-05 18:18 EDT*