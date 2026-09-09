import React from 'react';
import { useRouter } from '../../context/RouterContext';
import { useAuth } from '../../context/AuthContext';
import {
  Sparkles,
  ArrowRight,
  Video,
  FileText,
  Calendar,
  Layers,
  BarChart3,
  Flame,
  CheckCircle2,
  TrendingUp,
  Target,
  Play,
  Zap,
  HelpCircle,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/FeedbackComponents';

export const HomePage: React.FC = () => {
  const { navigate } = useRouter();
  const { currentUser } = useAuth();

  const handleStart = () => {
    if (currentUser) {
      navigate('/dashboard');
    } else {
      navigate('/register');
    }
  };

  const features = [
    {
      title: 'AI Video Script Generator',
      desc: 'Creates high-converting 15s, 30s, and 60s Facebook & Reels video ad scripts with 3-second scroll-stopping hooks and scene-by-scene visual cues.',
      icon: Video,
      badge: 'High Conversion',
      color: 'text-blue-600 bg-blue-50',
      action: () => navigate('/video-generator'),
    },
    {
      title: 'Psychological Hook Generator',
      desc: 'Generates curiosity gap, negative bias, social proof, and contrarian hooks proven to stop thumbs on mobile feeds.',
      icon: Flame,
      badge: 'Thumb-Stopper',
      color: 'text-amber-600 bg-amber-50',
      action: () => navigate('/content-generator'),
    },
    {
      title: 'Caption & Post Generator',
      desc: 'Drafts persuasive ad copy, multi-benefit body copy, urgent CTAs, and optimized hashtag bundles customized to your niche.',
      icon: FileText,
      badge: 'Copywriting',
      color: 'text-emerald-600 bg-emerald-50',
      action: () => navigate('/content-generator'),
    },
    {
      title: 'Content Calendar',
      desc: 'Organize your weekly and monthly social media publishing schedules with status tracking, draft notes, and platform tagging.',
      icon: Calendar,
      badge: 'Organization',
      color: 'text-purple-600 bg-purple-50',
      action: () => navigate('/content-calendar'),
    },
    {
      title: 'Facebook Ads Planner',
      desc: 'Full-funnel campaign blueprinting wizard: objective selection, budget allocation, audience demographic mapping, and creative angle testing.',
      icon: Layers,
      badge: 'Strategy',
      color: 'text-indigo-600 bg-indigo-50',
      action: () => navigate('/ads-planner'),
    },
    {
      title: 'Ad Performance Analyzer',
      desc: 'Diagnoses CTR, CPC, ROAS, CPA, and conversion velocity with AI-driven root cause identification and optimization suggestions.',
      icon: BarChart3,
      badge: 'Diagnostics',
      color: 'text-rose-600 bg-rose-50',
      action: () => navigate('/ad-analyzer'),
    },
  ];

  const steps = [
    {
      step: '01',
      title: 'Tell us about your business',
      desc: 'Select your niche, product details, customer profile, and tone of voice in a quick 60-second setup.',
    },
    {
      step: '02',
      title: 'Generate your content',
      desc: 'Let our Gemini 2.5 direct-response marketing AI craft video scripts, visual hooks, copy variations, and CTAs.',
    },
    {
      step: '03',
      title: 'Plan your campaign',
      desc: 'Use the step-by-step Ads Planner wizard to define budget splits, targeting interests, and creative testing angles.',
    },
    {
      step: '04',
      title: 'Analyze your results',
      desc: 'Input your campaign numbers into the Analyzer to uncover exact ad bottlenecks and scale winning creatives.',
    },
  ];

  const faqs = [
    {
      q: 'Do I need previous marketing or copywriting experience?',
      a: 'Not at all. AdMaster AI is purposefully engineered for beginners, e-commerce store owners, and non-technical creators. The app provides structured forms and does the heavy lifting.',
    },
    {
      q: 'Does AdMaster AI automatically launch ads on my Facebook account?',
      a: 'No. Version 1 functions as a strategic intelligence & planning copilot. It builds the exact scripts, targeting interests, and budget blueprints for you to paste into Meta Ads Manager safely.',
    },
    {
      q: 'Can I export the video scripts and content?',
      a: 'Yes! You can copy text with one click, save projects to your cloud workspace, or export your full script breakdowns to text files.',
    },
    {
      q: 'How do AI credits work?',
      a: 'Every user receives 50 free credits upon signing up. Generating a script or complete ad strategy consumes a few credits. You can upgrade anytime for higher limits.',
    },
  ];

  return (
    <div className="space-y-24 py-8">
      {/* ----------------- HERO SECTION ----------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-6 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Powered by Gemini 2.5 Direct-Response Marketing Intelligence</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto font-['Space_Grotesk',sans-serif] leading-[1.12]">
          Create Professional Facebook Content &amp; Ads with AI
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Generate video scripts, hooks, captions, content plans, and advertising strategies from one
          simple marketing workspace.
        </p>

        {/* CTA Button Group */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto">
          <Button
            variant="primary"
            size="lg"
            className="w-full sm:w-auto shadow-md shadow-blue-500/20 text-base"
            onClick={handleStart}
            rightIcon={<ArrowRight className="w-5 h-5" />}
          >
            Start Creating Free
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="w-full sm:w-auto text-base"
            onClick={() => {
              const elem = document.getElementById('how-it-works');
              if (elem) elem.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            See How It Works
          </Button>
        </div>

        <div className="mt-4 flex items-center justify-center gap-6 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Free 50 AI Credits
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> No Credit Card Required
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Ready in 60 seconds
          </span>
        </div>

        {/* Hero Interactive Workspace Mockup */}
        <div className="mt-14 max-w-5xl mx-auto rounded-2xl border border-slate-200/90 bg-white p-3 sm:p-5 shadow-2xl overflow-hidden">
          <div className="rounded-xl border border-slate-100 bg-slate-900 text-left overflow-hidden">
            {/* Window bar */}
            <div className="px-4 py-3 bg-slate-800/90 border-b border-slate-700/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                <span className="ml-2 text-xs font-mono text-slate-400">
                  admaster-ai / video-script-generator
                </span>
              </div>
              <Badge variant="emerald" size="sm">
                Generated &bull; 30s Facebook Ad
              </Badge>
            </div>

            {/* Mock script view */}
            <div className="p-6 text-slate-200 space-y-4 font-mono text-xs sm:text-sm">
              <div className="p-3.5 rounded-lg bg-slate-800/80 border border-slate-700">
                <span className="text-amber-400 font-bold block mb-1">
                  [HOOK &bull; 0:00 - 0:03]
                </span>
                <p className="text-white font-sans text-sm sm:text-base font-semibold">
                  &ldquo;Stop scrolling if your Facebook ad spend is bleeding cash with zero purchases.&rdquo;
                </p>
                <span className="text-[11px] text-slate-400 font-sans block mt-1">
                  Visual Direction: Close-up of frustrated creator looking at analytics, sudden red screen shake interrupt.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/60">
                  <span className="text-blue-400 font-bold block mb-0.5">
                    [SCENE 1 &bull; 0:03 - 0:10]
                  </span>
                  <p className="text-xs text-slate-300 font-sans">
                    VO: &ldquo;Most brands fail because their hook is weak and their creative fatigue sets in within 14 days.&rdquo;
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/60">
                  <span className="text-emerald-400 font-bold block mb-0.5">
                    [CALL TO ACTION &bull; 0:25 - 0:30]
                  </span>
                  <p className="text-xs text-slate-300 font-sans">
                    VO: &ldquo;Tap Shop Now to get 20% off your starter kit before midnight.&rdquo;
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------- FEATURES GRID ----------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <Badge variant="blue" size="md">
            Complete Marketing Toolkit
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3 font-['Space_Grotesk',sans-serif]">
            Everything You Need to Scale Your Social Ads
          </h2>
          <p className="text-base text-slate-600 mt-3">
            Designed specifically for direct-response marketing that drives clicks, engagement, and revenue.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <Card
                key={f.title}
                hoverable
                className="flex flex-col justify-between p-6 border-slate-200"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${f.color}`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <Badge variant="slate" size="sm">
                      {f.badge}
                    </Badge>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{f.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{f.desc}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100">
                  <button
                    onClick={f.action}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 transition cursor-pointer"
                  >
                    <span>Launch Tool</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* ----------------- HOW IT WORKS ----------------- */}
      <section id="how-it-works" className="bg-slate-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-semibold uppercase tracking-widest text-blue-400">
              Streamlined 4-Step Process
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-2 font-['Space_Grotesk',sans-serif]">
              How AdMaster AI Transforms Your Marketing
            </h2>
            <p className="text-sm sm:text-base text-slate-400 mt-3">
              Go from a blank page to a validated, high-converting marketing campaign in minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((s) => (
              <div key={s.step} className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700">
                <span className="text-3xl font-extrabold text-blue-500 font-mono block mb-3">
                  {s.step}
                </span>
                <h3 className="text-base font-bold text-white mb-2">{s.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ----------------- PRICING SNAPSHOT ----------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <Badge variant="purple" size="md">
            Transparent Pricing
          </Badge>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-2 font-['Space_Grotesk',sans-serif]">
            Simple Plans for Solopreneurs &amp; Growing Brands
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Start completely free. Upgrade when you need higher generation capacity and diagnostic depth.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Free */}
          <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-xs flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Free Starter</h3>
              <p className="text-xs text-slate-500 mt-1">Perfect for trying AdMaster AI</p>
              <div className="my-6">
                <span className="text-4xl font-extrabold text-slate-900">$0</span>
                <span className="text-xs text-slate-500 ml-1">/ forever</span>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-600 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 50 AI generation credits
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Up to 5 saved projects
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Video &amp; Hook Generator
                </li>
              </ul>
            </div>
            <Button variant="outline" className="w-full" onClick={handleStart}>
              Get Started Free
            </Button>
          </div>

          {/* Pro */}
          <div className="p-6 rounded-2xl border-2 border-blue-600 bg-white shadow-lg relative flex flex-col justify-between">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider">
              Most Popular
            </span>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Pro Marketer</h3>
              <p className="text-xs text-slate-500 mt-1">For active e-commerce and media buyers</p>
              <div className="my-6">
                <span className="text-4xl font-extrabold text-slate-900">$39</span>
                <span className="text-xs text-slate-500 ml-1">/ month</span>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-600 mb-6">
                <li className="flex items-center gap-2 font-medium text-slate-900">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" /> 350 AI generation credits
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" /> 35 saved projects
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" /> Ad Performance Analyzer
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" /> Priority Gemini 2.5 speed
                </li>
              </ul>
            </div>
            <Button variant="primary" className="w-full" onClick={() => navigate('/pricing')}>
              Upgrade to Pro
            </Button>
          </div>

          {/* Business */}
          <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-xs flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Business Scale</h3>
              <p className="text-xs text-slate-500 mt-1">For marketing agencies &amp; multi-brands</p>
              <div className="my-6">
                <span className="text-4xl font-extrabold text-slate-900">$99</span>
                <span className="text-xs text-slate-500 ml-1">/ month</span>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-600 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 1,200 AI generation credits
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Unlimited saved projects
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Full CMS Lesson Library
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Dedicated 24/7 priority support
                </li>
              </ul>
            </div>
            <Button variant="outline" className="w-full" onClick={() => navigate('/pricing')}>
              View Business Details
            </Button>
          </div>
        </div>
      </section>

      {/* ----------------- FAQS ----------------- */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <Badge variant="slate" size="md">
            Frequently Asked Questions
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-2 font-['Space_Grotesk',sans-serif]">
            Everything You Need to Know
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((f, i) => (
            <div key={i} className="p-5 rounded-xl border border-slate-200 bg-white shadow-2xs">
              <h3 className="text-base font-semibold text-slate-900 mb-2 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-blue-600 shrink-0" />
                {f.q}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed pl-6">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ----------------- BOTTOM CTA ----------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 p-8 sm:p-14 text-center text-white shadow-xl">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-['Space_Grotesk',sans-serif]">
            Ready to Create High-Converting Facebook Ads?
          </h2>
          <p className="mt-4 text-sm sm:text-base text-blue-100 max-w-xl mx-auto">
            Join hundreds of founders and creators who plan and execute their advertising strategy
            with AdMaster AI.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto bg-white text-blue-900 hover:bg-blue-50 font-bold"
              onClick={handleStart}
            >
              Start Creating Free Today
            </Button>
            <Button
              variant="ghost"
              size="lg"
              className="w-full sm:w-auto text-white hover:bg-blue-500/30"
              onClick={() => navigate('/features')}
            >
              Explore All Features &rarr;
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};
