#!/usr/bin/env python3
"""
Scout Email Sender
Reads briefing JSON and sends email via Gmail (gog skill) or Resend API
"""

import json
import sys
from pathlib import Path
from datetime import datetime
import os

OUTPUT_DIR = "/Users/aleckennedy/.openclaw/workspace/data/scout_output"
EMAIL_TEMPLATE = "/Users/aleckennedy/.openclaw/workspace/agents/scout_email_template.html"

def load_briefing():
    """Load latest briefing JSON"""
    briefing_file = Path(OUTPUT_DIR) / "briefing_latest.json"
    if not briefing_file.exists():
        print("❌ No briefing file found")
        return None
    
    with open(briefing_file) as f:
        return json.load(f)

def format_email_html(briefing):
    """Format email from template"""
    with open(EMAIL_TEMPLATE) as f:
        template = f.read()
    
    # Simple template substitution (no mustache library)
    summary = briefing.get('summary', {})
    route = briefing.get('full_route', [])[:5]  # Top 5
    insights = briefing.get('insights', [])
    
    html = template
    
    # Replace simple fields
    html = html.replace('{{date}}', briefing.get('date', datetime.now().strftime('%A, %B %d, %Y')))
    html = html.replace('{{territory_name}}', 'South Florida Territory')
    html = html.replace('{{total_accounts}}', str(summary.get('active', 0) + summary.get('hot', 0) + summary.get('needs_visit', 0) + summary.get('at_risk', 0)))
    html = html.replace('{{hot_count}}', str(summary.get('hot', 0)))
    html = html.replace('{{at_risk_count}}', str(summary.get('at_risk', 0) + summary.get('down', 0)))
    html = html.replace('{{route_stops}}', str(len(route)))
    html = html.replace('{{dashboard_url}}', 'file://' + OUTPUT_DIR + '/scout_dashboard.html')
    
    # Replace route loop
    route_html = ""
    for i, stop in enumerate(route, 1):
        status_class = {
            'hot': 'hot',
            'at_risk': 'risk',
            'down': 'risk',
            'needs_visit': 'visit',
            'active': 'visit'
        }.get(stop.get('status', 'visit'), 'visit')
        
        status_label = stop.get('suggested_action', 'Visit').replace('Priority visit - ', '').replace('Capitalize on growth - ', '').replace('Investigate decline - ', '')
        
        route_html += f"""
            <div class="route-item">
                <div class="route-number">{i}</div>
                <div class="route-info">
                    <h3>{stop.get('account_name', 'Unknown')}</h3>
                    <p>{stop.get('alert', '')} • Last order: {stop.get('last_order', 'Unknown')}</p>
                </div>
                <span class="status status-{status_class}">{status_label}</span>
            </div>
        """
    
    # Simple replacement for route section
    if '{{#route_stops}}' in html:
        start = html.find('{{#route_stops}}')
        end = html.find('{{/route_stops}}') + len('{{/route_stops}}')
        html = html[:start] + route_html + html[end:]
    
    # Replace insights
    insights_html = ""
    for insight in insights[:3]:  # Top 3
        insights_html += f'<div class="insight">{insight}</div>'
    
    if '{{#insights}}' in html:
        start = html.find('{{#insights}}')
        end = html.find('{{/insights}}') + len('{{/insights}}')
        html = html[:start] + insights_html + html[end:]
    
    return html

def send_email_gog(recipient, subject, html_body):
    """Send email using gog skill (Gmail)"""
    import subprocess
    
    # Create temporary HTML file
    temp_html = Path(OUTPUT_DIR) / "temp_email.html"
    with open(temp_html, 'w') as f:
        f.write(html_body)
    
    # Use gog CLI to send email
    cmd = [
        "gog", "email", "send",
        "--to", recipient,
        "--subject", subject,
        "--body-html", str(temp_html)
    ]
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ Email sent to {recipient}")
            return True
        else:
            print(f"❌ Failed to send email: {result.stderr}")
            return False
    except Exception as e:
        print(f"❌ Error sending email: {e}")
        return False
    finally:
        # Clean up temp file
        if temp_html.exists():
            temp_html.unlink()

def main():
    print("📧 Scout Email Sender")
    print("-" * 40)
    
    # Load briefing
    briefing = load_briefing()
    if not briefing:
        print("❌ No briefing to send")
        return 1
    
    # Format email
    print("📝 Formatting email...")
    html = format_email_html(briefing)
    
    # Get recipient
    recipient = os.getenv('SCOUT_EMAIL_RECIPIENT', 'akennedy@theonegroup.info')
    subject = f"🎯 Scout Daily Briefing - {briefing.get('date', datetime.now().strftime('%A, %B %d'))}"
    
    # Send
    print(f"📤 Sending to {recipient}...")
    if send_email_gog(recipient, subject, html):
        print("✅ Email sent successfully!")
        return 0
    else:
        # Save for manual sending
        output_file = Path(OUTPUT_DIR) / f"email_{datetime.now().strftime('%Y%m%d')}.html"
        with open(output_file, 'w') as f:
            f.write(html)
        print(f"📄 Email saved to: {output_file}")
        print("⚠️  Send manually or check gog configuration")
        return 1

if __name__ == "__main__":
    sys.exit(main())