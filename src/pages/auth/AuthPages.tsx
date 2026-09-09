import React, { useState } from 'react';
import { useRouter } from '../../context/RouterContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Lock,
  Mail,
  User,
  Briefcase,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';

const BUSINESS_CATEGORIES = [
  'E-commerce',
  'Clothing',
  'Restaurant',
  'Education',
  'Real Estate',
  'Technology',
  'Service',
  'Other',
];

// -------------------------------------------------------------
// 1. User Registration Page
// -------------------------------------------------------------
export const RegisterPage: React.FC = () => {
  const { navigate } = useRouter();
  const { register } = useAuth();
  const { success, error: toastError } = useToast();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessCategory, setBusinessCategory] = useState(BUSINESS_CATEGORIES[0]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password || !businessName) {
      setErrorMsg('Please complete all required fields.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      await register(email, password, fullName, businessName, businessCategory);
      success('Account created successfully! Welcome to AdMaster AI.');
      navigate('/onboarding');
    } catch (err: any) {
      console.error('Registration failed:', err);
      setErrorMsg(
        err.code === 'auth/email-already-in-use'
          ? 'An account with this email already exists. Please sign in instead.'
          : err.message || 'Failed to create account. Please try again.'
      );
      toastError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 mb-4 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-2xl font-bold text-slate-900 font-['Space_Grotesk',sans-serif]">
              AdMaster<span className="text-blue-600">AI</span>
            </span>
          </button>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight font-['Space_Grotesk',sans-serif]">
            Create your marketing account
          </h2>
          <p className="text-xs text-slate-500 mt-2">
            Get 50 free AI generation credits instantly. No credit card required.
          </p>
        </div>

        <Card className="p-6 sm:p-8 shadow-md">
          {errorMsg && (
            <div className="mb-5 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              required
              placeholder="e.g. Alex Rivera"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />

            <Input
              label="Work Email"
              type="email"
              required
              placeholder="alex@mybrand.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Input
              label="Password"
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              helperText="Minimum 6 characters"
            />

            <Input
              label="Business Name"
              type="text"
              required
              placeholder="e.g. Lumina Apparel"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
            />

            <Select
              label="Business Category"
              value={businessCategory}
              onChange={(e) => setBusinessCategory(e.target.value)}
              options={BUSINESS_CATEGORIES.map((cat) => ({ value: cat, label: cat }))}
            />

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full mt-2"
              isLoading={loading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Start Creating Free
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col gap-3 text-center">
            <p className="text-xs text-slate-500">
              Already have an account?{' '}
              <button
                onClick={() => navigate('/login')}
                className="font-semibold text-blue-600 hover:underline cursor-pointer"
              >
                Sign In
              </button>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// 2. User Login Page
// -------------------------------------------------------------
export const LoginPage: React.FC<{ notice?: string }> = ({ notice }) => {
  const { navigate } = useRouter();
  const { login, setDemoUser } = useAuth();
  const { success, error: toastError } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      await login(email, password);
      success('Welcome back!');
      const redirectAfterLogin = sessionStorage.getItem('redirect_after_login') || '/dashboard';
      sessionStorage.removeItem('redirect_after_login');
      navigate(redirectAfterLogin);
    } catch (err: any) {
      console.error('Login error:', err);
      setErrorMsg(
        err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found'
          ? 'Invalid email or password. Please verify your credentials.'
          : err.message || 'Login failed.'
      );
      toastError('Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 mb-4 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-2xl font-bold text-slate-900 font-['Space_Grotesk',sans-serif]">
              AdMaster<span className="text-blue-600">AI</span>
            </span>
          </button>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight font-['Space_Grotesk',sans-serif]">
            Sign in to your account
          </h2>
          <p className="text-xs text-slate-500 mt-2">
            Continue planning your video scripts and ad campaigns
          </p>
        </div>

        {notice && (
          <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs flex items-center gap-2 shadow-2xs">
            <Lock className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="font-medium">{notice}</span>
          </div>
        )}

        <Card className="p-6 sm:p-8 shadow-md">
          {errorMsg && (
            <div className="mb-5 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              required
              placeholder="alex@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="text-xs text-blue-600 hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white text-slate-900 border border-slate-200 text-sm rounded-lg shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <Button type="submit" variant="primary" size="md" className="w-full" isLoading={loading}>
              Sign In
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Need an account?</span>
            <button
              onClick={() => navigate('/register')}
              className="font-semibold text-blue-600 hover:underline cursor-pointer"
            >
              Create Account Free
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// 3. Forgot Password Page
// -------------------------------------------------------------
export const ForgotPasswordPage: React.FC = () => {
  const { navigate } = useRouter();
  const { resetPassword } = useAuth();
  const { success } = useToast();

  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      await resetPassword(email);
      setSubmitted(true);
      success('Password reset email sent! Check your inbox.');
    } catch (err: any) {
      console.error('Reset error:', err);
      setErrorMsg(err.message || 'Failed to send reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 font-['Space_Grotesk',sans-serif]">
            Reset your password
          </h2>
          <p className="text-xs text-slate-500 mt-2">
            Enter your email and we will send you instructions to reset your password.
          </p>
        </div>

        <Card className="p-6 sm:p-8 shadow-md">
          {submitted ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Email Dispatched</h3>
              <p className="text-xs text-slate-600">
                We sent a password reset link to <strong>{email}</strong>.
              </p>
              <Button variant="primary" className="w-full" onClick={() => navigate('/login')}>
                Back to Sign In
              </Button>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                  {errorMsg}
                </div>
              )}
              <Input
                label="Registered Email"
                type="email"
                required
                placeholder="alex@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button type="submit" variant="primary" className="w-full" isLoading={loading}>
                Send Reset Link
              </Button>
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="text-xs text-slate-500 hover:text-slate-800"
                >
                  &larr; Return to Sign In
                </button>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// 4. Admin Portal Login
// -------------------------------------------------------------
export const AdminLoginPage: React.FC = () => {
  const { navigate } = useRouter();
  const { login, setDemoUser } = useAuth();
  const { success, error: toastError } = useToast();

  const [email, setEmail] = useState('imranmahmud1122.test@gmail.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      await login(email, password);
      success('Super Admin session verified for ' + email);
      navigate('/admin');
    } catch (err: any) {
      console.error('Admin login error:', err);
      setErrorMsg('Invalid administrative credentials or insufficient authorization.');
      toastError('Admin verification failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-950">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-3">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight font-['Space_Grotesk',sans-serif]">
            AdMaster AI Admin Gateway
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Restricted access: Authorized Super Administrator only
          </p>
          <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-[11px] font-mono text-amber-300">
            <span>Admin: imranmahmud1122.test@gmail.com</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-5">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Admin Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 text-white text-sm rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 text-white text-sm rounded-lg focus:ring-2 focus:ring-amber-400 focus:outline-none"
              />
            </div>

            <Button
              type="submit"
              variant="secondary"
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
              isLoading={loading}
            >
              Sign In as Administrator
            </Button>
          </form>

          <div className="pt-4 border-t border-slate-800 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-xs text-slate-400 hover:text-slate-200 cursor-pointer block mx-auto"
            >
              &larr; Exit to Public Website
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
