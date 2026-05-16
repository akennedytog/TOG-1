'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Upload, CheckCircle2, AlertCircle, Store, Link as LinkIcon, Package, ArrowRight, ArrowLeft, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RegistryItem {
  name: string;
  price: number;
  category?: string;
  image_url?: string;
  external_url: string;
  source: 'amazon' | 'target' | 'babylist';
}

interface RegistryImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (items: RegistryItem[]) => Promise<void>;
}

type ImportStep = 'input' | 'loading' | 'preview' | 'success' | 'error';

const REGISTRY_SOURCES = [
  { value: 'amazon', label: 'Amazon', icon: Store, color: 'text-amber-600' },
  { value: 'target', label: 'Target', icon: Store, color: 'text-red-600' },
  { value: 'babylist', label: 'Babylist', icon: LinkIcon, color: 'text-teal-600' },
];

const SOURCE_HELP_TEXT: Record<string, string> = {
  amazon: 'Paste your Amazon registry URL (e.g., amazon.com/baby-reg/...)',
  target: 'Paste your Target registry URL (e.g., target.com/gift-registry/...)',
  babylist: 'Paste your Babylist URL (e.g., babylist.com/your-name)',
};

const CATEGORIES: Record<string, { label: string; color: string }> = {
  gear: { label: 'Gear', color: 'bg-blue-100 text-blue-700' },
  nursery: { label: 'Nursery', color: 'bg-purple-100 text-purple-700' },
  feeding: { label: 'Feeding', color: 'bg-amber-100 text-amber-700' },
  clothing: { label: 'Clothing', color: 'bg-pink-100 text-pink-700' },
  diapering: { label: 'Diapering', color: 'bg-green-100 text-green-700' },
  safety: { label: 'Safety', color: 'bg-red-100 text-red-700' },
  toys: { label: 'Toys', color: 'bg-yellow-100 text-yellow-700' },
  bath: { label: 'Bath', color: 'bg-cyan-100 text-cyan-700' },
  other: { label: 'Other', color: 'bg-gray-100 text-gray-700' },
};

export function RegistryImportModal({ isOpen, onClose, onImport }: RegistryImportModalProps) {
  const [step, setStep] = useState<ImportStep>('input');
  const [source, setSource] = useState<string>('');
  const [url, setUrl] = useState('');
  const [message, setMessage] = useState('');
  const [foundItems, setFoundItems] = useState<RegistryItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [isSaving, setIsSaving] = useState(false);

  const handleScrape = async () => {
    if (!url || !source) return;

    setStep('loading');
    setMessage('');

    try {
      const response = await fetch('/api/registry/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, source }),
      });

      const data = await response.json();

      if (data.success && data.items.length > 0) {
        setFoundItems(data.items);
        // Select all items by default
        setSelectedItems(new Set(data.items.map((_item: RegistryItem, idx: number) => idx)));
        setMessage(data.message);
        setStep('preview');
      } else if (data.success && data.items.length === 0) {
        setMessage(data.message || 'No items found in the registry');
        setStep('error');
      } else {
        setMessage(data.message || 'Failed to import registry');
        setStep('error');
      }
    } catch (error) {
      setMessage('An error occurred while importing. Please try again.');
      setStep('error');
    }
  };

  const handleSave = async () => {
    if (selectedItems.size === 0) return;

    setIsSaving(true);
    
    const itemsToSave = foundItems.filter((_, idx) => selectedItems.has(idx));
    
    try {
      await onImport(itemsToSave);
      setStep('success');
    } catch (error) {
      setMessage('Failed to save items to your registry');
      setStep('error');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleItemSelection = (idx: number) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(idx)) {
      newSelected.delete(idx);
    } else {
      newSelected.add(idx);
    }
    setSelectedItems(newSelected);
  };

  const selectAll = () => {
    setSelectedItems(new Set(foundItems.map((_, idx) => idx)));
  };

  const deselectAll = () => {
    setSelectedItems(new Set());
  };

  const reset = () => {
    setStep('input');
    setSource('');
    setUrl('');
    setMessage('');
    setFoundItems([]);
    setSelectedItems(new Set());
    setIsSaving(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const totalValue = foundItems.reduce((sum, item) => sum + item.price, 0);
  const selectedValue = foundItems
    .filter((_, idx) => selectedItems.has(idx))
    .reduce((sum, item) => sum + item.price, 0);

  const CurrentIcon = source ? REGISTRY_SOURCES.find(s => s.value === source)?.icon || Store : Store;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className={cn(
        "sm:max-w-lg",
        step === 'preview' && "sm:max-w-2xl"
      )}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {step === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            ) : (
              <Upload className="w-5 h-5 text-purple-500" />
            )}
            {step === 'preview' ? 'Review Items' : step === 'success' ? 'Import Complete' : 'Import Registry'}
          </DialogTitle>
          <DialogDescription>
            {step === 'input' && 'Import items from your existing baby registry'}
            {step === 'loading' && 'Fetching items from your registry...'}
            {step === 'preview' && `Found ${foundItems.length} items. Select which ones to import.`}
            {step === 'success' && `${selectedItems.size} items have been added to your registry`}
            {step === 'error' && 'Something went wrong'}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {/* Input Step */}
          {step === 'input' && (
            <div className="space-y-6">
              {/* Registry Source */}
              <div className="space-y-2">
                <Label>Registry Source</Label>
                <div className="grid grid-cols-3 gap-3">
                  {REGISTRY_SOURCES.map((src) => (
                    <button
                      key={src.value}
                      onClick={() => setSource(src.value)}
                      className={cn(
                        "flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all",
                        source === src.value
                          ? "border-purple-500 bg-purple-50"
                          : "border-gray-200 hover:border-purple-200 hover:bg-gray-50"
                      )}
                    >
                      <src.icon className={cn("w-6 h-6", src.color)} />
                      <span className="text-sm font-medium">{src.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* URL Input */}
              {source && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  <Label htmlFor="registry-url">Registry URL</Label>
                  <Input
                    id="registry-url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder={SOURCE_HELP_TEXT[source]}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500">
                    {SOURCE_HELP_TEXT[source]}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleScrape}
                  disabled={!url || !source}
                  className={cn(
                    "flex-1 bg-gradient-to-r from-purple-500 to-purple-600",
                    (!url || !source) && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Preview Items
                </Button>
              </div>
            </div>
          )}

          {/* Loading Step */}
          {step === 'loading' && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-purple-200 rounded-full" />
                <Loader2 className="w-16 h-16 text-purple-500 animate-spin absolute top-0 left-0" />
              </div>
              <div className="text-center">
                <p className="font-medium text-gray-900">Importing your registry...</p>
                <p className="text-sm text-gray-500 mt-1">
                  Scraping {REGISTRY_SOURCES.find(s => s.value === source)?.label} for items
                </p>
              </div>
            </div>
          )}

          {/* Preview Step */}
          {step === 'preview' && (
            <div className="space-y-4">
              {/* Stats */}
              <div className="flex items-center justify-between text-sm bg-gray-50 p-3 rounded-lg">
                <div>
                  <span className="text-gray-600">Found: </span>
                  <span className="font-medium">{foundItems.length} items</span>
                </div>
                <div className="text-right">
                  <span className="text-gray-600">Total value: </span>
                  <span className="font-medium">${totalValue.toLocaleString()}</span>
                </div>
              </div>

              {/* Select All / None */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={selectAll}>
                    Select All
                  </Button>
                  <Button variant="ghost" size="sm" onClick={deselectAll}>
                    Select None
                  </Button>
                </div>
                <span className="text-sm text-purple-600 font-medium">
                  {selectedItems.size} selected (${selectedValue.toLocaleString()})
                </span>
              </div>

              {/* Items List */}
              <div className="max-h-[400px] overflow-y-auto space-y-2 border rounded-xl p-2">
                {foundItems.map((item, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer",
                      selectedItems.has(idx)
                        ? "border-purple-300 bg-purple-50"
                        : "border-gray-200 hover:border-purple-200"
                    )}
                    onClick={() => toggleItemSelection(idx)}
                  >
                    <Checkbox
                      checked={selectedItems.has(idx)}
                      onCheckedChange={() => toggleItemSelection(idx)}
                      className="mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={cn(
                          "font-medium text-sm",
                          !selectedItems.has(idx) && "text-gray-400"
                        )}>
                          {item.name}
                        </p>
                        <span className={cn(
                          "font-semibold text-sm shrink-0",
                          !selectedItems.has(idx) && "text-gray-400"
                        )}>
                          ${item.price.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={cn(
                          "text-xs px-2 py-0.5 rounded-full",
                          CATEGORIES[item.category || 'other']?.color || CATEGORIES.other.color,
                          !selectedItems.has(idx) && "opacity-50"
                        )}>
                          {CATEGORIES[item.category || 'other']?.label}
                        </span>
                        <span className={cn(
                          "text-xs flex items-center gap-1",
                          !selectedItems.has(idx) && "text-gray-400"
                        )}>
                          <CurrentIcon className="w-3 h-3" />
                          {source}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setStep('input')}
                  className="flex-1"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={selectedItems.size === 0 || isSaving}
                  className={cn(
                    "flex-1 bg-gradient-to-r from-purple-500 to-purple-600",
                    (selectedItems.size === 0 || isSaving) && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Package className="w-4 h-4 mr-2" />
                      Import {selectedItems.size} Items
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Success Step */}
          {step === 'success' && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-semibold text-emerald-900 text-lg">Import Successful!</h3>
                <p className="text-sm text-emerald-700 mt-2">
                  {selectedItems.size} items have been added to your registry with status &quot;Wanted&quot;
                </p>
              </div>
              <div className="bg-emerald-50 rounded-xl p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-emerald-600">Items imported:</span>
                    <p className="font-semibold text-emerald-900">{selectedItems.size}</p>
                  </div>
                  <div>
                    <span className="text-emerald-600">Total value:</span>
                    <p className="font-semibold text-emerald-900">${selectedValue.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <Button 
                onClick={handleClose} 
                className="bg-emerald-600 hover:bg-emerald-700 w-full"
              >
                Done
              </Button>
            </div>
          )}

          {/* Error Step */}
          {step === 'error' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-red-900">Import Failed</h3>
                <p className="text-sm text-red-700 mt-2 whitespace-pre-line">{message}</p>
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => setStep('input')}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600"
                >
                  Try Again
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
