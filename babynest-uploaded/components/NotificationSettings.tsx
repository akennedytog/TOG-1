'use client';

import { useState, useEffect } from 'react';
import { Bell, Mail, Clock, Check, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface NotificationPreferences {
  task_reminders: boolean;
  task_due_alerts: boolean;
  weekly_digest: boolean;
  daily_digest: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
}

const defaultPreferences: NotificationPreferences = {
  task_reminders: true,
  task_due_alerts: true,
  weekly_digest: true,
  daily_digest: false,
  quiet_hours_start: '20:00',
  quiet_hours_end: '08:00',
};

export function NotificationSettings({ userId }: { userId: string }) {
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [testEmailStatus, setTestEmailStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  useEffect(() => {
    loadPreferences();
  }, [userId]);

  const loadPreferences = async () => {
    try {
      const response = await fetch(`/api/notifications/send?userId=${userId}`);
      const data = await response.json();
      if (data.preferences) {
        setPreferences({ ...defaultPreferences, ...data.preferences });
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const savePreferences = async () => {
    setIsSaving(true);
    setSaveMessage('');

    try {
      const response = await fetch('/api/notifications/send', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, preferences }),
      });

      const data = await response.json();
      if (data.success) {
        setSaveMessage('Preferences saved!');
        setTimeout(() => setSaveMessage(''), 3000);
      } else {
        setSaveMessage('Failed to save. Please try again.');
      }
    } catch (error) {
      setSaveMessage('Failed to save. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const sendTestEmail = async () => {
    setTestEmailStatus('sending');
    try {
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'test', userId }),
      });

      const data = await response.json();
      setTestEmailStatus(data.success ? 'sent' : 'error');
      setTimeout(() => setTestEmailStatus('idle'), 3000);
    } catch (error) {
      setTestEmailStatus('error');
      setTimeout(() => setTestEmailStatus('idle'), 3000);
    }
  };

  const updatePreference = (key: keyof NotificationPreferences, value: boolean | string) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <Bell className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Email Notifications</h2>
            <p className="text-indigo-100 text-sm">Manage when and how we email you</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Email Type Toggles */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Email Types
          </h3>

          <ToggleRow
            id="task_reminders"
            label="Task Reminders"
            description="Weekly summary of tasks due soon"
            checked={preferences.task_reminders}
            onChange={(checked) => updatePreference('task_reminders', checked)}
          />

          <ToggleRow
            id="task_due_alerts"
            label="Task Due Alerts"
            description="Email when a task is due tomorrow"
            checked={preferences.task_due_alerts}
            onChange={(checked) => updatePreference('task_due_alerts', checked)}
          />

          <ToggleRow
            id="weekly_digest"
            label="Weekly Digest"
            description="Every Sunday with your week's progress and upcoming tasks"
            checked={preferences.weekly_digest}
            onChange={(checked) => updatePreference('weekly_digest', checked)}
            disabled={preferences.daily_digest}
          />

          <ToggleRow
            id="daily_digest"
            label="Daily Digest"
            description="Daily summary instead of weekly (experimental)"
            checked={preferences.daily_digest}
            onChange={(checked) => updatePreference('daily_digest', checked)}
            disabled={preferences.weekly_digest}
          />
        </div>

        {/* Quiet Hours */}
        <div className="pt-4 border-t border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4" />
            Quiet Hours
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            We won't send non-urgent emails during these hours
          </p>

          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-500 mb-1">Start</label>
              <input
                type="time"
                value={preferences.quiet_hours_start}
                onChange={(e) => updatePreference('quiet_hours_start', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div className="text-gray-400 pt-5">to</div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-500 mb-1">End</label>
              <input
                type="time"
                value={preferences.quiet_hours_end}
                onChange={(e) => updatePreference('quiet_hours_end', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row gap-3">
          <button
            onClick={savePreferences}
            disabled={isSaving}
            className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : saveMessage === 'Preferences saved!' ? (
              <>
                <Check className="w-4 h-4" />
                Saved!
              </>
            ) : (
              'Save Preferences'
            )}
          </button>

          <button
            onClick={sendTestEmail}
            disabled={testEmailStatus === 'sending'}
            className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {testEmailStatus === 'sending' ? (
              <>
                <div className="w-4 h-4 border-2 border-gray-400/30 border-t-gray-600 rounded-full animate-spin" />
                Sending...
              </>
            ) : testEmailStatus === 'sent' ? (
              <>
                <Check className="w-4 h-4 text-green-600" />
                Test email sent!
              </>
            ) : testEmailStatus === 'error' ? (
              <>
                <AlertCircle className="w-4 h-4 text-red-500" />
                Failed
              </>
            ) : (
              'Send Test Email'
            )}
          </button>
        </div>

        {saveMessage && saveMessage !== 'Preferences saved!' && (
          <p className="text-sm text-red-600 text-center">{saveMessage}</p>
        )}
      </div>
    </motion.div>
  );
}

function ToggleRow({
  id,
  label,
  description,
  checked,
  onChange,
  disabled = false,
}: {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between py-3 ${disabled ? 'opacity-50' : ''}`}>
      <div>
        <label htmlFor={id} className="block font-medium text-gray-900 cursor-pointer">
          {label}
        </label>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
          checked ? 'bg-indigo-600' : 'bg-gray-200'
        } ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}

export default NotificationSettings;
