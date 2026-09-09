import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  PaymentRecord,
  SubscriptionTier,
  SubscriptionStatus,
  PaymentStatus,
  PlanConfig,
  AuditLog,
} from '../types';
import { createNotification } from './notificationService';
import { DEFAULT_PLANS } from './firestoreService';

export const BKASH_RECEIVER_NUMBER = '01859340742';

// Dynamic plan storage helper
const PLANS_SETTING_DOC = 'platform_plans';

// Default plans tailored for Bangladesh bKash payments & global SaaS
export const BKASH_PLANS: PlanConfig[] = [
  {
    id: 'FREE',
    name: 'Free Starter',
    price: 0,
    currency: 'BDT',
    billing: 'Forever Free',
    monthlyCredits: 50,
    maxProjects: 5,
    active: true,
    features: [
      '50 AI generation credits',
      'Up to 5 saved marketing projects',
      'Basic Facebook & Instagram ad scripts',
      'Social content & hook ideas',
      'Standard community support',
    ],
  },
  {
    id: 'PRO',
    name: 'Pro Marketer',
    price: 1500,
    currency: 'BDT',
    billing: 'Monthly (30 Days)',
    monthlyCredits: 350,
    maxProjects: 50,
    popular: true,
    active: true,
    features: [
      '350 AI generation credits / month',
      'Up to 50 saved marketing projects',
      'Full Video Script Generator (15s, 30s, 60s)',
      'Meta Ad Performance Diagnostic Analyzer',
      'Full Funnel Facebook & Instagram Ads Planner',
      'Custom Brand Tones & Psychological Hooks',
      'Priority AI generation speed',
    ],
  },
  {
    id: 'BUSINESS',
    name: 'Business Scale',
    price: 3500,
    currency: 'BDT',
    billing: 'Monthly (30 Days)',
    monthlyCredits: 1200,
    maxProjects: 200,
    active: true,
    features: [
      '1,200 AI generation credits / month',
      'Unlimited saved projects & archives',
      'All AI tools & unrestricted diagnostic analyzer',
      'Team workspace & multi-brand management',
      'Advanced Meta Ads ROI Diagnostics',
      'Exclusive Marketing Lessons & Templates',
      'Dedicated WhatsApp / 24/7 Priority Support',
    ],
  },
];

/**
 * Get active plan configurations (fetched from Firestore with fallback to defaults)
 */
export async function getPlanConfigs(): Promise<PlanConfig[]> {
  try {
    const docRef = doc(db, 'settings', PLANS_SETTING_DOC);
    const snap = await getDoc(docRef);
    if (snap.exists() && snap.data()?.plans) {
      return snap.data().plans as PlanConfig[];
    }
  } catch (err) {
    console.warn('Could not fetch remote plans, using defaults:', err);
  }
  return BKASH_PLANS;
}

/**
 * Admin: Update plan configurations in Firestore
 */
export async function updatePlanConfigs(
  plans: PlanConfig[],
  adminEmail: string
): Promise<void> {
  const docRef = doc(db, 'settings', PLANS_SETTING_DOC);
  await setDoc(
    docRef,
    {
      plans,
      updatedAt: new Date().toISOString(),
      updatedBy: adminEmail,
    },
    { merge: true }
  );

  await recordAuditLog({
    action: 'UPDATE_PLANS_CONFIG',
    performedBy: adminEmail,
    details: { plansCount: plans.length },
  });
}

/**
 * Fetch a single plan by Tier ID
 */
export async function getPlanById(tier: SubscriptionTier): Promise<PlanConfig> {
  const plans = await getPlanConfigs();
  const found = plans.find((p) => p.id === tier);
  return (
    found ||
    BKASH_PLANS.find((p) => p.id === tier) ||
    BKASH_PLANS[0]
  );
}

/**
 * Check if the user currently has an active PENDING payment
 */
export async function getUserPendingPayment(
  userId: string
): Promise<PaymentRecord | null> {
  try {
    const q = query(
      collection(db, 'payments'),
      where('userId', '==', userId),
      where('paymentStatus', '==', 'PENDING'),
      limit(1)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      const data = snap.docs[0].data();
      return {
        paymentId: snap.docs[0].id,
        ...data,
      } as PaymentRecord;
    }
  } catch (err) {
    console.warn('Error querying pending payments:', err);
  }

  // Local storage fallback for seamless offline-first experience
  try {
    const local = localStorage.getItem(`bkash_pending_${userId}`);
    if (local) {
      const parsed = JSON.parse(local);
      if (parsed.paymentStatus === 'PENDING') {
        return parsed as PaymentRecord;
      }
    }
  } catch {}

  return null;
}

/**
 * Fetch user's payment history
 */
export async function getUserPaymentHistory(
  userId: string
): Promise<PaymentRecord[]> {
  const payments: PaymentRecord[] = [];
  try {
    const q = query(
      collection(db, 'payments'),
      where('userId', '==', userId)
    );
    const snap = await getDocs(q);
    snap.forEach((docSnap) => {
      payments.push({
        paymentId: docSnap.id,
        ...docSnap.data(),
      } as PaymentRecord);
    });
  } catch (err) {
    console.warn('Error querying user payments:', err);
  }

  // Merge with local records if any
  try {
    const localHistory = localStorage.getItem(`bkash_history_${userId}`);
    if (localHistory) {
      const parsed: PaymentRecord[] = JSON.parse(localHistory);
      parsed.forEach((item) => {
        if (!payments.some((p) => p.transactionId === item.transactionId)) {
          payments.push(item);
        }
      });
    }
  } catch {}

  // Sort descending by submission date
  return payments.sort(
    (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
  );
}

/**
 * Submit a manual bKash payment for verification
 */
export async function submitBkashPayment(params: {
  userId: string;
  userName: string;
  userEmail: string;
  plan: SubscriptionTier;
  amount: number;
  transactionId: string;
  paymentNote?: string;
}): Promise<PaymentRecord> {
  const cleanTrx = params.transactionId.trim().toUpperCase();

  if (!cleanTrx) {
    throw new Error('Please enter a valid bKash Transaction ID.');
  }

  if (cleanTrx.length < 6) {
    throw new Error('Transaction ID must be at least 6 characters.');
  }

  // Prevent duplicate submissions while an existing payment is PENDING
  const existingPending = await getUserPendingPayment(params.userId);
  if (existingPending) {
    throw new Error(
      'Your previous payment is currently under verification. Please wait for an administrator to review it.'
    );
  }

  const paymentDocRef = doc(collection(db, 'payments'));
  const submittedAt = new Date().toISOString();

  const record: PaymentRecord = {
    paymentId: paymentDocRef.id,
    userId: params.userId,
    userName: params.userName || 'Valued Customer',
    userEmail: params.userEmail,
    plan: params.plan,
    amount: params.amount,
    currency: 'BDT',
    paymentMethod: 'BKASH',
    receiverNumber: BKASH_RECEIVER_NUMBER,
    transactionId: cleanTrx,
    paymentStatus: 'PENDING',
    status: 'PENDING',
    submittedAt,
    reviewedAt: null,
    reviewedBy: null,
    adminNote: '',
    paymentNote: params.paymentNote?.trim() || '',
    billingPeriod: 'Monthly (30 Days)',
  };

  // 1. Write to Firestore
  try {
    await setDoc(paymentDocRef, record);
  } catch (err: any) {
    console.warn('Firestore setDoc payment failed, saving locally:', err);
  }

  // 2. Update user profile paymentStatus = 'PENDING'
  try {
    const userRef = doc(db, 'users', params.userId);
    await updateDoc(userRef, {
      paymentStatus: 'PENDING',
      updatedAt: submittedAt,
    });
  } catch (err) {
    console.warn('Firestore user update paymentStatus failed:', err);
  }

  // 3. Cache locally for instant UI response
  try {
    localStorage.setItem(`bkash_pending_${params.userId}`, JSON.stringify(record));
    const historyStr = localStorage.getItem(`bkash_history_${params.userId}`);
    const history: PaymentRecord[] = historyStr ? JSON.parse(historyStr) : [];
    history.unshift(record);
    localStorage.setItem(`bkash_history_${params.userId}`, JSON.stringify(history));
  } catch {}

  // 4. Send an in-app notification
  try {
    await createNotification({
      userId: params.userId,
      type: 'PAYMENT_SUBMITTED',
      title: 'Payment Submitted for Verification',
      message: `Your bKash payment of ৳${params.amount} for ${params.plan} (TrxID: ${cleanTrx}) was submitted. An administrator will verify and activate your plan shortly.`,
      link: '/profile/subscription',
      actionLabel: 'View Status',
    });
  } catch (err) {
    console.warn('Failed to send notification for payment submit:', err);
  }

  return record;
}

/**
 * Admin: Fetch all payments (Pending, Approved, Rejected)
 */
export async function getAllPaymentsAdmin(
  filter: 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED' = 'ALL'
): Promise<PaymentRecord[]> {
  const list: PaymentRecord[] = [];
  try {
    const q = collection(db, 'payments');
    const snap = await getDocs(q);
    snap.forEach((d) => {
      const data = d.data() as PaymentRecord;
      if (filter === 'ALL' || data.paymentStatus === filter) {
        list.push({
          paymentId: d.id,
          ...data,
        });
      }
    });
  } catch (err) {
    console.warn('Error loading admin payments:', err);
  }

  // Check any local mock or saved payments for testing
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('bkash_history_')) {
        const items: PaymentRecord[] = JSON.parse(localStorage.getItem(key) || '[]');
        items.forEach((item) => {
          if (!list.some((p) => p.transactionId === item.transactionId)) {
            if (filter === 'ALL' || item.paymentStatus === filter) {
              list.push(item);
            }
          }
        });
      }
    }
  } catch {}

  return list.sort(
    (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
  );
}

/**
 * Admin: Approve a manual bKash payment
 */
export async function approvePaymentAdmin(
  payment: PaymentRecord,
  adminEmail: string,
  adminNote?: string
): Promise<void> {
  const approvedAt = new Date().toISOString();
  const planInfo = await getPlanById(payment.plan);
  const planCredits = planInfo.monthlyCredits || (payment.plan === 'BUSINESS' ? 1200 : 350);
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days

  // 1. Update Payment Record
  const updatedPayment: Partial<PaymentRecord> = {
    paymentStatus: 'APPROVED',
    status: 'APPROVED',
    reviewedAt: approvedAt,
    reviewedBy: adminEmail,
    approvedAt,
    adminNote: adminNote || 'Payment verified against bKash statement.',
  };

  try {
    const payRef = doc(db, 'payments', payment.paymentId);
    await updateDoc(payRef, updatedPayment);
  } catch (err) {
    console.warn('Firestore updateDoc payment failed:', err);
  }

  // 2. Update Target User Profile in Firestore
  try {
    const userRef = doc(db, 'users', payment.userId);
    const userSnap = await getDoc(userRef);
    const currentCredits = userSnap.exists() ? userSnap.data()?.credits || 0 : 0;

    await updateDoc(userRef, {
      subscription: payment.plan,
      subscriptionPlan: payment.plan,
      subscriptionStatus: 'ACTIVE',
      paymentStatus: 'APPROVED',
      credits: currentCredits + planCredits,
      subscriptionExpiresAt: expiresAt,
      updatedAt: approvedAt,
    });
  } catch (err) {
    console.warn('Firestore updateUser failed on approval:', err);
  }

  // 3. Update localStorage cache
  try {
    localStorage.removeItem(`bkash_pending_${payment.userId}`);
    const histKey = `bkash_history_${payment.userId}`;
    const history: PaymentRecord[] = JSON.parse(localStorage.getItem(histKey) || '[]');
    const index = history.findIndex((p) => p.paymentId === payment.paymentId || p.transactionId === payment.transactionId);
    if (index !== -1) {
      history[index] = { ...history[index], ...updatedPayment };
      localStorage.setItem(histKey, JSON.stringify(history));
    }
  } catch {}

  // 4. Send in-app notification to the customer
  try {
    await createNotification({
      userId: payment.userId,
      type: 'PAYMENT_APPROVED',
      title: `${payment.plan} Subscription Activated!`,
      message: `Your bKash payment has been verified. Your ${payment.plan} plan is now active with ${planCredits} AI credits unlocked.`,
      link: '/dashboard',
      actionLabel: 'Go to Dashboard',
    });
  } catch (err) {
    console.warn('Failed to send approval notification:', err);
  }

  // 5. Record Audit Log
  await recordAuditLog({
    action: 'PAYMENT_APPROVED',
    performedBy: adminEmail,
    targetId: payment.paymentId,
    targetType: 'payment',
    details: {
      userId: payment.userId,
      userEmail: payment.userEmail,
      plan: payment.plan,
      amount: payment.amount,
      transactionId: payment.transactionId,
      creditsGranted: planCredits,
    },
  });
}

/**
 * Admin: Reject a manual bKash payment with reason
 */
export async function rejectPaymentAdmin(
  payment: PaymentRecord,
  adminEmail: string,
  rejectionReason: string
): Promise<void> {
  const rejectedAt = new Date().toISOString();
  const note = rejectionReason.trim() || 'Transaction ID not found in bKash statement or amount mismatch.';

  const updatedPayment: Partial<PaymentRecord> = {
    paymentStatus: 'REJECTED',
    status: 'REJECTED',
    reviewedAt: rejectedAt,
    reviewedBy: adminEmail,
    rejectedAt,
    adminNote: note,
  };

  // 1. Update Payment Record in Firestore
  try {
    const payRef = doc(db, 'payments', payment.paymentId);
    await updateDoc(payRef, updatedPayment);
  } catch (err) {
    console.warn('Firestore updateDoc payment rejection failed:', err);
  }

  // 2. Update User Profile in Firestore
  try {
    const userRef = doc(db, 'users', payment.userId);
    await updateDoc(userRef, {
      paymentStatus: 'REJECTED',
      updatedAt: rejectedAt,
    });
  } catch (err) {
    console.warn('Firestore updateUser failed on rejection:', err);
  }

  // 3. Clear local pending cache so user can submit a new payment
  try {
    localStorage.removeItem(`bkash_pending_${payment.userId}`);
    const histKey = `bkash_history_${payment.userId}`;
    const history: PaymentRecord[] = JSON.parse(localStorage.getItem(histKey) || '[]');
    const index = history.findIndex((p) => p.paymentId === payment.paymentId || p.transactionId === payment.transactionId);
    if (index !== -1) {
      history[index] = { ...history[index], ...updatedPayment };
      localStorage.setItem(histKey, JSON.stringify(history));
    }
  } catch {}

  // 4. Send in-app notification to the customer
  try {
    await createNotification({
      userId: payment.userId,
      type: 'PAYMENT_REJECTED',
      title: 'Payment Verification Unsuccessful',
      message: `Your payment could not be verified: "${note}". You may submit a new payment request with the correct Transaction ID.`,
      link: '/profile/subscription',
      actionLabel: 'View Subscription',
    });
  } catch (err) {
    console.warn('Failed to send rejection notification:', err);
  }

  // 5. Record Audit Log
  await recordAuditLog({
    action: 'PAYMENT_REJECTED',
    performedBy: adminEmail,
    targetId: payment.paymentId,
    targetType: 'payment',
    details: {
      userId: payment.userId,
      userEmail: payment.userEmail,
      plan: payment.plan,
      transactionId: payment.transactionId,
      reason: note,
    },
  });
}

/**
 * Record an administrative audit log in Firestore
 */
export async function recordAuditLog(log: {
  action: string;
  performedBy: string;
  targetId?: string;
  targetType?: string;
  details?: Record<string, any>;
}): Promise<void> {
  try {
    const logRef = doc(collection(db, 'auditLogs'));
    await setDoc(logRef, {
      id: logRef.id,
      action: log.action,
      performedBy: log.performedBy,
      targetId: log.targetId || null,
      targetType: log.targetType || null,
      details: log.details || {},
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('Failed to save audit log:', err);
  }
}
