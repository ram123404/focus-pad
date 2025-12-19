import { useEffect, useCallback, useRef } from 'react';
import { Task } from '@/types';
import { format, differenceInMinutes, parseISO, isToday } from 'date-fns';

interface NotificationSettings {
  enabled: boolean;
  reminderMinutes: number; // Minutes before due time
}

const NOTIFICATION_STORAGE_KEY = 'productivity-notifications';
const NOTIFIED_TASKS_KEY = 'productivity-notified-tasks';

export function useNotifications(tasks: Task[], settings: NotificationSettings) {
  const notifiedTasksRef = useRef<Set<string>>(new Set());

  // Load already notified tasks from storage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(NOTIFIED_TASKS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Clear old entries (older than 24 hours)
        const now = Date.now();
        const filtered = Object.entries(parsed)
          .filter(([_, timestamp]) => now - (timestamp as number) < 24 * 60 * 60 * 1000)
          .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
        localStorage.setItem(NOTIFIED_TASKS_KEY, JSON.stringify(filtered));
        notifiedTasksRef.current = new Set(Object.keys(filtered));
      }
    } catch {
      // Ignore errors
    }
  }, []);

  const markTaskNotified = useCallback((taskId: string) => {
    notifiedTasksRef.current.add(taskId);
    try {
      const stored = localStorage.getItem(NOTIFIED_TASKS_KEY);
      const parsed = stored ? JSON.parse(stored) : {};
      parsed[taskId] = Date.now();
      localStorage.setItem(NOTIFIED_TASKS_KEY, JSON.stringify(parsed));
    } catch {
      // Ignore errors
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      console.log('Browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }, []);

  const showNotification = useCallback((title: string, body: string, taskId?: string) => {
    if (Notification.permission !== 'granted') return;

    const notification = new Notification(title, {
      body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: taskId || 'focuspad-notification',
      requireInteraction: true,
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    // Auto close after 10 seconds
    setTimeout(() => notification.close(), 10000);
  }, []);

  // Check for upcoming tasks
  useEffect(() => {
    if (!settings.enabled || Notification.permission !== 'granted') return;

    const checkTasks = () => {
      const now = new Date();
      
      tasks.forEach(task => {
        // Skip completed, archived, or already notified tasks
        if (task.status === 'done' || task.isArchived) return;
        if (notifiedTasksRef.current.has(task.id)) return;
        if (!task.dueDate) return;

        const taskDate = parseISO(task.dueDate);
        
        // Check if task is due today
        if (!isToday(taskDate)) return;

        // If task has a due time, check if we should notify
        if (task.dueTime) {
          const [hours, minutes] = task.dueTime.split(':').map(Number);
          const dueDateTime = new Date(taskDate);
          dueDateTime.setHours(hours, minutes, 0, 0);

          const minutesUntilDue = differenceInMinutes(dueDateTime, now);

          // Notify if within reminder window
          if (minutesUntilDue > 0 && minutesUntilDue <= settings.reminderMinutes) {
            showNotification(
              '⏰ Task Reminder',
              `"${task.title}" is due in ${minutesUntilDue} minute${minutesUntilDue !== 1 ? 's' : ''}`,
              task.id
            );
            markTaskNotified(task.id);
          } else if (minutesUntilDue <= 0 && minutesUntilDue > -5) {
            // Task is due now (within 5 min window)
            showNotification(
              '🔔 Task Due Now!',
              `"${task.title}" is due now`,
              task.id
            );
            markTaskNotified(task.id);
          }
        } else {
          // No due time - notify once in the morning for today's tasks
          const morningHour = 9;
          if (now.getHours() === morningHour && now.getMinutes() < 5) {
            showNotification(
              '📋 Task Due Today',
              `"${task.title}" is due today`,
              task.id
            );
            markTaskNotified(task.id);
          }
        }
      });
    };

    // Check immediately and then every minute
    checkTasks();
    const interval = setInterval(checkTasks, 60000);

    return () => clearInterval(interval);
  }, [tasks, settings, showNotification, markTaskNotified]);

  return {
    requestPermission,
    showNotification,
    isSupported: 'Notification' in window,
    permission: typeof Notification !== 'undefined' ? Notification.permission : 'denied',
  };
}

// Helper to get/save notification settings
export function getNotificationSettings(): NotificationSettings {
  try {
    const stored = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Ignore
  }
  return { enabled: false, reminderMinutes: 15 };
}

export function saveNotificationSettings(settings: NotificationSettings): void {
  try {
    localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Ignore
  }
}
