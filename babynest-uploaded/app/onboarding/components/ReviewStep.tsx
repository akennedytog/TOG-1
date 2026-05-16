'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, 
  MapPin, 
  Calendar, 
  Users, 
  Wallet, 
  Shield, 
  Building2,
  CheckCircle2,
  Loader2,
  Baby
} from 'lucide-react';

interface ReviewStepProps {
  onNext: () => void;
  onBack: () => void;
  onGenerate: () => Promise<void>;
  isGenerating: boolean;
  generatedTasks: GeneratedTask[];
  data: {
    state: string;
    dueDate: string;
    incomeBracket: string;
    familySize: string;
    hasPartner: boolean;
    provider: string;
    planType: string;
  };
}

interface GeneratedTask {
  id: string;
  title: string;
  description: string;
  category: 'insurance' | '529' | 'tax' | 'legal' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: string | null;
  icon: string;
}

const INCOME_LABELS: Record<string, string> = {
  'under50k': 'Under $50,000',
  '50k-75k': '$50,000 - $75,000',
  '75k-100k': '$75,000 - $100,000',
  '100k-150k': '$100,000 - $150,000',
  '150k-200k': '$150,000 - $200,000',
  'over200k': 'Over $200,000',
};

const PLAN_TYPE_LABELS: Record<string, string> = {
  'ppo': 'PPO',
  'hmo': 'HMO',
  'epo': 'EPO',
  'pos': 'POS',
  'hdhp': 'HDHP',
  'unknown': 'Not Sure',
};

export function ReviewStep({ 
  onNext, 
  onBack, 
  onGenerate, 
  isGenerating, 
  generatedTasks,
  data 
}: ReviewStepProps) {
  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'Not set';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'insurance':
        return <Shield className="w-4 h-4" />;
      case '529':
        return <Wallet className="w-4 h-4" />;
      case 'tax':
        return <Wallet className="w-4 h-4" />;
      case 'legal':
        return <Building2 className="w-4 h-4" />;
      default:
        return <CheckCircle2 className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'insurance':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case '529':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'tax':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'legal':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      default:
        return 'bg-warm-100 text-warm-700 border-warm-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-rose-100 text-rose-700';
      case 'high':
        return 'bg-amber-100 text-amber-700';
      case 'medium':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-warm-100 text-warm-700';
    }
  };

  if (generatedTasks.length === 0 && !isGenerating) {
    // Summary View - Before Generating
    return (
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
        className="max-w-xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-primary-600" />
          </div>
          <h2 className="text-3xl font-bold text-warm-900 mb-2">Review Your Information</h2>
          <p className="text-warm-600">Let's make sure everything looks right before we generate your plan.</p>
        </div>

        {/* Summary Cards */}
        <div className="space-y-4 mb-8">
          {/* State */}
          <div className="bg-white rounded-xl p-4 border border-warm-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-warm-500">State</p>
                <p className="font-semibold text-warm-900">{data.state}</p>
              </div>
            </div>
          </div>

          {/* Due Date */}
          <div className="bg-white rounded-xl p-4 border border-warm-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-accent-600" />
              </div>
              <div>
                <p className="text-sm text-warm-500">Due/Birth Date</p>
                <p className="font-semibold text-warm-900">{formatDate(data.dueDate)}</p>
              </div>
            </div>
          </div>

          {/* Family Info */}
          <div className="bg-white rounded-xl p-4 border border-warm-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-warm-500">Family</p>
                <p className="font-semibold text-warm-900">{data.familySize} people {data.hasPartner && '• With partner'}</p>
              </div>
            </div>
            {data.incomeBracket && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-warm-500">Income</p>
                  <p className="font-semibold text-warm-900">{INCOME_LABELS[data.incomeBracket]}</p>
                </div>
              </div>
            )}
          </div>

          {/* Insurance Info */}
          {data.provider && (
            <div className="bg-white rounded-xl p-4 border border-warm-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-warm-500">Insurance</p>
                  <p className="font-semibold text-warm-900">{data.provider}</p>
                </div>
              </div>
              {data.planType && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-sm text-warm-500">Plan Type</p>
                    <p className="font-semibold text-warm-900">{PLAN_TYPE_LABELS[data.planType]}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Generate Button */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button 
            onClick={onGenerate}
            className="w-full btn-primary py-4 h-auto text-lg"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Generate My Personalized Plan
          </Button>
        </motion.div>
        <p className="text-center mt-3 text-sm text-warm-500">
          We'll create {data.state}-specific tasks based on your information
        </p>

        {/* Navigation */}
        <div className="flex gap-3 mt-6">
          <Button 
            onClick={onBack}
            variant="outline"
            className="flex-1 py-3 h-auto"
          >
            Back
          </Button>
        </div>
      </motion.div>
    );
  }

  // Tasks Preview View - After Generating
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      className="max-w-2xl mx-auto"
    >
      {/* Header */}
      <div className="text-center mb-6">
        {isGenerating ? (
          <>
            <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
            </div>
            <h2 className="text-3xl font-bold text-warm-900 mb-2">Creating Your Plan...</h2>
            <p className="text-warm-600">Analyzing {data.state}-specific benefits and deadlines</p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-3xl font-bold text-warm-900 mb-2">Your Plan is Ready!</h2>
            <p className="text-warm-600">
              We've created {generatedTasks.length} personalized tasks for you
            </p>
          </>
        )}
      </div>

      {/* Tasks Preview */}
      {!isGenerating && (
        <>
          <div className="space-y-3 mb-8 max-h-96 overflow-y-auto pr-2">
            {generatedTasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl p-4 border border-warm-200 hover:border-primary-300 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 border ${getCategoryColor(task.category)}`}>
                    {getCategoryIcon(task.category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-warm-900 truncate">{task.title}</h4>
                      <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>
                    <p className="text-sm text-warm-600 line-clamp-2">{task.description}</p>
                    {task.dueDate && (
                      <p className="text-xs text-warm-500 mt-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Due: {formatDate(task.dueDate)}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex gap-3">
            <Button 
              onClick={onBack}
              variant="outline"
              className="flex-1 py-3 h-auto"
            >
              Back
            </Button>
            <Button 
              onClick={onNext}
              className="flex-1 btn-primary py-3 h-auto"
            >
              Continue to Tour
              <Baby className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </>
      )}
    </motion.div>
  );
}
