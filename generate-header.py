from PIL import Image, ImageDraw, ImageFont
import os
import sys

# Create 1200x630 image (Twitter card optimal size)
width, height = 1200, 630
img = Image.new('RGB', (width, height), '#1a1a2e')
draw = ImageDraw.Draw(img)

# Create gradient background
for y in range(height):
    r = int(30 + (59-30) * y / height)
    g = int(58 + (130-58) * y / height)
    b = int(138 + (246-138) * y / height)
    draw.line([(0, y), (width, y)], fill=(r, g, b))

# Draw subtle grid
for i in range(0, width, 50):
    draw.line([(i, 0), (i, height)], fill=(255, 255, 255, 15), width=1)
for i in range(0, height, 50):
    draw.line([(0, i), (width, i)], fill=(255, 255, 255, 15), width=1)

# Draw glow orb
def draw_glow(draw, cx, cy, radius, color):
    for r in range(radius, 0, -1):
        alpha = int(100 * (r / radius))
        fill_color = (*color, alpha)
        draw.ellipse([cx-r, cy-r, cx+r, cy+r], fill=fill_color)

# Add main glow
draw_glow(draw, width//2, height//2, 250, (139, 92, 246))

# Try to load fonts, fallback to default
try:
    # Try to find a nice font
    font_paths = [
        '/System/Library/Fonts/Helvetica.ttc',
        '/System/Library/Fonts/San Francisco.ttc',
        '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
        '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf',
        '/Library/Fonts/Arial.ttf',
    ]
    
    title_font = None
    subtitle_font = None
    badge_font = None
    stat_font = None
    
    for font_path in font_paths:
        if os.path.exists(font_path):
            title_font = ImageFont.truetype(font_path, 72)
            subtitle_font = ImageFont.truetype(font_path, 32)
            badge_font = ImageFont.truetype(font_path, 18)
            stat_font = ImageFont.truetype(font_path, 56)
            break
    
    if title_font is None:
        raise Exception("No font found")
        
except Exception as e:
    print(f"Using default font: {e}")
    title_font = ImageFont.load_default()
    subtitle_font = title_font
    badge_font = title_font
    stat_font = title_font

# Draw corner accents
accent_color = (255, 255, 255, 30)
# Top left
draw.line([(30, 30), (30, 180)], fill=(255, 255, 255, 50), width=2)
draw.line([(30, 30), (180, 30)], fill=(255, 255, 255, 50), width=2)
# Top right
draw.line([(width-30, 30), (width-30, 180)], fill=(255, 255, 255, 50), width=2)
draw.line([(width-180, 30), (width-30, 30)], fill=(255, 255, 255, 50), width=2)
# Bottom left
draw.line([(30, height-30), (30, height-180)], fill=(255, 255, 255, 50), width=2)
draw.line([(30, height-30), (180, height-30)], fill=(255, 255, 255, 50), width=2)
# Bottom right
draw.line([(width-30, height-30), (width-30, height-180)], fill=(255, 255, 255, 50), width=2)
draw.line([(width-180, height-30), (width-30, height-30)], fill=(255, 255, 255, 50), width=2)

# Draw badge
badge_text = "🤖 AI AUTOMATION"
bbox = draw.textbbox((0, 0), badge_text, font=badge_font)
badge_w = bbox[2] - bbox[0]
badge_h = bbox[3] - bbox[1]
badge_x = (width - badge_w) // 2
badge_y = 80

# Draw badge background (rounded rect)
draw.rounded_rectangle([badge_x - 25, badge_y - 10, badge_x + badge_w + 25, badge_y + badge_h + 10], 
                        radius=25, fill=(255, 255, 255, 30), outline=(255, 255, 255, 50), width=2)
draw.text((badge_x, badge_y), badge_text, font=badge_font, fill=(255, 255, 255))

# Draw title
title_text = "The OpenClaw Advantage"
try:
    bbox = draw.textbbox((0, 0), title_text, font=title_font)
    title_w = bbox[2] - bbox[0]
except:
    title_w = len(title_text) * 40
    
title_x = (width - title_w) // 2
title_y = 150

# Draw text with shadow for depth
draw.text((title_x+2, title_y+2), title_text, font=title_font, fill=(0, 0, 0, 100))
draw.text((title_x, title_y), title_text, font=title_font, fill=(255, 255, 255))

# Draw subtitle
subtitle_text = "How AI Agents Are Replacing Your Dev Team"
try:
    bbox = draw.textbbox((0, 0), subtitle_text, font=subtitle_font)
    subtitle_w = bbox[2] - bbox[0]
except:
    subtitle_w = len(subtitle_text) * 18
    
subtitle_x = (width - subtitle_w) // 2
subtitle_y = 260
draw.text((subtitle_x, subtitle_y), subtitle_text, font=subtitle_font, fill=(224, 231, 255))

subtitle_text2 = "(And Why That's Good)"
try:
    bbox = draw.textbbox((0, 0), subtitle_text2, font=subtitle_font)
    subtitle2_w = bbox[2] - bbox[0]
except:
    subtitle2_w = len(subtitle_text2) * 18
    
subtitle2_x = (width - subtitle2_w) // 2
subtitle2_y = subtitle_y + 50
draw.text((subtitle2_x, subtitle2_y), subtitle_text2, font=subtitle_font, fill=(224, 231, 255))

# Draw stats
stat_color = (252, 211, 77)  # Gold
label_color = (200, 200, 200, 200)

# Stat 1: 50 Agents
stat1_text = "50"
try:
    bbox = draw.textbbox((0, 0), stat1_text, font=stat_font)
    stat1_w = bbox[2] - bbox[0]
except:
    stat1_w = len(stat1_text) * 35
    
stat1_x = width//2 - 150 - stat1_w//2
stat1_y = 400
draw.text((stat1_x, stat1_y), stat1_text, font=stat_font, fill=stat_color)

label1_text = "GITHUB AGENTS"
try:
    label_font = ImageFont.truetype(font_path, 16)
except:
    label_font = ImageFont.load_default()
    
bbox = draw.textbbox((0, 0), label1_text, font=label_font)
label1_w = bbox[2] - bbox[0]
label1_x = width//2 - 150 - label1_w//2
label1_y = stat1_y + 70
draw.text((label1_x, label1_y), label1_text, font=label_font, fill=label_color)

# Stat 2: Infinity
stat2_text = "∞"
try:
    bbox = draw.textbbox((0, 0), stat2_text, font=stat_font)
    stat2_w = bbox[2] - bbox[0]
except:
    stat2_w = len(stat2_text) * 35
    
stat2_x = width//2 + 150 - stat2_w//2
stat2_y = 400
draw.text((stat2_x, stat2_y), stat2_text, font=stat_font, fill=stat_color)

label2_text = "POSSIBILITIES"
bbox = draw.textbbox((0, 0), label2_text, font=label_font)
label2_w = bbox[2] - bbox[0]
label2_x = width//2 + 150 - label2_w//2
label2_y = stat1_y + 70
draw.text((label2_x, label2_y), label2_text, font=label_font, fill=label_color)

# Draw watermark
try:
    watermark_font = ImageFont.truetype(font_path, 16)
except:
    watermark_font = ImageFont.load_default()
    
draw.text((width - 200, 30), "THE ONE GROUP", font=watermark_font, fill=(255, 255, 255, 80))

# Save image
output_path = sys.argv[1] if len(sys.argv) > 1 else 'openclaw-blog-header.png'
img.save(output_path, 'PNG')
print(f"✅ Header image saved: {output_path}")
print(f"📐 Dimensions: {width}x{height} (Twitter card optimized)")
print(f"💡 Tip: Upload this to Twitter when posting your article")