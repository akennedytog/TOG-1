'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  MapPin,
  Phone,
  Mail,
  Star,
  Heart,
  ExternalLink,
  Clock,
  Shield,
  User,
  Filter,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

const providerTypes = [
  { id: 'all', name: 'All Providers' },
  { id: 'pediatrician', name: 'Pediatricians' },
  { id: 'lactation', name: 'Lactation Consultants' },
  { id: 'financial', name: 'Financial Advisors' },
  { id: 'attorney', name: 'Estate Attorneys' },
  { id: 'insurance', name: 'Insurance Brokers' },
  { id: 'doula', name: 'Doulas/Midwives' },
];

interface Provider {
  id: string;
  name: string;
  type: string;
  credentials: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  email?: string;
  website?: string;
  rating: number;
  reviewCount: number;
  acceptsNewPatients: boolean;
  offersTelehealth: boolean;
  insuranceAccepted: string[];
  languages: string[];
  hours?: string;
  about?: string;
  image?: string;
}

const sampleProviders: Provider[] = [
  {
    id: '1',
    name: 'Dr. Sarah Johnson',
    type: 'pediatrician',
    credentials: 'MD, FAAP',
    address: '123 Health Drive, Suite 200',
    city: 'Miami',
    state: 'FL',
    phone: '(305) 555-0123',
    email: 'schedule@drjohnson.com',
    website: 'https://drjohnson.com',
    rating: 4.9,
    reviewCount: 127,
    acceptsNewPatients: true,
    offersTelehealth: true,
    insuranceAccepted: ['Blue Cross', 'Aetna', 'United Healthcare'],
    languages: ['English', 'Spanish'],
    hours: 'Mon-Fri: 8am-5pm',
    about: 'Board-certified pediatrician with 15 years experience. Specializes in newborn care and developmental pediatrics.',
  },
  {
    id: '2',
    name: 'Lisa Chen, IBCLC',
    type: 'lactation',
    credentials: 'IBCLC, RN',
    address: '456 Family Way',
    city: 'Fort Lauderdale',
    state: 'FL',
    phone: '(954) 555-0456',
    email: 'lisa@breastfeedingfl.com',
    rating: 5.0,
    reviewCount: 89,
    acceptsNewPatients: true,
    offersTelehealth: true,
    insuranceAccepted: ['Most major insurances'],
    languages: ['English', 'Mandarin'],
    about: 'International Board Certified Lactation Consultant. Home visits and virtual consultations available.',
  },
  {
    id: '3',
    name: 'Marcus Williams, CFP',
    type: 'financial',
    credentials: 'CFP®, ChFC',
    address: '789 Wealth Blvd, Floor 10',
    city: 'West Palm Beach',
    state: 'FL',
    phone: '(561) 555-0789',
    website: 'https://mwfinancial.com',
    rating: 4.8,
    reviewCount: 56,
    acceptsNewPatients: true,
    offersTelehealth: true,
    insuranceAccepted: ['Fee-only'],
    languages: ['English'],
    about: 'Specializes in family financial planning, 529 plans, and college savings strategies.',
  },
  {
    id: '4',
    name: 'Patricia Davis, Esq.',
    type: 'attorney',
    credentials: 'JD, LLM',
    address: '321 Legal Lane',
    city: 'Boca Raton',
    state: 'FL',
    phone: '(561) 555-0321',
    email: 'patricia@davislaw.com',
    rating: 4.7,
    reviewCount: 43,
    acceptsNewPatients: true,
    offersTelehealth: true,
    insuranceAccepted: ['Flat fee packages'],
    languages: ['English', 'French'],
    about: 'Estate planning attorney focused on young families. Wills, trusts, guardianship designations.',
  },
  {
    id: '5',
    name: 'Maria Rodriguez',
    type: 'doula',
    credentials: 'CD(DONA), PCD',
    address: '654 Birth Circle',
    city: 'Miami',
    state: 'FL',
    phone: '(305) 555-0654',
    rating: 5.0,
    reviewCount: 72,
    acceptsNewPatients: true,
    offersTelehealth: false,
    insuranceAccepted: ['Some HSA/FSA eligible'],
    languages: ['English', 'Spanish', 'Portuguese'],
    about: 'Birth and postpartum doula. Supporting families through pregnancy, birth, and the fourth trimester.',
  },
  {
    id: '6',
    name: 'Dr. James Thompson',
    type: 'pediatrician',
    credentials: 'MD, MPH',
    address: '987 Childrens Ave',
    city: 'Fort Lauderdale',
    state: 'FL',
    phone: '(954) 555-0987',
    rating: 4.6,
    reviewCount: 201,
    acceptsNewPatients: false,
    offersTelehealth: true,
    insuranceAccepted: ['Blue Cross', 'Cigna', 'Humana'],
    languages: ['English'],
    hours: 'Mon-Thu: 7am-6pm, Fri: 7am-4pm',
    about: 'Large practice with multiple providers. 24/7 nurse hotline for established patients.',
  },
];

export function ProviderDirectory() {
  const [providers, setProviders] = useState<Provider[]>(sampleProviders);
  const [activeType, setActiveType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [savedProviders, setSavedProviders] = useState<string[]>(['1']);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);

  const filteredProviders = providers.filter(p => {
    const matchesType = activeType === 'all' || p.type === activeType;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         p.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         p.insuranceAccepted.some(i => i.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesSearch;
  });

  const toggleSaved = (id: string) => {
    setSavedProviders(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
        <span className="font-medium">{rating}</span>
        <span className="text-warm-400 text-sm">({providers.find(p => p.rating === rating)?.reviewCount || 0})</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Disclaimer Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
        <p className="text-sm text-amber-800 flex items-start gap-2">
          <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span><strong>Demo Directory:</strong> Providers shown are for demonstration purposes. We&apos;re building a verified network of local professionals. Contact providers directly to verify credentials and availability.</span>
        </p>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-warm-900">Provider Directory</h2>
          <p className="text-warm-600">Find pediatricians, lactation consultants, financial advisors, and more.</p>
        </div>

        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-warm-400" />
            <Input
              placeholder="Search providers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full md:w-64"
            />
          </div>
        </div>
      </div>

      {/* Provider Type Filter */}
      <div className="flex flex-wrap gap-2">
        {providerTypes.map(type => (
          <button
            key={type.id}
            onClick={() => setActiveType(type.id)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium transition-colors',
              activeType === type.id
                ? 'bg-primary-500 text-white'
                : 'bg-warm-100 text-warm-600 hover:bg-warm-200'
            )}
          >
            {type.name}
          </button>
        ))}
      </div>

      {/* Results Count */}
      <div className="text-sm text-warm-500">
        Showing {filteredProviders.length} providers
      </div>

      {/* Provider Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        {filteredProviders.map(provider => (
          <Card key={provider.id} className="group hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                    {provider.name.charAt(0)}
                  </div>

                  <div>
                    <div className="font-semibold text-warm-900">{provider.name}</div>
                    <div className="text-sm text-warm-500">{provider.credentials}</div>
                  </div>
                </div>

                <button
                  onClick={() => toggleSaved(provider.id)}
                  className={cn(
                    'p-2 rounded-lg transition-colors',
                    savedProviders.includes(provider.id)
                      ? 'text-rose-500 bg-rose-50'
                      : 'text-warm-300 hover:text-rose-500'
                  )}
                >
                  <Heart className={cn('w-5 h-5', savedProviders.includes(provider.id) && 'fill-current')} />
                </button>
              </div>

              <div className="flex items-center gap-2 mb-3">
                {renderStars(provider.rating)}
                <span className="text-warm-300">•</span>

                <Badge variant="secondary" className="text-xs">
                  {providerTypes.find(t => t.id === provider.type)?.name}
                </Badge>

                {!provider.acceptsNewPatients && (
                  <Badge className="text-xs bg-amber-100 text-amber-700">
                    Not accepting new patients
                  </Badge>
                )}
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-warm-600">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  {provider.address}, {provider.city}, {provider.state}
                </div>

                <div className="flex items-center gap-2 text-warm-600">
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  {provider.phone}
                </div>

                {provider.offersTelehealth && (
                  <div className="flex items-center gap-2 text-emerald-600">
                    <Shield className="w-4 h-4 flex-shrink-0" />
                    Offers telehealth
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-warm-100">
                <div className="text-sm text-warm-500 mb-2">Accepts:</div>
                <div className="flex flex-wrap gap-1">
                  {provider.insuranceAccepted.slice(0, 3).map(ins => (
                    <Badge key={ins} variant="outline" className="text-xs">{ins}</Badge>
                  ))}
                  {provider.insuranceAccepted.length > 3 && (
                    <Badge variant="outline" className="text-xs">+{provider.insuranceAccepted.length - 3} more</Badge>
                  )}
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button size="sm" className="flex-1">
                  <Phone className="w-4 h-4 mr-1" />
                  Call
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  <ExternalLink className="w-4 h-4 mr-1" />
                  Website
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProviders.length === 0 && (
        <div className="text-center py-12">
          <User className="w-12 h-12 text-warm-300 mx-auto mb-4" />
          <p className="text-warm-500">No providers found matching your criteria.</p>
          <Button variant="outline" className="mt-4" onClick={() => { setActiveType('all'); setSearchQuery(''); }}>
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}
