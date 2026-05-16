'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle2, 
  Circle, 
  Shield, 
  PiggyBank, 
  FileText,
  Calculator,
  TrendingUp,
  Award,
  ChevronRight,
  RotateCcw,
  Share2
} from 'lucide-react';
import Link from 'next/link';

interface Question {
  id: string;
  text: string;
  category: 'insurance' | 'savings' | 'legal' | 'taxes';
  options: { label: string; value: number }[];
}

const QUESTIONS: Question[] = [
  // Insurance (30 points max)
  {
    id: 'insurance-1',
    text: 'Have you reviewed your health insurance coverage for pregnancy and delivery?',
    category: 'insurance',
    options: [
      { label: 'Yes, fully reviewed and understand coverage', value: 10 },
      { label: 'Somewhat, I know my deductible', value: 5 },
      { label: 'No, I have not reviewed yet', value: 0 },
    ],
  },
  {
    id: 'insurance-2',
    text: 'Do you know your state\'s deadline for adding a newborn to insurance?',
    category: 'insurance',
    options: [
      { label: 'Yes, I know the exact deadline', value: 10 },
      { label: 'I know there is a deadline but not the exact date', value: 5 },
      { label: 'No, I was not aware of a deadline', value: 0 },
    ],
  },
  {
    id: 'insurance-3',
    text: 'Have you confirmed your preferred hospital/doctor is in-network?',
    category: 'insurance',
    options: [
      { label: 'Yes, confirmed in-network', value: 10 },
      { label: 'I think so but not 100% sure', value: 5 },
      { label: 'No, I have not checked', value: 0 },
    ],
  },
  // Savings (25 points max)
  {
    id: 'savings-1',
    text: 'Have you opened or started researching a 529 college savings plan?',
    category: 'savings',
    options: [
      { label: 'Yes, account opened and contributing', value: 10 },
      { label: 'I have researched but not opened yet', value: 5 },
      { label: 'No, have not looked into 529 plans', value: 0 },
    ],
  },
  {
    id: 'savings-2',
    text: 'Do you have an emergency fund that covers 3-6 months of expenses?',
    category: 'savings',
    options: [
      { label: 'Yes, fully funded emergency fund', value: 10 },
      { label: 'Partially funded (1-3 months)', value: 5 },
      { label: 'No emergency fund yet', value: 0 },
    ],
  },
  {
    id: 'savings-3',
    text: 'Have you estimated your total out-of-pocket delivery costs?',
    category: 'savings',
    options: [
      { label: 'Yes, I have a detailed estimate', value: 5 },
      { label: 'Rough estimate only', value: 3 },
      { label: 'No estimate yet', value: 0 },
    ],
  },
  // Legal (25 points max)
  {
    id: 'legal-1',
    text: 'Have you created or updated your will to include guardians for your child?',
    category: 'legal',
    options: [
      { label: 'Yes, will is updated with guardians named', value: 10 },
      { label: 'I have a will but need to update it', value: 5 },
      { label: 'No will yet', value: 0 },
    ],
  },
  {
    id: 'legal-2',
    text: 'Have you reviewed or updated beneficiaries on insurance and accounts?',
    category: 'legal',
    options: [
      { label: 'Yes, all beneficiaries updated', value: 10 },
      { label: 'Some updated, need to finish', value: 5 },
      { label: 'No, have not reviewed beneficiaries', value: 0 },
    ],
  },
  {
    id: 'legal-3',
    text: 'Have you considered life insurance for parents?',
    category: 'legal',
    options: [
      { label: 'Yes, have adequate life insurance', value: 5 },
      { label: 'I have some but may need more', value: 3 },
      { label: 'No life insurance yet', value: 0 },
    ],
  },
  // Taxes (20 points max)
  {
    id: 'tax-1',
    text: 'Do you understand the Child Tax Credit and how it applies to you?',
    category: 'taxes',
    options: [
      { label: 'Yes, I understand the full amount and requirements', value: 10 },
      { label: 'I know it exists but not details', value: 5 },
      { label: 'No, I am not familiar with child tax credits', value: 0 },
    ],
  },
  {
    id: 'tax-2',
    text: 'Have you adjusted your tax withholding or planned for the tax impact?',
    category: 'taxes',
    options: [
      { label: 'Yes, adjusted withholding or planned accordingly', value: 10 },
      { label: 'I plan to but have not yet', value: 5 },
      { label: 'No, I have not considered tax implications', value: 0 },
    ],
  },
];

const CATEGORY_INFO = {
  insurance: { label: 'Insurance', icon: Shield, color: 'bg-blue-500', maxPoints: 30 },
  savings: { label: 'Savings', icon: PiggyBank, color: 'bg-green-500', maxPoints: 25 },
  legal: { label: 'Legal', icon: FileText, color: 'bg-amber-500', maxPoints: 25 },
  taxes: { label: 'Taxes', icon: Calculator, color: 'bg-purple-500', maxPoints: 20 },
};

export default function ReadinessPage() {
  const [started, setStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);

  const handleAnswer = (value: number) => {
    const question = QUESTIONS[currentQuestion];
    setAnswers({ ...answers, [question.id]: value });

    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResults(true);
    }
  };

  const calculateScore = () => {
    return Object.values(answers).reduce((sum, val) => sum + val, 0);
  };

  const getCategoryScore = (category: string) => {
    const categoryQuestions = QUESTIONS.filter((q) => q.category === category);
    return categoryQuestions.reduce((sum, q) => sum + (answers[q.id] || 0), 0);
  };

  const getScoreLevel = (score: number) => {
    if (score >= 80) return { label: 'Excellent', color: 'text-green-600', bg: 'bg-green-100' };
    if (score >= 60) return { label: 'Good', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (score >= 40) return { label: 'Needs Work', color: 'text-amber-600', bg: 'bg-amber-100' };
    return { label: 'Getting Started', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const getRecommendations = () => {
    const recs = [];
    if (getCategoryScore('insurance') < 20) {
      recs.push({
        category: 'Insurance',
        text: 'Review your health insurance coverage and understand your out-of-pocket maximum.',
        link: '/hospital-costs',
      });
    }
    if (getCategoryScore('savings') < 15) {
      recs.push({
        category: 'Savings',
        text: 'Start researching 529 plans and open an account to begin saving for education.',
        link: '/baby-name',
      });
    }
    if (getCategoryScore('legal') < 15) {
      recs.push({
        category: 'Legal',
        text: 'Create or update your will to name guardians for your child.',
        link: '/financial-timeline',
      });
    }
    if (getCategoryScore('taxes') < 10) {
      recs.push({
        category: 'Taxes',
        text: 'Learn about the Child Tax Credit ($2,000 per child) and adjust your withholding.',
        link: '/financial-timeline',
      });
    }
    return recs;
  };

  const reset = () => {
    setStarted(false);
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
  };

  const totalScore = calculateScore();
  const scoreLevel = getScoreLevel(totalScore);

  if (!started) {
    return (
      <div className="min-h-screen bg-cream-50">
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-12">
          <div className="container mx-auto px-4 text-center">
            <Award className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-4">Financial Readiness Score</h1>
            <p className="text-xl text-primary-100 max-w-2xl mx-auto">
              Find out how prepared you are financially for your new baby. 
              Get a personalized action plan in just 2 minutes.
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto">
            <Card className="mb-8">
              <CardContent className="p-8 text-center">
                <h2 className="text-2xl font-bold text-warm-900 mb-6">What You'll Get</h2>
                
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="p-4 bg-warm-50 rounded-lg">
                    <Shield className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                    <p className="font-semibold text-warm-900">Insurance Score</p>
                    <p className="text-sm text-warm-600">Coverage review</p>
                  </div>
                  
                  <div className="p-4 bg-warm-50 rounded-lg">
                    <PiggyBank className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <p className="font-semibold text-warm-900">Savings Score</p>
                    <p className="text-sm text-warm-600">529 & emergency fund</p>
                  </div>
                  <div className="p-4 bg-warm-50 rounded-lg">
                    <FileText className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                    <p className="font-semibold text-warm-900">Legal Score</p>
                    <p className="text-sm text-warm-600">Wills & guardians</p>
                  </div>
                  <div className="p-4 bg-warm-50 rounded-lg">
                    <Calculator className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                    <p className="font-semibold text-warm-900">Tax Score</p>
                    <p className="text-sm text-warm-600">Credits & planning</p>
                  </div>
                </div>

                <Button size="lg" onClick={() => setStarted(true)}>
                  Start Assessment
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
                
                <p className="text-sm text-warm-500 mt-4">Takes about 2 minutes • 12 questions</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (showResults) {
    const recommendations = getRecommendations();

    return (
      <div className="min-h-screen bg-cream-50">
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-8">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl font-bold mb-2">Your Results</h1>
            <p className="text-primary-100">Here's how prepared you are financially</p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto">
            {/* Score Card */}
            <Card className="mb-8">
              <CardContent className="p-8 text-center">
                <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full ${scoreLevel.bg} mb-4`}>
                  <span className={`text-5xl font-bold ${scoreLevel.color}`}>{totalScore}</span>
                </div>
                
                <h2 className="text-2xl font-bold text-warm-900 mb-2">{scoreLevel.label}</h2>
                <p className="text-warm-600 mb-6">
                  Out of 100 possible points
                </p>

                <Progress value={totalScore} className="h-3 mb-2" />
                
                <p className="text-sm text-warm-500">
                  {totalScore >= 80 ? 'Great job! You are well prepared.' : 
                   totalScore >= 60 ? 'Good start! A few improvements needed.' : 
                   totalScore >= 40 ? 'You have some work to do.' : 
                   'Let us help you get prepared!'}
                </p>
              </CardContent>
            </Card>

            {/* Category Breakdown */}
            <h3 className="text-xl font-bold text-warm-900 mb-4">Category Breakdown</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              {Object.entries(CATEGORY_INFO).map(([key, info]) => {
                const score = getCategoryScore(key);
                const Icon = info.icon;
                return (
                  <Card key={key}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2 rounded-lg ${info.color} bg-opacity-20`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-semibold text-warm-900">{info.label}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Progress value={(score / info.maxPoints) * 100} className="flex-1 h-2" />
                        <span className="text-sm font-medium text-warm-700">
                          {score}/{info.maxPoints}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Recommendations */}
            {recommendations.length > 0 && (
              <>
                <h3 className="text-xl font-bold text-warm-900 mb-4">Recommended Next Steps</h3>
                
                <div className="space-y-3 mb-8">
                  {recommendations.map((rec, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <span className="text-xs font-medium text-primary-600 uppercase tracking-wide">
                              {rec.category}
                            </span>
                            <p className="text-warm-700 mt-1">{rec.text}</p>
                          </div>
                          <Link href={rec.link}>
                            <Button variant="outline" size="sm">
                              Take Action
                              <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="outline" onClick={reset}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Retake Assessment
              </Button>
              
              <Button>
                <Share2 className="w-4 h-4 mr-2" />
                Share Results
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const question = QUESTIONS[currentQuestion];
  const progress = ((currentQuestion + 1) / QUESTIONS.length) * 100;

  return (
    <div className="min-h-screen bg-cream-50">
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-primary-100">Question {currentQuestion + 1} of {QUESTIONS.length}</span>
            <span className="text-sm text-primary-100">{Math.round(progress)}% complete</span>
          </div>
          
          <Progress value={progress} className="h-2 bg-primary-500" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="p-8">
              <div className="mb-6">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium text-white mb-4 ${
                  CATEGORY_INFO[question.category].color
                }`}>
                  {CATEGORY_INFO[question.category].label}
                </span>
                
                <h2 className="text-xl font-bold text-warm-900">{question.text}</h2>
              </div>

              <div className="space-y-3">
                {question.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswer(option.value)}
                    className="w-full text-left p-4 rounded-lg border-2 border-warm-200 hover:border-primary-500 hover:bg-primary-50 transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-warm-900">{option.label}</span>
                      <Circle className="w-5 h-5 text-warm-300 group-hover:text-primary-500" />
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
