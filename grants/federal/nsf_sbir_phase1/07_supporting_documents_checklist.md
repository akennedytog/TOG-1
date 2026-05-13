# REQUIRED SUPPORTING DOCUMENTS CHECKLIST

## NSF SBIR Phase I Application
## The One Group, LLC

---

## SUBMISSION PACKAGE CONTENTS

### ☑️ REQUIRED FORMS

| Document | Status | Location | Notes |
|----------|--------|----------|-------|
| **SF-424 (R&R) - Application for Federal Assistance** | ⬜ Not Started | Grants.gov | Must be completed on Grants.gov |
| **SF-424A - Budget Information (Non-Construction)** | ⬜ Not Started | Grants.gov | Auto-populated from budget form |
| **SF-424B - Assurances** | ⬜ Not Started | Grants.gov | Required for all applicants |
| **SBIR/STTR Information Form** | ⬜ Not Started | Research.gov | NSF-specific SBIR form |
| **Project/Performance Site Location(s)** | ⬜ Not Started | Research.gov | List all work locations |
| **Research & Related Budget** | ✅ Ready | 05_budget_justification.md | Use for Research.gov entry |
| **R&R Senior/Key Person Profile** | ⬜ Not Started | Research.gov | Forms for PI and Co-Investigators |
| **R&R Other Project Information** | ⬜ Not Started | Research.gov | Facilities, equipment, etc. |
| **R&R Personal Data** | ⬜ Not Started | Research.gov | Demographic information |

---

### ☑️ REQUIRED PROPOSAL DOCUMENTS

| Document | Status | Location | Format |
|----------|--------|----------|--------|
| **Project Summary (Abstract)** | ✅ Ready | See below | 1 page, max 4,600 characters |
| **Project Description** | ✅ Ready | 02_technical_approach.md | Max 15 pages |
| **References Cited** | ⬜ Draft | See below | No page limit |
| **Biographical Sketches** | ✅ Ready | 04_company_background.md | NSF format, 2 pages each |
| **Budget Justification** | ✅ Ready | 05_budget_justification.md | Detailed justification |
| **Current & Pending Support** | ⬜ Draft | See below | For all senior personnel |
| **Facilities, Equipment & Other Resources** | ✅ Ready | 04_company_background.md | Describe available resources |
| **Data Management Plan** | ⬜ Draft | See below | 2 pages max |
| **Postdoctoral Researcher Mentoring Plan** | N/A | — | Not applicable (no postdocs) |
| **Letters of Collaboration** | ⬜ Draft | See below | From any collaborators |

---

### ☑️ SBIR-SPECIFIC DOCUMENTS

| Document | Status | Location | Notes |
|----------|--------|----------|-------|
| **Commercialization Plan** | ✅ Ready | 03_commercialization_plan.md | Detailed business plan |
| **Company Background/Bios** | ✅ Ready | 04_company_background.md | Company history and team |
| **Phase I Proposal Specific Aims** | ⬜ Draft | See below | 1 page summary |
| **Life Cycle Cost Estimate** | ⬜ Draft | See below | Total development cost |
| **Prior SBIR Awards** | N/A | — | First-time applicant |
| **Vent Capital/Funding Disclosure** | ⬜ Draft | See below | Current funding sources |

---

## DOCUMENT DETAILS AND TEMPLATES

### 1. Project Summary (Abstract)

**Template:**

```
PROJECT SUMMARY

Overview:
Small and medium-sized businesses (SMBs) face a critical automation gap—enterprise 
solutions are too expensive and complex, while simple tools lack intelligence. This 
Phase I project develops an Autonomous AI Agent Platform specifically for SMB 
operations, deploying coordinated AI agents that understand business context, make 
autonomous decisions, and continuously improve.

Intellectual Merit:
This research advances multi-agent coordination architectures, natural language 
configuration systems, and transfer learning for resource-constrained business 
contexts. Technical innovations include: (1) hierarchical agent orchestration with 
business constraint verification, (2) zero-code natural language configuration 
with grounded semantic parsing, and (3) SMB-optimized learning from foundation 
models with few-shot adaptation.

Broader Impacts:
Successful completion democratizes access to enterprise-grade AI automation, 
enabling 32.5 million U.S. SMBs to compete more effectively. Economic impacts 
include job preservation through productivity enhancement, Miami tech ecosystem 
growth, and a replicable framework for underserved market segments. Educational 
outreach includes partnerships with Miami-Dade College for AI workforce 
development and open educational content on SMB AI adoption.

Key Words: artificial intelligence, multi-agent systems, small business automation, 
natural language processing, machine learning, software as a service
```

**Status:** Draft complete, ready for submission entry

---

### 2. References Cited

**Required Format:** NSF citation format

**Draft Reference List:**

```
1. Wang, L., et al. (2023). "Survey on Large Language Model-based Agents." 
   arXiv:2309.07864.

2. Xi, Z., et al. (2023). "The Rise and Potential of Large Language Model 
   Based Agents: A Survey." arXiv:2309.07864.

3. Park, J.S., et al. (2023). "Generative Agents: Interactive Simulacra of 
   Human Behavior." In Proceedings of UIST 2023.

4. Anthropic. (2023). "Constitutional AI: Harmlessness from AI Feedback." 
   arXiv:2212.08073.

5. Wei, J., et al. (2023). "Chain-of-Thought Prompting Elicits Reasoning in 
   Large Language Models." In NeurIPS 2022.

6. Yao, S., et al. (2023). "ReAct: Synergizing Reasoning and Acting in 
   Language Models." In ICLR 2023.

7. Small Business Administration. (2023). "Small Business Profiles for the 
   States and Territories." Office of Advocacy.

8. McKinsey Global Institute. (2023). "The State of AI in 2023: Generative 
   AI's Breakout Year."

9. Bureau of Labor Statistics. (2023). "Occupational Employment and Wage 
   Statistics." U.S. Department of Labor.

10. Salesforce Research. (2023). "Small Business Trends Report."
```

**Status:** Draft list, needs final verification

---

### 3. Current & Pending Support

**Template for Each Senior Person:**

```
CURRENT & PENDING SUPPORT

Name: Alec Kennedy

Current Support:
| Awarding Agency | Project Title | Total Amount | Current Year's Support | Time Commitment |
|-----------------|---------------|--------------|------------------------|-----------------|
| [If any] | [Title] | $[Amount] | $[Amount] | [Months] |

Pending Support:
| Agency | Project Title | Amount Requested | Submission Date | Status |
|--------|---------------|------------------|-----------------|--------|
| NSF | [This Proposal] | $295,000 | [Date] | Pending |

In Kind Support:
| Source | Description | Estimated Value |
|--------|-------------|-----------------|
| AWS | Cloud credits | $25,000 |
| Google | Cloud credits | $10,000 |
```

**Status:** Template ready, needs specific values

---

### 4. Data Management Plan

**Template:**

```
DATA MANAGEMENT PLAN

1. Types of Data:
This project will generate:
- Synthetic and anonymized SMB workflow data for training
- Agent performance metrics and logs
- User interaction data from configuration studies
- System performance benchmarks
- Interview transcripts and survey responses (anonymized)

2. Data Standards and Metadata:
- Workflow data: JSON format with standardized schema
- Performance metrics: Time-series data in CSV/Parquet
- User data: Anonymized with unique identifiers removed
- Metadata will follow Dublin Core standards where applicable

3. Policies for Access and Sharing:
- Open access for non-proprietary research outputs
- Code repositories on GitHub under MIT license
- Anonymized datasets available via academic data repositories
- Proprietary customer data protected under NDA and not shared

4. Policies for Re-use:
- Research code open source with documentation
- Datasets released under CC-BY license
- Proper attribution required for derivative works

5. Archiving:
- Code maintained in GitHub with version control
- Data backed up to AWS S3 with cross-region replication
- Research artifacts preserved for 3 years post-project
- Publication data deposited in appropriate repositories

6. Security and Privacy:
- All customer data anonymized before analysis
- PII removed from all shared datasets
- Access controls on all research systems
- Compliance with applicable privacy regulations
```

**Status:** Draft complete

---

### 5. Letters of Collaboration

**Required Letters:**

| Recipient | Relationship | Status |
|-----------|--------------|--------|
| Dr. [Name], Miami-Dade College | Workforce development partnership | ⬜ Draft requested |
| Prof. [Name], University of Miami | Research collaboration | ⬜ Draft requested |
| [Pilot Customer 1] | Beta customer LOI | ✅ Draft template ready |
| [Pilot Customer 2] | Beta customer LOI | ✅ Draft template ready |
| [Partner Company] | Integration partnership | ⬜ Draft requested |

**LOI Template for Pilot Customers:**

```
LETTER OF INTENT

Date: [Date]
To: National Science Foundation
From: [Customer Name], [Title], [Company]
Re: Letter of Intent for The One Group SBIR Phase I

[Customer Company] intends to participate as a pilot customer for The One Group's 
NSF SBIR Phase I project "Autonomous AI Agent Platform for SMB Operations."

[Company] is a [industry] business with [X] employees and [revenue/scale context].
We currently face challenges with [specific operational pain points].

We agree to:
1. Participate in a 30-60 day pilot deployment of the AI agent platform
2. Provide feedback on system performance and user experience
3. Allow anonymized data collection for research validation
4. Provide a testimonial if the pilot is successful

This letter does not constitute a binding contract or commitment to purchase.

Sincerely,
[Signature]
[Name]
[Title]
```

---

### 6. Phase I Proposal Specific Aims

**Template:**

```
SPECIFIC AIMS

Aim 1: Develop a Multi-Agent Orchestration Architecture
- Design hierarchical agent coordination system
- Implement business constraint verification
- Validate with representative SMB workflows

Aim 2: Create Natural Language Configuration Interface
- Build semantic parsing for business intent
- Develop zero-code agent configuration system
- Achieve >85% accuracy in user intent capture

Aim 3: Demonstrate SMB Operational Value
- Deploy to 5 pilot SMB customers
- Measure task completion rates and user satisfaction
- Document ROI and commercialization path

Expected Outcomes:
1. Production-ready multi-agent platform prototype
2. Validated NL configuration system
3. Pilot customer testimonials and metrics
4. Phase II proposal for full commercialization
5. Two provisional patent applications
```

**Status:** Draft complete

---

### 7. Life Cycle Cost Estimate

**Template:**

```
LIFE CYCLE COST ESTIMATE

Phase I (Current Proposal): $295,000 (6 months)
Phase II (Planned): $1,750,000 (24 months)
Phase III (Commercialization): $3,500,000 (private funding)

Total Development Cost: $5,545,000

Cost Breakdown by Phase:
| Phase | R&D | Personnel | Other | Total |
|-------|-----|-----------|-------|-------|
| Phase I | $180,000 | $90,000 | $25,000 | $295,000 |
| Phase II | $900,000 | $700,000 | $150,000 | $1,750,000 |
| Phase III | $1,200,000 | $2,000,000 | $300,000 | $3,500,000 |
| Total | $2,280,000 | $2,790,000 | $475,000 | $5,545,000 |

Commercialization Timeline: Product launch expected Month 24 of Phase II
```

**Status:** Draft complete

---

### 8. Venture Capital/Funding Disclosure

**Template:**

```
CURRENT FUNDING SOURCES

As of [Date], The One Group has received the following funding:

Private Investment:
- Pre-seed round: $250,000 from angel investors
- Use: Initial development, team salaries, legal/incorporation

Non-Dilutive Funding:
- AWS Activate: $25,000 cloud credits
- Google for Startups: $10,000 cloud credits
- Total non-dilutive: $35,000 equivalent

Pending Applications:
- Miami-Dade Innovation Authority Grant: $50,000 (pending)
- Florida High Tech Corridor: $75,000 (applied)

No other SBIR/STTR awards have been received.
No venture capital institutional funding has been raised.
```

**Status:** Draft complete

---

## DOCUMENT PREPARATION STATUS

| Category | Total Items | Complete | In Progress | Not Started | % Complete |
|----------|-------------|----------|-------------|-------------|------------|
| Required Forms | 9 | 0 | 0 | 9 | 0% |
| Proposal Documents | 9 | 6 | 2 | 1 | 67% |
| SBIR-Specific | 6 | 3 | 2 | 1 | 50% |
| **OVERALL** | **24** | **9** | **4** | **11** | **38%** |

---

## SUBMISSION READINESS CHECKLIST

### Pre-Submission (2 Weeks Before)

- [ ] All Senior Personnel registered in Research.gov
- [ ] Company registered in SAM.gov with active CAGE code
- [ ] FastLane/Research.gov account active and authorized
- [ ] All forms reviewed by grants administrator
- [ ] Budget cross-checked against justification
- [ ] Page limits verified for all documents
- [ ] PDF conversion and formatting complete

### Final Review (1 Week Before)

- [ ] Complete proposal package assembled
- [ ] Page numbers and formatting consistent
- [ ] All required signatures obtained
- [ ] Final proofread by second party
- [ ] Backup copies created
- [ ] Submission test in Research.gov (if available)

### Submission Day

- [ ] Submit by 5:00 PM submitter's local time
- [ ] Confirm submission received
- [ ] Save submission confirmation
- [ ] Distribute copies to team
- [ ] Update tracking spreadsheet

---

## IMPORTANT DATES

| Milestone | Target Date | Status |
|-----------|-------------|--------|
| SAM.gov registration complete | [Date - 4 weeks] | ⬜ Pending |
| Senior personnel profiles complete | [Date - 3 weeks] | ⬜ Pending |
| All documents drafted | [Date - 2 weeks] | 🟡 In Progress |
| Final review and editing | [Date - 1 week] | ⬜ Pending |
| Submission deadline | [Date] | ⬜ Pending |

---

*Last Updated: [Date]*
*Next Review: Weekly until submission*
