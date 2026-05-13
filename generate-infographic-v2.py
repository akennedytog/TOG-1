from PIL import Image, ImageDraw, ImageFont
import os

# Create 1200x2000 image (vertical format for Twitter)
width, height = 1200, 2000
img = Image.new('RGB', (width, height), '#0f172a')
draw = ImageDraw.Draw(img)

# Gradient background
for y in range(height):
    r = int(15 + (40-15) * y / height)
    g = int(23 + (70-23) * y / height)
    b = int(42 + (100-42) * y / height)
    draw.line([(0, y), (width, y)], fill=(r, g, b))

# Load fonts
try:
    font_path = '/System/Library/Fonts/Helvetica.ttc'
    title_font = ImageFont.truetype(font_path, 56)
    header_font = ImageFont.truetype(font_path, 26)
    item_font = ImageFont.truetype(font_path, 19)
    small_font = ImageFont.truetype(font_path, 16)
except:
    title_font = ImageFont.load_default()
    header_font = ImageFont.load_default()
    item_font = ImageFont.load_default()
    small_font = ImageFont.load_default()

# Title
draw.text((60, 50), "🤖 50 OpenClaw Agents", font=title_font, fill=(255, 255, 255))
draw.text((60, 120), "Your Complete AI-Powered Development Toolkit", font=header_font, fill=(148, 163, 184))

# Separator line
draw.line([(60, 180), (width-60, 180)], fill=(59, 130, 246), width=2)

# All agents in categorized list format
y_pos = 210
line_height = 36

categories = [
    ("🏗️ CORE CODING (5)", [
        "coding-agent → Spawn Codex/Claude/Pi agents",
        "claude → Complex reasoning & analysis", 
        "codex → Fast feature building",
        "opencode → Quick parallel tasks",
        "pi → Cost-effective coding assistance"
    ], (96, 165, 250)),
    
    ("🔧 GITHUB AUTOMATION (10)", [
        "gh-issues → Auto-fetch, fix, and PR issues",
        "github → CLI ops: PRs, issues, CI, review",
        "git-worktree → Safe parallel PR reviews",
        "pr-review → Multi-agent analysis",
        "repo-analyzer → Architecture & tech debt insights",
        "commit-helper → Conventional commits",
        "changelog-gen → Auto release notes",
        "dependency-updater → Security patches",
        "release-manager → Tag & publish workflows",
        "repo-cloner → Bulk repo research"
    ], (139, 92, 246)),
    
    ("🧪 TESTING & QUALITY (6)", [
        "test-runner → Jest, pytest, go test",
        "coverage-reporter → Track coverage",
        "bug-predictor → ML-based prediction",
        "security-scanner → Snyk, CodeQL, semgrep",
        "lint-enforcer → ESLint, prettier, black",
        "type-checker → TypeScript, mypy"
    ], (52, 211, 153)),
    
    ("🚀 DEVOPS & DEPLOYMENT (10)", [
        "docker → Container management",
        "k8s-deploy → Kubernetes automation",
        "vercel-deploy → Frontend deployment",
        "netlify-deploy → Jamstack sites",
        "aws-deploy → AWS CDK & CloudFormation",
        "gcp-deploy → Google Cloud",
        "azure-deploy → Azure DevOps",
        "terraform → Infrastructure as Code",
        "pulumi → Modern IaC",
        "ci-cd → Pipeline automation"
    ], (251, 146, 60)),
    
    ("📊 MONITORING (6)", [
        "log-analyzer → Parse & search logs",
        "metrics-dashboard → Grafana visualization",
        "error-tracker → Sentry integration",
        "uptime-monitor → Health checks",
        "apm-tracer → Performance tracing",
        "cost-optimizer → Cloud cost reduction"
    ], (244, 114, 182)),
    
    ("📝 DOCUMENTATION (6)", [
        "doc-generator → Auto docs",
        "readme-writer → README from code",
        "code-explainer → Inline documentation",
        "tutorial-creator → Step-by-step guides",
        "api-docs → OpenAPI/Postman",
        "adr-writer → Architecture decisions"
    ], (167, 139, 250))
]

for cat_name, items, color in categories:
    # Draw category header with accent
    draw.rectangle([40, y_pos-5, 44, y_pos+25], fill=color)
    draw.text((55, y_pos), cat_name, font=header_font, fill=color)
    y_pos += 45
    
    # Draw items
    for item in items:
        draw.text((70, y_pos), f"• {item}", font=item_font, fill=(203, 213, 225))
        y_pos += line_height
    
    y_pos += 20  # Space between categories
    
    # Add separator if not last
    if y_pos < height - 300:
        draw.line([(70, y_pos-10), (width-70, y_pos-10)], fill=(51, 65, 85), width=1)

# Bottom section - remaining categories condensed
if y_pos > height - 400:
    y_pos = height - 350

draw.text((60, y_pos), "+ 5 More Categories:", font=header_font, fill=(148, 163, 184))
y_pos += 40

more_cats = [
    "🔍 Research (5): repo-cloner, code-search, license-checker, contributor-analyzer, trend-tracker",
    "🤝 Collaboration (6): slack, discord, teams, email-reporter, meeting-summarizer, notion-sync",
    "🔐 Security (4): secret-scanner, compliance-checker, access-reviewer, threat-modeler",
    "🎨 Frontend (5): ui-generator, css-optimizer, a11y-checker, perf-analyzer, responsive-tester",
    "🧠 AI/ML (5): model-trainer, prompt-tester, embedding-manager, data-validator, experiment-tracker"
]

for cat in more_cats:
    draw.text((70, y_pos), f"• {cat}", font=small_font, fill=(148, 163, 184))
    y_pos += 30

# Footer CTA
cta_y = height - 80
draw.rounded_rectangle([80, cta_y, width-80, cta_y + 50], radius=10, fill=(37, 99, 235))
draw.text((width//2 - 200, cta_y + 15), "🔗 Full article: theonegroup.info/blog/openclaw-github-agents", 
          font=small_font, fill=(255, 255, 255))

# Save
output_path = '/Users/aleckennedy/.openclaw/workspace/openclaw-agents-infographic.png'
img.save(output_path, 'PNG')
print(f"✅ Infographic saved: {output_path}")
print(f"📐 Dimensions: {width}x{height} (Twitter-optimized)")
print(f"🎨 All 50 agents organized by category")