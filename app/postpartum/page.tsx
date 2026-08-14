'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Baby,
  Heart,
  Activity,
  Moon,
  Utensils,
  Calendar,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Plus,
  Timer,
  Droplets,
  Thermometer,
  Scale,
  Loader2,
  ArrowLeft,
  Sparkles,
  Info
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { LegalDisclaimer } from '@/components/LegalDisclaimer';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PostpartumTask {
  id: string;
  title: string;
  description: string;
  category: 'recovery' | 'baby' | 'feeding' | 'mood' | 'appointments';
  day: number;
  completed: boolean;
  icon: React.ReactNode;
}

interface BabyMetric {
  id?: string;
  date: string;
  weight?: number;
  height?: number;
  temperature?: number;
  feedings?: number;
  diapers?: number;
  sleepMinutes?: number;
}

const POSTPARTUM_TASKS = [
  // Week 1
  { id: 'pp-day1-pediatrician', day: 1, title: 'Schedule Pediatrician Visit', description: 'Baby should see doctor within 3-5 days', category: 'appointments', icon: <Calendar className="w-5 h-5" /> },
  { id: 'pp-day1-latch', day: 1, title: 'Establish Breastfeeding', description: 'Feed every 2-3 hours, watch for good latch', category: 'feeding', icon: <Baby className="w-5 h-5" /> },
  { id: 'pp-day1-rest', day: 1, title: 'Rest When Baby Sleeps', description: 'Sleep deprivation is real - prioritize recovery', category: 'recovery', icon: <Moon className="w-5 h-5" /> },
  { id: 'pp-day3-birth-cert', day: 3, title: 'Order Birth Certificate', description: 'Get certified copies for insurance', category: 'appointments', icon: <Activity className="w-5 h-5" /> },
  { id: 'pp-day5-checkup', day: 5, title: 'Baby Weight Check', description: 'Ensure baby is back to birth weight', category: 'baby', icon: <Scale className="w-5 h-5" /> },
  
  // Week 2
  { id: 'pp-day7-healing', day: 7, title: 'Monitor Your Healing', description: 'Watch for signs of infection or complications', category: 'recovery', icon: <Heart className="w-5 h-5" /> },
  { id: 'pp-day10-cord', day: 10, title: 'Umbilical Cord Care', description: 'Keep dry, watch for normal separation', category: 'baby', icon: <Droplets className="w-5 h-5" /> },
  { id: 'pp-day14-pediatrician', day: 14, title: '2-Week Pediatrician Visit', description: 'Check growth, jaundice, and development', category: 'appointments', icon: <Calendar className="w-5 h-5" /> },
  
  // Week 3-4
  { id: 'pp-day21-tummy-time', day: 21, title: 'Start Tummy Time', description: '3-5 minutes, 2-3 times daily while awake', category: 'baby', icon: <Baby className="w-5 h-5" /> },
  { id: 'pp-day28-checkup', day: 28, title: '1-Month Checkup', description: 'Vaccinations and milestone tracking', category: 'appointments', icon: <Calendar className="w-5 h-5" /> },
  
  // Month 2
  { id: 'pp-day45-social', day: 45, title: 'Social Security Card', description: 'Should arrive by now - file safely', category: 'appointments', icon: <Activity className="w-5 h-5" /> },
  { id: 'pp-day60-checkup', day: 60, title: '2-Month Checkup', description: 'First major vaccines (DTaP, IPV, etc.)', category: 'appointments', icon: <Calendar className="w-5 h-5" /> },
  
  // Month 3
  { id: 'pp-day90-routine', day: 90, title: 'Establish Sleep Routine', description: 'Consistent bedtime routine helps', category: 'baby', icon: <Moon className="w-5 h-5" /> },
  { id: 'pp-day90-postpartum', day: 90, title: '6-Week Postpartum Check', description: 'OB/GYN clearance for exercise, sex, work', category: 'recovery', icon: <Heart className="w-5 h-5" /> },
  
  // Month 4-6
  { id: 'pp-day120-checkup', day: 120, title: '4-Month Checkup', description: 'Track developmental milestones', category: 'appointments', icon: <Calendar className="w-5 h-5" /> },
  { id: 'pp-day150-solids', day: 150, title: 'Introduce Solids', description: 'Start with rice cereal, then purees', category: 'feeding', icon: <Utensils className="w-5 h-5" /> },
  { id: 'pp-day180-checkup', day: 180, title: '6-Month Checkup', description: 'More vaccines, discuss solids', category: 'appointments', icon: <Calendar className="w-5 h-5" /> },
];

export default function PostpartumPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [daysSinceBirth, setDaysSinceBirth] = useState(0);
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<BabyMetric[]>([]);
  const [showMetricModal, setShowMetricModal] = useState(false);
  const [newMetric, setNewMetric] = useState<Partial<BabyMetric>>({ date: new Date().toISOString().split('T')[0] });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/signin');
        return;
      }

      setUserId(user.id);

      // Load profile for birth date
      const { data: profileData } = await supabase
        .from('profiles')
        .select('due_date')
        .eq('id', user.id)
        .single();

      if (profileData?.due_date) {
        const dueDate = new Date(profileData.due_date);
        // Estimate birth date (40 weeks after conception, so due date is ~birth date)
        // Or user can set actual birth date
        setBirthDate(dueDate);
        
        const now = new Date();
        const diffTime = now.getTime() - dueDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        setDaysSinceBirth(Math.max(0, diffDays));
      }

      // Load completed tasks from Supabase
      const { data: taskData } = await supabase
        .from('tasks')
        .select('id, status')
        .eq('user_id', user.id)
        .like('id', 'pp-%')
        .eq('status', 'completed');

      if (taskData) {
        setCompletedTasks(new Set(taskData.map(t => t.id)));
      }

      // Load metrics
      const { data: metricData } = await supabase
        .from('baby_metrics' as any)
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (metricData && Array.isArray(metricData) && metricData.length > 0) {
        setMetrics(metricData as unknown as BabyMetric[]);
      }
    } catch (error) {
      console.error('Error loading postpartum data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = async (taskId: string) => {
    if (!userId) return;

    const task = POSTPARTUM_TASKS.find(t => t.id === taskId);
    if (!task) return;

    const isCompleted = completedTasks.has(taskId);

    try {
      if (isCompleted) {
        await supabase
          .from('tasks')
          .update({ status: 'pending', completion_date: null, updated_at: new Date().toISOString() })
          .eq('id', taskId)
          .eq('user_id', userId);

        setCompletedTasks(prev => {
          const newSet = new Set(prev);
          newSet.delete(taskId);
          return newSet;
        });
      } else {
        await supabase
          .from('tasks')
          .upsert({
            id: taskId,
            user_id: userId,
            title: task.title,
            description: task.description,
            category: task.category,
            status: 'completed',
            priority: 'medium',
            completion_date: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }, { onConflict: 'id' });

        setCompletedTasks(prev => new Set([...prev, taskId]));
      }
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };

  const addMetric = async () => {
    if (!userId || !newMetric.date) return;

    try {
      const { data, error } = await supabase
        .from('baby_metrics' as any)
        .insert({
          user_id: userId,
          date: newMetric.date,
          weight: newMetric.weight || null,
          height: newMetric.height || null,
          temperature: newMetric.temperature || null,
          feedings: newMetric.feedings || null,
          diapers: newMetric.diapers || null,
          sleep_minutes: newMetric.sleepMinutes || null
        } as any)
        .select()
        .single();

      if (error) throw error;
      if (!data || Array.isArray(data) || 'error' in data) {
        throw new Error('Unexpected insert response');
      }
      setMetrics(prev => [data as unknown as BabyMetric, ...prev]);
      setShowMetricModal(false);
      setNewMetric({ date: new Date().toISOString().split('T')[0] });
    } catch (error) {
      console.error('Error adding metric:', error);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'recovery': return 'text-pink-500 bg-pink-50 border-pink-200';
      case 'baby': return 'text-blue-500 bg-blue-50 border-blue-200';
      case 'feeding': return 'text-green-500 bg-green-50 border-green-200';
      case 'appointments': return 'text-purple-500 bg-purple-50 border-purple-200';
      default: return 'text-gray-500 bg-gray-50 border-gray-200';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'recovery': return 'Mom Recovery';
      case 'baby': return 'Baby Care';
      case 'feeding': return 'Feeding';
      case 'appointments': return 'Appointments';
      default: return category;
    }
  };

  const filteredTasks = POSTPARTUM_TASKS.filter(t => t.day <= daysSinceBirth + 7);
  const upcomingTasks = POSTPARTUM_TASKS.filter(t => t.day > daysSinceBirth && t.day <= daysSinceBirth + 30);
  const completedCount = POSTPARTUM_TASKS.filter(t => completedTasks.has(t.id)).length;
  const progress = Math.round((completedCount / POSTPARTUM_TASKS.length) * 100);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 mb-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
            </Link>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Postpartum Journey</h1>
              <p className="text-primary-100">
                {daysSinceBirth === 0 ? 'Birth day' : `Day ${daysSinceBirth} of postpartum`}
                {birthDate && ` · Born ${birthDate.toLocaleDateString()}`}
              </p>
            </div>
            
            <div className="text-right">
              <div className="text-3xl font-bold">{progress}%</div>
              <div className="text-sm text-primary-100">Complete</div>
            </div>
          </div>
          
          <div className="mt-6">
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </div>

      <LegalDisclaimer type="medical" message="This is for tracking only. Always follow your healthcare provider's advice." />

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="tasks" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tasks">Daily Tasks</TabsTrigger>
            <TabsTrigger value="tracking">Baby Tracking</TabsTrigger>
            <TabsTrigger value="milestones">Milestones</TabsTrigger>
          </TabsList>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{completedCount}</p>
                  <p className="text-sm text-warm-600">Tasks Done</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Calendar className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{daysSinceBirth}</p>
                  <p className="text-sm text-warm-600">Days Old</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Baby className="w-8 h-8 text-pink-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{upcomingTasks.length}</p>
                  <p className="text-sm text-warm-600">Coming Up</p>
                </CardContent>
              </Card>
            </div>

            {/* Current Tasks */}
            <div>
              <h2 className="text-xl font-bold text-warm-900 mb-4">This Week's Tasks</h2>
              <div className="space-y-3">
                {filteredTasks.map((task) => {
                  const isCompleted = completedTasks.has(task.id);
                  return (
                    <Card 
                      key={task.id}
                      className={`transition-all ${isCompleted ? 'opacity-60' : 'hover:shadow-md'}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <button
                            onClick={() => toggleTask(task.id)}
                            className="mt-1 flex-shrink-0"
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="w-6 h-6 text-green-500" />
                            ) : (
                              <div className="w-6 h-6 rounded-full border-2 border-warm-300" />
                            )}
                          </button>
                          
                          <div className={`p-2 rounded-lg flex-shrink-0 ${getCategoryColor(task.category)}`}>
                            {task.icon}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className={`font-semibold ${isCompleted ? 'line-through text-warm-400' : 'text-warm-900'}`}>
                                {task.title}
                              </h3>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${getCategoryColor(task.category)}`}>
                                {getCategoryLabel(task.category)}
                              </span>
                            </div>
                            <p className="text-sm text-warm-600">{task.description}</p>
                            <p className="text-xs text-warm-400 mt-1">Day {task.day}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Upcoming */}
            {upcomingTasks.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-warm-900 mb-4">Coming Up</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {upcomingTasks.slice(0, 4).map((task) => (
                    <Card key={task.id} className="bg-warm-50">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${getCategoryColor(task.category)}`}>
                            {task.icon}
                          </div>
                          <div>
                            <h3 className="font-semibold text-warm-900 text-sm">{task.title}</h3>
                            <p className="text-xs text-warm-600 mt-1">Day {task.day}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Tracking Tab */}
          <TabsContent value="tracking" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-warm-900">Daily Tracking</h2>
              <Button onClick={() => setShowMetricModal(true)}>
                <Plus className="w-4 h-4 mr-1" />
                Add Entry
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <Scale className="w-6 h-6 text-blue-500 mx-auto mb-1" />
                  <p className="text-sm text-warm-500">Latest Weight</p>
                  <p className="text-lg font-bold">
                    {metrics.find(m => m.weight)?.weight || '--'} <span className="text-sm font-normal">lbs</span>
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Utensils className="w-6 h-6 text-green-500 mx-auto mb-1" />
                  <p className="text-sm text-warm-500">Feedings Today</p>
                  <p className="text-lg font-bold">
                    {metrics[0]?.feedings || '--'}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Droplets className="w-6 h-6 text-amber-500 mx-auto mb-1" />
                  <p className="text-sm text-warm-500">Diapers Today</p>
                  <p className="text-lg font-bold">
                    {metrics[0]?.diapers || '--'}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Moon className="w-6 h-6 text-purple-500 mx-auto mb-1" />
                  <p className="text-sm text-warm-500">Sleep Today</p>
                  <p className="text-lg font-bold">
                    {metrics[0]?.sleepMinutes ? Math.round(metrics[0].sleepMinutes / 60) : '--'} <span className="text-sm font-normal">hrs</span>
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Entries */}
            {metrics.length > 0 ? (
              <div className="space-y-3">
                {metrics.slice(0, 10).map((metric) => (
                  <Card key={metric.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">{new Date(metric.date).toLocaleDateString()}</p>
                          <div className="flex gap-4 mt-1 text-sm text-warm-600">
                            {metric.weight && <span>Weight: {metric.weight} lbs</span>}
                            {metric.feedings && <span>Feedings: {metric.feedings}</span>}
                            {metric.diapers && <span>Diapers: {metric.diapers}</span>}
                            {metric.sleepMinutes && <span>Sleep: {Math.round(metric.sleepMinutes / 60)}h</span>}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Sparkles className="w-12 h-12 text-warm-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-warm-900 mb-2">No entries yet</h3>
                <p className="text-warm-600">Start tracking your baby's daily metrics</p>
              </div>
            )}
          </TabsContent>

          {/* Milestones Tab */}
          <TabsContent value="milestones" className="space-y-6">
            <h2 className="text-xl font-bold text-warm-900">Development Milestones</h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <Card className={daysSinceBirth >= 1 ? 'border-green-200 bg-green-50' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${daysSinceBirth >= 1 ? 'bg-green-100 text-green-600' : 'bg-warm-100 text-warm-400'}`}>
                      <Baby className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Birth</h3>
                      <p className="text-sm text-warm-600">Welcome to the world!</p>
                      {daysSinceBirth >= 1 && <span className="text-xs text-green-600 font-medium">✓ Completed</span>}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className={daysSinceBirth >= 14 ? 'border-green-200 bg-green-50' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${daysSinceBirth >= 14 ? 'bg-green-100 text-green-600' : 'bg-warm-100 text-warm-400'}`}>
                      <Heart className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Social Smile</h3>
                      <p className="text-sm text-warm-600">First real smiles</p>
                      <p className="text-xs text-warm-400">~2 weeks</p>
                      {daysSinceBirth >= 14 && <span className="text-xs text-green-600 font-medium">✓ Completed</span>}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className={daysSinceBirth >= 60 ? 'border-green-200 bg-green-50' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${daysSinceBirth >= 60 ? 'bg-green-100 text-green-600' : 'bg-warm-100 text-warm-400'}`}>
                      <Activity className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Cooing & Gurgling</h3>
                      <p className="text-sm text-warm-600">Making vocal sounds</p>
                      <p className="text-xs text-warm-400">~2 months</p>
                      {daysSinceBirth >= 60 && <span className="text-xs text-green-600 font-medium">✓ Completed</span>}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className={daysSinceBirth >= 120 ? 'border-green-200 bg-green-50' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${daysSinceBirth >= 120 ? 'bg-green-100 text-green-600' : 'bg-warm-100 text-warm-400'}`}>
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Rolling Over</h3>
                      <p className="text-sm text-warm-600">Front to back</p>
                      <p className="text-xs text-warm-400">~4 months</p>
                      {daysSinceBirth >= 120 && <span className="text-xs text-green-600 font-medium">✓ Completed</span>}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className={daysSinceBirth >= 180 ? 'border-green-200 bg-green-50' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${daysSinceBirth >= 180 ? 'bg-green-100 text-green-600' : 'bg-warm-100 text-warm-400'}`}>
                      <Utensils className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Sitting Up</h3>
                      <p className="text-sm text-warm-600">With support</p>
                      <p className="text-xs text-warm-400">~6 months</p>
                      {daysSinceBirth >= 180 && <span className="text-xs text-green-600 font-medium">✓ Completed</span>}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className={daysSinceBirth >= 270 ? 'border-green-200 bg-green-50' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${daysSinceBirth >= 270 ? 'bg-green-100 text-green-600' : 'bg-warm-100 text-warm-400'}`}>
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold">First Words</h3>
                      <p className="text-sm text-warm-600">Mama or Dada</p>
                      <p className="text-xs text-warm-400">~9 months</p>
                      {daysSinceBirth >= 270 && <span className="text-xs text-green-600 font-medium">✓ Completed</span>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Metric Modal */}
      <Dialog open={showMetricModal} onOpenChange={setShowMetricModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Daily Metrics</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={newMetric.date}
                onChange={(e) => setNewMetric({ ...newMetric, date: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (lbs, optional)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                placeholder="e.g., 7.5"
                value={newMetric.weight || ''}
                onChange={(e) => setNewMetric({ ...newMetric, weight: parseFloat(e.target.value) })}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="feedings">Feedings</Label>
                <Input
                  id="feedings"
                  type="number"
                  placeholder="8"
                  value={newMetric.feedings || ''}
                  onChange={(e) => setNewMetric({ ...newMetric, feedings: parseInt(e.target.value) })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="diapers">Diapers</Label>
                <Input
                  id="diapers"
                  type="number"
                  placeholder="10"
                  value={newMetric.diapers || ''}
                  onChange={(e) => setNewMetric({ ...newMetric, diapers: parseInt(e.target.value) })}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sleep">Sleep (hours, optional)</Label>
              <Input
                id="sleep"
                type="number"
                step="0.5"
                placeholder="14"
                value={newMetric.sleepMinutes ? (newMetric.sleepMinutes / 60) : ''}
                onChange={(e) => setNewMetric({ ...newMetric, sleepMinutes: parseFloat(e.target.value) * 60 })}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowMetricModal(false)}>
              Cancel
            </Button>
            <Button onClick={addMetric}>
              Save Entry
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
