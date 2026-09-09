import React from 'react';
import { useRouter } from '../../context/RouterContext';
import {
  Video,
  Flame,
  FileText,
  Calendar,
  Layers,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  Zap,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/FeedbackComponents';

export const FeaturesPage: React.FC = () => {
  const { navigate } = useRouter();

  const toolDetails = [
    {
      id: 'video',
      title: 'AI Video Script Generator',
      subtitle: 'From Product Concept to Complete 30-Second Storyboard',
      icon: Video,
      badge: 'Video First',
      color: 'bg-blue-50 text-blue-600',
      description:
        'Video ads on Facebook and Instagram drive over 70% of conversions, but writing scripts with the right pacing is difficult. Our AI crafts scene-by-scene blueprints engineered to hook users in the first 3 seconds.',
      bullets: [
        'Precise timestamp breakdowns (0:00-0:03 hook, 0:03-0:08 agitation, etc.)',
        'Direct spoken voiceovers synced with short on-screen text overlays',
        'Camera angle and creator visual directions for filming',
        'Multi-platform export (Facebook, Instagram Reels, TikTok, YouTube Shorts)',
        'Custom tone presets (Professional, Storytelling, Funny, Educational, Promotional)',
      ],
      ctaText: 'Try Video Script Generator',
      path: '/video-generator',
    },
    {
      id: 'hooks',
      title: 'Psychological Hook Generator',
      subtitle: '5 Proven Psychological Triggers to Halt Mobile Scrolling',
      icon: Flame,
      badge: 'Retention',
      color: 'bg-amber-50 text-amber-600',
      description:
        'If users scroll past your first frame, your ad spend is wasted. The Hook Generator produces distinct psychological angles to capture attention before ad fatigue sets in.',
      bullets: [
        'Curiosity Gap hooks that tease an unexpected revelation',
        'Negative Bias ("Stop making this common mistake with X") hooks',
        'Contrarian angle hooks that challenge common industry myths',
        'Direct benefit hooks highlighting transformation and speed',
        'Social proof hooks featuring customer validation',
      ],
      ctaText: 'Generate Viral Hooks',
      path: '/content-generator',
    },
    {
      id: 'copy',
      title: 'Caption, Post & CTA Engine',
      subtitle: 'Complete Social Copywriting Variations',
      icon: FileText,
      badge: 'Copywriting',
      color: 'bg-emerald-50 text-emerald-600',
      description:
        'Never stare at a blank caption box again. Generate punchy ad copy with tasteful emojis, natural line breaks, low-friction calls to action, and relevant hashtags.',
      bullets: [
        'Multi-variation generation for A/B testing copy angles',
        'Story-driven posts and bulleted benefit formats',
        'Urgency, soft inquiry, and value-led CTAs',
        'Automatic hashtag curation tailored to your niche',
      ],
      ctaText: 'Generate Ad Copy',
      path: '/content-generator',
    },
    {
      id: 'calendar',
      title: 'Social Content Calendar',
      subtitle: 'Strategic Scheduling & Visual Status Tracking',
      icon: Calendar,
      badge: 'Workflow',
      color: 'bg-purple-50 text-purple-600',
      description:
        'Consistency is the foundation of brand momentum. Plan out your daily, weekly, and monthly content pipeline across all channels with clear status indicators.',
      bullets: [
        'Month, Week, and List interactive views',
        'Draft, Planned, and Published status workflows',
        'Cross-platform tagging for Facebook, Instagram, TikTok, and YouTube',
        'Direct project links and attached production notes',
      ],
      ctaText: 'Open Content Calendar',
      path: '/content-calendar',
    },
    {
      id: 'planner',
      title: 'Facebook Ads Campaign Planner',
      subtitle: 'Strategic Meta Blueprinting Wizard',
      icon: Layers,
      badge: 'Strategy',
      color: 'bg-indigo-50 text-indigo-600',
      description:
        'A comprehensive 7-step wizard that turns raw business goals into an actionable advertising campaign plan with audience interests, budget distributions, and testing roadmaps.',
      bullets: [
        'Campaign Objective selection (Sales, Leads, Traffic, Messages, Engagement)',
        'Audience targeting demographics, specific interest tags, and behavioral sets',
        'Recommended budget split: 70% testing winning sets / 30% testing new angles',
        'Identifies potential campaign risks and creative fatigue thresholds',
      ],
      ctaText: 'Plan a Campaign',
      path: '/ads-planner',
    },
    {
      id: 'analyzer',
      title: 'Campaign Performance Analyzer',
      subtitle: 'Mathematical Calculations & AI Diagnostic Prescriptions',
      icon: BarChart3,
      badge: 'ROI Diagnostics',
      color: 'bg-rose-50 text-rose-600',
      description:
        'Enter your spend, reach, impressions, clicks, and revenue. AdMaster AI calculates essential metrics like CTR, CPC, ROAS, and CPA, and diagnoses the root cause of underperformance.',
      bullets: [
        'Real server-side calculation of critical e-commerce metrics',
        'Benchmark comparisons against current Facebook & Meta averages',
        'Diagnoses creative fatigue, landing page conversion friction, or audience saturation',
        'Step-by-step actionable recommendations for what to modify today in Ads Manager',
      ],
      ctaText: 'Analyze Campaign Performance',
      path: '/ad-analyzer',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <Badge variant="blue" size="md">
          Platform Capabilities
        </Badge>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mt-3 font-['Space_Grotesk',sans-serif]">
          Everything You Need to Win at Paid Social
        </h1>
        <p className="text-base text-slate-600 mt-4 leading-relaxed">
          AdMaster AI replaces fragmented spreadsheets, guesswork, and expensive agency fees with a
          structured suite of direct-response tools.
        </p>
      </div>

      {/* Feature Deep Dive Cards */}
      <div className="space-y-12">
        {toolDetails.map((t, index) => {
          const Icon = t.icon;
          const isEven = index % 2 === 0;
          return (
            <div
              key={t.id}
              className={`flex flex-col lg:flex-row items-center gap-10 p-6 sm:p-10 rounded-2xl border border-slate-200 bg-white shadow-xs ${
                !isEven ? 'lg:flex-row-reverse' : ''
              }`}
            >
              {/* Text info */}
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-2">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${t.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <Badge variant="slate" size="sm">
                    {t.badge}
                  </Badge>
                </div>

                <h2 className="text-2xl font-bold text-slate-900 font-['Space_Grotesk',sans-serif]">
                  {t.title}
                </h2>
                <p className="text-sm font-semibold text-blue-600">{t.subtitle}</p>
                <p className="text-sm text-slate-600 leading-relaxed">{t.description}</p>

                <ul className="space-y-2 pt-2">
                  {t.bullets.map((b, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>

                <div className="pt-4">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => navigate(t.path)}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    {t.ctaText}
                  </Button>
                </div>
              </div>

              {/* Visual preview box */}
              <div className="w-full lg:w-96 bg-slate-900 text-slate-200 p-5 rounded-xl border border-slate-800 text-xs font-mono shadow-md">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3 text-[11px] text-slate-400">
                  <span>TOOL DEMO PREVIEW</span>
                  <span className="text-emerald-400">STATUS: READY</span>
                </div>
                <div className="space-y-2">
                  <p className="text-blue-400">&gt; Input: &quot;Eco water bottle with heat tracking&quot;</p>
                  <p className="text-amber-400">&gt; Target: Fitness professionals, 25-40</p>
                  <div className="p-3 bg-slate-800/80 rounded border border-slate-700 mt-2 font-sans text-white text-xs leading-relaxed">
                    &ldquo;Did you know that 80% of workout fatigue is caused by drinking water at the wrong temperature? Here is how to fix it in 3 seconds...&rdquo;
                  </div>
                  <p className="text-slate-500 text-[10px] mt-2">
                    &bull; Calculated hook retention score: 94/100
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-8 sm:p-12 text-center">
        <h3 className="text-2xl font-bold mb-3 font-['Space_Grotesk',sans-serif]">
          Ready to scale your next campaign?
        </h3>
        <p className="text-sm text-slate-400 max-w-lg mx-auto mb-6">
          Sign up now to claim your 50 free AI generation credits. No credit card required.
        </p>
        <Button variant="primary" size="lg" onClick={() => navigate('/register')}>
          Start Creating Free
        </Button>
      </div>
    </div>
  );
};
