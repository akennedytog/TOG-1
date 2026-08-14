#!/usr/bin/env python3
"""Generate a professional invoice PDF for The Global Key."""
import random
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, Table,
                                TableStyle, HRFlowable)
from reportlab.lib.enums import TA_RIGHT, TA_LEFT

# ── Invoice details ──────────────────────────────────────────────
FROM_NAME = "The Global Key"
FROM_LINE = "Event & Hospitality Agency"
BILL_TO = "Alec Kennedy / Brown-Forman"
INVOICE_DATE = "July 29, 2026"
INVOICE_NO = f"INV-2026-{random.randint(1000, 9999)}"
TOTAL = "$3,125.38"
DESCRIPTION = ("PBR Florida Freedom Dinner — Cote\n"
               "14 guests · Jack Daniel's & Woodford Reserve cocktails")

# ── Build PDF ─────────────────────────────────────────────────────
out = "/Users/aleckennedy/.openclaw/workspace/TheGlobalKey_Invoice.pdf"
doc = SimpleDocTemplate(out, pagesize=letter,
                        rightMargin=0.9*inch, leftMargin=0.9*inch,
                        topMargin=0.8*inch, bottomMargin=0.8*inch)

styles = getSampleStyleSheet()
title = ParagraphStyle("TitleX", parent=styles["Title"], fontSize=26,
                       textColor=colors.HexColor("#1a1a1a"), spaceAfter=2)
sub = ParagraphStyle("SubX", parent=styles["Normal"], fontSize=11,
                     textColor=colors.HexColor("#666666"))
hdr = ParagraphStyle("HdrX", parent=styles["Normal"], fontSize=10,
                     textColor=colors.HexColor("#888888"))
lbl = ParagraphStyle("LblX", parent=styles["Normal"], fontSize=10,
                      textColor=colors.HexColor("#555555"))
val = ParagraphStyle("ValX", parent=styles["Normal"], fontSize=10,
                      textColor=colors.HexColor("#1a1a1a"))
desc = ParagraphStyle("DescX", parent=styles["Normal"], fontSize=11,
                      leading=15, textColor=colors.HexColor("#1a1a1a"))
total = ParagraphStyle("TotalX", parent=styles["Normal"], fontSize=16,
                       textColor=colors.HexColor("#1a1a1a"))

story = []

# Header: From (left) / Invoice meta (right)
head_tbl = Table(
    [[Paragraph(f"<b>{FROM_NAME}</b>", title),
      Paragraph(f"<b>INVOICE</b>", ParagraphStyle("Inv", parent=styles["Normal"],
                fontSize=20, alignment=TA_RIGHT, textColor=colors.HexColor("#1a1a1a")))],
     [Paragraph(FROM_LINE, sub),
      Paragraph(f"<b>#{INVOICE_NO}</b>", ParagraphStyle("InvNo", parent=styles["Normal"],
                fontSize=12, alignment=TA_RIGHT, textColor=colors.HexColor("#666666")))]],
    colWidths=[4.2*inch, 2.6*inch])
head_tbl.setStyle(TableStyle([
    ("VALIGN", (0,0), (-1,-1), "TOP"),
    ("LEFTPADDING", (0,0), (-1,-1), 0),
    ("RIGHTPADDING", (0,0), (-1,-1), 0),
]))
story.append(head_tbl)
story.append(Spacer(1, 0.15*inch))
story.append(HRFlowable(width="100%", thickness=1.2,
                        color=colors.HexColor("#1a1a1a")))
story.append(Spacer(1, 0.25*inch))

# Bill To + Date
info_tbl = Table(
    [[Paragraph("<b>BILL TO</b>", hdr), Paragraph("<b>DATE</b>", hdr)],
     [Paragraph(BILL_TO, val), Paragraph(INVOICE_DATE, val)]],
    colWidths=[4.2*inch, 2.6*inch])
info_tbl.setStyle(TableStyle([
    ("VALIGN", (0,0), (-1,-1), "TOP"),
    ("LEFTPADDING", (0,0), (-1,-1), 0),
    ("RIGHTPADDING", (0,0), (-1,-1), 0),
    ("BOTTOMPADDING", (0,0), (-1,-1), 4),
]))
story.append(info_tbl)
story.append(Spacer(1, 0.35*inch))

# Line items table
line_tbl = Table(
    [[Paragraph("<b>DESCRIPTION</b>", hdr), Paragraph("<b>AMOUNT</b>", hdr)],
     [Paragraph(DESCRIPTION, desc), Paragraph(f"<b>{TOTAL}</b>", total)]],
    colWidths=[5.2*inch, 1.6*inch])
line_tbl.setStyle(TableStyle([
    ("VALIGN", (0,0), (-1,-1), "TOP"),
    ("ALIGN", (1,0), (1,-1), "RIGHT"),
    ("LEFTPADDING", (0,0), (-1,-1), 0),
    ("RIGHTPADDING", (0,0), (-1,-1), 0),
    ("TOPPADDING", (0,0), (-1,-1), 6),
    ("BOTTOMPADDING", (0,0), (-1,-1), 6),
    ("LINEBELOW", (0,0), (-1,0), 0.8, colors.HexColor("#dddddd")),
    ("LINEBELOW", (0,1), (-1,1), 0.8, colors.HexColor("#dddddd")),
]))
story.append(line_tbl)
story.append(Spacer(1, 0.2*inch))

# Total row
tot_tbl = Table(
    [[Paragraph("<b>Total Due</b>", ParagraphStyle("TD", parent=styles["Normal"],
                fontSize=12, alignment=TA_RIGHT)), Paragraph(f"<b>{TOTAL}</b>", total)]],
    colWidths=[5.2*inch, 1.6*inch])
tot_tbl.setStyle(TableStyle([
    ("ALIGN", (0,0), (0,0), "RIGHT"),
    ("ALIGN", (1,0), (1,0), "RIGHT"),
    ("LEFTPADDING", (0,0), (-1,-1), 0),
    ("RIGHTPADDING", (0,0), (-1,-1), 0),
    ("TOPPADDING", (0,0), (-1,-1), 8),
]))
story.append(tot_tbl)
story.append(Spacer(1, 0.4*inch))

# Payment terms
story.append(Paragraph("<b>Payment Terms</b>", hdr))
story.append(Spacer(1, 0.05*inch))
story.append(Paragraph("Net 30 · Please remit payment to The Global Key.",
                       ParagraphStyle("Terms", parent=styles["Normal"], fontSize=10,
                                      textColor=colors.HexColor("#555555"))))

doc.build(story)
print(f"✅ Invoice written: {out}")
print(f"   Invoice #: {INVOICE_NO}")
