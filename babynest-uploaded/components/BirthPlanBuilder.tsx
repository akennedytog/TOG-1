'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Printer,
  Heart,
  Stethoscope,
  Users,
  Baby,
  Shield,
  AlertCircle,
  Plus,
  Trash2,
  Syringe,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { VaccinationTracker, BirthPlanVaccine } from './VaccinationTracker';
import {
  getBirthPlan,
  upsertBirthPlan,
} from '@/lib/supabase';

interface BirthPlanSection {
  id: string;
  title: string;
  icon: React.ElementType;
  items: {
    id: string;
    label: string;
    checked: boolean;
    category: string;
    isCustom?: boolean;
  }[];
}

const defaultSections: BirthPlanSection[] = [
  {
    id: 'labor',
    title: 'During Labor',
    icon: Heart,
    items: [
      { id: 'l1', label: 'Freedom to move around and change positions', checked: false, category: 'movement' },
      { id: 'l2', label: 'Intermittent monitoring (not continuous)', checked: false, category: 'monitoring' },
      { id: 'l3', label: 'Access to birthing ball, tub, shower', checked: false, category: 'comfort' },
      { id: 'l4', label: 'Dimmed lights and quiet environment', checked: false, category: 'environment' },
      { id: 'l5', label: 'Ability to eat and drink during labor', checked: false, category: 'food' },
      { id: 'l6', label: 'No routine IV - hep lock preferred', checked: false, category: 'medical' },
    ]
  },
  {
    id: 'pain',
    title: 'Pain Management',
    icon: Shield,
    items: [
      { id: 'p1', label: 'Natural pain management techniques first', checked: false, category: 'natural' },
      { id: 'p2', label: 'Epidural if requested', checked: false, category: 'medication' },
      { id: 'p3', label: 'No pain medication unless requested', checked: false, category: 'preference' },
      { id: 'p4', label: 'Access to nitrous oxide (laughing gas)', checked: false, category: 'medication' },
    ]
  },
  {
    id: 'delivery',
    title: 'Delivery Preferences',
    icon: Baby,
    items: [
      { id: 'd1', label: 'Freedom to choose pushing position', checked: false, category: 'position' },
      { id: 'd2', label: 'No routine episiotomy', checked: false, category: 'procedures' },
      { id: 'd3', label: 'Delayed cord clamping (1-3 minutes)', checked: false, category: 'cord' },
      { id: 'd4', label: 'Partner wants to catch baby', checked: false, category: 'partner' },
      { id: 'd5', label: 'Immediate skin-to-skin contact', checked: false, category: 'bonding' },
      { id: 'd6', label: 'Wait for natural delivery of placenta', checked: false, category: 'placenta' },
    ]
  },
  {
    id: 'baby',
    title: 'After Birth - Baby',
    icon: Stethoscope,
    items: [
      { id: 'b1', label: 'Delay routine procedures for 1 hour', checked: false, category: 'procedures' },
      { id: 'b2', label: 'Breastfeeding within first hour', checked: false, category: 'feeding' },
      { id: 'b3', label: 'No pacifier or formula unless medically necessary', checked: false, category: 'feeding' },
      { id: 'b4', label: 'Baby room-in (stay with parent)', checked: false, category: 'care' },
      { id: 'b5', label: 'No circumcision (if applicable)', checked: false, category: 'procedures' },
      { id: 'b6', label: 'Vitamin K shot and eye ointment', checked: false, category: 'procedures' },
      { id: 'b7', label: 'Hepatitis B vaccine', checked: false, category: 'vaccines' },
    ]
  },
  {
    id: 'emergency',
    title: 'Emergency/C-Section',
    icon: AlertCircle,
    items: [
      { id: 'e1', label: 'Partner present for C-section', checked: false, category: 'support' },
      { id: 'e2', label: 'Screen lowered to see birth', checked: false, category: 'experience' },
      { id: 'e3', label: 'Skin-to-skin in OR if possible', checked: false, category: 'bonding' },
      { id: 'e4', label: 'Delayed cord clamping if possible', checked: false, category: 'cord' },
    ]
  },
  {
    id: 'visitors',
    title: 'Visitors & Postpartum',
    icon: Users,
    items: [
      { id: 'v1', label: 'No visitors until we are ready', checked: false, category: 'privacy' },
      { id: 'v2', label: 'Limit visitors to immediate family', checked: false, category: 'privacy' },
      { id: 'v3', label: 'No photos without permission', checked: false, category: 'privacy' },
      { id: 'v4', label: 'Quiet time for rest', checked: false, category: 'rest' },
    ]
  }
];

interface BirthPlanBuilderProps {
  userId?: string | null;
  /** Vaccines marked "tracked/received" in the Vaccinations tab. Linked items in birth plan will auto-check. */
  completedVaccineIds?: string[];
  onCompletedVaccinesChange?: (ids: string[]) => void;
}

// Map of birth plan item id -> vaccine id. When the vaccine is checked in the Vaccinations
// tab, the matching birth plan item is automatically checked here.
const BIRTH_PLAN_ITEM_TO_VACCINE: Record<string, string> = {
  b7: 'hepb', // "Hepatitis B vaccine" item links to HepB vaccine
};

export function BirthPlanBuilder({ userId, completedVaccineIds, onCompletedVaccinesChange }: BirthPlanBuilderProps = {}) {
  const [sections, setSections] = useState(defaultSections);
  const [notes, setNotes] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [showAddForm, setShowAddForm] = useState<string | null>(null);
  const [newItemLabel, setNewItemLabel] = useState('');
  const [birthPlanVaccines, setBirthPlanVaccines] = useState<BirthPlanVaccine[]>([]);
  const [showVaccineSelector, setShowVaccineSelector] = useState(false);
  const [loading, setLoading] = useState(!!userId);
  const [saving, setSaving] = useState(false);
  const isMounted = useRef(false);
  const saveTimer = useRef<NodeJS.Timeout | null>(null);

  // Load birth plan from Supabase
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const plan = await getBirthPlan(userId);
        if (cancelled) return;
        if (plan) {
          if (Array.isArray(plan.sections) && plan.sections.length > 0) {
            // Merge persisted sections with defaults so newly-added defaults aren't lost
            const merged = defaultSections.map(defSection => {
              const saved = plan.sections.find((s: any) => s.id === defSection.id);
              if (!saved) return defSection;
              // Re-attach icon component (icons aren't serialized)
              return {
                ...defSection,
                items: saved.items?.length ? saved.items : defSection.items,
              };
            });
            setSections(merged);
          }
          if (typeof plan.notes === 'string') setNotes(plan.notes);
          if (Array.isArray(plan.vaccines)) setBirthPlanVaccines(plan.vaccines);
        }
      } catch (err) {
        console.error('Failed to load birth plan:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [userId]);

  // Auto-save (debounced) when state changes
  useEffect(() => {
    if (!userId || loading) return;
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSaving(true);
      try {
        // Strip non-serializable icon refs before persisting
        const serializableSections = sections.map(s => ({
          id: s.id,
          title: s.title,
          items: s.items,
        }));
        await upsertBirthPlan(userId, {
          sections: serializableSections,
          notes,
          vaccines: birthPlanVaccines,
        });
      } catch (err) {
        console.error('Failed to save birth plan:', err);
      } finally {
        setSaving(false);
      }
    }, 800);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [userId, loading, sections, notes, birthPlanVaccines]);

  // Sync completed vaccines from Vaccinations tab -> birth plan items
  useEffect(() => {
    if (!completedVaccineIds) return;
    setSections(prev => prev.map(section => ({
      ...section,
      items: section.items.map(item => {
        const linkedVaccine = BIRTH_PLAN_ITEM_TO_VACCINE[item.id];
        if (!linkedVaccine) return item;
        const shouldCheck = completedVaccineIds.includes(linkedVaccine);
        return item.checked === shouldCheck ? item : { ...item, checked: shouldCheck };
      }),
    })));
  }, [completedVaccineIds]);

  const handleVaccinesChange = (vaccines: BirthPlanVaccine[]) => {
    setBirthPlanVaccines(vaccines);
  };

  const toggleItem = (sectionId: string, itemId: string) => {
    let newCheckedValue = false;
    setSections(sections.map(section => 
      section.id === sectionId 
        ? {
            ...section,
            items: section.items.map(item => {
              if (item.id !== itemId) return item;
              newCheckedValue = !item.checked;
              return { ...item, checked: newCheckedValue };
            })
          }
        : section
    ));

    // If this birth-plan item is linked to a vaccine, propagate up to Vaccinations tab
    const linkedVaccine = BIRTH_PLAN_ITEM_TO_VACCINE[itemId];
    if (linkedVaccine && onCompletedVaccinesChange && completedVaccineIds) {
      const isCurrentlyChecked = completedVaccineIds.includes(linkedVaccine);
      if (newCheckedValue && !isCurrentlyChecked) {
        onCompletedVaccinesChange([...completedVaccineIds, linkedVaccine]);
      } else if (!newCheckedValue && isCurrentlyChecked) {
        onCompletedVaccinesChange(completedVaccineIds.filter(id => id !== linkedVaccine));
      }
    }
  };

  const addCustomItem = (sectionId: string) => {
    if (!newItemLabel.trim()) return;
    
    setSections(sections.map(section => 
      section.id === sectionId 
        ? {
            ...section,
            items: [
              ...section.items,
              {
                id: `custom-${Date.now()}`,
                label: newItemLabel.trim(),
                checked: false,
                category: 'custom',
                isCustom: true
              }
            ]
          }
        : section
    ));
    
    setNewItemLabel('');
    setShowAddForm(null);
  };

  const deleteCustomItem = (sectionId: string, itemId: string) => {
    setSections(sections.map(section => 
      section.id === sectionId 
        ? {
            ...section,
            items: section.items.filter(item => item.id !== itemId)
          }
        : section
    ));
  };

  const getCheckedCount = () => {
    return sections.reduce((total, section) => 
      total + section.items.filter(item => item.checked).length, 0
    );
  };

  const getTotalCount = () => {
    return sections.reduce((total, section) => total + section.items.length, 0);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Card className="print:shadow-none">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-100">
        <CardTitle className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-xl flex items-center justify-center shadow-soft">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-warm-900">Birth Plan Builder</div>
            <div className="text-xs font-normal text-warm-500">Document your preferences</div>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6">
        {!showPreview ? (
          <>
            {/* Progress */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-warm-700">Preferences Selected</span>
                <span className="text-sm font-semibold text-purple-600">
                  {getCheckedCount()}/{getTotalCount()}
                </span>
              </div>
              <div className="h-2 bg-warm-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-400 to-indigo-500 rounded-full transition-all duration-300"
                  style={{ width: `${(getCheckedCount() / getTotalCount()) * 100}%` }}
                />
              </div>
            </div>

            {/* Sections */}
            <div className="space-y-6">
              {sections.map(section => (
                <div key={section.id} className="border border-warm-100 rounded-xl overflow-hidden">
                  <div className="px-4 py-3 bg-warm-50 flex items-center gap-3">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-soft">
                      <section.icon className="w-4 h-4 text-purple-500" />
                    </div>
                    <span className="font-medium text-warm-900">{section.title}</span>
                    
                    <Badge variant="secondary" className="ml-auto text-xs">
                      {section.items.filter(i => i.checked).length}/{section.items.length}
                    </Badge>
                  </div>
                  
                  <div className="p-4 space-y-3">
                    {section.items.map(item => (
                      <div key={item.id} className="flex items-start gap-3 group">
                        <Checkbox
                          id={item.id}
                          checked={item.checked}
                          onCheckedChange={() => toggleItem(section.id, item.id)}
                          className="mt-0.5"
                        />
                        <label 
                          htmlFor={item.id}
                          className={`flex-1 text-sm cursor-pointer ${
                            item.checked ? 'text-warm-600' : 'text-warm-800'
                          }`}
                        >
                          {item.label}
                        </label>
                        
                        {item.isCustom && (
                          <button
                            onClick={() => deleteCustomItem(section.id, item.id)}
                            className="opacity-0 group-hover:opacity-100 text-warm-400 hover:text-red-500 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    
                    {/* Add Custom Item */}
                    <div className="pt-2 border-t border-warm-100">
                      {showAddForm === section.id ? (
                        <div className="flex gap-2">
                          <Input
                            value={newItemLabel}
                            onChange={(e) => setNewItemLabel(e.target.value)}
                            placeholder="Add your own preference..."
                            className="flex-1 text-sm"
                            onKeyDown={(e) => e.key === 'Enter' && addCustomItem(section.id)}
                            autoFocus
                          />
                          <Button 
                            size="sm" 
                            onClick={() => addCustomItem(section.id)}
                            className="bg-purple-500 hover:bg-purple-600"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => { setShowAddForm(null); setNewItemLabel(''); }}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowAddForm(section.id)}
                          className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 font-medium"
                        >
                          <Plus className="w-4 h-4" />
                          Add your own
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Vaccines Section */}
            <div className="border border-warm-100 rounded-xl overflow-hidden">
              <div className="px-4 py-3 bg-warm-50 flex items-center gap-3">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-soft">
                  <Syringe className="w-4 h-4 text-purple-500" />
                </div>
                <span className="font-medium text-warm-900">Vaccines</span>
                
                <Badge variant="secondary" className="ml-auto text-xs">
                  {birthPlanVaccines.length} selected
                </Badge>
              </div>
              <div className="p-4">
                <VaccinationTracker 
                  mode="birth-plan"
                  initialSelectedVaccines={birthPlanVaccines}
                  onVaccinesChange={handleVaccinesChange}
                />
              </div>
            </div>

            {/* Additional Notes */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-warm-700 mb-2">
                Additional Notes
              </label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any special requests, medical history, or other preferences..."
                className="min-h-[100px]"
              />
            </div>

            {/* Actions */}
            <div className="mt-6 flex flex-wrap gap-3 items-center">
              <Button
                onClick={() => setShowPreview(true)}
                className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white"
              >
                Preview & Print
              </Button>
              
              <Button variant="outline" onClick={handlePrint}>
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
              {userId && (
                <span className="text-xs text-warm-500 ml-auto">
                  {saving ? 'Saving…' : 'Saved'}
                </span>
              )}
            </div>

            {/* Disclaimer */}
            <div className="mt-6 p-4 bg-amber-50 border border-amber-100 rounded-xl">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-amber-900 mb-1">Important Note</h4>
                  <p className="text-sm text-amber-800">
                    A birth plan is a guide, not a guarantee. Labor and delivery can be unpredictable. 
                    The health and safety of you and your baby are the top priority. Discuss your 
                    preferences with your healthcare provider before labor begins.
                  </p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Preview Mode */}
            <div className="print:block">
              <div className="text-center mb-8 border-b-2 border-purple-200 pb-6">
                <h2 className="text-3xl font-bold text-warm-900 mb-2">My Birth Plan</h2>
                <p className="text-warm-600">Prepared for my healthcare team</p>
              </div>
              
              <div className="space-y-6">
                {sections.map(section => {
                  const checkedItems = section.items.filter(i => i.checked);
                  if (checkedItems.length === 0) return null;
                  
                  return (
                    <div key={section.id} className="break-inside-avoid">
                      <h3 className="font-bold text-warm-900 mb-3 flex items-center gap-2">
                        <section.icon className="w-5 h-5 text-purple-500" />
                        {section.title}
                      </h3>
                      
                      <ul className="space-y-2 ml-7">
                        {checkedItems.map(item => (
                          <li key={item.id} className="text-warm-700">
                            ✓ {item.label}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
                
                {notes && (
                  <div className="break-inside-avoid mt-8 pt-6 border-t border-warm-200">
                    <h3 className="font-bold text-warm-900 mb-3">Additional Notes</h3>
                    <p className="text-warm-700 whitespace-pre-wrap">{notes}</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-8 flex gap-3 print:hidden">
              <Button
                onClick={() => setShowPreview(false)}
                variant="outline"
              >
                Back to Edit
              </Button>
              
              <Button
                onClick={handlePrint}
                className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white"
              >
                <Printer className="w-4 h-4 mr-2" />
                Print Birth Plan
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
