'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Syringe,
  CheckCircle2,
  Calendar,
  ExternalLink,
  BookOpen,
  Stethoscope,
  AlertCircle,
  Check,
  Info,
  Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Vaccine preference types
export type VaccinePreference = 'standard' | 'delay' | 'decline';

export interface BirthPlanVaccine {
  id: string;
  name: string;
  timing: string;
  description: string;
  preference: VaccinePreference;
  discussWithDoctor: boolean;
  notes: string;
}

export interface VaccinationTrackerProps {
  onVaccinesChange?: (vaccines: BirthPlanVaccine[]) => void;
  initialSelectedVaccines?: BirthPlanVaccine[];
  mode?: 'info' | 'birth-plan';
  /** @deprecated Use mode="birth-plan" instead */
  showBirthPlanMode?: boolean;
  /** Tracked-as-received vaccines, lifted state for cross-component sync */
  completedVaccineIds?: string[];
  onCompletedChange?: (vaccineIds: string[]) => void;
}

// Vaccination data
interface Vaccine {
  id: string;
  name: string;
  shortName: string;
  age: string;
  timing: string;
  description: string;
  cdcLink: string;
  /** Why this vaccine matters */
  importance?: string;
  /** Common side effects */
  sideEffects?: string;
  /** Number of doses */
  doses?: string;
}

const VACCINES: Vaccine[] = [
  {
    id: 'hepb',
    name: 'Hepatitis B',
    shortName: 'HepB',
    age: 'Birth',
    timing: 'Within 24 hours of birth',
    description: 'Protects against hepatitis B virus which can cause chronic liver disease',
    cdcLink: 'https://www.cdc.gov/vaccines/hcp/vis/vis-statements/hep-b.html',
    importance: 'Hepatitis B can cause lifelong liver damage and liver cancer. The first dose at birth prevents transmission from mothers who may not know they are infected.',
    sideEffects: 'Mild soreness at injection site, low-grade fever. Serious reactions are very rare.',
    doses: '3 doses (birth, 1-2 months, 6-18 months)',
  },
  {
    id: 'rotavirus',
    name: 'Rotavirus',
    shortName: 'RV',
    age: '2 months',
    timing: 'Starting at 2 months (2-3 doses)',
    description: 'Protects against severe diarrhea, vomiting, and dehydration',
    cdcLink: 'https://www.cdc.gov/vaccines/hcp/vis/vis-statements/rotavirus.html',
    importance: 'Rotavirus is the leading cause of severe diarrhea in infants worldwide. The vaccine prevents hospitalization from severe dehydration.',
    sideEffects: 'Mild, temporary diarrhea or vomiting; irritability. Given by mouth (oral drops).',
    doses: '2-3 doses (by 8 months of age)',
  },
  {
    id: 'dtap',
    name: 'DTaP',
    shortName: 'DTaP',
    age: '2 months',
    timing: 'Starting at 2 months (5 doses)',
    description: 'Protects against diphtheria, tetanus, and pertussis (whooping cough)',
    cdcLink: 'https://www.cdc.gov/vaccines/hcp/vis/vis-statements/dtap.html',
    importance: 'Whooping cough (pertussis) can be life-threatening for babies. Diphtheria and tetanus are rare but can cause death. Boosters needed throughout childhood.',
    sideEffects: 'Soreness, redness, low-grade fever. Fussiness common for 1-2 days.',
    doses: '5 doses (2, 4, 6, 15-18 months, 4-6 years)',
  },
  {
    id: 'hib',
    name: 'Hib',
    shortName: 'Hib',
    age: '2 months',
    timing: 'Starting at 2 months (3-4 doses)',
    description: 'Protects against Haemophilus influenzae type b which can cause meningitis',
    cdcLink: 'https://www.cdc.gov/vaccines/hcp/vis/vis-statements/hib.html',
    importance: 'Before this vaccine, Hib was the leading cause of bacterial meningitis in children under 5. Can also cause pneumonia and severe throat infections.',
    sideEffects: 'Redness, swelling, warmth at injection site; mild fever.',
    doses: '3-4 doses (varies by brand; 2, 4, 6, 12-15 months)',
  },
  {
    id: 'pcv',
    name: 'PCV13',
    shortName: 'PCV',
    age: '2 months',
    timing: 'Starting at 2 months (4 doses)',
    description: 'Protects against pneumococcal disease which can cause pneumonia and meningitis',
    cdcLink: 'https://www.cdc.gov/vaccines/hcp/vis/vis-statements/pcv.html',
    importance: 'Pneumococcal disease is a leading cause of bacterial meningitis and bloodstream infections in infants. Also prevents many ear infections.',
    sideEffects: 'Drowsiness, loss of appetite, redness or swelling at injection site, mild fever.',
    doses: '4 doses (2, 4, 6, 12-15 months)',
  },
  {
    id: 'ipv',
    name: 'Polio (IPV)',
    shortName: 'IPV',
    age: '2 months',
    timing: 'Starting at 2 months (4 doses)',
    description: 'Protects against polio which can cause permanent paralysis',
    cdcLink: 'https://www.cdc.gov/vaccines/hcp/vis/vis-statements/ipv.html',
    importance: 'Polio paralyzed thousands of children annually before the vaccine. Still circulating in some countries; protection is essential.',
    sideEffects: 'Mild soreness at injection site. Serious reactions extremely rare.',
    doses: '4 doses (2, 4, 6-18 months, 4-6 years)',
  },
  {
    id: 'mmr',
    name: 'MMR',
    shortName: 'MMR',
    age: '12 months',
    timing: 'First dose at 12-15 months',
    description: 'Protects against measles, mumps, and rubella',
    cdcLink: 'https://www.cdc.gov/vaccines/hcp/vis/vis-statements/mmr.html',
    importance: 'Measles is highly contagious and can cause pneumonia, brain swelling, and death. Mumps and rubella cause serious complications including birth defects if contracted during pregnancy.',
    sideEffects: 'Fever, mild rash 7-12 days after vaccine; temporary joint pain (rare).',
    doses: '2 doses (12-15 months, 4-6 years)',
  },
  {
    id: 'varicella',
    name: 'Varicella',
    shortName: 'VAR',
    age: '12 months',
    timing: 'First dose at 12-15 months',
    description: 'Protects against chickenpox',
    cdcLink: 'https://www.cdc.gov/vaccines/hcp/vis/vis-statements/varicella.html',
    importance: 'Chickenpox can cause serious complications including bacterial skin infections, pneumonia, and brain inflammation. Adults who get it have more severe symptoms.',
    sideEffects: 'Soreness, mild rash, low-grade fever 1-3 weeks after vaccine.',
    doses: '2 doses (12-15 months, 4-6 years)',
  },
  {
    id: 'hepa',
    name: 'Hepatitis A',
    shortName: 'HepA',
    age: '12 months',
    timing: 'Starting at 12-23 months (2 doses)',
    description: 'Protects against hepatitis A virus which affects the liver',
    cdcLink: 'https://www.cdc.gov/vaccines/hcp/vis/vis-statements/hep-a.html',
    importance: 'Hepatitis A spreads through contaminated food/water and close contact. Vaccination has dramatically reduced infection rates in the U.S.',
    sideEffects: 'Soreness at injection site, headache, loss of appetite.',
    doses: '2 doses (12-23 months, then 6 months later)',
  },
];

export function VaccinationTracker(props: VaccinationTrackerProps) {
  const {
    onVaccinesChange,
    initialSelectedVaccines = [],
    mode,
    showBirthPlanMode,
    onCompletedChange,
  } = props;
  const resolvedMode: 'info' | 'birth-plan' = mode ?? (showBirthPlanMode ? 'birth-plan' : 'info');
  const isCompletedControlled = props.completedVaccineIds !== undefined;
  const [activeMode, setActiveMode] = useState<'info' | 'birth-plan'>(resolvedMode);
  const [internalCompleted, setInternalCompleted] = useState<string[]>([]);
  const completedVaccines = isCompletedControlled ? props.completedVaccineIds! : internalCompleted;
  const [selectedVaccines, setSelectedVaccines] = useState<BirthPlanVaccine[]>(initialSelectedVaccines);
  const [detailVaccine, setDetailVaccine] = useState<Vaccine | null>(null);

  // Sync with parent component
  useEffect(() => {
    if (onVaccinesChange) {
      onVaccinesChange(selectedVaccines);
    }
  }, [selectedVaccines, onVaccinesChange]);

  // Update if initialSelectedVaccines changes (deep comparison to avoid infinite loop)
  useEffect(() => {
    const currentIds = selectedVaccines.map(v => v.id).sort().join(',');
    const newIds = initialSelectedVaccines.map(v => v.id).sort().join(',');
    if (currentIds !== newIds) {
      setSelectedVaccines(initialSelectedVaccines);
    }
  }, [initialSelectedVaccines]);

  const toggleVaccine = (vaccineId: string) => {
    const next = completedVaccines.includes(vaccineId)
      ? completedVaccines.filter(id => id !== vaccineId)
      : [...completedVaccines, vaccineId];
    if (!isCompletedControlled) {
      setInternalCompleted(next);
    }
    onCompletedChange?.(next);
  };

  const isVaccineSelected = (vaccineId: string) => {
    return selectedVaccines.some(v => v.id === vaccineId);
  };

  const toggleBirthPlanVaccine = (vaccine: Vaccine) => {
    setSelectedVaccines(prev => {
      const exists = prev.find(v => v.id === vaccine.id);
      if (exists) {
        return prev.filter(v => v.id !== vaccine.id);
      } else {
        return [...prev, {
          id: vaccine.id,
          name: vaccine.name,
          timing: vaccine.timing,
          description: vaccine.description,
          preference: 'standard',
          discussWithDoctor: false,
          notes: ''
        }];
      }
    });
  };

  const updateVaccinePreference = (vaccineId: string, preference: VaccinePreference) => {
    setSelectedVaccines(prev => 
      prev.map(v => v.id === vaccineId ? { ...v, preference } : v)
    );
  };

  const toggleDiscussWithDoctor = (vaccineId: string) => {
    setSelectedVaccines(prev => 
      prev.map(v => v.id === vaccineId ? { ...v, discussWithDoctor: !v.discussWithDoctor } : v)
    );
  };

  const updateVaccineNotes = (vaccineId: string, notes: string) => {
    setSelectedVaccines(prev => 
      prev.map(v => v.id === vaccineId ? { ...v, notes } : v)
    );
  };

  const completedCount = completedVaccines.length;
  const totalCount = VACCINES.length;
  const progress = Math.round((completedCount / totalCount) * 100);
  const selectedCount = selectedVaccines.length;

  const preferenceColors: Record<VaccinePreference, string> = {
    standard: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    delay: 'bg-amber-50 border-amber-200 text-amber-700',
    decline: 'bg-rose-50 border-rose-200 text-rose-700'
  };

  const preferenceLabels: Record<VaccinePreference, string> = {
    standard: 'Standard Schedule',
    delay: 'Delayed',
    decline: 'Declined'
  };

  return (
    <Card className="border-warm-100 shadow-soft">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <Syringe className="w-5 h-5 text-primary-500" />
              Vaccination Information
            </CardTitle>
            <p className="text-sm text-warm-600 mt-1">
              {activeMode === 'birth-plan' 
                ? 'Select vaccines to include in your birth plan'
                : 'Comprehensive vaccination details for informed decision-making'
              }
            </p>
          </div>
          {activeMode === 'info' && (
            <div className="text-right">
              <div className="text-2xl font-bold text-primary-600">
                {completedCount}/{totalCount}
              </div>
              <div className="text-xs text-warm-600">Tracked</div>
            </div>
          )}
        </div>
        
        {/* Mode Switch - Always visible */}
        <div className="mt-4">
          <div className="flex gap-2 p-1 bg-warm-100 rounded-lg">
            <Button
              variant={activeMode === 'info' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setActiveMode('info')}
              className="flex-1 gap-2"
            >
              <Info className="w-4 h-4" />
              Info Mode
            </Button>
            <Button
              variant={activeMode === 'birth-plan' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setActiveMode('birth-plan')}
              className="flex-1 gap-2"
            >
              <Stethoscope className="w-4 h-4" />
              Birth Plan Mode
            </Button>
          </div>
          
          {activeMode === 'birth-plan' && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-blue-700">
                <Check className="w-4 h-4" />
                <span><strong>{selectedCount}</strong> vaccine(s) selected for birth plan</span>
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Info Mode Content */}
        {activeMode === 'info' && (
          <>
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-warm-600">Your tracking progress</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <div className="h-2 bg-warm-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Info Mode Vaccine List */}
            <div className="space-y-3">
              {VACCINES.map((vaccine) => (
                <div
                  key={vaccine.id}
                  className={cn(
                    "p-4 rounded-xl border transition-all cursor-pointer",
                    completedVaccines.includes(vaccine.id)
                      ? "bg-primary-50 border-primary-200"
                      : "bg-white border-warm-100 hover:border-warm-200"
                  )}
                  onClick={() => setDetailVaccine(vaccine)}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={completedVaccines.includes(vaccine.id)}
                      onCheckedChange={() => toggleVaccine(vaccine.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-warm-900">{vaccine.name}</h3>
                          <Info className="w-3.5 h-3.5 text-primary-500" />
                        </div>
                        <Badge variant="secondary">{vaccine.age}</Badge>
                      </div>
                      <p className="text-sm text-warm-500 mt-1">{vaccine.timing}</p>
                      <p className="text-sm text-warm-600 mt-2">{vaccine.description}</p>
                      <div className="flex items-center gap-3 mt-3">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setDetailVaccine(vaccine); }}
                          className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium"
                        >
                          <Info className="w-3 h-3" />
                          View details
                        </button>
                        <a
                          href={vaccine.cdcLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <BookOpen className="w-3 h-3" />
                          CDC Information
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Birth Plan Mode Content */}
        {activeMode === 'birth-plan' && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h4 className="font-semibold text-blue-900 flex items-center gap-2">
                <Stethoscope className="w-5 h-5" />
                Select Vaccines for Birth Plan
              </h4>
              <p className="text-sm text-blue-700 mt-1">
                Choose which vaccines to discuss with your pediatrician and include in your birth plan.
              </p>
            </div>

            {VACCINES.map((vaccine) => {
              const isSelected = isVaccineSelected(vaccine.id);
              const vaccineData = selectedVaccines.find(v => v.id === vaccine.id);
              
              return (
                <div
                  key={vaccine.id}
                  className={cn(
                    "rounded-xl border transition-all overflow-hidden",
                    isSelected
                      ? "bg-blue-50 border-blue-200"
                      : "bg-white border-warm-100"
                  )}
                >
                  {/* Vaccine Header - Always visible */}
                  <div 
                    className="p-4 cursor-pointer flex items-start gap-3"
                    onClick={() => toggleBirthPlanVaccine(vaccine)}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleBirthPlanVaccine(vaccine)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-warm-900">{vaccine.name}</h3>
                        <Badge variant="secondary">{vaccine.age}</Badge>
                      </div>
                      <p className="text-sm text-warm-600 mt-1">{vaccine.description}</p>
                    </div>
                    {isSelected && vaccineData && (
                      <Badge className={cn("shrink-0", preferenceColors[vaccineData.preference])}>
                        {preferenceLabels[vaccineData.preference]}
                      </Badge>
                    )}
                  </div>
                  
                  {/* Expanded Options - Only when selected */}
                  {isSelected && vaccineData && (
                    <div className="px-4 pb-4 pt-0 border-t border-blue-100">
                      <div className="mt-4 space-y-4">
                        {/* Preference Radio Buttons */}
                        <div>
                          <Label className="text-sm font-medium text-warm-700 mb-2 block">
                            Vaccination Preference
                          </Label>
                          <RadioGroup
                            value={vaccineData.preference}
                            onValueChange={(value) => updateVaccinePreference(vaccine.id, value as VaccinePreference)}
                            className="flex flex-wrap gap-4"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="standard" id={`${vaccine.id}-standard`} />
                              <Label htmlFor={`${vaccine.id}-standard`} className="text-sm cursor-pointer">
                                Standard Schedule
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="delay" id={`${vaccine.id}-delay`} />
                              <Label htmlFor={`${vaccine.id}-delay`} className="text-sm cursor-pointer">
                                Delay
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="decline" id={`${vaccine.id}-decline`} />
                              <Label htmlFor={`${vaccine.id}-decline`} className="text-sm cursor-pointer">
                                Decline
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>
                        
                        {/* Discuss with Pediatrician */}
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={vaccineData.discussWithDoctor}
                            onCheckedChange={() => toggleDiscussWithDoctor(vaccine.id)}
                            id={`${vaccine.id}-discuss`}
                          />
                          <Label 
                            htmlFor={`${vaccine.id}-discuss`}
                            className="text-sm cursor-pointer text-warm-700"
                          >
                            Discuss with pediatrician
                          </Label>
                        </div>
                        
                        {/* Notes Field */}
                        <div>
                          <Label 
                            htmlFor={`${vaccine.id}-notes`}
                            className="text-sm font-medium text-warm-700 mb-1 block"
                          >
                            Notes
                          </Label>
                          <Textarea
                            id={`${vaccine.id}-notes`}
                            value={vaccineData.notes}
                            onChange={(e) => updateVaccineNotes(vaccine.id, e.target.value)}
                            placeholder="Add any questions or concerns about this vaccine..."
                            className="min-h-[60px] resize-y"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            
            {selectedVaccines.length === 0 && (
              <div className="text-center py-8 text-warm-500">
                <Stethoscope className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No vaccines selected yet.</p>
                <p className="text-sm">Check the vaccines you want to include in your birth plan.</p>
              </div>
            )}
          </div>
        )}

        {/* Detail Modal */}
        <Dialog open={!!detailVaccine} onOpenChange={(open) => !open && setDetailVaccine(null)}>
          <DialogContent className="sm:max-w-lg">
            {detailVaccine && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Syringe className="w-5 h-5 text-primary-500" />
                    {detailVaccine.name}
                  </DialogTitle>
                  <DialogDescription>
                    {detailVaccine.timing}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2 text-sm">
                  <div>
                    <h4 className="font-semibold text-warm-800 mb-1">What it protects against</h4>
                    <p className="text-warm-600">{detailVaccine.description}</p>
                  </div>
                  {detailVaccine.importance && (
                    <div>
                      <h4 className="font-semibold text-warm-800 mb-1">Why it matters</h4>
                      <p className="text-warm-600">{detailVaccine.importance}</p>
                    </div>
                  )}
                  {detailVaccine.doses && (
                    <div>
                      <h4 className="font-semibold text-warm-800 mb-1">Schedule</h4>
                      <p className="text-warm-600">{detailVaccine.doses}</p>
                    </div>
                  )}
                  {detailVaccine.sideEffects && (
                    <div>
                      <h4 className="font-semibold text-warm-800 mb-1">Common side effects</h4>
                      <p className="text-warm-600">{detailVaccine.sideEffects}</p>
                    </div>
                  )}
                  <div className="pt-2 border-t border-warm-100">
                    <a
                      href={detailVaccine.cdcLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
                    >
                      <BookOpen className="w-4 h-4" />
                      Read official CDC information
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setDetailVaccine(null)}
                  >
                    Close
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => {
                      toggleVaccine(detailVaccine.id);
                    }}
                  >
                    {completedVaccines.includes(detailVaccine.id) ? (
                      <>Mark as untracked</>
                    ) : (
                      <><CheckCircle2 className="w-4 h-4 mr-2" />Mark as tracked</>
                    )}
                  </Button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Disclaimer */}
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-amber-900">Important</h4>
              <p className="text-sm text-amber-800 mt-1">
                This information is for educational purposes only. Always consult with your pediatrician 
                to determine the best vaccination schedule for your child based on their health history and circumstances.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
