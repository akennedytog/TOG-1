'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  DollarSign,
  Edit3,
  ExternalLink,
  FileText,
  Heart,
  Info,
  Landmark,
  Lightbulb,
  Loader2,
  Plus,
  Shield,
  Sparkles,
  Clock,
  Trophy,
  Wallet,
  Zap,
  Trash2,
} from 'lucide-react';

import { StaggerContainer, StaggerItem, ScrollReveal, GlassCard } from '@/app/providers';
import { useTaskActions, useTasks } from '@/hooks/useTasks';
import { groupTasksByCategory, getMotivationalMessage, getSmartRecommendation } from '@/lib/ai-task-categorizer';
import { getTaskGuidance } from '@/lib/task-guidance';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';

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
  selectedTaskId?: string | null;
  onTaskSelected?: () => void;
}

const PRIORITY_WEIGHTS: Record<string, number> = {
  urgent: 4,
  high: 3,
  medium: 2,
  low: 1,
};

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
] as const;

const CATEGORY_CONFIG = {
  urgent: {
    label: 'Urgent',
    icon: AlertCircle,
    color: 'red',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-200',
    textColor: 'text-rose-700',
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
    color: 'primary',
    bgColor: 'bg-primary-50',
    borderColor: 'border-primary-200',
    textColor: 'text-primary-700',
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
} as const;

const loadingContainerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const loadingItemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const EMPTY_NEW_TASK = {
  title: '',
  description: '',
  category: 'general',
  priority: 'medium' as Task['priority'],
  due_date: '',
};

function categoryIcon(category?: string) {
  switch (category) {
    case 'insurance':
      return <Shield className="w-5 h-5 text-primary-500" />;
    case '529':
      return <Wallet className="w-5 h-5 text-emerald-500" />;
    case 'tax':
      return <Landmark className="w-5 h-5 text-purple-500" />;
    case 'legal':
      return <FileText className="w-5 h-5 text-orange-500" />;
    case 'benefit':
      return <Heart className="w-5 h-5 text-pink-500" />;
    default:
      return <Info className="w-5 h-5 text-gray-500" />;
  }
}

export function SmartTaskManager({
  userId,
  state: _state,
  tasks: initialTasks,
  selectedTaskId,
  onTaskSelected,
}: SmartTaskManagerProps) {
  const { tasks: fetchedTasks, loading, error, refetch } = useTasks(userId);
  const { toggleTask, addTask, deleteTask, isSubmitting } = useTaskActions(userId);

  const tasks = initialTasks?.length ? initialTasks : fetchedTasks;
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['urgent', 'quick-wins', 'financial-impact']);
  const [highlightedTaskId, setHighlightedTaskId] = useState<string | null>(null);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState(EMPTY_NEW_TASK);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskDetailOpen, setTaskDetailOpen] = useState(false);
  const [optimisticTasks, setOptimisticTasks] = useState<Record<string, Partial<Task>>>({});
  const taskRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const mergedTasks = useMemo(
    () => tasks.map((task) => ({ ...task, ...optimisticTasks[task.id] })),
    [tasks, optimisticTasks]
  );

  const groupedTasks = useMemo(() => groupTasksByCategory(mergedTasks), [mergedTasks]);

  const activeGroupedTasks = useMemo(() => {
    const entries = Object.entries(groupedTasks).map(([key, group]) => {
      const active = group.tasks.filter((task: Task) => task.status !== 'completed');
      const savings = active.reduce((sum: number, task: any) => sum + (task.aiCategory?.potentialSavings || 0), 0);
      return [key, { ...group, tasks: active, stats: { ...group.stats, count: active.length, totalSavings: savings } }];
    });
    return Object.fromEntries(entries);
  }, [groupedTasks]);

  const completedTasks = useMemo(
    () => mergedTasks.filter((task) => task.status === 'completed'),
    [mergedTasks]
  );

  const stats = useMemo(() => {
    const completed = completedTasks.length;
    const total = mergedTasks.length;
    const totalPotentialSavings = Object.values(activeGroupedTasks).reduce(
      (sum: number, group: any) => sum + (group.stats.totalSavings || 0),
      0
    );
    return {
      completed,
      total,
      percentage: total > 0 ? (completed / total) * 100 : 0,
      totalPotentialSavings,
    };
  }, [activeGroupedTasks, completedTasks.length, mergedTasks.length]);

  const motivationalMessage = useMemo(
    () => getMotivationalMessage(stats.completed, stats.total),
    [stats.completed, stats.total]
  );

  const smartRecommendation = useMemo(
    () => getSmartRecommendation(mergedTasks),
    [mergedTasks]
  );

  useEffect(() => {
    setOptimisticTasks({});
  }, [tasks]);

  useEffect(() => {
    if (!selectedTaskId || loading || mergedTasks.length === 0) return;
    const task = mergedTasks.find((item) => item.id === selectedTaskId);
    if (!task) return;

    const categoryEntry = Object.entries(activeGroupedTasks).find(([, group]: [string, any]) =>
      group.tasks.some((candidate: Task) => candidate.id === selectedTaskId)
    );

    if (categoryEntry) {
      setExpandedCategories((prev) => (prev.includes(categoryEntry[0]) ? prev : [...prev, categoryEntry[0]]));
    } else if (task.status === 'completed') {
      setExpandedCategories((prev) => (prev.includes('completed') ? prev : [...prev, 'completed']));
    }

    setHighlightedTaskId(selectedTaskId);
    const scrollTimer = window.setTimeout(() => {
      taskRefs.current[selectedTaskId]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
    const highlightTimer = window.setTimeout(() => {
      setHighlightedTaskId(null);
      onTaskSelected?.();
    }, 2400);

    return () => {
      window.clearTimeout(scrollTimer);
      window.clearTimeout(highlightTimer);
    };
  }, [selectedTaskId, loading, mergedTasks, activeGroupedTasks, onTaskSelected]);

  const toggleCategory = useCallback((category: string) => {
    setExpandedCategories((prev) =>
      prev.includes(category) ? prev.filter((item) => item !== category) : [...prev, category]
    );
  }, []);

  const openTaskDetail = useCallback((task: Task) => {
    setSelectedTask(task);
    setTaskDetailOpen(true);
  }, []);

  const handleToggleTask = useCallback(
    async (task: Task) => {
      const nextStatus = task.status === 'completed' ? 'pending' : 'completed';
      const completion_date = nextStatus === 'completed' ? new Date().toISOString() : undefined;

      setOptimisticTasks((prev) => ({
        ...prev,
        [task.id]: { status: nextStatus, completion_date },
      }));
      if (selectedTask?.id === task.id) {
        setSelectedTask((prev) => (prev ? { ...prev, status: nextStatus, completion_date } : prev));
      }

      const result = await toggleTask(task.id, task.status);
      if (!result?.success) {
        setOptimisticTasks((prev) => ({
          ...prev,
          [task.id]: { status: task.status, completion_date: task.completion_date },
        }));
        if (selectedTask?.id === task.id) {
          setSelectedTask((prev) => (prev ? { ...prev, status: task.status, completion_date: task.completion_date } : prev));
        }
        window.alert('Failed to update task. Please try again.');
        return;
      }

      await refetch();
    },
    [refetch, selectedTask, toggleTask]
  );

  const handleAddTask = useCallback(async () => {
    if (!userId || !newTask.title.trim()) return;

    const result = await addTask({
      title: newTask.title.trim(),
      description: newTask.description.trim() || undefined,
      category: newTask.category,
      priority: newTask.priority,
      due_date: newTask.due_date || undefined,
      status: 'pending',
      priority_weight: PRIORITY_WEIGHTS[newTask.priority] || 2,
      completion_date: undefined,
    });

    if (!result?.success) {
      window.alert('Failed to add task. Please try again.');
      return;
    }

    setNewTask(EMPTY_NEW_TASK);
    setShowAddTask(false);
    await refetch();
  }, [addTask, newTask, refetch, userId]);

  const handleDeleteTask = useCallback(
    async (taskId: string) => {
      if (!userId || !window.confirm('Are you sure you want to delete this task?')) return;
      const result = await deleteTask(taskId);
      if (!result?.success) {
        window.alert('Failed to delete task. Please try again.');
        return;
      }
      setTaskDetailOpen(false);
      setSelectedTask(null);
      await refetch();
    },
    [deleteTask, refetch, userId]
  );

  const renderTask = useCallback(
    (task: Task & { aiCategory?: any }) => {
      const isCompleted = task.status === 'completed';
      const isHighlighted = highlightedTaskId === task.id;

      return (
        <div
          key={task.id}
          ref={(el) => {
            taskRefs.current[task.id] = el;
          }}
          data-task-id={task.id}
          onClick={() => openTaskDetail(task)}
          className={cn(
            'group flex items-start gap-3 rounded-lg p-3 transition-all duration-500 cursor-pointer',
            'hover:bg-white hover:shadow-soft hover:scale-[1.01]',
            isCompleted && 'opacity-60',
            isHighlighted && 'bg-amber-50 ring-2 ring-amber-400 shadow-md'
          )}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <Checkbox checked={isCompleted} onCheckedChange={() => handleToggleTask(task)} className="mt-1 pointer-events-auto" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className={cn('text-sm font-medium transition-all', isCompleted ? 'line-through text-gray-500' : 'text-gray-900')}>
                {task.title}
              </div>
              {task.aiCategory?.potentialSavings > 0 && (
                <Badge variant="outline" className="shrink-0 border-emerald-200 bg-emerald-50 text-xs text-emerald-700">
                  Save ${task.aiCategory.potentialSavings.toLocaleString()}
                </Badge>
              )}
            </div>

            {task.description && <p className="mt-1 line-clamp-2 text-xs text-gray-500">{task.description}</p>}

            <div className="mt-2 flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {task.aiCategory?.estimatedMinutes} min
              </Badge>
              {task.due_date && (
                <span className={cn('text-xs', new Date(task.due_date) < new Date() ? 'font-medium text-rose-600' : 'text-gray-500')}>
                  {new Date(task.due_date) < new Date() ? 'Overdue' : `Due ${new Date(task.due_date).toLocaleDateString()}`}
                </span>
              )}
              {task.aiCategory?.reason && <span className="text-xs italic text-gray-400">{task.aiCategory.reason}</span>}
              <ExternalLink className="ml-auto h-3 w-3 text-gray-300 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
            </div>
          </div>
        </div>
      );
    },
    [handleToggleTask, highlightedTaskId, openTaskDetail]
  );

  const renderCategory = useCallback(
    (categoryKey: string) => {
      const config = CATEGORY_CONFIG[categoryKey as keyof typeof CATEGORY_CONFIG];
      const group = activeGroupedTasks[categoryKey as keyof typeof activeGroupedTasks] as any;
      if (!config || !group || group.tasks.length === 0) return null;

      const Icon = config.icon;
      const isExpanded = expandedCategories.includes(categoryKey);

      return (
        <GlassCard className="border-0 shadow-none" hover={false}>
          <div className="overflow-hidden rounded-xl border border-gray-200">
            <button
              onClick={() => toggleCategory(categoryKey)}
              className={cn('w-full flex items-center justify-between p-4 transition-all hover:shadow-soft', config.bgColor)}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-soft">
                  <Icon className={cn('h-5 w-5', config.textColor)} />
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
                  <div className="hidden text-right sm:block">
                    <div className="text-sm font-semibold text-emerald-700">${group.stats.totalSavings.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">potential savings</div>
                  </div>
                )}
                {isExpanded ? <ChevronDown className="h-5 w-5 text-gray-400" /> : <ChevronRight className="h-5 w-5 text-gray-400" />}
              </div>
            </button>

            {isExpanded && (
              <StaggerContainer className="bg-white p-2">
                {group.tasks.map((task: Task & { aiCategory?: any }) => (
                  <StaggerItem key={task.id}>{renderTask(task)}</StaggerItem>
                ))}
              </StaggerContainer>
            )}
          </div>
        </GlassCard>
      );
    },
    [activeGroupedTasks, expandedCategories, renderTask, toggleCategory]
  );

  const selectedTaskView = selectedTask
    ? mergedTasks.find((task) => task.id === selectedTask.id) ?? selectedTask
    : null;

  return (
    <>
      <Card className="border-warm-100 shadow-soft">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Sparkles className="h-5 w-5 text-primary-500" />
                Smart Tasks
              </CardTitle>
              <p className="mt-1 text-sm text-gray-500">AI-organized for maximum impact</p>
            </div>
            <Button
              size="sm"
              className="bg-gradient-to-r from-primary-500 to-primary-600"
              onClick={() => setShowAddTask(true)}
              disabled={!userId}
              aria-label="Add a new task"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Task
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {loading && (
            <motion.div className="space-y-3" aria-busy="true" aria-label="Loading tasks" variants={loadingContainerVariants} initial="hidden" animate="visible">
              {[0, 1, 2].map((group) => (
                <motion.div key={group} variants={loadingItemVariants} className="space-y-3 rounded-xl border border-warm-100 bg-white/50 p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-lg" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="ml-auto h-4 w-12" />
                  </div>
                  {[0, 1].map((item) => (
                    <div key={item} className="flex items-center gap-3 pl-2">
                      <Skeleton className="h-4 w-4 rounded" />
                      <Skeleton className="h-4 flex-1" />
                      <Skeleton className="h-5 w-16" />
                    </div>
                  ))}
                </motion.div>
              ))}
            </motion.div>
          )}

          {!loading && error && (
            <ScrollReveal>
              <GlassCard className="border-rose-200 p-4">
                <div className="mb-2 flex items-center gap-2 text-rose-700">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-medium">Failed to load tasks</span>
                </div>
                <p className="text-sm text-rose-600">{error}</p>
              </GlassCard>
            </ScrollReveal>
          )}

          {!loading && !userId && (
            <ScrollReveal>
              <GlassCard className="py-12 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                  <CheckCircle2 className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="mb-2 font-semibold text-gray-900">Sign in to see your tasks</h3>
                <p className="text-sm text-gray-500">Log in to view and manage your personalized task list</p>
              </GlassCard>
            </ScrollReveal>
          )}

          {!loading && !error && userId && mergedTasks.length > 0 && (
            <>
              <ScrollReveal delay={0.1}>
                <GlassCard glow className="bg-gradient-to-br from-primary-50/90 to-primary-100/90 p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <div className="mb-1 flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-amber-500" />
                        <span className="font-semibold text-gray-900">{motivationalMessage}</span>
                      </div>
                      <p className="text-sm text-gray-600">{stats.completed} of {stats.total} tasks completed</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-primary-700">{Math.round(stats.percentage)}%</div>
                    </div>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                    <motion.div className="h-full rounded-full bg-gradient-to-r from-primary-500 to-primary-600" initial={{ width: 0 }} animate={{ width: `${stats.percentage}%` }} transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }} />
                  </div>

                  {stats.totalPotentialSavings > 0 && (
                    <div className="mt-4 flex items-center gap-2 rounded-lg bg-emerald-50/80 p-3 text-sm text-emerald-700">
                      <DollarSign className="h-4 w-4" />
                      <span>
                        Complete remaining tasks to save up to <strong>${stats.totalPotentialSavings.toLocaleString()}</strong>
                      </span>
                    </div>
                  )}
                </GlassCard>
              </ScrollReveal>

              <ScrollReveal delay={0.2}>
                <GlassCard className="flex items-start gap-3 border-primary-100 bg-primary-50/80 p-4">
                  <Sparkles className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary-500" />
                  <p className="text-sm text-primary-800">{smartRecommendation}</p>
                </GlassCard>
              </ScrollReveal>

              <StaggerContainer className="space-y-3">
                {['urgent', 'quick-wins', 'financial-impact', 'this-week', 'planning', 'later'].map((key, index) => (
                  <StaggerItem key={key}>
                    <ScrollReveal delay={index * 0.05}>{renderCategory(key)}</ScrollReveal>
                  </StaggerItem>
                ))}
              </StaggerContainer>

              {completedTasks.length > 0 && (
                <ScrollReveal delay={0.3}>
                  <GlassCard className="mt-6 overflow-hidden" hover={false}>
                    <button onClick={() => toggleCategory('completed')} className="w-full flex items-center justify-between bg-gray-50/80 p-4 transition-all hover:bg-gray-100/80">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-soft">
                          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900">Completed Tasks</h3>
                            <Badge variant="secondary" className="text-xs">{completedTasks.length}</Badge>
                          </div>
                          <p className="text-xs text-gray-600">{completedTasks.length} task{completedTasks.length !== 1 ? 's' : ''} finished</p>
                        </div>
                      </div>
                      {expandedCategories.includes('completed') ? <ChevronDown className="h-5 w-5 text-gray-400" /> : <ChevronRight className="h-5 w-5 text-gray-400" />}
                    </button>

                    {expandedCategories.includes('completed') && (
                      <StaggerContainer className="border-t border-gray-100 bg-white p-2">
                        {completedTasks.map((task) => (
                          <StaggerItem key={task.id}>{renderTask(task as Task & { aiCategory?: any })}</StaggerItem>
                        ))}
                      </StaggerContainer>
                    )}
                  </GlassCard>
                </ScrollReveal>
              )}
            </>
          )}

          {!loading && !error && userId && mergedTasks.length === 0 && (
            <ScrollReveal>
              <GlassCard className="border-2 border-dashed border-primary-200 bg-primary-50/30 px-4 py-12 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-soft">
                  <Sparkles className="h-8 w-8 text-primary-500" />
                </div>
                <h3 className="mb-2 font-semibold text-gray-900">Welcome to your task hub!</h3>
                <p className="mx-auto mb-1 max-w-md text-sm text-gray-600">We organize your prep tasks by urgency and impact so nothing falls through the cracks.</p>
                <p className="mb-5 text-xs text-gray-500">Common tasks: insurance enrollment, SSN, 529 plan, W-4 updates, life insurance.</p>
                <Button className="min-h-[44px] bg-gradient-to-r from-primary-500 to-primary-600" onClick={() => setShowAddTask(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Task
                </Button>
              </GlassCard>
            </ScrollReveal>
          )}
        </CardContent>
      </Card>

      <Dialog open={showAddTask} onOpenChange={setShowAddTask}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
            <DialogDescription>Create a personalized task for your baby planning</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="task-title">Title *</Label>
              <Input id="task-title" value={newTask.title} onChange={(e) => setNewTask((prev) => ({ ...prev, title: e.target.value }))} placeholder="e.g., Schedule pediatrician appointment" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-description">Description</Label>
              <Textarea id="task-description" value={newTask.description} onChange={(e) => setNewTask((prev) => ({ ...prev, description: e.target.value }))} placeholder="Additional details..." rows={3} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="task-category">Category</Label>
                <Select value={newTask.category} onValueChange={(value) => setNewTask((prev) => ({ ...prev, category: value }))}>
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
                <Select value={newTask.priority} onValueChange={(value: Task['priority']) => setNewTask((prev) => ({ ...prev, priority: value }))}>
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
              <Input id="task-due-date" type="date" value={newTask.due_date} onChange={(e) => setNewTask((prev) => ({ ...prev, due_date: e.target.value }))} />
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowAddTask(false)} className="flex-1" disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleAddTask} disabled={!newTask.title.trim() || isSubmitting} className="flex-1 bg-gradient-to-r from-primary-500 to-primary-600">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Task
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={taskDetailOpen} onOpenChange={setTaskDetailOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          {selectedTaskView && (
            <>
              <DialogHeader className="border-b pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      {categoryIcon(selectedTaskView.category)}
                      <Badge
                        variant={
                          selectedTaskView.priority === 'urgent'
                            ? 'destructive'
                            : selectedTaskView.priority === 'high'
                              ? 'default'
                              : selectedTaskView.priority === 'low'
                                ? 'secondary'
                                : 'outline'
                        }
                        className="text-xs"
                      >
                        {selectedTaskView.priority.charAt(0).toUpperCase() + selectedTaskView.priority.slice(1)}
                      </Badge>
                      <Badge variant="outline" className="text-xs capitalize">{selectedTaskView.category || 'General'}</Badge>
                    </div>
                    <DialogTitle className="text-xl">{selectedTaskView.title}</DialogTitle>

                    {selectedTaskView.status === 'completed' ? (
                      <div className="mt-2 flex items-center gap-2 text-sm text-emerald-600">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Completed on {selectedTaskView.completion_date && new Date(selectedTaskView.completion_date).toLocaleDateString()}</span>
                      </div>
                    ) : selectedTaskView.due_date ? (
                      <div className={cn('mt-2 flex items-center gap-2 text-sm', new Date(selectedTaskView.due_date) < new Date() ? 'text-rose-600' : 'text-gray-500')}>
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(selectedTaskView.due_date) < new Date()
                            ? `Overdue by ${Math.ceil((Date.now() - new Date(selectedTaskView.due_date).getTime()) / (1000 * 60 * 60 * 24))} days`
                            : `Due ${new Date(selectedTaskView.due_date).toLocaleDateString()}`}
                        </span>
                      </div>
                    ) : null}
                  </div>

                  <Checkbox checked={selectedTaskView.status === 'completed'} onCheckedChange={() => handleToggleTask(selectedTaskView)} className="mt-1 h-6 w-6" />
                </div>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {selectedTaskView.description && (
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <FileText className="h-4 w-4 text-gray-400" />
                      Description
                    </Label>
                    <p className="text-sm leading-relaxed text-gray-600">{selectedTaskView.description}</p>
                  </div>
                )}

                <div className="space-y-3 rounded-xl bg-primary-50 p-4">
                  <Label className="flex items-center gap-2 text-sm font-semibold text-primary-900">
                    <Lightbulb className="h-4 w-4" />
                    How to Complete This Task
                  </Label>

                  {(() => {
                    const guidance = getTaskGuidance(selectedTaskView);
                    return (
                      <div className="space-y-4">
                        <ol className="list-inside list-decimal space-y-2">
                          {guidance.steps.map((step, index) => (
                            <li key={index} className="text-sm leading-relaxed text-primary-800">{step}</li>
                          ))}
                        </ol>

                        {guidance.resources.length > 0 && (
                          <div className="border-t border-primary-200 pt-3">
                            <p className="mb-2 text-xs font-medium text-primary-700">Helpful Resources:</p>
                            <div className="flex flex-wrap gap-2">
                              {guidance.resources.map((resource, index) => (
                                <a key={index} href={resource.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-full bg-primary-100 px-2 py-1 text-xs text-primary-600 transition-colors hover:text-primary-800 hover:underline">
                                  {resource.label}
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>

                <div className="grid grid-cols-2 gap-4 rounded-xl bg-gray-50 p-4">
                  <div>
                    <span className="mb-1 block text-xs text-gray-500">Category</span>
                    <span className="text-sm font-medium capitalize">{selectedTaskView.category || 'General'}</span>
                  </div>
                  <div>
                    <span className="mb-1 block text-xs text-gray-500">Priority</span>
                    <span className={cn('text-sm font-medium capitalize', selectedTaskView.priority === 'urgent' && 'text-rose-600', selectedTaskView.priority === 'high' && 'text-orange-600', selectedTaskView.priority === 'medium' && 'text-yellow-600', selectedTaskView.priority === 'low' && 'text-emerald-600')}>
                      {selectedTaskView.priority}
                    </span>
                  </div>
                  <div>
                    <span className="mb-1 block text-xs text-gray-500">Status</span>
                    <span className={cn('text-sm font-medium capitalize', selectedTaskView.status === 'completed' && 'text-emerald-600', selectedTaskView.status === 'pending' && 'text-amber-600', selectedTaskView.status === 'in_progress' && 'text-primary-600')}>
                      {selectedTaskView.status.replace('_', ' ')}
                    </span>
                  </div>
                  {selectedTaskView.completion_date && (
                    <div>
                      <span className="mb-1 block text-xs text-gray-500">Completed</span>
                      <span className="text-sm font-medium">{new Date(selectedTaskView.completion_date).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 border-t pt-4">
                <Button variant="outline" onClick={() => { setTaskDetailOpen(false); setSelectedTask(null); }} className="flex-1">
                  Close
                </Button>
                <Button variant="outline" onClick={() => window.alert('Edit functionality coming soon!')} className="flex-1">
                  <Edit3 className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button variant="danger" onClick={() => handleDeleteTask(selectedTaskView.id)} className="flex-1">
                  <Trash2 className="mr-2 h-4 w-4" />
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
