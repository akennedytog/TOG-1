'use client';

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertCircle,
  Clock,
  Zap,
  DollarSign,
  Lightbulb,
  Calendar,
  ChevronDown,
  ChevronRight,
  Trophy,
  Sparkles,
  CheckCircle2,
  Plus,
  Loader2,
  ExternalLink,
  Trash2,
  Edit3,
  Info,
  FileText,
  Shield,
  Wallet,
  Landmark,
  Heart
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { groupTasksByCategory, getMotivationalMessage, getSmartRecommendation } from '@/lib/ai-task-categorizer';
import { supabase, updateTaskStatus } from '@/lib/supabase';
import { Skeleton } from '@/components/ui/skeleton';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string;
  category?: string;
  priority_weight?: number;
  completion_date?: string;
}

interface SmartTaskManagerProps {
  userId?: string | null;
  state?: string | null;
  tasks?: Task[];
  /** When set, SmartTaskManager will scroll to + briefly highlight this task. */
  selectedTaskId?: string | null;
  /** Called after we've handled the selected task so parent can clear it. */
  onTaskSelected?: () => void;
}

// Priority weights for proper numeric sorting
const PRIORITY_WEIGHTS: Record<string, number> = {
  urgent: 4,
  high: 3,
  medium: 2,
  low: 1,
};

// Default tasks that get created for new users
const DEFAULT_TASKS = [
  { title: 'Add Baby to Health Insurance', description: 'Critical: Add baby within 30-60 days of birth', category: 'insurance', priority: 'urgent', icon: 'shield', order: 0 },
  { title: 'Get Social Security Number', description: 'Required for taxes and claiming as dependent', category: 'legal', priority: 'urgent', icon: 'file', order: 1 },
  { title: 'Open 529 College Savings Plan', description: 'Start saving for education with tax advantages', category: '529', priority: 'high', icon: 'wallet', order: 2 },
  { title: 'Update W-4 Tax Withholdings', description: 'Add dependent to increase take-home pay', category: 'tax', priority: 'high', icon: 'dollar', order: 3 },
  { title: 'Get Term Life Insurance', description: 'Essential protection for your family', category: 'insurance', priority: 'high', icon: 'heart', order: 4 },
  { title: 'Create or Update Your Will', description: 'Name guardians for your child', category: 'legal', priority: 'high', icon: 'file', order: 5 },
  { title: 'Maximize FSA or HSA', description: 'Use pre-tax dollars for medical expenses', category: 'tax', priority: 'high', icon: 'dollar', order: 6 },
  { title: 'Freeze Child Credit (3 Bureaus)', description: 'Protect against identity theft', category: 'legal', priority: 'high', icon: 'shield', order: 7 },
  { title: 'Set Up Custodial Roth IRA', description: 'If baby has earned income, start retirement savings early', category: 'general', priority: 'medium', icon: 'trending', order: 8 },
  { title: 'Get Umbrella Insurance', description: 'Protect against lawsuits', category: 'insurance', priority: 'medium', icon: 'shield', order: 9 },
];

const CATEGORY_CONFIG = {
  urgent: {
    label: 'Urgent',
    icon: AlertCircle,
    color: 'red',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-700',
    description: 'Needs immediate attention',
  },
  'this-week': {
    label: 'This Week',
    icon: Calendar,
    color: 'orange',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    textColor: 'text-orange-700',
    description: 'Due within 7 days',
  },
  'quick-wins': {
    label: 'Quick Wins',
    icon: Zap,
    color: 'amber',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    textColor: 'text-amber-700',
    description: 'Fast tasks with big impact',
  },
  'financial-impact': {
    label: 'Financial Impact',
    icon: DollarSign,
    color: 'emerald',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    textColor: 'text-emerald-700',
    description: 'Save money with these',
  },
  planning: {
    label: 'Planning',
    icon: Lightbulb,
    color: 'blue',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-700',
    description: 'Research and decisions',
  },
  later: {
    label: 'Later',
    icon: Clock,
    color: 'gray',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    textColor: 'text-gray-600',
    description: 'Lower priority for now',
  },
};

export function SmartTaskManager({
  userId,
  state,
  tasks: initialTasks,
  selectedTaskId,
  onTaskSelected,
}: SmartTaskManagerProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['urgent', 'quick-wins', 'financial-impact']);
  const [highlightedTaskId, setHighlightedTaskId] = useState<string | null>(null);
  const taskRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Add Task Modal state
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    category: 'general',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    due_date: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Task Detail Modal state
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskDetailOpen, setTaskDetailOpen] = useState(false);

  // Fetch tasks from Supabase + bootstrap defaults for new users
  useEffect(() => {
    async function fetchTasks() {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('tasks')
          .select('*, completion_date')
          .eq('user_id', userId);

        if (error) throw error;

        // Bootstrap default tasks for new users
        if (!data || data.length === 0) {
          const tasksToInsert = DEFAULT_TASKS.map((task) => ({
            user_id: userId,
            title: task.title,
            description: task.description,
            category: task.category,
            priority: task.priority,
            priority_weight: PRIORITY_WEIGHTS[task.priority] || 2,
            status: 'pending',
            order: task.order,
            icon: task.icon,
          }));
          
          const { error: insertError } = await supabase
            .from('tasks')
            .insert(tasksToInsert);
          
          if (insertError) {
            console.error('Error creating default tasks:', insertError);
            setError('Failed to create default tasks');
            return;
          }
          
          // Refetch after insert
          const { data: newData } = await supabase
            .from('tasks')
            .select('*, completion_date')
            .eq('user_id', userId);
          
          if (newData) {
            const transformedTasks = sortTasksByPriority(newData);
            setTasks(transformedTasks);
          }
        } else {
          // Transform and sort existing tasks
          const transformedTasks = sortTasksByPriority(data);
          setTasks(transformedTasks);
        }
        
        setError(null);
      } catch (err: any) {
        console.error('Error fetching tasks:', err);
        setError(err.message || 'Failed to load tasks');
      } finally {
        setLoading(false);
      }
    }

    fetchTasks();
  }, [userId]);

  // Helper: sort tasks by priority weight (numeric) then by order
  function sortTasksByPriority(dbTasks: any[]): Task[] {
    return dbTasks
      .map((dbTask: any) => ({
        id: dbTask.id,
        title: dbTask.title,
        description: dbTask.description || undefined,
        status: dbTask.status,
        priority: dbTask.priority,
        priority_weight: dbTask.priority_weight ?? PRIORITY_WEIGHTS[dbTask.priority] ?? 2,
        due_date: dbTask.due_date || undefined,
        category: dbTask.category || undefined,
        completion_date: dbTask.completion_date || undefined,
      }))
      .sort((a, b) => {
        // Sort by priority weight (descending), then by order
        const weightDiff = (b.priority_weight ?? 2) - (a.priority_weight ?? 2);
        if (weightDiff !== 0) return weightDiff;
        return 0;
      });
  }

  // Group tasks by AI category
  const groupedTasks = useMemo(() => {
    return groupTasksByCategory(tasks);
  }, [tasks]);

  // Calculate stats
  const stats = useMemo(() => {
    const completed = tasks.filter(t => t.status === 'completed').length;
    const total = tasks.length;
    const totalPotentialSavings = Object.values(groupedTasks).reduce(
      (sum, group) => sum + (group.stats.totalSavings || 0), 
      0
    );
    return { completed, total, percentage: total > 0 ? (completed / total) * 100 : 0, totalPotentialSavings };
  }, [tasks, groupedTasks]);

  // Separate completed tasks from active tasks
  const { completedTasks, activeTasks } = useMemo(() => {
    const completed = tasks.filter(t => t.status === 'completed');
    const active = tasks.filter(t => t.status !== 'completed');
    return { completedTasks: completed, activeTasks: active };
  }, [tasks]);

  // Get motivational message
  const motivationalMessage = useMemo(() => {
    return getMotivationalMessage(stats.completed, stats.total);
  }, [stats]);

  // Get smart recommendation
  const smartRecommendation = useMemo(() => {
    return getSmartRecommendation(tasks);
  }, [tasks]);

  const toggleTask = useCallback(async (taskId: string) => {
    console.log('toggleTask called for:', taskId);
    const task = tasks.find(t => t.id === taskId);
    if (!task) {
      console.log('Task not found:', taskId);
      return;
    }

    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    const newCompletionDate = newStatus === 'completed' ? new Date().toISOString() : undefined;
    console.log('Changing status from', task.status, 'to', newStatus);

    // Optimistic update (set or clear completion_date locally)
    setTasks(prev => prev.map(t =>
      t.id === taskId
        ? { ...t, status: newStatus, completion_date: newStatus === 'completed' ? newCompletionDate : undefined }
        : t
    ));

    // Persist to database
    try {
      const { error } = await updateTaskStatus(taskId, newStatus, newCompletionDate);
      if (error) {
        console.error('Error updating task in DB:', error);
        throw error;
      }
      // If we just un-completed a task, also clear completion_date in the DB.
      if (newStatus !== 'completed') {
        const { error: clearErr } = await supabase
          .from('tasks')
          .update({ completion_date: null })
          .eq('id', taskId);
        if (clearErr) {
          console.warn('Could not clear completion_date:', clearErr);
        }
      }
      console.log('Task updated successfully');
    } catch (err) {
      console.error('Error updating task:', err);
      // Revert on error
      setTasks(prev => prev.map(t =>
        t.id === taskId
          ? { ...t, status: task.status, completion_date: task.completion_date }
          : t
      ));
      alert('Failed to update task. Please try again.');
    }
  }, [tasks]);

  // When a parent passes a selectedTaskId, expand its category, scroll to it,
  // and briefly highlight it. Then notify the parent to clear the selection.
  useEffect(() => {
    if (!selectedTaskId || loading || tasks.length === 0) return;
    const target = tasks.find((t) => t.id === selectedTaskId);
    if (!target) return;

    // Figure out which active-category bucket holds this task and expand it.
    const found = Object.entries(groupedTasks).find(([, group]: [string, any]) =>
      group.tasks.some((tt: any) => tt.id === selectedTaskId)
    );
    if (found) {
      const catKey = found[0];
      setExpandedCategories((prev) => (prev.includes(catKey) ? prev : [...prev, catKey]));
    } else if (target.status === 'completed') {
      // For completed tasks, expand the completed section.
      setExpandedCategories((prev) => (prev.includes('completed') ? prev : [...prev, 'completed']));
    }

    setHighlightedTaskId(selectedTaskId);

    // Scroll after expansion has had a chance to render.
    const scrollTimer = window.setTimeout(() => {
      const el = taskRefs.current[selectedTaskId];
      if (el && typeof el.scrollIntoView === 'function') {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);

    // Clear the highlight after a short flash.
    const highlightTimer = window.setTimeout(() => {
      setHighlightedTaskId(null);
      onTaskSelected?.();
    }, 2400);

    return () => {
      window.clearTimeout(scrollTimer);
      window.clearTimeout(highlightTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTaskId, loading, tasks, groupedTasks]);

  const handleAddTask = async () => {
    if (!userId || !newTask.title.trim()) return;
    
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          user_id: userId,
          title: newTask.title.trim(),
          description: newTask.description.trim() || null,
          category: newTask.category,
          priority: newTask.priority,
          priority_weight: PRIORITY_WEIGHTS[newTask.priority] || 2,
          status: 'pending',
          due_date: newTask.due_date || null,
          order: tasks.length,
          icon: 'file',
        })
        .select()
        .single();
      
      if (error) throw error;
      
      if (data) {
        const transformedTask: Task = {
          id: data.id,
          title: data.title,
          description: data.description || undefined,
          status: data.status,
          priority: data.priority,
          priority_weight: data.priority_weight,
          due_date: data.due_date || undefined,
          category: data.category || undefined,
        };
        
        setTasks(prev => [...prev, transformedTask].sort((a, b) => 
          (b.priority_weight ?? 2) - (a.priority_weight ?? 2)
        ));
        
        // Reset form
        setNewTask({
          title: '',
          description: '',
          category: 'general',
          priority: 'medium',
          due_date: '',
        });
        setShowAddTask(false);
      }
    } catch (err: any) {
      console.error('Error adding task:', err);
      alert('Failed to add task: ' + (err.message || 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const openTaskDetail = (task: Task & { aiCategory?: any }) => {
    setSelectedTask(task);
    setTaskDetailOpen(true);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!userId) return;
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    try {
      const { error } = await supabase.from('tasks').delete().eq('id', taskId);
      if (error) throw error;
      
      setTasks(prev => prev.filter(t => t.id !== taskId));
      setTaskDetailOpen(false);
      setSelectedTask(null);
    } catch (err: any) {
      console.error('Error deleting task:', err);
      alert('Failed to delete task: ' + (err.message || 'Unknown error'));
    }
  };

  const getTaskGuidance = (task: Task): { title: string; steps: string[]; resources: { label: string; url: string }[] } => {
    const category = task.category?.toLowerCase() || 'general';
    const title = task.title?.toLowerCase() || '';
    
    // Insurance tasks
    if (category === 'insurance' || title.includes('insurance')) {
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
    
    // 529 Plan tasks
    if (category === '529' || title.includes('529') || title.includes('college savings')) {
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
    
    // Tax tasks
    if (category === 'tax' || title.includes('tax') || title.includes('w-4') || title.includes('withhold')) {
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
    
    // Legal tasks
    if (category === 'legal' || title.includes('legal') || title.includes('will') || title.includes('guardian') || title.includes('ssn') || title.includes('social security')) {
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
          title: 'Get Social Security Number',
          steps: [
            'Complete the application for a Social Security card (Form SS-5)',
            'Gather documents: baby\'s birth certificate and your ID',
            'Submit at a local Social Security office or by mail',
            'The hospital may have offered to do this automatically - check if you already have one',
            'Wait 2-4 weeks for the card to arrive by mail',
            'Store the card in a safe place (don\'t carry it in your wallet)'
          ],
          resources: [
            { label: 'SSA Baby\'s Social Security Number', url: 'https://www.ssa.gov/number-card/get-a-social-security-number' },
            { label: 'SSN Application (SS-5)', url: 'https://www.ssa.gov/forms/ss-5.pdf' }
          ]
        };
      }
      if (title.includes('credit') || title.includes('freeze')) {
        return {
          title: 'Freeze Child\'s Credit (All 3 Bureaus)',
          steps: [
            'Request a free credit report for your child first (should be blank)',
            'Contact Equifax, Experian, and TransUnion individually',
            'Submit documentation: your ID, proof of address, child\'s birth certificate',
            'Each bureau has slightly different requirements - check their websites',
            'Keep the PINs/passwords in a secure location (you\'ll need them to unfreeze)',
            'Repeat this process when your child turns 16 as a precaution'
          ],
          resources: [
            { label: 'Equifax Minor Freeze', url: 'https://www.equifax.com/personal/credit-report-services/credit-freeze/' },
            { label: 'Experian Minor Freeze', url: 'https://www.experian.com/freeze/center.html' },
            { label: 'TransUnion Minor Freeze', url: 'https://www.transunion.com/credit-freeze' }
          ]
        };
      }
      return {
        title: 'Legal Task',
        steps: [
          'Research the legal requirements for your situation',
          'Gather necessary documentation',
          'Consider consulting with an attorney',
          'Complete required forms accurately',
          'File documents with the appropriate court or agency'
        ],
        resources: [
          { label: 'FindLegalAid.org', url: 'https://www.findlegalaid.org/' }
        ]
      };
    }
    
    // Benefit tasks
    if (category === 'benefit' || title.includes('benefit') || title.includes('disability') || title.includes('leave')) {
      return {
        title: 'Apply for Benefits',
        steps: [
          'Research what benefits you may qualify for (SNAP, WIC, TANF, etc.)',
          'Contact your state\'s benefits office or apply online',
          'Gather required documents: ID, proof of income, birth certificate',
          'Complete the application thoroughly',
          'Schedule an interview if required',
          'Keep copies of everything you submit'
        ],
        resources: [
          { label: 'Benefits.gov', url: 'https://www.benefits.gov/' },
          { label: 'WIC Program', url: 'https://www.fns.usda.gov/wic' }
        ]
      };
    }
    
    // Education/Investment tasks
    if (category === 'education' || category === 'investment' || title.includes('roth') || title.includes('ira')) {
      return {
        title: 'Set Up Investment for Child',
        steps: [
          'Understand the rules: Custodial Roth IRA requires earned income for the child',
          'Document the earned income (modeling, acting, odd jobs, etc.)',
          'Choose a brokerage (Fidelity, Schwab, Vanguard offer custodial accounts)',
          'Open a UTMA/UGMA or Custodial Roth IRA',
          'Set up automatic contributions',
          'Invest in low-cost index funds for long-term growth'
        ],
        resources: [
          { label: 'Fidelity Custodial Accounts', url: 'https://www.fidelity.com/accounts-brokerage/custodial-accounts' },
          { label: 'Schwab Custodial IRA', url: 'https://www.schwab.com/ira/custodial-ira' }
        ]
      };
    }
    
    // General tasks
    return {
      title: 'Complete This Task',
      steps: [
        'Break this task into smaller, manageable steps',
        'Set a specific deadline for completion',
        'Gather any information or documents you\'ll need',
        'Identify who else might need to be involved',
        'Take the first action, even if it\'s small',
        'Track your progress and celebrate when complete!'
      ],
      resources: [
        { label: 'BabyCenter New Parent Resources', url: 'https://www.babycenter.com/new-parent' }
      ]
    };
  };

  const renderTask = (task: Task & { aiCategory?: any }) => {
    const isCompleted = task.status === 'completed';
    const category = task.aiCategory;
    const isHighlighted = highlightedTaskId === task.id;

    return (
      <div
        key={task.id}
        ref={(el) => { taskRefs.current[task.id] = el; }}
        data-task-id={task.id}
        onClick={() => openTaskDetail(task)}
        className={cn(
          "group flex items-start gap-3 p-3 rounded-lg transition-all duration-500 cursor-pointer",
          "hover:bg-white hover:shadow-soft hover:scale-[1.01]",
          isCompleted && "opacity-60",
          isHighlighted && "bg-amber-50 ring-2 ring-amber-400 shadow-md"
        )}
      >
        <div onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={isCompleted}
            onCheckedChange={() => toggleTask(task.id)}
            className="mt-1 pointer-events-auto"
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className={cn(
              "font-medium text-sm transition-all",
              isCompleted ? "line-through text-gray-500" : "text-gray-900"
            )}>
              {task.title}
            </div>
            
            {category?.potentialSavings > 0 && (
              <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200 shrink-0">
                Save ${category.potentialSavings.toLocaleString()}
              </Badge>
            )}
          </div>
          
          {task.description && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{task.description}</p>
          )}
          
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary" className="text-xs">
              {category?.estimatedMinutes} min
            </Badge>
            
            {task.due_date && (
              <span className={cn(
                "text-xs",
                new Date(task.due_date) < new Date() ? "text-red-600 font-medium" : "text-gray-500"
              )}>
                {new Date(task.due_date) < new Date() ? 'Overdue' : `Due ${new Date(task.due_date).toLocaleDateString()}`}
              </span>
            )}
            
            {category?.reason && (
              <span className="text-xs text-gray-400 italic">
                {category.reason}
              </span>
            )}
            
            <ExternalLink className="w-3 h-3 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
          </div>
        </div>
      </div>
    );
  };

  const renderCategory = (categoryKey: string) => {
    const config = CATEGORY_CONFIG[categoryKey as keyof typeof CATEGORY_CONFIG];
    if (!config) return null;
    
    const group = groupedTasks[categoryKey];
    if (!group || group.tasks.length === 0) return null;
    
    const Icon = config.icon;
    const isExpanded = expandedCategories.includes(categoryKey);
    
    return (
      <div key={categoryKey} className="border border-gray-200 rounded-xl overflow-hidden">
        <button
          onClick={() => toggleCategory(categoryKey)}
          className={cn(
            "w-full flex items-center justify-between p-4 transition-all",
            config.bgColor,
            "hover:shadow-soft"
          )}
        >
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center",
              "bg-white shadow-soft"
            )}>
              <Icon className={cn("w-5 h-5", config.textColor)} />
            </div>
            
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900">{config.label}</h3>
                <Badge variant="secondary" className="text-xs">
                  {group.tasks.length}
                </Badge>
              </div>
              <p className="text-xs text-gray-600">{config.description}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {group.stats.totalSavings > 0 && (
              <div className="text-right hidden sm:block">
                <div className="text-sm font-semibold text-emerald-700">
                  ${group.stats.totalSavings.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500">potential savings</div>
              </div>
            )}
            
            {isExpanded ? (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </button>
        
        {isExpanded && (
          <div className="p-2 bg-white">
            {group.tasks.map(renderTask)}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <Card className="border-warm-100 shadow-soft">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary-500" />
                Smart Tasks
              </CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                AI-organized for maximum impact
              </p>
            </div>
            
            <Button 
              size="sm" 
              className="bg-gradient-to-r from-primary-500 to-primary-600"
              onClick={() => setShowAddTask(true)}
              disabled={!userId}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Loading State — skeleton list */}
          {loading && (
            <div className="space-y-3" aria-busy="true" aria-label="Loading tasks">
              {[0, 1, 2].map((g) => (
                <div key={g} className="border border-warm-100 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-8 h-8 rounded-lg" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-12 ml-auto" />
                  </div>
                  {[0, 1].map((i) => (
                    <div key={i} className="flex items-center gap-3 pl-2">
                      <Skeleton className="w-4 h-4 rounded" />
                      <Skeleton className="h-4 flex-1" />
                      <Skeleton className="h-5 w-16" />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-700 mb-2">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">Failed to load tasks</span>
              </div>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Not Logged In State */}
          {!loading && !userId && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Sign in to see your tasks</h3>
              <p className="text-sm text-gray-500">
                Log in to view and manage your personalized task list
              </p>
            </div>
          )}

          {/* Main Content */}
          {!loading && !error && userId && tasks.length > 0 && (
            <>
              {/* Progress Section */}
              <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Trophy className="w-5 h-5 text-amber-500" />
                      <span className="font-semibold text-gray-900">{motivationalMessage}</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {stats.completed} of {stats.total} tasks completed
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-primary-700">
                      {Math.round(stats.percentage)}%
                    </div>
                  </div>
                </div>
                
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-500"
                    style={{ width: `${stats.percentage}%` }}
                  />
                </div>
                
                {stats.totalPotentialSavings > 0 && (
                  <div className="mt-4 flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 rounded-lg p-3">
                    <DollarSign className="w-4 h-4" />
                    <span>
                      Complete remaining tasks to save up to{' '}
                      <strong>${stats.totalPotentialSavings.toLocaleString()}</strong>
                    </span>
                  </div>
                )}
              </div>
              
              {/* Smart Recommendation */}
              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <Sparkles className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-800">{smartRecommendation}</p>
              </div>
              
              {/* Task Categories - Only Active Tasks */}
              <div className="space-y-3">
                {['urgent', 'quick-wins', 'financial-impact', 'this-week', 'planning', 'later'].map((key) => {
                  // Filter out completed tasks from each category
                  const config = CATEGORY_CONFIG[key as keyof typeof CATEGORY_CONFIG];
                  if (!config) return null;
                  
                  const group = groupedTasks[key];
                  if (!group) return null;
                  
                  // Only show non-completed tasks
                  const activeTasksInCategory = group.tasks.filter((t: Task) => t.status !== 'completed');
                  if (activeTasksInCategory.length === 0) return null;
                  
                  // Create a modified group with only active tasks
                  const activeGroup = {
                    ...group,
                    tasks: activeTasksInCategory,
                    stats: {
                      ...group.stats,
                      completed: activeTasksInCategory.filter((t: Task) => t.status === 'completed').length,
                      total: activeTasksInCategory.length
                    }
                  };
                  
                  // Temporarily override the group for rendering
                  const originalGroup = groupedTasks[key];
                  groupedTasks[key] = activeGroup;
                  const result = renderCategory(key);
                  groupedTasks[key] = originalGroup;
                  
                  return result;
                })}
              </div>
              
              {/* Completed Tasks Section */}
              {completedTasks.length > 0 && (
                <div className="border border-gray-200 rounded-xl overflow-hidden mt-6">
                  <button
                    onClick={() => toggleCategory('completed')}
                    className="w-full flex items-center justify-between p-4 transition-all bg-gray-50 hover:bg-gray-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-white shadow-soft">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">Completed Tasks</h3>
                          <Badge variant="secondary" className="text-xs">
                            {completedTasks.length}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600">
                          {completedTasks.length} task{completedTasks.length !== 1 ? 's' : ''} finished
                        </p>
                      </div>
                    </div>
                    
                    {expandedCategories.includes('completed') ? (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                  
                  {expandedCategories.includes('completed') && (
                    <div className="p-2 bg-white border-t border-gray-100">
                      {completedTasks.map((task) => (
                        <div
                          key={task.id}
                          ref={(el) => { taskRefs.current[task.id] = el; }}
                          data-task-id={task.id}
                          onClick={() => openTaskDetail(task)}
                          className={cn(
                            "group flex items-start gap-3 p-3 rounded-lg transition-all cursor-pointer hover:bg-gray-50 opacity-70",
                            highlightedTaskId === task.id && "bg-amber-50 ring-2 ring-amber-400 shadow-md opacity-100"
                          )}
                        >
                          <div onClick={(e) => e.stopPropagation()}>
                            <Checkbox
                              checked={true}
                              onCheckedChange={() => toggleTask(task.id)}
                              className="mt-1 pointer-events-auto"
                            />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="font-medium text-sm line-through text-gray-500">
                                {task.title}
                              </div>
                              
                              <ExternalLink className="w-3 h-3 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            
                            {task.description && (
                              <p className="text-xs text-gray-400 mt-1 line-clamp-2">{task.description}</p>
                            )}
                            
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs text-emerald-600 font-medium">
                                ✓ Completed
                              </span>
                              {task.completion_date && (
                                <span className="text-xs text-gray-400">
                                  on {new Date(task.completion_date).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
          
          {/* Empty State */}
          {!loading && !error && userId && tasks.length === 0 && (
            <div className="text-center py-12 px-4 bg-primary-50/30 rounded-xl border-2 border-dashed border-primary-200">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-soft">
                <Sparkles className="w-8 h-8 text-primary-500" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Welcome to your task hub!</h3>
              <p className="text-sm text-gray-600 mb-1 max-w-md mx-auto">
                We organize your prep tasks by urgency and impact so nothing falls through the cracks.
              </p>
              <p className="text-xs text-gray-500 mb-5">
                Common tasks: insurance enrollment, SSN, 529 plan, W-4 updates, life insurance.
              </p>
              <Button 
                className="bg-gradient-to-r from-primary-500 to-primary-600 min-h-[44px]"
                onClick={() => setShowAddTask(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Task
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Task Modal */}
      <Dialog open={showAddTask} onOpenChange={setShowAddTask}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
            <DialogDescription>
              Create a personalized task for your baby planning
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="task-title">Title *</Label>
              <Input
                id="task-title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="e.g., Schedule pediatrician appointment"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="task-description">Description</Label>
              <Textarea
                id="task-description"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                placeholder="Additional details..."
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="task-category">Category</Label>
                <Select
                  value={newTask.category}
                  onValueChange={(value) => setNewTask({ ...newTask, category: value })}
                >
                  <SelectTrigger id="task-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="insurance">Insurance</SelectItem>
                    <SelectItem value="529">529 Plan</SelectItem>
                    <SelectItem value="tax">Tax</SelectItem>
                    <SelectItem value="legal">Legal</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="investment">Investment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="task-priority">Priority</Label>
                <Select
                  value={newTask.priority}
                  onValueChange={(value: any) => setNewTask({ ...newTask, priority: value })}
                >
                  <SelectTrigger id="task-priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="urgent">🔴 Urgent</SelectItem>
                    <SelectItem value="high">🟠 High</SelectItem>
                    <SelectItem value="medium">🟡 Medium</SelectItem>
                    <SelectItem value="low">🟢 Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="task-due-date">Due Date (optional)</Label>
              <Input
                id="task-due-date"
                type="date"
                value={newTask.due_date}
                onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
              />
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowAddTask(false)}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddTask}
              disabled={!newTask.title.trim() || isSubmitting}
              className="flex-1 bg-gradient-to-r from-primary-500 to-primary-600"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Task
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Task Detail Modal */}
      <Dialog open={taskDetailOpen} onOpenChange={setTaskDetailOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedTask && (
            <>
              <DialogHeader className="pb-4 border-b">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {selectedTask.category === 'insurance' && <Shield className="w-5 h-5 text-blue-500" />}
                      {selectedTask.category === '529' && <Wallet className="w-5 h-5 text-green-500" />}
                      {selectedTask.category === 'tax' && <Landmark className="w-5 h-5 text-purple-500" />}
                      {selectedTask.category === 'legal' && <FileText className="w-5 h-5 text-orange-500" />}
                      {selectedTask.category === 'benefit' && <Heart className="w-5 h-5 text-pink-500" />}
                      {(selectedTask.category === 'general' || !selectedTask.category) && <Info className="w-5 h-5 text-gray-500" />}
                      <Badge 
                        variant={
                          selectedTask.priority === 'urgent' ? 'destructive' : 
                          selectedTask.priority === 'high' ? 'default' :
                          selectedTask.priority === 'low' ? 'secondary' : 'outline'
                        }
                        className="text-xs"
                      >
                        {selectedTask.priority.charAt(0).toUpperCase() + selectedTask.priority.slice(1)}
                      </Badge>
                      <Badge variant="outline" className="text-xs capitalize">
                        {selectedTask.category || 'General'}
                      </Badge>
                    </div>
                    <DialogTitle className="text-xl">{selectedTask.title}</DialogTitle>
                    
                    {selectedTask.status === 'completed' ? (
                      <div className="flex items-center gap-2 text-sm text-emerald-600 mt-2">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Completed on {selectedTask.completion_date && new Date(selectedTask.completion_date).toLocaleDateString()}</span>
                      </div>
                    ) : selectedTask.due_date && (
                      <div className={cn(
                        "flex items-center gap-2 text-sm mt-2",
                        new Date(selectedTask.due_date) < new Date() ? "text-red-600" : "text-gray-500"
                      )}>
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(selectedTask.due_date) < new Date() 
                            ? `Overdue by ${Math.ceil((new Date().getTime() - new Date(selectedTask.due_date).getTime()) / (1000 * 60 * 60 * 24))} days` 
                            : `Due ${new Date(selectedTask.due_date).toLocaleDateString()}`}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <Checkbox
                    checked={selectedTask.status === 'completed'}
                    onCheckedChange={() => {
                      toggleTask(selectedTask.id);
                      setSelectedTask({ ...selectedTask, status: selectedTask.status === 'completed' ? 'pending' : 'completed' });
                    }}
                    className="w-6 h-6 mt-1"
                  />
                </div>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Description Section */}
                {selectedTask.description && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-400" />
                      Description
                    </Label>
                    <p className="text-sm text-gray-600 leading-relaxed">{selectedTask.description}</p>
                  </div>
                )}

                {/* How to Complete Section */}
                <div className="space-y-3 bg-blue-50 rounded-xl p-4">
                  <Label className="text-sm font-semibold text-blue-900 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" />
                    How to Complete This Task
                  </Label>
                  
                  {(() => {
                    const guidance = getTaskGuidance(selectedTask);
                    return (
                      <div className="space-y-4">
                        <ol className="space-y-2 list-decimal list-inside">
                          {guidance.steps.map((step, index) => (
                            <li key={index} className="text-sm text-blue-800 leading-relaxed">{step}</li>
                          ))}
                        </ol>
                        
                        {guidance.resources.length > 0 && (
                          <div className="pt-3 border-t border-blue-200">
                            <p className="text-xs font-medium text-blue-700 mb-2">Helpful Resources:</p>
                            <div className="flex flex-wrap gap-2">
                              {guidance.resources.map((resource, index) => (
                                <a
                                  key={index}
                                  href={resource.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 hover:underline bg-blue-100 px-2 py-1 rounded-full transition-colors"
                                >
                                  {resource.label}
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* Task Metadata */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl">
                  <div>
                    <span className="text-xs text-gray-500 block mb-1">Category</span>
                    <span className="text-sm font-medium capitalize">{selectedTask.category || 'General'}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block mb-1">Priority</span>
                    <span className={cn(
                      "text-sm font-medium capitalize",
                      selectedTask.priority === 'urgent' && "text-red-600",
                      selectedTask.priority === 'high' && "text-orange-600",
                      selectedTask.priority === 'medium' && "text-yellow-600",
                      selectedTask.priority === 'low' && "text-green-600"
                    )}>
                      {selectedTask.priority}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block mb-1">Status</span>
                    <span className={cn(
                      "text-sm font-medium capitalize",
                      selectedTask.status === 'completed' && "text-emerald-600",
                      selectedTask.status === 'pending' && "text-amber-600",
                      selectedTask.status === 'in_progress' && "text-blue-600"
                    )}>
                      {selectedTask.status.replace('_', ' ')}
                    </span>
                  </div>
                  {selectedTask.completion_date && (
                    <div>
                      <span className="text-xs text-gray-500 block mb-1">Completed</span>
                      <span className="text-sm font-medium">{new Date(selectedTask.completion_date).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setTaskDetailOpen(false);
                    setSelectedTask(null);
                  }}
                  className="flex-1"
                >
                  Close
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => {
                    // TODO: Open edit modal in future
                    alert('Edit functionality coming soon!');
                  }}
                  className="flex-1"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                
                <Button
                  variant="danger"
                  onClick={() => handleDeleteTask(selectedTask.id)}
                  className="flex-1"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
