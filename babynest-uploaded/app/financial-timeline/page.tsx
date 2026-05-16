'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  AlertCircle,
  Calendar,
  DollarSign,
  Shield,
  GraduationCap,
  FileText,
  PiggyBank,
  ChevronRight,
  Baby,
  Calculator
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface TimelineEvent {
  id: string;
  week: number;
  title: string;
  description: string;
  category: 'insurance' | 'savings' | 'tax' | 'legal' | 'benefits';
  deadline: Date;
  completed: boolean;
  icon: React.ReactNode;
  actionLink?: string;
  estimatedSavings?: number;
}

export default function FinancialTimelinePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(0);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/signin');
        return;
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileData?.due_date) {
        const dueDate = new Date(profileData.due_date);
        const now = new Date();
        const diffTime = dueDate.getTime() - now.getTime();
        const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
        const weeksPregnant = 40 - diffWeeks;
        setCurrentWeek(Math.max(0, Math.min(40, weeksPregnant)));
        setProfile(profileData);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDeadline = (weeksBeforeBirth: number) => {
    if (!profile?.due_date) return new Date();
    const dueDate = new Date(profile.due_date);
    return new Date(dueDate.getTime() - weeksBeforeBirth * 7 * 24 * 60 * 60 * 1000);
  };

  const getTimelineEvents = (): TimelineEvent[] => {
    return [
      {
        id: 'week12-insurance',
        week: 12,
        title: 'Insurance Enrollment Deadline',
        description: 'Add baby to health insurance within your state\'s deadline. Most states require 30-60 days after birth.',
        category: 'insurance',
        deadline: calculateDeadline(28 * 7), // ~12 weeks before birth
        completed: completedTasks.includes('week12-insurance'),
        icon: <Shield className="w-6 h-6" />,
        actionLink: '/settings',
        estimatedSavings: 0
      },
      {
        id: 'week16-fsa',
        week: 16,
        title: 'Adjust FSA/HSA Contributions',
        description: 'Increase your Flexible Spending Account contributions for increased medical expenses.',
        category: 'benefits',
        deadline: calculateDeadline(24 * 7),
        completed: completedTasks.includes('week16-fsa'),
        icon: <PiggyBank className="w-6 h-6" />,
        actionLink: '/settings',
        estimatedSavings: 2000
      },
      {
        id: 'week20-hsa',
        week: 20,
        title: 'Max Out HSA Contributions',
        description: 'Contribute maximum to HSA for tax-free medical savings. Family limit: $7,750.',
        category: 'benefits',
        deadline: calculateDeadline(20 * 7),
        completed: completedTasks.includes('week20-hsa'),
        icon: <Calculator className="w-6 h-6" />,
        actionLink: '/settings',
        estimatedSavings: 1800
      },
      {
        id: 'week24-will',
        week: 24,
        title: 'Create or Update Will',
        description: 'Name guardians for your child and update beneficiaries on all accounts.',
        category: 'legal',
        deadline: calculateDeadline(16 * 7),
        completed: completedTasks.includes('week24-will'),
        icon: <FileText className="w-6 h-6" />,
        actionLink: '/settings',
        estimatedSavings: 0
      },
      {
        id: 'week28-529',
        week: 28,
        title: 'Research 529 Plans',
        description: `Compare ${profile?.state || 'your state'}\'s 529 plan with other states\' options.`,
        category: 'savings',
        deadline: calculateDeadline(12 * 7),
        completed: completedTasks.includes('week28-529'),
        icon: <GraduationCap className="w-6 h-6" />,
        actionLink: '/baby-name',
        estimatedSavings: 0
      },
      {
        id: 'week32-open-529',
        week: 32,
        title: 'Open 529 Account',
        description: 'Start saving for education. Even $25/month compounds significantly over 18 years.',
        category: 'savings',
        deadline: calculateDeadline(8 * 7),
        completed: completedTasks.includes('week32-open-529'),
        icon: <DollarSign className="w-6 h-6" />,
        actionLink: '/baby-name',
        estimatedSavings: 500
      },
      {
        id: 'week36-tax',
        week: 36,
        title: 'Tax Planning Review',
        description: 'Plan for Child Tax Credit ($2,000/child) and update W-4 withholding.',
        category: 'tax',
        deadline: calculateDeadline(4 * 7),
        completed: completedTasks.includes('week36-tax'),
        icon: <Calculator className="w-6 h-6" />,
        actionLink: '/settings',
        estimatedSavings: 2000
      },
      {
        id: 'birth-birth-cert',
        week: 40,
        title: 'Order Birth Certificate',
        description: 'Request certified copies for insurance, taxes, and banking.',
        category: 'legal',
        deadline: calculateDeadline(0),
        completed: completedTasks.includes('birth-birth-cert'),
        icon: <FileText className="w-6 h-6" />,
        actionLink: '/settings',
        estimatedSavings: 0
      },
      {
        id: 'birth-ssn',
        week: 40,
        title: 'Apply for Social Security Number',
        description: 'Required for tax purposes and future benefits.',
        category: 'legal',
        deadline: new Date(calculateDeadline(0).getTime() + 14 * 24 * 60 * 60 * 1000),
        completed: completedTasks.includes('birth-ssn'),
        icon: <Baby className="w-6 h-6" />,
        actionLink: '/settings',
        estimatedSavings: 0
      },
      {
        id: 'after-birth-tax',
        week: 41,
        title: 'File Tax Credits',
        description: 'Claim Child Tax Credit, Dependent Care Credit, and any eligible deductions.',
        category: 'tax',
        deadline: new Date(new Date().getFullYear() + 1, 3, 15),
        completed: completedTasks.includes('after-birth-tax'),
        icon: <DollarSign className="w-6 h-6" />,
        actionLink: '/settings',
        estimatedSavings: 3000
      }
    ];
  };

  const toggleTask = (taskId: string) => {
    setCompletedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'insurance': return 'text-blue-500 bg-blue-50 border-blue-200';
      case 'savings': return 'text-green-500 bg-green-50 border-green-200';
      case 'tax': return 'text-purple-500 bg-purple-50 border-purple-200';
      case 'legal': return 'text-amber-500 bg-amber-50 border-amber-200';
      case 'benefits': return 'text-cyan-500 bg-cyan-50 border-cyan-200';
      default: return 'text-gray-500 bg-gray-50 border-gray-200';
    }
  };

  const events = getTimelineEvents();
  const upcomingEvents = events.filter(e => e.week >= currentWeek).slice(0, 3);
  const totalSavings = events.filter(e => completedTasks.includes(e.id))
    .reduce((sum, e) => sum + (e.estimatedSavings || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-2">Financial Timeline</h1>
          <p className="text-primary-100">
            Week {currentWeek} of pregnancy • Stay on track with your financial milestones
          </p>
          
          {/* Progress Summary */}
          <div className="mt-6 flex flex-wrap gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
              <span className="text-sm text-primary-100">Completed</span>
              <p className="text-2xl font-bold">{completedTasks.length}/{events.length}</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
              <span className="text-sm text-primary-100">Money Saved</span>
              <p className="text-2xl font-bold">${totalSavings.toLocaleString()}</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
              <span className="text-sm text-primary-100">Next Milestone</span>
              <p className="text-2xl font-bold">Week {upcomingEvents[0]?.week || 40}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Tasks */}
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-xl font-bold text-warm-900 mb-4">Up Next</h2>
        <div className="grid md:grid-cols-3 gap-4 mb-12">
          {upcomingEvents.map((event) => (
            <Card key={event.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${getCategoryColor(event.category)}`}>
                    {event.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-warm-500">Week {event.week}</p>
                    <h3 className="font-semibold text-warm-900 text-sm">{event.title}</h3>
                    <p className="text-xs text-warm-600 mt-1 line-clamp-2">{event.description}</p>
                    {event.estimatedSavings ? (
                      <p className="text-xs text-green-600 font-medium mt-1">
                        Save ${event.estimatedSavings.toLocaleString()}
                      </p>
                    ) : null}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Full Timeline */}
        <h2 className="text-xl font-bold text-warm-900 mb-6">Complete Timeline</h2>
        <div className="space-y-4">
          {events.map((event, index) => {
            const isCompleted = completedTasks.includes(event.id);
            const isPast = event.week < currentWeek;
            const isCurrent = event.week === currentWeek;

            return (
              <Card 
                key={event.id} 
                className={`transition-all ${
                  isCurrent ? 'ring-2 ring-primary-500 shadow-lg' : ''
                } ${isCompleted ? 'opacity-70' : ''}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Checkbox */}
                    <button
                      onClick={() => toggleTask(event.id)}
                      className="mt-1 flex-shrink-0"
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-6 h-6 text-green-500" />
                      ) : (
                        <Circle className={`w-6 h-6 ${isCurrent ? 'text-primary-500' : 'text-warm-300'}`} />
                      )}
                    </button>

                    {/* Icon */}
                    <div className={`p-3 rounded-xl flex-shrink-0 ${getCategoryColor(event.category)}`}>
                      {event.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-primary-600">
                          Week {event.week}
                        </span>
                        {isCurrent && (
                          <span className="bg-primary-100 text-primary-700 text-xs px-2 py-0.5 rounded-full">
                            Current
                          </span>
                        )}
                        {event.estimatedSavings > 0 && (
                          <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">
                            Save ${event.estimatedSavings.toLocaleString()}
                          </span>
                        )}
                      </div>
                      
                      <h3 className={`font-bold text-lg mb-1 ${
                        isCompleted ? 'line-through text-warm-400' : 'text-warm-900'
                      }`}>
                        {event.title}
                      </h3>
                      
                      <p className="text-warm-600 mb-3">{event.description}</p>

                      {/* Action */}
                      {event.actionLink && !isCompleted && (
                        <Link href={event.actionLink}>
                          <Button variant="outline" size="sm" className="group">
                            Take Action
                            <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </Link>
                      )}
                    </div>

                    {/* Due Date */}
                    <div className="text-right flex-shrink-0 hidden sm:block">
                      <p className="text-sm text-warm-500">Due by</p>
                      <p className="font-medium text-warm-700">
                        {event.deadline.toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
