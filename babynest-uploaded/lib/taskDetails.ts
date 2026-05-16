import { ReactNode } from 'react';

export interface TaskDetail {
  steps: string[];
  documents: string[];
  links: { label: string; url: string }[];
  phoneNumbers?: { label: string; number: string }[];
  timeEstimate: string;
  cost: string;
  commonMistakes: string[];
  proTips: string[];
}

export const taskDetails: Record<string, TaskDetail> = {
  'insurance-enrollment': {
    steps: [
      'Call your HR department or insurance provider within 30-60 days of birth',
      'Ask for a " Qualifying Life Event" enrollment form',
      'Provide baby\'s name, date of birth, and SSN (if available)',
      'Submit birth certificate as proof',
      'Confirm effective date (usually retroactive to birth date)',
      'Get confirmation number and keep for your records',
      'Request new insurance cards with baby\'s name added'
    ],
    documents: [
      'Birth certificate (certified copy)',
      'Baby\'s Social Security Number (if available)',
      'Your insurance ID card',
      'Enrollment form from HR/insurance'
    ],
    links: [
      { label: 'Healthcare.gov Special Enrollment', url: 'https://www.healthcare.gov/coverage-outside-open-enrollment/' },
      { label: 'Find Your State\'s CHIP Program', url: 'https://www.medicaid.gov/chip/index.html' }
    ],
    phoneNumbers: [
      { label: 'Healthcare Marketplace', number: '1-800-318-2596' }
    ],
    timeEstimate: '30 minutes - 2 hours',
    cost: 'Free (may increase monthly premium)',
    commonMistakes: [
      'Waiting too long (miss the 30-60 day deadline)',
      'Not getting confirmation in writing',
      'Assuming automatic coverage (it\'s not automatic!)',
      'Forgetting to update dental/vision separately'
    ],
    proTips: [
      'Do this IMMEDIATELY - don\'t wait',
      'Get baby\'s SSN first if possible (makes it easier)',
      'Ask about adding dental and vision too',
      'Confirm coverage starts from birth date (retroactive)'
    ]
  },

  'ssn-application': {
    steps: [
      'Get Form SS-5 from hospital (easiest) or SSA.gov',
      'Fill out baby\'s full name, date of birth, place of birth',
      'Provide parents\' SSNs and names at birth',
      'Submit certified birth certificate',
      'Submit proof of parents\' citizenship',
      'Mail or bring to Social Security office',
      'Wait 2-4 weeks for card in mail'
    ],
    documents: [
      'Certified birth certificate (original)',
      'Form SS-5 (Application for SSN)',
      'Parents\' IDs (driver\'s license/passport)',
      'Proof of US citizenship for baby (birth certificate works)'
    ],
    links: [
      { label: 'Apply for SSN Online', url: 'https://www.ssa.gov/ssnumber/' },
      { label: 'Find SSA Office Near You', url: 'https://secure.ssa.gov/ICON/main.jsp' },
      { label: 'Download Form SS-5', url: 'https://www.ssa.gov/forms/ss-5.pdf' }
    ],
    phoneNumbers: [
      { label: 'Social Security Administration', number: '1-800-772-1213' }
    ],
    timeEstimate: '1-2 hours (application), 2-4 weeks (wait for card)',
    cost: 'Free',
    commonMistakes: [
      'Waiting too long (needed for taxes and insurance)',
      'Using non-certified birth certificate',
      'Making errors on form (causes delays)',
      'Not keeping a copy of everything submitted'
    ],
    proTips: [
      'Do this at the hospital if possible (fastest)',
      'Get 2-3 copies of birth certificate for other tasks',
      'Saves you a trip to SSA office',
      'Required for claiming child tax credit!'
    ]
  },

  'tax-withholding': {
    steps: [
      'Log into your employer\'s HR portal or contact HR',
      'Request Form W-4 (Employee\'s Withholding Certificate)',
      'Add +1 to number of dependents',
      'Or use IRS withholding calculator first',
      'Submit to HR/Payroll',
      'See change in next paycheck',
      'Adjust if needed after tax season'
    ],
    documents: [
      'Current W-4 form',
      'Last year\'s tax return (for reference)',
      'Baby\'s SSN (needed to claim)'
    ],
    links: [
      { label: 'IRS Withholding Calculator', url: 'https://www.irs.gov/individuals/tax-withholding-estimator' },
      { label: 'Form W-4 Instructions', url: 'https://www.irs.gov/pub/irs-pdf/fw4.pdf' }
    ],
    timeEstimate: '15-30 minutes',
    cost: 'Free (saves you money!)',
    commonMistakes: [
      'Not adjusting (missing out on bigger paycheck)',
      'Over-adjusting (owing taxes at year-end)',
      'Forgetting to update in January for new tax year',
      'Not both parents adjusting (if filing jointly)'
    ],
    proTips: [
      'More dependents = less tax withheld = bigger paychecks',
      'You\'ll claim $2,000 Child Tax Credit at tax time',
      'Can increase your take-home pay by $100-200/month',
      'Update both parents\' W-4s if married!'
    ]
  },

  'life-insurance': {
    steps: [
      'Calculate coverage needed (10-15x your income)',
      'Get quotes from multiple companies (Policygenius, etc.)',
      'Choose term length (20-30 years covers child\'s upbringing)',
      'Complete health questionnaire (may need medical exam)',
      'Name beneficiaries (your spouse/partner, not the baby directly)',
      'Set up automatic payments',
      'Store policy documents safely'
    ],
    documents: [
      'Proof of income (pay stubs)',
      'Medical records (if required)',
      'Driver\'s license',
      'Beneficiary contact info'
    ],
    links: [
      { label: 'Policygenius (Compare Quotes)', url: 'https://www.policygenius.com/' },
      { label: 'Life Happens (Education)', url: 'https://www.lifehappens.org/' },
      { label: 'NAIC Consumer Guide', url: 'https://content.naic.org/consumer/life-insurance' }
    ],
    phoneNumbers: [
      { label: 'Your HR (group life)', number: 'Check employee benefits' }
    ],
    timeEstimate: '1-2 hours (application), 2-6 weeks (approval)',
    cost: '$20-50/month for $500k-1M policy (age/health dependent)',
    commonMistakes: [
      'Relying only on group life from work (not portable, not enough)',
      'Naming baby as beneficiary (courts will manage it)',
      'Getting whole life instead of term (expensive, poor investment)',
      'Not enough coverage ($100k won\'t cover 18 years)'
    ],
    proTips: [
      'Term life is cheap when you\'re young and healthy',
      'Name spouse/partner as beneficiary, not the baby',
      'Get 10-15x your annual income in coverage',
      'Do this BEFORE health issues arise (rates go up)',
      'Lock in rate for 20-30 years (won\'t increase)'
    ]
  },

  'will-creation': {
    steps: [
      'List all assets (accounts, property, valuables)',
      'Choose guardian(s) for your child (discuss with them first!)',
      'Choose executor (person who carries out will)',
      'Decide on beneficiaries for specific items',
      'Draft will (attorney recommended, or online service)',
      'Sign will with 2 witnesses present (not beneficiaries)',
      'Store original safely (fireproof safe, attorney\'s office)',
      'Tell executor where will is stored'
    ],
    documents: [
      'List of assets and debts',
      'Guardian candidates\' full names and addresses',
      'Executor\'s full name and address',
      'Beneficiary information',
      'Current will (if updating)'
    ],
    links: [
      { label: 'LegalZoom Will Service', url: 'https://www.legalzoom.com/' },
      { label: 'Find Estate Attorney (Nolo)', url: 'https://www.nolo.com/' },
      { label: 'FreeWill (Free Service)', url: 'https://www.freewill.com/' }
    ],
    timeEstimate: '2-4 hours (drafting), varies (finding attorney)',
    cost: '$0-500 (online) or $500-2000+ (attorney)',
    commonMistakes: [
      'Not naming guardians (court decides who raises child)',
      'Not telling guardian before naming them (surprise!)',
      'Forgetting to update beneficiaries on 401k/IRA',
      'Storing will where no one can find it',
      'Not updating after major life changes'
    ],
    proTips: [
      'Name backup guardian in case first choice can\'t serve',
      'Review and update every 3-5 years or after major changes',
      'Separate from will: update 401k/IRA beneficiaries directly',
      'Consider trust if you have significant assets',
      'Tell multiple people where will is stored'
    ]
  },

  '529-plan': {
    steps: [
      'Research your state\'s 529 plan (tax benefits vary)',
      'Compare with top-rated plans (Vanguard, Utah My529)',
      'Choose plan type: age-based or custom portfolio',
      'Open account online (10-15 minutes)',
      'Name yourself as account owner, child as beneficiary',
      'Set up automatic monthly contributions ($50-500/month)',
      'Consider front-loading ($85k max using 5-year gift)',
      'Save login credentials securely'
    ],
    documents: [
      'Your ID (driver\'s license)',
      'Child\'s SSN',
      'Bank account info for contributions',
      'Beneficiary info (child\'s name, DOB, SSN)'
    ],
    links: [
      { label: 'SavingForCollege.com (Compare Plans)', url: 'https://www.savingforcollege.com/' },
      { label: 'SEC 529 Guide', url: 'https://www.sec.gov/investor/pubs/intro529.htm' },
      { label: 'College Savings Plans Network', url: 'https://www.collegesavings.org/' }
    ],
    phoneNumbers: [
      { label: 'Your State\'s 529 Plan', number: 'Varies by state' }
    ],
    timeEstimate: '30 minutes to open',
    cost: 'Free to open, $0-50/year fees (varies by plan)',
    commonMistakes: [
      'Waiting until "later" (compound growth needs time)',
      'Not checking state tax deduction (free money!)',
      'Keeping it too conservative (stocks outperform bonds long-term)',
      'Putting it in child\'s name (hurts financial aid)',
      'Using for non-qualified expenses (penalties + taxes)'
    ],
    proTips: [
      'Start with age-based portfolio (auto-adjusts as child ages)',
      'Front-load if possible (contribute $85k at once using 5-year gift)',
      '529s can be used for K-12 private school (up to $10k/year)',
      'Can change beneficiary to another family member',
      'Unused funds can roll to Roth IRA (2024+, $35k lifetime limit)',
      'Grandparents can contribute directly (estate planning benefit)'
    ]
  },

  'fsa-hsa': {
    steps: [
      'Check if your employer offers FSA or HSA',
      'Understand the difference: FSA (use it or lose it) vs HSA (yours forever)',
      'Estimate medical expenses for the year',
      'Enroll during open enrollment (or after birth for life event)',
      'Set contribution amount (FSA: $3,050 max, HSA: $8,300 family max)',
      'Start using pre-tax dollars for baby expenses',
      'Keep receipts for all purchases',
      'Submit claims for reimbursement (if required)'
    ],
    documents: [
      'Social Security cards (for dependent verification)',
      'Birth certificate',
      'Medical receipts',
      'Bank account for HSA (if required)'
    ],
    links: [
      { label: 'Healthcare.gov FSA Info', url: 'https://www.healthcare.gov/have-job-based-coverage/flexible-spending-accounts/' },
      { label: 'HSA Store (Eligible Expenses)', url: 'https://hsastore.com/' }
    ],
    timeEstimate: '30 minutes to enroll',
    cost: 'Saves 20-30% on medical costs (pre-tax)',
    commonMistakes: [
      'Over-funding FSA (lose unused money at year-end)',
      'Not realizing diapers, formula, breast pump are eligible',
      'Missing the enrollment window (only once per year)',
      'Not using HSA as investment account (it grows tax-free!)',
      'Forgetting to keep receipts (audit protection)'
    ],
    proTips: [
      'FSA: Start with known expenses (copays, prescriptions)',
      'HSA: Invest unused funds (triple tax advantage)',
      'Eligible expenses: diapers, formula, breast pump, baby monitor, thermometer',
      'HSA is yours forever (even if you change jobs)',
      'Save receipts - you can reimburse yourself anytime (even years later)',
      'Use HSA as stealth retirement account (after age 65)'
    ]
  },

  'credit-freeze': {
    steps: [
      'Gather required info: child\'s full name, SSN, birth date, address',
      'Contact Equifax (freeze online or by phone)',
      'Contact Experian (freeze online or by phone)',
      'Contact TransUnion (freeze online or by phone)',
      'Keep PIN/password for each bureau (needed to unfreeze)',
      'Store confirmation letters',
      'Repeat annually (some states require thaw/refreeze)'
    ],
    documents: [
      'Child\'s Social Security card',
      'Your ID (as parent/guardian)',
      'Proof of address (utility bill)',
      'Child\'s birth certificate (sometimes required)'
    ],
    links: [
      { label: 'Equifax Freeze', url: 'https://www.equifax.com/personal/credit-report-services/credit-freeze/' },
      { label: 'Experian Freeze', url: 'https://www.experian.com/freeze/center.html' },
      { label: 'TransUnion Freeze', url: 'https://www.transunion.com/credit-freeze' },
      { label: 'IdentityTheft.gov', url: 'https://www.identitytheft.gov/' }
    ],
    phoneNumbers: [
      { label: 'Equifax', number: '1-800-525-6285' },
      { label: 'Experian', number: '1-888-397-3742' },
      { label: 'TransUnion', number: '1-800-680-7289' }
    ],
    timeEstimate: '1-2 hours (all 3 bureaus)',
    cost: 'FREE (federal law)',
    commonMistakes: [
      'Forgetting one of the three bureaus',
      'Losing the PIN/password (hard to unfreeze)',
      'Not freezing until after identity theft happens',
      'Thawing permanently instead of temporary (for specific creditor)'
    ],
    proTips: [
      'Child SSNs are prime targets for identity theft',
      'Do this ASAP after getting SSN',
      'Keep PINs in multiple safe places',
      'You can temporarily thaw for specific applications',
      'Freeze until child turns 18 and can monitor own credit'
    ]
  },

  'dependent-care-fsa': {
    steps: [
      'Confirm both you AND spouse work (or student/looking for work)',
      'Calculate expected childcare costs for the year',
      'Enroll in Dependent Care FSA during open enrollment',
      'Set contribution: $5,000 max per household ($2,500 if married filing separately)',
      'Choose childcare provider (must be eligible)',
      'Get provider\'s Tax ID (EIN or SSN)',
      'Submit receipts for reimbursement',
      'Use funds by year-end (or grace period)'
    ],
    documents: [
      'Childcare provider\'s name and Tax ID',
      'Receipts for all childcare expenses',
      'Proof of employment (sometimes required)',
      'Provider\'s license info (if applicable)'
    ],
    links: [
      { label: 'IRS Publication 503', url: 'https://www.irs.gov/publications/p503' },
      { label: 'Child Care Aware', url: 'https://www.childcareaware.org/' }
    ],
    timeEstimate: '30 minutes to enroll',
    cost: 'Saves $1,000-2,000 in taxes (varies by bracket)',
    commonMistakes: [
      'Not both parents working (ineligible)',
      'Paying relative under the table (no tax ID = no FSA)',
      'Over-contributing and losing money at year-end',
      'Not realizing preschool and summer camps count'
    ],
    proTips: [
      'Both parents can have FSA, but combined max is $5,000',
      'Eligible expenses: daycare, preschool, before/after school, summer camp',
      'Provider must report income (no under-the-table payments)',
      'Divorced parents: both can have separate $5,000 FSAs',
      'Save 20-30% depending on tax bracket'
    ]
  },

  '529-superfunding': {
    steps: [
      'Understand 5-year gift tax election (Form 709)',
      'Calculate: $85,000 single / $170,000 married (5 years × annual gift limit)',
      'Open 529 if not already done',
      'Contribute the lump sum amount',
      'File Form 709 with your tax return (just for records)',
      'Cannot make additional gift tax exclusions for 5 years',
      'Watch investment grow tax-free for 18+ years',
      'Consider dollar-cost averaging alternative'
    ],
    documents: [
      '529 account information',
      'Form 709 (United States Gift Tax Return)',
      'Bank account for transfer',
      'Tax records (keep for 5+ years)'
    ],
    links: [
      { label: 'IRS Form 709', url: 'https://www.irs.gov/forms-pubs/about-form-709' },
      { label: '529 Superfunding Guide', url: 'https://www.savingforcollege.com/article/front-loading-your-529-plan' }
    ],
    phoneNumbers: [
      { label: 'IRS Gift Tax Questions', number: '1-800-829-1040' }
    ],
    timeEstimate: '1 hour to set up, 5 years to monitor',
    cost: 'No direct cost (investment fees apply)',
    commonMistakes: [
      'Not filing Form 709 (required for records)',
      'Exceeding $18k/year in additional gifts during 5-year period',
      'Not considering market timing (lump sum vs DCA)',
      'Forgetting you can\'t make additional gift-tax-free gifts'
    ],
    proTips: [
      'Front-loading = maximum compound growth time',
      'Better than spreading over 5 years (more time in market)',
      'No federal gift tax on amounts under lifetime exemption ($13.61M in 2024)',
      'Grandparents often do this (estate planning benefit)',
      'Consider doing early in child\'s life (more growth time)'
    ]
  },

  'roth-ira-baby': {
    steps: [
      'Understand: baby needs EARNED INCOME (not gifts/investments)',
      'Identify income opportunities: modeling, acting, family business',
      'Document all income (1099 or keep records)',
      'Open Custodial Roth IRA at brokerage (Fidelity, Vanguard, Schwab)',
      'Contribute up to 100% of earned income or $7,000 (whichever is less)',
      'Invest in low-cost index funds',
      'Watch it grow tax-free for 60+ years',
      'Repeat annually if income continues'
    ],
    documents: [
      'Proof of earned income (1099, invoices, payment records)',
      'Your ID (custodian)',
      'Child\'s SSN',
      'Bank account info for contributions'
    ],
    links: [
      { label: 'Fidelity Custodial Roth IRA', url: 'https://www.fidelity.com/retirement-ira/custodial-account' },
      { label: 'Vanguard Custodial Account', url: 'https://investor.vanguard.com/accounts-plans/custodial-accounts' }
    ],
    timeEstimate: '1 hour to open, ongoing annually',
    cost: 'No account fees at most brokerages',
    commonMistakes: [
      'Contributing without earned income (not allowed!)',
      'Not documenting income (audit risk)',
      'Choosing funds with high fees',
      'Not starting as early as possible'
    ],
    proTips: [
      '$7,000 at birth → ~$1.5 million at age 65 (10% growth)',
      'Tax-free forever (unlike 529 which has restrictions)',
      'Baby modeling/acting = legitimate earned income',
      'Family business: pay reasonable wage for actual work',
      'Compound growth is INSANE over 65 years!'
    ]
  },

  '529-roth-rollover': {
    steps: [
      'Confirm eligibility: 529 open 15+ years',
      'Check limits: $35,000 lifetime maximum rollover',
      'Ensure beneficiary\'s income is under Roth IRA limits',
      'Contact 529 plan administrator',
      'Request direct rollover to Roth IRA (not distribution)',
      'Report on tax return',
      'Invest within Roth IRA',
      'Enjoy tax-free growth forever'
    ],
    documents: [
      '529 account statements',
      'Proof account open 15+ years',
      'Beneficiary\'s tax return (income verification)',
      'Roth IRA account information'
    ],
    links: [
      { label: 'SECURE Act 2.0 Summary', url: 'https://www.congress.gov/bill/117th-congress/house-bill/2954' }
    ],
    timeEstimate: '1-2 hours',
    cost: 'No taxes or penalties (qualified rollover)',
    commonMistakes: [
      'Account not open 15 years (not eligible)',
      'Exceeding $35k lifetime limit',
      'Not doing direct rollover (triggers taxes)',
      'Beneficiary income too high'
    ],
    proTips: [
      'New for 2024! Game-changer for unused 529 funds',
      'Great safety net if kid gets scholarships',
      'Roth IRA has more flexibility than 529',
      'Doesn\'t count as gift (separate from annual limits)'
    ]
  },

  'umbrella-insurance': {
    steps: [
      'Calculate total assets to protect (home, savings, investments)',
      'Review current auto/home liability limits',
      'Get quotes from your current insurer (bundled discount)',
      'Get quotes from 2-3 other companies for comparison',
      'Choose coverage: $1M-$5M depending on assets/income',
      'Apply and provide required documentation',
      'Set up automatic payments',
      'Review annually (as assets grow, increase coverage)'
    ],
    documents: [
      'Current auto/home insurance policies',
      'Asset statements (home value, investments)',
      'Income verification (sometimes required)',
      'Driver\'s license and vehicle info'
    ],
    links: [
      { label: 'Insurance Information Institute', url: 'https://www.iii.org/' }
    ],
    timeEstimate: '1-2 hours',
    cost: '$200-500/year for $1M-2M coverage',
    commonMistakes: [
      'Not enough coverage (should cover total assets + future income)',
      'Thinking you\'re not at risk (lawsuits happen)',
      'Not updating as income/assets grow',
      'Forgetting to list all properties/vehicles'
    ],
    proTips: [
      'Cheapest insurance per dollar of coverage',
      'Protects against catastrophic lawsuits',
      'Covers gaps in auto/home policies',
      'Essential if you have a pool, trampoline, or dog',
      'With kids = higher liability (playground injuries, etc.)'
    ]
  },

  'coverdell-esa': {
    steps: [
      'Compare Coverdell vs 529 (more flexibility but lower limits)',
      'Check income limits (phased out above $110k single / $220k married)',
      'Open account at brokerage (not all offer them)',
      'Contribute up to $2,000/year before child turns 18',
      'Invest in diversified portfolio',
      'Use for K-12 expenses (tutors, computers, etc.)',
      'Use by age 30 or roll to 529',
      'Keep records for tax purposes'
    ],
    documents: [
      'Your ID',
      'Child\'s SSN',
      'Proof of income (verify eligibility)',
      'Bank account for contributions'
    ],
    links: [
      { label: 'IRS Coverdell Info', url: 'https://www.irs.gov/publications/p970#en_US_2023_publink100024988' }
    ],
    timeEstimate: '30 minutes to open',
    cost: 'Brokerage fees vary',
    commonMistakes: [
      'Exceeding income limits (penalties)',
      'Missing the age 18 deadline for contributions',
      'Not using funds by age 30 (penalties + taxes)',
      'Not realizing income limits are lower than Roth IRA'
    ],
    proTips: [
      'More flexible than 529 (K-12 computers, tutors, etc.)',
      'Can be rolled to 529 if not used',
      'Low contribution limit ($2k/year)',
      'Usually phased out for high earners',
      'Good supplement to 529, not replacement'
    ]
  },

  'eitc': {
    steps: [
      'Check if you qualify (income limits vary by filing status/kids)',
      'File taxes even if not required (this is REFUNDABLE credit)',
      'Claim EITC on Form 1040',
      'Submit Schedule EIC with child information',
      'Wait for refund (typically larger with direct deposit)',
      'Save records for 3 years',
      'File again next year if still eligible'
    ],
    documents: [
      'W-2s from all employers',
      '1099s (if self-employed)',
      'Child\'s SSN',
      'Childcare provider info (if claiming expenses)',
      'Bank account for direct deposit'
    ],
    links: [
      { label: 'IRS EITC Assistant', url: 'https://www.irs.gov/credits-deductions/individuals/earned-income-tax-credit-eitc' },
      { label: 'EITC Eligibility', url: 'https://www.irs.gov/credits-deductions/individuals/earned-income-tax-credit-eitc/who-qualifies-for-the-earned-income-tax-credit-eitc' }
    ],
    phoneNumbers: [
      { label: 'IRS EITC Hotline', number: '1-800-829-1040' }
    ],
    timeEstimate: '1 hour to file taxes',
    cost: 'FREE money! Refundable credit.',
    commonMistakes: [
      'Not filing because income is low (missing free money!)',
      'Incorrect filing status (must file jointly if married)',
      'Claiming child doesn\'t meet qualifying rules',
      'Not understanding it\'s REFUNDABLE (get money even if no tax owed)'
    ],
    proTips: [
      'With 3+ kids: up to $7,830 credit (2024)',
      'Even with $0 tax owed, you get the credit as refund!',
      'Free tax prep through VITA if income under $67k',
      'File even if not required - this is literally free money',
      'Direct deposit = fastest refund'
    ]
  },

  'beneficiary-review': {
    steps: [
      'List all accounts with beneficiaries: 401k, IRA, life insurance, bank',
      'Log into each account or contact provider',
      'Review current beneficiaries (may have ex-spouse, parents listed)',
      'Update to spouse/partner as primary beneficiary',
      'Add child as contingent beneficiary (with trust if under 18)',
      'Get confirmation in writing from each provider',
      'Store confirmations with will',
      'Review annually or after major life changes'
    ],
    documents: [
      'List of all financial accounts',
      'Current beneficiary designations',
      'Beneficiary change forms',
      'Proof of submission/confirmation'
    ],
    links: [
      { label: 'FINRA Beneficiary Info', url: 'https://www.finra.org/investors/insights/beneficiary-designations' }
    ],
    timeEstimate: '2-4 hours (all accounts)',
    cost: 'Free',
    commonMistakes: [
      'Not updating after marriage/divorce',
      'Naming minor child directly (court manages it)',
      'Forgetting about old employer 401k',
      'Thinking will covers it (it DOESN\'T!)'
    ],
    proTips: [
      'Beneficiaries OVERRIDE will (important!)',
      'For minor children: use trust or UTMA designation',
      'Name contingent beneficiaries (backup plan)',
      'This bypasses probate (faster for loved ones)',
      'Review after every major life event'
    ]
  },

  'digital-assets': {
    steps: [
      'Inventory all digital accounts (email, social media, photos, crypto)',
      'List all devices (phones, computers, tablets)',
      'Document passwords (password manager recommended)',
      'Write instructions for each account',
      'Choose a digital executor (can be different from will executor)',
      'Store access info securely (not in will - becomes public)',
      'Tell executor where to find it',
      'Update annually as accounts/passwords change'
    ],
    documents: [
      'List of all digital accounts',
      'Passwords (encrypted)',
      'Device inventory',
      'Instructions for each account',
      'Digital executor contact info'
    ],
    links: [
      { label: 'Google Inactive Account Manager', url: 'https://myaccount.google.com/inactive' },
      { label: 'Facebook Legacy Contact', url: 'https://www.facebook.com/help/1568012583471768' },
      { label: 'Apple Digital Legacy', url: 'https://support.apple.com/en-us/HT212360' }
    ],
    timeEstimate: '3-5 hours (comprehensive inventory)',
    cost: 'Free',
    commonMistakes: [
      'Putting passwords in will (becomes public record!)',
      'Not considering sentimental value (photos, videos)',
      'Forgetting cryptocurrency (unrecoverable if keys lost)',
      'Not updating regularly'
    ],
    proTips: [
      'Use password manager (1Password, LastPass, Bitwarden)',
      'Enable legacy contacts on major platforms',
      'Back up photos/videos to cloud + physical',
      'Consider "digital will" separate from legal will',
      'Executor needs both access instructions AND legal authority'
    ]
  }
};

export default taskDetails;
