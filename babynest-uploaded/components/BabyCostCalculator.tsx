'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  Baby, 
  Home, 
  Car, 
  Utensils, 
  Shirt, 
  Shield,
  Heart,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Info,
  TrendingUp,
  TrendingDown,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CostItem {
  id: string;
  name: string;
  category: string;
  thriftyPrice: number;
  standardPrice: number;
  premiumPrice: number;
  selected: boolean;
  quantity: number;
  isRecurring?: boolean;
  frequency?: 'monthly' | 'yearly';
}

const defaultItems: CostItem[] = [
  // Nursery Furniture
  { id: 'nursery-1', name: 'Crib', category: 'Nursery', thriftyPrice: 150, standardPrice: 400, premiumPrice: 900, selected: true, quantity: 1 },
  { id: 'nursery-2', name: 'Changing Table', category: 'Nursery', thriftyPrice: 80, standardPrice: 150, premiumPrice: 350, selected: true, quantity: 1 },
  { id: 'nursery-3', name: 'Dresser', category: 'Nursery', thriftyPrice: 100, standardPrice: 250, premiumPrice: 600, selected: true, quantity: 1 },
  { id: 'nursery-4', name: 'Rocking Chair/Glider', category: 'Nursery', thriftyPrice: 100, standardPrice: 300, premiumPrice: 800, selected: true, quantity: 1 },
  { id: 'nursery-5', name: 'Bedding & Mattress', category: 'Nursery', thriftyPrice: 80, standardPrice: 200, premiumPrice: 500, selected: true, quantity: 1 },
  
  // Baby Gear
  { id: 'gear-1', name: 'Stroller', category: 'Gear', thriftyPrice: 100, standardPrice: 400, premiumPrice: 1200, selected: true, quantity: 1 },
  { id: 'gear-2', name: 'Car Seat', category: 'Gear', thriftyPrice: 80, standardPrice: 200, premiumPrice: 500, selected: true, quantity: 1 },
  { id: 'gear-3', name: 'Baby Carrier', category: 'Gear', thriftyPrice: 30, standardPrice: 100, premiumPrice: 250, selected: true, quantity: 1 },
  { id: 'gear-4', name: 'Baby Monitor', category: 'Gear', thriftyPrice: 50, standardPrice: 150, premiumPrice: 400, selected: true, quantity: 1 },
  { id: 'gear-5', name: 'Diaper Bag', category: 'Gear', thriftyPrice: 25, standardPrice: 75, premiumPrice: 200, selected: true, quantity: 1 },
  
  // Feeding
  { id: 'feeding-1', name: 'Bottles & Supplies', category: 'Feeding', thriftyPrice: 30, standardPrice: 60, premiumPrice: 150, selected: true, quantity: 1 },
  { id: 'feeding-2', name: 'Breast Pump', category: 'Feeding', thriftyPrice: 50, standardPrice: 200, premiumPrice: 500, selected: true, quantity: 1 },
  { id: 'feeding-3', name: 'Bottle Sterilizer', category: 'Feeding', thriftyPrice: 30, standardPrice: 60, premiumPrice: 120, selected: true, quantity: 1 },
  { id: 'feeding-4', name: 'High Chair', category: 'Feeding', thriftyPrice: 60, standardPrice: 150, premiumPrice: 400, selected: true, quantity: 1 },
  { id: 'feeding-5', name: 'Bibs & Burp Cloths', category: 'Feeding', thriftyPrice: 15, standardPrice: 40, premiumPrice: 100, selected: true, quantity: 1 },
  
  // Clothing
  { id: 'clothing-1', name: 'Clothes 0-3 months', category: 'Clothing', thriftyPrice: 50, standardPrice: 150, premiumPrice: 400, selected: true, quantity: 1 },
  { id: 'clothing-2', name: 'Clothes 3-6 months', category: 'Clothing', thriftyPrice: 50, standardPrice: 150, premiumPrice: 350, selected: true, quantity: 1 },
  { id: 'clothing-3', name: 'Clothes 6-12 months', category: 'Clothing', thriftyPrice: 75, standardPrice: 200, premiumPrice: 500, selected: true, quantity: 1 },
  
  // Safety
  { id: 'safety-1', name: 'Baby Gates', category: 'Safety', thriftyPrice: 40, standardPrice: 100, premiumPrice: 300, selected: true, quantity: 1 },
  { id: 'safety-2', name: 'Outlet Covers & Locks', category: 'Safety', thriftyPrice: 15, standardPrice: 40, premiumPrice: 100, selected: true, quantity: 1 },
  { id: 'safety-3', name: 'First Aid Kit', category: 'Safety', thriftyPrice: 20, standardPrice: 50, premiumPrice: 150, selected: true, quantity: 1 },
  
  // Diapering
  { id: 'diaper-1', name: 'Initial Diaper Supply', category: 'Diapering', thriftyPrice: 50, standardPrice: 150, premiumPrice: 300, selected: true, quantity: 1 },
  { id: 'diaper-2', name: 'Changing Pad & Covers', category: 'Diapering', thriftyPrice: 25, standardPrice: 60, premiumPrice: 150, selected: true, quantity: 1 },
  { id: 'diaper-3', name: 'Wipes & Storage', category: 'Diapering', thriftyPrice: 30, standardPrice: 75, premiumPrice: 150, selected: true, quantity: 1 },
  { id: 'diaper-4', name: 'Diaper Pail', category: 'Diapering', thriftyPrice: 25, standardPrice: 75, premiumPrice: 200, selected: true, quantity: 1 },
  
  // Monthly Recurring
  { id: 'monthly-1', name: 'Diapers & Wipes (monthly)', category: 'Monthly', thriftyPrice: 40, standardPrice: 80, premiumPrice: 150, selected: true, quantity: 12, isRecurring: true, frequency: 'monthly' },
  { id: 'monthly-2', name: 'Formula/Food (monthly)', category: 'Monthly', thriftyPrice: 60, standardPrice: 150, premiumPrice: 300, selected: true, quantity: 12, isRecurring: true, frequency: 'monthly' },
  { id: 'monthly-3', name: 'Childcare (monthly)', category: 'Monthly', thriftyPrice: 400, standardPrice: 1200, premiumPrice: 2500, selected: false, quantity: 12, isRecurring: true, frequency: 'monthly' },
  { id: 'monthly-4', name: 'Insurance Increase (monthly)', category: 'Monthly', thriftyPrice: 30, standardPrice: 100, premiumPrice: 200, selected: true, quantity: 12, isRecurring: true, frequency: 'monthly' },
];

const regionMultipliers: Record<string, number> = {
  'AL': 0.85, 'AK': 1.15, 'AZ': 0.95, 'AR': 0.82, 'CA': 1.35,
  'CO': 1.05, 'CT': 1.25, 'DE': 1.05, 'FL': 0.95, 'GA': 0.90,
  'HI': 1.40, 'ID': 0.90, 'IL': 1.05, 'IN': 0.88, 'IA': 0.85,
  'KS': 0.85, 'KY': 0.85, 'LA': 0.88, 'ME': 1.05, 'MD': 1.20,
  'MA': 1.30, 'MI': 0.90, 'MN': 0.95, 'MS': 0.82, 'MO': 0.87,
  'MT': 0.90, 'NE': 0.85, 'NV': 0.98, 'NH': 1.10, 'NJ': 1.25,
  'NM': 0.88, 'NY': 1.35, 'NC': 0.90, 'ND': 0.85, 'OH': 0.88,
  'OK': 0.82, 'OR': 1.05, 'PA': 1.00, 'RI': 1.15, 'SC': 0.88,
  'SD': 0.85, 'TN': 0.88, 'TX': 0.92, 'UT': 0.92, 'VT': 1.05,
  'VA': 1.10, 'WA': 1.15, 'WV': 0.82, 'WI': 0.90, 'WY': 0.90,
  'DC': 1.30
};

const nationalAverage = 20384;

export function BabyCostCalculator() {
  const [items, setItems] = useState<CostItem[]>(defaultItems);
  const [budgetMode, setBudgetMode] = useState<'thrifty' | 'standard' | 'premium'>('standard');
  const [region, setRegion] = useState<string>('CA');
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['Nursery', 'Monthly']);
  
  const toggleItem = (id: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, selected: !item.selected } : item
    ));
  };
  
  const updateQuantity = (id: string, quantity: number) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
    ));
  };
  
  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };
  
  const getPriceForItem = (item: CostItem) => {
    const basePrice = item[budgetMode + 'Price' as keyof CostItem] as number;
    return basePrice * item.quantity;
  };
  
  const selectedItems = items.filter(item => item.selected);
  const oneTimeItems = selectedItems.filter(item => !item.isRecurring);
  const recurringItems = selectedItems.filter(item => item.isRecurring);
  
  const oneTimeTotal = oneTimeItems.reduce((sum, item) => sum + getPriceForItem(item), 0);
  const monthlyTotal = recurringItems.reduce((sum, item) => sum + (getPriceForItem(item) / item.quantity), 0);
  const yearlyRecurring = monthlyTotal * 12;
  const grandTotal = oneTimeTotal + yearlyRecurring;
  
  const adjustedTotal = grandTotal * (regionMultipliers[region] || 1);
  const multiplier = regionMultipliers[region] || 1;
  
  const vsAverage = ((adjustedTotal - nationalAverage) / nationalAverage) * 100;
  
  const categories = [...new Set(items.map(item => item.category))];
  
  const savingsTips = [
    { condition: () => budgetMode === 'premium', text: 'Switch to Standard mode could save you $' + Math.round((adjustedTotal * 0.4)) + '/year' },
    { condition: () => !items.find(i => i.id === 'monthly-3')?.selected, text: 'Consider starting a childcare fund early - average cost is $1,200/month' },
    { condition: () => oneTimeTotal > 3000, text: 'Buy used stroller and crib - could save $500+' },
    { condition: () => multiplier > 1.2, text: 'Your region has higher costs - consider shopping online for better deals' },
  ];
  
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-primary-500 to-primary-600 text-white">
          <CardContent className="p-6">
            <div className="text-sm opacity-90 mb-1">First Year Total</div>
            <div className="text-3xl font-bold">${Math.round(adjustedTotal).toLocaleString()}</div>
            <div className="text-sm opacity-75 mt-2">
              {regionMultipliers[region] > 1 ? '+' : ''}{Math.round((regionMultipliers[region] - 1) * 100)}% vs national avg
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-warm-500 mb-1">Monthly Average</div>
            <div className="text-2xl font-bold text-warm-900">${Math.round(adjustedTotal / 12).toLocaleString()}</div>
            <div className="text-sm text-warm-400 mt-2">Based on your selections</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-warm-500 mb-1">vs National Average</div>
            <div className={cn(
              "text-2xl font-bold",
              vsAverage > 0 ? "text-accent-600" : "text-emerald-600"
            )}>
              {vsAverage > 0 ? '+' : ''}{Math.round(vsAverage)}%
            </div>
            <div className="text-sm text-warm-400 mt-2">${nationalAverage.toLocaleString()} average</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary-500" />
            Your Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-warm-700 mb-2">Budget Style</label>
              <div className="flex gap-2">
                {(['thrifty', 'standard', 'premium'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setBudgetMode(mode)}
                    className={cn(
                      'flex-1 px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all',
                      budgetMode === mode
                        ? 'bg-primary-500 text-white shadow-md'
                        : 'bg-warm-100 text-warm-600 hover:bg-warm-200'
                    )}
                  >
                    {mode}
                  </button>
                ))}
              </div>
              <p className="text-xs text-warm-500 mt-2">
                {budgetMode === 'thrifty' && 'Buying used, generic brands, essentials only'}
                {budgetMode === 'standard' && 'Mix of new and used, mid-range brands'}
                {budgetMode === 'premium' && 'New items, premium brands, all the extras'}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-warm-700 mb-2">Your State</label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full px-3 py-2 border border-warm-200 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                {Object.entries(regionMultipliers).sort().map(([code, mult]) => (
                  <option key={code} value={code}>
                    {code} ({mult > 1 ? '+' : ''}{Math.round((mult - 1) * 100)}%)
                  </option>
                ))}
              </select>
              <p className="text-xs text-warm-500 mt-2">Affects cost estimates based on regional pricing</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Cost Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Baby className="w-5 h-5 text-primary-500" />
            Cost Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {categories.map((category) => {
            const categoryItems = items.filter(item => item.category === category);
            const selectedCount = categoryItems.filter(item => item.selected).length;
            const totalCount = categoryItems.length;
            const categoryTotal = categoryItems
              .filter(item => item.selected)
              .reduce((sum, item) => sum + getPriceForItem(item), 0);
            const isExpanded = expandedCategories.includes(category);
            
            return (
              <div key={category} className="border border-warm-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full px-4 py-3 flex items-center justify-between bg-warm-50 hover:bg-warm-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-warm-900">{category}</span>
                    <Badge variant="secondary" className="text-xs">
                      {selectedCount}/{totalCount} items
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-warm-900">
                      ${Math.round(categoryTotal * multiplier).toLocaleString()}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-warm-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-warm-400" />
                    )}
                  </div>
                </button>
                
                {isExpanded && (
                  <div className="p-4 space-y-3">
                    {categoryItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-4">
                        <Checkbox
                          checked={item.selected}
                          onCheckedChange={() => toggleItem(item.id)}
                        />
                        <div className="flex-1">
                          <div className="font-medium text-warm-900">{item.name}</div>
                          <div className="text-sm text-warm-500">
                            ${getPriceForItem(item).toLocaleString()}
                            {item.isRecurring && '/month'}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 rounded-full bg-warm-100 hover:bg-warm-200 flex items-center justify-center"
                            disabled={item.quantity <= 1}
                          >
                            -
                          </button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 rounded-full bg-warm-100 hover:bg-warm-200 flex items-center justify-center"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
      
      {/* Savings Tips */}
      <Card className="bg-gradient-to-br from-amber-50 to-amber-100/50 border-amber-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-800">
            <Sparkles className="w-5 h-5" />
            Smart Savings Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {savingsTips.filter(tip => tip.condition()).slice(0, 3).map((tip, index) => (
              <li key={index} className="flex items-start gap-2 text-amber-700">
                <TrendingDown className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{tip.text}</span>
              </li>
            ))}
            <li className="flex items-start gap-2 text-amber-700">
              <Heart className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>Start a "Baby Fund" savings goal in BabyNest to track your progress</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
