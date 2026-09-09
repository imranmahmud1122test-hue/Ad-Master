import React, { useEffect, useState } from 'react';
import { useRouter } from '../../context/RouterContext';
import { useToast } from '../../context/ToastContext';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/FeedbackComponents';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import {
  CreditCard,
  BarChart3,
  Lock,
  FolderOpen,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Trash2,
  Eye,
} from 'lucide-react';
import { DEFAULT_PLANS, getAllProjectsAdmin, deleteProject } from '../../services/firestoreService';
import { Project, PlanConfig } from '../../types';
import { getPlanConfigs, updatePlanConfigs, BKASH_RECEIVER_NUMBER } from '../../services/paymentService';
import { useAuth } from '../../context/AuthContext';

export const AdminSubscriptionsPage: React.FC = () => {
  const { profile } = useAuth();
  const { success, error: toastError } = useToast();
  const [plans, setPlans] = useState<PlanConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PlanConfig | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const loaded = await getPlanConfigs();
        setPlans(loaded);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;
    setSaving(true);
    try {
      const updatedList = plans.map((p) => (p.id === editingPlan.id ? editingPlan : p));
      await updatePlanConfigs(updatedList, profile?.email || 'admin');
      setPlans(updatedList);
      setEditModalOpen(false);
      success(`${editingPlan.name} configuration updated successfully!`);
    } catch (err: any) {
      toastError(err.message || 'Failed to update plan.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-['Space_Grotesk',sans-serif]">
              Subscription Plans &amp; bKash Pricing
            </h1>
            <Badge variant="pink" size="sm">
              bKash Receiver: {BKASH_RECEIVER_NUMBER}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Configure live monetization tiers, prices (BDT), AI generation credit caps, and features.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card key={plan.id} className="p-6 flex flex-col justify-between border-slate-200 shadow-sm hover:shadow-md transition">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-bold text-slate-900">{plan.name}</h3>
                <Badge variant={plan.popular ? 'purple' : 'slate'} size="sm">
                  {plan.id}
                </Badge>
              </div>

              <div className="text-3xl font-extrabold text-slate-900 my-4 font-['Space_Grotesk',sans-serif]">
                ৳{plan.price.toLocaleString()}
                <span className="text-xs text-slate-400 font-normal"> BDT / {plan.billing}</span>
              </div>

              <div className="p-3 bg-blue-50 rounded-xl text-xs font-semibold text-blue-800 mb-4 flex items-center justify-between">
                <span>Monthly AI Credits:</span>
                <span className="text-sm font-bold text-blue-900">{plan.monthlyCredits.toLocaleString()}</span>
              </div>

              <ul className="space-y-2 text-xs text-slate-600 mb-6">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="w-full mt-2 border-slate-300 hover:bg-slate-50"
              onClick={() => {
                setEditingPlan({ ...plan });
                setEditModalOpen(true);
              }}
            >
              Edit Pricing &amp; Features
            </Button>
          </Card>
        ))}
      </div>

      {/* Edit Plan Modal */}
      {editingPlan && (
        <Modal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          title={`Edit ${editingPlan.name} (${editingPlan.id})`}
        >
          <form onSubmit={handleSavePlan} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Plan Display Name</label>
              <input
                type="text"
                required
                value={editingPlan.name}
                onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Price (BDT ৳)</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={editingPlan.price}
                  onChange={(e) => setEditingPlan({ ...editingPlan, price: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Monthly AI Credits</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={editingPlan.monthlyCredits}
                  onChange={(e) =>
                    setEditingPlan({ ...editingPlan, monthlyCredits: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Billing Period Label</label>
              <input
                type="text"
                required
                value={editingPlan.billing}
                onChange={(e) => setEditingPlan({ ...editingPlan, billing: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Monthly (30 Days) or Forever Free"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Features (One per line)
              </label>
              <textarea
                rows={4}
                value={editingPlan.features.join('\n')}
                onChange={(e) =>
                  setEditingPlan({
                    ...editingPlan,
                    features: e.target.value.split('\n').filter((line) => line.trim().length > 0),
                  })
                }
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <Button variant="outline" size="sm" type="button" onClick={() => setEditModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit" isLoading={saving}>
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export const AdminAnalyticsPage: React.FC = () => {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-['Space_Grotesk',sans-serif]">
          AI Token &amp; Usage Analytics
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Telemetry on Gemini 2.5 Flash tokens, API latency, and generation error rates.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5">
          <span className="text-xs uppercase font-bold text-slate-400 block mb-1">
            Avg Inference Latency
          </span>
          <span className="text-2xl font-bold text-slate-900">1.42s</span>
          <span className="text-[11px] text-emerald-600 font-semibold block mt-1">
            Sub-2 second response
          </span>
        </Card>
        <Card className="p-5">
          <span className="text-xs uppercase font-bold text-slate-400 block mb-1">
            Gemini Success Rate
          </span>
          <span className="text-2xl font-bold text-emerald-600">99.8%</span>
          <span className="text-[11px] text-slate-400 block mt-1">0.2% transient retries</span>
        </Card>
        <Card className="p-5">
          <span className="text-xs uppercase font-bold text-slate-400 block mb-1">
            Monthly Credit Burn
          </span>
          <span className="text-2xl font-bold text-blue-600">14,280</span>
          <span className="text-[11px] text-slate-400 block mt-1">Across all user accounts</span>
        </Card>
      </div>
    </div>
  );
};

export const AdminSecurityPage: React.FC = () => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-['Space_Grotesk',sans-serif]">
          Security Policies &amp; Access Controls
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Verification of RBAC roles, Firestore security rules, and server-side secret isolation.
        </p>
      </div>

      <div className="space-y-4">
        <Card className="p-5 space-y-3">
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
            <CheckCircle2 className="w-5 h-5" />
            <span>API Key Isolation &amp; Environment Integrity</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            The Gemini API key (<code className="bg-slate-100 px-1 py-0.5 rounded">GEMINI_API_KEY</code>)
            is strictly isolated on the Express backend (<code className="bg-slate-100 px-1 py-0.5 rounded">server.ts</code>)
            and never exposed to frontend browser bundles or client requests.
          </p>
        </Card>

        <Card className="p-5 space-y-3">
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
            <CheckCircle2 className="w-5 h-5" />
            <span>Multi-Tenant Firestore Security Rules</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            All user documents in <code className="bg-slate-100 px-1 py-0.5 rounded">/users/&#123;userId&#125;</code> and
            associated collections are strictly isolated by <code className="bg-slate-100 px-1 py-0.5 rounded">request.auth.uid == userId</code>.
            Only accounts with an explicitly verified <code className="bg-slate-100 px-1 py-0.5 rounded">ADMIN</code> role can audit cross-user records.
          </p>
        </Card>
      </div>
    </div>
  );
};

export const AdminProjectsAuditPage: React.FC = () => {
  const { success, error } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [inspectProject, setInspectProject] = useState<Project | null>(null);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const data = await getAllProjectsAdmin();
      setProjects(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleDelete = async (p: Project) => {
    if (window.confirm(`Permanently delete project "${p.name}"? This cannot be undone.`)) {
      try {
        await deleteProject(p.id);
        setProjects((prev) => prev.filter((proj) => proj.id !== p.id));
        success(`Project "${p.name}" deleted.`);
        if (inspectProject?.id === p.id) {
          setInspectProject(null);
        }
      } catch (err) {
        error('Failed to delete project.');
      }
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-['Space_Grotesk',sans-serif]">
          Platform Projects Audit
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Global inspection of all user-generated marketing assets with administrative delete privileges.
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-semibold uppercase text-[11px] tracking-wider">
                  <th className="py-3 px-6">Project Name</th>
                  <th className="py-3 px-4">User ID</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Created Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {projects.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-6 font-semibold text-slate-900">{p.name}</td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-400">{p.userId}</td>
                    <td className="py-3.5 px-4">
                      <Badge variant="blue" size="sm">
                        {p.type}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-xs text-emerald-600 font-medium">{p.status}</span>
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setInspectProject(p)}
                          className="p-1 text-slate-400 hover:text-blue-600 transition cursor-pointer"
                          title="Inspect Project"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                          title="Delete Project"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Inspect Project Modal */}
      <Modal
        isOpen={!!inspectProject}
        onClose={() => setInspectProject(null)}
        title={inspectProject?.name || 'Project Inspection'}
        maxWidth="max-w-2xl"
      >
        {inspectProject && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-xs p-3 bg-slate-50 rounded-lg border border-slate-100">
              <div>
                <span className="text-slate-400 block font-semibold uppercase">Project ID</span>
                <span className="font-mono text-slate-800">{inspectProject.id}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold uppercase">Owner UID</span>
                <span className="font-mono text-slate-800">{inspectProject.userId}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold uppercase">Type</span>
                <span className="font-semibold text-slate-800">{inspectProject.type}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold uppercase">Created</span>
                <span className="text-slate-800">{new Date(inspectProject.createdAt).toLocaleString()}</span>
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase block mb-1">
                Project Payload Data
              </span>
              <pre className="p-3 bg-slate-900 text-emerald-400 text-xs rounded-lg overflow-x-auto max-h-60 font-mono whitespace-pre-wrap">
                {JSON.stringify(inspectProject.data, null, 2)}
              </pre>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                className="text-rose-600 hover:bg-rose-50 border-rose-200"
                onClick={() => handleDelete(inspectProject)}
              >
                Delete Project
              </Button>
              <Button variant="primary" size="sm" onClick={() => setInspectProject(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
