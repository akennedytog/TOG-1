'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

import { 
  PiggyBank, 
  Plus, 
  Target,
  TrendingUp,
  Umbrella,
  Baby,
  DollarSign,
  GraduationCap,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Calendar,
  ArrowRight,
  Sparkles,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

interface SavingsGoal {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  category: string;
  due_date?: string | null;
  monthly_suggestion: number;
  months_to_save: number;
  description: string;
  priority: 'essential' | 'important' | 'optional';
}

interface SavingsGoalsProps {
  userId?: string | null;
  dueDate?: string | null;
  incomeBracket?: string | null;
  insuranceType?: string | null;
  deductible?: number | null;
}

// Calculate suggested amounts based on realistic data
const calculateGoalAmounts = (
  incomeBracket?: string | null,
  insuranceType?: string | null,
  deductible?: number | null
) => {
  const isLowerIncome = incomeBracket?.includes('50k') || incomeBracket?.includes('30k');
  const isHigherIncome = incomeBracket?.includes('100k') || incomeBracket?.includes('150k');
  
  // Hospital costs based on insurance
  const getHospitalCost = () => {
    if (deductible) return deductible;
    if (insuranceType?.includes('high-deductible')) return 7000;
    if (insuranceType?.includes('poor') || insuranceType?.includes('none')) return 15000;
    if (insuranceType?.includes('excellent')) return 500;
    return isLowerIncome ? 2000 : isHigherIncome ? 4000 : 3000;
  };
  
  // Emergency fund: 3 months of baby expenses
  const monthlyBabyExpenses = isLowerIncome ? 800 : isHigherIncome ? 2000 : 1200;
  
  return {
    emergency: monthlyBabyExpenses * 3, // 3 months buffer
    hospital: getHospitalCost(),
    gear: isLowerIncome ? 800 : isHigherIncome ? 3000 : 1800,
    diaper: 1000, // ~$85/month × 12 months
    college: isLowerIncome ? 1000 : isHigherIncome ? 5000 : 2500,
  };
};

// Goal configurations with realistic timelines
const GOAL_CONFIGS = [
  {
    id: 'emergency',
    name: 'Baby Emergency Fund',
    icon: Umbrella,
    description: '3 months of baby expenses for unexpected costs (medical, job loss, etc.)',
    priority: 'essential' as const,
    monthsDefault: 6,
    color: 'from-red-50 to-red-100',
    borderColor: 'border-red-200',
    accentColor: 'text-red-700',
    barColor: 'bg-red-500',
    tip: 'Keep this in a high-yield savings account for easy access',
  },
  {
    id: 'hospital',
    name: 'Hospital & Delivery',
    icon: Baby,
    description: 'Deductibles, copays, and out-of-pocket costs for delivery',
    priority: 'essential' as const,
    monthsDefault: 9,
    color: 'from-blue-50 to-blue-100',
    borderColor: 'border-blue-200',
    accentColor: 'text-blue-700',
    barColor: 'bg-blue-500',
    tip: 'Call your insurance to verify exact out-of-pocket maximum',
  },
  {
    id: 'gear',
    name: 'Baby Gear & Setup',
    icon: Target,
    description: 'Crib, car seat, stroller, nursery essentials, and initial supplies',
    priority: 'essential' as const,
    monthsDefault: 9,
    color: 'from-emerald-50 to-emerald-100',
    borderColor: 'border-emerald-200',
    accentColor: 'text-emerald-700',
    barColor: 'bg-emerald-500',
    tip: 'Buy used crib ($50-100) and car seat (only if barely used) to save',
  },
  {
    id: 'diaper',
    name: 'First Year Diaper Fund',
    icon: PiggyBank,
    description: '~$85/month for diapers and wipes in year one',
    priority: 'important' as const,
    monthsDefault: 12,
    color: 'from-amber-50 to-amber-100',
    borderColor: 'border-amber-200',
    accentColor: 'text-amber-700',
    barColor: 'bg-amber-500',
    tip: 'Amazon Subscribe & Save or Costco can save 20-30%',
  },
  {
    id: 'college',
    name: 'College Fund Starter',
    icon: GraduationCap,
    description: '529 plan initial contribution (grows tax-free for 18 years!)',
    priority: 'optional' as const,
    monthsDefault: 18,
    color: 'from-purple-50 to-purple-100',
    borderColor: 'border-purple-200',
    accentColor: 'text-purple-700',
    barColor: 'bg-purple-500',
    tip: 'Even $50/month for 18 years = ~$20k with growth',
  },
];

export function SavingsGoals({ userId, dueDate, incomeBracket, insuranceType, deductible }: SavingsGoalsProps) {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddAmount, setShowAddAmount] = useState<string | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);

  const daysUntilDue = dueDate 
    ? Math.ceil((new Date(dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 270;
  const monthsUntilDue = Math.max(1, Math.ceil(daysUntilDue / 30));

  useEffect(() => {
    // Calculate goal amounts
    const amounts = calculateGoalAmounts(incomeBracket, insuranceType, deductible);
    
    // Create goals with calculated amounts
    const presetGoals = GOAL_CONFIGS.map(config => {
      const targetAmount = amounts[config.id as keyof typeof amounts] || 2000;
      const monthsToSave = Math.min(config.monthsDefault, monthsUntilDue);
      const monthlyNeeded = Math.ceil(targetAmount / monthsToSave);
      
      return {
        id: config.id,
        name: config.name,
        target_amount: targetAmount,
        current_amount: 0,
        category: config.id,
        due_date: dueDate,
        monthly_suggestion: monthlyNeeded,
        months_to_save: monthsToSave,
        description: config.description,
        priority: config.priority,
      };
    });
    
    setGoals(presetGoals);
    setLoading(false);
    
    // Try to load saved data if userId exists
    if (userId) {
      loadSavedGoals();
    }
  }, [userId, dueDate, incomeBracket, insuranceType, deductible]);

  const loadSavedGoals = async () => {
    try {
      const { data } = await supabase
        .from('savings_goals')
        .select('*')
        .eq('user_id', userId);
      
      if (data && data.length > 0) {
        // Merge saved amounts with calculated targets
        setGoals(prev => prev.map(goal => {
          const saved = data.find((d: any) => d.goal_id === goal.id);
          return saved ? { ...goal, current_amount: saved.current_amount } : goal;
        }));
      }
    } catch (e) {
      console.log('No saved goals found');
    }
  };

  const updateGoalProgress = (goalId: string, amount: number) => {
    setGoals(goals.map(g => 
      g.id === goalId ? { 
        ...g, 
        current_amount: Math.min(g.target_amount, g.current_amount + amount) 
      } : g
    ));
    setShowAddAmount(null);
    setCustomAmount('');
    
    // Save to database if userId exists
    if (userId) {
      saveGoalProgress(goalId, amount);
    }
  };

  const saveGoalProgress = async (goalId: string, amount: number) => {
    try {
      const goal = goals.find(g => g.id === goalId);
      if (!goal) return;
      
      await supabase
        .from('savings_goals')
        .upsert({
          user_id: userId,
          goal_id: goalId,
          current_amount: goal.current_amount + amount,
          target_amount: goal.target_amount,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id,goal_id' });
    } catch (e) {
      console.error('Failed to save goal:', e);
    }
  };

  // Calculate totals
  const totalTarget = goals.reduce((sum, g) => sum + g.target_amount, 0);
  const totalSaved = goals.reduce((sum, g) => sum + g.current_amount, 0);
  const totalRemaining = totalTarget - totalSaved;
  const percentComplete = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;
  
  // Monthly needed based on what's left
  const totalMonthlyNeeded = goals.reduce((sum, g) => {
    const remaining = g.target_amount - g.current_amount;
    if (remaining <= 0) return sum;
    return sum + Math.ceil(remaining / Math.max(1, Math.min(g.months_to_save, monthsUntilDue)));
  }, 0);

  // Priority breakdown
  const essentialGoals = goals.filter(g => g.priority === 'essential');
  const importantGoals = goals.filter(g => g.priority === 'important');
  const optionalGoals = goals.filter(g => g.priority === 'optional');
  
  const essentialSaved = essentialGoals.reduce((sum, g) => sum + g.current_amount, 0);
  const essentialTarget = essentialGoals.reduce((sum, g) => sum + g.target_amount, 0);
  const essentialProgress = essentialTarget > 0 ? (essentialSaved / essentialTarget) * 100 : 0;

  if (loading) {
    return (
      <Card className="border-warm-100">
        <CardContent className="p-8 text-center">
          <div className="w-8 h-8 border-4 border-warm-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-warm-600">Loading savings goals...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-warm-100">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <PiggyBank className="w-5 h-5 text-emerald-500" />
              Savings Goals
            </CardTitle>
            <p className="text-sm text-warm-500 mt-1">
              {goals.length} goals based on your profile • ${totalTarget.toLocaleString()} total needed
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4">
            <div className="text-sm text-emerald-700 mb-1">Total Saved</div>
            <div className="text-2xl font-bold text-emerald-900">${totalSaved.toLocaleString()}</div>
            <div className="text-xs text-emerald-600">of ${totalTarget.toLocaleString()}</div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
            <div className="text-sm text-blue-700 mb-1">Still Needed</div>
            <div className="text-2xl font-bold text-blue-900">${totalRemaining.toLocaleString()}</div>
            <div className="text-xs text-blue-600">to reach all goals</div>
          </div>
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4">
            <div className="text-sm text-amber-700 mb-1">Monthly Goal</div>
            <div className="text-2xl font-bold text-amber-900">${totalMonthlyNeeded.toLocaleString()}</div>
            <div className="text-xs text-amber-600">to stay on track</div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
            <div className="text-sm text-purple-700 mb-1">Progress</div>
            <div className="text-2xl font-bold text-purple-900">{Math.round(percentComplete)}%</div>
            <div className="text-xs text-purple-600">overall complete</div>
          </div>
        </div>

        {/* Timeline Alert */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-blue-900">
                {monthsUntilDue} months until due date
              </h4>
              <p className="text-sm text-blue-700 mt-1">
                Save <strong>${totalMonthlyNeeded.toLocaleString()}/month</strong> to reach all goals on time.
                {essentialProgress < 100 && (
                  <span> Prioritize the {essentialGoals.filter(g => g.current_amount < g.target_amount).length} essential goals first!</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Essential Goals Priority */}
        {essentialProgress < 100 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span className="font-semibold text-red-900">Essential Goals</span>
              </div>
              <span className="text-sm text-red-700">{Math.round(essentialProgress)}% complete</span>
            </div>
            <div className="h-2 bg-red-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-red-500 rounded-full transition-all"
                style={{ width: `${Math.min(essentialProgress, 100)}%` }}
              />
            </div>
            <p className="text-xs text-red-600 mt-2">
              ${(essentialTarget - essentialSaved).toLocaleString()} still needed for emergency fund, hospital, and gear
            </p>
          </div>
        )}

        {/* Goals List */}
        <div className="space-y-3">
          {GOAL_CONFIGS.map((config) => {
            const goal = goals.find(g => g.id === config.id);
            if (!goal) return null;
            
            const progress = (goal.current_amount / goal.target_amount) * 100;
            const isComplete = progress >= 100;
            const remaining = goal.target_amount - goal.current_amount;
            const isPriority = goal.priority === 'essential' && !isComplete;

            return (
              <div 
                key={config.id} 
                className={cn(
                  "border rounded-xl p-4 transition-all",
                  config.color,
                  config.borderColor,
                  isPriority && "ring-2 ring-red-400 ring-offset-1"
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center",
                      config.barColor
                    )}>
                      <config.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-warm-900">{config.name}</h4>
                        <Badge className={cn(
                          "text-xs",
                          goal.priority === 'essential' && "bg-red-100 text-red-700",
                          goal.priority === 'important' && "bg-blue-100 text-blue-700",
                          goal.priority === 'optional' && "bg-gray-100 text-gray-700"
                        )}>
                          {goal.priority}
                        </Badge>
                      </div>
                      <p className="text-xs text-warm-500">{config.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-warm-900">
                      ${goal.current_amount.toLocaleString()}
                    </div>
                    <div className="text-xs text-warm-500">
                      of ${goal.target_amount.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className={config.accentColor}>
                      {isComplete ? (
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" />
                          Goal reached!
                        </span>
                      ) : (
                        <span>
                          Save ${goal.monthly_suggestion.toLocaleString()}/month
                        </span>
                      )}
                    </span>
                    <span className="text-warm-600">{Math.round(progress)}%</span>
                  </div>
                  <div className="h-2 bg-white rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full rounded-full transition-all",
                        config.barColor
                      )}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Quick Add or Tip */}
                {!isComplete ? (
                  <div className="mt-3">
                    {showAddAmount === config.id ? (
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          placeholder="Amount saved..."
                          value={customAmount}
                          onChange={(e) => setCustomAmount(e.target.value)}
                          className="flex-1"
                          autoFocus
                        />
                        <Button 
                          size="sm"
                          className={config.barColor}
                          onClick={() => {
                            const val = parseFloat(customAmount);
                            if (val > 0) updateGoalProgress(config.id, val);
                          }}
                        >
                          Add
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setShowAddAmount(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-warm-600 flex items-center gap-1">
                          <Lightbulb className="w-3 h-3" />
                          {config.tip}
                        </p>
                        <div className="flex gap-2">
                          <Button 
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setShowAddAmount(config.id);
                              setCustomAmount(goal.monthly_suggestion.toString());
                            }}
                          >
                            +${goal.monthly_suggestion.toLocaleString()}
                          </Button>
                          <Button 
                            size="sm"
                            className={config.barColor}
                            onClick={() => setShowAddAmount(config.id)}
                          >
                            Add Savings
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mt-3 p-2 bg-white/50 rounded-lg flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm text-emerald-700">
                      Congratulations! This goal is complete.
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="bg-warm-50 rounded-xl p-4">
          <h4 className="font-semibold text-warm-900 mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Quick Actions
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Button 
              variant="outline" 
              className="justify-start"
              onClick={() => {
                // Auto-fill minimum amounts for essential goals
                essentialGoals.forEach(g => {
                  if (g.current_amount < g.target_amount) {
                    updateGoalProgress(g.id, Math.min(g.monthly_suggestion, g.target_amount - g.current_amount));
                  }
                });
              }}
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              Add minimum to essential goals
            </Button>
            <Button 
              variant="outline" 
              className="justify-start"
              onClick={() => {
                // Add a little to all goals
                goals.forEach(g => {
                  if (g.current_amount < g.target_amount) {
                    updateGoalProgress(g.id, Math.ceil(g.monthly_suggestion / 2));
                  }
                });
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Split savings across all goals
            </Button>
          </div>
        </div>

        {/* Information */}
        <div className="flex items-start gap-2 text-xs text-warm-500">
          <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <p>
            These amounts are estimates based on typical costs. Your actual expenses may vary. 
            Adjust goals by clicking the amounts. Progress saves automatically.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
