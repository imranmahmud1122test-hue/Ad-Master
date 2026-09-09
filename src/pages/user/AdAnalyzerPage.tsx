import React, { useState } from 'react';
import { useRouter } from '../../context/RouterContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  BarChart3,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  MousePointer,
  Eye,
  Save,
  Percent,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Input, Textarea } from '../../components/ui/Input';
import { Badge, AILoadingState } from '../../components/ui/FeedbackComponents';
import { AdAnalysisOutput } from '../../types';
import { createProject } from '../../services/firestoreService';

export const AdAnalyzerPage: React.FC = () => {
  const { navigate } = useRouter();
  const { profile, consumeCredits } = useAuth();
  const { success, error } = useToast();

  // Inputs
  const [adName, setAdName] = useState('');
  const [spend, setSpend] = useState('250');
  const [reach, setReach] = useState('14000');
  const [impressions, setImpressions] = useState('18500');
  const [clicks, setClicks] = useState('320');
  const [conversions, setConversions] = useState('11');
  const [revenue, setRevenue] = useState('650');
  const [notes, setNotes] = useState('30s UGC Video running on Facebook & Instagram targeting 25-45.');

  // States
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AdAnalysisOutput | null>(null);
  const [saving, setSaving] = useState(false);

  // Live client-side calculation preview
  const numSpend = parseFloat(spend) || 0;
  const numImpressions = parseFloat(impressions) || 0;
  const numClicks = parseFloat(clicks) || 0;
  const numConversions = parseFloat(conversions) || 0;
  const numRevenue = parseFloat(revenue) || 0;

  const liveCtr = numImpressions > 0 ? (numClicks / numImpressions) * 100 : 0;
  const liveCpc = numClicks > 0 ? numSpend / numClicks : 0;
  const liveCpm = numImpressions > 0 ? (numSpend / numImpressions) * 1000 : 0;
  const liveRoas = numSpend > 0 ? numRevenue / numSpend : 0;
  const liveCpa = numConversions > 0 ? numSpend / numConversions : 0;
  const liveConvRate = numClicks > 0 ? (numConversions / numClicks) * 100 : 0;

  const handleAnalyze = async () => {
    if (!adName.trim() || numSpend <= 0) {
      error('Please enter the ad name and spend amount.');
      return;
    }

    const allowed = await consumeCredits(2, 'Ad Campaign Performance Diagnosis');
    if (!allowed) {
      error('Insufficient AI credits.');
      navigate('/pricing');
      return;
    }

    setAnalyzing(true);
    try {
      const res = await fetch('/api/ai/ad-analyzer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adName,
          spend: numSpend,
          reach: parseFloat(reach) || 0,
          impressions: numImpressions,
          clicks: numClicks,
          conversions: numConversions,
          revenue: numRevenue,
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to analyze campaign');

      setAnalysis(data);
      success('Campaign diagnosed with actionable benchmarks!');
    } catch (err: any) {
      error(err.message || 'Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSaveToProject = async () => {
    if (!analysis || !profile?.uid) return;
    setSaving(true);
    try {
      const pid = await createProject({
        userId: profile.uid,
        name: `${adName} — Performance Diagnosis`,
        type: 'analysis',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        data: {
          ...analysis,
          adName,
          spend: numSpend,
          revenue: numRevenue,
        },
        summary: `Performance diagnosis: ROAS ${liveRoas.toFixed(2)}x, CTR ${liveCtr.toFixed(2)}%, CPA $${liveCpa.toFixed(2)}.`,
      });
      success('Saved diagnosis to projects!');
      navigate(`/projects/${pid}`);
    } catch (err) {
      error('Failed to save project');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-['Space_Grotesk',sans-serif]">
              Ad Performance Analyzer &amp; Diagnostic
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Input your raw Meta ad metrics to calculate unit economics and uncover profit bottlenecks.
          </p>
        </div>

        <Badge variant="rose" size="md">
          Cost: 2 AI Credits
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Column (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="p-6">
            <h2 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-rose-600" />
              <span>Campaign Metrics Input</span>
            </h2>

            <div className="space-y-4">
              <Input
                label="Ad / Campaign Name"
                required
                placeholder="e.g. EcoSip - Video Hook 01"
                value={adName}
                onChange={(e) => setAdName(e.target.value)}
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Total Spend ($)"
                  type="number"
                  required
                  placeholder="250"
                  value={spend}
                  onChange={(e) => setSpend(e.target.value)}
                />
                <Input
                  label="Total Revenue ($)"
                  type="number"
                  placeholder="650"
                  value={revenue}
                  onChange={(e) => setRevenue(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Total Impressions"
                  type="number"
                  placeholder="18500"
                  value={impressions}
                  onChange={(e) => setImpressions(e.target.value)}
                />
                <Input
                  label="Total Reach"
                  type="number"
                  placeholder="14000"
                  value={reach}
                  onChange={(e) => setReach(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Link Clicks"
                  type="number"
                  placeholder="320"
                  value={clicks}
                  onChange={(e) => setClicks(e.target.value)}
                />
                <Input
                  label="Purchases / Leads"
                  type="number"
                  placeholder="11"
                  value={conversions}
                  onChange={(e) => setConversions(e.target.value)}
                />
              </div>

              <Textarea
                label="Additional Campaign Notes"
                rows={2}
                placeholder="Targeting, creative angle, or offer specifics..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />

              <div className="pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full bg-rose-600 hover:bg-rose-500"
                  isLoading={analyzing}
                  onClick={handleAnalyze}
                  rightIcon={<Sparkles className="w-5 h-5" />}
                >
                  {analyzing ? 'Calculating & Diagnosing...' : 'Diagnose Performance'}
                </Button>
              </div>
            </div>
          </Card>

          {/* Quick Real-Time Metric Preview */}
          <Card className="p-5 bg-slate-900 text-white">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-3">
              Live Mathematical Calculation:
            </span>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-2 rounded-lg bg-slate-800">
                <span className="text-[10px] text-slate-400 block">CTR</span>
                <span className="text-sm font-bold text-emerald-400">
                  {liveCtr.toFixed(2)}%
                </span>
              </div>
              <div className="p-2 rounded-lg bg-slate-800">
                <span className="text-[10px] text-slate-400 block">CPC</span>
                <span className="text-sm font-bold text-blue-400">
                  ${liveCpc.toFixed(2)}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-slate-800">
                <span className="text-[10px] text-slate-400 block">ROAS</span>
                <span
                  className={`text-sm font-bold ${
                    liveRoas >= 2.0
                      ? 'text-emerald-400'
                      : liveRoas >= 1.0
                      ? 'text-amber-400'
                      : 'text-rose-400'
                  }`}
                >
                  {liveRoas.toFixed(2)}x
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Output Column (7 cols) */}
        <div className="lg:col-span-7">
          {analyzing ? (
            <Card className="p-12 text-center">
              <AILoadingState
                title="Diagnosing Campaign Unit Economics..."
                message="Benchmarking CTR, comparing CPC against e-commerce averages, and analyzing conversion funnel leaks."
              />
            </Card>
          ) : !analysis ? (
            <Card className="p-12 text-center border-dashed border-2 border-slate-200">
              <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900 font-['Space_Grotesk',sans-serif]">
                Diagnostic Report Will Appear Here
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-2 leading-relaxed">
                Enter your spend and conversion metrics on the left to see calculated KPIs, benchmark
                comparisons, and root-cause diagnoses.
              </p>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Top header bar */}
              <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      analysis.metrics.roas >= 2.0
                        ? 'emerald'
                        : analysis.metrics.roas >= 1.0
                        ? 'amber'
                        : 'rose'
                    }
                    size="md"
                  >
                    {analysis.metrics.roas >= 2.0
                      ? 'Profitable Campaign'
                      : analysis.metrics.roas >= 1.0
                      ? 'Break-Even'
                      : 'Underperforming'}
                  </Badge>
                  <span className="text-xs text-slate-500">
                    ROAS: <strong>{analysis.metrics.roas.toFixed(2)}x</strong>
                  </span>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  isLoading={saving}
                  onClick={handleSaveToProject}
                  leftIcon={<Save className="w-3.5 h-3.5" />}
                >
                  Save Diagnosis
                </Button>
              </div>

              {/* CALCULATED METRICS CARDS */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Click-Through Rate (CTR)
                  </span>
                  <span className="text-xl font-extrabold text-slate-900 mt-1 block">
                    {analysis.metrics.ctr.toFixed(2)}%
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Industry avg: 1.0% &ndash; 1.5%
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Cost Per Click (CPC)
                  </span>
                  <span className="text-xl font-extrabold text-slate-900 mt-1 block">
                    ${analysis.metrics.cpc.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Industry avg: $0.80 &ndash; $1.60
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Cost Per 1,000 (CPM)
                  </span>
                  <span className="text-xl font-extrabold text-slate-900 mt-1 block">
                    ${analysis.metrics.cpm.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Industry avg: $12 &ndash; $24
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Cost Per Acquisition (CPA)
                  </span>
                  <span className="text-xl font-extrabold text-slate-900 mt-1 block">
                    ${analysis.metrics.cpa.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-slate-500">Per verified conversion</span>
                </div>

                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Return on Ad Spend
                  </span>
                  <span className="text-xl font-extrabold text-slate-900 mt-1 block">
                    {analysis.metrics.roas.toFixed(2)}x
                  </span>
                  <span className="text-[10px] text-slate-500">Target: &gt; 2.0x</span>
                </div>

                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Conversion Rate
                  </span>
                  <span className="text-xl font-extrabold text-slate-900 mt-1 block">
                    {analysis.metrics.conversionRate.toFixed(2)}%
                  </span>
                  <span className="text-[10px] text-slate-500">Clicks to checkout</span>
                </div>
              </div>

              {/* Summary */}
              <Card className="p-5 space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Performance Summary
                </h3>
                <p className="text-sm text-slate-800 leading-relaxed font-medium">
                  {analysis.summary}
                </p>
              </Card>

              {/* Strengths & Weaknesses */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="p-5 space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Identified Strengths</span>
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-700">
                    {analysis.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </Card>

                <Card className="p-5 space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-rose-600 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Bottlenecks &amp; Weaknesses</span>
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-700">
                    {analysis.weaknesses.map((w, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                        <span>{w}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </div>

              {/* Probable Problems & Recommendations */}
              <Card className="p-5 space-y-4">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-600 mb-2">
                    Probable Cause:
                  </h4>
                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900 leading-relaxed font-medium">
                    {analysis.probableProblems}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-2">
                    Actionable Next Steps in Meta Ads Manager:
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-700">
                    {analysis.nextActions.map((action, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="font-bold text-blue-600 shrink-0">{i + 1}.</span>
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
