'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/lib/supabase';
import { Task } from '@/lib/supabase';
import { 
  CheckCircle2, 
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  FileText,
  Phone,
  Link as LinkIcon,
  DollarSign,
  Clock3,
  AlertTriangle,
  Lightbulb
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

// Task detail guides
const taskGuides: Record<string, {
  steps: string[];
  documents: string[];
  links: { label: string; url: string }[];
  phoneNumbers?: { label: string; number: string }[];
  timeEstimate: string;
  cost: string;
  commonMistakes: string[];
  proTips: string[];
}> = {
  'insurance': {
    steps: [
      'Call your HR department or insurance provider within 30-60 days of birth',
      'Ask for a "Qualifying Life Event" enrollment form',
      'Provide baby\'s name, date of birth, and SSN (if available)',
      'Submit birth certificate as proof',
      'Confirm effective date (usually retroactive to birth date)',
      'Get confirmation number and keep for your records',
      'Request new insurance cards with baby\'s name added'
    ],
    documents: ['Birth certificate (certified copy)', 'Baby\'s Social Security Number', 'Your insurance ID card', 'Enrollment form'],
    links: [
      { label: 'Healthcare.gov Special Enrollment', url: 'https://www.healthcare.gov/coverage-outside-open-enrollment/' },
      { label: 'Find Your State CHIP Program', url: 'https://www.medicaid.gov/chip/index.html' }
    ],
    phoneNumbers: [{ label: 'Healthcare Marketplace', number: '1-800-318-2596' }],
    timeEstimate: '30 minutes - 2 hours',
    cost: 'Free (may increase monthly premium)',
    commonMistakes: ['Waiting too long (miss the 30-60 day deadline)', 'Not getting confirmation in writing', 'Assuming automatic coverage'],
    proTips: ['Do this IMMEDIATELY - don\'t wait', 'Get baby\'s SSN first if possible', 'Ask about adding dental and vision too']
  },
  '529': {
    steps: [
      'Research your state\'s 529 plan (tax benefits vary)',
      'Compare with top-rated plans (Vanguard, Utah My529)',
      'Choose plan type: age-based or custom portfolio',
      'Open account online (10-15 minutes)',
      'Name yourself as account owner, child as beneficiary',
      'Set up automatic monthly contributions',
      'Consider front-loading for maximum growth'
    ],
    documents: ['Your ID', 'Child\'s SSN', 'Bank account info for contributions'],
    links: [
      { label: 'SavingForCollege.com', url: 'https://www.savingforcollege.com/' },
      { label: 'SEC 529 Guide', url: 'https://www.sec.gov/investor/pubs/intro529.htm' }
    ],
    timeEstimate: '30 minutes to open',
    cost: 'Free to open, $0-50/year fees',
    commonMistakes: ['Waiting until "later"', 'Not checking state tax deduction', 'Keeping it too conservative'],
    proTips: ['Start with age-based portfolio', 'Front-load if possible', 'Can use for K-12 private school']
  },
  'ssn': {
    steps: [
      'Get Form SS-5 from hospital (easiest) or SSA.gov',
      'Fill out baby\'s full name, date of birth, place of birth',
      'Provide parents\' SSNs and names at birth',
      'Submit certified birth certificate',
      'Mail or bring to Social Security office',
      'Wait 2-4 weeks for card in mail'
    ],
    documents: ['Certified birth certificate', 'Form SS-5', 'Parents\' IDs', 'Proof of US citizenship'],
    links: [
      { label: 'Apply for SSN Online', url: 'https://www.ssa.gov/ssnumber/' },
      { label: 'Find SSA Office', url: 'https://secure.ssa.gov/ICON/main.jsp' }
    ],
    phoneNumbers: [{ label: 'Social Security Administration', number: '1-800-772-1213' }],
    timeEstimate: '1-2 hours application, 2-4 weeks wait',
    cost: 'Free',
    commonMistakes: ['Waiting too long', 'Using non-certified birth certificate', 'Making errors on form'],
    proTips: ['Do this at the hospital if possible', 'Get 2-3 copies of birth certificate', 'Required for child tax credit']
  },
  'tax': {
    steps: [
      'Log into your employer\'s HR portal or contact HR',
      'Request Form W-4 (Employee\'s Withholding Certificate)',
      'Add +1 to number of dependents',
      'Submit to HR/Payroll',
      'See change in next paycheck'
    ],
    documents: ['Current W-4 form', 'Baby\'s SSN'],
    links: [
      { label: 'IRS Withholding Calculator', url: 'https://www.irs.gov/individuals/tax-withholding-estimator' }
    ],
    timeEstimate: '15-30 minutes',
    cost: 'Free (saves you money)',
    commonMistakes: ['Not adjusting (missing bigger paycheck)', 'Over-adjusting (owing taxes)', 'Not both parents adjusting'],
    proTips: ['More dependents = less tax withheld', '$2,000 Child Tax Credit at tax time', 'Can increase take-home pay by $100-200/month']
  },
  'will': {
    steps: [
      'List all assets (accounts, property, valuables)',
      'Choose guardian(s) for your child (discuss with them first)',
      'Choose executor',
      'Draft will (attorney recommended)',
      'Sign will with 2 witnesses present',
      'Store original safely',
      'Tell executor where will is stored'
    ],
    documents: ['List of assets and debts', 'Guardian candidates\' info', 'Executor\'s info', 'Beneficiary information'],
    links: [
      { label: 'LegalZoom Will Service', url: 'https://www.legalzoom.com/' },
      { label: 'FreeWill (Free Service)', url: 'https://www.freewill.com/' }
    ],
    timeEstimate: '2-4 hours',
    cost: '$0-500 online or $500-2000+ attorney',
    commonMistakes: ['Not naming guardians', 'Not telling guardian before naming them', 'Forgetting to update beneficiaries on 401k/IRA'],
    proTips: ['Name backup guardian', 'Review every 3-5 years', 'Update beneficiaries directly on accounts']
  },
  'life': {
    steps: [
      'Calculate coverage needed (10-15x your income)',
      'Get quotes from multiple companies',
      'Choose term length (20-30 years)',
      'Complete health questionnaire',
      'Name beneficiaries',
      'Set up automatic payments'
    ],
    documents: ['Proof of income', 'Medical records if required', 'Driver\'s license', 'Beneficiary contact info'],
    links: [
      { label: 'Policygenius (Compare Quotes)', url: 'https://www.policygenius.com/' }
    ],
    timeEstimate: '1-2 hours application, 2-6 weeks approval',
    cost: '$20-50/month for $500k-1M policy',
    commonMistakes: ['Relying only on group life from work', 'Naming baby as beneficiary', 'Getting whole life instead of term'],
    proTips: ['Term life is cheap when young', 'Name spouse/partner as beneficiary', 'Get 10-15x annual income in coverage']
  },
  'fsa': {
    steps: [
      'Check if your employer offers FSA or HSA',
      'Enroll during open enrollment or after birth (life event)',
      'Set contribution amount (FSA: $3,050 max, HSA: $8,300 family max)',
      'Start using pre-tax dollars for baby expenses',
      'Keep receipts for all purchases'
    ],
    documents: ['Social Security cards for dependent verification', 'Birth certificate', 'Medical receipts'],
    links: [
      { label: 'Healthcare.gov FSA Info', url: 'https://www.healthcare.gov/have-job-based-coverage/flexible-spending-accounts/' }
    ],
    timeEstimate: '30 minutes to enroll',
    cost: 'Saves 20-30% on medical costs',
    commonMistakes: ['Over-funding FSA (lose unused money)', 'Not realizing diapers/formula are eligible', 'Missing enrollment window'],
    proTips: ['FSA: Start with known expenses', 'HSA: Invest unused funds', 'Eligible: diapers, formula, breast pump']
  },
  'credit': {
    steps: [
      'Gather required info: child\'s full name, SSN, birth date, address',
      'Contact Equifax, Experian, and TransUnion',
      'Request freeze for minor child',
      'Keep PIN/password for each bureau',
      'Store confirmation letters'
    ],
    documents: ['Child\'s Social Security card', 'Your ID as parent/guardian', 'Proof of address'],
    links: [
      { label: 'Equifax Freeze', url: 'https://www.equifax.com/personal/credit-report-services/credit-freeze/' },
      { label: 'Experian Freeze', url: 'https://www.experian.com/freeze/center.html' },
      { label: 'TransUnion Freeze', url: 'https://www.transunion.com/credit-freeze' }
    ],
    phoneNumbers: [
      { label: 'Equifax', number: '1-800-525-6285' },
      { label: 'Experian', number: '1-888-397-3742' },
      { label: 'TransUnion', number: '1-800-680-7289' }
    ],
    timeEstimate: '1-2 hours (all 3 bureaus)',
    cost: 'FREE',
    commonMistakes: ['Forgetting one of the three bureaus', 'Losing the PIN/password', 'Not freezing until after identity theft'],
    proTips: ['Child SSNs are prime targets', 'Do this ASAP after getting SSN', 'Keep PINs in multiple safe places']
  },
  'roth': {
    steps: [
      'Understand: baby needs EARNED INCOME',
      'Identify income opportunities: modeling, acting, family business',
      'Document all income',
      'Open Custodial Roth IRA at brokerage',
      'Contribute up to 100% of earned income or $7,000',
      'Invest in low-cost index funds'
    ],
    documents: ['Proof of earned income', 'Your ID (custodian)', 'Child\'s SSN', 'Bank account info'],
    links: [
      { label: 'Fidelity Custodial Roth IRA', url: 'https://www.fidelity.com/retirement-ira/custodial-account' }
    ],
    timeEstimate: '1 hour to open, ongoing annually',
    cost: 'No account fees at most brokerages',
    commonMistakes: ['Contributing without earned income', 'Not documenting income', 'Choosing funds with high fees'],
    proTips: ['$7,000 at birth → ~$1.5 million at age 65', 'Tax-free forever', 'Baby modeling = legitimate earned income']
  },
  'umbrella': {
    steps: [
      'Calculate total assets to protect',
      'Review current auto/home liability limits',
      'Get quotes from your current insurer',
      'Get quotes from 2-3 other companies',
      'Choose coverage: $1M-$5M',
      'Apply and provide required documentation'
    ],
    documents: ['Current auto/home insurance policies', 'Asset statements', 'Income verification'],
    links: [
      { label: 'Insurance Information Institute', url: 'https://www.iii.org/' }
    ],
    timeEstimate: '1-2 hours',
    cost: '$200-500/year for $1M-2M coverage',
    commonMistakes: ['Not enough coverage', 'Thinking you\'re not at risk', 'Not updating as income/assets grow'],
    proTips: ['Cheapest insurance per dollar of coverage', 'Protects against catastrophic lawsuits', 'Essential if you have a pool, trampoline, or dog']
  }
};

// Default tasks
const defaultTasks = [
  { id: 'insurance', title: 'Add Baby to Health Insurance', description: 'Critical: Add baby within 30-60 days of birth', category: 'insurance', priority: 'urgent', icon: 'shield' },
  { id: '529', title: 'Open 529 College Savings Plan', description: 'Start saving for education with tax advantages', category: 'general', priority: 'high', icon: 'wallet' },
  { id: 'ssn', title: 'Get Social Security Number', description: 'Required for taxes and claiming as dependent', category: 'legal', priority: 'urgent', icon: 'file' },
  { id: 'tax', title: 'Update W-4 Tax Withholdings', description: 'Add dependent to increase take-home pay', category: 'tax', priority: 'high', icon: 'dollar' },
  { id: 'life', title: 'Get Term Life Insurance', description: 'Essential protection for your family', category: 'insurance', priority: 'high', icon: 'heart' },
  { id: 'will', title: 'Create or Update Your Will', description: 'Name guardians for your child', category: 'legal', priority: 'high', icon: 'file' },
  { id: 'fsa', title: 'Maximize FSA or HSA', description: 'Use pre-tax dollars for medical expenses', category: 'tax', priority: 'high', icon: 'dollar' },
  { id: 'credit', title: 'Freeze Child Credit (3 Bureaus)', description: 'Protect against identity theft', category: 'legal', priority: 'high', icon: 'shield' },
  { id: 'roth', title: 'Set Up Custodial Roth IRA', description: 'If baby has earned income, start retirement savings early', category: 'general', priority: 'medium', icon: 'trending' },
  { id: 'umbrella', title: 'Get Umbrella Insurance', description: 'Protect against lawsuits', category: 'insurance', priority: 'medium', icon: 'shield' },
];

interface TaskManagerProps {
  userId?: string;
  state?: string | null;
}

export function TaskManager({ userId, state }: TaskManagerProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      loadTasks();
    }
  }, [userId]);

  const loadTasks = async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error || !data || data.length === 0) {
      // Create default tasks - without order and icon for now (DB migration needed)
      const tasksToInsert = defaultTasks.map((task) => ({
        user_id: userId,
        title: task.title,
        description: task.description,
        category: task.category,
        priority: task.priority,
        status: 'pending',
      }));
      
      const { error: insertError, data: insertedTasks } = await supabase.from('tasks').insert(tasksToInsert).select();
      if (insertError) {
        console.error('Error creating default tasks:', insertError);
        // Try without icon if that was the issue
        const tasksWithoutIcon = defaultTasks.map((task) => ({
          user_id: userId,
          title: task.title,
          description: task.description,
          category: task.category,
          priority: task.priority,
          status: 'pending',
        }));
        const { data: retryData } = await supabase.from('tasks').insert(tasksWithoutIcon).select();
        setTasks(retryData || []);
      } else {
        setTasks(insertedTasks || []);
      }
    } else {
      setTasks(data);
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    setCompletingTaskId(taskId);
    
    // Optimistically update UI
    setTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, status: 'completed' as const, completion_date: new Date().toISOString() } : t
    ));
    
    const { error } = await supabase
      .from('tasks')
      .update({ 
        status: 'completed',
        completion_date: new Date().toISOString()
      })
      .eq('id', taskId);
    
    if (!error) {
      // Refresh to confirm
      const { data: updatedTasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      setTasks(updatedTasks || []);
    } else {
      console.error('Error completing task:', error);
      // Revert on error
      const { data: currentTasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      setTasks(currentTasks || []);
    }
    
    setCompletingTaskId(null);
  };

  const getTaskGuide = (taskTitle: string) => {
    if (taskTitle.includes('Insurance') && !taskTitle.includes('Life') && !taskTitle.includes('Umbrella')) return taskGuides['insurance'];
    if (taskTitle.includes('529')) return taskGuides['529'];
    if (taskTitle.includes('Social Security')) return taskGuides['ssn'];
    if (taskTitle.includes('W-4') || taskTitle.includes('Tax') || taskTitle.includes('Withholding')) return taskGuides['tax'];
    if (taskTitle.includes('Will')) return taskGuides['will'];
    if (taskTitle.includes('Life Insurance')) return taskGuides['life'];
    if (taskTitle.includes('FSA') || taskTitle.includes('HSA')) return taskGuides['fsa'];
    if (taskTitle.includes('Credit')) return taskGuides['credit'];
    if (taskTitle.includes('Roth IRA')) return taskGuides['roth'];
    if (taskTitle.includes('Umbrella')) return taskGuides['umbrella'];
    return null;
  };

  const pendingTasks = tasks.filter(t => t.status !== 'completed');
  const completedTasks = tasks.filter(t => t.status === 'completed');
  const urgentTasks = pendingTasks.filter(t => t.priority === 'urgent');
  
  const completionRate = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Progress Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-white border-warm-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-warm-900">{pendingTasks.length}</div>
                <div className="text-xs text-warm-500">Pending</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-warm-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-warm-900">{urgentTasks.length}</div>
                <div className="text-xs text-warm-500">Urgent</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-warm-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-warm-900">{completedTasks.length}</div>
                <div className="text-xs text-warm-500">Completed</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Tasks */}
      <Card>
        <CardHeader className="bg-gradient-to-r from-cream-100 to-cream-50 border-b border-warm-100">
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-primary-600" />
            Your Tasks
            <span className="text-xs font-normal text-warm-500 ml-auto">
              {completionRate}% complete
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-4 p-6">
            {pendingTasks.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                <p className="text-warm-600">All tasks completed! Great job!</p>
              </div>
            ) : (
              pendingTasks.map((task) => {
                const guide = getTaskGuide(task.title);
                const isExpanded = expandedTask === task.id;
                const isCompleting = completingTaskId === task.id;
                
                return (
                  <div key={task.id} className={`border-l-4 ${
                    task.priority === 'urgent' ? 'border-l-red-500' : 
                    task.priority === 'high' ? 'border-l-amber-500' : 'border-l-blue-400'
                  } bg-white border border-warm-100 rounded-xl overflow-hidden`}>
                    <div className="p-5">
                      <div className="flex items-start gap-4">
                        <div className="mt-1">
                          <Checkbox
                            id={`task-${task.id}`}
                            checked={task.status === 'completed'}
                            onCheckedChange={() => handleCompleteTask(task.id)}
                            disabled={isCompleting}
                            className="w-6 h-6 border-2 border-warm-300 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                          />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-warm-900">{task.title}</h4>
                            {task.priority === 'urgent' && (
                              <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-medium rounded-full">URGENT</span>
                            )}
                            {task.priority === 'high' && (
                              <span className="px-2 py-0.5 bg-amber-100 text-amber-600 text-xs font-medium rounded-full">HIGH</span>
                            )}
                          </div>
                          <p className="text-sm text-warm-600 mb-3">{task.description}</p>
                          
                          {guide && (
                            <button
                              onClick={() => setExpandedTask(isExpanded ? null : task.id)}
                              className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium"
                            >
                              {isExpanded ? (
                                <><ChevronUp className="w-4 h-4" /> Hide detailed guide</>
                              ) : (
                                <><ChevronDown className="w-4 h-4" /> Show detailed guide</>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {isExpanded && guide && (
                      <div className="border-t border-warm-100 bg-warm-50 p-5">
                        <div className="space-y-6">
                          {/* Steps */}
                          <div>
                            <h5 className="font-semibold text-warm-900 mb-3 flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-primary-500" />
                              Step-by-Step Instructions
                            </h5>
                            <ol className="space-y-2">
                              {guide.steps.map((step, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm text-warm-700">
                                  <span className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-medium">
                                    {i + 1}
                                  </span>
                                  <span className="pt-0.5">{step}</span>
                                </li>
                              ))}
                            </ol>
                          </div>
                          
                          {/* Documents */}
                          <div>
                            <h5 className="font-semibold text-warm-900 mb-3 flex items-center gap-2">
                              <FileText className="w-4 h-4 text-accent-500" />
                              Documents You'll Need
                            </h5>
                            <ul className="grid grid-cols-2 gap-2">
                              {guide.documents.map((doc, i) => (
                                <li key={i} className="flex items-center gap-2 text-sm text-warm-600">
                                  <div className="w-1.5 h-1.5 bg-warm-400 rounded-full" />
                                  {doc}
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          {/* Links & Phone */}
                          <div className="grid md:grid-cols-2 gap-4">
                            {guide.links.length > 0 && (
                              <div>
                                <h5 className="font-semibold text-warm-900 mb-2 flex items-center gap-2">
                                  <LinkIcon className="w-4 h-4 text-blue-500" />
                                  Helpful Links
                                </h5>
                                <ul className="space-y-1">
                                  {guide.links.map((link, i) => (
                                    <li key={i}>
                                      <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-600 hover:underline">
                                        {link.label} →
                                      </a>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {guide.phoneNumbers && guide.phoneNumbers.length > 0 && (
                              <div>
                                <h5 className="font-semibold text-warm-900 mb-2 flex items-center gap-2">
                                  <Phone className="w-4 h-4 text-green-500" />
                                  Phone Numbers
                                </h5>
                                <ul className="space-y-1">
                                  {guide.phoneNumbers.map((phone, i) => (
                                    <li key={i} className="text-sm text-warm-600">
                                      <span className="font-medium">{phone.label}:</span>{' '}
                                      <a href={`tel:${phone.number.replace(/\D/g, '')}`} className="text-primary-600 hover:underline">
                                        {phone.number}
                                      </a>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                          
                          {/* Time & Cost */}
                          <div className="flex items-center gap-6 text-sm">
                            <div className="flex items-center gap-2 text-warm-600">
                              <Clock3 className="w-4 h-4" />
                              <span>Time: <span className="font-medium text-warm-900">{guide.timeEstimate}</span></span>
                            </div>
                            <div className="flex items-center gap-2 text-warm-600">
                              <DollarSign className="w-4 h-4" />
                              <span>Cost: <span className="font-medium text-warm-900">{guide.cost}</span></span>
                            </div>
                          </div>
                          
                          {/* Common Mistakes */}
                          <div className="bg-red-50 border border-red-100 rounded-lg p-4">
                            <h5 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4" />
                              Common Mistakes to Avoid
                            </h5>
                            <ul className="space-y-1">
                              {guide.commonMistakes.map((mistake, i) => (
                                <li key={i} className="text-sm text-red-700 flex items-start gap-2">
                                  <span className="text-red-400 mt-0.5">•</span>
                                  {mistake}
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          {/* Pro Tips */}
                          <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
                            <h5 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
                              <Lightbulb className="w-4 h-4" />
                              Pro Tips
                            </h5>
                            <ul className="space-y-1">
                              {guide.proTips.map((tip, i) => (
                                <li key={i} className="text-sm text-amber-700 flex items-start gap-2">
                                  <span className="text-amber-400 mt-0.5">💡</span>
                                  {tip}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <Card>
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-cream-50 border-b border-emerald-100">
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              Completed Tasks
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {completedTasks.map((task) => (
                <div key={task.id} className="flex items-center gap-4 p-4 bg-emerald-50/50 rounded-xl">
                  <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-warm-700 line-through">{task.title}</h4>
                    {task.completion_date && (
                      <p className="text-xs text-warm-500">
                        Completed on {formatDate(task.completion_date)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
