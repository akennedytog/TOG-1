#!/usr/bin/env python3
"""Create a polished, professional sales-executive PDF resume for Alec Kennedy (v3)."""
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
                                HRFlowable, KeepTogether)
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.lib import colors

OUT = "/Users/aleckennedy/.openclaw/workspace/SALES_EXEC_RESUME_ALEC_KENNEDY.pdf"

# Brand palette — deep navy + gold accent (premium spirits feel)
NAVY   = colors.HexColor('#0f1b2d')
GOLD   = colors.HexColor('#c9a227')
SLATE  = colors.HexColor('#4a5568')
LIGHT  = colors.HexColor('#f4f6f9')
DARK   = colors.HexColor('#111827')

doc = SimpleDocTemplate(OUT, pagesize=letter,
    rightMargin=0.55*inch, leftMargin=0.55*inch, topMargin=0.5*inch, bottomMargin=0.5*inch)

styles = getSampleStyleSheet()
name_style = ParagraphStyle('Name', parent=styles['Heading1'], fontSize=26, spaceAfter=0,
    textColor=NAVY, alignment=TA_LEFT, fontName='Helvetica-Bold')
contact_style = ParagraphStyle('Contact', parent=styles['Normal'], fontSize=9.5, spaceAfter=2,
    textColor=SLATE, alignment=TA_LEFT)
tag_style = ParagraphStyle('Tag', parent=contact_style, fontSize=12, spaceBefore=4, spaceAfter=0,
    textColor=GOLD, fontName='Helvetica-Bold')
section_style = ParagraphStyle('Section', parent=styles['Heading2'], fontSize=12.5, spaceBefore=12,
    spaceAfter=4, textColor=NAVY, fontName='Helvetica-Bold')
body = ParagraphStyle('Body', parent=styles['Normal'], fontSize=9.5, leading=13, spaceAfter=4, textColor=DARK)
bullet = ParagraphStyle('Bullet', parent=body, leftIndent=14, bulletIndent=4, spaceAfter=3)
role_style = ParagraphStyle('Role', parent=body, fontSize=10.5, spaceBefore=6, spaceAfter=1,
    textColor=NAVY, fontName='Helvetica-Bold')
sub_style = ParagraphStyle('Sub', parent=body, fontSize=9, spaceAfter=3, textColor=SLATE, fontName='Helvetica-Oblique')

story = []
def add(text, s=body): story.append(Paragraph(text, s))
def section(title):
    story.append(Paragraph(title, section_style))
    story.append(HRFlowable(width='100%', thickness=1.2, color=GOLD, spaceBefore=0, spaceAfter=6))

# Header band
story.append(Paragraph("ALEC KENNEDY", name_style))
story.append(Paragraph("Sales Executive Leader", tag_style))
story.append(Spacer(1, 6))
story.append(Paragraph("Fort Lauderdale, FL &nbsp;|&nbsp; (502) 403-7201 &nbsp;|&nbsp; akennedy@theonegroup.info &nbsp;|&nbsp; linkedin.com/in/alec-kennedy-1b3a7371", contact_style))
story.append(HRFlowable(width='100%', thickness=2.5, color=NAVY, spaceBefore=6, spaceAfter=2))

# Summary
section("SUMMARY")
add("Sales and marketing executive with <b>15+ years in the alcoholic beverage industry</b>, leading large, multi-market teams and driving revenue growth for the world's leading spirits portfolio. Proven record of building and scaling high-performing sales organizations, managing complex distributor and chain relationships, and owning P&amp;L across on-premise, off-premise, and chain channels. Named <b>Global Market of the Year (F'26)</b> and <b>Brand of the Year on Woodford Reserve</b> — the <b>#1 market in the world with 140,000+ cases</b>.")

# Headline achievements
section("HEADLINE ACHIEVEMENTS")
add("<b>Global Market of the Year — Brown-Forman (Fiscal 2026)</b>", body)
add("• Won the company's <b>top global market award</b> for outstanding commercial performance.", bullet)
add("• Drove <b>+6% market growth</b> in a competitive, mature spirits market — outperforming category and company benchmarks.", bullet)
add("<b>Brand of the Year — Woodford Reserve</b>", body)
add("• Won <b>Brand of the Year</b> on Woodford Reserve.", bullet)
add("• <b>#1 market in the world</b> for Woodford Reserve, with <b>140,000+ cases</b>.", bullet)
add("• Delivered category-leading premium bourbon growth in the world's most competitive spirits market.", bullet)

# Experience
section("EXPERIENCE")
add("State Manager, Florida On-Premise — Brown-Forman <font size=8 color='#4a5568'>(3 yrs, current)</font>", role_style)
add("Premier spirits portfolio: Jack Daniel's, Woodford Reserve, Herradura, Old Forester, and more.", sub_style)
add("• Lead a <b>large, multi-market on-premise sales team</b> across Florida — one of the company's highest-volume, most competitive markets.", bullet)
add("• Own <b>state P&amp;L and budget</b> across TMF/RMF/DIF fund lines (annual budget scope $6M+; personally accountable for a $4M+ on-premise/activation pool).", bullet)
add("• Direct <b>trade marketing, sponsorships, and on-premise activation</b> across F1 Miami, NFL/NHL team partnerships, major festivals, and premium hospitality venues — driving premium-brand visibility and velocity in key accounts.", bullet)
add("• Manage <b>distributor and chain relationships</b> at the wholesale and supplier level, executing brand strategy at scale across the three-tier system.", bullet)
add("• Develop and coach front-line and field leaders; built a pipeline of promotable managers.", bullet)

add("State Manager — OR/ID — Brown-Forman <font size=8 color='#4a5568'>(prior)</font>", role_style)
add("• Led state-level sales strategy and distributor management across Oregon and Idaho; drove brand execution, chain programming, and market share growth.", bullet)

add("Market Manager — Brown-Forman <font size=8 color='#4a5568'>(prior)</font>", role_style)
add("• Managed market-level sales execution, key accounts, and distributor partnerships; built the foundation of a career in high-performance spirits sales leadership.", bullet)

# Core competencies
section("CORE COMPETENCIES")
add("<b>Sales Leadership:</b> building &amp; scaling high-performing teams; state P&amp;L &amp; budget ownership; distributor &amp; chain account management; on-premise &amp; off-premise strategy; trade marketing &amp; sponsorship ROI.", bullet)
add("<b>Commercial Strategy:</b> complex large-account &amp; enterprise sales cycles; consultative, value-based selling; executive relationships; forecasting &amp; pipeline; three-tier distribution expertise.", bullet)
add("<b>Modern Operating:</b> data-driven selling &amp; CRM analytics; AI-native sales automation; cost-optimized commercial operations.", bullet)

# Metrics table
section("METRICS &amp; RESULTS")
metrics = [
    ["Industry Experience", "15+ years, alcoholic beverage"],
    ["Top Recognition", "Global Market of the Year (F'26)"],
    ["Brand Recognition", "Brand of the Year — Woodford Reserve"],
    ["Market Rank", "#1 in the world — 140,000+ cases"],
    ["Growth Delivered", "+6% market growth (F'26)"],
    ["Budget / P&L Scope", "$6M+ annual; $4M+ personally accountable"],
    ["Team Leadership", "Large multi-market sales org; pipeline of promotable leaders"],
]
t = Table(metrics, colWidths=[2.2*inch, 4.6*inch])
t.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (0,-1), LIGHT),
    ('TEXTCOLOR', (0,0), (0,-1), NAVY),
    ('FONTNAME', (0,0), (0,-1), 'Helvetica-Bold'),
    ('FONTSIZE', (0,0), (-1,-1), 9),
    ('TEXTCOLOR', (1,0), (1,-1), DARK),
    ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ('TOPPADDING', (0,0), (-1,-1), 4),
    ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ('LEFTPADDING', (0,0), (-1,-1), 8),
    ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ('ROWBACKGROUNDS', (0,0), (-1,-1), [colors.white, colors.HexColor('#fafbfc')]),
    ('LINEBELOW', (0,0), (-1,-2), 0.4, colors.HexColor('#e2e8f0')),
]))
story.append(t)

# Why hire me
section("WHY HIRE ME")
add("• I've led big teams and driven real revenue in one of the hardest, most relationship-driven industries in the world — and won the top global award for it.", bullet)
add("• I understand your customer. For hospitality and beverage companies: I've spent my career inside the on-premise, venue, and event world those buyers live in.", bullet)
add("• I build organizations. I don't inherit machines; I build them — hiring, cadence, process, playbooks, and culture.", bullet)
add("• I'm commercially modern. I've built and run AI-native sales operations, so I can scale revenue the way today's growth companies need.", bullet)

# Open to
section("OPEN TO")
add("VP Sales, VP Revenue, Head of Sales, Director of Sales, General Sales Manager, State Manager — beverage alcohol, hospitality, CPG, and technology. Preferred: Florida (Miami/Fort Lauderdale), hybrid, growth-stage with ownership and equity.", body)

doc.build(story)
print("Wrote", OUT)
