import React, { useState } from 'react';
import { useRouter } from '../../context/RouterContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  Video,
  Sparkles,
  Copy,
  Download,
  Save,
  RefreshCw,
  Clock,
  Layers,
  Wand2,
  Check,
  Flame,
  Tv,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input, Textarea, Select } from '../../components/ui/Input';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Badge, AILoadingState } from '../../components/ui/FeedbackComponents';
import { Modal } from '../../components/ui/Modal';
import { VideoScriptOutput } from '../../types';
import { createProject } from '../../services/firestoreService';
import { useNotifications } from '../../context/NotificationContext';

export const VideoGeneratorPage: React.FC = () => {
  const { navigate } = useRouter();
  const { profile, consumeCredits } = useAuth();
  const { success, error, info } = useToast();
  const { notify } = useNotifications();

  // Inputs
  const [productName, setProductName] = useState('');
  const [productDesc, setProductDesc] = useState('');
  const [targetAudience, setTargetAudience] = useState(
    profile?.targetAudience?.customerType || ''
  );
  const [mainBenefit, setMainBenefit] = useState('');
  const [platform, setPlatform] = useState('Facebook');
  const [videoFormat, setVideoFormat] = useState('9:16');
  const [videoLength, setVideoLength] = useState('30s');
  const [tone, setTone] = useState('Promotional');
  const [cta, setCta] = useState('Shop Now');
  const [customCta, setCustomCta] = useState('');

  // States
  const [generating, setGenerating] = useState(false);
  const [output, setOutput] = useState<VideoScriptOutput | null>(null);
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);

  // Improve Modal
  const [improveModalOpen, setImproveModalOpen] = useState(false);
  const [improveInstruction, setImproveInstruction] = useState(
    'Make the 3-second hook more provocative and urgent.'
  );
  const [improving, setImproving] = useState(false);

  const handleGenerate = async () => {
    if (!productName.trim() || !productDesc.trim()) {
      error('Please specify the product or service name and description.');
      return;
    }

    // Deduct 3 credits
    const allowed = await consumeCredits(3, 'Generated Video Script');
    if (!allowed) {
      error('Insufficient AI credits. Please upgrade your plan.');
      navigate('/pricing');
      return;
    }

    setGenerating(true);
    try {
      const response = await fetch('/api/ai/video-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName,
          productDescription: productDesc,
          targetAudience: targetAudience || 'General online consumers',
          mainBenefit: mainBenefit || 'High quality at a fair price',
          platform,
          format: videoFormat,
          length: videoLength,
          tone,
          callToAction: cta === 'Custom' ? customCta : cta,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate script.');
      }

      setOutput(data);
      success('Video script generated successfully!');
      notify(
        'GENERATION_COMPLETE',
        'Generation Complete',
        `Video script for "${productName || 'Product'}" (${videoLength}) generated successfully.`,
        { link: '/video-generator', actionLabel: 'View Script' }
      );
    } catch (err: any) {
      console.error('Generation failed:', err);
      error(err.message || 'Failed to generate script. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!output) return;
    const fullText = `
ADMASTER AI - VIDEO SCRIPT
Title: ${output.title}
Platform: ${platform} | Format: ${videoFormat} | Length: ${videoLength}

[HOOK - ${output.hook.timestamp}]
"${output.hook.text}"
Rationale: ${output.hook.rationale}

[SCENES]
${output.scenes
  .map(
    (s) => `
Scene ${s.sceneNumber} (${s.timestamp}):
Voiceover: "${s.voiceover}"
On-Screen Text: ${s.onScreenText}
Visual Direction: ${s.visualDirection}
`
  )
  .join('')}

[CALL TO ACTION]
${output.cta}

[PRIMARY CAPTION]
${output.caption}

[HASHTAGS]
${output.hashtags.join(' ')}
    `.trim();

    navigator.clipboard.writeText(fullText);
    setCopied(true);
    success('Full script copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSaveProject = async () => {
    if (!output || !profile?.uid) return;
    setSaving(true);
    try {
      const projectId = await createProject({
        userId: profile.uid,
        name: `${productName} — ${videoLength} Script`,
        type: 'video',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        data: {
          ...output,
          productName,
          platform,
          videoFormat,
          videoLength,
          tone,
        },
        summary: `Video script for ${productName} focusing on ${mainBenefit || 'conversion'}.`,
      });
      success('Project saved to your workspace!');
      notify(
        'PROJECT_SAVED',
        'Project Saved',
        `"${productName} — ${videoLength} Script" saved to your projects.`,
        { link: `/projects/${projectId}`, actionLabel: 'Open Project' }
      );
      navigate(`/projects/${projectId}`);
    } catch (err: any) {
      error(err.message || 'Failed to save project.');
    } finally {
      setSaving(false);
    }
  };

  const handleImproveWithAI = async () => {
    if (!output) return;
    setImproving(true);
    try {
      const response = await fetch('/api/ai/improve-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalText: output.hook.text,
          instructions: improveInstruction,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to improve text');

      setOutput({
        ...output,
        hook: {
          ...output.hook,
          text: data.improvedText,
          rationale: `${output.hook.rationale} (Refined: ${improveInstruction})`,
        },
      });
      setImproveModalOpen(false);
      success('Hook successfully refined!');
    } catch (err: any) {
      error(err.message || 'Improvement failed');
    } finally {
      setImproving(false);
    }
  };

  const handleExportText = () => {
    if (!output) return;
    const blob = new Blob([JSON.stringify(output, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${productName.replace(/\s+/g, '_')}_script.json`;
    a.click();
    URL.revokeObjectURL(url);
    info('Exported script JSON file.');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Video className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-['Space_Grotesk',sans-serif]">
              AI Video Script Generator
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Turn product features into 15s, 30s, or 60s high-converting video ad storyboards.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="blue" size="md">
            Cost: 3 AI Credits
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Input Parameters Form (Left Column: 5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="p-6">
            <h2 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>Script Configuration</span>
            </h2>

            <div className="space-y-4">
              <Input
                label="Product / Service Name"
                required
                placeholder="e.g. Lumina Orthopedic Pillow"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
              />

              <Textarea
                label="Product Description & Key Features"
                required
                rows={3}
                placeholder="Memory foam pillow with cooling gel layer designed for cervical neck relief and deep sleep."
                value={productDesc}
                onChange={(e) => setProductDesc(e.target.value)}
              />

              <Input
                label="Target Audience"
                placeholder="e.g. Side sleepers, remote workers with neck pain (28-55)"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
              />

              <Input
                label="Main Benefit / Core Transformation"
                placeholder="e.g. Wake up without neck stiffness in 3 nights"
                value={mainBenefit}
                onChange={(e) => setMainBenefit(e.target.value)}
              />

              {/* Format & Length Grid */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <Select
                  label="Target Platform"
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  options={[
                    { value: 'Facebook', label: 'Facebook Feed & Video' },
                    { value: 'Instagram Reels', label: 'Instagram Reels' },
                    { value: 'TikTok', label: 'TikTok Ads' },
                    { value: 'YouTube Shorts', label: 'YouTube Shorts' },
                  ]}
                />

                <Select
                  label="Video Format"
                  value={videoFormat}
                  onChange={(e) => setVideoFormat(e.target.value)}
                  options={[
                    { value: '9:16', label: '9:16 (Vertical Reels/TikTok)' },
                    { value: '1:1', label: '1:1 (Square Feed)' },
                    { value: '16:9', label: '16:9 (Landscape YouTube)' },
                  ]}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Select
                  label="Video Length"
                  value={videoLength}
                  onChange={(e) => setVideoLength(e.target.value)}
                  options={[
                    { value: '15s', label: '15 Seconds (Fast Hook & CTA)' },
                    { value: '30s', label: '30 Seconds (Standard Direct Response)' },
                    { value: '60s', label: '60 Seconds (Deep Story & Proof)' },
                  ]}
                />

                <Select
                  label="Tone of Voice"
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  options={[
                    { value: 'Promotional', label: 'Direct Promotional' },
                    { value: 'Educational', label: 'Educational / Tutorial' },
                    { value: 'Emotional', label: 'Emotional / Empathetic' },
                    { value: 'Funny', label: 'Humorous / Relatable' },
                    { value: 'Storytelling', label: 'Personal Storytelling' },
                    { value: 'Professional', label: 'Professional / Clinical' },
                  ]}
                />
              </div>

              <Select
                label="Call to Action (CTA)"
                value={cta}
                onChange={(e) => setCta(e.target.value)}
                options={[
                  { value: 'Shop Now', label: 'Shop Now' },
                  { value: 'Get 20% Off', label: 'Get 20% Off' },
                  { value: 'Learn More', label: 'Learn More' },
                  { value: 'Claim Free Trial', label: 'Claim Free Trial' },
                  { value: 'Sign Up Today', label: 'Sign Up Today' },
                  { value: 'Custom', label: 'Write Custom CTA...' },
                ]}
              />

              {cta === 'Custom' && (
                <Input
                  label="Custom Call to Action"
                  placeholder="e.g. Tap to book your 1-on-1 demo"
                  value={customCta}
                  onChange={(e) => setCustomCta(e.target.value)}
                />
              )}

              <div className="pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  isLoading={generating}
                  onClick={handleGenerate}
                  rightIcon={<Sparkles className="w-5 h-5" />}
                >
                  {generating ? 'Crafting Script...' : 'Generate Video Script'}
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Output Canvas (Right Column: 7 Cols) */}
        <div className="lg:col-span-7">
          {generating ? (
            <Card className="p-12 text-center">
              <AILoadingState
                title="Direct-Response AI is Writing Your Script..."
                message="Analyzing customer pain points, timing camera cues, and drafting scroll-stopping 3-second hooks."
              />
            </Card>
          ) : !output ? (
            <Card className="p-12 text-center border-dashed border-2 border-slate-200">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
                <Tv className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900 font-['Space_Grotesk',sans-serif]">
                Your Storyboard Will Appear Here
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-2 leading-relaxed">
                Fill in your product details on the left and click &ldquo;Generate Video Script&rdquo; to
                produce an actionable scene-by-scene filming guide.
              </p>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Output Actions Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
                <div className="flex items-center gap-2">
                  <Badge variant="emerald" size="md">
                    {platform} &bull; {videoLength}
                  </Badge>
                  <span className="text-xs text-slate-500 font-medium">
                    {output.scenes.length} Scenes
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    leftIcon={copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  >
                    {copied ? 'Copied' : 'Copy'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setImproveModalOpen(true)}
                    leftIcon={<Wand2 className="w-3.5 h-3.5 text-purple-600" />}
                  >
                    Improve Hook
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportText}
                    leftIcon={<Download className="w-3.5 h-3.5" />}
                  >
                    Export
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    isLoading={saving}
                    onClick={handleSaveProject}
                    leftIcon={<Save className="w-3.5 h-3.5" />}
                  >
                    Save Project
                  </Button>
                </div>
              </div>

              {/* SCRIPT CONTENT CARDS */}
              <div className="space-y-4">
                {/* 1. ATTENTION HOOK */}
                <div className="p-5 rounded-xl bg-amber-500/10 border-2 border-amber-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
                      <Flame className="w-4 h-4 text-amber-600 fill-amber-600" />
                      3-Second Scroll-Stopper [{output.hook.timestamp}]
                    </span>
                    <Badge variant="amber" size="sm">
                      Critical First Frame
                    </Badge>
                  </div>
                  <blockquote className="text-base sm:text-lg font-bold text-slate-900 my-2 leading-snug">
                    &ldquo;{output.hook.text}&rdquo;
                  </blockquote>
                  <p className="text-xs text-slate-600 italic">
                    Why this works: {output.hook.rationale}
                  </p>
                </div>

                {/* 2. SCENES */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
                    Scene-by-Scene Production Guide
                  </h3>
                  {output.scenes.map((scene) => (
                    <div
                      key={scene.sceneNumber}
                      className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2.5"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <span className="text-xs font-bold text-blue-700 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          Scene {scene.sceneNumber} &bull; {scene.timestamp}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">
                          {videoFormat}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                          Spoken Voiceover:
                        </span>
                        <p className="text-sm font-semibold text-slate-900">
                          &ldquo;{scene.voiceover}&rdquo;
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                          <span className="text-[10px] font-bold uppercase text-slate-500 block mb-0.5">
                            On-Screen Text:
                          </span>
                          <span className="text-xs font-medium text-slate-800">
                            {scene.onScreenText}
                          </span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                          <span className="text-[10px] font-bold uppercase text-slate-500 block mb-0.5">
                            Visual &amp; Camera Direction:
                          </span>
                          <span className="text-xs text-slate-600">
                            {scene.visualDirection}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 3. CALL TO ACTION & CAPTION */}
                <div className="p-5 rounded-xl bg-white border border-slate-200 space-y-4 shadow-2xs">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block mb-1">
                      Final Call to Action (CTA):
                    </span>
                    <p className="text-sm font-bold text-slate-900">{output.cta}</p>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Suggested Social Post Caption:
                    </span>
                    <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                      {output.caption}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                      Recommended Hashtags:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {output.hashtags.map((h, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[11px] font-mono"
                        >
                          {h}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* IMPROVE HOOK MODAL */}
      <Modal
        isOpen={improveModalOpen}
        onClose={() => setImproveModalOpen(false)}
        title="Refine Hook with Gemini AI"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            Tell the AI how to enhance this hook to increase retention.
          </p>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800">
            Current: &ldquo;{output?.hook.text}&rdquo;
          </div>
          <Textarea
            label="Adjustment Instructions"
            rows={3}
            value={improveInstruction}
            onChange={(e) => setImproveInstruction(e.target.value)}
            placeholder="e.g. Make it more contrarian, add a question, or introduce urgency."
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setImproveModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={improving}
              onClick={handleImproveWithAI}
              rightIcon={<Sparkles className="w-3.5 h-3.5" />}
            >
              Apply Refinement
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
