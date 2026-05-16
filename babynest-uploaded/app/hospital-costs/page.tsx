'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  MapPin, 
  DollarSign, 
  Building2, 
  Info,
  CheckCircle2,
  XCircle,
  Search,
  TrendingUp,
  Shield,
  Users
} from 'lucide-react';

interface Hospital {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  distance: number;
  rating: number;
  costs: {
    vaginalBirth: number;
    cSection: number;
    nicuDay: number;
  };
  inNetwork: boolean;
  amenities: string[];
}

// Mock hospital data - in production this would come from an API
const MOCK_HOSPITALS: Hospital[] = [
  {
    id: '1',
    name: 'St. Joseph\'s Medical Center',
    address: '123 Healthcare Blvd',
    city: 'Sample City',
    state: 'CA',
    zip: '90210',
    distance: 2.3,
    rating: 4.5,
    costs: {
      vaginalBirth: 12500,
      cSection: 18500,
      nicuDay: 3200
    },
    inNetwork: true,
    amenities: ['NICU Level III', 'Private Rooms', 'Lactation Support']
  },
  {
    id: '2',
    name: 'Mercy General Hospital',
    address: '456 Wellness Way',
    city: 'Sample City',
    state: 'CA',
    zip: '90211',
    distance: 4.1,
    rating: 4.2,
    costs: {
      vaginalBirth: 14200,
      cSection: 21000,
      nicuDay: 3500
    },
    inNetwork: true,
    amenities: ['NICU Level II', 'Birth Center', 'Doula Services']
  },
  {
    id: '3',
    name: 'University Medical Center',
    address: '789 University Ave',
    city: 'Sample City',
    state: 'CA',
    zip: '90212',
    distance: 6.8,
    rating: 4.8,
    costs: {
      vaginalBirth: 15800,
      cSection: 23500,
      nicuDay: 4100
    },
    inNetwork: false,
    amenities: ['NICU Level IV', 'Research Hospital', 'Specialty Care', '24/7 Anesthesia']
  },
  {
    id: '4',
    name: 'Community Birth Center',
    address: '321 Natural Birth Ln',
    city: 'Sample City',
    state: 'CA',
    zip: '90213',
    distance: 3.5,
    rating: 4.6,
    costs: {
      vaginalBirth: 8900,
      cSection: 15200,
      nicuDay: 2800
    },
    inNetwork: true,
    amenities: ['Water Birth', 'Midwife Led', 'Home-like Environment']
  }
];

export default function HospitalCostPage() {
  const [zipCode, setZipCode] = useState('');
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [searched, setSearched] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [insuranceType, setInsuranceType] = useState<'basic' | 'premium' | 'none'>('basic');

  const handleSearch = () => {
    // In production, this would call an API
    setHospitals(MOCK_HOSPITALS);
    setSearched(true);
  };

  const calculateOutOfPocket = (hospital: Hospital, type: 'vaginal' | 'csection') => {
    const baseCost = type === 'vaginal' ? hospital.costs.vaginalBirth : hospital.costs.cSection;
    
    if (!hospital.inNetwork) return baseCost * 0.7; // 70% coverage out of network
    
    switch (insuranceType) {
      case 'premium':
        return baseCost * 0.1; // 90% coverage
      case 'basic':
        return baseCost * 0.2; // 80% coverage
      case 'none':
        return baseCost;
      default:
        return baseCost * 0.2;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-2">Hospital Cost Comparison</h1>
          <p className="text-primary-100">
            Compare delivery costs at hospitals near you
          </p>
        </div>
      </div>

      {/* Disclaimer Banner */}
      <div className="bg-amber-50 border-b border-amber-200 py-3">
        <div className="container mx-auto px-4">
          <p className="text-sm text-amber-800 flex items-center gap-2">
            <Info className="w-4 h-4 flex-shrink-0" />
            <span><strong>Demo Data:</strong> Hospital costs shown are estimates for demonstration purposes only. Contact hospitals directly for actual pricing.</span>
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search Section */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-warm-700 mb-2">
                  Enter your ZIP code
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-5 w-5 text-warm-400" />
                  <Input
                    type="text"
                    placeholder="90210"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    className="pl-10"
                    maxLength={5}
                  />
                </div>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-warm-700 mb-2">
                  Insurance Coverage
                </label>
                <select
                  value={insuranceType}
                  onChange={(e) => setInsuranceType(e.target.value as any)}
                  className="w-full h-10 rounded-md border border-warm-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="basic">Basic (80% coverage)</option>
                  <option value="premium">Premium (90% coverage)</option>
                  <option value="none">No Insurance</option>
                </select>
              </div>
              <div className="flex items-end">
                <Button 
                  onClick={handleSearch}
                  className="w-full md:w-auto"
                  size="lg"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Compare Costs
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {searched && (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <Card>
                <CardContent className="p-4 text-center">
                  <Building2 className="w-8 h-8 text-primary-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-warm-900">{hospitals.length}</p>
                  <p className="text-sm text-warm-600">Hospitals Found</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <DollarSign className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-warm-900">
                    {formatCurrency(Math.min(...hospitals.map(h => h.costs.vaginalBirth)))}
                  </p>
                  <p className="text-sm text-warm-600">Lowest Cost</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <TrendingUp className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-warm-900">
                    {formatCurrency(Math.max(...hospitals.map(h => h.costs.vaginalBirth)) - Math.min(...hospitals.map(h => h.costs.vaginalBirth)))}
                  </p>
                  <p className="text-sm text-warm-600">Potential Savings</p>
                </CardContent>
              </Card>
            </div>

            {/* Hospital Cards */}
            <div className="space-y-4">
              {hospitals.sort((a, b) => a.costs.vaginalBirth - b.costs.vaginalBirth).map((hospital, index) => (
                <Card 
                  key={hospital.id}
                  className={`hover:shadow-lg transition-shadow ${
                    index === 0 ? 'ring-2 ring-green-500' : ''
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Hospital Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-lg font-bold text-warm-900">{hospital.name}</h3>
                            <p className="text-sm text-warm-600">{hospital.address}</p>
                            <p className="text-sm text-warm-500">
                              {hospital.city}, {hospital.state} {hospital.zip}
                            </p>
                          </div>
                          <div className="text-right">
                            {hospital.inNetwork ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                In Network
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                <XCircle className="w-3 h-3 mr-1" />
                                Out of Network
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Rating & Distance */}
                        <div className="flex items-center gap-4 text-sm text-warm-600 mb-3">
                          <div className="flex items-center">
                            <span className="font-semibold text-warm-900">{hospital.rating}</span>
                            <span className="ml-1">/5.0 ★</span>
                          </div>
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {hospital.distance} miles away
                          </div>
                        </div>

                        {/* Amenities */}
                        <div className="flex flex-wrap gap-2">
                          {hospital.amenities.map((amenity) => (
                            <span 
                              key={amenity}
                              className="text-xs bg-warm-100 text-warm-700 px-2 py-1 rounded-full"
                            >
                              {amenity}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Cost Breakdown */}
                      <div className="lg:w-80 bg-warm-50 rounded-lg p-4">
                        <h4 className="font-semibold text-warm-900 mb-3">Cost Breakdown</h4>
                        
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-warm-600">Vaginal Birth</span>
                            <div className="text-right">
                              <p className="font-semibold text-warm-900">{formatCurrency(hospital.costs.vaginalBirth)}</p>
                              <p className="text-xs text-green-600">
                                {formatCurrency(calculateOutOfPocket(hospital, 'vaginal'))} out-of-pocket
                              </p>
                            </div>
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="text-sm text-warm-600">C-Section</span>
                            <div className="text-right">
                              <p className="font-semibold text-warm-900">{formatCurrency(hospital.costs.cSection)}</p>
                              <p className="text-xs text-green-600">
                                {formatCurrency(calculateOutOfPocket(hospital, 'csection'))} out-of-pocket
                              </p>
                            </div>
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="text-sm text-warm-600">NICU (per day)</span>
                            <span className="font-semibold text-warm-900">{formatCurrency(hospital.costs.nicuDay)}</span>
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-warm-200">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-warm-900">Your Est. Cost</span>
                            <span className="text-xl font-bold text-primary-600">
                              {formatCurrency(calculateOutOfPocket(hospital, 'vaginal'))}
                            </span>
                          </div>
                          <p className="text-xs text-warm-500 mt-1">Based on your insurance selection</p>
                        </div>

                        {index === 0 && (
                          <div className="mt-3 p-2 bg-green-100 rounded-lg">
                            <p className="text-sm text-green-800 font-medium text-center">
                              ⭐ Best Value Option
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Disclaimer */}
            <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-amber-800">
                    <strong>Important:</strong> These are estimated costs based on average charges. 
                    Your actual costs may vary depending on your specific insurance plan, 
                    complications, length of stay, and other factors. Always contact the hospital 
                    and your insurance provider for exact pricing.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {!searched && (
          <div className="text-center py-12">
            <Building2 className="w-16 h-16 text-warm-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-warm-700 mb-2">Find Hospital Costs Near You</h2>
            <p className="text-warm-600 max-w-md mx-auto">
              Enter your ZIP code above to compare delivery costs at hospitals in your area. 
              See estimated out-of-pocket costs based on your insurance coverage.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
