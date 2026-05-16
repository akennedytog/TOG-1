'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  Smartphone, 
  CheckCircle2, 
  XCircle,
  Clock,
  AlertCircle,
  Baby,
  DollarSign,
  Heart
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NotificationSetting {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  icon: React.ReactNode;
  category: 'task' | 'health' | 'financial' | 'general';
}

export function PushNotificationSettings() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [settings, setSettings] = useState<NotificationSetting[]>([
    {
      id: 'task-reminders',
      name: 'Task Reminders',
      description: 'Get notified when tasks are due',
      enabled: true,
      icon: <Bell className="w-5 h-5" />,
      category: 'task'
    },
    {
      id: 'kick-reminders',
      name: 'Kick Counter Reminders',
      description: 'Daily reminders to track baby kicks',
      enabled: true,
      icon: <Heart className="w-5 h-5" />,
      category: 'health'
    },
    {
      id: 'contraction-alerts',
      name: 'Contraction Alerts',
      description: 'Alert when contractions are 5 min apart',
      enabled: true,
      icon: <AlertCircle className="w-5 h-5" />,
      category: 'health'
    },
    {
      id: 'goal-milestones',
      name: 'Savings Milestones',
      description: 'Celebrate when you hit 50%, 75%, 100% of goals',
      enabled: true,
      icon: <DollarSign className="w-5 h-5" />,
      category: 'financial'
    },
    {
      id: 'weekly-summary',
      name: 'Weekly Summary',
      description: 'Sunday evening recap of your week',
      enabled: false,
      icon: <Clock className="w-5 h-5" />,
      category: 'general'
    },
    {
      id: 'partner-activity',
      name: 'Partner Activity',
      description: 'When family members add expenses or complete tasks',
      enabled: true,
      icon: <Baby className="w-5 h-5" />,
      category: 'general'
    },
  ]);

  const [quietHours, setQuietHours] = useState({ start: '22:00', end: '07:00' });
  const [testStatus, setTestStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  const requestPermission = async () => {
    if ('Notification' in window) {
      const result = await Notification.requestPermission();
      setPermission(result);
    }
  };

  const toggleSetting = (id: string) => {
    setSettings(settings.map(s => 
      s.id === id ? { ...s, enabled: !s.enabled } : s
    ));
  };

  const sendTestNotification = async () => {
    setTestStatus('sending');
    
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('BabyNest Test', {
        body: 'Push notifications are working! 🎉',
        icon: '/icon.png',
        badge: '/badge.png',
        tag: 'test',
      });
      setTestStatus('sent');
      setTimeout(() => setTestStatus('idle'), 3000);
    } else {
      alert('Please enable notifications first');
      setTestStatus('idle');
    }
  };

  const getCategoryLabel = (cat: string) => {
    const labels: Record<string, string> = {
      task: 'Tasks',
      health: 'Health',
      financial: 'Financial',
      general: 'General'
    };
    return labels[cat] || cat;
  };

  const categories = [...new Set(settings.map(s => s.category))];

  return (
    <div className="space-y-6">
      {/* Permission Status */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center",
                permission === 'granted' ? "bg-emerald-100 text-emerald-600" : "bg-warm-100 text-warm-500"
              )}>
                <Smartphone className="w-6 h-6" />
              </div>
              
              <div>
                <h3 className="font-semibold text-warm-900">Browser Notifications</h3>
                <p className="text-sm text-warm-600">
                  {permission === 'granted' 
                    ? 'Notifications are enabled and working'
                    : permission === 'denied'
                    ? 'Notifications are blocked. Please enable in browser settings.'
                    : 'Enable notifications to stay updated'}
                </p>
              </div>
            </div>
            
            {permission !== 'granted' && (
              <Button onClick={requestPermission}>
                {permission === 'denied' ? 'Open Settings' : 'Enable'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quiet Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Quiet Hours
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm text-warm-600 mb-1">Start</label>
              <input
                type="time"
                value={quietHours.start}
                onChange={(e) => setQuietHours({...quietHours, start: e.target.value})}
                className="w-full px-3 py-2 border border-warm-200 rounded-lg"
              />
            </div>
            
            <span className="text-warm-400 mt-6">to</span>
            
            <div className="flex-1">
              <label className="block text-sm text-warm-600 mb-1">End</label>
              <input
                type="time"
                value={quietHours.end}
                onChange={(e) => setQuietHours({...quietHours, end: e.target.value})}
                className="w-full px-3 py-2 border border-warm-200 rounded-lg"
              />
            </div>
          </div>
          
          <p className="text-sm text-warm-500 mt-4">
            Notifications won't be sent during quiet hours (except urgent alerts)
          </p>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Types</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {categories.map(category => (
            <div key={category}>
              <h3 className="text-sm font-medium text-warm-500 uppercase tracking-wide mb-3">
                {getCategoryLabel(category)}
              </h3>
              
              <div className="space-y-3">
                {settings.filter(s => s.category === category).map(setting => (
                  <div key={setting.id} className="flex items-center justify-between p-4 border border-warm-100 rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-warm-50 rounded-lg flex items-center justify-center text-warm-600">
                        {setting.icon}
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-warm-900">{setting.name}</h4>
                        <p className="text-sm text-warm-500">{setting.description}</p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => toggleSetting(setting.id)}
                      className={cn(
                        "w-12 h-6 rounded-full transition-colors relative",
                        setting.enabled ? "bg-primary-500" : "bg-warm-200"
                      )}
                    >
                      <span className={cn(
                        "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                        setting.enabled ? "left-7" : "left-1"
                      )} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Test Button */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-warm-900">Test Notifications</h3>
              <p className="text-sm text-warm-600">Send a test notification to verify everything is working</p>
            </div>
            
            <Button 
              onClick={sendTestNotification}
              disabled={testStatus !== 'idle'}
              variant={testStatus === 'sent' ? 'secondary' : 'primary'}
            >
              {testStatus === 'idle' && 'Send Test'}
              {testStatus === 'sending' && 'Sending...'}
              {testStatus === 'sent' && (
                <><CheckCircle2 className="w-4 h-4 mr-2" /> Sent!</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
