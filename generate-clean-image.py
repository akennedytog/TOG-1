from PIL import Image, ImageDraw, ImageFont
import os

# Create 1200x1500 image - cleaner, more readable
width, height = 1200, 1500
img = Image.new('RGB', (width, height), '#0f172a')
draw = ImageDraw.Draw(img)

# Subtle gradient
for y in range(height):
    r = int(15 + (25-15) * y / height)
    g = int(23 + (35-23) * y / height)  
    b = int(42 + (60-42) * y / height)
    draw.line([(0, y), (width, y)], fill=(r, g, b))

# Load fonts - larger sizes
try:
    font_path = '/System/Library/Fonts/Helvetica.ttc'
    title_font = ImageFont.truetype(font_path, 72)
    header_font = ImageFont.truetype(font_path, 32)
    item_font = ImageFont.truetype(font_path, 24)
    small_font = ImageFont.truetype(font_path, 20)
except:
    title_font = ImageFont.load_default()
    header_font = ImageFont.load_default()
    item_font = ImageFont.load_default()
    small_font = ImageFont.load_default()

# Title at top
draw.text((60, 60), "50 OpenClaw Agents", font=title_font, fill=(255, 255, 255))
draw.text((60, 150), "Your AI-Powered Development Toolkit", font=header_font, fill=(148, 163, 184))

# Separator
draw.line([(60, 220), (width-60, 220)], fill=(59, 130, 246), width=3)

# Simple grid layout - 2 columns
col1_x = 80
col2_x = 620
y_start = 260
line_height = 45
header_height = 60

categories_col1 = [
    ("🏗️ CORE CODING", [
        "coding-agent", "claude", "codex", "opencode", "pi"
    ], (96, 165, 250)),
    
    ("🔧 GITHUB", [
        "gh-issues", "github", "git-worktree", "pr-review", "repo-analyzer"
    ], (139, 92, 246)),
    
    ("🧪 TESTING", [
        "test-runner", "coverage-reporter", "bug-predictor", 
        "security-scanner", "lint-enforcer", "type-checker"
    ], (52, 211, 153)),
    
    ("🚀 DEVOPS", [
        "docker", "k8s-deploy", "vercel-deploy", 
        "netlify-deploy", "aws-deploy"
    ], (251, 146, 60)),
]

categories_col2 = [
    ("📊 MONITORING", [
        "log-analyzer", "metrics-dashboard", "error-tracker",
        "uptime-monitor", "apm-tracer", "cost-optimizer"
    ], (244, 114, 182)),
    
    ("📝 DOCS", [
        "doc-generator", "readme-writer", "code-explainer",
        "tutorial-creator", "api-docs", "adr-writer"
    ], (167, 139, 250)),
    
    ("🔍 RESEARCH", [
        "repo-cloner", "code-search", "license-checker", 
        "contributor-analyzer", "trend-tracker"
    ], (251, 191, 36)),
    
    ("🤝 COLLAB", [
        "slack", "discord", "teams", "email-reporter", 
        "meeting-summarizer", "notion-sync"
    ], (45, 212, 191)),
]

def draw_category(draw, x, y, name, items, color, font_header, font_item):
    # Category header box
    bbox = draw.textbbox((0, 0), name, font=font_header)
    text_w = bbox[2] - bbox[0]
    draw.rounded_rectangle([x-10, y-8, x + text_w + 20, y + 45], radius=8, fill=color)
    draw.text((x, y), name, font=font_header, fill=(255, 255, 255))
    
    y += 55
    for item in items:
        draw.text((x + 15, y), f"• {item}", font=font_item, fill=(226, 232, 240))
        y += line_height
    return y + 20

# Draw column 1
y1 = y_start
for cat_name, items, color in categories_col1:
    y1 = draw_category(draw, col1_x, y1, cat_name, items, color, header_font, item_font)

# Draw column 2  
y2 = y_start
for cat_name, items, color in categories_col2:
    y2 = draw_category(draw, col2_x, y2, cat_name, items, color, header_font, item_font)

# Bottom section - remaining categories in single row
bottom_y = max(y1, y2) + 30
draw.line([(60, bottom_y), (width-60, bottom_y)], fill=(71, 85, 105), width=1)
bottom_y += 30

# Remaining categories as simple text
remaining = [
    ("🔐 Security", ["secret-scanner", "compliance-checker", "access-reviewer", "threat-modeler"]),
    ("🎨 Frontend", ["ui-generator", "css-optimizer", "a11y-checker", "perf-analyzer", "responsive-tester"]),
    ("🧠 AI/ML", ["model-trainer", "prompt-tester", "embedding-manager", "data-validator", "experiment-tracker"])
]

x_pos = 80
for cat_name, items in remaining:
    # Header
    draw.text((x_pos, bottom_y), cat_name, font=small_font, fill=(148, 163, 184))
    # Items in one line
    items_text = ", ".join(items)
    draw.text((x_pos, bottom_y + 30), items_text, font=small_font, fill=(100, 116, 139))
    x_pos += 350

# CTA at bottom
cta_y = height - 100
draw.rounded_rectangle([100, cta_y, width-100, cta_y + 60], radius=12, fill=(37, 99, 235))
draw.text((width//2 - 280, cta_y + 18), "🔗 theonegroup.info/blog/openclaw-github-agents", 
          font=small_font, fill=(255, 255, 255))

# Save
output_path = '/Users/aleckennedy/.openclaw/workspace/openclaw-agents-clean.png'
img.save(output_path, 'PNG')
print(f"✅ Clean infographic saved: {output_path}")
print(f"📐 Dimensions: {width}x{height}")
print(f"👁️ Larger text, better spacing, cleaner layout")