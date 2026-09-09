import React, { useState } from 'react';
import { useRouter } from '../../context/RouterContext';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle2, Zap, HelpCircle, ShieldCheck } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/FeedbackComponents';
import { DEFAULT_PLANS } from '../../services/firestoreService';
import { useToast } from '../../context/ToastContext';
import { updateUserProfile } from '../../services/firestoreService';

export const PricingPage: React.FC = () => {
  const { navigate } = useRouter();
  const { profile, currentUser, refreshProfile } = useAuth();
  const { success, info } = useToast();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const handleSelectPlan = async (tier: 'FREE' | 'PRO' | 'BUSINESS') => {
    if (!currentUser && !profile) {
      navigate('/register');
      return;
    }

    if (profile?.subscription === tier) {
      info(`You are currently on the ${tier} plan.`);
      return;
    }

    // Update user profile in Firestore
    if (profile) {
      const additionalCredits =
        tier === 'BUSINESS' ? 1200 : tier === 'PRO' ? 350 : 50;
      await updateUserProfile(profile.uid, {
        subscription: tier,
        credits: additionalCredits,
      });
      await refreshProfile();
      success(`Successfully updated subscription to ${tier}! You now have ${additionalCredits} credits.`);
      navigate('/dashboard');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <Badge variant="purple" size="md">
          Simple, Predictable Plans
        </Badge>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mt-3 font-['Space_Grotesk',sans-serif]">
          Invest in High-Performing Social Ads
        </h1>
        <p className="text-base text-slate-600 mt-4 leading-relaxed">
          Choose a plan that fits your business stage. Every plan includes full access to our
          video script engine and campaign blueprints.
        </p>

        {/* Toggle */}
        <div className="mt-8 inline-flex items-center p-1 rounded-xl bg-slate-200/80 border border-slate-300/60 text-xs font-semibold">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-4 py-2 rounded-lg transition cursor-pointer ${
              billingCycle === 'monthly'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setBillingCycle('annual')}
            className={`px-4 py-2 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
              billingCycle === 'annual'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Annual Billing</span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
              Save 20%
            </span>
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
        {DEFAULT_PLANS.map((plan) => {
          const isCurrent = profile?.subscription === plan.id;
          const displayPrice =
            billingCycle === 'annual' && plan.price > 0
              ? Math.round(plan.price * 0.8)
              : plan.price;

          return (
            <div
              key={plan.id}
              className={`rounded-2xl p-8 flex flex-col justify-between transition-all bg-white relative ${
                plan.popular
                  ? 'border-2 border-blue-600 shadow-xl'
                  : 'border border-slate-200 shadow-xs'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[11px] font-bold uppercase tracking-wider px-3.5 py-1 rounded-full shadow-xs">
                  Most Popular for Creators
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                  {isCurrent && (
                    <Badge variant="emerald" size="sm">
                      Current Plan
                    </Badge>
                  )}
                </div>

                <p className="text-xs text-slate-500 mb-6 min-h-[32px]">
                  {plan.id === 'FREE'
                    ? 'Explore AI video scripts and hook generation with zero risk.'
                    : plan.id === 'PRO'
                    ? 'For brands running weekly video ads who need diagnostic depth.'
                    : 'For scaling marketing teams requiring bulk AI scripts and CMS resources.'}
                </p>

                {/* Price Display */}
                <div className="mb-6 pb-6 border-b border-slate-100">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl sm:text-5xl font-extrabold text-slate-900 font-['Space_Grotesk',sans-serif]">
                      ${displayPrice}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      /{plan.price === 0 ? 'forever' : 'month'}
                    </span>
                  </div>
                  {billingCycle === 'annual' && plan.price > 0 && (
                    <span className="text-[11px] text-emerald-600 font-semibold block mt-1">
                      Billed annually (billed as ${displayPrice * 12}/yr)
                    </span>
                  )}
                </div>

                {/* Credit metric */}
                <div className="mb-6 p-3 rounded-xl bg-blue-50/60 border border-blue-100 flex items-center justify-between text-xs">
                  <span className="text-slate-700 font-medium flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                    Monthly Credits:
                  </span>
                  <span className="font-bold text-blue-700 text-sm">
                    {plan.monthlyCredits.toLocaleString()}
                  </span>
                </div>

                {/* Feature checklist */}
                <p className="text-[11px] uppercase font-bold text-slate-400 tracking-wider mb-3">
                  Included Capabilities:
                </p>
                <ul className="space-y-3 text-xs text-slate-600 mb-8">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                variant={plan.popular ? 'primary' : 'outline'}
                size="md"
                className="w-full"
                onClick={() => handleSelectPlan(plan.id)}
              >
                {isCurrent
                  ? 'Your Active Plan'
                  : plan.id === 'FREE'
                  ? 'Get Started Free'
                  : `Upgrade to ${plan.name}`}
              </Button>
            </div>
          );
        })}
      </div>

      {/* Feature comparison table */}
      <div className="max-w-4xl mx-auto rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
        <h3 className="text-lg font-bold text-slate-900 mb-6 font-['Space_Grotesk',sans-serif]">
          Detailed Plan Limits &amp; Feature Comparison
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="pb-3">Capability</th>
                <th className="pb-3 text-center">Free</th>
                <th className="pb-3 text-center">Pro</th>
                <th className="pb-3 text-center font-bold text-blue-600">Business</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr>
                <td className="py-3 font-medium">Monthly AI Credits</td>
                <td className="py-3 text-center">50</td>
                <td className="py-3 text-center font-semibold">350</td>
                <td className="py-3 text-center font-bold text-blue-600">1,200</td>
              </tr>
              <tr>
                <td className="py-3 font-medium">Saved Marketing Projects</td>
                <td className="py-3 text-center">Up to 5</td>
                <td className="py-3 text-center">Up to 35</td>
                <td className="py-3 text-center font-bold text-blue-600">Unlimited</td>
              </tr>
              <tr>
                <td className="py-3 font-medium">Video Script Generator</td>
                <td className="py-3 text-center">Basic (30s)</td>
                <td className="py-3 text-center">Full (15s, 30s, 60s)</td>
                <td className="py-3 text-center font-bold text-blue-600">Full + Custom Tones</td>
              </tr>
              <tr>
                <td className="py-3 font-medium">Ad Performance Analyzer</td>
                <td className="py-3 text-center text-slate-400">&mdash;</td>
                <td className="py-3 text-center text-emerald-600 font-semibold">&check; Full</td>
                <td className="py-3 text-center text-emerald-600 font-bold">&check; Full + Priority</td>
              </tr>
              <tr>
                <td className="py-3 font-medium">Content Calendar</td>
                <td className="py-3 text-center">Month view</td>
                <td className="py-3 text-center">Month, Week, List</td>
                <td className="py-3 text-center font-bold text-blue-600">Full Collaboration</td>
              </tr>
              <tr>
                <td className="py-3 font-medium">CMS Lessons &amp; Templates</td>
                <td className="py-3 text-center text-slate-400">&mdash;</td>
                <td className="py-3 text-center text-emerald-600">&check;</td>
                <td className="py-3 text-center text-emerald-600 font-bold">&check; Complete Access</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export const AboutPage: React.FC = () => {
  const { navigate } = useRouter();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-16">
      <div className="text-center max-w-3xl mx-auto">
        <Badge variant="blue" size="md">
          Our Mission
        </Badge>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mt-3 font-['Space_Grotesk',sans-serif]">
          Democratizing Direct-Response Marketing for Every Business
        </h1>
        <p className="text-base text-slate-600 mt-4 leading-relaxed">
          We believe small businesses and creators shouldn&apos;t need a $10,000/month agency to run
          profitable Facebook and social media campaigns.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900 font-['Space_Grotesk',sans-serif]">
            Why 90% of Social Ads Fail
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Most business owners burn ad budgets because they start with generic graphics and weak,
            passive copy. On Meta, TikTok, and YouTube, user attention is measured in milliseconds.
            If your first 3 seconds don&apos;t trigger curiosity or solve a burning problem, viewers scroll away.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">
            AdMaster AI incorporates verified direct-response formulas used by the top 1% of media
            buyers: hook psychology, pattern interrupts, objection elimination, and frictionless calls to action.
          </p>
        </div>

        <div className="p-8 rounded-2xl bg-slate-900 text-white space-y-4">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-mono font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>THE ADMASTER PILLARS</span>
          </div>
          <div className="space-y-3 text-xs text-slate-300">
            <div>
              <strong className="text-white block text-sm">1. Scroll-Stopping Hooks:</strong>
              Hook retention dictates your cost-per-thousand-impressions (CPM).
            </div>
            <div>
              <strong className="text-white block text-sm">2. Clear Scene Direction:</strong>
              Tell creators and editors exactly what to shoot and display on screen.
            </div>
            <div>
              <strong className="text-white block text-sm">3. Objective Diagnosis:</strong>
              Never guess why an ad isn&apos;t converting; calculate the numbers and diagnose the bottleneck.
            </div>
          </div>
        </div>
      </div>

      <div className="p-8 rounded-2xl bg-blue-50 border border-blue-200 text-center">
        <h3 className="text-xl font-bold text-slate-900 mb-2 font-['Space_Grotesk',sans-serif]">
          Ready to experience the difference?
        </h3>
        <p className="text-sm text-slate-600 max-w-md mx-auto mb-5">
          Join thousands of modern founders creating high-converting campaigns.
        </p>
        <Button variant="primary" onClick={() => navigate('/register')}>
          Get Started Free
        </Button>
      </div>
    </div>
  );
};

export const ContactPage: React.FC = () => {
  const { success } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('General Inquiry');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    success('Message sent! Our marketing support team will respond within 24 hours.');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-12">
      <div className="text-center max-w-2xl mx-auto">
        <Badge variant="emerald" size="md">
          Support &amp; Inquiries
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3 font-['Space_Grotesk',sans-serif]">
          We&apos;re Here to Help Your Campaigns Scale
        </h1>
        <p className="text-sm text-slate-600 mt-2">
          Have questions about the platform, enterprise plans, or campaign optimization? Send us a message.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4">
          <h3 className="text-base font-bold text-slate-900">Direct Support</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Our team of media buyers and engineers is available Monday through Friday.
          </p>
          <div className="space-y-2 text-xs text-slate-700 pt-2 border-t border-slate-100">
            <div>
              <span className="font-semibold text-slate-900 block">Email:</span>
              <span>support@admasterai.com</span>
            </div>
            <div>
              <span className="font-semibold text-slate-900 block">Office:</span>
              <span>San Francisco, CA &bull; Global Remote</span>
            </div>
            <div>
              <span className="font-semibold text-slate-900 block">Status:</span>
              <span className="text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                All Systems Operational
              </span>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 p-6 sm:p-8 rounded-2xl border border-slate-200 bg-white shadow-xs">
          {submitted ? (
            <div className="text-center py-10 space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Message Delivered</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Thank you, {name || 'there'}. We have received your inquiry and will follow up shortly.
              </p>
              <Button variant="outline" size="sm" onClick={() => setSubmitted(false)}>
                Send Another Note
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Morgan"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Work Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@company.com"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Inquiry Topic
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option>General Inquiry</option>
                  <option>Technical Question or Bug</option>
                  <option>Subscription or Credit Limit</option>
                  <option>Agency or Custom Enterprise Plan</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  How can we help?
                </label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us what you're trying to accomplish..."
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <Button type="submit" variant="primary" size="md" className="w-full">
                Send Message
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
