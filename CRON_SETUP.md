# The One Group - Cron Job Automation

## Daily Tasks

### Morning (9 AM) - Business Check
```json
{
  "name": "Morning Business Check",
  "schedule": { "kind": "cron", "expr": "0 9 * * *", "tz": "America/Chicago" },
  "payload": {
    "kind": "systemEvent",
    "text": "Check new leads, review content calendar, post scheduled Twitter content"
  },
  "sessionTarget": "main"
}
```

### Evening (6 PM) - Daily Wrap
```json
{
  "name": "Evening Wrap",
  "schedule": { "kind": "cron", "expr": "0 18 * * *", "tz": "America/Chicago" },
  "payload": {
    "kind": "systemEvent",
    "text": "Review competitor intel, check email for urgent client items, queue tomorrow's content"
  },
  "sessionTarget": "main"
}
```

## Weekly Tasks

### Sunday (8 PM) - Weekly Review
```json
{
  "name": "Weekly Business Review",
  "schedule": { "kind": "cron", "expr": "0 20 * * 0", "tz": "America/Chicago" },
  "payload": {
    "kind": "systemEvent",
    "text": "Run weekly report, review metrics, plan next week's content, update goals"
  },
  "sessionTarget": "main"
}
```

## Content Schedule

### Twitter Posts
- Monday: Thread (building in public)
- Tuesday: Question (engagement)
- Wednesday: Myth-busting
- Thursday: Framework/educational
- Friday: Results/case study
- Saturday: Weekend question
- Sunday: Week preview

### Blog Posts
- Monday: New article
- Thursday: Newsletter

## Lead Follow-up Sequence

Day 0: Initial response + Calendly link
Day 2: Follow-up if no booking
Day 7: Value-add (tip/resource)
Day 14: Case study share
Day 30: Final check-in

## Client Touch Points

Week 1: Kickoff + discovery
Week 2: Audit delivery
Week 3: Implementation
Week 4: Training + handoff

Day 30: Testimonial request
Day 90: Referral ask
