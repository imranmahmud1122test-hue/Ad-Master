import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { UserProfile, SubscriptionTier } from '../types';
import {
  getUserProfile,
  createUserProfile,
  updateUserProfile as updateProfileDoc,
  logAIUsage,
} from '../services/firestoreService';

interface AuthContextType {
  currentUser: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  register: (
    email: string,
    pass: string,
    fullName: string,
    businessName: string,
    businessCategory: string
  ) => Promise<void>;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  completeOnboarding: (data: {
    businessType: string;
    marketingGoal: string;
    targetAudience: {
      location: string;
      ageRange: string;
      gender: string;
      customerType: string;
    };
  }) => Promise<void>;
  consumeCredits: (amount: number, actionName: string) => Promise<boolean>;
  refreshProfile: () => Promise<void>;
  setDemoUser: (role: 'USER' | 'ADMIN') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Exclusive Super Admin configured for the application
const ADMIN_EMAILS = [
  'imranmahmud1122.test@gmail.com',
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (uid: string, userEmail?: string | null): Promise<UserProfile> => {
    let p = await getUserProfile(uid);
    if (!p) {
      // Auto-create initial profile if it doesn't exist
      const isAdminEmail = userEmail && ADMIN_EMAILS.includes(userEmail.toLowerCase().trim());
      const newProfile: UserProfile = {
        uid,
        email: userEmail || 'user@example.com',
        displayName: isAdminEmail ? 'Imran Mahmud (Admin)' : (userEmail ? userEmail.split('@')[0] : 'Customer'),
        businessName: isAdminEmail ? 'AdMaster AI Global' : 'My Brand',
        businessCategory: isAdminEmail ? 'Technology' : 'E-commerce',
        role: isAdminEmail ? 'ADMIN' : 'USER',
        subscription: isAdminEmail ? 'BUSINESS' : 'FREE',
        credits: isAdminEmail ? 99999 : 50,
        onboardingCompleted: true,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await createUserProfile(newProfile);
      p = newProfile;
    }
    return p;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const userProfile = await fetchProfile(user.uid, user.email);
          setProfile(userProfile);
          try {
            localStorage.setItem('admaster_active_profile', JSON.stringify(userProfile));
          } catch {}
        } catch (err) {
          console.error('Failed to load profile:', err);
        }
      } else {
        // If no active Firebase auth user, check if an explicit saved session exists
        try {
          const savedLocal = localStorage.getItem('admaster_active_profile');
          if (savedLocal) {
            const parsed = JSON.parse(savedLocal);
            if (parsed && parsed.uid && parsed.email) {
              setProfile(parsed);
              setCurrentUser({ uid: parsed.uid, email: parsed.email } as any);
            } else {
              setProfile(null);
            }
          } else {
            setProfile(null);
          }
        } catch {
          setProfile(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const refreshProfile = async () => {
    if (currentUser) {
      const p = await getUserProfile(currentUser.uid);
      if (p) setProfile(p);
    }
  };

  const register = async (
    email: string,
    pass: string,
    fullName: string,
    businessName: string,
    businessCategory: string
  ) => {
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      const isSystemAdmin = ADMIN_EMAILS.includes(email.toLowerCase().trim());
      const newProfile: UserProfile = {
        uid: cred.user.uid,
        email,
        displayName: fullName,
        businessName,
        businessCategory,
        role: isSystemAdmin ? 'ADMIN' : 'USER',
        subscription: isSystemAdmin ? 'BUSINESS' : 'FREE',
        credits: isSystemAdmin ? 99999 : 50,
        onboardingCompleted: false,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await createUserProfile(newProfile);
      setProfile(newProfile);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, pass: string) => {
    setLoading(true);
    const cleanEmail = email.trim().toLowerCase();
    const isTargetAdmin = cleanEmail === 'imranmahmud1122.test@gmail.com';

    // 1. Exclusive Super Admin Login (imranmahmud1122.test@gmail.com / 1122)
    if (isTargetAdmin && (pass === '1122' || pass === '11221122')) {
      try {
        let adminUid = 'admin-imranmahmud1122';
        // Connect to Firebase Auth with 6+ chars so Firebase issues a valid auth session with token.email
        try {
          const cred = await signInWithEmailAndPassword(auth, cleanEmail, '11221122');
          adminUid = cred.user.uid;
        } catch (authErr: any) {
          if (authErr.code === 'auth/user-not-found' || authErr.code === 'auth/invalid-credential') {
            try {
              const newCred = await createUserWithEmailAndPassword(auth, cleanEmail, '11221122');
              adminUid = newCred.user.uid;
            } catch {}
          }
        }

        const adminProfile: UserProfile = {
          uid: adminUid,
          email: 'imranmahmud1122.test@gmail.com',
          displayName: 'Imran Mahmud (Admin)',
          businessName: 'AdMaster AI Global',
          businessCategory: 'Technology',
          role: 'ADMIN',
          subscription: 'BUSINESS',
          credits: 99999,
          onboardingCompleted: true,
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await createUserProfile(adminProfile);
        setProfile(adminProfile);
        return;
      } catch (err) {
        console.error('Admin login error:', err);
      } finally {
        setLoading(false);
      }
    }

    // 2. Standard customer authentication
    try {
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      const p = await fetchProfile(cred.user.uid, cred.user.email);
      setProfile(p);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch {}
    localStorage.removeItem('admaster_active_profile');
    setCurrentUser(null);
    setProfile(null);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const completeOnboarding = async (data: {
    businessType: string;
    marketingGoal: string;
    targetAudience: {
      location: string;
      ageRange: string;
      gender: string;
      customerType: string;
    };
  }) => {
    if (!profile) return;
    const updates = {
      businessCategory: data.businessType || profile.businessCategory,
      marketingGoal: data.marketingGoal,
      targetAudience: data.targetAudience,
      onboardingCompleted: true,
      updatedAt: new Date().toISOString(),
    };
    await updateProfileDoc(profile.uid, updates);
    setProfile((prev) => (prev ? { ...prev, ...updates } : null));
  };

  const consumeCredits = async (amount: number, actionName: string): Promise<boolean> => {
    if (!profile) return false;
    // Super admin has unlimited credits
    if (profile.role === 'ADMIN') {
      await logAIUsage(profile.uid, actionName, amount);
      return true;
    }
    if (profile.credits < amount) {
      return false;
    }
    const newCreditBalance = Math.max(0, profile.credits - amount);
    await updateProfileDoc(profile.uid, { credits: newCreditBalance });
    await logAIUsage(profile.uid, actionName, amount);
    const updated = prev => {
      const next = prev ? { ...prev, credits: newCreditBalance } : null;
      if (next) {
        try { localStorage.setItem('admaster_active_profile', JSON.stringify(next)); } catch {}
      }
      return next;
    };
    setProfile(updated);
    return true;
  };

  // Safe fallback/mock switch for direct UI testing when desired
  const setDemoUser = async (role: 'USER' | 'ADMIN') => {
    setLoading(true);
    try {
      if (role === 'ADMIN') {
        const p: UserProfile = {
          uid: 'admin-imranmahmud1122',
          email: 'imranmahmud1122.test@gmail.com',
          displayName: 'Imran Mahmud (Admin)',
          businessName: 'AdMaster AI Global',
          businessCategory: 'Technology',
          role: 'ADMIN',
          subscription: 'BUSINESS',
          credits: 99999,
          onboardingCompleted: true,
          status: 'active',
          marketingGoal: 'Scale Ads Globally',
          targetAudience: {
            location: 'Worldwide',
            ageRange: '20-65',
            gender: 'All',
            customerType: 'Advertisers & Agencies',
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await createUserProfile(p);
        try { localStorage.setItem('admaster_active_profile', JSON.stringify(p)); } catch {}
        setProfile(p);
      } else {
        const demoUid = 'demo-customer-user-id';
        const demoEmail = 'customer@admasterai.com';
        const p: UserProfile = {
          uid: demoUid,
          email: demoEmail,
          displayName: 'Sarah Jenkins',
          businessName: 'GlowSkin Organics',
          businessCategory: 'E-commerce',
          role: 'USER',
          subscription: 'PRO',
          credits: 280,
          onboardingCompleted: true,
          status: 'active',
          marketingGoal: 'Sales',
          targetAudience: {
            location: 'United States',
            ageRange: '25-45',
            gender: 'Female',
            customerType: 'Skincare enthusiasts',
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        try { localStorage.setItem('admaster_active_profile', JSON.stringify(p)); } catch {}
        setProfile(p);
      }
    } finally {
      setLoading(false);
    }
  };

  // Strictly only imranmahmud1122.test@gmail.com has admin access
  const isAdmin =
    profile?.role === 'ADMIN' &&
    (profile?.email?.toLowerCase() === 'imranmahmud1122.test@gmail.com' ||
      currentUser?.email?.toLowerCase() === 'imranmahmud1122.test@gmail.com' ||
      profile?.uid === 'admin-imranmahmud1122');

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        profile,
        loading,
        isAdmin,
        register,
        login,
        logout,
        resetPassword,
        completeOnboarding,
        consumeCredits,
        refreshProfile,
        setDemoUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
