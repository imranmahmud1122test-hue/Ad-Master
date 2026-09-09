import React from 'react';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { RouterProvider, useRouter } from './context/RouterContext';

// Layouts
import { PublicLayout } from './components/layout/PublicLayout';
import { UserLayout } from './components/layout/UserLayout';
import { AdminLayout } from './components/layout/AdminLayout';

// Public Pages
import { HomePage } from './pages/public/HomePage';
import { FeaturesPage } from './pages/public/FeaturesPage';
import { PricingPage, AboutPage, ContactPage } from './pages/public/StaticPages';

// Auth Pages
import {
  LoginPage,
  RegisterPage,
  ForgotPasswordPage,
  AdminLoginPage,
} from './pages/auth/AuthPages';

// User Pages
import { OnboardingPage } from './pages/user/OnboardingPage';
import { UserDashboardPage } from './pages/user/UserDashboardPage';
import { VideoGeneratorPage } from './pages/user/VideoGeneratorPage';
import { ContentGeneratorPage } from './pages/user/ContentGeneratorPage';
import { ContentCalendarPage } from './pages/user/ContentCalendarPage';
import { AdsPlannerPage } from './pages/user/AdsPlannerPage';
import { AdAnalyzerPage } from './pages/user/AdAnalyzerPage';
import { ProjectsPage } from './pages/user/ProjectsPage';
import { ProjectDetailPage } from './pages/user/ProjectDetailPage';
import { ProfilePage, SettingsPage } from './pages/user/ProfileAndSettings';
import { SubscriptionPage } from './pages/user/SubscriptionPage';

// Admin Pages
import {
  AdminDashboardPage,
  AdminUsersPage,
  AdminTemplatesPage,
  AdminLessonsPage,
  AdminPromptsPage,
} from './pages/admin/AdminPages';
import {
  AdminSubscriptionsPage,
  AdminAnalyticsPage,
  AdminSecurityPage,
  AdminProjectsAuditPage,
} from './pages/admin/AdminExtraPages';
import { AdminPaymentsPage } from './pages/admin/AdminPaymentsPage';

const AppRoutes: React.FC = () => {
  const { currentPath } = useRouter();
  const { currentUser, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
          <span className="text-sm font-semibold tracking-wide">
            Initializing AdMaster AI...
          </span>
        </div>
      </div>
    );
  }

  // 1. Check for single project detail path: /projects/:id
  if (currentPath.startsWith('/projects/')) {
    if (!profile) {
      sessionStorage.setItem('redirect_after_login', currentPath);
      return (
        <LoginPage notice="🔒 Member Access Required: Please log in or create an account first to access your project." />
      );
    }
    const projectId = currentPath.replace('/projects/', '');
    return (
      <UserLayout>
        <ProjectDetailPage projectId={projectId} />
      </UserLayout>
    );
  }

  // 2. Admin routes (/admin/*)
  if (currentPath.startsWith('/admin')) {
    if (currentPath === '/admin/login') {
      return <AdminLoginPage />;
    }

    return (
      <AdminLayout>
        {(() => {
          switch (currentPath) {
            case '/admin':
              return <AdminDashboardPage />;
            case '/admin/users':
              return <AdminUsersPage />;
            case '/admin/payments':
              return <AdminPaymentsPage />;
            case '/admin/projects':
              return <AdminProjectsAuditPage />;
            case '/admin/content':
            case '/admin/templates':
              return <AdminTemplatesPage />;
            case '/admin/lessons':
              return <AdminLessonsPage />;
            case '/admin/prompts':
              return <AdminPromptsPage />;
            case '/admin/subscriptions':
            case '/admin/settings':
              return <AdminSubscriptionsPage />;
            case '/admin/analytics':
              return <AdminAnalyticsPage />;
            case '/admin/security':
              return <AdminSecurityPage />;
            default:
              return <AdminDashboardPage />;
          }
        })()}
      </AdminLayout>
    );
  }

  // 3. Protected User Workspace routes (Mandatory Login / Account creation)
  const userWorkspaceRoutes = [
    '/dashboard',
    '/video-generator',
    '/content-generator',
    '/content-calendar',
    '/ads-planner',
    '/ad-analyzer',
    '/projects',
    '/subscription',
    '/profile/subscription',
    '/profile',
    '/settings',
  ];

  const isWorkspacePath =
    userWorkspaceRoutes.includes(currentPath) ||
    currentPath.startsWith('/projects/') ||
    currentPath === '/onboarding';

  if (isWorkspacePath) {
    if (!profile) {
      sessionStorage.setItem('redirect_after_login', currentPath);
      return (
        <LoginPage notice="🔒 Member Access Required: Please log in or create an account first to access your AdMaster workspace." />
      );
    }

    if (currentPath === '/onboarding') {
      return <OnboardingPage />;
    }

    if (currentPath.startsWith('/projects/')) {
      const projectId = currentPath.replace('/projects/', '');
      return (
        <UserLayout>
          <ProjectDetailPage projectId={projectId} />
        </UserLayout>
      );
    }

    return (
      <UserLayout>
        {(() => {
          switch (currentPath) {
            case '/dashboard':
              return <UserDashboardPage />;
            case '/video-generator':
              return <VideoGeneratorPage />;
            case '/content-generator':
              return <ContentGeneratorPage />;
            case '/content-calendar':
              return <ContentCalendarPage />;
            case '/ads-planner':
              return <AdsPlannerPage />;
            case '/ad-analyzer':
              return <AdAnalyzerPage />;
            case '/projects':
              return <ProjectsPage />;
            case '/subscription':
            case '/profile/subscription':
              return <SubscriptionPage />;
            case '/profile':
              return <ProfilePage />;
            case '/settings':
              return <SettingsPage />;
            default:
              return <UserDashboardPage />;
          }
        })()}
      </UserLayout>
    );
  }

  // 4. Auth pages
  if (currentPath === '/login') return <LoginPage />;
  if (currentPath === '/register') return <RegisterPage />;
  if (currentPath === '/forgot-password') return <ForgotPasswordPage />;

  // 5. Public Pages (Default wrapped in PublicLayout)
  return (
    <PublicLayout>
      {(() => {
        switch (currentPath) {
          case '/':
            return <HomePage />;
          case '/features':
            return <FeaturesPage />;
          case '/pricing':
            return <PricingPage />;
          case '/about':
            return <AboutPage />;
          case '/contact':
            return <ContactPage />;
          default:
            return <HomePage />;
        }
      })()}
    </PublicLayout>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <NotificationProvider>
          <RouterProvider>
            <AppRoutes />
          </RouterProvider>
        </NotificationProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
