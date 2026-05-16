'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Gift,
  ShoppingCart,
  CheckCircle2,
  Package,
  ExternalLink,
  Plus,
  Trash2,
  Store,
  Upload,
  Loader2,
  Info,
  Sparkles,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { RegistryImportModal } from './RegistryImportModal';

interface RegistryItem {
  id: string;
  user_id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  source: 'amazon' | 'target' | 'buybuybaby' | 'walmart' | 'custom' | 'babylist';
  external_url?: string;
  image_url?: string;
  status: 'wanted' | 'gifted' | 'purchased' | 'received';
  priority: 'essential' | 'nice-to-have' | 'optional';
  notes?: string;
  created_at: string;
}

interface RegistryTrackerProps {
  userId?: string | null;
}

const SOURCE_ICONS = {
  amazon: Store,
  target: Store,
  buybuybaby: Store,
  walmart: Store,
  custom: Package,
  babylist: Store,
};

const SOURCE_LABELS = {
  amazon: 'Amazon',
  target: 'Target',
  buybuybaby: 'Buy Buy Baby',
  walmart: 'Walmart',
  custom: 'Custom',
  babylist: 'Babylist',
};

const CATEGORIES = [
  { value: 'gear', label: 'Gear' },
  { value: 'clothing', label: 'Clothing' },
  { value: 'feeding', label: 'Feeding' },
  { value: 'nursery', label: 'Nursery' },
  { value: 'diapering', label: 'Diapering' },
  { value: 'bath', label: 'Bath & Health' },
  { value: 'toys', label: 'Toys & Books' },
  { value: 'safety', label: 'Safety' },
  { value: 'other', label: 'Other' },
];

export function RegistryTracker({ userId }: RegistryTrackerProps) {
  const [items, setItems] = useState<RegistryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [newItem, setNewItem] = useState<Partial<RegistryItem>>({
    name: '',
    category: 'gear',
    price: 0,
    quantity: 1,
    source: 'custom',
    status: 'wanted',
    priority: 'essential',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchRegistryItems();
    } else {
      setLoading(false);
    }
  }, [userId]);

  const fetchRegistryItems = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('registry_items')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching registry items:', error);
    } finally {
      setLoading(false);
    }
  };

  const addItem = async () => {
    if (!userId || !newItem.name) return;

    try {
      setIsSubmitting(true);
      const { error } = await supabase.from('registry_items').insert({
        user_id: userId,
        name: newItem.name,
        category: newItem.category,
        price: newItem.price,
        quantity: newItem.quantity,
        source: newItem.source,
        status: 'wanted',
        priority: newItem.priority,
        external_url: newItem.external_url || null,
      });

      if (error) throw error;

      setNewItem({
        name: '',
        category: 'gear',
        price: 0,
        quantity: 1,
        source: 'custom',
        status: 'wanted',
        priority: 'essential',
      });
      setIsAddDialogOpen(false);
      await fetchRegistryItems();
    } catch (error) {
      console.error('Error adding item:', error);
      alert('Failed to add item. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateStatus = async (itemId: string, newStatus: RegistryItem['status']) => {
    try {
      const { error } = await supabase
        .from('registry_items')
        .update({ status: newStatus })
        .eq('id', itemId);

      if (error) throw error;
      await fetchRegistryItems();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status. Please try again.');
    }
  };

  const handleImportItems = async (importedItems: any[]) => {
    if (!userId) {
      throw new Error('User not authenticated');
    }

    try {
      const itemsToInsert = importedItems.map((item) => ({
        user_id: userId,
        name: item.name,
        category: item.category || 'other',
        price: item.price,
        quantity: 1,
        source: item.source,
        status: 'wanted' as const,
        priority: 'essential' as const,
        external_url: item.external_url,
        image_url: item.image_url,
      }));

      const { error } = await supabase.from('registry_items').insert(itemsToInsert);
      if (error) throw error;
      
      await fetchRegistryItems();
    } catch (error) {
      console.error('Error importing items:', error);
      throw error;
    }
  };

  const deleteItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('registry_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
      await fetchRegistryItems();
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete item. Please try again.');
    }
  };

  const filteredItems = items.filter((item) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'gifted') return item.status === 'gifted';
    if (activeTab === 'purchased') return item.status === 'purchased';
    if (activeTab === 'received') return item.status === 'received';
    if (activeTab === 'wanted') return item.status === 'wanted';
    return true;
  });

  const stats = {
    totalValue: items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
    giftedValue: items
      .filter((item) => item.status === 'gifted')
      .reduce((sum, item) => sum + (item.price * item.quantity), 0),
    purchasedValue: items
      .filter((item) => item.status === 'purchased')
      .reduce((sum, item) => sum + (item.price * item.quantity), 0),
    stillNeeded: items.filter((item) => item.status === 'wanted').length,
    totalItems: items.length,
  };

  const getStatusBadge = (status: RegistryItem['status']) => {
    switch (status) {
      case 'gifted':
        return (
          <Badge className="bg-purple-100 text-purple-700 border-purple-200">
            <Gift className="w-3 h-3 mr-1" />
            Gifted
          </Badge>
        );
      case 'purchased':
        return (
          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
            <ShoppingCart className="w-3 h-3 mr-1" />
            Purchased
          </Badge>
        );
      case 'received':
        return (
          <Badge className="bg-blue-100 text-blue-700 border-blue-200">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Received
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            <Package className="w-3 h-3 mr-1" />
            Wanted
          </Badge>
        );
    }
  };

  const renderItem = (item: RegistryItem) => {
    const SourceIcon = SOURCE_ICONS[item.source] || Package;

    return (
      <div
        key={item.id}
        className="group flex items-start gap-4 p-4 rounded-xl border border-warm-100 bg-white hover:shadow-soft transition-all"
      >
        <div className="w-12 h-12 bg-gradient-to-br from-warm-100 to-warm-50 rounded-lg flex items-center justify-center shrink-0">
          <SourceIcon className="w-5 h-5 text-warm-500" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="font-semibold text-warm-900">{item.name}</h4>
              <p className="text-sm text-warm-500">
                {CATEGORIES.find((c) => c.value === item.category)?.label || item.category}
              </p>
            </div>
            <div className="text-right shrink-0">
              <div className="font-semibold text-warm-900">
                ${(item.price * item.quantity).toLocaleString()}
              </div>
              <div className="text-xs text-warm-500">
                {item.quantity > 1 && `${item.quantity} @ $${item.price}`}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-3">
            {getStatusBadge(item.status)}

            <Select
              value={item.status}
              onValueChange={(value) => updateStatus(item.id, value as RegistryItem['status'])}
            >
              <SelectTrigger className="w-36 h-8 text-xs">
                <SelectValue placeholder="Update status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="wanted">Wanted</SelectItem>
                <SelectItem value="gifted">Gifted</SelectItem>
                <SelectItem value="purchased">Purchased</SelectItem>
                <SelectItem value="received">Received</SelectItem>
              </SelectContent>
            </Select>

            {item.external_url && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2"
                onClick={() => window.open(item.external_url, '_blank')}
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-red-500 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => deleteItem(item.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <Card className="border-warm-100">
        <CardContent className="p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-500" />
          <p className="text-warm-600">Loading your registry...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-warm-100">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <Gift className="w-5 h-5 text-purple-500" />
                Baby Registry
              </CardTitle>
              <p className="text-sm text-warm-500 mt-1">
                Track gifts vs purchases
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsImportModalOpen(true)}
              >
                <Upload className="w-4 h-4 mr-2" />
                Import
              </Button>

              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-gradient-to-r from-purple-500 to-purple-600">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add Registry Item</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div>
                      <label className="text-sm font-medium text-warm-700">Item Name</label>
                      <Input
                        value={newItem.name}
                        onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                        placeholder="e.g., Uppababy Vista Stroller"
                        className="mt-1"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-warm-700">Category</label>
                        <Select
                          value={newItem.category}
                          onValueChange={(value) => setNewItem({ ...newItem, category: value })}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {CATEGORIES.map((cat) => (
                              <SelectItem key={cat.value} value={cat.value}>
                                {cat.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-warm-700">Source</label>
                        <Select
                          value={newItem.source}
                          onValueChange={(value: any) => setNewItem({ ...newItem, source: value })}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(SOURCE_LABELS).map(([value, label]) => (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-warm-700">Price</label>
                        <Input
                          type="number"
                          value={newItem.price}
                          onChange={(e) => setNewItem({ ...newItem, price: parseFloat(e.target.value) || 0 })}
                          placeholder="0.00"
                          className="mt-1"
                          min="0"
                          step="0.01"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium text-warm-700">Quantity</label>
                        <Input
                          type="number"
                          value={newItem.quantity}
                          onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })}
                          className="mt-1"
                          min="1"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-warm-700">Product URL (optional)</label>
                      <Input
                        value={newItem.external_url || ''}
                        onChange={(e) => setNewItem({ ...newItem, external_url: e.target.value })}
                        placeholder="https://amazon.com/..."
                        className="mt-1"
                      />
                    </div>

                    <Button
                      onClick={addItem}
                      disabled={!newItem.name || isSubmitting}
                      className="w-full bg-gradient-to-r from-purple-500 to-purple-600"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Plus className="w-4 h-4 mr-2" />
                      )}
                      Add to Registry
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Coming Soon Banner - Direct integrations */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-soft flex-shrink-0">
                <Sparkles className="w-5 h-5 text-purple-500" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-purple-900 mb-1">Direct registry sync coming soon</h4>
                <p className="text-sm text-purple-700">
                  We're partnering with Babylist, Amazon, and Target for one-click registry sync. 
                  For now, you can <strong>manually add items</strong> to track purchases vs gifts.
                </p>
              </div>
            </div>
          </div>
          {/* Stats Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-warm-50 to-warm-100 rounded-xl p-4">
              <div className="text-sm text-warm-600 mb-1">Total Registry</div>
              <div className="text-2xl font-bold text-warm-900">
                ${stats.totalValue.toLocaleString()}
              </div>
              <div className="text-xs text-warm-500">{stats.totalItems} items</div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
              <div className="text-sm text-purple-700 mb-1">Gifted</div>
              <div className="text-2xl font-bold text-purple-900">
                ${stats.giftedValue.toLocaleString()}
              </div>
              <div className="text-xs text-purple-600">From friends & family</div>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4">
              <div className="text-sm text-emerald-700 mb-1">You Purchased</div>
              <div className="text-2xl font-bold text-emerald-900">
                ${stats.purchasedValue.toLocaleString()}
              </div>
              <div className="text-xs text-emerald-600">Out of pocket</div>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4">
              <div className="text-sm text-amber-700 mb-1">Still Needed</div>
              <div className="text-2xl font-bold text-amber-900">{stats.stillNeeded}</div>
              <div className="text-xs text-amber-600">Items on list</div>
            </div>
          </div>

          {/* Registry Items List */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-warm-50 p-1 rounded-xl">
              <TabsTrigger value="all" className="rounded-lg data-[state=active]:bg-white">
                All ({items.length})
              </TabsTrigger>
              <TabsTrigger value="wanted" className="rounded-lg data-[state=active]:bg-white">
                Wanted ({items.filter((i) => i.status === 'wanted').length})
              </TabsTrigger>
              <TabsTrigger value="gifted" className="rounded-lg data-[state=active]:bg-white">
                Gifted ({items.filter((i) => i.status === 'gifted').length})
              </TabsTrigger>
              <TabsTrigger value="purchased" className="rounded-lg data-[state=active]:bg-white">
                Purchased ({items.filter((i) => i.status === 'purchased').length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-4">
              {filteredItems.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-warm-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Gift className="w-8 h-8 text-warm-400" />
                  </div>
                  <h3 className="font-semibold text-warm-900 mb-2">
                    {activeTab === 'wanted' ? 'No items on your list' : `No ${activeTab} items yet`}
                  </h3>
                  <p className="text-sm text-warm-500">
                    {activeTab === 'wanted'
                      ? 'Add items to your registry to start tracking'
                      : `No items have been ${activeTab} yet`}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredItems.map(renderItem)}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <RegistryImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImportItems}
      />
    </>
  );
}
