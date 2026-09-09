import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { NotificationItem, NotificationType } from '../types';
import {
  getUserNotifications,
  createNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  clearAllNotifications,
  checkSubscriptionLimit,
} from '../services/notificationService';
import { useToast } from './ToastContext';

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  loading: boolean;
  notify: (
    type: NotificationType,
    title: string,
    message: string,
    options?: { link?: string; actionLabel?: string; meta?: Record<string, any> }
  ) => Promise<string | null>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  removeNotification: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
  refresh: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile } = useAuth();
  const { info } = useToast();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);

  const userId = profile?.uid;

  const refresh = useCallback(async () => {
    if (!userId) {
      setNotifications([]);
      return;
    }
    setLoading(true);
    try {
      const items = await getUserNotifications(userId);
      setNotifications(items);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Initial load on user login
  useEffect(() => {
    if (userId) {
      refresh();
    } else {
      setNotifications([]);
    }
  }, [userId, refresh]);

  // Check subscription limit whenever profile credits change
  useEffect(() => {
    if (profile?.uid && typeof profile.credits === 'number') {
      const maxCredits =
        profile.subscription === 'BUSINESS' ? 1200 : profile.subscription === 'PRO' ? 350 : 50;
      checkSubscriptionLimit(profile.credits, maxCredits, profile.uid).then(() => {
        // re-sync if a limit notification was created
        getUserNotifications(profile.uid).then(setNotifications);
      });
    }
  }, [profile?.uid, profile?.credits, profile?.subscription]);

  const notify = async (
    type: NotificationType,
    title: string,
    message: string,
    options?: { link?: string; actionLabel?: string; meta?: Record<string, any> }
  ): Promise<string | null> => {
    if (!userId) return null;

    try {
      const id = await createNotification({
        userId,
        type,
        title,
        message,
        read: false,
        link: options?.link,
        actionLabel: options?.actionLabel,
        meta: options?.meta,
      });

      // Update local state immediately
      const newNotif: NotificationItem = {
        id,
        userId,
        type,
        title,
        message,
        read: false,
        createdAt: new Date().toISOString(),
        link: options?.link,
        actionLabel: options?.actionLabel,
        meta: options?.meta,
      };

      setNotifications((prev) => [newNotif, ...prev]);

      // Pop brief informative toast if appropriate
      if (type === 'GENERATION_COMPLETE' || type === 'PLAN_CREATED') {
        info(`🔔 ${title}`);
      }

      return id;
    } catch (err) {
      console.error('Failed to create notification:', err);
      return null;
    }
  };

  const markAsRead = async (id: string) => {
    if (!userId) return;
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    await markNotificationAsRead(id, userId);
  };

  const markAllAsRead = async () => {
    if (!userId) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    await markAllNotificationsAsRead(userId);
  };

  const removeNotification = async (id: string) => {
    if (!userId) return;
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    await deleteNotification(id, userId);
  };

  const clearAll = async () => {
    if (!userId) return;
    setNotifications([]);
    await clearAllNotifications(userId);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        notify,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearAll,
        refresh,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return ctx;
};
