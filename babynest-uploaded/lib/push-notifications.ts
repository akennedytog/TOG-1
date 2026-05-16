import { createClient } from '@supabase/supabase-js';

// Push notification types
export type NotificationType = 
  | 'task_reminder'
  | 'kick_counter'
  | 'contraction_alert'
  | 'weekly_summary'
  | 'goal_milestone'
  | 'partner_activity'
  | 'test';

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface PushNotificationData {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  tag?: string;
  requireInteraction?: boolean;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  data?: {
    url?: string;
    taskId?: string;
    type?: NotificationType;
    [key: string]: unknown;
  };
  silent?: boolean;
  vibrate?: number[];
  timestamp?: number;
  renotify?: boolean;
}

export interface TaskReminderPayload {
  taskId: string;
  taskTitle: string;
  dueDate: string;
}

export interface KickCounterPayload {
  message?: string;
}

export interface ContractionAlertPayload {
  interval: number;
  message: string;
}

export interface WeeklySummaryPayload {
  week: number;
  completedTasks: number;
  totalTasks: number;
}

export interface GoalMilestonePayload {
  goalName: string;
  percentage: number;
  currentAmount: number;
  targetAmount: number;
}

export interface PartnerActivityPayload {
  partnerName: string;
  activity: string;
  amount?: number;
  goalName?: string;
}

// Convert the application server key to Uint8Array
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  
  return outputArray;
}

// Check if push notifications are supported in the browser
export function isPushNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 
         'serviceWorker' in navigator && 
         'PushManager' in window;
}

// Register the service worker
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    console.error('Service workers are not supported in this browser');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/service-worker.js');
    console.log('Service Worker registered with scope:', registration.scope);
    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return null;
  }
}

// Request notification permission
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    throw new Error('This browser does not support notifications');
  }

  const permission = await Notification.requestPermission();
  console.log('Notification permission:', permission);
  return permission;
}

// Get the current notification permission status
export function getNotificationPermission(): NotificationPermission | null {
  if (!('Notification' in window)) {
    return null;
  }
  return Notification.permission;
}

// Subscribe to push notifications
export async function subscribeToPush(
  registration: ServiceWorkerRegistration,
  applicationServerKey: string
): Promise<PushSubscription | null> {
  try {
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(applicationServerKey) as unknown as BufferSource,
    });

    console.log('Push subscription:', subscription);
    
    return {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: arrayBufferToBase64(subscription.getKey('p256dh')!),
        auth: arrayBufferToBase64(subscription.getKey('auth')!),
      },
    };
  } catch (error) {
    console.error('Failed to subscribe to push notifications:', error);
    return null;
  }
}

// Unsubscribe from push notifications
export async function unsubscribeFromPush(
  registration: ServiceWorkerRegistration
): Promise<boolean> {
  try {
    const subscription = await registration.pushManager.getSubscription();
    
    if (subscription) {
      await subscription.unsubscribe();
      console.log('Unsubscribed from push notifications');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Failed to unsubscribe from push notifications:', error);
    return false;
  }
}

// Helper function to convert ArrayBuffer to base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  
  return btoa(binary);
}

// Send subscription to server
export async function savePushSubscription(
  subscription: PushSubscription
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscription),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return { success: false, error: data.error || 'Failed to save subscription' };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error saving push subscription:', error);
    return { success: false, error: 'Network error' };
  }
}

// Remove subscription from server
export async function removePushSubscription(): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('/api/push/unsubscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      return { success: false, error: data.error || 'Failed to remove subscription' };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error removing push subscription:', error);
    return { success: false, error: 'Network error' };
  }
}

// Send a test notification
export async function sendTestNotification(): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('/api/push/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'test',
        title: 'Test Notification',
        body: 'Push notifications are working! 🎉',
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return { success: false, error: data.error || 'Failed to send test notification' };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error sending test notification:', error);
    return { success: false, error: 'Network error' };
  }
}

// Check if currently in quiet hours
export function isInQuietHours(start: string = '22:00', end: string = '07:00'): boolean {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTime = currentHour * 60 + currentMinute;

  const [startHour, startMinute] = start.split(':').map(Number);
  const [endHour, endMinute] = end.split(':').map(Number);
  
  const startTime = startHour * 60 + startMinute;
  const endTime = endHour * 60 + endMinute;

  // Handle cases where quiet hours span midnight
  if (startTime > endTime) {
    // Quiet hours span midnight (e.g., 22:00 - 07:00)
    return currentTime >= startTime || currentTime <= endTime;
  } else {
    // Quiet hours within same day (e.g., 14:00 - 16:00)
    return currentTime >= startTime && currentTime <= endTime;
  }
}

// Create notification payload based on type
export function createNotificationPayload(
  type: NotificationType,
  data: unknown
): PushNotificationData {
  const basePayload: PushNotificationData = {
    title: 'BabyNest',
    body: 'You have a new notification',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    tag: `babynest-${type}`,
    data: { type },
    vibrate: [200, 100, 200],
  };

  switch (type) {
    case 'task_reminder': {
      const taskData = data as TaskReminderPayload;
      return {
        ...basePayload,
        title: '📋 Task Due Tomorrow',
        body: `"${taskData.taskTitle}" is due on ${new Date(taskData.dueDate).toLocaleDateString()}`,
        tag: `task-${taskData.taskId}`,
        requireInteraction: true,
        actions: [
          { action: 'view', title: 'View Task' },
          { action: 'dismiss', title: 'Dismiss' },
        ],
        data: {
          ...basePayload.data,
          url: '/dashboard',
          taskId: taskData.taskId,
        },
      };
    }

    case 'kick_counter': {
      const kickData = data as KickCounterPayload;
      return {
        ...basePayload,
        title: '👶 Time for Kick Count!',
        body: kickData.message || 'It\'s time to count your baby\'s kicks. How active is baby right now?',
        requireInteraction: true,
        actions: [
          { action: 'open', title: 'Start Counting' },
          { action: 'dismiss', title: 'Later' },
        ],
        data: {
          ...basePayload.data,
          url: '/dashboard',
        },
      };
    }

    case 'contraction_alert': {
      const contractionData = data as ContractionAlertPayload;
      return {
        ...basePayload,
        title: '🚨 Contraction Alert!',
        body: contractionData.message || `Contractions are ${contractionData.interval} minutes apart. Time to head to the hospital!`,
        requireInteraction: true,
        vibrate: [300, 200, 300, 200, 500],
        actions: [
          { action: 'view', title: 'View Details' },
          { action: 'dismiss', title: 'Dismiss' },
        ],
        data: {
          ...basePayload.data,
          url: '/dashboard',
        },
      };
    }

    case 'weekly_summary': {
      const summaryData = data as WeeklySummaryPayload;
      const progress = Math.round((summaryData.completedTasks / summaryData.totalTasks) * 100);
      return {
        ...basePayload,
        title: `📊 Week ${summaryData.week} Summary`,
        body: `You've completed ${summaryData.completedTasks} of ${summaryData.totalTasks} tasks (${progress}%). Great progress!`,
        actions: [
          { action: 'view', title: 'View Summary' },
          { action: 'dismiss', title: 'Dismiss' },
        ],
        data: {
          ...basePayload.data,
          url: '/dashboard',
        },
      };
    }

    case 'goal_milestone': {
      const goalData = data as GoalMilestonePayload;
      return {
        ...basePayload,
        title: `🎉 ${goalData.percentage}% Milestone Reached!`,
        body: `You've saved $${goalData.currentAmount.toLocaleString()} of your $${goalData.targetAmount.toLocaleString()} ${goalData.goalName} goal!`,
        requireInteraction: true,
        actions: [
          { action: 'view', title: 'View Goal' },
          { action: 'dismiss', title: 'Awesome!' },
        ],
        data: {
          ...basePayload.data,
          url: '/dashboard',
        },
      };
    }

    case 'partner_activity': {
      const partnerData = data as PartnerActivityPayload;
      const amountText = partnerData.amount 
        ? `$${partnerData.amount.toLocaleString()}` 
        : '';
      const goalText = partnerData.goalName 
        ? ` to ${partnerData.goalName}` 
        : '';
      
      return {
        ...basePayload,
        title: '💑 Partner Update',
        body: `${partnerData.partnerName} ${partnerData.activity}${amountText}${goalText}`,
        actions: [
          { action: 'view', title: 'View Activity' },
          { action: 'dismiss', title: 'Dismiss' },
        ],
        data: {
          ...basePayload.data,
          url: '/dashboard',
        },
      };
    }

    case 'test':
    default:
      return {
        ...basePayload,
        title: '🔔 Test Notification',
        body: 'This is a test notification from BabyNest!',
        requireInteraction: true,
        actions: [
          { action: 'view', title: 'View App' },
          { action: 'dismiss', title: 'Dismiss' },
        ],
        data: {
          ...basePayload.data,
          url: '/dashboard',
        },
      };
  }
}

// Hook for using push notifications in React components
export function usePushNotifications() {
  // This would be implemented as a React hook
  // For now, we'll export the functions to be used directly
  return {
    isSupported: isPushNotificationSupported(),
    registerServiceWorker,
    requestNotificationPermission,
    getNotificationPermission,
    subscribeToPush,
    unsubscribeFromPush,
    savePushSubscription,
    removePushSubscription,
    sendTestNotification,
    isInQuietHours,
    createNotificationPayload,
  };
}
