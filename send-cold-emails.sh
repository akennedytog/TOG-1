#!/bin/bash
# Send Cold Emails via Gmail Automation

cd ~/.openclaw/workspace

# Email 1: RCI Air
curl -s -X POST "https://api.resend.com/emails" \
  -H "Authorization: Bearer $RESEND_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "Alec Kennedy <akennedy@theonegroup.info>",
    "to": "info@rci-air.com",
    "subject": "Quick question about your after-hours calls",
    "html": "<p>Hi there,</p><p>I came across RCI Air Conditioning...</p>"
  }' 2>/dev/null && echo "✓ Email 1 sent" || echo "✗ Email 1 failed"

# If Resend not available, open Gmail compose links
if [ -z "$RESEND_API_KEY" ]; then
  echo "Opening Gmail compose for each email..."
  
  # RCI Air
  open "https://mail.google.com/mail/?view=cm&fs=1&to=info@rci-air.com&su=Quick%20question%20about%20your%20after-hours%20calls"
  sleep 2
  
  # Trinity
  open "https://mail.google.com/mail/?view=cm&fs=1&to=info@trinityac.com&su=40%20years%20in%20business"
  
  echo "Gmail compose windows opened! Copy/paste email content from cold-emails-today.md"
fi
