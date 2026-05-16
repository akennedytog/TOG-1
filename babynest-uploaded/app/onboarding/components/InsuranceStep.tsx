'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Shield, Calendar, Building2, Check, Info, AlertCircle } from 'lucide-react';

interface InsuranceStepProps {
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
  data: {
    provider: string;
    planType: string;
    insuranceDueDate: string;
  };
  onDataChange: (data: Partial<InsuranceStepProps['data']>) => void;
  state: string;
}

const INSURANCE_PROVIDERS = [
  'Blue Cross Blue Shield',
  'UnitedHealthcare',
  'Aetna',
  'Cigna',
  'Kaiser Permanente',
  'Humana',
  'Anthem',
  'Molina Healthcare',
  'Centene',
  'Oscar Health',
  'Bright Health',
  'Other',
];

const PLAN_TYPES = [
  { value: 'ppo', label: 'PPO', description: 'Preferred Provider Organization - More flexibility' },
  { value: 'hmo', label: 'HMO', description: 'Health Maintenance Organization - Lower costs, referrals needed' },
  { value: 'epo', label: 'EPO', description: 'Exclusive Provider Organization - No referrals, in-network only' },
  { value: 'pos', label: 'POS', description: 'Point of Service - Mix of HMO and PPO' },
  { value: 'hdhp', label: 'HDHP', description: 'High Deductible Health Plan - Lower premiums, higher deductible' },
  { value: 'unknown', label: 'Not Sure', description: 'We\'ll help you figure this out' },
];

export function InsuranceStep({ onNext, onBack, onSkip, data, onDataChange, state }: InsuranceStepProps) {
  const getInsuranceDeadline = () => {
    const deadlines: Record<string, number> = {
      'FL': 60,
      'TX': 30,
      'CA': 30,
      'NY': 30,
      'IL': 30,
      'PA': 30,
      'OH': 30,
      'MI': 30,
      'GA': 30,
      'NC': 30,
      'NJ': 30,
      'VA': 30,
      'WA': 60,
      'AZ': 30,
      'MA': 30,
      'TN': 30,
      'IN': 30,
      'MO': 30,
      'MD': 30,
      'WI': 60,
      'CO': 30,
      'MN': 60,
      'SC': 30,
      'AL': 60,
      'LA': 30,
      'KY': 30,
      'OR': 60,
      'OK': 60,
      'CT': 30,
      'UT': 60,
      'IA': 60,
      'NV': 30,
      'AR': 60,
      'MS': 60,
      'KS': 60,
      'NM': 60,
      'NE': 60,
      'WV': 60,
      'ID': 60,
      'HI': 30,
      'NH': 60,
      'ME': 60,
      'MT': 60,
      'RI': 30,
      'DE': 30,
      'SD': 60,
      'ND': 60,
      'AK': 60,
      'VT': 60,
      'WY': 60,
    };
    return deadlines[state] || 30;
  };

  const deadlineDays = getInsuranceDeadline();

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
        <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-emerald-600" />
        </div>
        <h2 className="text-3xl font-bold text-warm-900 mb-2">Insurance Information</h2>
        <p className="text-warm-600">Help us track important deadlines for you.</p>
      </div>

      <div className="space-y-5">
        {/* Insurance Provider */}
        <div>
          <label className="block text-sm font-semibold text-warm-700 mb-2">
            <span className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Insurance Provider
            </span>
          </label>
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
            {INSURANCE_PROVIDERS.map((provider) => (
              <motion.button
                key={provider}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onDataChange({ provider })}
                className={`px-3 py-2 rounded-lg border-2 transition-all text-sm ${
                  data.provider === provider
                    ? 'border-primary-500 bg-primary-50 text-primary-700 font-medium'
                    : 'border-warm-200 bg-white text-warm-700 hover:border-primary-300'
                }`}
              >
                {provider}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Plan Type */}
        <div>
          <label className="block text-sm font-semibold text-warm-700 mb-2">
            Plan Type
          </label>
          <div className="space-y-2">
            {PLAN_TYPES.map((plan) => (
              <motion.button
                key={plan.value}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => onDataChange({ planType: plan.value })}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all text-left ${
                  data.planType === plan.value
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-warm-200 bg-white hover:border-primary-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    data.planType === plan.value ? 'bg-primary-500' : 'bg-warm-100'
                  }`}>
                    <Shield className={`w-5 h-5 ${
                      data.planType === plan.value ? 'text-white' : 'text-warm-500'
                    }`} />
                  </div>
                  <div>
                    <span className="font-medium text-warm-900">{plan.label}</span>
                    <p className="text-xs text-warm-500">{plan.description}</p>
                  </div>
                </div>
                {data.planType === plan.value && (
                  <Check className="w-5 h-5 text-primary-500" />
                )}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Insurance Deadline Notice */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200"
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <h4 className="font-semibold text-warm-900 mb-1">Important Deadline! ⏰</h4>
              <p className="text-sm text-warm-700">
                In {state}, you have{' '}
                <span className="font-bold text-amber-700">{deadlineDays} days</span>
                {' '}from your baby&apos;s birth to add them to your health insurance.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Target Date for Insurance */}
        <div className="bg-cream-100 rounded-xl p-4">
          <label className="block text-sm font-semibold text-warm-700 mb-2">
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Target Date to Complete Insurance Tasks
            </span>
          </label>
          <input
            type="date"
            value={data.insuranceDueDate}
            onChange={(e) => onDataChange({ insuranceDueDate: e.target.value })}
            className="w-full px-4 py-2 bg-white border border-warm-200 rounded-lg focus:border-primary-500 focus:outline-none"
          />
          <p className="mt-2 text-xs text-warm-500 flex items-center gap-1">
            <Info className="w-3 h-3" />
            We&apos;ll remind you to complete insurance tasks before this date.
          </p>
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
          className="flex-1 btn-primary py-3 h-auto"
        >
          Continue
        </Button>
      </div>

      {/* Skip Option */}
      <button
        onClick={onSkip}
        className="w-full mt-4 text-sm text-warm-500 hover:text-warm-700 transition-colors"
      >
        Skip this step for now →
      </button>
    </motion.div>
  );
}
