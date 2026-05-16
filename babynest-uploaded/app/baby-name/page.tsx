'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Baby, 
  TrendingUp,
  DollarSign,
  Calculator,
  Share2,
  Heart,
  GraduationCap
} from 'lucide-react';
import Link from 'next/link';

interface NameProjection {
  name: string;
  monthlyContribution: number;
  projection18: number;
  projection22: number;
}

const POPULAR_NAMES = [
  'Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Oliver', 
  'Isabella', 'Elijah', 'Sophia', 'Lucas', 'Mia', 'Mason'
];

export default function BabyNamePage() {
  const [selectedName, setSelectedName] = useState('');
  const [monthlyContribution, setMonthlyContribution] = useState(100);
  const [projection, setProjection] = useState<NameProjection | null>(null);

  const calculateProjection = () => {
    const monthly = monthlyContribution;
    const annualReturn = 0.07; // 7% average return
    
    // Future value formula: FV = PMT * (((1 + r)^n - 1) / r)
    const years18 = 18;
    const years22 = 22;
    
    const fv18 = monthly * 12 * (Math.pow(1 + annualReturn, years18) - 1) / annualReturn;
    const fv22 = monthly * 12 * (Math.pow(1 + annualReturn, years22) - 1) / annualReturn;
    
    setProjection({
      name: selectedName,
      monthlyContribution: monthly,
      projection18: fv18,
      projection22: fv22
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getTotalContributed = () => {
    return monthlyContribution * 12 * 18;
  };

  const getEarnings = () => {
    if (!projection) return 0;
    return projection.projection18 - getTotalContributed();
  };

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <Baby className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Baby Name + 529 Calculator</h1>
          <p className="text-primary-100">
            See how much your baby\'s name could be worth in 18 years
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Name Selection */}
          <Card className="mb-8">
            <CardContent className="p-8">
              <h2 className="text-xl font-bold text-warm-900 mb-6 text-center">Choose a Name</h2>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-warm-700 mb-2">
                  Or type your own
                </label>
                <Input
                  type="text"
                  placeholder="Enter baby name..."
                  value={selectedName}
                  onChange={(e) => setSelectedName(e.target.value)}
                  className="text-center text-lg"
                />
              </div>

              <p className="text-sm text-warm-500 text-center mb-3">Popular names</p>
              <div className="flex flex-wrap justify-center gap-2">
                {POPULAR_NAMES.map((name) => (
                  <button
                    key={name}
                    onClick={() => setSelectedName(name)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedName === name
                        ? 'bg-primary-500 text-white'
                        : 'bg-warm-100 text-warm-700 hover:bg-warm-200'
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Contribution Calculator */}
          <Card className="mb-8">
            <CardContent className="p-8">
              <h2 className="text-xl font-bold text-warm-900 mb-6 text-center">529 Savings Calculator</h2>
              
              <div className="mb-8">
                <label className="block text-sm font-medium text-warm-700 mb-4">
                  Monthly contribution: <span className="text-primary-600 font-bold">${monthlyContribution}/month</span>
                </label>
                <input
                  type="range"
                  min="25"
                  max="1000"
                  step="25"
                  value={monthlyContribution}
                  onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                  className="w-full h-2 bg-warm-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-warm-500 mt-2">
                  <span>$25</span>
                  <span>$500</span>
                  <span>$1000</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-warm-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-warm-600 mb-1">Total Contributed</p>
                  <p className="text-xl font-bold text-warm-900">{formatCurrency(getTotalContributed())}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-green-700 mb-1">Estimated Growth</p>
                  <p className="text-xl font-bold text-green-700">+{formatCurrency(getEarnings())}</p>
                </div>
              </div>

              <Button 
                size="lg" 
                className="w-full"
                onClick={calculateProjection}
                disabled={!selectedName}
              >
                <Calculator className="w-5 h-5 mr-2" />
                Calculate Future Value
              </Button>
            </CardContent>
          </Card>

          {/* Projection Results */}
          {projection && (
            <Card className="mb-8 bg-gradient-to-br from-primary-50 to-accent-50 border-2 border-primary-200">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-warm-900 mb-2">
                    {projection.name}\'s Future
                  </h3>
                  <p className="text-warm-600">
                    With ${projection.monthlyContribution}/month for 18 years
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-xl shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <GraduationCap className="w-5 h-5 text-primary-500" />
                      <span className="font-semibold text-warm-900">Age 18 - College Ready</span>
                    </div>
                    <p className="text-3xl font-bold text-primary-600 mb-1">
                      {formatCurrency(projection.projection18)}
                    </p>
                    <p className="text-sm text-warm-500">
                      Estimated 529 balance
                    </p>
                  </div>

                  <div className="bg-white p-6 rounded-xl shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-5 h-5 text-accent-500" />
                      <span className="font-semibold text-warm-900">Age 22 - Graduation</span>
                    </div>
                    <p className="text-3xl font-bold text-accent-600 mb-1">
                      {formatCurrency(projection.projection22)}
                    </p>
                    <p className="text-sm text-warm-500">
                      If left to grow 4 more years
                    </p>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-white rounded-lg">
                  <p className="text-center text-warm-700">
                    💡 <strong>Fun fact:</strong> Starting at birth with ${projection.monthlyContribution}/month, 
                    {projection.name} could have <strong>{formatCurrency(projection.projection18)}</strong> for college - 
                    that\'s {Math.round(projection.projection18 / 50000)} years of tuition at a public university!
                  </p>
                </div>

                <div className="mt-6 flex gap-3">
                  <Button variant="outline" className="flex-1">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                  <Link href="/financial-timeline">
                    <Button className="flex-1">
                      Start 529 Timeline
                      <DollarSign className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Info Section */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <DollarSign className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <h4 className="font-semibold text-warm-900 mb-1">Tax Free Growth</h4>
                <p className="text-sm text-warm-600">529 earnings grow tax-free when used for education</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Heart className="w-8 h-8 text-accent-500 mx-auto mb-2" />
                <h4 className="font-semibold text-warm-900 mb-1">Anyone Can Contribute</h4>
                <p className="text-sm text-warm-600">Grandparents, family, and friends can gift to the account</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <TrendingUp className="w-8 h-8 text-primary-500 mx-auto mb-2" />
                <h4 className="font-semibold text-warm-900 mb-1">Compound Growth</h4>
                <p className="text-sm text-warm-600">Starting early maximizes the power of compound interest</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
