#!/usr/bin/env python3
"""Create professional PDF resume for Alec Kennedy"""

from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, KeepTogether
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.lib import colors

# Create PDF
doc = SimpleDocTemplate(
    "/Users/aleckennedy/.openclaw/workspace/AI_RESUME_ALEC_KENNEDY.pdf",
    pagesize=letter,
    rightMargin=0.6*inch,
    leftMargin=0.6*inch,
    topMargin=0.6*inch,
    bottomMargin=0.6*inch
)

# Styles
styles = getSampleStyleSheet()

# Custom styles
title_style = ParagraphStyle(
    'CustomTitle',
    parent=styles['Heading1'],
    fontSize=24,
    spaceAfter=6,
    textColor=colors.HexColor('#1f2937')
)

subtitle_style = ParagraphStyle(
    'Subtitle',
    parent=styles['Normal'],
    fontSize=10,
    spaceAfter=12,
    textColor=colors.HexColor('#6b7280')
)

section_style = ParagraphStyle(
    'SectionHeader',
    parent=styles['Heading2'],
    fontSize=13,
    spaceBefore=12,
    spaceAfter=6,
    textColor=colors.HexColor('#ea580c')
)

job_title_style = ParagraphStyle(
    'JobTitle',
    parent=styles['Heading3'],
    fontSize=11,
    spaceBefore=8,
    spaceAfter=2,
    textColor=colors.HexColor('#1f2937')
)

body_style = ParagraphStyle(
    'BodyText',
    parent=styles['Normal'],
    fontSize=9.5,
    leading=13,
    spaceAfter=4,
    textColor=colors.HexColor('#374151')
)

bullet_style = ParagraphStyle(
    'BulletText',
    parent=styles['Normal'],
    fontSize=9,
    leading=12,
    leftIndent=12,
    spaceAfter=2,
    textColor=colors.HexColor('#4b5563')
)

# Build content
story = []

# Header
story.append(Paragraph("ALEC KENNEDY", title_style))
story.append(Paragraph("AI Engineer & Automation Architect", subtitle_style))
story.append(Paragraph(
    "Miami, FL (Remote Flexible) • akennedy@theonegroup.info • 502-403-7201",
    subtitle_style
))
story.append(Paragraph(
    "linkedin.com/in/alec-kennedy-1b3a7371 • getbabynest.com • theonegroup.info",
    subtitle_style
))
story.append(Spacer(1, 8))

# Summary
story.append(Paragraph("SUMMARY", section_style))
story.append(Paragraph(
    "AI Engineer with hands-on experience building production systems — from multi-agent automation architectures to full-stack AI-powered applications. "
    "Proven track record across two ventures: BabyNest (Next.js + TypeScript + Supabase AI financial planning app with $720M TAM) and The One Group "
    "(8-agent automation serving 754+ leads). Cost-conscious infrastructure specialist ($0 inference via local-first approach).",
    body_style
))
story.append(Spacer(1, 4))

# Experience Section
story.append(Paragraph("EXPERIENCE", section_style))

# BabyNest
story.append(Paragraph("BabyNest — Founder & Full-Stack AI Engineer | May 2026", job_title_style))
story.append(Paragraph("• Architected AI-powered baby financial planning app (getbabynest.com) from concept to production — $720M TAM, zero direct competitors", bullet_style))
story.append(Paragraph("• Full-stack development: Next.js, TypeScript, Supabase, Tailwind CSS, Framer Motion with glassmorphism design system", bullet_style))
story.append(Paragraph("• AI features: State-aware guidance, insurance decoder, 529 plan optimization, timeline-based recommendations", bullet_style))
story.append(Paragraph("• Production audit complete: TypeScript compilation, accessibility compliance, performance optimization", bullet_style))
story.append(Paragraph("• Business model: Subscription tiers ($9.99/mo), employer benefits integration, state-specific content", bullet_style))

# The One Group
story.append(Paragraph("The One Group — Founder & AI Engineer | 2026 - Present", job_title_style))
story.append(Paragraph("• Built AI consulting practice with 4 service tiers ($297/mo to $10,000 implementations)", bullet_style))
story.append(Paragraph("• Deployed 8-agent production automation: Arlo (lead research), Dante (content), Iris (outreach), Abby (QA), plus Dev/Opal/Rico/Jerry", bullet_style))
story.append(Paragraph("• Results: 754+ leads discovered, 3 posts/day automated, 45+ tweets posted, 15+ cron jobs running 24/7", bullet_style))
story.append(Paragraph("• Cost optimization: $0 inference via Ollama-first architecture, localModelLean enabled, 99.7% speed improvement (90min to 0.3s)", bullet_style))

# Freelance
story.append(Paragraph("AI Automation Projects — Freelance | 2025 - Present", job_title_style))
story.append(Paragraph("• Multi-platform social automation (Twitter, LinkedIn, Pinterest) with RSS-based content pipeline", bullet_style))
story.append(Paragraph("• Lead qualification, email sequencing, quality assurance automation", bullet_style))
story.append(Spacer(1, 4))

# Key Achievements
story.append(Paragraph("KEY ACHIEVEMENTS", section_style))

achievements_data = [
    ["Metric", "Result"],
    ["Leads Discovered", "754+ qualified leads"],
    ["Automation Jobs", "15+ cron jobs running 24/7"],
    ["Content Output", "3 posts/day automated"],
    ["Twitter Posts", "45+ posts (Mar 19-30, 2026)"],
    ["Inference Cost", "$0 (Ollama-first)"],
    ["Speed Improvement", "90min to 0.3s (99.7% faster)"],
    ["BabyNest TAM", "$720M addressable market"],
    ["Competitors", "Zero direct competitors"],
]

achievements_table = Table(achievements_data, colWidths=[2.2*inch, 3.5*inch])
achievements_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#ea580c')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
    ('FONTSIZE', (0, 0), (-1, 0), 10),
    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
    ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
    ('FONTSIZE', (0, 1), (-1, -1), 9),
    ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor('#fff7ed'), colors.white]),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#fed7aa')),
    ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ('TOPPADDING', (0, 0), (-1, -1), 6),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
]))
story.append(achievements_table)
story.append(Spacer(1, 8))

# Technical Skills
story.append(Paragraph("TECHNICAL SKILLS", section_style))
story.append(Paragraph(
    "<b>Full-Stack:</b> Next.js 14 App Router, TypeScript, Supabase (real-time/auth/storage), Tailwind CSS, Shadcn/ui, Framer Motion",
    body_style
))
story.append(Paragraph(
    "<b>AI/ML:</b> OpenClaw agent framework, Ollama local deployment, OpenAI/Claude APIs, multi-agent orchestration, cost-optimized routing",
    body_style
))
story.append(Paragraph(
    "<b>Infrastructure:</b> Cron automation, JSON state management, local-first AI ($0 inference), provider fallbacks, policy enforcement",
    body_style
))
story.append(Paragraph(
    "<b>Programming:</b> Python, JavaScript/TypeScript, Git workflow, shell scripting",
    body_style
))
story.append(Spacer(1, 4))

# Education
story.append(Paragraph("EDUCATION & LEARNING", section_style))
story.append(Paragraph(
    "Self-Directed: OpenClaw agent framework (advanced), multi-agent orchestration patterns, cost-optimized AI architecture, SMB workflow automation",
    body_style
))

# Build PDF
doc.build(story)
print("PDF Resume Created: AI_RESUME_ALEC_KENNEDY.pdf")
