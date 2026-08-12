#!/usr/bin/env python3
"""
Lead Magnet PDF generator — "Did AI Just Steal Your Call?"

Purpose (2026-08-10): the flagship lead magnet from the research report. A short,
high-value PDF that pre-sells The One Group's $2,500 AI Visibility Audit. It walks
a South Florida SMB owner through the "AI is now the first place customers look"
problem, shows how missed calls cost them money, and ends with a CTA to take the
free AI Visibility Score.

This is the downloadable magnet offered in exchange for an email — funneling into
the Kit nurture sequence.

Usage:
  python3 scripts/make_ai_missed_call_report.py          # generates the PDF
  python3 scripts/make_ai_missed_call_report.py --vertical real_estate
"""
import argparse
from datetime import date
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (HRFlowable, Paragraph, SimpleDocTemplate,
                                Spacer, Table, TableStyle)

WS = Path("/Users/aleckennedy/.openclaw/workspace")
OUT_DIR = WS / "out" / "lead-magnet"
BRAND = colors.HexColor("#4f46e5")   # brand-600 indigo
DARK = colors.HexColor("#111827")
GRAY = colors.HexColor("#6b7280")

# Vertical-tailored framing so the magnet feels bespoke per industry
VERTICALS = {
    "default": {
        "service": "service", "title": "Did AI Just Steal Your Call?",
        "business": "business",
    },
    "real_estate": {
        "service": "listing", "title": "Did AI Just Steal Your Listing?",
        "business": "real estate business",
    },
    "hvac": {
        "service": "repair call", "title": "Did AI Just Steal Your Repair Call?",
        "business": "HVAC company",
    },
    "restaurant": {
        "service": "dinner reservation", "title": "Did AI Just Steal Your Reservation?",
        "business": "restaurant",
    },
}


def build_pdf(vertical="default"):
    cfg = VERTICALS.get(vertical, VERTICALS["default"])
    out = OUT_DIR / f"Did-AI-Just-Steal-Your-Call_{vertical}.pdf"
    out.parent.mkdir(parents=True, exist_ok=True)

    styles = getSampleStyleSheet()
    title = ParagraphStyle("title", parent=styles["Title"], fontName="Helvetica-Bold",
                           fontSize=22, leading=27, textColor=DARK, spaceAfter=6)
    sub = ParagraphStyle("sub", parent=styles["Normal"], fontSize=12, leading=17,
                         textColor=GRAY, spaceAfter=18)
    h2 = ParagraphStyle("h2", parent=styles["Heading2"], fontName="Helvetica-Bold",
                        fontSize=14, leading=19, textColor=BRAND, spaceBefore=16, spaceAfter=6)
    body = ParagraphStyle("body", parent=styles["Normal"], fontSize=11, leading=16,
                          textColor=DARK, spaceAfter=8)
    cta = ParagraphStyle("cta", parent=styles["Normal"], fontSize=12, leading=17,
                         textColor=colors.white, alignment=1)

    doc = SimpleDocTemplate(str(out), pagesize=letter,
                            leftMargin=0.85 * inch, rightMargin=0.85 * inch,
                            topMargin=0.8 * inch, bottomMargin=0.8 * inch,
                            title=cfg["title"], author="The One Group.AI")

    story = []
    story.append(Paragraph("The One Group.AI", ParagraphStyle(
        "brand", parent=styles["Normal"], fontName="Helvetica-Bold",
        fontSize=11, textColor=BRAND)))
    story.append(Spacer(1, 4))
    story.append(Paragraph(cfg["title"], title))
    story.append(Paragraph(
        "Why more customers are asking AI before they call you — and how to make sure "
        "you're the one they land on. A short guide for South Florida SMB owners.",
        sub))
    story.append(HRFlowable(width="100%", thickness=2, color=BRAND))

    story.append(Paragraph("The new front door", h2))
    story.append(Paragraph(
        "Ten years ago, a customer found you through Google or a neighbor's recommendation. "
        "Today, a growing share ask ChatGPT, Gemini, or Google's AI directly: "
        f"<i>\"who's the best {cfg['service']} near me?\"</i> That AI answer has become your new front door.",
        body))
    story.append(Paragraph(
        "Here's the uncomfortable part: <b>if AI doesn't know about you, it can't recommend you.</b> "
        "And it won't tell you it left you out. Your customers just quietly go somewhere else.",
        body))

    story.append(Paragraph(
        "What a missed " + cfg["service"] + " really costs", h2))
    data = [
        ["What happens", "Typical cost"],
        ["Missed call — customer calls your competitor", "$1,000+ lifetime value lost"],
        ["No response for 24 hours — they book elsewhere", "100% of that job"],
        ["AI recommends the shop next door instead of you", "Every future call they'd have made"],
    ]
    t = Table(data, colWidths=[4.2 * inch, 3.0 * inch])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), BRAND),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
        ("TEXTCOLOR", (0, 1), (-1, -1), DARK),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.HexColor("#f3f4f6"), colors.white]),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e5e7eb")),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
    ]))
    story.append(t)
    story.append(Spacer(1, 8))
    story.append(Paragraph(
        "<b>The math:</b> businesses miss roughly 27% of calls. A " + cfg["service"] +
        " business that fixes its lead response can stop thousands of dollars leaking every month "
        "— just by answering fast.", body))

    story.append(Paragraph("What the winners do", h2))
    for tip in [
        "<b>Answer every lead in under 60 seconds.</b> Speed is the single biggest factor in who gets the job.",
        "<b>Text back missed calls instantly.</b> Callers who get a reply within 5 minutes are far more likely to connect.",
        "<b>Make sure AI knows about you.</b> Consistent name/address/phone + reviews + clear service pages across the web.",
        "<b>Go 24/7.</b> The 2 AM call that used to hit voicemail can now book an appointment.",
    ]:
        story.append(Paragraph("• " + tip, body))

    story.append(Spacer(1, 8))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#e5e7eb")))
    story.append(Spacer(1, 12))
    cta_box = Table([[Paragraph(
        "Want to know if AI is recommending <b>you</b> right now?<br/>"
        "Take the free 60-second AI Visibility Score at theonegroup.info/ai-visibility-score", cta)]],
        colWidths=[7.2 * inch])
    cta_box.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), BRAND),
        ("TOPPADDING", (0, 0), (-1, -1), 18),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 18),
        ("LEFTPADDING", (0, 0), (-1, -1), 18),
        ("RIGHTPADDING", (0, 0), (-1, -1), 18),
    ]))
    story.append(cta_box)
    story.append(Spacer(1, 16))
    story.append(Paragraph(
        "The One Group.AI — AI Visibility Audits, Optimization & Coaching for South Florida SMBs. "
        f"{date.today().strftime('%B %Y')} · akennedy@theonegroup.info · (c) 502.403.7201 · theonegroup.info",
        ParagraphStyle("foot", parent=styles["Normal"], fontSize=8, textColor=GRAY)))

    doc.build(story)
    print(f"✅ {out}")
    return out


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--vertical", default="default",
                    choices=list(VERTICALS.keys()))
    args = ap.parse_args()
    build_pdf(args.vertical)
