'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  Receipt, 
  Plus, 
  Trash2, 
  TrendingUp, 
  TrendingDown,
  AlertCircle,
  ShoppingCart,
  Baby,
  Heart,
  DollarSign,
  Package,
  Sparkles,
  Calendar,
  Lightbulb,
  CheckCircle2,
  Info,
  ChevronRight
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { ScrollReveal, GlassCard, StaggerContainer, StaggerItem } from '@/app/providers';
import { ColoredGlassCard } from '@/components/ui/GlassCard';

interface Expense {
  id: string;
  category: string;
  amount: number;
  description: string;
  date: string;
  is_recurring: boolean;
  is_template?: boolean;
}

interface BudgetTrackerProps {
  userId?: string | null;
  dueDate?: string | null;
  incomeBracket?: string | null;
  householdSize?: number;
}

// Smart categories with realistic baby expenses (based on 2024 data)
const SMART_CATEGORIES = [
  { 
    id: 'diapers', 
    name: 'Diapers & Wipes', 
    icon: Package,
    monthlyEstimate: 85,
    yearlyEstimate: 1020,
    description: '~$85/month (0-12 months)',
    essential: true,
    tips: ['Buy in bulk', 'Try generic brands', 'Use cloth diapers part-time']
  },
  { 
    id: 'formula', 
    name: 'Formula & Food', 
    icon: Baby,
    monthlyEstimate: 175,
    yearlyEstimate: 2100,
    description: '~$175/month if formula feeding',
    essential: true,
    tips: ['Buy generic formula', 'Make baby food at home', 'Breastfeed if possible']
  },
  { 
    id: 'clothing', 
    name: 'Clothing', 
    icon: ShoppingCart,
    monthlyEstimate: 60,
    yearlyEstimate: 720,
    description: '~$60/month (they grow fast!)',
    essential: false,
    tips: ['Buy used', 'Accept hand-me-downs', 'Shop end-of-season sales']
  },
  { 
    id: 'gear', 
    name: 'Baby Gear & Furniture', 
    icon: Package,
    monthlyEstimate: 150,
    yearlyEstimate: 1800,
    description: 'One-time purchases spread over year',
    essential: true,
    tips: ['Buy used crib/stroller', 'Skip the changing table', 'Get multi-purpose items']
  },
  { 
    id: 'medical', 
    name: 'Medical & Insurance', 
    icon: Heart,
    monthlyEstimate: 250,
    yearlyEstimate: 3000,
    description: 'Copays, premiums, unexpected visits',
    essential: true,
    tips: ['Max out HSA', 'Bundle pediatric visits', 'Use nurse hotlines']
  },
  { 
    id: 'childcare', 
    name: 'Childcare', 
    icon: Baby,
    monthlyEstimate: 1200,
    yearlyEstimate: 14400,
    description: 'Daycare, nanny, or babysitting',
    essential: false,
    tips: ['Family daycare vs center', 'Nanny share', 'Flexible work arrangements']
  },
  { 
    id: 'misc', 
    name: 'Miscellaneous', 
    icon: DollarSign,
    monthlyEstimate: 100,
    yearlyEstimate: 1200,
    description: 'Toys, books, unexpected costs',
    essential: false,
    tips: ['Library for books', 'Rotate toys', 'Minimalism approach']
  },
];

// Realistic expense templates based on income brackets
const getExpenseTemplates = (incomeBracket: string | null | undefined, monthsUntilDue?: number) => {
  const isLowerIncome = incomeBracket?.includes('50k') || incomeBracket?.includes('30k');
  const isHigherIncome = incomeBracket?.includes('100k') || incomeBracket?.includes('150k');
  
  const diaperCost = isLowerIncome ? 60 : isHigherIncome ? 100 : 80;
  const formulaCost = isLowerIncome ? 120 : isHigherIncome ? 200 : 150;
  const medicalCopay = isLowerIncome ? 30 : isHigherIncome ? 50 : 40;
  
  const templates: Expense[] = [
    { 
      id: 'template-diapers', 
      category: 'diapers', 
      description: 'Monthly diapers & wipes subscription', 
      amount: diaperCost, 
      is_recurring: true,
      is_template: true,
      date: new Date().toISOString()
    },
    { 
      id: 'template-formula', 
      category: 'formula', 
      description: 'Formula (if not exclusively breastfeeding)', 
      amount: formulaCost, 
      is_recurring: true,
      is_template: true,
      date: new Date().toISOString()
    },
    { 
      id: 'template-medical', 
      category: 'medical', 
      description: 'Pediatrician visit copays (avg 6 visits/yr)', 
      amount: medicalCopay * 6, 
      is_recurring: false,
      is_template: true,
      date: new Date().toISOString()
    },
    { 
      id: 'template-crib', 
      category: 'gear', 
      description: 'Crib + mattress (buy used to save!)', 
      amount: isLowerIncome ? 200 : 400, 
      is_recurring: false,
      is_template: true,
      date: new Date().toISOString()
    },
    { 
      id: 'template-carseat', 
      category: 'gear', 
      description: 'Car seat (infant convertible)', 
      amount: isLowerIncome ? 150 : isHigherIncome ? 400 : 250, 
      is_recurring: false,
      is_template: true,
      date: new Date().toISOString()
    },
    { 
      id: 'template-stroller', 
      category: 'gear', 
      description: 'Stroller system', 
      amount: isLowerIncome ? 100 : isHigherIncome ? 600 : 300, 
      is_recurring: false,
      is_template: true,
      date: new Date().toISOString()
    },
    { 
      id: 'template-clothes-0-3', 
      category: 'clothing', 
      description: 'Clothes 0-3 months (basics)', 
      amount: isLowerIncome ? 75 : 150, 
      is_recurring: false,
      is_template: true,
      date: new Date().toISOString()
    },
    { 
      id: 'template-hospital', 
      category: 'medical', 
      description: 'Hospital delivery copay/deductible', 
      amount: isLowerIncome ? 1000 : isHigherIncome ? 3000 : 2000, 
      is_recurring: false,
      is_template: true,
      date: new Date().toISOString()
    },
    { 
      id: 'template-insurance', 
      category: 'medical', 
      description: 'Monthly premium increase', 
      amount: isLowerIncome ? 50 : isHigherIncome ? 150 : 100, 
      is_recurring: true,
      is_template: true,
      date: new Date().toISOString()
    },
  ];
  
  return templates;
};

// Get savings tips based on spending patterns
const getSmartTips = (expenses: Expense[], categoryTotals: any[], incomeBracket?: string | null) => {
  const tips = [];
  const totalMonthly = categoryTotals.reduce((sum, cat) => sum + cat.recurring, 0);
  
  const childcare = categoryTotals.find(c => c.id === 'childcare');
  if (childcare && childcare.recurring > 1000) {
    tips.push({
      icon: Lightbulb,
      title: 'Childcare Costs Look High',
      message: 'Consider family daycare ($600-800/mo) vs center ($1000-1500/mo) or nanny share',
      type: 'warning'
    });
  }
  
  const diapers = categoryTotals.find(c => c.id === 'diapers');
  if (diapers && diapers.recurring > 90) {
    tips.push({
      icon: Lightbulb,
      title: 'Save on Diapers',
      message: 'Try bulk buying at Costco/Sam\'s or Amazon Subscribe & Save (20% off)',
      type: 'tip'
    });
  }
  
  const gear = categoryTotals.find(c => c.id === 'gear');
  if (gear && gear.oneTime > 800) {
    tips.push({
      icon: Lightbulb,
      title: 'Gear Spending Alert',
      message: 'Buy used crib ($50-100) and stroller ($50-150) on Facebook Marketplace',
      type: 'tip'
    });
  }
  
  if (totalMonthly > 2500) {
    tips.push({
      icon: AlertCircle,
      title: 'Monthly Budget Review',
      message: `Your projected monthly is $${totalMonthly.toLocaleString()}. Consider which costs are essential vs nice-to-have.`,
      type: 'alert'
    });
  }
  
  return tips.length > 0 ? tips : [{
    icon: CheckCircle2,
    title: 'Budget Looks Good!',
    message: 'Your spending estimates are reasonable. Keep tracking to stay on target.',
    type: 'success'
  }];
};

export function BudgetTracker({ userId, dueDate, incomeBracket, householdSize }: BudgetTrackerProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [newExpense, setNewExpense] = useState({
    category: '',
    amount: '',
    description: '',
    is_recurring: false,
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [hasCustomized, setHasCustomized] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Calculate months until due
    const daysUntilDue = dueDate 
      ? Math.ceil((new Date(dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : 270;
    const monthsUntilDue = Math.max(1, Math.ceil(daysUntilDue / 30));
    
    // Only set templates on initial load if no user data exists
    if (!initialized) {
      if (userId) {
        // Fetch user data first, templates as fallback
        fetchExpenses(monthsUntilDue);
      } else {
        // No user - use templates if expenses are empty
        if (expenses.length === 0 && !hasCustomized) {
          const templates = getExpenseTemplates(incomeBracket, monthsUntilDue);
          setExpenses(templates);
        }
        setLoading(false);
      }
      setInitialized(true);
    }
  }, [userId, dueDate, incomeBracket, initialized, expenses.length, hasCustomized]);

  const fetchExpenses = async (monthsUntilDue?: number) => {
    try {
      if (!userId) return;
      const { data } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (data && data.length > 0) {
        // User has saved expenses - use them
        setExpenses(data as unknown as Expense[]);
        setHasCustomized(true);
      } else {
        // No saved expenses - use templates if not customized
        if (!hasCustomized && expenses.length === 0) {
          const templates = getExpenseTemplates(incomeBracket, monthsUntilDue);
          setExpenses(templates);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      // On error, use templates if no data
      if (!hasCustomized && expenses.length === 0) {
        const templates = getExpenseTemplates(incomeBracket, monthsUntilDue);
        setExpenses(templates);
      }
    } finally {
      setLoading(false);
    }
  };

  const addExpense = async () => {
    if (!newExpense.category || !newExpense.amount) return;
    
    const expenseData = {
      category: newExpense.category,
      amount: parseFloat(newExpense.amount),
      description: newExpense.description || 'Custom expense',
      date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
      is_recurring: newExpense.is_recurring,
    };
    
    // If user is logged in, save to Supabase
    if (userId) {
      try {
        const { data, error } = await supabase
          .from('expenses')
          .insert({
            user_id: userId,
            ...expenseData,
          })
          .select()
          .single();
        
        if (error) {
          console.error('Error adding expense:', error);
          // Fallback to local state if Supabase fails
          const localExpense: Expense = {
            id: `custom-${Date.now()}`,
            ...expenseData,
            is_template: false,
          };
          setExpenses([...expenses, localExpense]);
        } else if (data) {
          // Add the returned expense (with real ID) to state
          setExpenses([...expenses, { ...data, is_template: false } as unknown as Expense]);
        }
      } catch (error) {
        console.error('Error:', error);
        // Fallback to local state
        const localExpense: Expense = {
          id: `custom-${Date.now()}`,
          ...expenseData,
          is_template: false,
        };
        setExpenses([...expenses, localExpense]);
      }
    } else {
      // No user logged in, just add to local state
      const localExpense: Expense = {
        id: `custom-${Date.now()}`,
        ...expenseData,
        is_template: false,
      };
      setExpenses([...expenses, localExpense]);
    }
    
    // Reset form and close
    setNewExpense({ category: '', amount: '', description: '', is_recurring: false });
    setShowAddForm(false);
    setHasCustomized(true);
  };

  const removeExpense = (id: string) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  // Calculate totals
  const categoryTotals = SMART_CATEGORIES.map(cat => {
    const catExpenses = expenses.filter(e => e.category === cat.id);
    const total = catExpenses.reduce((sum, e) => sum + e.amount, 0);
    const recurring = catExpenses.filter(e => e.is_recurring).reduce((sum, e) => sum + e.amount, 0);
    const oneTime = catExpenses.filter(e => !e.is_recurring).reduce((sum, e) => sum + e.amount, 0);
    const percentOfEstimate = (recurring / cat.monthlyEstimate) * 100;
    
    return {
      ...cat,
      total,
      recurring,
      oneTime,
      percentOfEstimate,
      items: catExpenses,
    };
  });

  const totalMonthly = categoryTotals.reduce((sum, cat) => sum + cat.recurring, 0);
  const totalOneTime = categoryTotals.reduce((sum, cat) => sum + cat.oneTime, 0);
  const totalYearly = totalMonthly * 12 + totalOneTime;

  // Calculate due date projections
  const daysUntilDue = dueDate 
    ? Math.ceil((new Date(dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 270;
  const monthsUntilDue = Math.max(1, Math.ceil(daysUntilDue / 30));
  const monthlyToSave = Math.ceil((totalOneTime + (totalMonthly * 3)) / monthsUntilDue); // 3 months buffer
  const projectedFirstYear = totalOneTime + (totalMonthly * 12);

  // Comparison data
  const nationalAverage = 12680; // USDA 2024 first year average
  const percentOfAverage = Math.round((projectedFirstYear / nationalAverage) * 100);
  const vsAverage = projectedFirstYear - nationalAverage;

  // Get smart tips
  const smartTips = getSmartTips(expenses, categoryTotals);

  if (loading) {
    return (
      <GlassCard>
        <CardContent className="p-8 text-center">
          <motion.div
            className="w-8 h-8 border-4 border-warm-200 border-t-primary-500 rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-warm-600">Loading budget...</p>
        </CardContent>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="border-warm-100">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <Receipt className="w-5 h-5 text-primary-500" />
              </motion.div>
              Budget Tracker
            </CardTitle>
            <p className="text-sm text-warm-500 mt-1">
              Smart expense planning for baby's first year
            </p>
          </div>
          <div className="flex gap-2">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => {
                  const daysUntilDue = dueDate 
                    ? Math.ceil((new Date(dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                    : 270;
                  const monthsUntilDue = Math.max(1, Math.ceil(daysUntilDue / 30));
                  const templates = getExpenseTemplates(incomeBracket, monthsUntilDue);
                  setExpenses(templates);
                  setHasCustomized(false);
                }}
                aria-label="Reset to default expense templates"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Reset Templates
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                size="sm" 
                variant="primary"
                onClick={() => setShowAddForm(!showAddForm)}
                aria-label="Add a new expense"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Expense
              </Button>
            </motion.div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-3" delay={0.1}>
            <StaggerItem>
            <ColoredGlassCard color="primary">
              <div className="p-4">
              <div className="text-sm text-primary-700 mb-1">Monthly</div>
              <div className="text-2xl font-bold text-primary-900">${totalMonthly.toLocaleString()}</div>
              <div className="text-xs text-primary-600">Recurring costs</div>
              </div>
            </ColoredGlassCard>
          </StaggerItem>
          <StaggerItem>
            <ColoredGlassCard color="emerald">
              <div className="p-4">
              <div className="text-sm text-emerald-700 mb-1">One-Time</div>
              <div className="text-2xl font-bold text-emerald-900">${totalOneTime.toLocaleString()}</div>
              <div className="text-xs text-emerald-600">Setup costs</div>
              </div>
            </ColoredGlassCard>
          </StaggerItem>
          <StaggerItem>
            <ColoredGlassCard color="purple">
              <div className="p-4">
              <div className="text-sm text-purple-700 mb-1">First Year</div>
              <div className="text-2xl font-bold text-purple-900">${projectedFirstYear.toLocaleString()}</div>
              <div className="text-xs text-purple-600">Total projected</div>
              </div>
            </ColoredGlassCard>
          </StaggerItem>
          <StaggerItem>
            <ColoredGlassCard color="amber">
              <div className="p-4">
              <div className="text-sm text-amber-700 mb-1">Save/Month</div>
              <div className="text-2xl font-bold text-amber-900">${monthlyToSave.toLocaleString()}</div>
              <div className="text-xs text-amber-600">To be ready</div>
              </div>
            </ColoredGlassCard>
          </StaggerItem>
        </StaggerContainer>

        {/* Comparison Bar */}
        <ScrollReveal>
          <div className="bg-warm-50/80 backdrop-blur-sm rounded-xl p-4 border border-warm-100">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-warm-500" />
                <span className="text-sm text-warm-700">vs National Average (${nationalAverage.toLocaleString()})</span>
              </div>
              <motion.span 
                className={cn(
                  "text-sm font-semibold",
                  vsAverage > 0 ? "text-amber-600" : "text-emerald-600"
                )}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
              >
                {vsAverage > 0 ? '+' : ''}{percentOfAverage}%
              </motion.span>
            </div>            
            <div className="h-3 bg-warm-200 rounded-full overflow-hidden">
              <motion.div 
                className={cn(
                  "h-full rounded-full",
                  percentOfAverage <= 100 ? "bg-emerald-500" : percentOfAverage <= 130 ? "bg-amber-500" : "bg-rose-500"
                )}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(percentOfAverage, 100)}%` }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
              />
            </div>
            <p className="text-xs text-warm-500 mt-2">
              USDA estimates middle-income families spend $12,680 on baby's first year
            </p>
          </div>
        </ScrollReveal>

        {/* Smart Insights */}
        <AnimatePresence>
          {smartTips.length > 0 && (
            <div className="space-y-2">
              {smartTips.map((tip, idx) => (
                <ScrollReveal key={idx} delay={idx * 0.1}>
                  <motion.div 
                    className={cn(
                      "border rounded-xl p-3 flex items-start gap-3 backdrop-blur-sm",
                      tip.type === 'warning' && "bg-amber-50/80 border-amber-200",
                      tip.type === 'alert' && "bg-rose-50/80 border-rose-200",
                      tip.type === 'tip' && "bg-primary-50/80 border-primary-200",
                      tip.type === 'success' && "bg-emerald-50/80 border-emerald-200"
                    )}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileHover={{ scale: 1.01, x: 4 }}
                    transition={{ duration: 0.2 }}
                  >
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 0.5 }}
                    >
                      <tip.icon className={cn(
                        "w-5 h-5 flex-shrink-0 mt-0.5",
                        tip.type === 'warning' && "text-amber-600",
                        tip.type === 'alert' && "text-rose-600",
                        tip.type === 'tip' && "text-primary-600",
                        tip.type === 'success' && "text-emerald-600"
                      )} />
                    </motion.div>
                    <div>
                      <h4 className={cn(
                        "font-semibold text-sm",
                        tip.type === 'warning' && "text-amber-900",
                        tip.type === 'alert' && "text-rose-900",
                        tip.type === 'tip' && "text-primary-900",
                        tip.type === 'success' && "text-emerald-900"
                      )}>
                        {tip.title}
                      </h4>
                      <p className={cn(
                        "text-sm mt-0.5",
                        tip.type === 'warning' && "text-amber-700",
                        tip.type === 'alert' && "text-rose-700",
                        tip.type === 'tip' && "text-primary-700",
                        tip.type === 'success' && "text-emerald-700"
                      )}>
                        {tip.message}
                      </p>
                    </div>
                  </motion.div>
                </ScrollReveal>
              ))}
            </div>
          )}
        </AnimatePresence>

        {/* Add Expense Form */}
        <AnimatePresence>
          {showAddForm && (
            <ScrollReveal>
              <motion.div 
                className="bg-warm-50/80 backdrop-blur-sm border border-warm-200 rounded-xl p-4 space-y-3"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <h4 className="font-semibold text-warm-900">Add Custom Expense</h4>
                <div className="grid grid-cols-2 gap-3">
                  <Select 
                    value={newExpense.category} 
                    onValueChange={(val) => setNewExpense({...newExpense, category: val})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {SMART_CATEGORIES.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input 
                    type="number" 
                    placeholder="Amount $"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                  />
                </div>
                <Input 
                  placeholder="Description (optional)"
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                />
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="recurring"
                    checked={newExpense.is_recurring}
                    onChange={(e) => setNewExpense({...newExpense, is_recurring: e.target.checked})}
                    className="rounded border-warm-300"
                  />
                  <label htmlFor="recurring" className="text-sm text-warm-700">This is a monthly recurring expense</label>
                </div>
                <div className="flex gap-2">
                  <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button onClick={addExpense} className="w-full">Add Expense</Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
                  </motion.div>
                </div>
              </motion.div>
            </ScrollReveal>
          )}
        </AnimatePresence>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-warm-50/80 backdrop-blur-sm p-1 rounded-xl w-full">
            <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-white flex-1">Overview</TabsTrigger>
            <TabsTrigger value="categories" className="rounded-lg data-[state=active]:bg-white flex-1">Categories</TabsTrigger>
            <TabsTrigger value="expenses" className="rounded-lg data-[state=active]:bg-white flex-1">All Expenses</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4 space-y-4">
            <StaggerContainer delay={0.1}>
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <StaggerItem>
                  <GlassCard>
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <motion.div
                          animate={{ rotate: [0, 15, -15, 0] }}
                          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                        >
                          <Calendar className="w-5 h-5 text-primary-500" />
                        </motion.div>
                        <h4 className="font-semibold text-warm-900">Timeline</h4>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-warm-600">Months until due</span>
                          <span className="font-semibold">{monthsUntilDue}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-warm-600">Days remaining</span>
                          <span className="font-semibold">{daysUntilDue}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-warm-600">Monthly savings needed</span>
                          <span className="font-semibold text-primary-600">${monthlyToSave.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </StaggerItem>
                
                <StaggerItem>
                  <GlassCard>
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <motion.div
                          animate={{ y: [0, -3, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <TrendingUp className="w-5 h-5 text-emerald-500" />
                        </motion.div>
                        <h4 className="font-semibold text-warm-900">Projections</h4>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-warm-600">First year total</span>
                          <span className="font-semibold">${projectedFirstYear.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-warm-600">Monthly average</span>
                          <span className="font-semibold">${Math.round(projectedFirstYear / 12).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-warm-600">vs similar families</span>
                          <span className={cn(
                            "font-semibold",
                            vsAverage <= 0 ? "text-emerald-600" : "text-amber-600"
                          )}>
                            {vsAverage > 0 ? '+' : ''}${Math.abs(vsAverage).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </StaggerItem>
              </div>

              {/* Essential vs Optional */}
              <StaggerItem>
                <GlassCard>
                  <div className="p-4">
                    <h4 className="font-semibold text-warm-900 mb-3">Essential vs Optional Spending</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-warm-600">Essential (must have)</span>
                          <span className="font-semibold">
                            ${categoryTotals.filter(c => c.essential).reduce((sum, c) => sum + c.recurring, 0).toLocaleString()}/mo
                          </span>
                        </div>
                        <Progress value={50} className="h-2 bg-warm-100" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-warm-600">Optional (nice to have)</span>
                          <span className="font-semibold">
                            ${categoryTotals.filter(c => !c.essential).reduce((sum, c) => sum + c.recurring, 0).toLocaleString()}/mo
                          </span>
                        </div>
                        <Progress value={30} className="h-2 bg-warm-100" />
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </StaggerItem>
            </StaggerContainer>
          </TabsContent>

          <TabsContent value="categories" className="mt-4 space-y-3">
            <StaggerContainer>
              {categoryTotals.map((cat, index) => (
                <StaggerItem key={cat.id}>
                  <GlassCard hover>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <motion.div 
                            className="w-10 h-10 bg-gradient-to-br from-warm-100 to-warm-50 rounded-lg flex items-center justify-center"
                            whileHover={{ rotate: 10, scale: 1.1 }}
                          >
                            <cat.icon className="w-5 h-5 text-warm-600" />
                          </motion.div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-warm-900">{cat.name}</h4>
                              {cat.essential && (
                                <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs">
                                  Essential
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-warm-500">{cat.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-warm-900">
                            ${cat.recurring > 0 ? `${cat.recurring}/mo` : cat.total.toLocaleString()}
                          </div>
                          {cat.recurring > 0 && cat.oneTime > 0 && (
                            <div className="text-xs text-warm-500">
                              + ${cat.oneTime.toLocaleString()} one-time
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Progress bar vs estimate */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-warm-500">vs typical estimate</span>
                          <span className={cn(
                            cat.percentOfEstimate > 120 ? "text-rose-600" : 
                            cat.percentOfEstimate < 80 ? "text-emerald-600" : "text-warm-600"
                          )}>
                            {Math.round(cat.percentOfEstimate)}%
                          </span>
                        </div>
                        <div className="h-2 bg-warm-100 rounded-full overflow-hidden">
                          <motion.div 
                            className={cn(
                              "h-full rounded-full",
                              cat.percentOfEstimate > 120 ? "bg-rose-400" : 
                              cat.percentOfEstimate < 80 ? "bg-emerald-400" : "bg-primary-400"
                            )}
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(cat.percentOfEstimate, 100)}%` }}
                            transition={{ duration: 0.8, delay: index * 0.1 }}
                          />
                        </div>
                      </div>

                      {/* Tips for this category */}
                      {cat.tips && cat.tips.length > 0 && (
                        <motion.div 
                          className="mt-3 p-2 bg-primary-50/80 backdrop-blur-sm rounded-lg border border-primary-100"
                          whileHover={{ scale: 1.01 }}
                        >
                          <p className="text-xs text-primary-700">
                            <Lightbulb className="w-3 h-3 inline mr-1" />
                            {cat.tips[0]}
                          </p>
                        </motion.div>
                      )}
                    </div>
                  </GlassCard>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </TabsContent>

          <TabsContent value="expenses" className="mt-4 space-y-3">
            {expenses.length === 0 ? (
              <ScrollReveal>
                <div className="text-center py-12 px-4 bg-primary-50/50 rounded-xl border-2 border-dashed border-primary-200">
                  <motion.div 
                    className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-soft"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Receipt className="w-8 h-8 text-primary-500" />
                  </motion.div>
                  <h3 className="font-semibold text-warm-900 mb-2">Track your first expense</h3>
                  <p className="text-sm text-warm-600 mb-4 max-w-sm mx-auto">
                    Tracking baby costs helps you spot savings opportunities and stay within budget. Start with diapers, formula, or any recent purchase.
                  </p>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      onClick={() => setShowAddForm(true)}
                      variant="primary"
                      aria-label="Add your first expense"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Expense
                    </Button>
                  </motion.div>
                  <p className="text-xs text-warm-500 mt-3">
                    Or use the smart templates above to quickly populate common costs
                  </p>
                </div>
              </ScrollReveal>
            ) : (
              <StaggerContainer>
                {expenses.map((expense, index) => {
                  const category = SMART_CATEGORIES.find(c => c.id === expense.category);
                  return (
                    <StaggerItem key={expense.id}>
                      <motion.div 
                        className={cn(
                          "flex items-center justify-between p-3 border rounded-lg backdrop-blur-sm",
                          expense.is_template ? "bg-primary-50/80 border-primary-200" : "bg-white/80 border-warm-200"
                        )}
                        whileHover={{ scale: 1.01, x: 4 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="flex items-center gap-3">
                          <motion.div
                            whileHover={{ rotate: 15, scale: 1.1 }}
                          >
                            {category && <category.icon className="w-4 h-4 text-warm-500" />}
                          </motion.div>
                          <div>
                            <div className="font-medium text-warm-900">{expense.description}</div>
                            <div className="text-xs text-warm-500">
                              {category?.name} 
                              {expense.is_recurring && <span className="text-primary-600"> • Recurring</span>}
                              {expense.is_template && <span className="text-amber-600"> • Template</span>}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="font-semibold text-warm-900">
                            ${expense.amount.toLocaleString()}
                          </div>
                          <motion.button 
                            onClick={() => removeExpense(expense.id)}
                            className="text-warm-400 hover:text-rose-500 transition-colors"
                            whileHover={{ scale: 1.2, rotate: 15 }}
                            whileTap={{ scale: 0.9 }}
                            aria-label={`Delete expense: ${expense.description}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </motion.div>
                    </StaggerItem>
                  );
                })}
              </StaggerContainer>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </GlassCard>
  );
}
