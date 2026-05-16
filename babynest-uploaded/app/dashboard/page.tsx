'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Chat } from '@/components/Chat';
import { InsuranceDocumentAnalyzer } from '@/components/InsuranceDocumentAnalyzer';
import { HospitalBagPlanner } from '@/components/HospitalBagPlanner';
import { PregnancyTracker } from '@/components/PregnancyTracker';
import { VaccinationTracker } from '@/components/VaccinationTracker';
import { BirthPlanBuilder } from '@/components/BirthPlanBuilder';
import { SavingsGoals } from '@/components/SavingsGoals';
import { BabyCostCalculator } from '@/components/BabyCostCalculator';
import { BudgetTracker } from '@/components/BudgetTracker';
import { RegistryTracker } from '@/components/RegistryTracker';
import { supabase, getProfile, Profile } from '@/lib/supabase';
import { Skeleton } from '@/components/ui/skeleton';
import { hasCompletedOnboarding } from '@/lib/onboarding';
import { cn } from '@/lib/utils';
import { 
  Calendar,
  CalendarRange,
  Baby,
  Backpack,
  Syringe,
  Heart,
  FileText,
  Shield,
  ShieldCheck,
  Wallet,
  Clock,
  PiggyBank,
  Calculator,
  Receipt,
  Users,
  ChevronRight,
  ArrowRight,
  Gift,
  MessageCircle,
  Sparkles,
  Target,
  AlertCircle,
  CheckCircle2,
  Zap,
  Plus,
  Activity,
  X,
} from 'lucide-react';

// Import Task Components
import { SmartTaskManager } from '@/components/SmartTaskManager';

interface UrgentTask {
  id: string;
  title: string;
  dueDate?: string;
  priority: 'urgent' | 'high' | 'medium';
}

interface StageRecommendation {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  tab: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tasks');
  const [planningOpen, setPlanningOpen] = useState(false);
  const [trackingOpen, setTrackingOpen] = useState(false);
  const [financeOpen, setFinanceOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [completedVaccines, setCompletedVaccines] = useState<string[]>([]);
  const [urgentTasks, setUrgentTasks] = useState<UrgentTask[]>([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  
  // Real stats from Supabase
  const [savingsStats, setSavingsStats] = useState<{ totalSaved: number; totalTarget: number; goalCount: number } | null>(null);
  const [budgetStats, setBudgetStats] = useState<{ spent: number; budget: number; expenseCount: number } | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  
  // Selected task for scrolling
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/auth/signin');
        return;
      }

      setUser(user);

      // Check onboarding
      const completed = await hasCompletedOnboarding(user.id);
      if (!completed) {
        router.push('/onboarding');
        return;
      }

      // Get profile
      const profileData = await getProfile(user.id);
      if (profileData?.profile) {
        setProfile(profileData.profile);
      } else {
        setProfile(null);
      }

      setLoading(false);
    };

    checkUser();
  }, [router]);

  // Hydrate completed vaccines from localStorage on mount (client-only)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem('completedVaccines');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setCompletedVaccines(parsed.filter((id): id is string => typeof id === 'string'));
        }
      }
    } catch {
      /* ignore corrupt localStorage */
    }
  }, []);

  // Persist completed vaccines whenever they change
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem('completedVaccines', JSON.stringify(completedVaccines));
    } catch {
      /* localStorage full or disabled */
    }
  }, [completedVaccines]);

  // Pull real urgent/high-priority tasks from Supabase (no more hard-coded sample)
  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    (async () => {
      setTasksLoading(true);
      try {
        const { data, error } = await supabase
          .from('tasks')
          .select('id, title, due_date, priority, status')
          .eq('user_id', user.id)
          .in('priority', ['urgent', 'high'])
          .neq('status', 'completed')
          .order('priority_weight', { ascending: false })
          .order('due_date', { ascending: true, nullsFirst: false })
          .limit(4);
        if (cancelled) return;
        if (error) {
          console.error('Failed to load urgent tasks:', error);
          setUrgentTasks([]);
        } else {
          const now = Date.now();
          const mapped: UrgentTask[] = (data || []).map((t: any) => {
            let dueLabel: string | undefined;
            if (t.due_date) {
              const diffDays = Math.ceil(
                (new Date(t.due_date).getTime() - now) / (1000 * 60 * 60 * 24)
              );
              if (diffDays < 0) dueLabel = `${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? '' : 's'} overdue`;
              else if (diffDays === 0) dueLabel = 'today';
              else if (diffDays === 1) dueLabel = '1 day';
              else if (diffDays < 7) dueLabel = `${diffDays} days`;
              else if (diffDays < 14) dueLabel = '1 week';
              else dueLabel = `${Math.ceil(diffDays / 7)} weeks`;
            }
            return {
              id: t.id,
              title: t.title,
              dueDate: dueLabel,
              priority: (t.priority === 'urgent' ? 'urgent' : t.priority === 'high' ? 'high' : 'medium') as UrgentTask['priority'],
            };
          });
          setUrgentTasks(mapped);
        }
      } catch (err) {
        console.error('Urgent tasks fetch error:', err);
        if (!cancelled) setUrgentTasks([]);
      } finally {
        if (!cancelled) setTasksLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user?.id]);

  // Fetch real savings + budget stats
  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    (async () => {
      setStatsLoading(true);
      try {
        // Savings goals
        const { data: goals } = await supabase
          .from('savings_goals')
          .select('current_amount, target_amount')
          .eq('user_id', user.id) as { data: { current_amount: number; target_amount: number }[] | null };
        
        if (!cancelled) {
          if (goals && goals.length > 0) {
            const totalSaved = goals.reduce((sum: number, g: any) => sum + (Number(g.current_amount) || 0), 0);
            const totalTarget = goals.reduce((sum: number, g: any) => sum + (Number(g.target_amount) || 0), 0);
            setSavingsStats({ totalSaved, totalTarget, goalCount: goals.length });
          } else {
            setSavingsStats({ totalSaved: 0, totalTarget: 0, goalCount: 0 });
          }
        }
        
        // Budget settings + current month expenses
        const { data: budgetSettings } = await supabase
          .from('budget_settings')
          .select('monthly_budget')
          .eq('user_id', user.id)
          .maybeSingle() as { data: { monthly_budget: number | null } | null };
        
        const now = new Date();
        const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        
        const { data: expenses } = await supabase
          .from('expenses')
          .select('amount')
          .eq('user_id', user.id)
          .gte('date', firstOfMonth) as { data: { amount: number }[] | null };
        
        if (!cancelled) {
          const spent = (expenses || []).reduce((sum: number, e: any) => sum + (Number(e.amount) || 0), 0);
          const budget = Number(budgetSettings?.monthly_budget) || 0;
          setBudgetStats({ spent, budget, expenseCount: (expenses || []).length });
        }
      } catch (err) {
        console.error('Stats fetch error:', err);
        if (!cancelled) {
          setSavingsStats({ totalSaved: 0, totalTarget: 0, goalCount: 0 });
          setBudgetStats({ spent: 0, budget: 0, expenseCount: 0 });
        }
      } finally {
        if (!cancelled) setStatsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user?.id]);

  // Calculate pregnancy stats
  const weeksPregnant = profile?.due_date 
    ? Math.max(0, 40 - Math.ceil((new Date(profile.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 7)))
    : null;
  
  const trimester = weeksPregnant 
    ? weeksPregnant <= 12 ? 1 : weeksPregnant <= 27 ? 2 : 3
    : null;

  // Calculate days until due date
  const daysUntilDue = profile?.due_date 
    ? Math.ceil((new Date(profile.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  // Get stage-based recommendations
  const getStageRecommendations = (weeks: number | null): StageRecommendation[] => {
    if (!weeks) return [];
    
    if (weeks <= 12) {
      return [
        { title: 'Schedule first prenatal visit', icon: Activity, tab: 'tasks' },
        { title: 'Research insurance coverage', icon: Shield, tab: 'insurance' },
        { title: 'Start savings goals', icon: PiggyBank, tab: 'savings' },
      ];
    } else if (weeks <= 27) {
      return [
        { title: 'Review insurance coverage', icon: Shield, tab: 'insurance' },
        { title: 'Set up nursery savings plan', icon: PiggyBank, tab: 'savings' },
        { title: 'Calculate costs', icon: Calculator, tab: 'costcalc' },
      ];
    } else if (weeks <= 36) {
      return [
        { title: 'Pack hospital bag', icon: Backpack, tab: 'bag' },
        { title: 'Finalize birth plan', icon: FileText, tab: 'birthplan' },
        { title: 'Set up budget tracker', icon: Receipt, tab: 'budget' },
      ];
    } else {
      return [
        { title: 'Final birth plan check', icon: FileText, tab: 'birthplan' },
        { title: 'Prep hospital bag', icon: Backpack, tab: 'bag' },
        { title: 'Review all tasks', icon: CheckCircle2, tab: 'tasks' },
      ];
    }
  };

  const stageRecommendations = getStageRecommendations(weeksPregnant);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-warm-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Today Card - Personalized command center */}
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-primary-500 to-primary-600 text-white border-none shadow-glow overflow-hidden">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm flex-shrink-0">
                    {weeksPregnant ? (
                      <div className="text-center">
                        <div className="text-xs font-medium text-primary-100 leading-none">WEEK</div>
                        <div className="text-xl font-bold leading-tight">{weeksPregnant}</div>
                      </div>
                    ) : (
                      <Heart className="w-7 h-7" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-2xl font-bold mb-1">
                      {(() => {
                        const hour = new Date().getHours();
                        const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
                        const name = profile?.full_name ? profile.full_name.split(' ')[0] : '';
                        return name ? `${greeting}, ${name}` : greeting;
                      })()}
                    </h2>
                    <p className="text-primary-100 text-sm">
                      {weeksPregnant && daysUntilDue !== null
                        ? `${daysUntilDue > 0 ? `${daysUntilDue} days until your due date` : 'Your due date is here!'} · Trimester ${trimester}`
                        : profile?.due_date
                          ? 'Welcome to your pregnancy companion'
                          : 'Add your due date to personalize your dashboard'}
                    </p>
                  </div>
                </div>
                
                {/* Quick action based on context */}
                {urgentTasks.length > 0 ? (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setActiveTab('tasks');
                      setSelectedTaskId(urgentTasks[0].id);
                    }}
                    className="bg-white/15 text-white hover:bg-white/25 border border-white/20 backdrop-blur-sm whitespace-nowrap min-h-[44px]"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Top task: {urgentTasks[0].title.slice(0, 30)}{urgentTasks[0].title.length > 30 ? '…' : ''}
                  </Button>
                ) : !profile?.due_date ? (
                  <Button
                    variant="secondary"
                    onClick={() => router.push('/settings/family')}
                    className="bg-white/15 text-white hover:bg-white/25 border border-white/20 min-h-[44px]"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Add due date
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    onClick={() => setActiveTab('tasks')}
                    className="bg-white/15 text-white hover:bg-white/25 border border-white/20 min-h-[44px]"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    All caught up · View tasks
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Today Priority Summary */}
        <div className="mb-8 space-y-6">
          {/* Urgent Tasks Section — real data from SmartTaskManager backing store */}
          {tasksLoading ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-300" />
                <Skeleton className="h-5 w-32" />
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                {[0, 1].map((i) => (
                  <Card key={i} className="border-l-4 border-l-rose-200 border-warm-100 shadow-soft">
                    <CardContent className="p-4 flex items-center gap-3">
                      <Skeleton className="w-10 h-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/3" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : urgentTasks.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-500" />
                <h3 className="font-semibold text-warm-900">Urgent Tasks</h3>
                <Badge variant="secondary" className="bg-rose-100 text-rose-700">
                  {urgentTasks.length}
                </Badge>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                {urgentTasks.map((task) => (
                  <Card 
                    key={task.id} 
                    className={cn(
                      "border-l-4 border-warm-100 shadow-soft hover:shadow-md transition-shadow cursor-pointer",
                      task.priority === 'urgent' ? 'border-l-rose-500' : 'border-l-amber-500'
                    )}
                    onClick={() => {
                      setActiveTab('tasks');
                      setSelectedTaskId(task.id);
                    }}
                  >
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center",
                        task.priority === 'urgent' ? 'bg-rose-50' : 'bg-amber-50'
                      )}>
                        <Zap className={cn(
                          "w-5 h-5",
                          task.priority === 'urgent' ? 'text-rose-500' : 'text-amber-500'
                        )} />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-warm-900">{task.title}</p>
                        {task.dueDate && (
                          <p className={cn(
                            "text-sm",
                            task.priority === 'urgent' ? 'text-rose-600' : 'text-amber-600'
                          )}>Due in {task.dueDate}</p>
                        )}
                      </div>
                      <ChevronRight className="w-5 h-5 text-warm-400" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : null}

          {/* Quick Stats Row */}
          <div className="grid md:grid-cols-3 gap-4">
            {/* Savings Mini-Card */}
            <Card className="shadow-soft hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab('savings')}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                  <PiggyBank className="w-6 h-6 text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-warm-500">Savings Goals</p>
                  {statsLoading ? (
                    <Skeleton className="h-6 w-24 mt-1" />
                  ) : savingsStats && savingsStats.goalCount > 0 ? (
                    <>
                      <p className="font-bold text-lg text-warm-900">${savingsStats.totalSaved.toLocaleString()} saved</p>
                      <p className="text-xs text-warm-500">
                        of ${savingsStats.totalTarget.toLocaleString()} · {savingsStats.goalCount} goal{savingsStats.goalCount !== 1 ? 's' : ''}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="font-bold text-base text-warm-900">No goals yet</p>
                      <p className="text-xs text-primary-600">Tap to start saving →</p>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Budget Mini-Card */}
            <Card className="shadow-soft hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab('budget')}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Receipt className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-warm-500">This Month</p>
                  {statsLoading ? (
                    <Skeleton className="h-6 w-24 mt-1" />
                  ) : budgetStats && (budgetStats.budget > 0 || budgetStats.expenseCount > 0) ? (
                    <>
                      <p className="font-bold text-lg text-warm-900">${budgetStats.spent.toLocaleString()} spent</p>
                      <p className="text-xs text-warm-500">
                        {budgetStats.budget > 0 ? `of $${budgetStats.budget.toLocaleString()} budget` : `${budgetStats.expenseCount} expense${budgetStats.expenseCount !== 1 ? 's' : ''}`}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="font-bold text-base text-warm-900">No budget set</p>
                      <p className="text-xs text-primary-600">Tap to set up →</p>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Timeline Card */}
            <Card className="shadow-soft">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-primary-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-warm-500">Timeline</p>
                  <p className="font-bold text-lg text-warm-900">
                    {daysUntilDue !== null ? `${daysUntilDue} days` : '—'}
                  </p>
                  <p className="text-xs text-warm-500">
                    {daysUntilDue !== null ? 'until due date' : 'Add due date'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Discover - Quick Links to Standalone Feature Pages */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary-500" />
              <h3 className="font-semibold text-warm-900">Discover</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {[
                {
                  href: '/due-date-calculator',
                  title: 'Due Date Calculator',
                  description: 'Estimate when baby arrives',
                  icon: Calendar,
                  iconBg: 'bg-primary-100',
                  iconColor: 'text-primary-600',
                  hoverBorder: 'hover:border-primary-200',
                },
                {
                  href: '/week-by-week',
                  title: 'Week-by-Week Guide',
                  description: "What's happening each week",
                  icon: CalendarRange,
                  iconBg: 'bg-indigo-100',
                  iconColor: 'text-indigo-600',
                  hoverBorder: 'hover:border-indigo-200',
                },
                {
                  href: '/is-it-safe',
                  title: 'Is It Safe?',
                  description: 'Pregnancy safety database',
                  icon: ShieldCheck,
                  iconBg: 'bg-emerald-100',
                  iconColor: 'text-emerald-600',
                  hoverBorder: 'hover:border-emerald-200',
                },
                {
                  href: '/baby-names',
                  title: 'Baby Names',
                  description: 'Browse meanings & origins',
                  icon: Heart,
                  iconBg: 'bg-rose-100',
                  iconColor: 'text-rose-600',
                  hoverBorder: 'hover:border-rose-200',
                },
                {
                  href: '/community',
                  title: 'Community Q&A',
                  description: 'Ask & answer with parents',
                  icon: Users,
                  iconBg: 'bg-amber-100',
                  iconColor: 'text-amber-600',
                  hoverBorder: 'hover:border-amber-200',
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href} className="group">
                    <Card className={cn('shadow-soft hover:shadow-md transition-all h-full', item.hoverBorder)}>
                      <CardContent className="p-4 flex flex-col gap-3 h-full">
                        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', item.iconBg)}>
                          <Icon className={cn('w-5 h-5', item.iconColor)} />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-warm-900 text-sm leading-tight">{item.title}</p>
                          <p className="text-xs text-warm-500 mt-1">{item.description}</p>
                        </div>
                        <div className="flex items-center text-xs font-medium text-primary-600 group-hover:text-primary-700">
                          Explore
                          <ArrowRight className="w-3 h-3 ml-1 transition-transform group-hover:translate-x-0.5" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Stage-Based Recommendations */}
          {weeksPregnant && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary-500" />
                <h3 className="font-semibold text-warm-900">
                  Week {weeksPregnant} Recommendations
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {stageRecommendations.map((rec, idx) => {
                  const Icon = rec.icon;
                  return (
                    <Button
                      key={idx}
                      variant="outline"
                      size="sm"
                      className="gap-2 border-warm-200 hover:border-primary-300 hover:bg-primary-50"
                      onClick={() => setActiveTab(rec.tab)}
                    >
                      <Icon className="w-4 h-4" />
                      {rec.title}
                      <Plus className="w-3 h-3" />
                    </Button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => {
          setActiveTab(value);
          setPlanningOpen(false);
          setTrackingOpen(false);
          setFinanceOpen(false);
        }} className="space-y-6">
          {/* MOBILE/TABLET: Horizontal scrollable pill nav */}
          <TabsList className="lg:hidden bg-white border border-warm-100 p-1 rounded-xl flex overflow-x-auto gap-1 h-auto shadow-soft scrollbar-hide">
            <TabsTrigger value="tasks" className="data-[state=active]:bg-primary-500 data-[state=active]:text-white rounded-lg px-3 py-2 text-sm whitespace-nowrap min-h-[44px]">
              <Wallet className="w-4 h-4 mr-1.5" /> Tasks
            </TabsTrigger>
            <TabsTrigger value="savings" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white rounded-lg px-3 py-2 text-sm whitespace-nowrap min-h-[44px]">
              <PiggyBank className="w-4 h-4 mr-1.5" /> Savings
            </TabsTrigger>
            <TabsTrigger value="budget" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-lg px-3 py-2 text-sm whitespace-nowrap min-h-[44px]">
              <Receipt className="w-4 h-4 mr-1.5" /> Budget
            </TabsTrigger>
            <TabsTrigger value="costcalc" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white rounded-lg px-3 py-2 text-sm whitespace-nowrap min-h-[44px]">
              <Calculator className="w-4 h-4 mr-1.5" /> Costs
            </TabsTrigger>
            <TabsTrigger value="insurance" className="data-[state=active]:bg-cyan-500 data-[state=active]:text-white rounded-lg px-3 py-2 text-sm whitespace-nowrap min-h-[44px]">
              <Shield className="w-4 h-4 mr-1.5" /> Insurance
            </TabsTrigger>
            <TabsTrigger value="pregnancy" className="data-[state=active]:bg-indigo-500 data-[state=active]:text-white rounded-lg px-3 py-2 text-sm whitespace-nowrap min-h-[44px]">
              <Baby className="w-4 h-4 mr-1.5" /> Pregnancy
            </TabsTrigger>
            <TabsTrigger value="vaccination" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white rounded-lg px-3 py-2 text-sm whitespace-nowrap min-h-[44px]">
              <Syringe className="w-4 h-4 mr-1.5" /> Vaccines
            </TabsTrigger>
            <TabsTrigger value="bag" className="data-[state=active]:bg-pink-500 data-[state=active]:text-white rounded-lg px-3 py-2 text-sm whitespace-nowrap min-h-[44px]">
              <Backpack className="w-4 h-4 mr-1.5" /> Hospital Bag
            </TabsTrigger>
            <TabsTrigger value="birthplan" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white rounded-lg px-3 py-2 text-sm whitespace-nowrap min-h-[44px]">
              <FileText className="w-4 h-4 mr-1.5" /> Birth Plan
            </TabsTrigger>
            <TabsTrigger value="registry" className="data-[state=active]:bg-fuchsia-500 data-[state=active]:text-white rounded-lg px-3 py-2 text-sm whitespace-nowrap min-h-[44px]">
              <Gift className="w-4 h-4 mr-1.5" /> Registry
            </TabsTrigger>
          </TabsList>

          <div className="grid lg:grid-cols-12 gap-6">
            {/* DESKTOP: Left Sidebar Navigation */}
            <aside className="hidden lg:block lg:col-span-3">
              <div className="sticky top-24 space-y-4">
                <TabsList className="flex flex-col w-full bg-white border border-warm-100 p-2 rounded-xl gap-1 h-auto shadow-soft">
                  {/* Money section */}
                  <div className="px-2 py-1.5 text-xs font-semibold text-warm-500 uppercase tracking-wide">Money</div>
                  <TabsTrigger value="tasks" className="data-[state=active]:bg-primary-500 data-[state=active]:text-white rounded-lg px-3 py-2.5 text-sm w-full justify-start min-h-[44px]">
                    <Wallet className="w-4 h-4 mr-2" />
                    Smart Tasks
                  </TabsTrigger>
                  <TabsTrigger value="savings" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white rounded-lg px-3 py-2.5 text-sm w-full justify-start min-h-[44px]">
                    <PiggyBank className="w-4 h-4 mr-2" />
                    Savings Goals
                  </TabsTrigger>
                  <TabsTrigger value="budget" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-lg px-3 py-2.5 text-sm w-full justify-start min-h-[44px]">
                    <Receipt className="w-4 h-4 mr-2" />
                    Budget Tracker
                  </TabsTrigger>
                  <TabsTrigger value="costcalc" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white rounded-lg px-3 py-2.5 text-sm w-full justify-start min-h-[44px]">
                    <Calculator className="w-4 h-4 mr-2" />
                    Cost Calculator
                  </TabsTrigger>
                  <TabsTrigger value="insurance" className="data-[state=active]:bg-cyan-500 data-[state=active]:text-white rounded-lg px-3 py-2.5 text-sm w-full justify-start min-h-[44px]">
                    <Shield className="w-4 h-4 mr-2" />
                    Insurance
                  </TabsTrigger>
                  
                  {/* Pregnancy section */}
                  <div className="px-2 py-1.5 text-xs font-semibold text-warm-500 uppercase tracking-wide mt-2 border-t border-warm-100 pt-3">Pregnancy</div>
                  <TabsTrigger value="pregnancy" className="data-[state=active]:bg-indigo-500 data-[state=active]:text-white rounded-lg px-3 py-2.5 text-sm w-full justify-start min-h-[44px]">
                    <Baby className="w-4 h-4 mr-2" />
                    Pregnancy Tracker
                  </TabsTrigger>
                  <TabsTrigger value="vaccination" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white rounded-lg px-3 py-2.5 text-sm w-full justify-start min-h-[44px]">
                    <Syringe className="w-4 h-4 mr-2" />
                    Vaccinations
                  </TabsTrigger>
                  
                  {/* Birth Prep section */}
                  <div className="px-2 py-1.5 text-xs font-semibold text-warm-500 uppercase tracking-wide mt-2 border-t border-warm-100 pt-3">Birth Prep</div>
                  <TabsTrigger value="bag" className="data-[state=active]:bg-pink-500 data-[state=active]:text-white rounded-lg px-3 py-2.5 text-sm w-full justify-start min-h-[44px]">
                    <Backpack className="w-4 h-4 mr-2" />
                    Hospital Bag
                  </TabsTrigger>
                  <TabsTrigger value="birthplan" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white rounded-lg px-3 py-2.5 text-sm w-full justify-start min-h-[44px]">
                    <FileText className="w-4 h-4 mr-2" />
                    Birth Plan
                  </TabsTrigger>
                  
                  {/* Other */}
                  <div className="px-2 py-1.5 text-xs font-semibold text-warm-500 uppercase tracking-wide mt-2 border-t border-warm-100 pt-3">Registry</div>
                  <TabsTrigger value="registry" className="data-[state=active]:bg-fuchsia-500 data-[state=active]:text-white rounded-lg px-3 py-2.5 text-sm w-full justify-start min-h-[44px]">
                    <Gift className="w-4 h-4 mr-2" />
                    Baby Registry
                  </TabsTrigger>
                </TabsList>
              </div>
            </aside>

            {/* MAIN CONTENT */}
            <div className="lg:col-span-9">
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
              <TabsContent value="tasks" className="m-0">
                <SmartTaskManager 
                  userId={user?.id} 
                  state={profile?.state}
                  selectedTaskId={selectedTaskId}
                  onTaskSelected={() => setSelectedTaskId(null)}
                />
              </TabsContent>
              
              <TabsContent value="savings" className="m-0">
                <SavingsGoals 
                  userId={user?.id} 
                  dueDate={profile?.due_date}
                  incomeBracket={profile?.income_bracket}
                />
              </TabsContent>
              
              <TabsContent value="costcalc" className="m-0">
                <BabyCostCalculator />
              </TabsContent>
              
              <TabsContent value="budget" className="m-0">
                <BudgetTracker 
                  userId={user?.id}
                  dueDate={profile?.due_date}
                  incomeBracket={profile?.income_bracket}
                />
              </TabsContent>
              
              <TabsContent value="bag" className="m-0">
                <HospitalBagPlanner />
              </TabsContent>
              
              <TabsContent value="pregnancy" className="m-0">
                <PregnancyTracker />
              </TabsContent>
              
              <TabsContent value="vaccination" className="m-0">
                <VaccinationTracker 
                  completedVaccineIds={completedVaccines}
                  onCompletedChange={setCompletedVaccines}
                />
              </TabsContent>
              
              <TabsContent value="birthplan" className="m-0">
                <BirthPlanBuilder 
                  userId={user?.id}
                  completedVaccineIds={completedVaccines}
                  onCompletedVaccinesChange={setCompletedVaccines}
                />
              </TabsContent>
              
              <TabsContent value="insurance" className="m-0">
                <InsuranceDocumentAnalyzer userId={user?.id} />
              </TabsContent>

              <TabsContent value="registry" className="m-0">
                <RegistryTracker userId={user?.id} />
              </TabsContent>
            </div>
            
            {/* Collapsible Chat Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                {chatOpen ? (
                  <>
                    <div className="flex justify-end mb-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setChatOpen(false)}
                        className="text-warm-500 hover:text-warm-700"
                      >
                        <X className="w-4 h-4 mr-1" />
                        <span className="text-xs">Close</span>
                      </Button>
                    </div>
                    <Chat 
                      userContext={{
                        state: profile?.state || undefined,
                        dueDate: profile?.due_date || undefined,
                        incomeBracket: profile?.income_bracket || undefined,
                      }}
                    />
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Button
                      onClick={() => setChatOpen(true)}
                      className="shadow-lg rounded-full h-14 w-14 flex items-center justify-center"
                      title="Ask BabyNest Assistant"
                    >
                      <MessageCircle className="w-6 h-6" />
                    </Button>
                    <Button
                      onClick={() => setChatOpen(true)}
                      variant="outline"
                      className="gap-2 px-4 py-5 border-warm-200 shadow-soft"
                    >
                      <MessageCircle className="w-5 h-5" />
                      Ask AI
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
            </div>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
