import React, { useState } from 'react';
import { useRouter } from '../../context/RouterContext';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, Menu, X, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '../ui/Button';

export const PublicNavbar: React.FC = () => {
  const { navigate, currentPath } = useRouter();
  const { currentUser, profile, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Features', path: '/features' },
    { label: 'How It Works', path: '/#how-it-works' },
    { label: 'Pricing', path: '/pricing' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' },
  ];

  const handleNav = (path: string) => {
    setMobileMenuOpen(false);
    if (path.startsWith('/#')) {
      navigate('/');
      setTimeout(() => {
        const id = path.replace('/#', '');
        const elem = document.getElementById(id);
        if (elem) elem.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      navigate(path);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2.5 text-left group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-slate-900 font-['Space_Grotesk',sans-serif]">
              AdMaster<span className="text-blue-600">AI</span>
            </span>
            <span className="hidden sm:block text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
              Marketing Intelligence
            </span>
          </div>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => handleNav(link.path)}
              className={`text-sm font-medium transition cursor-pointer ${
                currentPath === link.path
                  ? 'text-blue-600 font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Desktop CTA buttons */}
        <div className="hidden md:flex items-center gap-3">
          {currentUser || profile ? (
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/dashboard')}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Go to Dashboard
              </Button>
              {isAdmin && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate('/admin')}
                  leftIcon={<ShieldCheck className="w-4 h-4 text-amber-400" />}
                >
                  Admin
                </Button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                Sign In
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/register')}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Start Free
              </Button>
            </div>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top-2">
          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => handleNav(link.path)}
                className="text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                {link.label}
              </button>
            ))}
          </div>
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            {currentUser || profile ? (
              <Button
                variant="primary"
                className="w-full"
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/dashboard');
                }}
              >
                Go to Dashboard
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('/login');
                  }}
                >
                  Sign In
                </Button>
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('/register');
                  }}
                >
                  Get Started Free
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export const PublicFooter: React.FC = () => {
  const { navigate } = useRouter();

  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-18">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          {/* Col 1: Brand */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white font-['Space_Grotesk',sans-serif]">
                AdMaster<span className="text-blue-500">AI</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Create Better Content. Plan Smarter Ads. Grow Faster. The all-in-one AI marketing
              workspace for creators, founders, and modern businesses.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-slate-500">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Gemini 2.5 Intelligence Engine &bull; Meta Best Practices</span>
            </div>
          </div>

          {/* Col 2: Products */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-4">
              AI Tools
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => navigate('/video-generator')}
                  className="hover:text-white transition cursor-pointer"
                >
                  Video Script Generator
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/content-generator')}
                  className="hover:text-white transition cursor-pointer"
                >
                  Hook & Caption Generator
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/ads-planner')}
                  className="hover:text-white transition cursor-pointer"
                >
                  Facebook Ads Planner
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/ad-analyzer')}
                  className="hover:text-white transition cursor-pointer"
                >
                  Campaign Analyzer
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/content-calendar')}
                  className="hover:text-white transition cursor-pointer"
                >
                  Content Calendar
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Company */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-4">
              Company
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => navigate('/about')}
                  className="hover:text-white transition cursor-pointer"
                >
                  About Us
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/pricing')}
                  className="hover:text-white transition cursor-pointer"
                >
                  Pricing Plans
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/contact')}
                  className="hover:text-white transition cursor-pointer"
                >
                  Contact & Support
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/features')}
                  className="hover:text-white transition cursor-pointer"
                >
                  Product Roadmap
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Platform & Security */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-4">
              Trust & Security
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li className="text-xs text-slate-400">
                Firestore Cloud Persistence
              </li>
              <li className="text-xs text-slate-400">
                Role-Based Access Control
              </li>
              <li className="text-xs text-slate-400">
                Encrypted Server-Side AI
              </li>
              <li className="pt-2">
                <button
                  onClick={() => navigate('/admin/login')}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Admin Gateway</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} AdMaster AI. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Security</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
      <PublicNavbar />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
};

