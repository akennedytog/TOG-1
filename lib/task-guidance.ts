/**
 * Task Guidance Data
 * 
 * Extracted from SmartTaskManager.tsx
 * Contains task-specific guidance for insurance, 529, tax, and legal tasks
 */

export interface TaskGuidance {
  title: string;
  steps: string[];
  resources: { label: string; url: string }[];
}

/**
 * Get guidance for a specific task based on category and title
 */
export function getTaskGuidance(task: { category?: string; title?: string }): TaskGuidance {
  const category = task.category?.toLowerCase() || 'general';
  const title = task.title?.toLowerCase() || '';

  // Insurance tasks
  if (category === 'insurance' || title.includes('insurance')) {
    return getInsuranceGuidance(title);
  }

  // 529 Plan tasks
  if (category === '529' || title.includes('529') || title.includes('college savings')) {
    return get529Guidance();
  }

  // Tax tasks
  if (category === 'tax' || title.includes('tax') || title.includes('w-4') || title.includes('withhold')) {
    return getTaxGuidance(title);
  }

  // Legal tasks
  if (category === 'legal' || title.includes('legal') || title.includes('will') || title.includes('guardian') || title.includes('ssn') || title.includes('social security')) {
    return getLegalGuidance(title);
  }

  // Default guidance
  return getDefaultGuidance();
}

function getInsuranceGuidance(title: string): TaskGuidance {
  if (title.includes('health') || title.includes('baby')) {
    return {
      title: 'Add Baby to Health Insurance',
      steps: [
        'Contact your HR department or insurance provider within 30-60 days of birth',
        'Get the baby\'s birth certificate and Social Security Number ready',
        'Fill out the enrollment forms with baby\'s information',
        'Submit proof of birth (hospital records or birth certificate)',
        'Confirm coverage start date and get new insurance cards',
        'Update your pediatrician with the new insurance information'
      ],
      resources: [
        { label: 'Healthcare.gov Special Enrollment', url: 'https://www.healthcare.gov/coverage-outside-open-enrollment/' },
        { label: 'State Insurance Commissioner', url: 'https://www.naic.org/state_contacts/' }
      ]
    };
  }

  if (title.includes('life')) {
    return {
      title: 'Get Term Life Insurance',
      steps: [
        'Calculate how much coverage you need (typically 10-15x your annual income)',
        'Compare quotes from multiple providers (Policygenius, Haven Life, etc.)',
        'Choose between term life (more affordable) or whole life (builds cash value)',
        'Complete the application and medical exam if required',
        'Name your child and spouse as beneficiaries',
        'Review and sign the policy documents'
      ],
      resources: [
        { label: 'Policygenius Life Insurance', url: 'https://www.policygenius.com/life-insurance/' },
        { label: 'NerdWallet Life Insurance Guide', url: 'https://www.nerdwallet.com/article/insurance/life-insurance' }
      ]
    };
  }

  return {
    title: 'Insurance Task',
    steps: [
      'Review your current insurance coverage',
      'Identify gaps in coverage for your new family situation',
      'Contact your insurance provider or broker',
      'Compare quotes from multiple companies',
      'Read the policy terms carefully before signing'
    ],
    resources: [
      { label: 'Insurance Information Institute', url: 'https://www.iii.org/' }
    ]
  };
}

function get529Guidance(): TaskGuidance {
  return {
    title: 'Open a 529 College Savings Plan',
    steps: [
      'Research your state\'s 529 plan (many offer tax deductions for residents)',
      'Compare plans at SavingForCollege.com for fees and performance',
      'Choose between prepaid tuition plans or investment-based plans',
      'Gather required information (your ID, baby\'s SSN, bank account)',
      'Open the account online (usually takes 15-20 minutes)',
      'Set up automatic monthly contributions (even $25-50 helps!)',
      'Invite family members to contribute for birthdays and holidays'
    ],
    resources: [
      { label: 'SavingForCollege.com', url: 'https://www.savingforcollege.com/' },
      { label: 'SEC 529 Guide', url: 'https://www.sec.gov/investor/pubs/intro529.htm' }
    ]
  };
}

function getTaxGuidance(title: string): TaskGuidance {
  if (title.includes('w-4') || title.includes('withhold')) {
    return {
      title: 'Update W-4 Tax Withholdings',
      steps: [
        'Log into your employer\'s HR portal or contact HR directly',
        'Request a new W-4 form or access the online portal',
        'Add your child as a dependent (increases your withholding allowances)',
        'Consider the Child Tax Credit ($2,000 per child in 2024)',
        'Submit the updated form to your payroll department',
        'Expect to see increased take-home pay within 1-2 pay cycles'
      ],
      resources: [
        { label: 'IRS W-4 Calculator', url: 'https://www.irs.gov/individuals/tax-withholding-estimator' },
        { label: 'IRS Child Tax Credit Info', url: 'https://www.irs.gov/credits-deductions/individuals/child-tax-credit' }
      ]
    };
  }

  if (title.includes('fsa') || title.includes('hsa')) {
    return {
      title: 'Maximize FSA or HSA',
      steps: [
        'Review your current FSA/HSA contributions and balance',
        'Calculate expected medical expenses for the year (pediatrician visits, vaccines, etc.)',
        'For FSA: Contribute up to $3,050 (2024 limit) - use it or lose it!',
        'For HSA: Contribute up to $8,300 for family coverage (2024 limit)',
        'Set up automatic payroll deductions',
        'Save receipts for all baby-related medical expenses'
      ],
      resources: [
        { label: 'Healthcare.gov FSA Info', url: 'https://www.healthcare.gov/have-job-based-coverage/flexible-spending-accounts/' },
        { label: 'HSASearch.com', url: 'https://www.hsasearch.com/' }
      ]
    };
  }

  return {
    title: 'Tax-Related Task',
    steps: [
      'Gather all relevant tax documents and receipts',
      'Research available tax credits for parents',
      'Consider consulting with a tax professional',
      'Update your tax withholding or estimated payments if needed',
      'Keep records of all child-related expenses'
    ],
    resources: [
      { label: 'IRS Parents & Guardians', url: 'https://www.irs.gov/faqs/irs-procedures/filing-requirements' }
    ]
  };
}

function getLegalGuidance(title: string): TaskGuidance {
  if (title.includes('will') || title.includes('guardian')) {
    return {
      title: 'Create or Update Your Will',
      steps: [
        'Make a list of all your assets (property, accounts, investments)',
        'Choose a guardian for your child (discuss with them first!)',
        'Choose backup guardians in case your first choice can\'t serve',
        'Decide on an executor for your estate',
        'Use an online service (Trust & Will, LegalZoom) or hire an estate attorney',
        'Sign the will with required witnesses (usually 2, varies by state)',
        'Store the original in a safe place and tell your executor where it is'
      ],
      resources: [
        { label: 'Trust & Will', url: 'https://trustandwill.com/' },
        { label: 'Nolo Estate Planning', url: 'https://www.nolo.com/legal-encyclopedia/estate-planning' }
      ]
    };
  }

  if (title.includes('ssn') || title.includes('social security')) {
    return {
      title: 'Get Social Security Number for Baby',
      steps: [
        'Fill out Form SS-5 (available at ssa.gov or the hospital)',
        'Gather required documents: birth certificate, parents\' IDs',
        'Submit the application at a Social Security office or by mail',
        'Wait 2-4 weeks for the card to arrive',
        'Keep the SSN in a safe place - you\'ll need it for taxes and benefits'
      ],
      resources: [
        { label: 'Social Security - Apply for SSN', url: 'https://www.ssa.gov/ssnumber/' },
        { label: 'Form SS-5', url: 'https://www.ssa.gov/forms/ss-5.pdf' }
      ]
    };
  }

  return {
    title: 'Legal Task',
    steps: [
      'Research your state\'s specific requirements',
      'Gather all necessary documentation',
      'Consider consulting with an attorney for complex situations',
      'Complete forms accurately and completely',
      'Keep copies of everything for your records'
    ],
    resources: [
      { label: 'Nolo Legal Encyclopedia', url: 'https://www.nolo.com/legal-encyclopedia' }
    ]
  };
}

function getDefaultGuidance(): TaskGuidance {
  return {
    title: 'General Task',
    steps: [
      'Break down the task into smaller, actionable steps',
      'Set a realistic deadline for completion',
      'Gather any necessary information or resources',
      'Take action on the first step',
      'Track your progress and adjust as needed'
    ],
    resources: [
      { label: 'BabyNest Help Center', url: 'https://babynest.io/help' }
    ]
  };
}
