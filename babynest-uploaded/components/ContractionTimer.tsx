'use client';

import { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  Play, 
  Pause, 
  RotateCcw,
  Clock
} from 'lucide-react';

interface Contraction {
  startTime: Date;
  endTime?: Date;
  duration?: number;
}

export function ContractionTimer() {
  const [contractions, setContractions] = useState<Contraction[]>([]);
  const [isActive, setIsActive] = useState(false);
  const [currentStart, setCurrentStart] = useState<Date | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && currentStart) {
      interval = setInterval(() => {
        setElapsed(Math.floor((Date.now() - currentStart.getTime()) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, currentStart]);

  const startContraction = useCallback(() => {
    const now = new Date();
    setCurrentStart(now);
    setIsActive(true);
    setElapsed(0);
  }, []);

  const endContraction = useCallback(() => {
    if (currentStart) {
      const endTime = new Date();
      const duration = Math.floor((endTime.getTime() - currentStart.getTime()) / 1000);
      
      setContractions(prev => [{
        startTime: currentStart,
        endTime,
        duration
      }, ...prev].slice(0, 10));
      
      setIsActive(false);
      setCurrentStart(null);
      setElapsed(0);
    }
  }, [currentStart]);

  const resetAll = () => {
    setContractions([]);
    setIsActive(false);
    setCurrentStart(null);
    setElapsed(0);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getFrequency = () => {
    if (contractions.length < 2) return null;
    const lastTwo = contractions.slice(0, 2);
    const timeBetween = Math.floor(
      (lastTwo[0].startTime.getTime() - lastTwo[1].startTime.getTime()) / 60000
    );
    return timeBetween;
  };

  const getAverageDuration = () => {
    if (contractions.length === 0) return 0;
    const total = contractions.reduce((sum, c) => sum + (c.duration || 0), 0);
    return Math.floor(total / contractions.length);
  };

  const frequency = getFrequency();
  const avgDuration = getAverageDuration();

  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100">
        <CardTitle className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-xl flex items-center justify-center shadow-soft">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-warm-900">Contraction Timer</div>
            <div className="text-xs font-normal text-warm-500">Track labor contractions</div>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <div className={`w-40 h-40 rounded-full flex items-center justify-center ${
              isActive 
                ? 'bg-gradient-to-br from-indigo-400 to-purple-500 shadow-glow' 
                : 'bg-warm-100'
            }`}>
              <div className="text-center">
                <div className={`text-4xl font-bold ${isActive ? 'text-white' : 'text-warm-600'}`}>
                  {formatDuration(elapsed)}
                </div>
                <div className={`text-sm ${isActive ? 'text-indigo-100' : 'text-warm-400'}`}>
                  {isActive ? 'Contracting' : 'Ready'}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-4 mb-8">
          {!isActive ? (
            <Button
              onClick={startContraction}
              size="lg"
              className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-8"
            >
              <Play className="w-5 h-5 mr-2" />
              Start Contraction
            </Button>
          ) : (
            <Button
              onClick={endContraction}
              size="lg"
              variant="secondary"
              className="bg-red-500 hover:bg-red-600 text-white px-8"
            >
              <Pause className="w-5 h-5 mr-2" />
              Stop Contraction
            </Button>
          )}
          
          {contractions.length > 0 && (
            <Button onClick={resetAll} variant="ghost" size="lg">
              <RotateCcw className="w-5 h-5" />
            </Button>
          )}
        </div>

        {(contractions.length > 0 || isActive) && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-warm-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-indigo-600">{contractions.length}</div>
              <div className="text-xs text-warm-500">Contractions</div>
            </div>
            
            {frequency !== null && (
              <div className="bg-warm-50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{frequency}</div>
                <div className="text-xs text-warm-500">Minutes Apart</div>
              </div>
            )}
            
            {avgDuration > 0 && (
              <div className="bg-warm-50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-emerald-600">{formatDuration(avgDuration)}</div>
                <div className="text-xs text-warm-500">Avg Duration</div>
              </div>
            )}
          </div>
        )}

        {contractions.length >= 3 && frequency !== null && (
          <div className={`p-4 rounded-xl mb-6 ${
            frequency <= 5 
              ? 'bg-red-50 border border-red-200' 
              : frequency <= 10 
                ? 'bg-amber-50 border border-amber-200' 
                : 'bg-emerald-50 border border-emerald-200'
          }`}>
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                frequency <= 5 ? 'bg-red-100' : frequency <= 10 ? 'bg-amber-100' : 'bg-emerald-100'
              }`}>
                <Clock className={`w-4 h-4 ${
                  frequency <= 5 ? 'text-red-600' : frequency <= 10 ? 'text-amber-600' : 'text-emerald-600'
                }`} />
              </div>
              <div>
                <h4 className={`font-semibold ${
                  frequency <= 5 ? 'text-red-800' : frequency <= 10 ? 'text-amber-800' : 'text-emerald-800'
                }`}>
                  {frequency <= 5 
                    ? 'Time to go to the hospital!' 
                    : frequency <= 10 
                      ? 'Getting close - prepare to leave' 
                      : 'Still early labor - keep timing'}
                </h4>
                <p className={`text-sm mt-1 ${
                  frequency <= 5 ? 'text-red-700' : frequency <= 10 ? 'text-amber-700' : 'text-emerald-700'
                }`}>
                  {frequency <= 5 
                    ? 'Contractions are 5 minutes apart or less. Call your provider and head to the hospital!' 
                    : frequency <= 10 
                      ? 'Pack your bag, call your support person, and get ready to leave soon.' 
                      : 'The 5-1-1 rule: Go when contractions are 5 min apart, 1 min long, for 1 hour.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {contractions.length > 0 && (
          <div className="border-t border-warm-100 pt-4">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="text-sm text-warm-600 hover:text-warm-900 font-medium"
            >
              {showHistory ? 'Hide' : 'Show'} History ({contractions.length})
            </button>
            
            {showHistory && (
              <div className="mt-4 space-y-2">
                {contractions.map((c, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-warm-50 rounded-lg">
                    <div className="text-sm">
                      <span className="font-medium text-warm-700">
                        {c.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {c.duration && (
                        <span className="text-warm-500 ml-2">
                          • {formatDuration(c.duration)}
                        </span>
                      )}
                    </div>
                    {i < contractions.length - 1 && (
                      <div className="text-xs text-warm-400">
                        {Math.floor((contractions[i].startTime.getTime() - contractions[i + 1].startTime.getTime()) / 60000)} min later
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
