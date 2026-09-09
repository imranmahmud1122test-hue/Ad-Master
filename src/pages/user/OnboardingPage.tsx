import React, { useState } from 'react';
import { useRouter } from '../../context/RouterContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Building,
  Target,
  Users,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/FeedbackComponents';

const BUSINESS_TYPES = [
  'E-commerce',
  'Clothing & Apparel',
  'Restaurant & Food',
  'Education & Coaching',
  'Real Estate',
  'Technology & SaaS',
  'Professional Service',
  'Health & Beauty',
];

const MARKETING_GOALS = [
  { id: 'Sales', title: 'Drive E-commerce Sales', desc: 'Direct purchases and product catalog checkouts' },
  { id: 'Leads', title: 'Generate Qualified Leads', desc: 'Form submissions, phone inquiries, and bookings' },
  { id: 'Messages', title: 'Start Direct Messages', desc: 'Inbound conversations via Messenger, WhatsApp & IG DM' },
  { id: 'Website Traffic', title: 'Maximize Website Traffic', desc: 'High-volume qualified visitor clicks to landing pages' },
  { id: 'Engagement', title: 'Boost Engagement', desc: 'Video views, comments, shares, and social community growth' },
  { id: 'Brand Awareness', title: 'Build Brand Awareness', desc: 'Broad reach and recall across your target market' },
];

export const OnboardingPage: React.FC = () => {
  const { navigate } = useRouter();
  const { profile, completeOnboarding } = useAuth();
  const { success } = useToast();

  const [step, setStep] = useState(1);
  const [businessType, setBusinessType] = useState(profile?.businessCategory || BUSINESS_TYPES[0]);
  const [marketingGoal, setMarketingGoal] = useState('Sales');
  const [location, setLocation] = useState('United States & Canada');
  const [ageRange, setAgeRange] = useState('22 - 45');
  const [gender, setGender] = useState('All');
  const [customerType, setCustomerType] = useState('Online shoppers seeking high quality');
  const [loading, setLoading] = useState(false);

  const handleFinish = async () => {
    setLoading(true);
    try {
      await completeOnboarding({
        businessType,
        marketingGoal,
        targetAudience: {
          location,
          ageRange,
          gender,
          customerType,
        },
      });
      success('Workspace configured! Welcome to your dashboard.');
      navigate('/dashboard');
    } catch (err) {
      console.error('Failed to complete onboarding:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl w-full space-y-8">
        {/* Top brand header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-slate-900 font-['Space_Grotesk',sans-serif]">
              AdMaster AI
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-['Space_Grotesk',sans-serif]">
            Let&apos;s personalize your marketing engine
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Step {step} of 3 &bull; Takes less than 60 seconds
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-between max-w-sm mx-auto">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step === s
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                    : step > s
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
              </div>
              <span
                className={`text-xs font-medium hidden sm:inline ${
                  step === s ? 'text-blue-600 font-semibold' : 'text-slate-400'
                }`}
              >
                {s === 1 ? 'Business' : s === 2 ? 'Goals' : 'Audience'}
              </span>
            </div>
          ))}
        </div>

        {/* Card Content */}
        <Card className="p-6 sm:p-10 shadow-lg border-slate-200/90">
          {/* STEP 1: BUSINESS TYPE */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
                <Building className="w-5 h-5 text-blue-600" />
                <div>
                  <h2 className="text-lg font-bold text-slate-900">What type of business do you run?</h2>
                  <p className="text-xs text-slate-500">
                    This trains the AI on industry terminology and creative formats.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {BUSINESS_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setBusinessType(type)}
                    className={`p-4 rounded-xl text-left border transition cursor-pointer ${
                      businessType === type
                        ? 'border-blue-600 bg-blue-50/70 text-blue-900 font-semibold ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                    }`}
                  >
                    <span className="text-sm block">{type}</span>
                  </button>
                ))}
              </div>

              <div className="pt-4 flex justify-end">
                <Button
                  variant="primary"
                  onClick={() => setStep(2)}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Continue to Goal
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: MARKETING GOAL */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
                <Target className="w-5 h-5 text-blue-600" />
                <div>
                  <h2 className="text-lg font-bold text-slate-900">What is your primary advertising goal?</h2>
                  <p className="text-xs text-slate-500">
                    We customize your hooks and campaign objectives around this priority.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {MARKETING_GOALS.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setMarketingGoal(g.id)}
                    className={`p-4 rounded-xl text-left border transition cursor-pointer ${
                      marketingGoal === g.id
                        ? 'border-blue-600 bg-blue-50/70 text-blue-900 ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                    }`}
                  >
                    <span className="text-sm font-bold block mb-1">{g.title}</span>
                    <span className="text-xs text-slate-500 block leading-tight">{g.desc}</span>
                  </button>
                ))}
              </div>

              <div className="pt-4 flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  leftIcon={<ArrowLeft className="w-4 h-4" />}
                >
                  Back
                </Button>
                <Button
                  variant="primary"
                  onClick={() => setStep(3)}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Continue to Target Customer
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: TARGET CUSTOMER */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
                <Users className="w-5 h-5 text-blue-600" />
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Who is your ideal target audience?</h2>
                  <p className="text-xs text-slate-500">
                    Define the core demographic for your video scripts and ad sets.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Primary Location / Market
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. United States, United Kingdom"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Target Age Range
                  </label>
                  <select
                    value={ageRange}
                    onChange={(e) => setAgeRange(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
                  >
                    <option>18 - 25</option>
                    <option>22 - 45</option>
                    <option>30 - 55</option>
                    <option>45 - 65+</option>
                    <option>All Ages</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Target Gender
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
                  >
                    <option>All</option>
                    <option>Women</option>
                    <option>Men</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Ideal Customer Type
                  </label>
                  <input
                    type="text"
                    value={customerType}
                    onChange={(e) => setCustomerType(e.target.value)}
                    placeholder="e.g. Busy parents, B2B founders, fitness lovers"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={() => setStep(2)}
                  leftIcon={<ArrowLeft className="w-4 h-4" />}
                >
                  Back
                </Button>
                <Button
                  variant="primary"
                  onClick={handleFinish}
                  isLoading={loading}
                  rightIcon={<Sparkles className="w-4 h-4" />}
                >
                  Launch Workspace
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
