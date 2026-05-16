'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Calendar, Users, Wallet, Baby, Info } from 'lucide-react';
import { useState } from 'react';

interface PersonalInfoStepProps {
  onNext: () => void;
  onBack: () => void;
  data: {
    dueDate: string;
    incomeBracket: string;
    familySize: string;
    hasPartner: boolean;
    partnerName: string;
    partnerEmail?: string;
  };
  onDataChange: (data: Partial<PersonalInfoStepProps['data']>) => void;
}

const INCOME_BRACKETS = [
  { value: 'under50k', label: 'Under $50,000', description: 'May qualify for additional assistance programs' },
  { value: '50k-75k', label: '$50,000 - $75,000', description: 'Standard tax benefits apply' },
  { value: '75k-100k', label: '$75,000 - $100,000', description: 'Good candidate for 529 plans' },
  { value: '100k-150k', label: '$100,000 - $150,000', description: 'Consider tax-optimization strategies' },
  { value: '150k-200k', label: '$150,000 - $200,000', description: 'Advanced planning recommended' },
  { value: 'over200k', label: 'Over $200,000', description: 'Comprehensive financial planning' },
];

const FAMILY_SIZES = [
  { value: '2', label: '2 people (You + Partner)', icon: '👫' },
  { value: '3', label: '3 people (+1 child)', icon: '👨‍👩‍👧' },
  { value: '4', label: '4 people (+2 children)', icon: '👨‍👩‍👧‍👦' },
  { value: '5+', label: '5+ people', icon: '👨‍👩‍👧‍👦➕' },
];

export function PersonalInfoStep({ onNext, onBack, data, onDataChange }: PersonalInfoStepProps) {
  const [showPartnerFields, setShowPartnerFields] = useState(data.hasPartner);

  const calculateTimeline = () => {
    if (!data.dueDate) return null;
    const due = new Date(data.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    
    const diffTime = due.getTime() - today.getTime();
    const daysUntilDue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const weeksUntilDue = Math.floor(daysUntilDue / 7);
    
    // Calculate weeks pregnant (40 weeks total - weeks remaining)
    const weeksPregnant = Math.min(40, Math.max(0, 40 - weeksUntilDue));

    if (daysUntilDue < 0) {
      return { label: 'Baby has arrived! 🎉', color: 'text-emerald-600', bg: 'bg-emerald-50' };
    } else if (weeksPregnant >= 27) {
      return { label: `3rd trimester - ${daysUntilDue} days to go! 🏁`, color: 'text-amber-600', bg: 'bg-amber-50' };
    } else if (weeksPregnant >= 13) {
      return { label: `2nd trimester - ${weeksUntilDue} weeks to go ✨`, color: 'text-primary-600', bg: 'bg-primary-50' };
    } else {
      return { label: `1st trimester - ${weeksUntilDue} weeks to go 💚`, color: 'text-rose-600', bg: 'bg-rose-50' };
    }
  };

  const timeline = calculateTimeline();

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
        <div className="w-16 h-16 bg-gradient-to-br from-accent-100 to-accent-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Users className="w-8 h-8 text-accent-600" />
        </div>
        <h2 className="text-3xl font-bold text-warm-900 mb-2">Tell us about your family</h2>
        <p className="text-warm-600">This helps us personalize your task recommendations.</p>
      </div>

      <div className="space-y-5">
        {/* Due Date / Birth Date */}
        <div>
          <label className="block text-sm font-semibold text-warm-700 mb-2">
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Baby's Due Date or Birth Date
            </span>
          </label>
          <input
            type="date"
            value={data.dueDate}
            onChange={(e) => onDataChange({ dueDate: e.target.value })}
            className="w-full px-4 py-3 bg-white border-2 border-warm-200 rounded-xl focus:border-primary-500 focus:outline-none transition-colors"
          />
          {timeline && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-2 px-3 py-2 rounded-lg ${timeline.bg} ${timeline.color} text-sm font-medium flex items-center gap-2`}
            >
              <Baby className="w-4 h-4" />
              {timeline.label}
            </motion.div>
          )}
        </div>

        {/* Income Bracket */}
        <div>
          <label className="block text-sm font-semibold text-warm-700 mb-2">
            <span className="flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              Household Income (Optional)
            </span>
          </label>
          <div className="grid grid-cols-1 gap-2">
            {INCOME_BRACKETS.map((bracket) => (
              <motion.button
                key={bracket.value}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => onDataChange({ incomeBracket: bracket.value })}
                className={`flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all text-left ${
                  data.incomeBracket === bracket.value
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-warm-200 bg-white hover:border-primary-300'
                }`}
              >
                <div>
                  <span className="font-medium text-warm-900">{bracket.label}</span>
                  <p className="text-xs text-warm-500">{bracket.description}</p>
                </div>
                {data.incomeBracket === bracket.value && (
                  <div className="w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </motion.button>
            ))}
          </div>
          <p className="mt-2 text-xs text-warm-500 flex items-center gap-1">
            <Info className="w-3 h-3" />
            This helps us recommend tax benefits and programs you may qualify for.
          </p>
        </div>

        {/* Family Size */}
        <div>
          <label className="block text-sm font-semibold text-warm-700 mb-2">
            Current Family Size
          </label>
          <div className="grid grid-cols-2 gap-2">
            {FAMILY_SIZES.map((size) => (
              <motion.button
                key={size.value}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onDataChange({ familySize: size.value })}
                className={`px-4 py-3 rounded-xl border-2 transition-all text-left ${
                  data.familySize === size.value
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-warm-200 bg-white hover:border-primary-300'
                }`}
              >
                <span className="text-2xl mr-2">{size.icon}</span>
                <span className="font-medium text-warm-900">{size.label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Partner Info */}
        <div className="bg-cream-100 rounded-xl p-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={data.hasPartner}
              onChange={(e) => {
                setShowPartnerFields(e.target.checked);
                onDataChange({ hasPartner: e.target.checked });
              }}
              className="w-5 h-5 rounded border-warm-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="font-medium text-warm-900">I have a partner/co-parent</span>
          </label>
          
          {showPartnerFields && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 space-y-3"
            >
              <div>
                <label className="block text-sm text-warm-600 mb-1">
                  Partner's Name (Optional)
                </label>
                <input
                  type="text"
                  value={data.partnerName}
                  onChange={(e) => onDataChange({ partnerName: e.target.value })}
                  placeholder="e.g., Jordan"
                  className="w-full px-4 py-2 bg-white border border-warm-200 rounded-lg focus:border-primary-500 focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm text-warm-600 mb-1">
                  Partner's Email (Optional)
                </label>
                <input
                  type="email"
                  value={data.partnerEmail || ''}
                  onChange={(e) => onDataChange({ partnerEmail: e.target.value })}
                  placeholder="partner@example.com"
                  className="w-full px-4 py-2 bg-white border border-warm-200 rounded-lg focus:border-primary-500 focus:outline-none"
                />
                <p className="mt-1 text-xs text-warm-500">
                  We'll send them an invite to link accounts and share task updates.
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-3 mt-8">
        <Button 
          onClick={onBack}
          variant="outline"
          className="flex-1 py-3 h-auto"
        >
          Back
        </Button>
        <Button 
          onClick={onNext}
          disabled={!data.dueDate}
          className="flex-1 btn-primary py-3 h-auto disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
        </Button>
      </div>
    </motion.div>
  );
}
