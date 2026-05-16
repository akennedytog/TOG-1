'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { MapPin, ChevronDown, Info } from 'lucide-react';
import { useState } from 'react';

interface StateStepProps {
  onNext: () => void;
  onBack: () => void;
  selectedState: string;
  onStateChange: (state: string) => void;
}

const US_STATES = [
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' },
];

export function StateStep({ onNext, onBack, selectedState, onStateChange }: StateStepProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStates = searchTerm 
    ? US_STATES.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.code.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : US_STATES;

  const selectedStateName = US_STATES.find(s => s.code === selectedState)?.name || 'Select your state';

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      className="max-w-xl mx-auto"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <MapPin className="w-8 h-8 text-primary-600" />
        </div>
        <h2 className="text-3xl font-bold text-warm-900 mb-2">Where are you located?</h2>
        <p className="text-warm-600">We customize tasks and benefits based on your state.</p>
      </div>

      {/* State Selector */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-warm-700 mb-2">
          Select Your State
        </label>
        
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex items-center justify-between px-4 py-3 bg-white border-2 border-warm-200 rounded-xl text-left hover:border-primary-300 focus:border-primary-500 focus:outline-none transition-colors"
          >
            <span className={selectedState ? 'text-warm-900' : 'text-warm-400'}>
              {selectedState ? `${selectedStateName} (${selectedState})` : 'Select your state'}
            </span>
            <ChevronDown className={`w-5 h-5 text-warm-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-soft-lg border border-warm-200 max-h-80 overflow-hidden"
            >
              {/* Search Input */}
              <div className="p-3 border-b border-warm-100">
                <input
                  type="text"
                  placeholder="Search states..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 bg-warm-50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                />
              </div>
              
              {/* State List */}
              <div className="overflow-y-auto max-h-60">
                {filteredStates.map((state) => (
                  <button
                    key={state.code}
                    onClick={() => {
                      onStateChange(state.code);
                      setIsOpen(false);
                      setSearchTerm('');
                    }}
                    className={`w-full px-4 py-3 text-left hover:bg-primary-50 transition-colors flex items-center justify-between ${
                      selectedState === state.code ? 'bg-primary-50 text-primary-700' : 'text-warm-700'
                    }`}
                  >
                    <span>{state.name}</span>
                    {selectedState === state.code && (
                      <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full">
                        Selected
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Info Box */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 mb-8 border border-blue-100"
      >
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Info className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h4 className="font-semibold text-warm-900 mb-1">Why does this matter?</h4>
            <ul className="text-sm text-warm-700 space-y-1.5">
              <li>• Each state has different insurance deadlines (30-90 days)</li>
              <li>• Tax benefits vary significantly by state</li>
              <li>• Some states have unique programs like CalKIDS or Florida Prepaid</li>
              <li>• 529 plan rules and limits are state-specific</li>
            </ul>
          </div>
        </div>
      </motion.div>

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
          disabled={!selectedState}
          className="flex-1 btn-primary py-3 h-auto disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
        </Button>
      </div>
    </motion.div>
  );
}
