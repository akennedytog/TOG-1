---
name: "job-application-kit"
description: "Research, tailor cover letters for, and set up job applications for a candidate. Verify live postings and hand off ATS forms to the user."
---

# Job Application Kit

Prepare batch job applications for a candidate: find authoritative postings, verify each is live and the right role, tailor one cover letter per role from the candidate's verified background, and hand off each ATS form to the user to submit. The user reviews and submits applications themselves; never auto-submit and never attempt resume/cover-letter uploads via automation.

## Steps

1. **Locate the authoritative posting for each target role.** Prefer the company's own ATS (Greenhouse `job-boards.greenhouse.io/...`, Ashby `jobs.ashbyhq.com/...`, Lever, Workable) or the company careers page. Avoid relying on aggregator permalinks (Teal, ZipRecruiter, talentpulse, hirify, mediabistro, NoGigiddy) as primary links — their "Apply" buttons often redirect to spam or unrelated pages.

2. **Verify every link resolves to the exact role before doing any work on it.** Open the link (web_fetch or browser) and confirm the page title matches the intended job title. A Greenhouse `?gh_jid=` ID and aggregator permalinks can silently resolve to a *different* role (observed: Nebius `gh_jid=4951592101` opened "Partner Strategy Lead", not the VP role). If the page doesn't match, search the company site/ATS by title to find the correct ID before proceeding. Do not write a cover letter or prepare an application for a link you have not verified.

3. **Check the real requirements and comp against the candidate's profile before investing in a cover letter.** Read the actual posting (not the aggregator summary) and flag genuine mismatches honestly — e.g. a role demanding hyperscale cloud/AI-infra enterprise selling plus $100M+ TCV closes is a poor fit for a beverage/hospitality background even with AI-native experience. Surface weak fits to the user and let them decide whether to proceed or swap the role.

4. **Tailor one cover letter per role.** Write from the candidate's verified background (e.g. 15 yrs liquor/beverage/hospitality sales leadership, large multi-market teams, $4M+ budget & state P&L, plus an AI-native operator angle where the role is tech/AI). Keep the candidate's facts accurate; never invent credentials or experience. Reference the specific company and the role's stated responsibilities. Include a consistent contact signature and note the attachment (resume PDF + cover letter).

5. **Set up each application for the user to submit.** Fill the ATS text fields with the candidate's details (name, email, country, address, comp expectations, and any written screening answers tailored to that role) and capture the exact field values. Do NOT attempt resume/cover-letter file uploads in headless automation and do NOT attempt submission — uploads hang and submission is the user's decision. Deliver to the user: the verified apply link, the exact field values to paste, and the attachment file names to upload, and let them complete and submit it.

6. **Track all roles in a tracker file.** Maintain a markdown tracker (company, role, location, comp, fit rating, apply link, status) and copy updated trackers and every cover letter (`.md` + Word `.docx`) to the user's default deliverables Drive folder so the user can batch through applications.

## Reference

- Resume and cover-letter source files live in the workspace; copy user-facing outputs to Drive (Google Drive `OpenClaw-Deliverables` default).
- Convert tailored cover letters from `.md` to Word with the reusable `md_to_cover_docx.py` script in the workspace (header block: name, tagline, contact line; skips the `#` title line and `---` rules).
