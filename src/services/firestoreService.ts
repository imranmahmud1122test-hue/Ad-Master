import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import {
  UserProfile,
  Project,
  CalendarItem,
  AIPromptTemplate,
  CMSItem,
  PlanConfig,
  SubscriptionTier,
} from '../types';

// Default plans configuration
export const DEFAULT_PLANS: PlanConfig[] = [
  {
    id: 'FREE',
    name: 'Free Starter',
    price: 0,
    billing: 'forever',
    monthlyCredits: 50,
    maxProjects: 5,
    features: [
      '50 AI generation credits / month',
      'Up to 5 saved marketing projects',
      'Facebook & Instagram Script Generator',
      'Social Content & Hook Generator',
      'Basic Ads Campaign Planner',
      'Content Calendar (Month view)',
    ],
  },
  {
    id: 'PRO',
    name: 'Pro Marketer',
    price: 39,
    billing: 'per month',
    monthlyCredits: 350,
    maxProjects: 35,
    popular: true,
    features: [
      '350 AI generation credits / month',
      'Up to 35 saved marketing projects',
      'All Video & Ad Platforms (FB, IG, TikTok, YouTube)',
      'Ad Performance Diagnostic Analyzer',
      'Multi-angle Script & Scene Generator',
      'Priority AI Processing Speed',
      'Export to PDF & CSV',
    ],
  },
  {
    id: 'BUSINESS',
    name: 'Business Scale',
    price: 99,
    billing: 'per month',
    monthlyCredits: 1200,
    maxProjects: 200,
    features: [
      '1,200 AI generation credits / month',
      'Unlimited saved projects & archives',
      'Team marketing workspace',
      'Advanced Meta Ads ROI Diagnostics',
      'Custom Brand Tones & Saved Audiences',
      'Full Access to CMS Lesson Library & Templates',
      'Dedicated 24/7 Priority Support',
    ],
  },
];

// Initial prompt templates for the AI Prompt Library
export const INITIAL_AI_PROMPTS: AIPromptTemplate[] = [
  {
    id: 'prompt-video-script-v1',
    name: 'Direct Response Video Script Formula',
    category: 'video',
    description: 'High-converting 3-second hook with 4-part value proposition and direct closing CTA.',
    systemInstructions: 'Focus on scroll-stopping first frames, pattern interrupts, and tangible transformation.',
    status: 'active',
    version: '1.4.2',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prompt-hook-master-v2',
    name: 'Viral Negative Bias & Curiosity Hooks',
    category: 'hooks',
    description: 'Generates 5 distinct psychological hooks to maximize video watch time and CTR.',
    systemInstructions: 'Produce 1 curiosity gap, 1 negative bias ("Stop doing X"), 1 contrarian, 1 direct benefit, and 1 social proof.',
    status: 'active',
    version: '2.1.0',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prompt-ad-planner-v1',
    name: 'Meta Ads Full-Funnel Campaign Blueprint',
    category: 'campaign',
    description: 'Strategic audience targeting, budget split, creative testing matrix, and risk mitigation.',
    systemInstructions: 'Structure strictly according to Meta best practices for CBO, testing ad sets, and learning phase exits.',
    status: 'active',
    version: '1.2.0',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prompt-ad-analyzer-v1',
    name: 'Ads Diagnostic & Optimization Engine',
    category: 'analysis',
    description: 'Evaluates CTR, CPC, ROAS, and CPA to prescribe actionable fixes for ad fatigue and landing page friction.',
    systemInstructions: 'Diagnose bottlenecks strictly by comparing calculated metrics against standard Meta benchmarks.',
    status: 'active',
    version: '1.1.0',
    updatedAt: new Date().toISOString(),
  },
];

// Initial CMS content
export const INITIAL_CMS_ITEMS: CMSItem[] = [
  {
    id: 'cms-1',
    title: 'The 3-Second Hook Masterclass for Facebook Ads',
    category: 'Lesson',
    description: 'How to stop viewers from scrolling past your video ads within the first 3 seconds.',
    status: 'Published',
    content: 'Over 85% of video ad drop-offs occur before second 3. To capture high-intent buyers, use visual pattern interrupts, dynamic text overlays, and a provocative question or contrarian statement.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'cms-2',
    title: 'How to Structure Your Daily Testing Budget on Meta',
    category: 'Guide',
    description: 'A beginner-friendly breakdown of allocating your budget between ad creative testing and scaling.',
    status: 'Published',
    content: 'Rule of thumb: Dedicate 70% of your budget to proven winning ad sets and 30% to testing new creatives and hooks. Give each new ad set at least 3-5 days before judging CPA.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'cms-3',
    title: 'E-commerce Product Launch Ad Script Template',
    category: 'Template',
    description: 'Plug-and-play 30-second script blueprint for physical products.',
    status: 'Published',
    content: 'Scene 1: "Tired of [annoying problem]?"\nScene 2: Introduce product with immediate close-up demonstration.\nScene 3: 3 quick customer reactions/unboxing snippets.\nScene 4: "Tap Shop Now for 20% off your first order."',
    createdAt: new Date().toISOString(),
  },
];

// -------------------------------------------------------------
// USER PROFILES
// -------------------------------------------------------------
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  if (auth.currentUser && (auth.currentUser.uid === uid || auth.currentUser.email === 'imranmahmud1122.test@gmail.com')) {
    try {
      const docRef = doc(db, 'users', uid);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data() as UserProfile;
        try {
          const localUsers = JSON.parse(localStorage.getItem('admaster_local_users') || '{}');
          localUsers[uid] = data;
          localStorage.setItem('admaster_local_users', JSON.stringify(localUsers));
        } catch {}
        return data;
      }
    } catch {}
  }
  const localUsers = JSON.parse(localStorage.getItem('admaster_local_users') || '{}');
  return localUsers[uid] || null;
}

export async function createUserProfile(profile: UserProfile): Promise<void> {
  try {
    const localUsers = JSON.parse(localStorage.getItem('admaster_local_users') || '{}');
    localUsers[profile.uid] = profile;
    localStorage.setItem('admaster_local_users', JSON.stringify(localUsers));
  } catch {}

  if (auth.currentUser && (auth.currentUser.uid === profile.uid || auth.currentUser.email === 'imranmahmud1122.test@gmail.com')) {
    try {
      const docRef = doc(db, 'users', profile.uid);
      await setDoc(docRef, {
        ...profile,
        createdAt: profile.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    } catch {}
  }
}

export async function updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
  try {
    const localUsers = JSON.parse(localStorage.getItem('admaster_local_users') || '{}');
    if (localUsers[uid]) {
      localUsers[uid] = { ...localUsers[uid], ...updates, updatedAt: new Date().toISOString() };
      localStorage.setItem('admaster_local_users', JSON.stringify(localUsers));
    }
  } catch {}

  if (auth.currentUser && (auth.currentUser.uid === uid || auth.currentUser.email === 'imranmahmud1122.test@gmail.com')) {
    try {
      const docRef = doc(db, 'users', uid);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
    } catch {}
  }
}

export async function deleteUserProfile(uid: string): Promise<void> {
  try {
    const localUsers = JSON.parse(localStorage.getItem('admaster_local_users') || '{}');
    delete localUsers[uid];
    localStorage.setItem('admaster_local_users', JSON.stringify(localUsers));
  } catch {}

  if (auth.currentUser && (auth.currentUser.uid === uid || auth.currentUser.email === 'imranmahmud1122.test@gmail.com')) {
    try {
      const docRef = doc(db, 'users', uid);
      await deleteDoc(docRef);
    } catch {}
  }
}

export async function getAllUsers(): Promise<UserProfile[]> {
  let cloudUsers: UserProfile[] = [];
  if (auth.currentUser && (auth.currentUser.email === 'imranmahmud1122.test@gmail.com' || auth.currentUser.uid === 'admin-imranmahmud1122')) {
    try {
      const usersCol = collection(db, 'users');
      const snap = await getDocs(usersCol);
      cloudUsers = snap.docs.map((d) => d.data() as UserProfile);
    } catch {}
  }

  const localUsersMap = JSON.parse(localStorage.getItem('admaster_local_users') || '{}');
  const localUsersList: UserProfile[] = Object.values(localUsersMap);
  
  const cloudUids = new Set(cloudUsers.map((u) => u.uid));
  const merged = [...cloudUsers];
  for (const lu of localUsersList) {
    if (!cloudUids.has(lu.uid)) {
      merged.push(lu);
    }
  }

  if (merged.length === 0) {
    return [
      {
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
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        uid: 'usr-customer-101',
        email: 'customer.alex@shopnordic.com',
        displayName: 'Alex Thorne',
        businessName: 'Nordic Apparel Store',
        businessCategory: 'E-commerce',
        role: 'USER',
        subscription: 'PRO',
        credits: 240,
        onboardingCompleted: true,
        status: 'active',
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        uid: 'usr-customer-102',
        email: 'emma.creator@glowskin.co',
        displayName: 'Emma Davies',
        businessName: 'GlowSkin Organics',
        businessCategory: 'Beauty & Skincare',
        role: 'USER',
        subscription: 'FREE',
        credits: 45,
        onboardingCompleted: true,
        status: 'active',
        createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  }
  return merged;
}

// -------------------------------------------------------------
// PROJECTS
// -------------------------------------------------------------
export async function getUserProjects(userId: string): Promise<Project[]> {
  const localProjects: Project[] = JSON.parse(localStorage.getItem('admaster_local_projects') || '[]')
    .filter((p: any) => p.userId === userId);

  // If no active Firebase Auth session matching this user, return local projects cleanly without unauthorized network queries
  if (!auth.currentUser || (auth.currentUser.uid !== userId && auth.currentUser.email !== 'imranmahmud1122.test@gmail.com')) {
    return localProjects.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  try {
    const projectsCol = collection(db, 'projects');
    const q = query(projectsCol, where('userId', '==', userId));
    const snap = await getDocs(q);
    const cloudProjects = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Project));
    const cloudIds = new Set(cloudProjects.map((p) => p.id));
    const merged = [...cloudProjects, ...localProjects.filter((lp) => !cloudIds.has(lp.id))];
    return merged.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  } catch {
    return localProjects.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }
}

export async function getProjectById(projectId: string): Promise<Project | null> {
  const localProjects: Project[] = JSON.parse(localStorage.getItem('admaster_local_projects') || '[]');
  const localFound = localProjects.find((p) => p.id === projectId);

  if (!auth.currentUser) {
    return localFound || null;
  }

  try {
    const docRef = doc(db, 'projects', projectId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as Project;
    }
    return localFound || null;
  } catch {
    return localFound || null;
  }
}

export async function createProject(project: Omit<Project, 'id'>): Promise<string> {
  const now = new Date().toISOString();
  const localId = 'proj_' + Math.random().toString(36).substring(2, 9);
  const newProject: Project = { id: localId, ...project, createdAt: now, updatedAt: now };

  try {
    const localProjects: Project[] = JSON.parse(localStorage.getItem('admaster_local_projects') || '[]');
    localProjects.unshift(newProject);
    localStorage.setItem('admaster_local_projects', JSON.stringify(localProjects));
  } catch {}

  if (!auth.currentUser) {
    return localId;
  }

  try {
    const projectsCol = collection(db, 'projects');
    const docRef = await addDoc(projectsCol, {
      ...project,
      createdAt: now,
      updatedAt: now,
    });
    try {
      const localProjects: Project[] = JSON.parse(localStorage.getItem('admaster_local_projects') || '[]');
      const idx = localProjects.findIndex((p) => p.id === localId);
      if (idx !== -1) {
        localProjects[idx].id = docRef.id;
        localStorage.setItem('admaster_local_projects', JSON.stringify(localProjects));
      }
    } catch {}
    return docRef.id;
  } catch {
    return localId;
  }
}

export async function updateProject(projectId: string, updates: Partial<Project>): Promise<void> {
  const now = new Date().toISOString();
  try {
    const localProjects: Project[] = JSON.parse(localStorage.getItem('admaster_local_projects') || '[]');
    const idx = localProjects.findIndex((p) => p.id === projectId);
    if (idx !== -1) {
      localProjects[idx] = { ...localProjects[idx], ...updates, updatedAt: now };
      localStorage.setItem('admaster_local_projects', JSON.stringify(localProjects));
    }
  } catch {}

  if (!auth.currentUser) return;

  try {
    const docRef = doc(db, 'projects', projectId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: now,
    });
  } catch {}
}

export async function deleteProject(projectId: string): Promise<void> {
  try {
    const localProjects: Project[] = JSON.parse(localStorage.getItem('admaster_local_projects') || '[]');
    const filtered = localProjects.filter((p) => p.id !== projectId);
    localStorage.setItem('admaster_local_projects', JSON.stringify(filtered));
  } catch {}

  if (!auth.currentUser) return;

  try {
    const docRef = doc(db, 'projects', projectId);
    await deleteDoc(docRef);
  } catch {}
}

export async function getAllProjectsAdmin(): Promise<Project[]> {
  try {
    const projectsCol = collection(db, 'projects');
    const snap = await getDocs(projectsCol);
    const cloudProjects = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Project));
    const localProjects: Project[] = JSON.parse(localStorage.getItem('admaster_local_projects') || '[]');
    const cloudIds = new Set(cloudProjects.map((p) => p.id));
    const merged = [...cloudProjects, ...localProjects.filter((lp) => !cloudIds.has(lp.id))];

    if (merged.length === 0) {
      return [
        {
          id: 'proj-demo-1',
          userId: 'usr-customer-101',
          name: 'Summer Linen Shirts Launch',
          type: 'video',
          status: 'completed',
          data: {
            topic: 'Summer Breathable Linen Collection',
            hook: 'Stop wearing synthetic shirts that trap heat this summer.',
            targetPlatform: 'Facebook & Instagram Reels',
          },
          createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'proj-demo-2',
          userId: 'usr-customer-102',
          name: 'Retinol Serum 3-Second Hooks',
          type: 'content',
          status: 'completed',
          data: {
            topic: 'Organic Gentle Night Retinol',
            targetPlatform: 'Instagram',
          },
          createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
    }
    return merged;
  } catch (error) {
    console.error('Error fetching all projects admin:', error);
    return [];
  }
}

// -------------------------------------------------------------
// CONTENT CALENDAR
// -------------------------------------------------------------
export async function getUserCalendarItems(userId: string): Promise<CalendarItem[]> {
  const localItems: CalendarItem[] = JSON.parse(localStorage.getItem('admaster_local_calendar') || '[]')
    .filter((item: any) => item.userId === userId);

  // If no active Firebase Auth session matching this user, return local items cleanly without unauthorized network queries
  if (!auth.currentUser || (auth.currentUser.uid !== userId && auth.currentUser.email !== 'imranmahmud1122.test@gmail.com')) {
    return localItems.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  try {
    const col = collection(db, 'calendarItems');
    const q = query(col, where('userId', '==', userId));
    const snap = await getDocs(q);
    const cloudItems = snap.docs.map((d) => ({ id: d.id, ...d.data() } as CalendarItem));
    const cloudIds = new Set(cloudItems.map((c) => c.id));
    const merged = [...cloudItems, ...localItems.filter((li) => !cloudIds.has(li.id))];
    return merged.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  } catch {
    return localItems.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }
}

export async function createCalendarItem(item: Omit<CalendarItem, 'id'>): Promise<string> {
  const now = new Date().toISOString();
  const localId = 'cal_' + Math.random().toString(36).substring(2, 9);
  const newItem: CalendarItem = { id: localId, ...item, createdAt: now, updatedAt: now };

  try {
    const localItems: CalendarItem[] = JSON.parse(localStorage.getItem('admaster_local_calendar') || '[]');
    localItems.push(newItem);
    localStorage.setItem('admaster_local_calendar', JSON.stringify(localItems));
  } catch {}

  if (!auth.currentUser) {
    return localId;
  }

  try {
    const col = collection(db, 'calendarItems');
    const docRef = await addDoc(col, {
      ...item,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  } catch {
    return localId;
  }
}

export async function updateCalendarItem(id: string, updates: Partial<CalendarItem>): Promise<void> {
  const now = new Date().toISOString();
  try {
    const localItems: CalendarItem[] = JSON.parse(localStorage.getItem('admaster_local_calendar') || '[]');
    const idx = localItems.findIndex((item) => item.id === id);
    if (idx !== -1) {
      localItems[idx] = { ...localItems[idx], ...updates, updatedAt: now };
      localStorage.setItem('admaster_local_calendar', JSON.stringify(localItems));
    }
  } catch {}

  if (!auth.currentUser) return;

  try {
    const docRef = doc(db, 'calendarItems', id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: now,
    });
  } catch {}
}

export async function deleteCalendarItem(id: string): Promise<void> {
  try {
    const localItems: CalendarItem[] = JSON.parse(localStorage.getItem('admaster_local_calendar') || '[]');
    const filtered = localItems.filter((item) => item.id !== id);
    localStorage.setItem('admaster_local_calendar', JSON.stringify(filtered));
  } catch {}

  if (!auth.currentUser) return;

  try {
    const docRef = doc(db, 'calendarItems', id);
    await deleteDoc(docRef);
  } catch {}
}

export const addCalendarItem = createCalendarItem;

// -------------------------------------------------------------
// TEMPLATES CMS
// -------------------------------------------------------------
export async function getTemplates(): Promise<any[]> {
  try {
    const col = collection(db, 'templates');
    const snap = await getDocs(col);
    if (snap.empty) {
      return [
        {
          id: 'tmpl-1',
          title: 'Direct-to-Camera Founder Story',
          category: 'E-commerce',
          description: 'High-trust authentic founder background script hook.',
          content: { hook: 'I spent 3 years trying to fix my chronic back pain...', templateFormat: 'Video' },
          createdAt: new Date().toISOString(),
        },
        {
          id: 'tmpl-2',
          title: '3 Reasons Why You Need This Product',
          category: 'Consumer Goods',
          description: 'Listicle video format for impulse purchase conversions.',
          content: { hook: '3 reasons why over 10,000 remote workers threw away their old chair...', templateFormat: 'Video' },
          createdAt: new Date().toISOString(),
        },
        {
          id: 'tmpl-3',
          title: 'The Viral "Stop Doing X" Pattern Interrupt',
          category: 'Digital Services',
          description: 'Negative bias hook designed to stop high-speed feed scrolling.',
          content: { hook: 'Stop spending $50/day on Facebook ads until you fix this single setting.', templateFormat: 'Video & Carousel' },
          createdAt: new Date().toISOString(),
        },
      ];
    }
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    return [];
  }
}

export async function createTemplate(data: any): Promise<string> {
  const col = collection(db, 'templates');
  const docRef = await addDoc(col, {
    ...data,
    createdAt: new Date().toISOString(),
  });
  return docRef.id;
}

export async function updateTemplate(id: string, updates: any): Promise<void> {
  const docRef = doc(db, 'templates', id);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteTemplate(id: string): Promise<void> {
  const docRef = doc(db, 'templates', id);
  await deleteDoc(docRef);
}

// -------------------------------------------------------------
// LESSONS CMS
// -------------------------------------------------------------
export async function getLessons(): Promise<any[]> {
  try {
    const col = collection(db, 'educationalLessons');
    const snap = await getDocs(col);
    if (snap.empty) {
      return [
        {
          id: 'les-1',
          title: 'Mastering The First 3 Seconds: The Pattern Interrupt',
          category: 'Creative Strategy',
          duration: '4 min read',
          content: '80% of video ad drop-off happens within seconds 0 to 3. If your hook does not present a visual anomaly or trigger an emotional curiosity loop, the viewer swipes away.\n\nKey Rules:\n1. Never show your logo in the first 2 seconds.\n2. Use unexpected motion or sound.\n3. Address the specific customer avatar immediately.',
          published: true,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'les-2',
          title: 'How to Scale Meta Ads from $50/day to $1,000/day',
          category: 'Media Buying',
          duration: '6 min read',
          content: 'Scaling too fast triggers the Meta learning phase reset. Use Advantage+ Campaign Budget (CBO) and increase budgets by no more than 20% every 48 hours once ROAS stabilizes above target.',
          published: true,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'les-3',
          title: 'Direct-Response Storytelling for E-Commerce Reels',
          category: 'Copywriting',
          duration: '5 min read',
          content: 'Follow the 4-part conversion arch: Hook -> Agitation -> Discovery / Transformation -> Irresistible Call-to-Action. Keep scenes under 2.5 seconds each.',
          published: true,
          createdAt: new Date().toISOString(),
        },
      ];
    }
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    return [];
  }
}

export async function createLesson(data: any): Promise<string> {
  const col = collection(db, 'educationalLessons');
  const docRef = await addDoc(col, {
    ...data,
    createdAt: new Date().toISOString(),
  });
  return docRef.id;
}

export async function updateLesson(id: string, updates: any): Promise<void> {
  const docRef = doc(db, 'educationalLessons', id);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteLesson(id: string): Promise<void> {
  const docRef = doc(db, 'educationalLessons', id);
  await deleteDoc(docRef);
}

// -------------------------------------------------------------
// AI PROMPTS CMS
// -------------------------------------------------------------
export async function getAIPrompts(): Promise<any[]> {
  try {
    const col = collection(db, 'aiPrompts');
    const snap = await getDocs(col);
    if (snap.empty) {
      return [
        {
          id: 'prompt-video',
          title: 'Video Script & Scene Direction Engine',
          systemInstructions: 'You are an elite direct-response video scriptwriter. Format scripts with timestamped scenes, audio voiceover, on-screen text, and visual cues.',
          temperature: 0.7,
          version: 1,
        },
        {
          id: 'prompt-planner',
          title: 'Meta Campaign Blueprinting Engine',
          systemInstructions: 'You are a veteran media buyer specializing in Facebook and Instagram ad scaling. Output structured audience interests, CBO budget allocations, and 72-hour testing roadmaps.',
          temperature: 0.6,
          version: 1,
        },
      ];
    }
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    return [];
  }
}

export async function updateAIPrompt(id: string, updates: any): Promise<void> {
  const docRef = doc(db, 'aiPrompts', id);
  await setDoc(docRef, updates, { merge: true });
}


// -------------------------------------------------------------
// AI USAGE LOGGING
// -------------------------------------------------------------
export async function logAIUsage(userId: string, action: string, creditsUsed: number): Promise<void> {
  try {
    const col = collection(db, 'aiUsage');
    await addDoc(col, {
      userId,
      action,
      creditsUsed,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Error logging AI usage:', err);
  }
}

export async function getAIUsageLogs(userId?: string): Promise<any[]> {
  try {
    const col = collection(db, 'aiUsage');
    let snap;
    if (userId) {
      const q = query(col, where('userId', '==', userId));
      snap = await getDocs(q);
    } else {
      snap = await getDocs(col);
    }
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error('Error fetching AI usage logs:', err);
    return [];
  }
}

// -------------------------------------------------------------
// CMS (Lessons & Templates)
// -------------------------------------------------------------
export async function getCMSItems(): Promise<CMSItem[]> {
  try {
    const col = collection(db, 'lessons');
    const snap = await getDocs(col);
    if (snap.empty) {
      return INITIAL_CMS_ITEMS;
    }
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as CMSItem));
  } catch (error) {
    console.error('Error fetching CMS items:', error);
    return INITIAL_CMS_ITEMS;
  }
}

export async function saveCMSItem(item: CMSItem): Promise<void> {
  const docRef = doc(db, 'lessons', item.id);
  await setDoc(docRef, item);
}

export async function deleteCMSItem(id: string): Promise<void> {
  const docRef = doc(db, 'lessons', id);
  await deleteDoc(docRef);
}

// -------------------------------------------------------------
// AI PROMPTS
// -------------------------------------------------------------
export async function getAIPromptTemplates(): Promise<AIPromptTemplate[]> {
  try {
    const col = collection(db, 'aiPrompts');
    const snap = await getDocs(col);
    if (snap.empty) {
      return INITIAL_AI_PROMPTS;
    }
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as AIPromptTemplate));
  } catch (error) {
    console.error('Error fetching AI prompts:', error);
    return INITIAL_AI_PROMPTS;
  }
}

export async function saveAIPromptTemplate(prompt: AIPromptTemplate): Promise<void> {
  const docRef = doc(db, 'aiPrompts', prompt.id);
  await setDoc(docRef, prompt);
}
