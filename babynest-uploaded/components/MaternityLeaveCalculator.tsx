'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Calendar, DollarSign, MapPin, Info, CheckCircle2 } from 'lucide-react';

const stateLeaveData: Record<string, any> = {
  'CA': { hasPaidLeave: true, weeksPaid: 8, percentWage: 70, maxWeeklyBenefit: 1536, requirements: 'Earned $300 in base period', programName: 'CA Paid Family Leave' },
  'NJ': { hasPaidLeave: true, weeksPaid: 12, percentWage: 85, maxWeeklyBenefit: 993, requirements: '20 weeks employed', programName: 'NJ Family Leave' },
  'NY': { hasPaidLeave: true, weeksPaid: 12, percentWage: 67, maxWeeklyBenefit: 1064, requirements: 'Work for employer', programName: 'NY Paid Family Leave' },
};

export function MaternityLeaveCalculator() {
  const [weeklySalary, setWeeklySalary] = useState(1000);
  const [state, setState] = useState('CA');
  const [ptoDays, setPtoDays] = useState(10);
  const [employerSize, setEmployerSize] = useState('50+');

  const stateData = stateLeaveData[state] || { hasPaidLeave: false, weeksPaid: 0, percentWage: 0, maxWeeklyBenefit: 0, requirements: 'FMLA only', programName: 'No state program' };
  
  const fmlaWeeks = employerSize === '50+' ? 12 : 0;
  const paidWeeks = stateData.hasPaidLeave ? Math.min(stateData.weeksPaid, fmlaWeeks) : 0;
  const unpaidWeeks = Math.max(0, fmlaWeeks - paidWeeks);
  const weeklyBenefit = Math.min(weeklySalary * (stateData.percentWage / 100), stateData.maxWeeklyBenefit);
  const totalPaid = weeklyBenefit * paidWeeks;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary-500" />
            Maternity Leave Calculator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-warm-700 mb-2">Weekly Salary</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-warm-400" />
                <Input type="number" value={weeklySalary} onChange={(e) => setWeeklySalary(Number(e.target.value))} className="pl-10" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-warm-700 mb-2">State</label>
              <select value={state} onChange={(e) => setState(e.target.value)} className="w-full px-3 py-2 border border-warm-200 rounded-lg">
                {Object.keys(stateLeaveData).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-warm-700 mb-2">PTO Days</label>
              <Input type="number" value={ptoDays} onChange={(e) => setPtoDays(Number(e.target.value))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-warm-700 mb-2">Employer Size</label>
              <select value={employerSize} onChange={(e) => setEmployerSize(e.target.value)} className="w-full px-3 py-2 border border-warm-200 rounded-lg">
                <option value="50+">50+ employees (FMLA)</option>
                <option value="Under 50">Under 50</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-emerald-500 text-white">
          <CardContent className="p-6">
            <div className="text-sm opacity-90 mb-1">Paid Leave</div>
            <div className="text-3xl font-bold">{paidWeeks} weeks</div>
            <div className="text-sm opacity-75 mt-2">${totalPaid.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-warm-500 mb-1">Weekly Benefit</div>
            <div className="text-2xl font-bold text-warm-900">${Math.round(weeklyBenefit).toLocaleString()}</div>
            <div className="text-sm text-warm-400 mt-2">{stateData.percentWage}% of salary</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-warm-500 mb-1">Unpaid Weeks</div>
            <div className="text-2xl font-bold text-accent-600">{unpaidWeeks} weeks</div>
            <div className="text-sm text-warm-400 mt-2">${(unpaidWeeks * weeklySalary).toLocaleString()} gap</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary-500" />
            {stateData.programName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-warm-50 rounded-xl">
            <h4 className="font-medium text-warm-900 mb-2 flex items-center gap-2">
              <Info className="w-4 h-4" /> Requirements
            </h4>
            <p className="text-sm text-warm-600">{stateData.requirements}</p>
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>FMLA protects your job for 12 weeks</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Health insurance continues during leave</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
