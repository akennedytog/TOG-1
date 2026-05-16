'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  Heart, 
  Clock, 
  Play, 
  Pause, 
  RotateCcw,
  Baby,
  TrendingUp,
  History,
  Timer,
  Footprints
} from 'lucide-react';
import { formatDuration, intervalToDuration } from 'date-fns';
import { cn } from '@/lib/utils';

// Contraction Timer Types
interface Contraction {
  id: string;
  startTime: Date;
  endTime: Date | null;
  duration: number;
  intensity: 'mild' | 'moderate' | 'strong';
}

// Kick Counter Types
interface KickSession {
  id: string;
  date: Date;
  kicks: number;
  duration: number;
  completed: boolean;
}

export function PregnancyTracker() {
  const [activeTab, setActiveTab] = useState('contractions');
  
  // Contraction Timer State
  const [isContracting, setIsContracting] = useState(false);
  const [contractions, setContractions] = useState<Contraction[]>([]);
  const [currentContraction, setCurrentContraction] = useState<Contraction | null>(null);
  const [lastContractionTime, setLastContractionTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  // Kick Counter State
  const [kickCount, setKickCount] = useState(0);
  const [kickSessionStart, setKickSessionStart] = useState<Date | null>(null);
  const [kickSessions, setKickSessions] = useState<KickSession[]>([]);
  const [isKickSessionActive, setIsKickSessionActive] = useState(false);
  const [kickElapsedTime, setKickElapsedTime] = useState(0);

  // Contraction Timer Effects
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isContracting && currentContraction) {
      interval = setInterval(() => {
        setElapsedTime(Date.now() - currentContraction.startTime.getTime());
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isContracting, currentContraction]);

  // Kick Counter Timer Effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isKickSessionActive && kickSessionStart) {
      interval = setInterval(() => {
        setKickElapsedTime(Date.now() - kickSessionStart.getTime());
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isKickSessionActive, kickSessionStart]);

  const startContraction = () => {
    const now = new Date();
    if (lastContractionTime) {
      const timeSinceLast = (now.getTime() - lastContractionTime.getTime()) / 1000 / 60;
      if (timeSinceLast < 1) {
        return;
      }
    }
    
    const newContraction: Contraction = {
      id: Date.now().toString(),
      startTime: now,
      endTime: null,
      duration: 0,
      intensity: 'moderate',
    };
    
    setCurrentContraction(newContraction);
    setIsContracting(true);
    setElapsedTime(0);
  };

  const stopContraction = () => {
    if (!currentContraction) return;
    
    const now = new Date();
    const duration = now.getTime() - currentContraction.startTime.getTime();
    
    const completedContraction: Contraction = {
      ...currentContraction,
      endTime: now,
      duration,
      intensity: duration > 60000 ? 'strong' : duration > 30000 ? 'moderate' : 'mild',
    };
    
    setContractions(prev => [completedContraction, ...prev].slice(0, 20));
    setLastContractionTime(now);
    setIsContracting(false);
    setCurrentContraction(null);
    setElapsedTime(0);
  };

  const resetContractions = () => {
    setContractions([]);
    setLastContractionTime(null);
    setIsContracting(false);
    setCurrentContraction(null);
    setElapsedTime(0);
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getAverageDuration = () => {
    if (contractions.length === 0) return 0;
    const total = contractions.reduce((sum, c) => sum + c.duration, 0);
    return Math.round(total / contractions.length / 1000);
  };

  const getAverageInterval = () => {
    if (contractions.length < 2) return 0;
    let totalInterval = 0;
    for (let i = 0; i < contractions.length - 1; i++) {
      totalInterval += contractions[i].startTime.getTime() - contractions[i + 1].startTime.getTime();
    }
    return Math.round(totalInterval / (contractions.length - 1) / 1000 / 60);
  };

  // Kick Counter Functions
  const startKickSession = () => {
    setKickSessionStart(new Date());
    setIsKickSessionActive(true);
    setKickCount(0);
    setKickElapsedTime(0);
  };

  const recordKick = () => {
    setKickCount(prev => prev + 1);
  };

  const endKickSession = () => {
    if (!kickSessionStart) return;
    
    const duration = Date.now() - kickSessionStart.getTime();
    const session: KickSession = {
      id: Date.now().toString(),
      date: new Date(),
      kicks: kickCount,
      duration,
      completed: kickCount >= 10,
    };
    
    setKickSessions(prev => [session, ...prev].slice(0, 30));
    setIsKickSessionActive(false);
    setKickSessionStart(null);
    setKickElapsedTime(0);
  };

  const resetKickSession = () => {
    setKickCount(0);
    setKickElapsedTime(0);
    setIsKickSessionActive(false);
    setKickSessionStart(null);
  };

  return (
    <Card className="border-warm-100 shadow-soft">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl flex items-center gap-2">
          <Baby className="w-5 h-5 text-primary-500" />
          Pregnancy Tracking
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="contractions" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Contractions
            </TabsTrigger>
            <TabsTrigger value="kicks" className="flex items-center gap-2">
              <Footprints className="w-4 h-4" />
              Kick Counter
            </TabsTrigger>
          </TabsList>

          {/* Contraction Timer */}
          <TabsContent value="contractions" className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-indigo-700">
                  {contractions.length}
                </div>
                <div className="text-xs text-indigo-600">Total</div>
              </div>
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-indigo-700">
                  {getAverageDuration()}s
                </div>
                <div className="text-xs text-indigo-600">Avg Duration</div>
              </div>
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-indigo-700">
                  {getAverageInterval()}m
                </div>
                <div className="text-xs text-indigo-600">Avg Interval</div>
              </div>
            </div>

            {/* Active Timer */}
            <div className={cn(
              "rounded-2xl p-8 text-center transition-all duration-500",
              isContracting 
                ? "bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-glow" 
                : "bg-gradient-to-br from-warm-100 to-warm-50"
            )}>
              <div className="text-6xl font-mono font-bold mb-4">
                {formatTime(elapsedTime)}
              </div>
              <div className="text-sm opacity-80 mb-6">
                {isContracting ? "Contraction in progress..." : "Ready to start"}
              </div>
              
              <div className="flex justify-center gap-3">
                {!isContracting ? (
                  <Button 
                    onClick={startContraction}
                    className="bg-white text-indigo-600 hover:bg-white/90 shadow-soft"
                    size="lg"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Start Contraction
                  </Button>
                ) : (
                  <Button 
                    onClick={stopContraction}
                    variant="secondary"
                    size="lg"
                    className="bg-white/20 text-white hover:bg-white/30 border-0"
                  >
                    <Pause className="w-5 h-5 mr-2" />
                    Stop
                  </Button>
                )}
                
                {contractions.length > 0 && (
                  <Button 
                    onClick={resetContractions}
                    variant="ghost"
                    size="lg"
                    className={isContracting ? "text-white/70 hover:text-white" : ""}
                  >
                    <RotateCcw className="w-5 h-5 mr-2" />
                    Reset
                  </Button>
                )}
              </div>
            </div>

            {/* Contraction History */}
            {contractions.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold text-warm-800 flex items-center gap-2">
                  <History className="w-4 h-4" />
                  Recent Contractions
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {contractions.slice(0, 10).map((contraction, index) => (
                    <div 
                      key={contraction.id}
                      className="flex items-center justify-between p-3 bg-warm-50 rounded-lg text-sm"
                    >
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className={cn(
                          contraction.intensity === 'strong' ? 'border-red-300 text-red-700' :
                          contraction.intensity === 'moderate' ? 'border-amber-300 text-amber-700' :
                          'border-green-300 text-green-700'
                        )}>
                          {contraction.intensity}
                        </Badge>
                        <span className="font-mono">
                          {formatTime(contraction.duration)}
                        </span>
                      </div>
                      <span className="text-warm-500 text-xs">
                        {index === 0 ? 'Just now' : `${Math.round((Date.now() - contraction.startTime.getTime()) / 60000)}m ago`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Kick Counter */}
          <TabsContent value="kicks" className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-rose-700">
                  {kickSessions.length}
                </div>
                <div className="text-xs text-rose-600">Sessions</div>
              </div>
              <div className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-rose-700">
                  {kickSessions.reduce((sum, s) => sum + s.kicks, 0)}
                </div>
                <div className="text-xs text-rose-600">Total Kicks</div>
              </div>
              <div className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-rose-700">
                  {kickSessions.filter(s => s.completed).length}
                </div>
                <div className="text-xs text-rose-600">Completed</div>
              </div>
            </div>

            {/* Active Kick Session */}
            {isKickSessionActive ? (
              <div className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-2xl p-8 text-center text-white shadow-glow">
                <div className="text-sm opacity-80 mb-2">Session Time</div>
                <div className="text-3xl font-mono font-bold mb-6">
                  {formatTime(kickElapsedTime)}
                </div>
                
                <div className="bg-white/20 rounded-2xl p-6 mb-6">
                  <div className="text-sm opacity-80 mb-2">Kicks Counted</div>
                  <div className="text-6xl font-bold">{kickCount}</div>
                  <div className="text-sm opacity-80 mt-2">
                    {kickCount >= 10 ? "✓ Goal reached!" : `${10 - kickCount} more to reach 10`}
                  </div>
                </div>
                
                <div className="flex justify-center gap-3">
                  <Button 
                    onClick={recordKick}
                    className="bg-white text-rose-600 hover:bg-white/90 shadow-soft h-14 px-8"
                  >
                    <Heart className="w-5 h-5 mr-2" />
                    Record Kick
                  </Button>
                  <Button 
                    onClick={endKickSession}
                    variant="secondary"
                    className="bg-white/20 text-white hover:bg-white/30 border-0 h-14"
                  >
                    End Session
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-warm-100 to-warm-50 rounded-2xl p-8 text-center">
                <Footprints className="w-16 h-16 text-warm-400 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-warm-800 mb-2">
                  Start a Kick Counting Session
                </h4>
                <p className="text-warm-600 mb-6 max-w-sm mx-auto">
                  Count baby&apos;s movements. Most healthcare providers recommend counting until you reach 10 kicks.
                </p>
                <Button 
                  onClick={startKickSession}
                  className="bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-soft"
                  size="lg"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Start Session
                </Button>
              </div>
            )}

            {/* Session History */}
            {kickSessions.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold text-warm-800 flex items-center gap-2">
                  <History className="w-4 h-4" />
                  Recent Sessions
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {kickSessions.slice(0, 10).map((session) => (
                    <div 
                      key={session.id}
                      className="flex items-center justify-between p-3 bg-warm-50 rounded-lg text-sm"
                    >
                      <div className="flex items-center gap-3">
                        <Badge 
                          variant={session.completed ? "default" : "outline"}
                          className={session.completed ? "bg-rose-500" : ""}
                        >
                          {session.kicks} kicks
                        </Badge>
                        <span className="text-warm-600">
                          {formatTime(session.duration)}
                        </span>
                      </div>
                      <span className="text-warm-500 text-xs">
                        {session.date.toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
