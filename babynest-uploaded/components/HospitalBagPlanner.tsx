'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Backpack, 
  Shirt, 
  Baby, 
  Heart, 
  Smartphone, 
  Sparkles,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  getHospitalBagItems,
  upsertHospitalBagItem,
  deleteHospitalBagItem,
  type HospitalBagItem,
} from '@/lib/supabase';

interface BagItem {
  id: string;
  name: string;
  category: 'mom' | 'baby' | 'partner' | 'tech' | 'comfort' | 'documents';
  essential: boolean;
  checked: boolean;
  description?: string;
  isCustom?: boolean;
}

const defaultItems: BagItem[] = [
  // Mom Essentials
  { id: 'mom-1', name: 'Photo ID & Insurance Cards', category: 'documents', essential: true, checked: false, description: 'Driver license, insurance card, hospital paperwork' },
  { id: 'mom-2', name: 'Birth Plan Copies', category: 'documents', essential: true, checked: false, description: 'Multiple copies for nurses and doctors' },
  { id: 'mom-3', name: 'Robe or Cardigan', category: 'mom', essential: true, checked: false, description: 'Hospitals are cold! Dark colors hide stains' },
  { id: 'mom-4', name: 'Nursing Bras', category: 'mom', essential: true, checked: false, description: '2-3 comfortable ones, size up if possible' },
  { id: 'mom-5', name: 'Nipple Cream', category: 'mom', essential: true, checked: false, description: 'Lanolin cream for early nursing' },
  { id: 'mom-6', name: 'Pads & Underwear', category: 'mom', essential: true, checked: false, description: 'Heavy flow pads, disposable underwear' },
  { id: 'mom-7', name: 'Going Home Outfit', category: 'mom', essential: true, checked: false, description: 'Comfortable clothes, maternity size or stretchy' },
  { id: 'mom-8', name: 'Toiletries', category: 'mom', essential: true, checked: false, description: 'Toothbrush, toothpaste, hair ties, lip balm, face wipes' },
  { id: 'mom-9', name: 'Glasses/Contacts', category: 'mom', essential: true, checked: false, description: 'Don\'t forget contact solution and case' },
  { id: 'mom-10', name: 'Slippers & Socks', category: 'mom', essential: true, checked: false, description: 'Non-slip grip socks, comfy slippers' },
  
  // Baby Essentials
  { id: 'baby-1', name: 'Coming Home Outfit', category: 'baby', essential: true, checked: false, description: 'Weather appropriate, size newborn or 0-3 months' },
  { id: 'baby-2', name: 'Socks & Mittens', category: 'baby', essential: true, checked: false, description: 'Scratch mittens, warm socks' },
  { id: 'baby-3', name: 'Swaddle Blankets', category: 'baby', essential: true, checked: false, description: '2-3 lightweight, stretchy swaddles' },
  { id: 'baby-4', name: 'Car Seat', category: 'baby', essential: true, checked: false, description: 'Installed correctly, cannot leave hospital without!' },
  { id: 'baby-5', name: 'Pacifiers', category: 'baby', essential: false, checked: false, description: 'If you plan to use them' },
  { id: 'baby-6', name: 'Hat', category: 'baby', essential: true, checked: false, description: 'For warmth, hospitals are cold' },
  
  // Partner Essentials
  { id: 'partner-1', name: 'Change of Clothes', category: 'partner', essential: true, checked: false, description: '2-3 days worth, hospital might provide cot' },
  { id: 'partner-2', name: 'Toiletries', category: 'partner', essential: true, checked: false, description: 'Toothbrush, deodorant, etc.' },
  { id: 'partner-3', name: 'Snacks & Drinks', category: 'partner', essential: true, checked: false, description: 'Hospital food is expensive, vending machines limited' },
  { id: 'partner-4', name: 'Cash', category: 'partner', essential: true, checked: false, description: 'For vending machines, parking, tips' },
  
  // Tech
  { id: 'tech-1', name: 'Phone + Long Charger', category: 'tech', essential: true, checked: false, description: 'Extra long charging cable, outlets are far' },
  { id: 'tech-2', name: 'Camera or GoPro', category: 'tech', essential: false, checked: false, description: 'For those first moments, phone works too' },
  { id: 'tech-3', name: 'Portable Speaker', category: 'tech', essential: false, checked: false, description: 'For labor playlist' },
  { id: 'tech-4', name: 'Laptop/Tablet', category: 'tech', essential: false, checked: false, description: 'For entertainment during long labor' },
  
  // Comfort
  { id: 'comfort-1', name: 'Pillow', category: 'comfort', essential: false, checked: false, description: 'Hospital pillows are flat, bring your own' },
  { id: 'comfort-2', name: 'Blanket', category: 'comfort', essential: false, checked: false, description: 'Dark colored to hide stains' },
  { id: 'comfort-3', name: 'Labor Playlist', category: 'comfort', essential: false, checked: false, description: 'Downloaded, not streaming (hospital WiFi!)' },
  { id: 'comfort-4', name: 'Massage Tools', category: 'comfort', essential: false, checked: false, description: 'Tennis balls, massage roller' },
  { id: 'comfort-5', name: 'Essential Oils', category: 'comfort', essential: false, checked: false, description: 'Lavender for relaxation, peppermint for nausea' },
  
  // Nice to Have
  { id: 'extra-1', name: 'Thank You Cards', category: 'documents', essential: false, checked: false, description: 'For nurses, doctors who go above and beyond' },
  { id: 'extra-2', name: 'Notebook & Pen', category: 'documents', essential: false, checked: false, description: 'Track feeding times, notes for pediatrician' },
  { id: 'extra-3', name: 'Nursing Pillow', category: 'mom', essential: false, checked: false, description: 'Boppy or similar for breastfeeding support' },
];

const categoryIcons = {
  mom: Shirt,
  baby: Baby,
  partner: Heart,
  tech: Smartphone,
  comfort: Sparkles,
  documents: Backpack,
};

const categoryLabels = {
  mom: 'For Mom',
  baby: 'For Baby',
  partner: 'For Partner',
  tech: 'Tech & Electronics',
  comfort: 'Comfort Items',
  documents: 'Important Documents',
};

interface HospitalBagPlannerProps {
  userId?: string | null;
}

export function HospitalBagPlanner({ userId }: HospitalBagPlannerProps = {}) {
  const [items, setItems] = useState<BagItem[]>(defaultItems);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['documents', 'mom']);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<BagItem['category']>('mom');
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(!!userId);
  const initialized = useRef(false);

  // Load from Supabase + seed defaults if needed
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const dbItems = await getHospitalBagItems(userId);
        if (cancelled) return;
        if (dbItems.length === 0) {
          // Seed defaults
          await Promise.all(
            defaultItems.map(item =>
              upsertHospitalBagItem(userId, {
                item_key: item.id,
                name: item.name,
                category: item.category,
                essential: item.essential,
                checked: item.checked,
                is_custom: !!item.isCustom,
                description: item.description ?? null,
              })
            )
          );
          setItems(defaultItems);
        } else {
          // Merge: keep any new default items the user doesn't have yet
          const dbKeys = new Set(dbItems.map(i => i.item_key));
          const mappedDbItems: BagItem[] = dbItems.map(i => ({
            id: i.item_key,
            name: i.name,
            category: i.category as BagItem['category'],
            essential: i.essential,
            checked: i.packed ?? i.checked ?? false,
            description: i.description ?? undefined,
            isCustom: i.is_custom,
          }));
          const missingDefaults = defaultItems.filter(d => !dbKeys.has(d.id));
          // Seed missing defaults
          await Promise.all(
            missingDefaults.map(item =>
              upsertHospitalBagItem(userId, {
                item_key: item.id,
                name: item.name,
                category: item.category,
                essential: item.essential,
                checked: item.checked,
                is_custom: !!item.isCustom,
                description: item.description ?? null,
              })
            )
          );
          setItems([...mappedDbItems, ...missingDefaults]);
        }
      } catch (err) {
        console.error('Failed to load hospital bag items:', err);
      } finally {
        if (!cancelled) {
          setLoading(false);
          initialized.current = true;
        }
      }
    })();
    return () => { cancelled = true; };
  }, [userId]);

  // Persist a single item update
  const persistItem = (item: BagItem) => {
    if (!userId) return;
    upsertHospitalBagItem(userId, {
      item_key: item.id,
      name: item.name,
      category: item.category,
      essential: item.essential,
      checked: item.checked,
      packed: item.checked,
      is_custom: !!item.isCustom,
      description: item.description ?? null,
    }).catch(err => console.error('Failed to save bag item:', err));
  };

  const toggleItem = (id: string) => {
    const next = items.map(item =>
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    setItems(next);
    const updated = next.find(i => i.id === id);
    if (updated) persistItem(updated);
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const addCustomItem = () => {
    if (!newItemName.trim()) return;
    
    const newItem: BagItem = {
      id: `custom-${Date.now()}`,
      name: newItemName.trim(),
      category: newItemCategory,
      essential: false,
      checked: false,
      isCustom: true,
    };
    
    setItems([...items, newItem]);
    persistItem(newItem);
    setNewItemName('');
    setShowAddForm(false);
    
    // Auto-expand the category
    if (!expandedCategories.includes(newItemCategory)) {
      setExpandedCategories(prev => [...prev, newItemCategory]);
    }
  };

  const deleteCustomItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
    if (userId) {
      deleteHospitalBagItem(userId, id).catch(err =>
        console.error('Failed to delete bag item:', err)
      );
    }
  };

  const categories = Array.from(new Set(items.map(item => item.category)));
  
  const totalEssential = items.filter(i => i.essential).length;
  const checkedEssential = items.filter(i => i.essential && i.checked).length;
  const totalPacked = items.filter(i => i.checked).length;
  const totalItems = items.length;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50 border-b border-pink-100">
        <CardTitle className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-500 rounded-xl flex items-center justify-center shadow-soft">
            <Backpack className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-warm-900">Hospital Bag Planner</div>
            <div className="text-xs font-normal text-warm-500">Interactive packing checklist</div>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6">
        {loading && (
          <div className="flex items-center justify-center py-8 text-warm-500">
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Loading your packing list…
          </div>
        )}
        {!loading && (
        <>
        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-warm-700">
              Essential Items
            </span>
            <span className="text-sm font-semibold text-pink-600">
              {checkedEssential}/{totalEssential}
            </span>
          </div>
          <div className="h-2 bg-warm-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-pink-400 to-purple-500 rounded-full transition-all duration-300"
              style={{ width: `${(checkedEssential / totalEssential) * 100}%` }}
            />
          </div>
          <p className="text-xs text-warm-500 mt-2">
            {totalPacked} of {totalItems} total items packed
          </p>
        </div>

        {/* Add Custom Item Button */}
        <div className="mb-6">
          {!showAddForm ? (
            <Button
              onClick={() => setShowAddForm(true)}
              variant="outline"
              className="w-full border-dashed border-2 border-pink-300 hover:border-pink-500 hover:bg-pink-50"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your Own Item
            </Button>
          ) : (
            <div className="p-4 bg-pink-50 border border-pink-200 rounded-xl">
              <h4 className="font-medium text-warm-900 mb-3">Add Custom Item</h4>
              <div className="space-y-3">
                <Input
                  placeholder="Item name (e.g., My lucky socks)"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addCustomItem()}
                />
                <select
                  value={newItemCategory}
                  onChange={(e) => setNewItemCategory(e.target.value as BagItem['category'])}
                  className="w-full p-2 border border-warm-200 rounded-lg text-sm"
                >
                  {Object.entries(categoryLabels).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <Button onClick={addCustomItem} className="flex-1 bg-pink-500 hover:bg-pink-600">
                    Add Item
                  </Button>
                  <Button onClick={() => setShowAddForm(false)} variant="ghost">
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Categories */}
        <div className="space-y-3">
          {categories.map(category => {
            const categoryItems = items.filter(item => item.category === category);
            const checkedInCategory = categoryItems.filter(i => i.checked).length;
            const Icon = categoryIcons[category];
            const isExpanded = expandedCategories.includes(category);
            
            return (
              <div key={category} className="border border-warm-100 rounded-xl overflow-hidden">
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full px-4 py-3 bg-warm-50 flex items-center justify-between hover:bg-warm-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-soft">
                      <Icon className="w-4 h-4 text-pink-500" />
                    </div>
                    <div className="text-left">
                      <span className="font-medium text-warm-900">
                        {categoryLabels[category]}
                      </span>
                      <span className="text-xs text-warm-500 ml-2">
                        {checkedInCategory}/{categoryItems.length} packed
                      </span>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-warm-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-warm-400" />
                  )}
                </button>
                
                {isExpanded && (
                  <div className="p-4 space-y-3">
                    {categoryItems.map(item => (
                      <div 
                        key={item.id}
                        className={cn(
                          "flex items-start gap-3 p-3 rounded-lg transition-colors",
                          item.checked ? "bg-emerald-50/50" : "bg-white hover:bg-warm-50"
                        )}
                      >
                        <Checkbox
                          id={item.id}
                          checked={item.checked}
                          onCheckedChange={() => toggleItem(item.id)}
                          className="mt-0.5"
                        />
                        <div className="flex-1">
                          <label 
                            htmlFor={item.id}
                            className={cn(
                              "flex items-center gap-2 cursor-pointer",
                              item.checked && "line-through text-warm-500"
                            )}
                          >
                            <span className="font-medium text-warm-800">
                              {item.name}
                            </span>
                            {item.essential && (
                              <Badge variant="secondary" className="bg-red-100 text-red-600 text-[10px]">
                                Essential
                              </Badge>
                            )}
                            {item.isCustom && (
                              <Badge variant="secondary" className="bg-blue-100 text-blue-600 text-[10px]">
                                Custom
                              </Badge>
                            )}
                          </label>
                          {item.description && (
                            <p className="text-xs text-warm-500 mt-1">
                              {item.description}
                            </p>
                          )}
                        </div>
                        {item.isCustom && (
                          <button
                            onClick={() => deleteCustomItem(item.id)}
                            className="text-warm-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Tips */}
        <div className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-100 rounded-xl">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <h4 className="font-semibold text-amber-900 mb-1">Pro Tips</h4>
              <ul className="text-sm text-amber-800 space-y-1">
                <li>• Pack your bag by 36 weeks (3 weeks before due date)</li>
                <li>• Pack a separate bag for labor vs. postpartum</li>
                <li>• Keep toiletries in a clear bag for easy access</li>
                <li>• Bring a few sizes of baby clothes (NB and 0-3mo)</li>
                <li>• Don't forget the car seat - hospital won't let you leave without it!</li>
              </ul>
            </div>
          </div>
        </div>
        </>
        )}
      </CardContent>
    </Card>
  );
}
