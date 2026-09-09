import React, { useState } from 'react';
import { useRouter } from '../../context/RouterContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  Layers,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Target,
  DollarSign,
  Tv,
  Save,
  Copy,
  Check,
  ShieldAlert,
  Info,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input, Textarea, Select } from '../../components/ui/Input';
import { Badge, AILoadingState } from '../../components/ui/FeedbackComponents';
import { AdPlannerOutput } from '../../types';
import { createProject } from '../../services/firestoreService';
import { useNotifications } from '../../context/NotificationContext';

export const AdsPlannerPage: React.FC = () => {
  const { navigate } = useRouter();
  const { profile, consumeCredits } = useAuth();
  const { success, error, info } = useToast();
  const { notify } = useNotifications();

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 7;

  // Step 1: Objective
  const [objective, setObjective] = useState('Sales');
  // Step 2: Product
  const [productName, setProductName] = useState('');
  const [productDesc, setProductDesc] = useState('');
  const [productPrice, setProductPrice] = useState('$49');
  // Step 3: Landing Page
  const [landingPage, setLandingPage] = useState('https://');
  // Step 4: Audience
  const [location, setLocation] = useState(profile?.targetAudience?.location || 'United States');
  const [ageRange, setAgeRange] = useState(profile?.targetAudience?.ageRange || '25 - 45');
  const [gender, setGender] = useState(profile?.targetAudience?.gender || 'All');
  const [interests, setInterests] = useState('E-commerce, Fitness, Direct-to-Consumer brands');
  const [customerType, setCustomerType] = useState('Active online purchasers');
  // Step 5: Budget
  const [dailyBudget, setDailyBudget] = useState('$30 / day');
  const [duration, setDuration] = useState('14 days');
  // Step 6: Creative
  const [creativeFormat, setCreativeFormat] = useState('Short-Form Video (9:16)');
  // Step 7: CTA
  const [callToAction, setCallToAction] = useState('Shop Now');

  // Generation & Output
  const [generating, setGenerating] = useState(false);
  const [blueprint, setBlueprint] = useState<AdPlannerOutput | null>(null);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGeneratePlan = async () => {
    if (!productName.trim()) {
      error('Please enter the product or service name.');
      setCurrentStep(2);
      return;
    }

    const allowed = await consumeCredits(3, 'Generated Meta Ads Campaign Plan');
    if (!allowed) {
      error('Insufficient AI credits.');
      navigate('/pricing');
      return;
    }

    setGenerating(true);
    try {
      const res = await fetch('/api/ai/ad-planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          objective,
          productName,
          productDescription: productDesc,
          productPrice,
          landingPage,
          targetAudience: {
            location,
            ageRange,
            gender,
            interests,
            customerType,
          },
          budget: {
            dailyBudget,
            duration,
          },
          creativeFormat,
          callToAction,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate ad plan');

      setBlueprint(data);
      success('Campaign strategy blueprint created!');
      notify(
        'PLAN_CREATED',
        'Plan Created',
        `Meta Ads Campaign Strategy for "${productName || 'Product'}" (${dailyBudget || 'Plan'}) created.`,
        { link: '/ads-planner', actionLabel: 'View Plan' }
      );
    } catch (err: any) {
      error(err.message || 'Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveToProjects = async () => {
    if (!blueprint || !profile?.uid) return;
    setSaving(true);
    try {
      const pid = await createProject({
        userId: profile.uid,
        name: `${productName} — Meta Ads Plan (${dailyBudget})`,
        type: 'campaign',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        data: {
          ...blueprint,
          productName,
          dailyBudget,
          objective,
        },
        summary: `Strategic campaign plan with ${objective} objective and ${blueprint.targetAudience.recommendedInterests.length} interest clusters.`,
      });
      success('Saved to projects!');
      notify(
        'PROJECT_SAVED',
        'Project Saved',
        `Campaign plan for "${productName}" saved to your projects.`,
        { link: `/projects/${pid}`, actionLabel: 'Open Project' }
      );
      navigate(`/projects/${pid}`);
    } catch (err) {
      error('Failed to save project');
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = () => {
    if (!blueprint) return;
    navigator.clipboard.writeText(JSON.stringify(blueprint, null, 2));
    setCopied(true);
    success('Copied full campaign plan JSON to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-['Space_Grotesk',sans-serif]">
              Facebook Ads Campaign Planner
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            7-Step strategic blueprinting wizard for profitable Meta advertising campaigns.
          </p>
        </div>

        <Badge variant="purple" size="md">
          Cost: 3 AI Credits
        </Badge>
      </div>

      {/* Main Container */}
      {!blueprint && !generating ? (
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Step Breadcrumbs */}
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between overflow-x-auto">
            {[1, 2, 3, 4, 5, 6, 7].map((s) => (
              <button
                key={s}
                onClick={() => setCurrentStep(s)}
                className={`flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded cursor-pointer transition ${
                  currentStep === s
                    ? 'bg-indigo-50 text-indigo-700 font-bold'
                    : currentStep > s
                    ? 'text-emerald-600'
                    : 'text-slate-400'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                    currentStep === s
                      ? 'bg-indigo-600 text-white'
                      : currentStep > s
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {currentStep > s ? '✓' : s}
                </span>
                <span className="hidden sm:inline">
                  {s === 1
                    ? 'Objective'
                    : s === 2
                    ? 'Product'
                    : s === 3
                    ? 'URL'
                    : s === 4
                    ? 'Audience'
                    : s === 5
                    ? 'Budget'
                    : s === 6
                    ? 'Creative'
                    : 'CTA'}
                </span>
              </button>
            ))}
          </div>

          {/* Step Form Cards */}
          <Card className="p-6 sm:p-8">
            {/* STEP 1: OBJECTIVE */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-slate-900 font-['Space_Grotesk',sans-serif]">
                  Step 1: Campaign Objective
                </h3>
                <p className="text-xs text-slate-500">
                  Select the underlying advertising objective for Meta Ads Manager.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {[
                    { id: 'Sales', title: 'Sales (Conversions)', desc: 'Direct online store checkout and purchases' },
                    { id: 'Leads', title: 'Leads', desc: 'Instant forms, phone inquiries, and quote requests' },
                    { id: 'Website Traffic', title: 'Traffic', desc: 'Direct clicks to external website landing pages' },
                    { id: 'Messages', title: 'Messages', desc: 'Inbound chat starts via Messenger and WhatsApp' },
                    { id: 'Engagement', title: 'Engagement', desc: 'Video 3s/ThruPlay views and post interactions' },
                    { id: 'Awareness', title: 'Brand Awareness', desc: 'Maximize total reach across cold audiences' },
                  ].map((o) => (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => setObjective(o.id)}
                      className={`p-4 rounded-xl text-left border transition cursor-pointer ${
                        objective === o.id
                          ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 ring-2 ring-indigo-500/20'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                      }`}
                    >
                      <strong className="block text-sm">{o.title}</strong>
                      <span className="text-xs text-slate-500 mt-1 block">{o.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 2: PRODUCT */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-slate-900 font-['Space_Grotesk',sans-serif]">
                  Step 2: Product / Service Information
                </h3>
                <Input
                  label="Product or Service Name"
                  required
                  placeholder="e.g. ZenDesk Lumbar Cushion"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                />
                <Textarea
                  label="Product Description & Value Proposition"
                  rows={3}
                  placeholder="Ergonomic support cushion for desk workers reducing lower back strain during 8-hour shifts."
                  value={productDesc}
                  onChange={(e) => setProductDesc(e.target.value)}
                />
                <Input
                  label="Price / Offer Detail"
                  placeholder="e.g. $49.00 (Buy 1 Get 1 50% Off)"
                  value={productPrice}
                  onChange={(e) => setProductPrice(e.target.value)}
                />
              </div>
            )}

            {/* STEP 3: URL */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-slate-900 font-['Space_Grotesk',sans-serif]">
                  Step 3: Website or Landing Page
                </h3>
                <p className="text-xs text-slate-500">
                  Where will visitors land after clicking the ad?
                </p>
                <Input
                  label="Destination URL"
                  placeholder="https://yourbrand.com/products/cushion"
                  value={landingPage}
                  onChange={(e) => setLandingPage(e.target.value)}
                />
              </div>
            )}

            {/* STEP 4: AUDIENCE */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-slate-900 font-['Space_Grotesk',sans-serif]">
                  Step 4: Target Audience Definition
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Geographic Location"
                    placeholder="e.g. United States, Canada, UK"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                  <Input
                    label="Age Demographic"
                    placeholder="e.g. 25 - 54"
                    value={ageRange}
                    onChange={(e) => setAgeRange(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    label="Gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    options={[
                      { value: 'All', label: 'All Genders' },
                      { value: 'Women', label: 'Women' },
                      { value: 'Men', label: 'Men' },
                    ]}
                  />
                  <Input
                    label="Customer Profile Type"
                    placeholder="e.g. Desk workers, remote engineers"
                    value={customerType}
                    onChange={(e) => setCustomerType(e.target.value)}
                  />
                </div>
                <Input
                  label="Seed Interests / Competitor Brands"
                  placeholder="e.g. Ergonomics, Remote work, Herman Miller, Standing desks"
                  value={interests}
                  onChange={(e) => setInterests(e.target.value)}
                />
              </div>
            )}

            {/* STEP 5: BUDGET */}
            {currentStep === 5 && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-slate-900 font-['Space_Grotesk',sans-serif]">
                  Step 5: Campaign Budget &amp; Duration
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Daily Testing Budget"
                    placeholder="e.g. $25 - $50 / day"
                    value={dailyBudget}
                    onChange={(e) => setDailyBudget(e.target.value)}
                  />
                  <Input
                    label="Initial Testing Duration"
                    placeholder="e.g. 7 - 14 days"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                  />
                </div>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800 flex items-start gap-2">
                  <Info className="w-4 h-4 shrink-0 mt-0.5 text-blue-600" />
                  <span>
                    Meta&apos;s machine learning algorithm typically needs at least 50 optimization
                    events per week to exit the learning phase.
                  </span>
                </div>
              </div>
            )}

            {/* STEP 6: CREATIVE */}
            {currentStep === 6 && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-slate-900 font-['Space_Grotesk',sans-serif]">
                  Step 6: Primary Creative Format
                </h3>
                <Select
                  label="Ad Creative Type"
                  value={creativeFormat}
                  onChange={(e) => setCreativeFormat(e.target.value)}
                  options={[
                    { value: 'Short-Form Video (9:16)', label: 'Short-Form Video (9:16 Reels/TikTok)' },
                    { value: 'Square Video (1:1)', label: 'Square Video (1:1 Feed)' },
                    { value: 'Single High-Res Image', label: 'Single High-Res Image (Benefit Callout)' },
                    { value: 'Multi-Product Carousel', label: 'Multi-Product Carousel (Feature Tour)' },
                  ]}
                />
              </div>
            )}

            {/* STEP 7: CTA */}
            {currentStep === 7 && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-slate-900 font-['Space_Grotesk',sans-serif]">
                  Step 7: Call to Action (CTA) Button
                </h3>
                <Select
                  label="Button Text"
                  value={callToAction}
                  onChange={(e) => setCallToAction(e.target.value)}
                  options={[
                    { value: 'Shop Now', label: 'Shop Now' },
                    { value: 'Get Offer', label: 'Get Offer' },
                    { value: 'Learn More', label: 'Learn More' },
                    { value: 'Sign Up', label: 'Sign Up' },
                    { value: 'Book Now', label: 'Book Now' },
                    { value: 'Contact Us', label: 'Contact Us' },
                  ]}
                />
              </div>
            )}

            {/* Wizard Navigation Footer */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-6">
              {currentStep > 1 ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentStep((s) => s - 1)}
                  leftIcon={<ArrowLeft className="w-4 h-4" />}
                >
                  Back
                </Button>
              ) : (
                <div />
              )}

              {currentStep < totalSteps ? (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setCurrentStep((s) => s + 1)}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Next Step
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleGeneratePlan}
                  rightIcon={<Sparkles className="w-4 h-4" />}
                >
                  Generate Campaign Blueprint
                </Button>
              )}
            </div>
          </Card>
        </div>
      ) : generating ? (
        <Card className="p-12 text-center max-w-2xl mx-auto">
          <AILoadingState
            title="Building Your Meta Campaign Blueprint..."
            message="Calculating interest affinities, drafting testing budgets, and formulating angle testing roadmaps."
          />
        </Card>
      ) : (
        /* OUTPUT BLUEPRINT VIEW */
        <div className="space-y-6">
          {/* Top Actions Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-2">
              <Badge variant="indigo" size="md">
                Objective: {blueprint?.recommendedObjective}
              </Badge>
              <span className="text-xs text-slate-500">
                Budget: <strong>{dailyBudget}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBlueprint(null)}
              >
                Modify Parameters
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                leftIcon={copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              >
                {copied ? 'Copied' : 'Copy JSON'}
              </Button>
              <Button
                variant="primary"
                size="sm"
                isLoading={saving}
                onClick={handleSaveToProjects}
                leftIcon={<Save className="w-3.5 h-3.5" />}
              >
                Save Campaign Plan
              </Button>
            </div>
          </div>

          {/* Disclaimer Banner */}
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>Strategic Intelligence Disclaimer:</strong> AdMaster AI produces
              comprehensive targeting and creative blueprints. To deploy these ads, copy the
              targeting parameters and creative angles into your Meta Ads Manager dashboard.
            </div>
          </div>

          {/* Blueprint Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Target Audience Strategy */}
            <Card className="p-6 space-y-4">
              <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                <Target className="w-4 h-4" />
                <span>Audience Targeting Recommendations</span>
              </div>
              <div className="space-y-2 text-xs">
                <div>
                  <strong className="text-slate-800 block">Recommended Demographics:</strong>
                  <span className="text-slate-600">
                    {blueprint?.targetAudience.demographics}
                  </span>
                </div>
                <div>
                  <strong className="text-slate-800 block">Specific Meta Interests to Target:</strong>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {blueprint?.targetAudience.recommendedInterests.map((interest, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded font-medium text-[11px]"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <strong className="text-slate-800 block">Exclusions to Prevent Wasted Spend:</strong>
                  <span className="text-slate-600">
                    {blueprint?.targetAudience.exclusions}
                  </span>
                </div>
              </div>
            </Card>

            {/* 2. Budget Allocation */}
            <Card className="p-6 space-y-4">
              <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                <DollarSign className="w-4 h-4" />
                <span>Budget &amp; Bidding Strategy</span>
              </div>
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                  <strong className="text-emerald-900 block text-xs mb-1">
                    Testing vs Scaling Split:
                  </strong>
                  <p className="text-emerald-800 font-semibold">
                    {blueprint?.budgetStrategy.split}
                  </p>
                </div>
                <div>
                  <strong className="text-slate-800 block">Recommended Bidding Method:</strong>
                  <span className="text-slate-600">
                    {blueprint?.budgetStrategy.biddingType}
                  </span>
                </div>
              </div>
            </Card>

            {/* 3. Creative Roadmaps */}
            <Card className="p-6 space-y-4">
              <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
                <Tv className="w-4 h-4" />
                <span>Creative Angles to Test</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-700">
                {blueprint?.creativeStrategy.map((cs, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                    <span>{cs}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* 4. Potential Risks */}
            <Card className="p-6 space-y-4">
              <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>Potential Campaign Risks &amp; Pitfalls</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-700">
                {blueprint?.potentialRisks.map((r, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {/* Optimization Suggestions Full Width */}
          <Card className="p-6 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 font-['Space_Grotesk',sans-serif]">
              72-Hour Optimization Action Plan
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {blueprint?.optimizationSuggestions.map((s, i) => (
                <div key={i} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700">
                  {s}
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
