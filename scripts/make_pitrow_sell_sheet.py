#!/usr/bin/env python3
"""
Pit Row Miami — One-Page PDF Sell Sheet (Dealership Edition)
Builds a clean, branded one-pager targeting car dealership marketing managers.
"""
import os
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor, white
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, Image,
                                Table, TableStyle, HRFlowable)
from reportlab.lib.enums import TA_CENTER, TA_LEFT

# ---- Brand colors (Pit Row Miami) ----
BLACK   = HexColor("#0a0a0a")
RED     = HexColor("#e10600")   # F1 red
GREY    = HexColor("#8a8a8a")
LIGHT   = HexColor("#f4f4f4")
WHITE   = HexColor("#ffffff")

OUT = os.path.expanduser("~/.openclaw/workspace/out/pitrow-sell-sheet.pdf")

# ---- Styles ----
def st(name, **kw):
    base = dict(fontName="Helvetica-Bold", fontSize=10, leading=13,
                textColor=WHITE, alignment=TA_LEFT)
    base.update(kw)
    return ParagraphStyle(name, **base)

s_logo   = st("logo", fontSize=26, leading=28, textColor=RED, alignment=TA_CENTER)
s_tag    = st("tag", fontSize=11, leading=14, textColor=GREY, alignment=TA_CENTER)
s_h1     = st("h1", fontSize=20, leading=24, textColor=WHITE, alignment=TA_CENTER)
s_h2     = st("h2", fontSize=13, leading=16, textColor=RED)
s_body   = st("body", fontName="Helvetica", fontSize=9.5, leading=13, textColor=WHITE)
s_body_g = st("bodyg", fontName="Helvetica", fontSize=9.5, leading=13, textColor=GREY)
s_bullet = st("bullet", fontName="Helvetica", fontSize=9.5, leading=13, textColor=WHITE,
              leftIndent=12, bulletIndent=2)
s_price  = st("price", fontSize=15, leading=18, textColor=RED, alignment=TA_CENTER)
s_cta    = st("cta", fontSize=12, leading=15, textColor=WHITE, alignment=TA_CENTER)

def build():
    doc = SimpleDocTemplate(OUT, pagesize=letter,
                            leftMargin=0.6*inch, rightMargin=0.6*inch,
                            topMargin=0.5*inch, bottomMargin=0.5*inch,
                            title="Pit Row Miami — Dealership Sell Sheet",
                            author="Pit Row Miami")
    story = []

    # ---- Header ----
    story.append(Paragraph("PIT ROW MIAMI", s_logo))
    story.append(Paragraph("Premium F1 Simulator Rentals — We Come to You", s_tag))
    story.append(Spacer(1, 0.12*inch))
    story.append(HRFlowable(width="100%", thickness=2, color=RED))
    story.append(Spacer(1, 0.12*inch))

    # ---- Headline ----
    story.append(Paragraph(
        "Turn Your Showroom Into a Race Weekend", s_h1))
    story.append(Spacer(1, 0.06*inch))
    story.append(Paragraph(
        "Two professional Fanatec F1 simulators, delivered, set up, and staffed at your dealership. "
        "Head-to-head racing on 48\" widescreens — the activation that gets people in the door "
        "and keeps them talking.", s_body_g))
    story.append(Spacer(1, 0.14*inch))

    # ---- Why dealerships ----
    story.append(Paragraph("WHY DEALERSHIPS BOOK PIT ROW", s_h2))
    story.append(Spacer(1, 0.05*inch))
    bullets = [
        "\u2022  Drive foot traffic — a race activation pulls families, enthusiasts, and browsers into the showroom.",
        "\u2022  Customer appreciation — reward buyers and service customers with a memorable experience.",
        "\u2022  Launch events &amp; test-drive days — pair sim racing with new-model reveals for a full event.",
        "\u2022  Social content — shareable racing moments that market your dealership for you.",
        "\u2022  Zero setup for your team — we deliver, set up, staff, and break down. You just host.",
    ]
    for b in bullets:
        story.append(Paragraph(b, s_bullet))
    story.append(Spacer(1, 0.14*inch))

    # ---- What's included ----
    story.append(Paragraph("WHAT'S INCLUDED", s_h2))
    story.append(Spacer(1, 0.05*inch))
    inc = [
        ["2", "Professional Fanatec sim rigs (wheel, pedals, force feedback)"],
        ["48\"", "Widescreen displays, head-to-head racing"],
        ["Full", "Delivery, setup, staffing &amp; breakdown — turnkey"],
        ["1", "On-site attendant to run races &amp; manage the queue"],
    ]
    t = Table(inc, colWidths=[0.7*inch, 6.3*inch])
    t.setStyle(TableStyle([
        ("FONTNAME", (0,0), (-1,-1), "Helvetica-Bold"),
        ("FONTSIZE", (0,0), (-1,-1), 9.5),
        ("TEXTCOLOR", (0,0), (0,-1), RED),
        ("TEXTCOLOR", (1,0), (1,-1), WHITE),
        ("FONTNAME", (1,0), (1,-1), "Helvetica"),
        ("BOTTOMPADDING", (0,0), (-1,-1), 5),
        ("TOPPADDING", (0,0), (-1,-1), 2),
    ]))
    story.append(t)
    story.append(Spacer(1, 0.16*inch))

    # ---- Pricing ----
    story.append(Paragraph("PRICING", s_h2))
    story.append(Spacer(1, 0.05*inch))
    story.append(Paragraph("From $1,200 / day", s_price))
    story.append(Spacer(1, 0.02*inch))
    story.append(Paragraph(
        "Custom packages for multi-day events, launch weeks, and recurring activations. "
        "Volume &amp; partnership pricing available.", s_body_g))
    story.append(Spacer(1, 0.16*inch))

    # ---- CTA ----
    story.append(HRFlowable(width="100%", thickness=1, color=GREY))
    story.append(Spacer(1, 0.1*inch))
    story.append(Paragraph("BOOK YOUR EVENT", s_cta))
    story.append(Spacer(1, 0.04*inch))
    story.append(Paragraph(
        "info@pitrowmiami.com  &nbsp;|&nbsp;  pitrowmiami.com  &nbsp;|&nbsp;  (954) 800-2162",
        s_cta))
    story.append(Spacer(1, 0.08*inch))
    story.append(Paragraph(
        "Pit Row Miami is a trade name of The One Group. South Florida service area.",
        st("foot", fontSize=7.5, leading=9, textColor=GREY, alignment=TA_CENTER)))

    doc.build(story)
    print("PDF written:", OUT)

if __name__ == "__main__":
    build()
