# AI Visibility Audit - Lead Tracking Spreadsheet
## Google Sheets Template

---

## HOW TO SET UP YOUR TRACKING SHEET

1. Go to sheets.google.com
2. Create new spreadsheet
3. Name it: "AI Visibility Audit Leads"
4. Copy the headers below into Row 1
5. Format as needed
6. Share with yourself for mobile access

---

## COLUMN HEADERS (Row 1)

| Column | Header | Format | Notes |
|--------|--------|--------|-------|
| A | Date | Date | Auto-format |
| B | Business Name | Text | |
| C | Website URL | Text | Hyperlink |
| D | Email | Text | |
| E | Industry | Dropdown | See options below |
| F | Premium? | Checkbox | TRUE/FALSE |
| G | Crawler Score | Number | 0-25 |
| H | Structured Data Score | Number | 0-25 |
| I | Entity Score | Number | 0-25 |
| J | Citation Score | Number | 0-25 |
| K | Total Score | Formula | =SUM(G2:J2) |
| L | Rating | Formula | Auto-calculate |
| M | Priority | Dropdown | High/Med/Low |
| N | Report Sent | Date | |
| O | Follow-up 1 | Date | +3 days |
| P | Follow-up 2 | Date | +7 days |
| Q | Converted | Checkbox | |
| R | Revenue | Currency | |
| S | Notes | Text | |

---

## GOOGLE SHEETS FORMULAS

### Total Score (Column K)
```
=SUM(G2:J2)
```

### Rating (Column L)
```
=IF(K2>=80,"Excellent",IF(K2>=50,"Good",IF(K2>=25,"Needs Work","Critical")))
```

### Priority (Column M) - Use Data Validation
```
=IF(K2>=70,"Low",IF(K2>=40,"Medium","High"))
```

### Follow-up Dates
- Follow-up 1 (Column O): `=N2+3`
- Follow-up 2 (Column P): `=N2+7`

---

## DATA VALIDATION SETUP

### Industry (Column E)
Create dropdown with:
- HVAC / Plumbing
- Electrical Services
- Legal Services
- Medical / Dental
- Restaurant / Food
- Retail / E-commerce
- Real Estate
- Consulting / Agency
- Home Services
- Other

### Priority (Column M)
Create dropdown with:
- High
- Medium
- Low

---

## CONDITIONAL FORMATTING

### Total Score (Column K)
- Green (>=80): `#10B981`
- Yellow (50-79): `#F59E0B`
- Orange (25-49): `#F97316`
- Red (<25): `#EF4444`

### Priority (Column M)
- High: Red background
- Medium: Yellow background
- Low: Green background

---

## SAMPLE ROWS

| Date | Business | Website | Email | Industry | Premium? | Crawler | Data | Entity | Citation | Total | Rating | Priority | Report Sent | F/U 1 | F/U 2 | Converted | Revenue | Notes |
|------|----------|---------|-------|----------|----------|-----------|------|--------|----------|-------|--------|----------|-------------|-------|-------|-----------|---------|-------|
| 3/19/2026 | Acme HVAC | acmehvac.com | john@acme.com | HVAC | FALSE | 20 | 15 | 18 | 12 | 65 | Good | Medium | 3/19/2026 | 3/22/2026 | 3/26/2026 | FALSE | $0 | Follow up on 3/22 |
| 3/19/2026 | Smith Law | smithlaw.com | sarah@smith.com | Legal | TRUE | 22 | 20 | 20 | 18 | 80 | Excellent | Low | 3/19/2026 | 3/22/2026 | 3/26/2026 | FALSE | $0 | Premium audit - schedule call |

---

## VIEWS TO CREATE

### View 1: All Leads
- Show all columns
- Sort by: Date (newest first)

### View 2: High Priority
- Filter: Priority = "High"
- Sort by: Total Score (lowest first)

### View 3: Premium Audits
- Filter: Premium? = TRUE
- Sort by: Date

### View 4: Follow-up Due
- Filter: Follow-up 1 <= TODAY() OR Follow-up 2 <= TODAY()
- Sort by: Follow-up date

### View 5: Converted Clients
- Filter: Converted = TRUE
- Show: Business, Revenue, Date
- Sort by: Revenue (highest first)

---

## DASHBOARD METRICS (Optional)

Create a separate "Dashboard" tab with:

### Key Metrics
- Total Leads: `=COUNTA('Lead Data'!A2:A)`
- Premium Audits: `=COUNTIF('Lead Data'!F2:F, TRUE)`
- Converted: `=COUNTIF('Lead Data'!Q2:Q, TRUE)`
- Conversion Rate: `=Converted/Total Leads`
- Total Revenue: `=SUM('Lead Data'!R2:R)`
- Avg Deal Size: `=Total Revenue/Converted`

### This Week
- New Leads: `=COUNTIFS('Lead Data'!A2:A, ">="&TODAY()-7)`
- Reports Sent: `=COUNTIFS('Lead Data'!N2:N, ">="&TODAY()-7)`

### By Industry
Use `=COUNTIF('Lead Data'!E2:E, "HVAC")` etc.

---

## MOBILE ACCESS

1. Download Google Sheets app
2. Open your tracking sheet
3. Add to home screen for quick access
4. Update leads on-the-go

---

## AUTOMATION (Optional - Advanced)

### Auto-email notifications
Use Google Apps Script to:
- Send email when new lead added
- Reminder when follow-up due
- Weekly summary report

### Sample Script
```javascript
function sendFollowUpReminder() {
  var sheet = SpreadsheetApp.getActiveSheet();
  var data = sheet.getDataRange().getValues();
  
  for (var i = 1; i < data.length; i++) {
    var followUp1 = new Date(data[i][14]); // Column O
    var today = new Date();
    
    if (followUp1.toDateString() === today.toDateString()) {
      var email = data[i][3];
      var business = data[i][1];
      
      MailApp.sendEmail({
        to: email,
        subject: "Follow-up: Your AI Visibility Report",
        body: "Hi, following up on your AI audit for " + business + "..."
      });
    }
  }
}
```

---

## PRINTABLE DAILY CHECKLIST

### Morning Routine (15 min)
- [ ] Check for new leads (Formspree email)
- [ ] Add to tracking sheet
- [ ] Prioritize by score
- [ ] Schedule audits for the day

### Audit Block (2-3 hours)
- [ ] Run 3-5 audits using checklist
- [ ] Record scores in tracking sheet
- [ ] Generate PDF reports
- [ ] Send reports via email

### Afternoon Follow-up (30 min)
- [ ] Check follow-up due dates
- [ ] Send follow-up emails
- [ ] Update tracking sheet
- [ ] Schedule consultations

### End of Day (15 min)
- [ ] Update conversion status
- [ ] Log revenue
- [ ] Plan tomorrow's priorities
- [ ] Check dashboard metrics

---

## FILE NAMING CONVENTION

Save PDF reports as:
```
[BusinessName]_AI_Visibility_Audit_[Date].pdf

Examples:
- AcmeHVAC_AI_Visibility_Audit_2026-03-19.pdf
- SmithLaw_AI_Visibility_Audit_2026-03-19.pdf
```

Store in Google Drive folder:
```
/The One Group/Client Reports/2026/
```

---

## BACKUP STRATEGY

1. **Daily:** Google Sheets auto-saves
2. **Weekly:** Download CSV backup
3. **Monthly:** Export to Excel format
4. **Quarterly:** Full Google Takeout

---

## INTEGRATION WITH OTHER TOOLS

### Zapier Automations
1. **Formspree → Google Sheets**
   - Trigger: New form submission
   - Action: Add row to sheet

2. **Google Sheets → Gmail**
   - Trigger: New row added
   - Action: Send confirmation email

3. **Google Sheets → Calendar**
   - Trigger: Follow-up date reached
   - Action: Create calendar event

### Make.com (Integromat) Scenarios
- Auto-create draft reports
- Schedule follow-up tasks
- Generate weekly summaries

---

## TROUBLESHOOTING

### Formulas not working?
- Check cell format (should be "Automatic")
- Verify range references
- Use semicolons instead of commas (some locales)

### Dates showing as numbers?
- Format column as Date
- Use DATEVALUE() function

### Dropdown not showing?
- Check Data Validation settings
- Ensure range is correct

---

## TEMPLATES GALLERY

Save these views as templates:
1. **New Lead Intake** - Quick entry form
2. **Audit in Progress** - Active audits
3. **Follow-up Queue** - Due follow-ups
4. **Revenue Report** - Converted clients
5. **Industry Analysis** - By category

---

Last updated: March 19, 2026
Version: 1.0
