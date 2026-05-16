'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase, updateProfile } from '@/lib/supabase';
import { getInsuranceDeadline, get529PlanName } from '@/lib/onboarding';
import { Baby, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WelcomeStep } from './components/WelcomeStep';
import { StateStep } from './components/StateStep';
import { PersonalInfoStep } from './components/PersonalInfoStep';
import { InsuranceStep } from './components/InsuranceStep';
import { ReviewStep } from './components/ReviewStep';
import { TourStep } from './components/TourStep';

const STEPS = [
  { id: 'welcome', label: 'Welcome', number: 1 },
  { id: 'state', label: 'Location', number: 2 },
  { id: 'personal', label: 'Family', number: 3 },
  { id: 'insurance', label: 'Insurance', number: 4 },
  { id: 'review', label: 'Review', number: 5 },
  { id: 'tour', label: 'Tour', number: 6 },
];

interface GeneratedTask {
  id: string;
  title: string;
  description: string;
  category: 'insurance' | '529' | 'tax' | 'legal' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: string | null;
  icon: string;
}

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTasks, setGeneratedTasks] = useState<GeneratedTask[]>([]);
  const [user, setUser] = useState<any>(null);
  
  // Form data
  const [formData, setFormData] = useState({
    state: '',
    dueDate: '',
    incomeBracket: '',
    familySize: '2',
    hasPartner: false,
    partnerName: '',
    partnerEmail: '',
    provider: '',
    planType: '',
    insuranceDueDate: '',
  });

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/auth/signin');
        return;
      }

      setUser(user);
      
      // Check if user has already completed onboarding
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profile?.onboarding_completed) {
        router.push('/dashboard');
        return;
      }

      // Pre-fill state if it exists
      if (profile?.state) {
        setFormData(prev => ({ ...prev, state: profile.state }));
      }
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
      saveProgress();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkipInsurance = () => {
    setCurrentStep(currentStep + 1);
    saveProgress();
  };
  
  const handleSkipTour = async () => {
    if (!user) return;
    if (!confirm('Skip the tour and go straight to your dashboard? You can always come back and update your info.')) return;
    
    try {
      // Save whatever data we have, mark onboarding complete
      await updateProfile(user.id, {
        state: formData.state || undefined,
        due_date: formData.dueDate || undefined,
        income_bracket: formData.incomeBracket || undefined,
        family_size: parseInt(formData.familySize) || 2,
        onboarding_completed: true,
      });
      router.push('/dashboard');
    } catch (error) {
      console.error('Error skipping tour:', error);
      router.push('/dashboard');
    }
  };

  const saveProgress = async () => {
    if (!user) return;
    
    try {
      await updateProfile(user.id, {
        state: formData.state || undefined,
        due_date: formData.dueDate || undefined,
        income_bracket: formData.incomeBracket || undefined,
        family_size: parseInt(formData.familySize) || 2,
        onboarding_step: currentStep,
      });
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  const handleGenerateTasks = async () => {
    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/generate-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          state: formData.state,
          dueDate: formData.dueDate,
          incomeBracket: formData.incomeBracket,
          familySize: formData.familySize,
          provider: formData.provider,
          planType: formData.planType,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate tasks');
      }

      const { tasks } = await response.json();
      setGeneratedTasks(tasks);
      
      // Save tasks directly to database
      const tasksToInsert = tasks.map((task: GeneratedTask) => ({
        user_id: user.id,
        title: task.title,
        description: task.description,
        category: task.category,
        priority: task.priority,
        due_date: task.dueDate,
        status: 'pending',
      }));
      
      await supabase.from('tasks').insert(tasksToInsert);
    } catch (error) {
      console.error('Error generating tasks:', error);
      // Generate fallback tasks
      const fallbackTasks = generateFallbackTasks();
      setGeneratedTasks(fallbackTasks);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateFallbackTasks = (): GeneratedTask[] => {
    const tasks: GeneratedTask[] = [];
    const dueDate = new Date(formData.dueDate);
    const state = formData.state;
    const incomeBracket = formData.incomeBracket;
    
    // Determine priority based on income
    const isHighIncome = incomeBracket === '150k-200k' || incomeBracket === 'over200k';
    const isLowIncome = incomeBracket === 'under50k' || incomeBracket === '50k-75k';
    
    // 1. INSURANCE - Always urgent
    const insuranceDeadline = getInsuranceDeadline(state);
    tasks.push({
      id: '1',
      title: `Add Baby to Health Insurance (${state})`,
      description: `CRITICAL: You have ${insuranceDeadline} days from birth to add your baby. Missing this means no coverage until next open enrollment. Call HR or your insurance provider immediately.`,
      category: 'insurance',
      priority: 'urgent',
      dueDate: new Date(dueDate.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      icon: 'shield',
    });

    // 2. SSN - Required for everything else
    tasks.push({
      id: '2',
      title: 'Get Social Security Number for Baby',
      description: 'Required for taxes, claiming as dependent, and opening certain accounts. Apply at the hospital (easiest) or SSA office. Get multiple certified copies of birth certificate too.',
      category: 'tax',
      priority: 'urgent',
      dueDate: new Date(dueDate.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      icon: 'file',
    });

    // 3. TAX WITHHOLDING - Immediate money
    tasks.push({
      id: '3',
      title: 'Update W-4 and Tax Withholdings',
      description: 'Add your new dependent to reduce tax withholding = more take-home pay NOW. File with HR. You\'ll claim the $2,000 Child Tax Credit when you file taxes.',
      category: 'tax',
      priority: 'high',
      dueDate: new Date(dueDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      icon: 'calculator',
    });

    // 4. LIFE INSURANCE - Essential protection
    tasks.push({
      id: '4',
      title: 'Get Term Life Insurance (If You Don\'t Have It)',
      description: 'GROUP LIFE FROM WORK IS NOT ENOUGH. Get $500k-$1M term life policy. Costs ~$20-50/month for healthy adults. Essential if something happens to you.',
      category: 'insurance',
      priority: 'high',
      dueDate: new Date(dueDate.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      icon: 'heart',
    });

    // 5. WILL - Legal protection
    tasks.push({
      id: '5',
      title: 'Create or Update Your Will',
      description: 'Name guardians for your child. Without this, the COURT decides who raises your child if something happens to you. Update beneficiaries on ALL accounts too (401k, IRA, insurance).',
      category: 'legal',
      priority: 'high',
      dueDate: new Date(dueDate.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      icon: 'document',
    });

    // 6. 529 PLAN - Education savings
    const plan529Name = get529PlanName(state);
    tasks.push({
      id: '6',
      title: `Open ${state} 529 Plan`,
      description: `Start with ${plan529Name}. Tax-free growth for education. You can use for K-12 private school too (federal law). Many states offer tax deductions. Front-load if possible - compound growth is powerful.`,
      category: '529',
      priority: 'high',
      dueDate: new Date(dueDate.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      icon: 'wallet',
    });

    // 7. FLEXIBLE SPENDING - Pre-tax money
    tasks.push({
      id: '7',
      title: 'Maximize FSA or HSA for Medical Expenses',
      description: 'FSA: $3,050/year (use it or lose it). HSA: $8,300/year family (rolls over forever). Both are pre-tax dollars for medical expenses. Perfect for diapers, formula, doctor visits.',
      category: 'tax',
      priority: 'high',
      dueDate: new Date(dueDate.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      icon: 'briefcase',
    });

    // 8. CREDIT FREEZE - Identity protection
    tasks.push({
      id: '8',
      title: 'Freeze Your Child\'s Credit (All 3 Bureaus)',
      description: 'Protect against identity theft. Freeze with Equifax, Experian, TransUnion. It\'s FREE and prevents fraud. Child SSNs are valuable targets for thieves.',
      category: 'legal',
      priority: 'high',
      dueDate: new Date(dueDate.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      icon: 'lock',
    });

    // 9. DEPENDENT CARE FSA - Childcare costs
    tasks.push({
      id: '9',
      title: 'Set Up Dependent Care FSA (If Both Parents Work)',
      description: 'Up to $5,000 pre-tax for childcare expenses. Daycare, preschool, before/after school care. Both divorced parents can have one. Reduces taxable income significantly.',
      category: 'tax',
      priority: isHighIncome ? 'high' : 'medium',
      dueDate: new Date(dueDate.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      icon: 'users',
    });

    // 10. COVERDELL ESA - Alternative to 529
    tasks.push({
      id: '10',
      title: 'Consider Coverdell ESA ($2,000/year limit)',
      description: 'More flexible than 529 - can be used for K-12 expenses (tutors, computers, etc.). $2k/year contribution limit. Income limits apply. Good supplement to 529.',
      category: '529',
      priority: 'medium',
      dueDate: new Date(dueDate.getTime() + 120 * 24 * 60 * 60 * 1000).toISOString(),
      icon: 'piggy-bank',
    });

    // 11. 529 SUPERFUND - Advanced strategy
    tasks.push({
      id: '11',
      title: 'Consider 529 Superfunding (5-Year Election)',
      description: 'Gift up to $85,000 at once per child ($170k for couples) using 5-year gift tax election. Front-loading = more compound growth. Doesn\'t count against $18k annual gift limit.',
      category: '529',
      priority: isHighIncome ? 'high' : 'low',
      dueDate: new Date(dueDate.getTime() + 180 * 24 * 60 * 60 * 1000).toISOString(),
      icon: 'sparkles',
    });

    // 12. ROTH IRA FOR BABY - Ultimate hack
    tasks.push({
      id: '12',
      title: 'Set Up Custodial Roth IRA for Your Baby',
      description: 'ULTIMATE HACK: If baby has ANY earned income (modeling, acting, family business), you can contribute up to $7,000/year to Roth IRA. Tax-free growth for 60+ years! Start planning now.',
      category: '529',
      priority: 'medium',
      dueDate: new Date(dueDate.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      icon: 'star',
    });

    // 13. 529 TO ROTH ROLLOVER - New 2024 rule
    tasks.push({
      id: '13',
      title: 'Know About 529-to-Roth Rollover (NEW 2024)',
      description: 'NEW LAW: Starting 2024, unused 529 funds can roll over to Roth IRA (lifetime limit $35k). Great safety net if kid gets scholarships or doesn\'t go to college.',
      category: '529',
      priority: 'medium',
      dueDate: new Date(dueDate.getTime() + 180 * 24 * 60 * 60 * 1000).toISOString(),
      icon: 'refresh',
    });

    // 14. UMBRELLA INSURANCE - Extra protection
    tasks.push({
      id: '14',
      title: 'Get Umbrella Liability Insurance ($1-2M)',
      description: 'Protects against lawsuits. With kids, liability increases (playground injuries, etc.). Only ~$200-400/year for $1M coverage. Covers gaps in auto/home policies.',
      category: 'insurance',
      priority: 'medium',
      dueDate: new Date(dueDate.getTime() + 120 * 24 * 60 * 60 * 1000).toISOString(),
      icon: 'umbrella',
    });

    // 15. UTMA/UGMA - Flexible savings
    tasks.push({
      id: '15',
      title: 'Open UTMA/UGMA Account (Flexible Savings)',
      description: 'Not just for college - can be used for ANY expense benefiting child before age 18-25. More flexible than 529 but counts against financial aid. Good for car, computer, etc.',
      category: '529',
      priority: 'low',
      dueDate: new Date(dueDate.getTime() + 180 * 24 * 60 * 60 * 1000).toISOString(),
      icon: 'gift',
    });

    // 16. BENEFICIARY REVIEW - Critical
    tasks.push({
      id: '16',
      title: 'Review ALL Beneficiary Designations',
      description: 'Update 401k, IRA, life insurance, bank accounts. These pass directly to beneficiaries - bypass probate and will. Most people forget this! Check annually.',
      category: 'legal',
      priority: 'high',
      dueDate: new Date(dueDate.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      icon: 'check',
    });

    // 17. EITC - Low income benefit
    if (isLowIncome) {
      tasks.push({
        id: '17',
        title: 'Apply for Earned Income Tax Credit (EITC)',
        description: 'With a child, you could get up to $3,995 federal credit (2024). File taxes even if you don\'t owe anything. This is refundable money in your pocket.',
        category: 'tax',
        priority: 'high',
        dueDate: new Date(dueDate.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        icon: 'dollar',
      });
    }

    // 18. HEALTHCARE SUBSIDY - Income-based
    if (isLowIncome) {
      tasks.push({
        id: '18',
        title: 'Check Healthcare Marketplace Subsidies (APTC)',
        description: 'With a baby, you may qualify for Advanced Premium Tax Credits. Household size increased = lower income percentage for subsidies. Re-evaluate immediately.',
        category: 'insurance',
        priority: 'high',
        dueDate: new Date(dueDate.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        icon: 'heart',
      });
    }

    // 19. DIGITAL ESTATE - Modern consideration
    tasks.push({
      id: '19',
      title: 'Document Digital Assets and Accounts',
      description: 'What happens to photos, social media, email accounts if something happens to you? Create a list of passwords and digital assets. Consider a digital executor.',
      category: 'legal',
      priority: 'medium',
      dueDate: new Date(dueDate.getTime() + 180 * 24 * 60 * 60 * 1000).toISOString(),
      icon: 'cloud',
    });

    // 20. HOME INSURANCE REVIEW
    tasks.push({
      id: '20',
      title: 'Review Homeowners/Renters Insurance',
      description: 'With kids comes increased liability (playground injuries, etc.). Make sure coverage is adequate. Consider increasing liability coverage or getting umbrella policy.',
      category: 'insurance',
      priority: 'medium',
      dueDate: new Date(dueDate.getTime() + 120 * 24 * 60 * 60 * 1000).toISOString(),
      icon: 'home',
    });

    return tasks;
  };

  const handleComplete = async () => {
    if (!user) {
      console.error('No user found');
      throw new Error('No user found');
    }
    
    try {
      console.log('Saving onboarding data...', { userId: user.id, formData });
      
      // Build update object
      const updateData: any = {
        state: formData.state,
        due_date: formData.dueDate,
        income_bracket: formData.incomeBracket,
        family_size: parseInt(formData.familySize),
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString(),
      };
      
      // Only add partner fields if they have values
      if (formData.hasPartner !== undefined) {
        updateData.has_partner = formData.hasPartner;
      }
      if (formData.partnerName) {
        updateData.partner_name = formData.partnerName;
      }
      if (formData.partnerEmail) {
        updateData.partner_email = formData.partnerEmail;
      }
      
      // First check if profile exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();
      
      if (existingProfile) {
        // Update existing profile
        const { error } = await updateProfile(user.id, updateData);
        if (error) throw error;
      } else {
        // Create new profile
        const { error } = await supabase.from('profiles').insert({
          id: user.id,
          email: user.email,
          ...updateData
        });
        if (error) throw error;
      }
      
      console.log('Profile saved successfully!');
      
      // Generate and save tasks
      const tasks = generateFallbackTasks();
      const tasksToInsert = tasks.map(task => ({
        user_id: user.id,
        title: task.title,
        description: task.description,
        category: task.category,
        priority: task.priority,
        due_date: task.dueDate,
        status: 'pending',
      }));
      
      await supabase.from('tasks').insert(tasksToInsert);
      console.log('Tasks saved successfully!');
      
      // Force redirect
      window.location.href = '/dashboard';
    } catch (error: any) {
      console.error('Error completing onboarding:', error);
      throw error;
    }
  };

  const updateFormData = (data: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow animate-pulse-soft">
            <Baby className="w-8 h-8 text-white" />
          </div>
          <p className="text-warm-600 font-medium">Loading your onboarding experience...💚</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 via-cream-100 to-primary-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-cream-50/80 backdrop-blur-xl border-b border-warm-100">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-soft">
                <Baby className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-warm-900">BabyNest</span>
            </div>
            
            <div className="hidden md:flex items-center gap-1">
              {STEPS.map((step, index) => {
                const isActive = index === currentStep;
                const isCompleted = index < currentStep;
                
                return (
                  <div key={step.id} className="flex items-center">
                    <motion.div
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors ${
                        isActive
                          ? 'bg-primary-100 text-primary-700'
                          : isCompleted
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'text-warm-400'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                        isActive
                          ? 'bg-primary-500 text-white'
                          : isCompleted
                          ? 'bg-emerald-500 text-white'
                          : 'bg-warm-200 text-warm-500'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          step.number
                        )}
                      </div>
                      <span className="text-sm font-medium hidden lg:inline">{step.label}</span>
                    </motion.div>
                    {index < STEPS.length - 1 && (
                      <div className={`w-8 h-0.5 mx-1 ${
                        isCompleted ? 'bg-emerald-300' : 'bg-warm-200'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-3">
              <div className="text-sm text-warm-500">
                Step {currentStep + 1} of {STEPS.length}
              </div>
              {currentStep > 0 && currentStep < STEPS.length - 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSkipTour}
                  className="text-warm-500 hover:text-warm-700 min-h-[44px]"
                >
                  Skip tour
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 md:py-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            className="max-w-4xl mx-auto"
          >
            {currentStep === 0 && (
              <WelcomeStep onNext={handleNext} />
            )}
            
            {currentStep === 1 && (
              <StateStep
                onNext={handleNext}
                onBack={handleBack}
                selectedState={formData.state}
                onStateChange={(state) => updateFormData({ state })}
              />
            )}
            
            {currentStep === 2 && (
              <PersonalInfoStep
                onNext={handleNext}
                onBack={handleBack}
                data={{
                  dueDate: formData.dueDate,
                  incomeBracket: formData.incomeBracket,
                  familySize: formData.familySize,
                  hasPartner: formData.hasPartner,
                  partnerName: formData.partnerName,
                  partnerEmail: formData.partnerEmail,
                }}
                onDataChange={(data) => updateFormData(data)}
              />
            )}
            
            {currentStep === 3 && (
              <InsuranceStep
                onNext={handleNext}
                onBack={handleBack}
                onSkip={handleSkipInsurance}
                data={{
                  provider: formData.provider,
                  planType: formData.planType,
                  insuranceDueDate: formData.insuranceDueDate,
                }}
                onDataChange={(data) => updateFormData(data)}
                state={formData.state}
              />
            )}
            
            {currentStep === 4 && (
              <ReviewStep
                onNext={handleNext}
                onBack={handleBack}
                onGenerate={handleGenerateTasks}
                isGenerating={isGenerating}
                generatedTasks={generatedTasks}
                data={formData}
              />
            )}
            
            {currentStep === 5 && (
              <TourStep onComplete={handleComplete} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Progress */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-warm-100 p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="text-sm font-medium text-warm-900">
              Step {currentStep + 1}
            </div>
            <div className="text-sm text-warm-500">
              of {STEPS.length}
            </div>
          </div>
          <div className="flex gap-1">
            {STEPS.map((_, index) => (
              <div
                key={index}
                className={`w-8 h-1.5 rounded-full transition-colors ${
                  index <= currentStep ? 'bg-primary-500' : 'bg-warm-200'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
