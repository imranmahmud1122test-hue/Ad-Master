import React, { useState } from 'react';
import { useRouter } from '../../context/RouterContext';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldCheck,
  LayoutDashboard,
  Users,
  FolderOpen,
  FileText,
  Bookmark,
  GraduationCap,
  Sparkles,
  CreditCard,
  Receipt,
  BarChart3,
  Settings,
  Lock,
  ArrowLeft,
  Menu,
  X,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '../ui/Button';

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { navigate, currentPath } = useRouter();
  const { profile, isAdmin, loading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const adminNav = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'Users', path: '/admin/users', icon: Users },
    { label: 'Payments', path: '/admin/payments', icon: Receipt },
    { label: 'Projects', path: '/admin/projects', icon: FolderOpen },
    { label: 'Content CMS', path: '/admin/content', icon: FileText },
    { label: 'Templates', path: '/admin/templates', icon: Bookmark },
    { label: 'Lessons', path: '/admin/lessons', icon: GraduationCap },
    { label: 'AI Prompts', path: '/admin/prompts', icon: Sparkles },
    { label: 'Subscriptions', path: '/admin/subscriptions', icon: CreditCard },
    { label: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
    { label: 'Platform Settings', path: '/admin/settings', icon: Settings },
    { label: 'Security & Audit', path: '/admin/security', icon: Lock },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-amber-400 animate-pulse" />
          <span>Verifying administrator credentials...</span>
        </div>
      </div>
    );
  }

  // Authorization enforcement: If user is not admin, deny access
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-2xl p-8 text-center text-white shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto mb-4 border border-rose-500/20">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold mb-2">403 Access Denied</h2>
          <p className="text-sm text-slate-300 mb-6 leading-relaxed">
            You do not have permission to access the AdMaster AI Administration Portal. This incident has been logged.
          </p>
          <div className="flex flex-col gap-2">
            <Button
              variant="primary"
              className="w-full"
              onClick={() => navigate('/admin/login')}
            >
              Sign in as Admin
            </Button>
            <Button
              variant="outline"
              className="w-full text-white bg-slate-700 border-slate-600 hover:bg-slate-600"
              onClick={() => navigate('/dashboard')}
            >
              Return to User Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleNav = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden sticky top-0 z-30 bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-amber-400" />
          <span className="font-bold tracking-tight">AdMaster Admin</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Admin Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col justify-between transition-transform duration-200 ease-in-out md:translate-x-0 md:static ${
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Admin Header */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-base font-bold text-white tracking-tight block">
                  Admin Portal
                </span>
                <span className="text-[10px] uppercase font-semibold text-amber-400 tracking-wider">
                  Superuser Access
                </span>
              </div>
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              className="md:hidden text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
              System Management
            </p>
            {adminNav.map((item) => {
              const Icon = item.icon;
              const active = currentPath === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => handleNav(item.path)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition cursor-pointer ${
                    active
                      ? 'bg-amber-500/15 text-amber-300 font-semibold border-l-2 border-amber-400'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Footer quick action to jump back to user workspace */}
          <div className="p-4 border-t border-slate-800 bg-slate-950">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to App Workspace</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Admin Content Canvas */}
      <main className="flex-1 min-w-0 flex flex-col overflow-y-auto">
        <header className="hidden md:flex sticky top-0 z-20 h-16 bg-white border-b border-slate-200 px-6 sm:px-8 items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              Admin Mode
            </span>
            <span className="text-slate-300">/</span>
            <span className="text-sm font-semibold text-slate-800 capitalize">
              {currentPath.replace('/admin/', '').replace('/admin', 'Dashboard').replace('-', ' ')}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-xs text-slate-500">
              Signed in as <strong className="text-slate-800">{profile?.email}</strong>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="text-xs text-blue-600 hover:underline font-medium cursor-pointer"
            >
              Switch to Client View &rarr;
            </button>
          </div>
        </header>

        <div className="p-4 sm:p-6 lg:p-8 flex-1">{children}</div>
      </main>
    </div>
  );
};
