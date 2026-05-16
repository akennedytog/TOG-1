'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Baby, 
  Heart, 
  Play, 
  RotateCcw,
  History
} from 'lucide-react';

interface KickSession {
  date: Date;
  count: number;
  duration: number;
  completed: boolean;
}

export function KickCounter() {
  const [kicks, setKicks] = useState<number>(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [sessions, setSessions] = useState<KickSession[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const startSession = useCallback(() => {
    setStartTime(new Date());
    setIsActive(true);
    setKicks(0);
  }, []);

  const addKick = useCallback(() => {
    setKicks(prev => prev + 1);
  }, []);

  const endSession = useCallback(() => {
    if (startTime) {
      const endTime = new Date();
      const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 60000);
      
      setSessions(prev => [{
        date: endTime,
        count: kicks,
        duration,
        completed: kicks >= 10
      }, ...prev].slice(0, 7));
      
      setIsActive(false);
      setStartTime(null);
    }
  }, [startTime, kicks]);

  const resetAll = () => {
    setKicks(0);
    setStartTime(null);
    setIsActive(false);
    setSessions([]);
  };

  const getDailyAverage = () => {
    if (sessions.length === 0) return 0;
    const total = sessions.reduce((sum, s) => sum + s.count, 0);
    return Math.round(total / sessions.length);
  };

  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-rose-50 to-pink-50 border-b border-rose-100">
        <CardTitle className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-rose-400 to-pink-500 rounded-xl flex items-center justify-center shadow-soft">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-warm-900">Kick Counter</div>
            <div className="text-xs font-normal text-warm-500">Track baby movements</div>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-xl">
          <p className="text-sm text-rose-800">
            <strong>How to count kicks:</strong> Choose a time when baby is usually active. 
            Count each movement (kicks, rolls, flutters). Most babies move at least <strong>10 times in 2 hours</strong>.
          </p>
        </div>

        <div className="text-center mb-8">
          <div className="relative inline-flex items-center justify-center w-40 h-40">
            <div className={`absolute inset-0 rounded-full ${
              isActive ? 'bg-gradient-to-br from-rose-400 to-pink-500 shadow-glow' : 'bg-warm-100'
            }`} />
            
            <div className="relative text-center">
              <div className={`text-6xl font-bold ${isActive ? 'text-white' : 'text-warm-600'}`}>
                {kicks}
              </div>
              <div className={`text-sm ${isActive ? 'text-rose-100' : 'text-warm-400'}`}>
                kicks
              </div>
            </div>
            
            {isActive && kicks >= 10 && (
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-center gap-4 mb-8">
          {!isActive ? (
            <Button
              onClick={startSession}
              size="lg"
              className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white px-8"
            >
              <Play className="w-5 h-5 mr-2" />
              Start Session
            </Button>
          ) : (
            <div className="flex gap-3">
              <Button
                onClick={addKick}
                size="lg"
                className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white px-8"
              >
                <Heart className="w-5 h-5 mr-2" />
                Count Kick
              </Button>
              
              <Button
                onClick={endSession}
                variant="outline"
                size="lg"
              >
                End Session
              </Button>
            </div>
          )}
          
          {(kicks > 0 || sessions.length > 0) && (
            <Button
              onClick={resetAll}
              variant="ghost"
              size="lg"
            >
              <RotateCcw className="w-5 h-5" />
            </Button>
          )}
        </div>

        {sessions.length > 0 && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-warm-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-rose-600">{getDailyAverage()}</div>
              <div className="text-xs text-warm-500">Avg Kicks</div>
            </div>
            
            <div className="bg-warm-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-pink-600">{sessions.filter(s => s.completed).length}</div>
              <div className="text-xs text-warm-500">Completed Sessions</div>
            </div>
          </div>
        )}

        {isActive && kicks >= 10 && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Baby className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <h4 className="font-semibold text-emerald-800">Great job! 🎉</h4>
                <p className="text-sm text-emerald-700">
                  Baby is active and healthy! You can end the session or keep counting.
                </p>
              </div>
            </div>
          </div>
        )}

        {sessions.length > 0 && (
          <div className="border-t border-warm-100 pt-4">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="text-sm text-warm-600 hover:text-warm-900 font-medium flex items-center gap-1"
            >
              <History className="w-4 h-4" />
              {showHistory ? 'Hide' : 'Show'} History
            </button>
            
            {showHistory && (
              <div className="mt-4 space-y-2">
                {sessions.map((s, i) => (
                  <div key={i} className={`flex items-center justify-between p-3 rounded-lg ${
                    s.completed ? 'bg-emerald-50' : 'bg-warm-50'
                  }`}>
                    <div className="text-sm">
                      <span className="font-medium text-warm-700">
                        {s.date.toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                      <span className="text-warm-400 mx-2">•</span>
                      <span className="text-warm-600">
                        {s.count} kicks in {s.duration} min
                      </span>
                    </div>
                    {s.completed && (
                      <span className="text-xs text-emerald-600 font-medium">&gt;10 ✓</span>
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
