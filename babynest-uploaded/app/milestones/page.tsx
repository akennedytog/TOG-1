'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  Target, 
  DollarSign,
  CheckCircle2,
  Lock,
  Star,
  Flame,
  Award,
  TrendingUp,
  Gift,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface Milestone {
  id: string;
  title: string;
  description: string;
  tasksRequired: number;
  icon: React.ReactNode;
  reward: string;
  unlocked: boolean;
  progress: number;
}

interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  category: string;
  estimatedSavings: number;
  points: number;
}

const TASKS: Task[] = [
  {
    id: 'insurance-review',
    title: 'Review Insurance Coverage',
    description: 'Understand your deductible, out-of-pocket max, and coverage',
    category: 'Insurance',
    estimatedSavings: 0,
    points: 100,
    completed: false
  },
  {
    id: 'hospital-research',
    title: 'Compare Hospital Costs',
    description: 'Research delivery costs at hospitals in your area',
    category: 'Research',
    estimatedSavings: 5000,
    points: 150,
    completed: false
  },
  {
    id: 'fsa-setup',
    title: 'Set Up FSA/HSA',
    description: 'Increase contributions for medical expenses',
    category: 'Benefits',
    estimatedSavings: 2000,
    points: 200,
    completed: false
  },
  {
    id: '529-research',
    title: 'Research 529 Plans',
    description: 'Compare your state\'s 529 plan with other options',
    category: 'Savings',
    estimatedSavings: 0,
    points: 100,
    completed: false
  },
  {
    id: '529-open',
    title: 'Open 529 Account',
    description: 'Start saving for education with tax advantages',
    category: 'Savings',
    estimatedSavings: 500,
    points: 250,
    completed: false
  },
  {
    id: 'will-update',
    title: 'Update Your Will',
    description: 'Name guardians and update beneficiaries',
    category: 'Legal',
    estimatedSavings: 0,
    points: 200,
    completed: false
  },
  {
    id: 'tax-planning',
    title: 'Tax Planning Review',
    description: 'Plan for Child Tax Credit and adjust withholding',
    category: 'Taxes',
    estimatedSavings: 2000,
    points: 150,
    completed: false
  },
  {
    id: 'emergency-fund',
    title: 'Boost Emergency Fund',
    description: 'Save 3-6 months of expenses for baby costs',
    category: 'Savings',
    estimatedSavings: 0,
    points: 300,
    completed: false
  },
  {
    id: 'life-insurance',
    title: 'Review Life Insurance',
    description: 'Ensure adequate coverage for your growing family',
    category: 'Insurance',
    estimatedSavings: 0,
    points: 150,
    completed: false
  },
  {
    id: 'birth-plan-costs',
    title: 'Plan Birth Costs',
    description: 'Estimate total out-of-pocket delivery costs',
    category: 'Planning',
    estimatedSavings: 1000,
    points: 100,
    completed: false
  }
];

const MILESTONES: Omit<Milestone, 'unlocked' | 'progress'>[] = [
  {
    id: 'starter',
    title: 'Getting Started',
    description: 'Complete your first financial task',
    tasksRequired: 1,
    icon: <Star className="w-6 h-6" />,
    reward: 'Welcome badge + $100 savings guide'
  },
  {
    id: 'saver',
    title: 'Smart Saver',
    description: 'Complete 3 tasks and save $1,000+',
    tasksRequired: 3,
    icon: <DollarSign className="w-6 h-6" />,
    reward: 'Saver badge + $500 savings guide'
  },
  {
    id: 'planner',
    title: 'Master Planner',
    description: 'Complete 5 tasks from different categories',
    tasksRequired: 5,
    icon: <Target className="w-6 h-6" />,
    reward: 'Planner badge + $1,000 savings guide'
  },
  {
    id: 'expert',
    title: 'Finance Expert',
    description: 'Complete 8 tasks and save $3,000+',
    tasksRequired: 8,
    icon: <Trophy className="w-6 h-6" />,
    reward: 'Expert badge + $2,000 savings guide'
  },
  {
    id: 'champion',
    title: 'BabyNest Champion',
    description: 'Complete all 10 tasks',
    tasksRequired: 10,
    icon: <Award className="w-6 h-6" />,
    reward: 'Champion badge + Exclusive content'
  }
];

export default function MilestonesPage() {
  const [tasks, setTasks] = useState<Task[]>(TASKS);
  const [totalSavings, setTotalSavings] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [streak, setStreak] = useState(5);

  useEffect(() => {
    const completed = tasks.filter(t => t.completed);
    const savings = completed.reduce((sum, t) => sum + t.estimatedSavings, 0);
    const points = completed.reduce((sum, t) => sum + t.points, 0);
    setTotalSavings(savings);
    setTotalPoints(points);
  }, [tasks]);

  const toggleTask = (taskId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const completedCount = tasks.filter(t => t.completed).length;

  const getMilestones = (): Milestone[] => {
    return MILESTONES.map(m => {
      const progress = Math.min(100, (completedCount / m.tasksRequired) * 100);
      return {
        ...m,
        unlocked: completedCount >= m.tasksRequired,
        progress
      };
    });
  };

  const milestones = getMilestones();
  const nextMilestone = milestones.find(m => !m.unlocked);

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Flame className="w-5 h-5 text-amber-300" />
                <span className="text-amber-300 font-semibold">{streak} day streak!</span>
              </div>
              <h1 className="text-3xl font-bold mb-1">Money-Saving Milestones</h1>
              <p className="text-primary-100">Complete tasks, earn points, unlock rewards</p>
            </div>
            
            <div className="text-right">
              <div className="text-3xl font-bold">{totalPoints.toLocaleString()}</div>
              <div className="text-sm text-primary-100">Total Points</div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-warm-900">{completedCount}/{tasks.length}</p>
              <p className="text-sm text-warm-600">Tasks Completed</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <DollarSign className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-warm-900">${totalSavings.toLocaleString()}</p>
              <p className="text-sm text-warm-600">Money Saved</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Trophy className="w-8 h-8 text-amber-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-warm-900">{milestones.filter(m => m.unlocked).length}</p>
              <p className="text-sm text-warm-600">Milestones</p>
            </CardContent>
          </Card>
        </div>

        {/* Next Milestone */}
        {nextMilestone && (
          <Card className="mb-8 border-2 border-primary-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary-100 rounded-full">
                  {nextMilestone.icon}
                </div>
                
                <div className="flex-1">
                  <p className="text-sm text-primary-600 font-medium">Next Milestone</p>
                  <h3 className="text-xl font-bold text-warm-900">{nextMilestone.title}</h3>
                  <p className="text-warm-600 text-sm">{nextMilestone.description}</p>
                  
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>{completedCount} of {nextMilestone.tasksRequired} tasks</span>
                      <span className="text-primary-600 font-medium">{Math.round(nextMilestone.progress)}%</span>
                    </div>
                    <Progress value={nextMilestone.progress} className="h-2" />
                  </div>                
                </div>
                
                <div className="text-right">
                  <Gift className="w-6 h-6 text-amber-500 mx-auto mb-1" />
                  <p className="text-xs text-warm-600">Reward:</p>
                  <p className="text-sm font-medium text-warm-900">{nextMilestone.reward}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tasks Section */}
        <h2 className="text-xl font-bold text-warm-900 mb-4">Financial Tasks</h2>
        
        <div className="space-y-3 mb-8">
          {tasks.map((task) => (
            <Card 
              key={task.id}
              className={`transition-all ${task.completed ? 'opacity-60' : 'hover:shadow-md'}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <button
                    onClick={() => toggleTask(task.id)}
                    className="mt-1 flex-shrink-0"
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                    ) : (
                      <div className="w-6 h-6 rounded-full border-2 border-warm-300" />
                    )}
                  </button>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`font-semibold ${task.completed ? 'line-through text-warm-400' : 'text-warm-900'}`}>
                        {task.title}
                      </h3>
                      <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">
                        +{task.points} pts
                      </span>
                    </div>
                    
                    <p className="text-sm text-warm-600 mb-2">{task.description}</p>
                    
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-warm-500">{task.category}</span>
                      {task.estimatedSavings > 0 && (
                        <span className="text-green-600 font-medium">
                          Save ${task.estimatedSavings.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* All Milestones */}
        <h2 className="text-xl font-bold text-warm-900 mb-4">All Milestones</h2>
        
        <div className="grid md:grid-cols-2 gap-4">
          {milestones.map((milestone) => (
            <Card 
              key={milestone.id}
              className={`${milestone.unlocked ? 'bg-gradient-to-br from-amber-50 to-orange-50' : 'bg-warm-50'}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-full ${
                    milestone.unlocked ? 'bg-amber-200 text-amber-700' : 'bg-warm-200 text-warm-500'
                  }`}>
                    {milestone.unlocked ? milestone.icon : <Lock className="w-5 h-5" />}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-warm-900">{milestone.title}</h3>
                      {milestone.unlocked && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                          Unlocked!
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-warm-600 mb-2">{milestone.description}</p>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <Gift className="w-4 h-4 text-amber-500" />
                      <span className={milestone.unlocked ? 'text-amber-700 font-medium' : 'text-warm-500'}>
                        {milestone.reward}
                      </span>
                    </div>
                    
                    {!milestone.unlocked && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-warm-500">Progress</span>
                          <span className="text-warm-600">{completedCount}/{milestone.tasksRequired}</span>
                        </div>
                        <Progress value={milestone.progress} className="h-1.5" />
                      </div>
                    )}
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
