'use client';

import { useState, useEffect } from 'react';
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
  Info
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

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

  useEffect(() => {
    // Calculate months until due
    const daysUntilDue = dueDate 
      ? Math.ceil((new Date(dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : 270;
    const monthsUntilDue = Math.max(1, Math.ceil(daysUntilDue / 30));
    
    // Auto-populate with smart templates on load
    const templates = getExpenseTemplates(incomeBracket, monthsUntilDue);
    setExpenses(templates);
    setLoading(false);
    
    if (userId) {
      fetchExpenses();
    }
  }, [userId, dueDate, incomeBracket]);

  const fetchExpenses = async () => {
    try {
      const { data } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (data && data.length > 0) {
        setExpenses(data);
        setHasCustomized(true);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const addExpense = () => {
    if (!newExpense.category || !newExpense.amount) return;
    
    const expense: Expense = {
      id: `custom-${Date.now()}`,
      category: newExpense.category,
      amount: parseFloat(newExpense.amount),
      description: newExpense.description || 'Custom expense',
      date: new Date().toISOString(),
      is_recurring: newExpense.is_recurring,
      is_template: false,
    };
    
    setExpenses([...expenses, expense]);
    setNewExpense({ category: '', amount: '', description: '', is_recurring: false });
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
      <Card className="border-warm-100">
        <CardContent className="p-8 text-center">
          <div className="w-8 h-8 border-4 border-warm-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-warm-600">Loading budget...</p>
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
              <Receipt className="w-5 h-5 text-blue-500" />
              Budget Tracker
            </CardTitle>
            <p className="text-sm text-warm-500 mt-1">
              Smart expense planning for baby's first year
            </p>
          </div>
          <div className="flex gap-2">
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
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Reset Templates
            </Button>
            <Button 
              size="sm" 
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-gradient-to-r from-blue-500 to-blue-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Expense
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Summary Cards - THE MONEY SHOT */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
            <div className="text-sm text-blue-700 mb-1">Monthly</div>
            <div className="text-2xl font-bold text-blue-900">${totalMonthly.toLocaleString()}</div>
            <div className="text-xs text-blue-600">Recurring costs</div>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4">
            <div className="text-sm text-emerald-700 mb-1">One-Time</div>
            <div className="text-2xl font-bold text-emerald-900">${totalOneTime.toLocaleString()}</div>
            <div className="text-xs text-emerald-600">Setup costs</div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
            <div className="text-sm text-purple-700 mb-1">First Year</div>
            <div className="text-2xl font-bold text-purple-900">${projectedFirstYear.toLocaleString()}</div>
            <div className="text-xs text-purple-600">Total projected</div>
          </div>
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4">
            <div className="text-sm text-amber-700 mb-1">Save/Month</div>
            <div className="text-2xl font-bold text-amber-900">${monthlyToSave.toLocaleString()}</div>
            <div className="text-xs text-amber-600">To be ready</div>
          </div>
        </div>

        {/* Comparison Bar */}
        <div className="bg-warm-50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-warm-500" />
              <span className="text-sm text-warm-700">vs National Average (${nationalAverage.toLocaleString()})</span>
            </div>
            <span className={cn(
              "text-sm font-semibold",
              vsAverage > 0 ? "text-amber-600" : "text-emerald-600"
            )}>
              {vsAverage > 0 ? '+' : ''}{percentOfAverage}%
            </span>
          </div>
          <div className="h-3 bg-warm-200 rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full rounded-full transition-all",
                percentOfAverage <= 100 ? "bg-emerald-500" : percentOfAverage <= 130 ? "bg-amber-500" : "bg-red-500"
              )}
              style={{ width: `${Math.min(percentOfAverage, 100)}%` }}
            />
          </div>
          <p className="text-xs text-warm-500 mt-2">
            USDA estimates middle-income families spend $12,680 on baby's first year
          </p>
        </div>

        {/* Smart Insights */}
        {smartTips.length > 0 && (
          <div className="space-y-2">
            {smartTips.map((tip, idx) => (
              <div 
                key={idx}
                className={cn(
                  "border rounded-xl p-3 flex items-start gap-3",
                  tip.type === 'warning' && "bg-amber-50 border-amber-200",
                  tip.type === 'alert' && "bg-red-50 border-red-200",
                  tip.type === 'tip' && "bg-blue-50 border-blue-200",
                  tip.type === 'success' && "bg-emerald-50 border-emerald-200"
                )}
              >
                <tip.icon className={cn(
                  "w-5 h-5 flex-shrink-0 mt-0.5",
                  tip.type === 'warning' && "text-amber-600",
                  tip.type === 'alert' && "text-red-600",
                  tip.type === 'tip' && "text-blue-600",
                  tip.type === 'success' && "text-emerald-600"
                )} />
                <div>
                  <h4 className={cn(
                    "font-semibold text-sm",
                    tip.type === 'warning' && "text-amber-900",
                    tip.type === 'alert' && "text-red-900",
                    tip.type === 'tip' && "text-blue-900",
                    tip.type === 'success' && "text-emerald-900"
                  )}>
                    {tip.title}
                  </h4>
                  <p className={cn(
                    "text-sm mt-0.5",
                    tip.type === 'warning' && "text-amber-700",
                    tip.type === 'alert' && "text-red-700",
                    tip.type === 'tip' && "text-blue-700",
                    tip.type === 'success' && "text-emerald-700"
                  )}>
                    {tip.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Expense Form */}
        {showAddForm && (
          <div className="bg-warm-50 border border-warm-200 rounded-xl p-4 space-y-3">
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
              <Button onClick={addExpense} className="flex-1">Add Expense</Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-warm-50 p-1 rounded-xl w-full">
            <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-white flex-1">Overview</TabsTrigger>
            <TabsTrigger value="categories" className="rounded-lg data-[state=active]:bg-white flex-1">Categories</TabsTrigger>
            <TabsTrigger value="expenses" className="rounded-lg data-[state=active]:bg-white flex-1">All Expenses</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4 space-y-4">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white border border-warm-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-5 h-5 text-blue-500" />
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
                    <span className="font-semibold text-blue-600">${monthlyToSave.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white border border-warm-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-5 h-5 text-emerald-500" />
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
            </div>

            {/* Essential vs Optional */}
            <div className="bg-white border border-warm-200 rounded-xl p-4">
              <h4 className="font-semibold text-warm-900 mb-3">Essential vs Optional Spending</h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-warm-600">Essential (must have)</span>
                    <span className="font-semibold">
                      ${categoryTotals.filter(c => c.essential).reduce((sum, c) => sum + c.recurring, 0).toLocaleString()}/mo
                    </span>
                  </div>
                  <Progress 
                    value={50} 
                    className="h-2 bg-warm-100"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-warm-600">Optional (nice to have)</span>
                    <span className="font-semibold">
                      ${categoryTotals.filter(c => !c.essential).reduce((sum, c) => sum + c.recurring, 0).toLocaleString()}/mo
                    </span>
                  </div>
                  <Progress 
                    value={30} 
                    className="h-2 bg-warm-100"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="categories" className="mt-4 space-y-3">
            {categoryTotals.map((cat) => (
              <div key={cat.id} className="bg-white border border-warm-100 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-warm-100 to-warm-50 rounded-lg flex items-center justify-center">
                      <cat.icon className="w-5 h-5 text-warm-600" />
                    </div>
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
                      cat.percentOfEstimate > 120 ? "text-red-600" : 
                      cat.percentOfEstimate < 80 ? "text-emerald-600" : "text-warm-600"
                    )}>
                      {Math.round(cat.percentOfEstimate)}%
                    </span>
                  </div>
                  <div className="h-2 bg-warm-100 rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full rounded-full transition-all",
                        cat.percentOfEstimate > 120 ? "bg-red-400" : 
                        cat.percentOfEstimate < 80 ? "bg-emerald-400" : "bg-blue-400"
                      )}
                      style={{ width: `${Math.min(cat.percentOfEstimate, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Tips for this category */}
                {cat.tips && cat.tips.length > 0 && (
                  <div className="mt-3 p-2 bg-blue-50 rounded-lg">
                    <p className="text-xs text-blue-700">
                      <Lightbulb className="w-3 h-3 inline mr-1" />
                      {cat.tips[0]}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </TabsContent>

          <TabsContent value="expenses" className="mt-4 space-y-3">
            {expenses.length === 0 ? (
              <div className="text-center py-12 px-4 bg-blue-50/50 rounded-xl border-2 border-dashed border-blue-200">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-soft">
                  <Receipt className="w-8 h-8 text-blue-500" />
                </div>
                <h3 className="font-semibold text-warm-900 mb-2">Track your first expense</h3>
                <p className="text-sm text-warm-600 mb-4 max-w-sm mx-auto">
                  Tracking baby costs helps you spot savings opportunities and stay within budget. Start with diapers, formula, or any recent purchase.
                </p>
                <Button 
                  onClick={() => setShowAddForm(true)}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 min-h-[44px]"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Expense
                </Button>
                <p className="text-xs text-warm-500 mt-3">
                  Or use the smart templates above to quickly populate common costs
                </p>
              </div>
            ) : (
              expenses.map((expense) => {
                const category = SMART_CATEGORIES.find(c => c.id === expense.category);
                return (
                  <div 
                    key={expense.id} 
                    className={cn(
                      "flex items-center justify-between p-3 border rounded-lg",
                      expense.is_template ? "bg-blue-50 border-blue-100" : "bg-white border-warm-100"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {category && <category.icon className="w-4 h-4 text-warm-500" />}
                      <div>
                        <div className="font-medium text-warm-900">{expense.description}</div>
                        <div className="text-xs text-warm-500">
                          {category?.name} 
                          {expense.is_recurring && <span className="text-blue-600"> • Recurring</span>}
                          {expense.is_template && <span className="text-amber-600"> • Template</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="font-semibold text-warm-900">
                        ${expense.amount.toLocaleString()}
                      </div>
                      <button 
                        onClick={() => removeExpense(expense.id)}
                        className="text-warm-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
