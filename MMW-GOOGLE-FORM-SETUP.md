# Miami Music Week 2026 - Event Submission Form

## Form Structure for Google Forms Import

### Form Title
**Submit an Event - Miami Music Week 2026**

### Form Description
Help us build the most comprehensive Miami Music Week 2026 event guide! Submit any events you know about and we'll verify and add them within 24 hours.

Your submission will be reviewed by TheOneGroupAI before being published.

---

## Questions to Add:

### 1. Event Name
- Type: Short answer
- Required: Yes
- Help text: "Enter the official event name"
- Validation: Max 100 characters

### 2. Venue / Location
- Type: Short answer  
- Required: Yes
- Help text: "e.g., Club Space, Bayfront Park, Delano Beach Club"

### 3. Event Date
- Type: Date
- Required: Yes
- Help text: "Miami Music Week runs March 24-29, 2026"

### 4. Start Time
- Type: Short answer
- Required: Yes
- Help text: "e.g., 10:00 PM, 2:00 PM"

### 5. End Time (Optional)
- Type: Short answer
- Required: No
- Help text: "e.g., 6:00 AM, 11:00 PM"

### 6. Ticket Price
- Type: Short answer
- Required: Yes
- Help text: "e.g., $50-$100, $399+, Free"

### 7. Genre / Music Style
- Type: Multiple choice
- Required: Yes
- Options:
  - House
  - Techno
  - Tech House
  - Deep House
  - EDM / Dance Pop
  - Trance
  - Drum & Bass
  - Hip Hop / R&B
  - Multi-Genre
  - Other

### 8. Ticket Link
- Type: Short answer
- Required: Yes
- Validation: URL format
- Help text: "Direct link to buy tickets"

### 9. Event Description (Optional)
- Type: Paragraph
- Required: No
- Help text: "Brief description, lineup, or special notes"

### 10. Your Email (for confirmation)
- Type: Short answer
- Required: Yes
- Validation: Email format
- Help text: "We'll notify you when your event is added"

### 11. Your Twitter Handle (Optional)
- Type: Short answer
- Required: No
- Help text: "We'll give you credit! e.g., @yourhandle"

---

## Form Settings

### Response Destination
- Link to Google Sheets (create new sheet)
- This will create a spreadsheet that auto-populates with submissions

### Presentation
- Confirmation message: "Thanks! Your event will be reviewed within 24 hours. Follow @TheOneGroupAI for updates."

### Notifications
- Enable email notifications for new responses

---

## After Creating the Form

1. **Get Form URL:**
   - Click "Send" in Google Forms
   - Copy the link
   - Example: `https://docs.google.com/forms/d/e/1FAIpQLSf.../viewform`

2. **Get Sheet ID:**
   - Go to Responses tab
   - Click green Sheets icon
   - "Create new spreadsheet"
   - Open the spreadsheet
   - Copy the ID from URL: `https://docs.google.com/spreadsheets/d/[THIS_IS_THE_ID]/edit`

3. **Make Sheet Public:**
   - Click "Share"
   - Change to "Anyone with the link can view"
   - Copy the shareable link

4. **Update the HTML:**
   - Replace `YOUR_FORM_ID` in mmw-2026.html with actual form ID
   - Replace `YOUR_SHEET_ID` with actual sheet ID
   - Re-deploy

---

## Sample Events to Pre-fill (for reference)

Use these as examples in your form description:

**Example 1:**
- Event: Ultra Music Festival 2026
- Venue: Bayfront Park
- Date: March 27, 2026
- Time: 12:00 PM - 12:00 AM
- Price: $399+
- Genre: Electronic / Dance
- Link: https://ultramusicfestival.com

**Example 2:**
- Event: Defected Miami
- Venue: The Ground
- Date: March 25, 2026
- Time: 10:00 PM - 6:00 AM
- Price: $60-$120
- Genre: House
- Link: https://ra.co/events/...

---

## Automation Idea

Once this is running, you can set up a Zapier automation:

**Trigger:** New Google Form response
**Action:** Send yourself an email with event details
**Action:** Post to Slack/Discord (optional)

This way you get notified immediately when someone submits.

---

**Ready?** Go to forms.google.com and create the form!