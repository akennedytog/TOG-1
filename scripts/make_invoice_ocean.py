#!/usr/bin/env python3
"""Generate an itemized invoice for Ocean Promotions — Miami Dolphins Bodega Activation."""
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, Table,
                                TableStyle, HRFlowable)
from reportlab.lib.enums import TA_RIGHT

# ── Invoice details ──────────────────────────────────────────────
FROM_NAME = "The Global Key"
FROM_LINE = "Event & Hospitality Agency"
BILL_TO = "Ocean Promotions"
INVOICE_DATE = "August 30, 2026"
INVOICE_NO = f"INV-2026-{datetime.now().strftime('%y%m%d')}-{datetime.now().strftime('%H%M')}"
PROJECT = "Miami Dolphins Bodega Activation"

# Line items: (description, qty, unit price)
LINE_ITEMS = [
    ("DJ (12:00 PM - 5:00 PM)", 1, 750.00),
    ("Herradura Bottles", 2, 800.00),
    ("Jack Daniel's Bottles", 2, 600.00),
]

AGENCY_FEE_RATE = 0.15

subtotal = sum(qty * price for _, qty, price in LINE_ITEMS)
agency_fee = round(subtotal * AGENCY_FEE_RATE, 2)
total = round(subtotal + agency_fee, 2)

def money(x):
    return f"${x:,.2f}"

# ── Build PDF ─────────────────────────────────────────────────────
out = "/Users/aleckennedy/.openclaw/workspace/OceanPromotions_Invoice.pdf"
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
val = ParagraphStyle("ValX", parent=styles["Normal"], fontSize=10,
                      textColor=colors.HexColor("#1a1a1a"))
desc = ParagraphStyle("DescX", parent=styles["Normal"], fontSize=11,
                      leading=15, textColor=colors.HexColor("#1a1a1a"))
qty = ParagraphStyle("QtyX", parent=styles["Normal"], fontSize=10, alignment=1,
                     textColor=colors.HexColor("#1a1a1a"))
total_style = ParagraphStyle("TotalX", parent=styles["Normal"], fontSize=16,
                       textColor=colors.HexColor("#1a1a1a"))

story = []

# Header
head_tbl = Table(
    [[Paragraph(f"<b>{FROM_NAME}</b>", title),
      Paragraph("<b>INVOICE</b>", ParagraphStyle("Inv", parent=styles["Normal"],
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

# Bill To + Date + Project
info_tbl = Table(
    [[Paragraph("<b>BILL TO</b>", hdr), Paragraph("<b>DATE</b>", hdr)],
     [Paragraph(BILL_TO, val), Paragraph(INVOICE_DATE, val)],
     [Paragraph("<b>PROJECT</b>", hdr), Paragraph("", qty)],
     [Paragraph(PROJECT, val), Paragraph("", qty)]],
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
data = [[Paragraph("<b>DESCRIPTION</b>", hdr), Paragraph("<b>QTY</b>", hdr),
         Paragraph("<b>AMOUNT</b>", hdr)]]
for desc_text, qty_n, price in LINE_ITEMS:
    data.append([Paragraph(desc_text, desc), Paragraph(str(qty_n), qty),
                 Paragraph(money(qty_n * price), ParagraphStyle("Amt", parent=styles["Normal"],
                          fontSize=11, alignment=TA_RIGHT, textColor=colors.HexColor("#1a1a1a")))])
# Subtotal
data.append([Paragraph("<b>Subtotal</b>", ParagraphStyle("SubD", parent=styles["Normal"], fontSize=11)),
             Paragraph("", qty),
             Paragraph(money(subtotal), ParagraphStyle("SubA", parent=styles["Normal"],
                      fontSize=11, alignment=TA_RIGHT, textColor=colors.HexColor("#1a1a1a")))])
# Agency fee
data.append([Paragraph("Agency Fee (15%)", desc), Paragraph("", qty),
             Paragraph(money(agency_fee), ParagraphStyle("FeeA", parent=styles["Normal"],
                      fontSize=11, alignment=TA_RIGHT, textColor=colors.HexColor("#1a1a1a")))])

line_tbl = Table(data, colWidths=[4.6*inch, 0.7*inch, 1.5*inch])
line_tbl.setStyle(TableStyle([
    ("VALIGN", (0,0), (-1,-1), "TOP"),
    ("ALIGN", (1,0), (1,-1), "CENTER"),
    ("ALIGN", (2,0), (2,-1), "RIGHT"),
    ("LEFTPADDING", (0,0), (-1,-1), 0),
    ("RIGHTPADDING", (0,0), (-1,-1), 0),
    ("TOPPADDING", (0,0), (-1,-1), 6),
    ("BOTTOMPADDING", (0,0), (-1,-1), 6),
    ("LINEBELOW", (0,0), (-1,0), 0.8, colors.HexColor("#dddddd")),
    ("LINEBELOW", (0,len(LINE_ITEMS)), (-1,len(LINE_ITEMS)), 0.8, colors.HexColor("#dddddd")),
    ("LINEBELOW", (0,len(LINE_ITEMS)+1), (-1,len(LINE_ITEMS)+1), 0.8, colors.HexColor("#dddddd")),
]))
story.append(line_tbl)
story.append(Spacer(1, 0.2*inch))

# Total row
tot_tbl = Table(
    [[Paragraph("<b>Total Due</b>", ParagraphStyle("TD", parent=styles["Normal"],
                fontSize=12, alignment=TA_RIGHT)), Paragraph(f"<b>{money(total)}</b>", total_style)]],
    colWidths=[4.6*inch, 2.2*inch])
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
print(f"   Subtotal:  {money(subtotal)}")
print(f"   Agency Fee (15%): {money(agency_fee)}")
print(f"   Total:     {money(total)}")
