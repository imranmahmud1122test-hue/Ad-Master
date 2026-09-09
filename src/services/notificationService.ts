import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { NotificationItem, NotificationType } from '../types';

const STORAGE_KEY_PREFIX = 'admaster_notifications_';

function getLocalNotifications(userId: string): NotificationItem[] {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}${userId}`);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('Failed to read local notifications:', err);
  }
  return [];
}

function saveLocalNotifications(userId: string, items: NotificationItem[]) {
  try {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${userId}`, JSON.stringify(items));
  } catch (err) {
    console.warn('Failed to save local notifications:', err);
  }
}

/**
 * Fetch all notifications for a specific user.
 * Reads from Firestore when authenticated, with seamless local persistent storage fallback.
 */
export async function getUserNotifications(userId: string): Promise<NotificationItem[]> {
  if (!userId) return [];

  // 1. Only execute remote query if Firebase Auth has an active authenticated session
  if (auth.currentUser && (auth.currentUser.uid === userId || auth.currentUser.email === 'imranmahmud1122.test@gmail.com')) {
    try {
      const notifsRef = collection(db, 'notifications');
      const q = query(notifsRef, where('userId', '==', userId));

      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const items: NotificationItem[] = snapshot.docs
          .map((docSnap) => ({
            id: docSnap.id,
            ...(docSnap.data() as Omit<NotificationItem, 'id'>),
          }))
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        // Sync local cache
        saveLocalNotifications(userId, items);
        return items;
      }
    } catch (err: any) {
      const msg = err?.message || String(err);
      if (!msg.includes('insufficient permissions')) {
        console.warn('Firestore notifications sync notice:', msg);
      }
    }
  }

  // 2. Fallback to local persistent storage
  const localItems = getLocalNotifications(userId);
  if (localItems.length > 0) {
    return localItems.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  // 3. If completely new user, generate introductory notifications
  const initialNotifications: NotificationItem[] = [
    {
      id: `notif-welcome-${Date.now()}`,
      userId,
      type: 'SYSTEM_ALERT',
      title: 'Welcome to AdMaster AI',
      message: 'Your account is ready! 50 complimentary AI credits have been credited to your balance.',
      read: false,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      link: '/video-generator',
      actionLabel: 'Create First Ad Script',
    },
    {
      id: `notif-plan-${Date.now()}`,
      userId,
      type: 'PLAN_CREATED',
      title: 'Plan Created: Sample Campaign',
      message: 'Explore your pre-configured Facebook Ads Strategy blueprint in the Campaign Planner.',
      read: false,
      createdAt: new Date(Date.now() - 1800000).toISOString(),
      link: '/ads-planner',
      actionLabel: 'View Campaign Plan',
    },
  ];

  saveLocalNotifications(userId, initialNotifications);
  return initialNotifications;
}

/**
 * Dispatch a new notification to a user.
 */
export async function createNotification(
  notification: Omit<NotificationItem, 'id' | 'createdAt' | 'read'> & {
    read?: boolean;
    createdAt?: string;
  }
): Promise<string> {
  const newNotif: NotificationItem = {
    read: false,
    ...notification,
    id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    createdAt: notification.createdAt || new Date().toISOString(),
  };

  // 1. Save to local storage first for instantaneous UI update
  const local = getLocalNotifications(notification.userId);
  const updated = [newNotif, ...local];
  saveLocalNotifications(notification.userId, updated);

  // 2. Persist to Firestore if authenticated
  if (auth.currentUser && (auth.currentUser.uid === notification.userId || auth.currentUser.email === 'imranmahmud1122.test@gmail.com')) {
    try {
      const notifsRef = collection(db, 'notifications');
      const docRef = await addDoc(notifsRef, {
        userId: newNotif.userId,
        type: newNotif.type,
        title: newNotif.title,
        message: newNotif.message,
        read: newNotif.read,
        createdAt: newNotif.createdAt,
        ...(newNotif.link ? { link: newNotif.link } : {}),
        ...(newNotif.actionLabel ? { actionLabel: newNotif.actionLabel } : {}),
        ...(newNotif.meta ? { meta: newNotif.meta } : {}),
      });
      newNotif.id = docRef.id;
      // update cached item with actual doc ID
      const reSync = getLocalNotifications(notification.userId);
      if (reSync.length > 0 && reSync[0].title === newNotif.title) {
        reSync[0].id = docRef.id;
        saveLocalNotifications(notification.userId, reSync);
      }
    } catch (err) {
      // Retained locally
    }
  }

  return newNotif.id;
}

/**
 * Mark a specific notification as read.
 */
export async function markNotificationAsRead(id: string, userId: string): Promise<void> {
  // Update local
  const local = getLocalNotifications(userId);
  const updated = local.map((n) => (n.id === id ? { ...n, read: true } : n));
  saveLocalNotifications(userId, updated);

  // Update in Firestore if valid doc ID and authenticated
  if (!id.startsWith('notif-') && auth.currentUser) {
    try {
      const docRef = doc(db, 'notifications', id);
      await updateDoc(docRef, { read: true });
    } catch (err) {
      // Handled locally
    }
  }
}

/**
 * Mark all notifications as read for a user.
 */
export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  const local = getLocalNotifications(userId);
  const updated = local.map((n) => ({ ...n, read: true }));
  saveLocalNotifications(userId, updated);

  if (auth.currentUser && (auth.currentUser.uid === userId || auth.currentUser.email === 'imranmahmud1122.test@gmail.com')) {
    try {
      const notifsRef = collection(db, 'notifications');
      const q = query(notifsRef, where('userId', '==', userId));
      const snapshot = await getDocs(q);
      const unreadDocs = snapshot.docs.filter((d) => d.data().read === false);
      const updatePromises = unreadDocs.map((d) => updateDoc(d.ref, { read: true }));
      await Promise.all(updatePromises);
    } catch (err) {
      // Handled locally
    }
  }
}

/**
 * Delete a specific notification.
 */
export async function deleteNotification(id: string, userId: string): Promise<void> {
  const local = getLocalNotifications(userId);
  const updated = local.filter((n) => n.id !== id);
  saveLocalNotifications(userId, updated);

  if (!id.startsWith('notif-') && auth.currentUser) {
    try {
      const docRef = doc(db, 'notifications', id);
      await deleteDoc(docRef);
    } catch (err) {
      // Handled locally
    }
  }
}

/**
 * Clear all notifications for a user.
 */
export async function clearAllNotifications(userId: string): Promise<void> {
  saveLocalNotifications(userId, []);

  if (auth.currentUser && (auth.currentUser.uid === userId || auth.currentUser.email === 'imranmahmud1122.test@gmail.com')) {
    try {
      const notifsRef = collection(db, 'notifications');
      const q = query(notifsRef, where('userId', '==', userId));
      const snapshot = await getDocs(q);
      const deletePromises = snapshot.docs.map((d) => deleteDoc(d.ref));
      await Promise.all(deletePromises);
    } catch (err) {
      // Handled locally
    }
  }
}

/**
 * Check if the user's subscription / credit limit is approaching, and dispatch
 * a notification if not already notified recently.
 */
export async function checkSubscriptionLimit(
  credits: number,
  maxCredits: number,
  userId: string
): Promise<void> {
  if (!userId) return;

  const threshold = Math.max(10, Math.floor(maxCredits * 0.2));
  if (credits > threshold) return;

  // Check if we already have an unread limit warning in the last 6 hours
  const local = getLocalNotifications(userId);
  const existingWarning = local.find(
    (n) =>
      n.type === 'CREDIT_LIMIT_APPROACHING' &&
      !n.read &&
      Date.now() - new Date(n.createdAt).getTime() < 6 * 3600 * 1000
  );

  if (existingWarning) return;

  await createNotification({
    userId,
    type: 'CREDIT_LIMIT_APPROACHING',
    title: 'Subscription Limit Approaching',
    message: `You have only ${credits} AI credits left (${Math.round(
      (credits / maxCredits) * 100
    )}% balance). Upgrade to Pro to keep generating scripts and ad plans without pause.`,
    read: false,
    link: '/pricing',
    actionLabel: 'Upgrade Plan',
    meta: { credits, maxCredits },
  });
}
