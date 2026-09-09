export type UserRole = 'USER' | 'ADMIN';
export type SubscriptionTier = 'FREE' | 'PRO' | 'BUSINESS';
export type SubscriptionStatus = 'ACTIVE' | 'SUSPENDED' | 'EXPIRED' | 'CANCELLED';
export type PaymentStatus = 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  businessName: string;
  businessCategory: string;
  role: UserRole;
  subscription: SubscriptionTier;
  subscriptionPlan?: SubscriptionTier;
  subscriptionStatus?: SubscriptionStatus;
  paymentStatus?: PaymentStatus;
  subscriptionExpiresAt?: string | null;
  credits: number;
  onboardingCompleted: boolean;
  status: 'active' | 'suspended';
  marketingGoal?: string;
  targetAudience?: {
    location: string;
    ageRange: string;
    gender: string;
    customerType: string;
  };
  createdAt: string;
  updatedAt: string;
}

export type ProjectType = 'video' | 'content' | 'campaign' | 'analysis';
export type ProjectStatus = 'draft' | 'active' | 'completed' | 'archived';

export interface Project {
  id: string;
  userId: string;
  name: string;
  type: ProjectType;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
  data: any;
  summary?: string;
}

export interface VideoScriptScene {
  sceneNumber: number;
  timestamp: string;
  voiceover: string;
  onScreenText: string;
  visualDirection: string;
}

export interface VideoScriptResult {
  title: string;
  hook: {
    timestamp: string;
    text: string;
    rationale: string;
  };
  scenes: VideoScriptScene[];
  cta: string;
  caption: string;
  hashtags: string[];
}

export interface ContentGeneratorResult {
  topic: string;
  captions: string[];
  posts: string[];
  hooks: string[];
  ctas: string[];
  hashtags: string[];
}

export interface AdPlannerResult {
  campaignObjective: string;
  recommendedAudience: {
    summary: string;
    demographics: string;
    interests: string[];
    behaviors: string[];
  };
  creativeStrategy: {
    visualHooks: string[];
    adFormats: string[];
    angles: string[];
  };
  budgetStrategy: {
    dailyBudget: string;
    allocation: string;
    duration: string;
    expectedMetrics: string;
  };
  cta: string;
  testingRecommendations: string[];
  potentialRisks: string[];
  optimizationSuggestions: string[];
}

export interface AdAnalyzerMetrics {
  spend: number;
  reach: number;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  ctr: number;
  cpc: number;
  roas: number;
  cpa: number;
  conversionRate: number;
  cpm: number;
}

export interface AdAnalyzerResult {
  metrics: AdAnalyzerMetrics;
  performanceSummary: string;
  strengths: string[];
  weaknesses: string[];
  possibleProblems: string[];
  aiRecommendations: string[];
  nextActions: string[];
}

export interface CalendarItem {
  id: string;
  userId: string;
  title: string;
  contentType: 'Video' | 'Reel' | 'Carousel' | 'Single Image' | 'Story' | 'Text Ad';
  platform: 'Facebook' | 'Instagram' | 'TikTok' | 'YouTube' | 'Multi-Platform';
  date: string;
  scheduledDate?: string;
  status: 'Draft' | 'Planned' | 'Published';
  notes: string;
  caption?: string;
  createdAt: string;
  updatedAt: string;
}

export type VideoScriptOutput = VideoScriptResult;
export type ContentGenerationOutput = ContentGeneratorResult;

export interface AdPlannerOutput {
  recommendedObjective: string;
  targetAudience: {
    demographics: string;
    recommendedInterests: string[];
    exclusions: string;
  };
  creativeStrategy: string[];
  budgetStrategy: {
    split: string;
    biddingType: string;
  };
  callToAction: string;
  potentialRisks: string[];
  optimizationSuggestions: string[];
}

export interface AdAnalysisOutput {
  metrics: {
    ctr: number;
    cpc: number;
    cpm: number;
    roas: number;
    cpa: number;
    conversionRate: number;
  };
  summary: string;
  strengths: string[];
  weaknesses: string[];
  probableProblems: string;
  nextActions: string[];
}

export interface Template {
  id: string;
  title: string;
  category: string;
  description: string;
  content: any;
  createdAt: string;
}

export interface Lesson {
  id: string;
  title: string;
  category: string;
  duration: string;
  content: string;
  published: boolean;
  createdAt: string;
}

export interface AIPromptConfig {
  id: string;
  title: string;
  systemInstructions: string;
  temperature: number;
  version: number;
}


export interface AIPromptTemplate {
  id: string;
  name: string;
  category: 'video' | 'content' | 'campaign' | 'analysis' | 'hooks';
  description: string;
  systemInstructions: string;
  status: 'active' | 'inactive';
  version: string;
  updatedAt: string;
}

export interface CMSItem {
  id: string;
  title: string;
  description: string;
  category: 'Lesson' | 'Guide' | 'Template' | 'Resource';
  content: string;
  status: 'Draft' | 'Published';
  createdAt: string;
}

export interface PlanConfig {
  id: SubscriptionTier;
  name: string;
  price: number;
  currency?: string;
  billing: string;
  monthlyCredits: number;
  maxProjects: number;
  features: string[];
  popular?: boolean;
  active?: boolean;
}

export interface PaymentRecord {
  paymentId: string;
  userId: string;
  userName: string;
  userEmail: string;
  plan: SubscriptionTier;
  amount: number;
  currency?: string;
  paymentMethod: 'BKASH';
  receiverNumber: string;
  transactionId: string;
  paymentStatus: PaymentStatus;
  status?: PaymentStatus;
  submittedAt: string;
  reviewedAt?: string | null;
  reviewedBy?: string | null;
  approvedAt?: string | null;
  rejectedAt?: string | null;
  adminNote?: string;
  paymentNote?: string;
  billingPeriod?: string;
}

export interface AuditLog {
  id: string;
  action: string;
  performedBy: string;
  targetId?: string;
  targetType?: string;
  details?: Record<string, any>;
  timestamp: string;
}

export type NotificationType =
  | 'GENERATION_COMPLETE'
  | 'PLAN_CREATED'
  | 'CREDIT_LIMIT_APPROACHING'
  | 'PROJECT_SAVED'
  | 'PAYMENT_SUBMITTED'
  | 'PAYMENT_APPROVED'
  | 'PAYMENT_REJECTED'
  | 'SYSTEM_ALERT';

export interface NotificationItem {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  link?: string;
  actionLabel?: string;
  meta?: Record<string, any>;
}
