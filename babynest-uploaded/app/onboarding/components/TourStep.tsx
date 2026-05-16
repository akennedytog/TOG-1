'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  Baby, 
  MessageSquare, 
  Upload, 
  CheckCircle2, 
  Calendar,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Loader2
} from 'lucide-react';
import { useState } from 'react';

interface TourStepProps {
  onComplete: () => Promise<void> | void;
}

const TOUR_STEPS = [
  {
    id: 'dashboard',
    icon: Baby,
    title: 'Your Dashboard',
    description: 'This is your home base. See your upcoming tasks, track progress, and get a quick overview of what needs your attention.',
    highlight: 'tasks',
    color: 'from-primary-500 to-primary-600',
  },
  {
    id: 'chat',
    icon: MessageSquare,
    title: 'AI Assistant',
    description: 'Ask questions anytime! "When do I add my baby to insurance?" or "What\'s a 529 plan?" We\'re here 24/7.',
    highlight: 'chat',
    color: 'from-accent-500 to-accent-600',
  },
  {
    id: 'timeline',
    icon: Calendar,
    title: 'Task Timeline',
    description: 'View all your tasks in order. We organize them by urgency and due date so you always know what\'s next.',
    highlight: 'timeline',
    color: 'from-blue-500 to-blue-600',
  },
  {
    id: 'upload',
    icon: Upload,
    title: 'Insurance & Documents',
    description: 'Upload insurance cards and documents on your dashboard. Our AI extracts important dates and details automatically.',
    highlight: 'upload',
    color: 'from-emerald-500 to-emerald-600',
  },
  {
    id: 'complete',
    icon: Sparkles,
    title: 'You\'re All Set!',
    description: 'Your personalized plan is ready. Start with your most urgent tasks and work your way through. We\'ll be here to help!',
    highlight: null,
    color: 'from-amber-500 to-amber-600',
  },
];

export function TourStep({ onComplete }: TourStepProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const step = TOUR_STEPS[currentStep];
  const Icon = step.icon;

  const handleNext = async () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      console.log('Tour complete, calling onComplete...');
      setIsSaving(true);
      setSaveError(null);
      try {
        await onComplete();
        console.log('onComplete finished successfully');
      } catch (err: any) {
        console.error('Error in onComplete:', err);
        setSaveError(err.message || 'Failed to save. Please try again.');
        setIsSaving(false);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isLastStep = currentStep === TOUR_STEPS.length - 1;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      className="max-w-lg mx-auto"
    >
      {/* Progress Dots */}
      <div className="flex justify-center gap-2 mb-8">
        {TOUR_STEPS.map((_, index) => (
          <motion.button
            key={index}
            onClick={() => setCurrentStep(index)}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              index === currentStep
                ? 'w-8 bg-primary-500'
                : index < currentStep
                ? 'bg-primary-300'
                : 'bg-warm-200'
            }`}
            whileHover={{ scale: 1.2 }}
          />
        ))}
      </div>

      {/* Card */}
      <motion.div
        key={step.id}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-3xl p-8 shadow-soft-lg border border-warm-100"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: 'spring' }}
          className={`w-20 h-20 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg`}
        >
          <Icon className="w-10 h-10 text-white" />
        </motion.div>

        {/* Content */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-warm-900 mb-3">
            {step.title}
          </h2>
          <p className="text-warm-600 leading-relaxed">
            {step.description}
          </p>
        </div>

        {/* Feature Preview (Visual representation) */}
        {!isLastStep && (
          <div className="bg-cream-50 rounded-2xl p-4 mb-6 border border-warm-100">
            <div className="flex items-center gap-3 opacity-60">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                <Icon className="w-5 h-5 text-warm-400" />
              </div>
              <div className="flex-1">
                <div className="h-2 bg-warm-200 rounded-full w-24 mb-1.5" />
                <div className="h-2 bg-warm-200 rounded-full w-16" />
              </div>
              <CheckCircle2 className="w-5 h-5 text-warm-300" />
            </div>
          </div>
        )}

        {/* Completion Celebration */}
        {isLastStep && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center gap-4 mb-6"
          >
            {['🎉', '👶', '💚', '🎊', '✨'].map((emoji, i) => (
              <motion.span
                key={emoji}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="text-3xl"
              >
                {emoji}
              </motion.span>
            ))}
          </motion.div>
        )}

        {/* Error Message */}
        {saveError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-600 text-sm font-medium mb-2">Error saving your profile:</p>
            <p className="text-red-500 text-xs font-mono break-all">{saveError}</p>
            <p className="text-red-600 text-xs mt-2">Please try again or contact support.</p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3">
          {currentStep > 0 && (
            <Button 
              onClick={handleBack}
              variant="outline"
              className="flex-1 py-3 h-auto"
              disabled={isSaving}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
          )}
          <Button 
            onClick={handleNext}
            disabled={isSaving}
            className={`flex-1 btn-primary py-3 h-auto ${currentStep === 0 ? 'w-full' : ''}`}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : isLastStep ? (
              <>
                <span>Go to Dashboard</span>
                <CheckCircle2 className="w-4 h-4 ml-2" />
              </>
            ) : (
              <>
                <span>Next</span>
                <ChevronRight className="w-4 h-4 ml-1" />
              </>
            )}
          </Button>
        </div>

        {/* Skip Option */}
        {!isLastStep && (
          <button
            onClick={async () => {
              if (isSaving) return;
              console.log('Skip clicked, calling onComplete...');
              setIsSaving(true);
              try {
                await onComplete();
              } catch (err) {
                console.error('Error in onComplete:', err);
                alert('Failed to save. Please try again.');
                setIsSaving(false);
              }
            }}
            disabled={isSaving}
            className="w-full mt-4 text-sm text-warm-500 hover:text-warm-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : 'Skip tour and go to dashboard →'}
          </button>
        )}
      </motion.div>

      {/* Step Counter */}
      <p className="text-center mt-6 text-sm text-warm-500">
        Step {currentStep + 1} of {TOUR_STEPS.length}
      </p>
    </motion.div>
  );
}
