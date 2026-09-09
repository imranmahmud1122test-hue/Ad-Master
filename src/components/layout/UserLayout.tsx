import React, { useState } from 'react';
import { useRouter } from '../../context/RouterContext';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Video,
  FileText,
  Calendar,
  Layers,
  BarChart3,
  FolderOpen,
  Target,
  CreditCard,
  User,
  Settings,
  Sparkles,
  LogOut,
  Menu,
  X,
  Plus,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/FeedbackComponents';
import { NotificationBell } from '../notifications/NotificationBell';

export const UserLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { navigate, currentPath } = useRouter();
  const { profile, isAdmin, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Video Generator', path: '/video-generator', icon: Video },
    { label: 'Content Generator', path: '/content-generator', icon: FileText },
    { label: 'Content Calendar', path: '/content-calendar', icon: Calendar },
    { label: 'Ads Planner', path: '/ads-planner', icon: Layers },
    { label: 'Ad Analyzer', path: '/ad-analyzer', icon: BarChart3 },
    { label: 'My Projects', path: '/projects', icon: FolderOpen },
  ];

  const bottomNavItems = [
    { label: 'Billing & Plan', path: '/subscription', icon: CreditCard },
    { label: 'Profile', path: '/profile', icon: User },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  const handleNav = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  const credits = profile?.credits ?? 0;
  const maxCredits =
    profile?.subscription === 'BUSINESS'
      ? 1200
      : profile?.subscription === 'PRO'
      ? 350
      : 50;
  const creditPercent = Math.min(100, Math.round((credits / maxCredits) * 100));

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile top bar */}
      <div className="md:hidden sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-left cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-bold text-slate-900 tracking-tight font-['Space_Grotesk',sans-serif]">
            AdMaster AI
          </span>
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-200 flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
            {credits}
          </span>
          <NotificationBell />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Desktop & Mobile Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-200 ease-in-out md:translate-x-0 md:static ${
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Brand header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <button
              onClick={() => handleNav('/dashboard')}
              className="flex items-center gap-2.5 text-left cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-base font-bold tracking-tight text-slate-900 font-['Space_Grotesk',sans-serif] block">
                  AdMaster<span className="text-blue-600">AI</span>
                </span>
                <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                  Marketing Studio
                </span>
              </div>
            </button>
            <button
              onClick={() => setMobileOpen(false)}
              className="md:hidden p-1 rounded-md text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Organization Preview */}
          <div className="px-4 py-3 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between">
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-slate-800 truncate">
                {profile?.businessName || 'Workspace'}
              </p>
              <p className="text-[10px] text-slate-500 truncate capitalize">
                {profile?.businessCategory || 'General'} &bull; {profile?.subscription || 'FREE'}
              </p>
            </div>
            <Badge
              variant={
                profile?.subscription === 'BUSINESS'
                  ? 'purple'
                  : profile?.subscription === 'PRO'
                  ? 'emerald'
                  : 'blue'
              }
              size="sm"
            >
              {profile?.subscription || 'FREE'}
            </Badge>
          </div>

          {/* Navigation items */}
          <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Workspace
            </p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = currentPath === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => handleNav(item.path)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition cursor-pointer ${
                    active
                      ? 'bg-blue-50 text-blue-700 font-semibold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}

            <div className="pt-4 pb-2">
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Preferences
              </p>
              {bottomNavItems.map((item) => {
                const Icon = item.icon;
                const active = currentPath === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNav(item.path)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${
                      active
                        ? 'bg-blue-50 text-blue-700 font-semibold shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-blue-600' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}

              {isAdmin && (
                <button
                  onClick={() => handleNav('/admin')}
                  className="w-full mt-2 flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium bg-amber-50 text-amber-900 border border-amber-200/80 hover:bg-amber-100/80 transition cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="font-semibold">Admin Panel</span>
                </button>
              )}
            </div>
          </div>

          {/* Credits Box */}
          <div className="p-4 border-t border-slate-100 bg-white">
            <div className="p-3.5 rounded-xl bg-slate-900 text-white shadow-xs">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-300 font-medium flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  AI Credits
                </span>
                <span className="font-bold text-amber-400">
                  {credits} <span className="text-slate-400 font-normal">/ {maxCredits}</span>
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 mb-3 overflow-hidden">
                <div
                  className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${creditPercent}%` }}
                />
              </div>
              <button
                onClick={() => handleNav('/pricing')}
                className="w-full py-1.5 px-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg text-center transition cursor-pointer"
              >
                Upgrade Plan
              </button>
            </div>

            {/* Logout button */}
            <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100">
              <div className="overflow-hidden pr-2">
                <p className="text-xs font-medium text-slate-800 truncate">
                  {profile?.displayName || 'User'}
                </p>
                <p className="text-[10px] text-slate-400 truncate">{profile?.email}</p>
              </div>
              <button
                onClick={async () => {
                  await logout();
                  navigate('/');
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                title="Log out"
                aria-label="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile menu */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-xs md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main Workspace Content */}
      <main className="flex-1 min-w-0 flex flex-col overflow-y-auto">
        <header className="hidden md:flex sticky top-0 z-20 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200 px-6 sm:px-8 items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Workspace
            </span>
            <span className="text-slate-300">/</span>
            <span className="text-sm font-semibold text-slate-800 capitalize">
              {currentPath.replace('/', '').replace('-', ' ') || 'Dashboard'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-full text-xs font-medium text-slate-700">
              <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>
                <strong>{credits}</strong> credits available
              </span>
            </div>
            <NotificationBell />
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => navigate('/video-generator')}
            >
              New Project
            </Button>
          </div>
        </header>

        <div className="p-4 sm:p-6 lg:p-8 flex-1">{children}</div>
      </main>
    </div>
  );
};
