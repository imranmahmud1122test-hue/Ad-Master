import React, { useState } from 'react';
import { useRouter } from '../../context/RouterContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  FileText,
  Sparkles,
  Copy,
  Check,
  Save,
  Calendar,
  Flame,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input, Textarea, Select } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Badge, AILoadingState } from '../../components/ui/FeedbackComponents';
import { ContentGenerationOutput } from '../../types';
import { createProject, addCalendarItem } from '../../services/firestoreService';
import { useNotifications } from '../../context/NotificationContext';

export const ContentGeneratorPage: React.FC = () => {
  const { navigate } = useRouter();
  const { profile, consumeCredits } = useAuth();
  const { success, error, info } = useToast();
  const { notify } = useNotifications();

  // Form state
  const [productName, setProductName] = useState('');
  const [targetAudience, setTargetAudience] = useState(
    profile?.targetAudience?.customerType || ''
  );
  const [mainBenefit, setMainBenefit] = useState('');
  const [offer, setOffer] = useState('');
  const [tone, setTone] = useState('Conversational & Persuasive');
  const [goal, setGoal] = useState('Sales & Conversions');

  // Generation state
  const [generating, setGenerating] = useState(false);
  const [output, setOutput] = useState<ContentGenerationOutput | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleGenerate = async () => {
    if (!productName.trim() || !mainBenefit.trim()) {
      error('Please enter the product name and its main benefit.');
      return;
    }

    const allowed = await consumeCredits(2, 'Generated Content & Hooks');
    if (!allowed) {
      error('Insufficient AI credits.');
      navigate('/pricing');
      return;
    }

    setGenerating(true);
    try {
      const res = await fetch('/api/ai/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName,
          targetAudience: targetAudience || 'General active consumers',
          mainBenefit,
          offer: offer || 'None',
          tone,
          goal,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Content generation failed');

      setOutput(data);
      success('Captions, hooks, and CTAs generated!');
      notify(
        'GENERATION_COMPLETE',
        'Generation Complete',
        `Social captions & ${data.hooks?.length || 5} psychological hooks for "${productName || 'Product'}" generated.`,
        { link: '/content-generator', actionLabel: 'View Content' }
      );
    } catch (err: any) {
      error(err.message || 'Failed to generate content');
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    success('Copied to clipboard!');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleSaveToProject = async () => {
    if (!output || !profile?.uid) return;
    setSaving(true);
    try {
      const pid = await createProject({
        userId: profile.uid,
        name: `${productName} — Content & Hooks`,
        type: 'content',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        data: {
          ...output,
          productName,
          mainBenefit,
        },
        summary: `Social copy variations and ${output.hooks.length} psychological hooks for ${productName}.`,
      });
      success('Saved to projects!');
      notify(
        'PROJECT_SAVED',
        'Project Saved',
        `"${productName} — Content & Hooks" saved to your projects.`,
        { link: `/projects/${pid}`, actionLabel: 'Open Project' }
      );
      navigate(`/projects/${pid}`);
    } catch (err: any) {
      error(err.message || 'Failed to save project');
    } finally {
      setSaving(false);
    }
  };

  const handleAddToCalendar = async (captionText: string) => {
    if (!profile?.uid) return;
    try {
      const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
      await addCalendarItem({
        userId: profile.uid,
        title: `${productName} Post`,
        platform: 'Facebook',
        date: tomorrowStr,
        scheduledDate: tomorrowStr,
        status: 'Planned',
        caption: captionText,
        contentType: 'Single Image',
        notes: `Generated via Content Generator. Benefit: ${mainBenefit}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      success('Scheduled on tomorrow’s Content Calendar!');
    } catch (err) {
      error('Failed to add to calendar');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-['Space_Grotesk',sans-serif]">
              Caption, Hook &amp; CTA Generator
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Produce thumb-stopping psychological hooks and multi-angle social ad copy.
          </p>
        </div>

        <Badge variant="emerald" size="md">
          Cost: 2 AI Credits
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Column */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="p-6">
            <h2 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>Campaign Parameters</span>
            </h2>

            <div className="space-y-4">
              <Input
                label="Product / Brand Name"
                required
                placeholder="e.g. ZenBrew Mushroom Coffee"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
              />

              <Input
                label="Target Audience"
                placeholder="e.g. Entrepreneurs, students, clean caffeine lovers"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
              />

              <Textarea
                label="Main Benefit / Transformation"
                required
                rows={2}
                placeholder="Clean all-day focus without afternoon jitters or stomach acid."
                value={mainBenefit}
                onChange={(e) => setMainBenefit(e.target.value)}
              />

              <Input
                label="Current Offer / Incentive (Optional)"
                placeholder="e.g. 20% off starter bundle + free ceramic mug"
                value={offer}
                onChange={(e) => setOffer(e.target.value)}
              />

              <div className="grid grid-cols-2 gap-3">
                <Select
                  label="Tone of Voice"
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  options={[
                    { value: 'Conversational & Persuasive', label: 'Conversational & Persuasive' },
                    { value: 'Direct & Promotional', label: 'Direct & Promotional' },
                    { value: 'Urgent & Scarcity-Driven', label: 'Urgent & Scarcity-Driven' },
                    { value: 'Educational & Authoritative', label: 'Educational & Authoritative' },
                    { value: 'Bold & Provocative', label: 'Bold & Provocative' },
                  ]}
                />

                <Select
                  label="Primary Goal"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  options={[
                    { value: 'Sales & Conversions', label: 'Sales & Conversions' },
                    { value: 'Website Clicks', label: 'Website Clicks' },
                    { value: 'Lead Generation', label: 'Lead Generation' },
                    { value: 'Social Engagement', label: 'Social Engagement' },
                  ]}
                />
              </div>

              <div className="pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  isLoading={generating}
                  onClick={handleGenerate}
                  rightIcon={<Sparkles className="w-5 h-5" />}
                >
                  {generating ? 'Drafting Variations...' : 'Generate Content'}
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Output Column */}
        <div className="lg:col-span-7">
          {generating ? (
            <Card className="p-12 text-center">
              <AILoadingState
                title="Generating Persuasive Copy & Hooks..."
                message="Synthesizing psychological triggers, benefit framing, and high-converting calls to action."
              />
            </Card>
          ) : !output ? (
            <Card className="p-12 text-center border-dashed border-2 border-slate-200">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                <Flame className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900 font-['Space_Grotesk',sans-serif]">
                Generated Copy Will Appear Here
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-2 leading-relaxed">
                Provide your offer and benefit on the left to produce 5 psychological hooks and
                multiple ad captions.
              </p>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Top save bar */}
              <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
                <Badge variant="emerald" size="md">
                  {output.hooks.length} Hooks &bull; {output.captions.length} Captions
                </Badge>
                <Button
                  variant="primary"
                  size="sm"
                  isLoading={saving}
                  onClick={handleSaveToProject}
                  leftIcon={<Save className="w-3.5 h-3.5" />}
                >
                  Save to Projects
                </Button>
              </div>

              {/* 1. HOOKS VARIATIONS */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 px-1">
                  <Flame className="w-4 h-4 text-amber-500" />
                  <span>Psychological Thumb-Stopping Hooks</span>
                </h3>

                <div className="grid grid-cols-1 gap-3">
                  {output.hooks.map((h, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs hover:border-slate-300 transition flex items-start justify-between gap-4"
                    >
                      <div className="space-y-1 flex-1">
                        <Badge variant="purple" size="sm">
                          {h.category}
                        </Badge>
                        <p className="text-sm font-bold text-slate-900 pt-1">
                          &ldquo;{h.hook}&rdquo;
                        </p>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyText(h.hook, `hook-${i}`)}
                        leftIcon={
                          copiedIndex === `hook-${i}` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )
                        }
                      >
                        {copiedIndex === `hook-${i}` ? 'Copied' : 'Copy'}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. AD CAPTIONS */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 px-1">
                  <FileText className="w-4 h-4 text-blue-500" />
                  <span>Ad Caption Variations</span>
                </h3>

                <div className="space-y-4">
                  {output.captions.map((cap, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <Badge variant="blue" size="sm">
                          {cap.angle}
                        </Badge>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddToCalendar(cap.caption)}
                            leftIcon={<Calendar className="w-3.5 h-3.5 text-indigo-600" />}
                          >
                            Add to Calendar
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyText(cap.caption, `cap-${i}`)}
                            leftIcon={
                              copiedIndex === `cap-${i}` ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )
                            }
                          >
                            {copiedIndex === `cap-${i}` ? 'Copied' : 'Copy'}
                          </Button>
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-800 whitespace-pre-line leading-relaxed font-sans bg-slate-50 p-3 rounded-lg border border-slate-100">
                        {cap.caption}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. CTAS & HASHTAGS */}
              <div className="p-5 rounded-xl bg-white border border-slate-200 space-y-4 shadow-2xs">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                    Action-Oriented CTAs:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {output.ctas.map((c, i) => (
                      <button
                        key={i}
                        onClick={() => handleCopyText(c, `cta-${i}`)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-800 flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <span>{c}</span>
                        <Copy className="w-3 h-3 text-slate-400" />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                    Optimized Hashtags:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {output.hashtags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-mono font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
