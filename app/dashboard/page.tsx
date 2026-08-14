'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Chat } from '@/components/Chat';
import { HospitalBagPlanner } from '@/components/HospitalBagPlanner';
import { PregnancyTracker } from '@/components/PregnancyTracker';
import { VaccinationTracker } from '@/components/VaccinationTracker';
import { BirthPlanBuilder } from '@/components/BirthPlanBuilder';
import { SavingsGoals } from '@/components/SavingsGoals';
import { BabyCostCalculator } from '@/components/BabyCostCalculator';
import { BudgetTracker } from '@/components/BudgetTracker';
import { RegistryTracker } from '@/components/RegistryTracker';

// Dynamic imports with loading skeletons
const InsuranceDocumentAnalyzer = dynamic(
  () => import('@/components/InsuranceDocumentAnalyzer').then(mod => ({ default: mod.InsuranceDocumentAnalyzer })),
  {
    loading: () => <InsuranceDocumentAnalyzerSkeleton />,
    ssr: false
  }
);

const DocumentVault = dynamic(
  () => import('@/components/DocumentVault').then(mod => ({ default: mod.DocumentVault })),
  {
    loading: () => <DocumentVaultSkeleton />,
    ssr: false
  }
);
import { supabase, getProfile, Profile } from '@/lib/supabase';
import { Skeleton } from '@/components/ui/skeleton';
import { hasCompletedOnboarding } from '@/lib/onboarding';
import { cn } from '@/lib/utils';
import { 
  StaggerContainer, 
  StaggerItem, 
  GlassCard,
  ScrollReveal,
  AnimatedGradientBackground
} from '@/app/providers';
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

interface SavingsStats {
  totalSaved: number;
  totalTarget: number;
  goalCount: number;
}

interface BudgetStats {
  spent: number;
  budget: number;
  expenseCount: number;
}

interface DashboardData {
  profile: Profile | null;
  urgentTasks: UrgentTask[];
  savingsStats: SavingsStats;
  budgetStats: BudgetStats;
  completedVaccines: string[];
}

const EMPTY_SAVINGS_STATS: SavingsStats = {
  totalSaved: 0,
  totalTarget: 0,
  goalCount: 0,
};

const EMPTY_BUDGET_STATS: BudgetStats = {
  spent: 0,
  budget: 0,
  expenseCount: 0,
};

const DASHBOARD_CACHE_TTL_MS = 60_000;

const dashboardCache = new Map<string, { data: DashboardData; fetchedAt: number }>();

const normalizeCompletedVaccines = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value.filter((id): id is string => typeof id === 'string');
};

const formatUrgentTaskDueDate = (dueDate?: string | null, now = Date.now()): string | undefined => {
  if (!dueDate) return undefined;

  const diffDays = Math.ceil((new Date(dueDate).getTime() - now) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return `${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? '' : 's'} overdue`;
  if (diffDays === 0) return 'today';
  if (diffDays === 1) return '1 day';
  if (diffDays < 7) return `${diffDays} days`;
  if (diffDays < 14) return '1 week';
  return `${Math.ceil(diffDays / 7)} weeks`;
};

const getDashboardCache = (userId: string) => {
  const cached = dashboardCache.get(userId);
  if (!cached) return null;
  if (Date.now() - cached.fetchedAt > DASHBOARD_CACHE_TTL_MS) {
    dashboardCache.delete(userId);
    return null;
  }
  return cached.data;
};

const setDashboardCache = (userId: string, data: DashboardData) => {
  dashboardCache.set(userId, {
    data,
    fetchedAt: Date.now(),
  });
};

// Loading skeleton components
function StatCardSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-2xl p-4 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.08)]"
    >
      <div className="flex items-center gap-4">
        <Skeleton className="w-12 h-12 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-6 w-24" />
        </div>
      </div>
    </motion.div>
  );
}

function UrgentTaskSkeleton() {
  return (
    <GlassCard className="border-l-4 border-l-rose-200">
      <CardContent className="p-4 flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </CardContent>
    </GlassCard>
  );
}

function DiscoverCardSkeleton() {
  return (
    <GlassCard className="h-full">
      <CardContent className="p-4 flex flex-col gap-3 h-full">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-full" />
        </div>
        <Skeleton className="h-3 w-16" />
      </CardContent>
    </GlassCard>
  );
}

// Dynamic component loading skeletons
function InsuranceDocumentAnalyzerSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Document type selector skeleton */}
          <div className="space-y-3">
            <Skeleton className="h-4 w-40" />
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-xl" />
              ))}
            </div>
          </div>
          {/* Upload zone skeleton */}
          <div className="border-2 border-dashed border-warm-200 rounded-2xl p-8">
            <div className="flex flex-col items-center gap-4">
              <Skeleton className="w-14 h-14 rounded-2xl" />
              <div className="text-center space-y-2">
                <Skeleton className="h-5 w-40 mx-auto" />
                <Skeleton className="h-3 w-56 mx-auto" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Analyzed documents section skeleton */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Skeleton className="w-5 h-5 rounded" />
          <Skeleton className="h-5 w-40" />
        </div>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <Skeleton className="w-10 h-10 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DocumentVaultSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <Skeleton className="h-10 w-full md:w-96 rounded-lg" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-20 rounded-lg" />
          <Skeleton className="h-10 w-28 rounded-lg" />
        </div>
      </div>
      
      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar skeleton */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <Skeleton className="h-6 w-20" />
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1 px-4 pb-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Documents grid skeleton */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Skeleton className="w-12 h-12 rounded-xl flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
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
  const [savingsStats, setSavingsStats] = useState<SavingsStats>(EMPTY_SAVINGS_STATS);
  const [budgetStats, setBudgetStats] = useState<BudgetStats>(EMPTY_BUDGET_STATS);
  const [statsLoading, setStatsLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const [vaccinesLoading, setVaccinesLoading] = useState(true);
  
  // Selected task for scrolling
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadDashboard = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();

        if (!authUser) {
          router.push('/auth/signin');
          return;
        }

        setUser(authUser);

        const completed = await hasCompletedOnboarding(authUser.id);
        if (!completed) {
          router.push('/onboarding');
          return;
        }

        if (cancelled) return;

        setLoading(false);
        setProfileLoading(true);
        setTasksLoading(true);
        setStatsLoading(true);
        setVaccinesLoading(true);

        const cached = getDashboardCache(authUser.id);
        if (cached) {
          setProfile(cached.profile);
          setUrgentTasks(cached.urgentTasks);
          setSavingsStats(cached.savingsStats);
          setBudgetStats(cached.budgetStats);
          setCompletedVaccines(cached.completedVaccines);
          setProfileLoading(false);
          setTasksLoading(false);
          setStatsLoading(false);
          setVaccinesLoading(false);
          return;
        }

        const localVaccines = (() => {
          if (typeof window === 'undefined') return [];
          try {
            return normalizeCompletedVaccines(JSON.parse(window.localStorage.getItem('completedVaccines') || '[]'));
          } catch {
            return [];
          }
        })();

        const now = Date.now();
        const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

        const [
          profileResult,
          urgentTasksResult,
          savingsGoalsResult,
          budgetSettingsResult,
          expensesResult,
          pregnancyTrackingResult,
        ] = await Promise.all([
          getProfile(authUser.id),
          supabase
            .from('tasks')
            .select('id, title, due_date, priority, status')
            .eq('user_id', authUser.id)
            .in('priority', ['urgent', 'high'])
            .neq('status', 'completed')
            .order('priority_weight', { ascending: false })
            .order('due_date', { ascending: true, nullsFirst: false })
            .limit(4),
          supabase
            .from('savings_goals')
            .select('current_amount, target_amount')
            .eq('user_id', authUser.id),
          supabase
            .from('budget_settings')
            .select('monthly_budget')
            .eq('user_id', authUser.id)
            .maybeSingle(),
          supabase
            .from('expenses')
            .select('amount')
            .eq('user_id', authUser.id)
            .gte('date', firstOfMonth),
          supabase
            .from('pregnancy_tracking')
            .select('completed_vaccine_ids')
            .eq('user_id', authUser.id)
            .maybeSingle(),
        ]);

        if (cancelled) return;

        if (profileResult?.error) {
          console.error('Failed to load profile:', profileResult.error);
        }

        const nextProfile = (profileResult?.profile as Profile | null) ?? null;

        if (urgentTasksResult.error) {
          console.error('Failed to load urgent tasks:', urgentTasksResult.error);
        }
        const nextUrgentTasks: UrgentTask[] = (urgentTasksResult.data || []).map((task: any) => ({
          id: task.id,
          title: task.title,
          dueDate: formatUrgentTaskDueDate(task.due_date, now),
          priority: (task.priority === 'urgent' ? 'urgent' : task.priority === 'high' ? 'high' : 'medium') as UrgentTask['priority'],
        }));

        if (savingsGoalsResult.error) {
          console.error('Failed to load savings stats:', savingsGoalsResult.error);
        }
        const nextSavingsStats: SavingsStats = savingsGoalsResult.data && savingsGoalsResult.data.length > 0
          ? {
              totalSaved: savingsGoalsResult.data.reduce((sum: number, goal: any) => sum + (Number(goal.current_amount) || 0), 0),
              totalTarget: savingsGoalsResult.data.reduce((sum: number, goal: any) => sum + (Number(goal.target_amount) || 0), 0),
              goalCount: savingsGoalsResult.data.length,
            }
          : { ...EMPTY_SAVINGS_STATS };

        if (budgetSettingsResult.error) {
          console.error('Failed to load budget settings:', budgetSettingsResult.error);
        }
        if (expensesResult.error) {
          console.error('Failed to load budget expenses:', expensesResult.error);
        }
        const nextBudgetStats: BudgetStats = {
          spent: (expensesResult.data || []).reduce((sum: number, expense: any) => sum + (Number(expense.amount) || 0), 0),
          budget: Number(budgetSettingsResult.data?.monthly_budget) || 0,
          expenseCount: (expensesResult.data || []).length,
        };

        if (pregnancyTrackingResult.error) {
          console.error('Failed to load vaccine backup state:', pregnancyTrackingResult.error);
        }
        const remoteVaccines = normalizeCompletedVaccines(pregnancyTrackingResult.data?.completed_vaccine_ids);
        const nextCompletedVaccines = remoteVaccines.length > 0 ? remoteVaccines : localVaccines;

        setProfile(nextProfile);
        setUrgentTasks(nextUrgentTasks);
        setSavingsStats(nextSavingsStats);
        setBudgetStats(nextBudgetStats);
        setCompletedVaccines(nextCompletedVaccines);
        setProfileLoading(false);
        setTasksLoading(false);
        setStatsLoading(false);
        setVaccinesLoading(false);

        setDashboardCache(authUser.id, {
          profile: nextProfile,
          urgentTasks: nextUrgentTasks,
          savingsStats: nextSavingsStats,
          budgetStats: nextBudgetStats,
          completedVaccines: nextCompletedVaccines,
        });
      } catch (error) {
        if (cancelled) return;
        console.error('Dashboard fetch error:', error);
        setProfile(null);
        setUrgentTasks([]);
        setSavingsStats({ ...EMPTY_SAVINGS_STATS });
        setBudgetStats({ ...EMPTY_BUDGET_STATS });
        setCompletedVaccines([]);
        setProfileLoading(false);
        setTasksLoading(false);
        setStatsLoading(false);
        setVaccinesLoading(false);
        setLoading(false);
      }
    };

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [router]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem('completedVaccines', JSON.stringify(completedVaccines));
    } catch {
      /* localStorage full or disabled */
    }
  }, [completedVaccines]);

  useEffect(() => {
    if (!user?.id || vaccinesLoading) return;

    let cancelled = false;

    const syncVaccines = async () => {
      try {
        const { error } = await supabase
          .from('pregnancy_tracking')
          .upsert({
            user_id: user.id,
            completed_vaccine_ids: completedVaccines,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'user_id' });

        if (error && !cancelled) {
          console.error('Failed to sync vaccine backup state:', error);
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Vaccine sync error:', error);
        }
      }
    };

    syncVaccines();

    const cached = getDashboardCache(user.id);
    if (cached) {
      setDashboardCache(user.id, {
        ...cached,
        completedVaccines,
      });
    }

    return () => {
      cancelled = true;
    };
  }, [completedVaccines, user?.id, vaccinesLoading]);

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
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div 
            className="w-12 h-12 border-4 border-primary-200 border-t-primary-500 rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-warm-600">Loading your dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <AnimatedGradientBackground className="min-h-screen bg-cream-50">
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <StaggerContainer>
          {/* Today Card - Personalized command center */}
          <StaggerItem>
            <div className="mb-8">
              <GlassCard glow className="bg-gradient-to-r from-primary-500/90 to-primary-600/90 text-white border-none shadow-glow overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <motion.div 
                        className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm flex-shrink-0"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        animate={{ 
                          boxShadow: [
                            "0 0 20px rgba(255,255,255,0.1)",
                            "0 0 40px rgba(255,255,255,0.2)",
                            "0 0 20px rgba(255,255,255,0.1)"
                          ]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        {weeksPregnant ? (
                          <div className="text-center">
                            <div className="text-xs font-medium text-primary-100 leading-none">WEEK</div>
                            <div className="text-xl font-bold leading-tight">{weeksPregnant}</div>
                          </div>
                        ) : (
                          <Heart className="w-7 h-7" />
                        )}
                      </motion.div>
                      <div className="min-w-0">
                        {profileLoading ? (
                          <div className="space-y-2">
                            <Skeleton className="h-8 w-48 bg-white/20" />
                            <Skeleton className="h-4 w-64 bg-white/20" />
                          </div>
                        ) : (
                          <>
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
                          </>
                        )}
                      </div>
                    </div>
                    
                    {/* Quick action based on context */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {tasksLoading ? (
                        <Skeleton className="h-11 w-56 bg-white/20" />
                      ) : urgentTasks.length > 0 ? (
                        <Button
                          variant="secondary"
                          onClick={() => {
                            setActiveTab('tasks');
                            setSelectedTaskId(urgentTasks[0].id);
                          }}
                          className="bg-white/15 text-white hover:bg-white/25 border border-white/20 backdrop-blur-sm whitespace-nowrap min-h-[44px]"
                        >
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          >
                            <Zap className="w-4 h-4 mr-2" />
                          </motion.div>
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
                    </motion.div>
                  </div>
                </CardContent>
              </GlassCard>
            </div>
          </StaggerItem>

          {/* Today Priority Summary */}
          <StaggerItem>
            <div className="mb-8 space-y-6">
              {/* Urgent Tasks Section */}
              {tasksLoading ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-rose-300" />
                    <Skeleton className="h-5 w-32" />
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    {[0, 1].map((i) => (
                      <UrgentTaskSkeleton key={i} />
                    ))}
                  </div>
                </div>
              ) : urgentTasks.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <AlertCircle className="w-5 h-5 text-rose-500" />
                    </motion.div>
                    <h3 className="font-semibold text-warm-900">Urgent Tasks</h3>
                    <Badge variant="secondary" className="bg-rose-100 text-rose-700">
                      {urgentTasks.length}
                    </Badge>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    {urgentTasks.map((task, index) => (
                      <ScrollReveal key={task.id} delay={index * 0.1}>
                        <GlassCard 
                          hover
                          className={cn(
                            "border-l-4 cursor-pointer",
                            task.priority === 'urgent' ? 'border-l-rose-500' : 'border-l-amber-500'
                          )}
                          onClick={() => {
                            setActiveTab('tasks');
                            setSelectedTaskId(task.id);
                          }}
                        >
                          <CardContent className="p-4 flex items-center gap-3">
                            <motion.div 
                              className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center",
                                task.priority === 'urgent' ? 'bg-rose-50' : 'bg-amber-50'
                              )}
                              whileHover={{ scale: 1.1, rotate: 10 }}
                            >
                              <Zap className={cn(
                                "w-5 h-5",
                                task.priority === 'urgent' ? 'text-rose-500' : 'text-amber-500'
                              )} />
                            </motion.div>
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
                        </GlassCard>
                      </ScrollReveal>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Quick Stats Row */}
              <StaggerContainer className="grid md:grid-cols-3 gap-4" delay={0.2}>
                {/* Savings Mini-Card */}
                <StaggerItem>
                  {statsLoading ? (
                    <StatCardSkeleton />
                  ) : (
                    <GlassCard hover className="cursor-pointer" onClick={() => setActiveTab('savings')}>
                      <CardContent className="p-4 flex items-center gap-4">
                        <motion.div 
                          className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center"
                          whileHover={{ rotate: 10, scale: 1.1 }}
                        >
                          <PiggyBank className="w-6 h-6 text-amber-600" />
                        </motion.div>
                        <div className="flex-1">
                          <p className="text-sm text-warm-500">Savings Goals</p>
                          {savingsStats.goalCount > 0 ? (
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
                    </GlassCard>
                  )}
                </StaggerItem>

                {/* Budget Mini-Card */}
                <StaggerItem>
                  {statsLoading ? (
                    <StatCardSkeleton />
                  ) : (
                    <GlassCard hover className="cursor-pointer" onClick={() => setActiveTab('budget')}>
                      <CardContent className="p-4 flex items-center gap-4">
                        <motion.div 
                          className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center"
                          whileHover={{ rotate: 10, scale: 1.1 }}
                        >
                          <Receipt className="w-6 h-6 text-primary-600" />
                        </motion.div>
                        <div className="flex-1">
                          <p className="text-sm text-warm-500">This Month</p>
                          {budgetStats.budget > 0 || budgetStats.expenseCount > 0 ? (
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
                    </GlassCard>
                  )}
                </StaggerItem>

                {/* Timeline Card */}
                <StaggerItem>
                  <GlassCard>
                    <CardContent className="p-4 flex items-center gap-4">
                      <motion.div 
                        className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center"
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 4, repeat: Infinity }}
                      >
                        <Clock className="w-6 h-6 text-primary-600" />
                      </motion.div>
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
                  </GlassCard>
                </StaggerItem>
              </StaggerContainer>

              {/* Discover - Quick Links */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: [0, 15, -15, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  >
                    <Sparkles className="w-5 h-5 text-primary-500" />
                  </motion.div>
                  <h3 className="font-semibold text-warm-900">Discover</h3>
                </div>
                <StaggerContainer className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3" delay={0.3}>
                  {[
                    {
                      href: '/due-date-calculator',
                      title: 'Due Date Calculator',
                      description: 'Estimate when baby arrives',
                      icon: Calendar,
                      iconBg: 'bg-primary-100',
                      iconColor: 'text-primary-600',
                    },
                    {
                      href: '/week-by-week',
                      title: 'Week-by-Week Guide',
                      description: "What's happening each week",
                      icon: CalendarRange,
                      iconBg: 'bg-indigo-100',
                      iconColor: 'text-indigo-600',
                    },
                    {
                      href: '/is-it-safe',
                      title: 'Is It Safe?',
                      description: 'Pregnancy safety database',
                      icon: ShieldCheck,
                      iconBg: 'bg-emerald-100',
                      iconColor: 'text-emerald-600',
                    },
                    {
                      href: '/baby-names',
                      title: 'Baby Names',
                      description: 'Browse meanings & origins',
                      icon: Heart,
                      iconBg: 'bg-rose-100',
                      iconColor: 'text-rose-600',
                    },
                    {
                      href: '/community',
                      title: 'Community Q&A',
                      description: 'Ask & answer with parents',
                      icon: Users,
                      iconBg: 'bg-amber-100',
                      iconColor: 'text-amber-600',
                    },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <StaggerItem key={item.href}>
                        <Link href={item.href} className="group">
                          <GlassCard hover className="h-full">
                            <CardContent className="p-4 flex flex-col gap-3 h-full">
                              <motion.div 
                                className={cn('w-10 h-10 rounded-xl flex items-center justify-center', item.iconBg)}
                                whileHover={{ scale: 1.1, rotate: 5 }}
                              >
                                <Icon className={cn('w-5 h-5', item.iconColor)} />
                              </motion.div>
                              <div className="flex-1">
                                <p className="font-semibold text-warm-900 text-sm leading-tight">{item.title}</p>
                                <p className="text-xs text-warm-500 mt-1">{item.description}</p>
                              </div>
                              <div className="flex items-center text-xs font-medium text-primary-600 group-hover:text-primary-700">
                                Explore
                                <motion.div
                                  initial={{ x: 0 }}
                                  whileHover={{ x: 4 }}
                                >
                                  <ArrowRight className="w-3 h-3 ml-1" />
                                </motion.div>
                              </div>
                            </CardContent>
                          </GlassCard>
                        </Link>
                      </StaggerItem>
                    );
                  })}
                </StaggerContainer>
              </div>

              {/* Stage-Based Recommendations */}
              {weeksPregnant && (
                <ScrollReveal>
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
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.1 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-2 border-warm-200 hover:border-primary-300 hover:bg-primary-50"
                              onClick={() => setActiveTab(rec.tab)}
                            >
                              <Icon className="w-4 h-4" />
                              {rec.title}
                              <Plus className="w-3 h-3" />
                            </Button>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </ScrollReveal>
              )}
            </div>
          </StaggerItem>
        </StaggerContainer>

        {/* Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => {
          setActiveTab(value);
          setPlanningOpen(false);
          setTrackingOpen(false);
          setFinanceOpen(false);
        }} className="space-y-6">
          {/* MOBILE/TABLET: Horizontal scrollable pill nav */}
          <TabsList className="lg:hidden bg-white/80 backdrop-blur-xl border border-warm-100/50 p-1 rounded-xl flex overflow-x-auto gap-1 h-auto shadow-soft scrollbar-hide">
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
            <TabsTrigger value="documents" className="data-[state=active]:bg-slate-500 data-[state=active]:text-white rounded-lg px-3 py-2 text-sm whitespace-nowrap min-h-[44px]">
              <FileText className="w-4 h-4 mr-1.5" /> Documents
            </TabsTrigger>
          </TabsList>

          <div className="grid lg:grid-cols-12 gap-6">
            {/* DESKTOP: Left Sidebar Navigation */}
            <aside className="hidden lg:block lg:col-span-3">
              <div className="sticky top-24 space-y-4">
                <GlassCard className="p-2">
                  <TabsList className="flex flex-col w-full bg-transparent h-auto gap-1">
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
                    
                    {/* Documents */}
                    <div className="px-2 py-1.5 text-xs font-semibold text-warm-500 uppercase tracking-wide mt-2 border-t border-warm-100 pt-3">Documents</div>
                    <TabsTrigger value="documents" className="data-[state=active]:bg-slate-500 data-[state=active]:text-white rounded-lg px-3 py-2.5 text-sm w-full justify-start min-h-[44px]">
                      <FileText className="w-4 h-4 mr-2" />
                      Document Vault
                    </TabsTrigger>
                  </TabsList>
                </GlassCard>
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

              <TabsContent value="documents" className="m-0">
                <DocumentVault />
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
                    <GlassCard>
                      <Chat 
                        userContext={{
                          state: profile?.state || undefined,
                          dueDate: profile?.due_date || undefined,
                          incomeBracket: profile?.income_bracket || undefined,
                        }}
                      />
                    </GlassCard>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        onClick={() => setChatOpen(true)}
                        className="shadow-lg rounded-full h-14 w-14 flex items-center justify-center"
                      >
                        <MessageCircle className="w-6 h-6" />
                      </Button>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        onClick={() => setChatOpen(true)}
                        variant="outline"
                        className="gap-2 px-4 py-5 border-warm-200 shadow-soft"
                      >
                        <MessageCircle className="w-5 h-5" />
                        Ask AI
                      </Button>
                    </motion.div>
                  </div>
                )}
              </div>
            </div>
          </div>
            </div>
          </div>
        </Tabs>
      </div>
    </AnimatedGradientBackground>
  );
}
