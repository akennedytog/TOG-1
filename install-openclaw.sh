#!/bin/bash

# OpenClaw Standard Install Script
# The One Group - Professional OpenClaw Setup
# Usage: ./install-openclaw.sh [client-name]

set -e

CLIENT_NAME="${1:-client}"
INSTALL_DIR="$HOME/.openclaw-$CLIENT_NAME"
LOG_FILE="/tmp/openclaw-install-$(date +%Y%m%d-%H%M%S).log"

echo "🔥 OpenClaw Professional Installer"
echo "=================================="
echo "Client: $CLIENT_NAME"
echo "Log: $LOG_FILE"
echo ""

# Log everything
exec > >(tee -a "$LOG_FILE")
exec 2>&1

# Check prerequisites
check_prerequisites() {
    echo "📋 Checking prerequisites..."
    
    # Node.js version
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$NODE_VERSION" -lt 22 ]; then
            echo "❌ Node.js 22+ required. Found: $(node -v)"
            echo "   Install via: npm install -g n && n 22"
            exit 1
        fi
        echo "✅ Node.js $(node -v)"
    else
        echo "❌ Node.js not found. Please install Node.js 22+"
        exit 1
    fi
    
    # npm
    if command -v npm &> /dev/null; then
        echo "✅ npm $(npm -v)"
    else
        echo "❌ npm not found"
        exit 1
    fi
    
    # Git
    if command -v git &> /dev/null; then
        echo "✅ Git installed"
    else
        echo "❌ Git not found"
        exit 1
    fi
    
    echo ""
}

# Install OpenClaw
install_openclaw() {
    echo "📦 Installing OpenClaw..."
    npm install -g openclaw
    echo "✅ OpenClaw installed"
    echo ""
}

# Create directory structure
setup_directories() {
    echo "📁 Setting up directory structure..."
    mkdir -p "$INSTALL_DIR"/{agents,skills,cron,logs}
    mkdir -p "$INSTALL_DIR/agents"/{arlo,dante,iris,abby,dev,opal,rico,jerry}
    echo "✅ Directories created at $INSTALL_DIR"
    echo ""
}

# Create routing config
create_routing_config() {
    echo "⚙️  Creating routing configuration..."
    
    cat > "$INSTALL_DIR/config.json" << 'EOF'
{
  "version": "3.0",
  "router": "~/.openclaw/router-middleware.js",
  "use_intelligent_routing": true,
  
  "providers": [
    "ollama",
    "openai",
    "anthropic"
  ],

  "models": {
    "default": "ollama/kimi-k2.5",
    "fallback": "anthropic/claude-3-5-sonnet",
    "reasoning": "openai/o3-mini",
    "openai_default": "openai/o3-mini",
    "large_tasks": "anthropic/claude-3-5-sonnet"
  },

  "limits": {
    "free_max_tokens": 8000,
    "cheap_max_tokens": 15000,
    "budget_monthly": 150
  },

  "error_handling": {
    "auto_retry": true,
    "fallback_on_timeout": true,
    "fallback_on_rate_limit": true
  }
}
EOF
    
    echo "✅ Routing config created"
    echo ""
}

# Create agent configurations
create_agent_configs() {
    echo "🤖 Creating agent configurations..."
    
    # Arlo - Research Agent
    cat > "$INSTALL_DIR/agents/arlo/config.json" << 'EOF'
{
  "name": "Arlo",
  "role": "Research Agent",
  "description": "Finds qualified leads and research prospects",
  "model": "ollama/kimi-k2.5:cloud",
  "skills": ["web-search", "apollo-io", "data-analysis"],
  "daily_tasks": ["find_leads", "research_prospects"],
  "schedule": "9:00 AM"
}
EOF

    # Dante - Content Agent
    cat > "$INSTALL_DIR/agents/dante/config.json" << 'EOF'
{
  "name": "Dante",
  "role": "Content Agent",
  "description": "Creates blog posts and social content",
  "model": "anthropic/claude-3-5-sonnet",
  "skills": ["content-writing", "twitter", "canva"],
  "daily_tasks": ["create_blog_post", "create_social_content"],
  "schedule": "8:00 AM, 12:00 PM"
}
EOF

    # Iris - Outreach Agent
    cat > "$INSTALL_DIR/agents/iris/config.json" << 'EOF'
{
  "name": "Iris",
  "role": "Outreach Agent",
  "description": "Manages email sequences and follow-ups",
  "model": "anthropic/claude-3-5-sonnet",
  "skills": ["gmail", "email-sequences", "calendar"],
  "daily_tasks": ["send_follow_ups", "check_responses"],
  "schedule": "2:00 PM"
}
EOF

    # Abby - QA Agent
    cat > "$INSTALL_DIR/agents/abby/config.json" << 'EOF'
{
  "name": "Abby",
  "role": "QA Agent",
  "description": "Reviews all content and code before publication",
  "model": "openai/o3-mini",
  "skills": ["content-review", "code-review"],
  "daily_tasks": ["review_content", "review_code"],
  "schedule": "continuous"
}
EOF

    # Dev - Development Agent
    cat > "$INSTALL_DIR/agents/dev/config.json" << 'EOF'
{
  "name": "Dev",
  "role": "Development Agent",
  "description": "Handles website updates and deployments",
  "model": "anthropic/claude-3-5-sonnet",
  "skills": ["github", "netlify", "html-css", "javascript"],
  "daily_tasks": ["check_deployments", "fix_bugs"],
  "schedule": "on-demand"
}
EOF

    # Opal - Operations Agent
    cat > "$INSTALL_DIR/agents/opal/config.json" << 'EOF'
{
  "name": "Opal",
  "role": "Operations Agent",
  "description": "Manages scheduling and business workflows",
  "model": "ollama/kimi-k2.5:cloud",
  "skills": ["calendar", "todoist", "reminders"],
  "daily_tasks": ["check_calendar", "manage_tasks"],
  "schedule": "8:00 AM"
}
EOF

    # Rico - Analytics Agent
    cat > "$INSTALL_DIR/agents/rico/config.json" << 'EOF'
{
  "name": "Rico",
  "role": "Analytics Agent",
  "description": "Tracks metrics and generates reports",
  "model": "openai/o3-mini",
  "skills": ["analytics", "reporting", "data-visualization"],
  "daily_tasks": ["generate_reports", "track_metrics"],
  "schedule": "5:00 PM"
}
EOF

    # Jerry - Support Agent
    cat > "$INSTALL_DIR/agents/jerry/config.json" << 'EOF'
{
  "name": "Jerry",
  "role": "Support Agent",
  "description": "General assistance and task management",
  "model": "ollama/kimi-k2.5:cloud",
  "skills": ["general-assistance", "research", "documentation"],
  "daily_tasks": ["assist_user", "research_topics"],
  "schedule": "on-demand"
}
EOF

    echo "✅ 8 agent configs created"
    echo ""
}

# Create cron jobs
setup_cron() {
    echo "⏰ Setting up automation schedule..."
    
    cat > "$INSTALL_DIR/cron/schedule.json" << 'EOF'
{
  "jobs": [
    {
      "name": "morning-briefing",
      "schedule": "0 8 * * *",
      "agents": ["opal", "rico"],
      "task": "daily_briefing"
    },
    {
      "name": "lead-research",
      "schedule": "0 9 * * *",
      "agents": ["arlo"],
      "task": "find_leads"
    },
    {
      "name": "content-creation",
      "schedule": "0 8,12 * * *",
      "agents": ["dante"],
      "task": "create_content"
    },
    {
      "name": "email-outreach",
      "schedule": "0 14 * * *",
      "agents": ["iris"],
      "task": "send_sequences"
    },
    {
      "name": "daily-report",
      "schedule": "0 17 * * *",
      "agents": ["rico"],
      "task": "generate_daily_report"
    },
    {
      "name": "weekly-cost-audit",
      "schedule": "0 9 * * 0",
      "agents": ["rico"],
      "task": "cost_audit"
    }
  ]
}
EOF

    echo "✅ Cron schedule created"
    echo ""
}

# Create .env template
create_env_template() {
    echo "🔐 Creating environment template..."
    
    cat > "$INSTALL_DIR/.env.example" << 'EOF'
# OpenClaw Configuration
# Copy this to .env and fill in your API keys

# Required: At least one of these
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Optional: For local models
OLLAMA_HOST=http://localhost:11434

# Optional: For skills
GMAIL_TOKEN=...
TWITTER_API_KEY=...
TWITTER_API_SECRET=...
TWITTER_ACCESS_TOKEN=...
TWITTER_ACCESS_SECRET=...
APOLLO_API_KEY=...
TODOIST_API_TOKEN=...

# Optional: For deployment
NETLIFY_AUTH_TOKEN=...
GITHUB_TOKEN=...

# Budget settings
MONTHLY_BUDGET=150
ALERT_THRESHOLD=100
EOF

    echo "✅ .env.example created"
    echo ""
}

# Create README
create_readme() {
    echo "📖 Creating documentation..."
    
    cat > "$INSTALL_DIR/README.md" << EOF
# OpenClaw Setup - $CLIENT_NAME

Installed: $(date)

## Quick Start

1. **Set up API keys:**
   \`\`\`bash
   cp .env.example .env
   # Edit .env with your keys
   \`\`\`

2. **Install skills:**
   \`\`\`bash
   openclaw skills install gmail
   openclaw skills install twitter
   openclaw skills install todoist
   # Add more as needed
   \`\`\`

3. **Start OpenClaw:**
   \`\`\`bash
   openclaw start
   \`\`\`

## Agent Overview

| Agent | Role | Schedule | Model |
|-------|------|----------|-------|
| Arlo | Research | 9 AM Daily | Ollama |
| Dante | Content | 8 AM, 12 PM | Claude Sonnet |
| Iris | Outreach | 2 PM Daily | Claude Sonnet |
| Abby | QA | Continuous | o3-mini |
| Dev | Development | On-demand | Claude Sonnet |
| Opal | Operations | 8 AM Daily | Ollama |
| Rico | Analytics | 5 PM Daily | o3-mini |
| Jerry | Support | On-demand | Ollama |

## Automation Schedule

- **8:00 AM**: Morning briefing + content creation
- **9:00 AM**: Lead research
- **12:00 PM**: Content creation
- **2:00 PM**: Email outreach
- **5:00 PM**: Daily report
- **Sunday 9 AM**: Weekly cost audit

## Cost Management

- Monthly budget: \$150
- Smart routing enabled
- Auto-fallback on errors
- Weekly cost reports

## Support

The One Group
https://calendly.com/akennedy-theonegroup/30min
EOF

    echo "✅ README.md created"
    echo ""
}

# Create install summary
create_summary() {
    echo ""
    echo "=================================="
    echo "✅ Installation Complete!"
    echo "=================================="
    echo ""
    echo "Location: $INSTALL_DIR"
    echo "Log file: $LOG_FILE"
    echo ""
    echo "Next Steps:"
    echo "1. cd $INSTALL_DIR"
    echo "2. cp .env.example .env"
    echo "3. Edit .env with your API keys"
    echo "4. Install skills: openclaw skills install <skill-name>"
    echo "5. Start: openclaw start"
    echo ""
    echo "Documentation: $INSTALL_DIR/README.md"
    echo ""
    echo "Need help? Book a call:"
    echo "https://calendly.com/akennedy-theonegroup/30min"
    echo ""
}

# Main installation
main() {
    check_prerequisites
    install_openclaw
    setup_directories
    create_routing_config
    create_agent_configs
    setup_cron
    create_env_template
    create_readme
    create_summary
}

main