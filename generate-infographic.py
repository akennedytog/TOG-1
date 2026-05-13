from PIL import Image, ImageDraw, ImageFont
import os

# Create 1200x2400 image (long format for Twitter)
width, height = 1200, 2400
img = Image.new('RGB', (width, height), '#0f172a')
draw = ImageDraw.Draw(img)

# Create gradient background
for y in range(height):
    r = int(15 + (30-15) * y / height)
    g = int(23 + (58-23) * y / height)
    b = int(42 + (138-42) * y / height)
    draw.line([(0, y), (width, y)], fill=(r, g, b))

# Try to load fonts
font_paths = [
    '/System/Library/Fonts/Helvetica.ttc',
    '/System/Library/Fonts/San Francisco.ttc',
    '/Library/Fonts/Arial.ttf',
]

try:
    title_font = ImageFont.truetype(font_paths[0], 60)
    header_font = ImageFont.truetype(font_paths[0], 28)
    item_font = ImageFont.truetype(font_paths[0], 20)
    small_font = ImageFont.truetype(font_paths[0], 18)
except:
    title_font = ImageFont.load_default()
    header_font = ImageFont.load_default()
    item_font = ImageFont.load_default()
    small_font = ImageFont.load_default()

# Title area
title = "50 OpenClaw Agents"
draw.text((width//2 - 280, 50), title, font=title_font, fill=(255, 255, 255))
subtitle = "The Complete Toolkit for AI-Powered Development"
draw.text((width//2 - 250, 130), subtitle, font=header_font, fill=(148, 163, 184))

# Categories data
categories = [
    ("🏗️ Core Coding", 5, ["coding-agent", "claude", "codex", "opencode", "pi"]),
    ("🔧 GitHub Auto", 10, ["gh-issues", "github", "git-worktree", "pr-review", "repo-analyzer", 
                             "commit-helper", "changelog-gen", "dependency-updater", "release-manager", "repo-cloner"]),
    ("🧪 Testing", 6, ["test-runner", "coverage-reporter", "bug-predictor", "security-scanner", 
                       "lint-enforcer", "type-checker"]),
    ("🚀 DevOps", 10, ["docker", "k8s-deploy", "vercel-deploy", "netlify-deploy", "aws-deploy",
                       "gcp-deploy", "azure-deploy", "terraform", "pulumi", "ci-cd"]),
    ("📊 Monitoring", 6, ["log-analyzer", "metrics-dashboard", "error-tracker", "uptime-monitor",
                          "apm-tracer", "cost-optimizer"]),
    ("📝 Docs", 6, ["doc-generator", "readme-writer", "code-explainer", "tutorial-creator",
                    "api-docs", "adr-writer"]),
]

y_pos = 220
box_width = 360
box_height = 280
margin = 30
cols = 3

for idx, (cat_name, count, items) in enumerate(categories):
    col = idx % cols
    row = idx // cols
    x = 30 + col * (box_width + margin)
    y = y_pos + row * (box_height + margin)
    
    # Draw box background
    draw.rounded_rectangle([x, y, x + box_width, y + box_height], radius=15, 
                           fill=(30, 41, 59), outline=(59, 130, 246), width=2)
    
    # Category header
    draw.text((x + 15, y + 15), f"{cat_name} ({count})", font=header_font, fill=(96, 165, 250))
    
    # Items
    item_y = y + 55
    for item in items:
        draw.text((x + 20, item_y), f"• {item}", font=item_font, fill=(203, 213, 225))
        item_y += 28
    
    # Add glow effect
    for r in range(8, 0, -1):
        alpha = int(30 * (r / 8))
        draw.rounded_rectangle([x-r, y-r, x+box_width+r, y+box_height+r], 
                              radius=15+r, outline=(59, 130, 246, alpha), width=1)

# More categories (second row of boxes)
y_pos2 = y_pos + 2 * (box_height + margin) + 50

categories2 = [
    ("🔍 Research", 5, ["repo-cloner", "code-search", "license-checker", "contributor-analyzer", "trend-tracker"]),
    ("🤝 Collab", 6, ["slack", "discord", "teams", "email-reporter", "meeting-summarizer", "notion-sync"]),
    ("🔐 Security", 4, ["secret-scanner", "compliance-checker", "access-reviewer", "threat-modeler"]),
    ("🎨 Frontend", 5, ["ui-generator", "css-optimizer", "a11y-checker", "perf-analyzer", "responsive-tester"]),
    ("🧠 AI/ML", 5, ["model-trainer", "prompt-tester", "embedding-manager", "data-validator", "experiment-tracker"]),
]

box_width2 = 360
box_height2 = 240

for idx, (cat_name, count, items) in enumerate(categories2):
    if idx < 3:
        x = 30 + idx * (box_width2 + margin)
        y = y_pos2
    else:
        x = 30 + (idx - 3) * (box_width2 + 150)
        y = y_pos2 + box_height2 + margin
    
    # Draw box
    draw.rounded_rectangle([x, y, x + box_width2, y + box_height2], radius=15,
                           fill=(30, 41, 59), outline=(139, 92, 246), width=2)
    
    # Header
    draw.text((x + 15, y + 15), f"{cat_name} ({count})", font=header_font, fill=(167, 139, 250))
    
    # Items
    item_y = y + 55
    for item in items:
        draw.text((x + 20, item_y), f"• {item}", font=item_font, fill=(203, 213, 225))
        item_y += 28

# Bottom call to action
cta_y = height - 120
draw.rounded_rectangle([100, cta_y, width-100, cta_y + 80], radius=20,
                       fill=(59, 130, 246))
draw.text((width//2 - 180, cta_y + 25), "Full article: theonegroup.info", 
          font=header_font, fill=(255, 255, 255))

# Save
img.save('openclaw-agents-infographic.png', 'PNG')
print("✅ Infographic saved: openclaw-agents-infographic.png")
print("📐 Dimensions: 1200x2400 (Twitter-optimized)")
print("💡 All 50 agents organized by category")