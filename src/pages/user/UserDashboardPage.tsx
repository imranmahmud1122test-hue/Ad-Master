import React, { useEffect, useState } from 'react';
import { useRouter } from '../../context/RouterContext';
import { useAuth } from '../../context/AuthContext';
import {
  FolderOpen,
  Video,
  FileText,
  Layers,
  BarChart3,
  Plus,
  Zap,
  ArrowRight,
  Clock,
  Sparkles,
  ExternalLink,
  Trash2,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Badge, EmptyState } from '../../components/ui/FeedbackComponents';
import { Project } from '../../types';
import { getUserProjects, createProject, deleteProject } from '../../services/firestoreService';
import { useToast } from '../../context/ToastContext';
import { DashboardNotificationWidget } from '../../components/notifications/DashboardNotificationWidget';
import { BkashPaymentModal } from '../../components/payment/BkashPaymentModal';
import { Lock, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const UserDashboardPage: React.FC = () => {
  const { navigate } = useRouter();
  const { profile, refreshProfile } = useAuth();
  const { success, error } = useToast();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  // Dynamic greeting based on current local hour
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning 👋';
    if (hour < 18) return 'Good afternoon 👋';
    return 'Good evening 👋';
  };

  const loadProjects = async () => {
    if (!profile?.uid) return;
    setLoading(true);
    try {
      const userProjects = await getUserProjects(profile.uid);
      setProjects(userProjects);
    } catch (err) {
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, [profile?.uid]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await deleteProject(id);
        setProjects((prev) => prev.filter((p) => p.id !== id));
        success('Project deleted.');
      } catch (err) {
        error('Failed to delete project.');
      }
    }
  };

  // Safe sample content seeding for instant product exploration
  const handleLoadSampleProject = async () => {
    if (!profile?.uid) return;
    try {
      const sampleId = await createProject({
        userId: profile.uid,
        name: 'EcoSip Flask — 30s Facebook Ad Script',
        type: 'video',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        data: {
          title: 'EcoSip Flask — Hydration Breakthrough',
          hook: {
            timestamp: '0:00–0:03',
            text: 'Stop drinking lukewarm water during your workouts.',
            rationale: 'Pattern interrupt triggering immediate sensory pain point.',
          },
          scenes: [
            {
              sceneNumber: 1,
              timestamp: '0:03–0:08',
              voiceover: 'Most insulated bottles lose temperature after 45 minutes.',
              onScreenText: '45-Minute Heat Leak',
              visualDirection: 'Close-up of runner shaking head at cheap plastic bottle.',
            },
            {
              sceneNumber: 2,
              timestamp: '0:08–0:18',
              voiceover: 'EcoSip uses vacuum thermal seals to lock sub-zero ice for 36 hours.',
              onScreenText: 'Sub-Zero Ice For 36h',
              visualDirection: 'Satisfying ice drop into flask with crystal condensation.',
            },
            {
              sceneNumber: 3,
              timestamp: '0:18–0:30',
              voiceover: 'Tap Shop Now to claim your 20% off summer fitness starter pack.',
              onScreenText: 'Tap Shop Now &bull; 20% Off Today',
              visualDirection: 'Hero product rotation with CTA button graphic overlay.',
            },
          ],
          cta: 'Shop Now &bull; Free Shipping on First Order',
          caption: 'Ready for cold sips all workout long? 🧊 Tap below to save 20% on EcoSip Flask today!',
          hashtags: ['#EcoSip', '#FitnessGear', '#HydrationGoals', '#ActiveLifestyle'],
        },
        summary: 'Direct response 30s script focusing on workout temperature control.',
      });
      await loadProjects();
      success('Loaded sample project!');
      navigate(`/projects/${sampleId}`);
    } catch (err) {
      error('Failed to create sample project.');
    }
  };

  const videoScriptsCount = projects.filter((p) => p.type === 'video').length;
  const campaignPlansCount = projects.filter((p) => p.type === 'campaign').length;

  const quickActions = [
    {
      title: 'Create Video',
      desc: 'Generate a 15-60s Facebook/Reels video ad script',
      icon: Video,
      color: 'bg-blue-50 text-blue-600 border-blue-200',
      action: () => navigate('/video-generator'),
    },
    {
      title: 'Create Content',
      desc: 'Hooks, social captions, CTAs, and hashtags',
      icon: FileText,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      action: () => navigate('/content-generator'),
    },
    {
      title: 'Plan Ad',
      desc: 'Campaign objective, budget split, and targeting',
      icon: Layers,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-200',
      action: () => navigate('/ads-planner'),
    },
    {
      title: 'Analyze Ad',
      desc: 'Diagnose ROAS, CTR, and CPA bottlenecks',
      icon: BarChart3,
      color: 'bg-rose-50 text-rose-600 border-rose-200',
      action: () => navigate('/ad-analyzer'),
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-['Space_Grotesk',sans-serif]">
            {getGreeting()}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Ready to create your next campaign for{' '}
            <strong className="text-slate-800">{profile?.businessName || 'your brand'}</strong>?
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="primary"
            size="md"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => navigate('/video-generator')}
          >
            + Create New Project
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Projects
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <FolderOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Space_Grotesk',sans-serif]">
              {projects.length}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Saved marketing assets</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Generated Scripts
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Video className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Space_Grotesk',sans-serif]">
              {videoScriptsCount}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Video storyboards</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Campaign Plans
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Space_Grotesk',sans-serif]">
              {campaignPlansCount}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Meta ad blueprints</p>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              AI Credits
            </span>
            <button
              onClick={() => navigate('/pricing')}
              className="text-[10px] bg-blue-600 hover:bg-blue-500 text-white font-bold px-2 py-0.5 rounded cursor-pointer transition"
            >
              Add
            </button>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-['Space_Grotesk',sans-serif]">
              {profile?.credits ?? 0}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Tier: <strong className="text-white">{profile?.subscription || 'FREE'}</strong>
          </p>
        </Card>
      </div>

      {/* Plan Status / Upgrade Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider">
              {profile?.subscription || 'FREE'} PLAN
            </span>
            {profile?.subscription === 'FREE' ? (
              <span className="inline-flex items-center gap-1 text-xs text-amber-300 font-medium">
                <Lock className="w-3 h-3" /> Premium Features Locked
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs text-emerald-300 font-medium">
                <CheckCircle2 className="w-3 h-3" /> All Features Unlocked
              </span>
            )}
          </div>
          <h3 className="text-lg font-bold font-['Space_Grotesk',sans-serif]">
            {profile?.subscription === 'FREE'
              ? 'Unlock More With Pro — 350 AI Monthly Credits & Advanced Video AI'
              : `Active Subscription: ${profile?.subscription} Plan`}
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            {profile?.subscription === 'FREE'
              ? 'Upgrade via instant bKash verification to access all AI marketing prompt engines, Facebook ad analyzers, and high-converting video hooks.'
              : 'Your workspace has elevated AI generation limits and access to all premium ad creation tools.'}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/subscription')}
            className="border-slate-600 text-slate-200 hover:bg-slate-800"
          >
            Billing History
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setUpgradeModalOpen(true)}
            className="bg-blue-500 hover:bg-blue-400 text-white font-bold shadow-md shadow-blue-500/30"
          >
            {profile?.subscription === 'FREE' ? 'Upgrade Plan (bKash)' : 'Change Plan'}
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-base font-bold text-slate-900 mb-3 tracking-tight">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.title}
                onClick={action.action}
                className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm text-left transition flex flex-col justify-between cursor-pointer group"
              >
                <div>
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 border ${action.color}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition">
                    {action.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-snug">{action.desc}</p>
                </div>
                <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-blue-600">
                  <span>Start now</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Notifications & AI Activity Stream */}
      <DashboardNotificationWidget />

      {/* Recent Projects Table */}
      <Card>
        <CardHeader
          title="Recent Projects"
          subtitle="Your saved video scripts, campaign blueprints, and analysis reports"
          action={
            projects.length > 0 && (
              <Button variant="ghost" size="sm" onClick={() => navigate('/projects')}>
                View All ({projects.length})
              </Button>
            )
          }
        />
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-500">Loading projects...</div>
          ) : projects.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={<FolderOpen className="w-6 h-6 text-blue-600" />}
                title="No projects yet"
                description="Create your first marketing project or explore our ready-to-use sample ad script."
                actionText="Create Project"
                onAction={() => navigate('/video-generator')}
              />
              <div className="mt-4 text-center">
                <button
                  onClick={handleLoadSampleProject}
                  className="text-xs text-blue-600 hover:underline font-semibold cursor-pointer"
                >
                  ⚡ Load Sample E-Commerce Ad Project
                </button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-semibold uppercase text-[11px] tracking-wider">
                    <th className="py-3 px-6">Project Name</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Created Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {projects.slice(0, 5).map((project) => (
                    <tr
                      key={project.id}
                      onClick={() => navigate(`/projects/${project.id}`)}
                      className="hover:bg-slate-50/80 transition cursor-pointer"
                    >
                      <td className="py-4 px-6 font-semibold text-slate-900">
                        {project.name}
                      </td>
                      <td className="py-4 px-4">
                        <Badge
                          variant={
                            project.type === 'video'
                              ? 'purple'
                              : project.type === 'campaign'
                              ? 'blue'
                              : project.type === 'analysis'
                              ? 'rose'
                              : 'emerald'
                          }
                          size="sm"
                        >
                          {project.type}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-slate-500 text-xs">
                        {new Date(project.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                          {project.status || 'Active'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => handleDelete(project.id, e)}
                            className="p-1 rounded text-slate-400 hover:text-rose-600 transition"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <ExternalLink className="w-4 h-4 text-slate-400 hover:text-slate-700" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upgrade Modal */}
      <BkashPaymentModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        initialPlan="PRO"
        onSuccess={async () => {
          await refreshProfile();
        }}
      />
    </div>
  );
};
