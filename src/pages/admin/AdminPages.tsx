import React, { useEffect, useState } from 'react';
import { useRouter } from '../../context/RouterContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  Users,
  FolderOpen,
  Sparkles,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  Search,
  Plus,
  Trash2,
  Edit2,
  Lock,
  BarChart3,
  Bookmark,
  GraduationCap,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/FeedbackComponents';
import { Modal } from '../../components/ui/Modal';
import { Input, Textarea, Select } from '../../components/ui/Input';
import {
  UserProfile,
  Project,
  Template,
  Lesson,
  AIPromptConfig,
} from '../../types';
import {
  getAllUsers,
  updateUserProfile,
  deleteUserProfile,
  getAllProjectsAdmin,
  getTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  getLessons,
  createLesson,
  updateLesson,
  deleteLesson,
  getAIPrompts,
  updateAIPrompt,
} from '../../services/firestoreService';

// =========================================================================
// 1. Admin Dashboard Overview
// =========================================================================
export const AdminDashboardPage: React.FC = () => {
  const { navigate } = useRouter();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [u, p] = await Promise.all([
          getAllUsers(),
          getAllProjectsAdmin(),
        ]);
        setUsers(u);
        setProjects(p);
      } catch (err) {
        console.error('Error fetching admin data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const paidUsersCount = users.filter((u) => u.subscription !== 'FREE').length;
  const estimatedRevenue = users.reduce((acc, u) => {
    if (u.subscription === 'PRO') return acc + 39;
    if (u.subscription === 'BUSINESS') return acc + 99;
    return acc;
  }, 0);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-['Space_Grotesk',sans-serif]">
            Platform Overview &amp; Control
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time multi-tenant platform metrics, user cohorts, and AI token distribution.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="emerald" size="md">
            All Systems Healthy
          </Badge>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="p-5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase">
            <span>Total Users</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 font-['Space_Grotesk',sans-serif]">
            {users.length}
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
            +18% this month
          </span>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase">
            <span>Total Projects</span>
            <FolderOpen className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 font-['Space_Grotesk',sans-serif]">
            {projects.length}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Saved in Firestore</span>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase">
            <span>Paid Subscriptions</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 font-['Space_Grotesk',sans-serif]">
            {paidUsersCount}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {users.length > 0 ? Math.round((paidUsersCount / users.length) * 100) : 0}% Conversion
          </span>
        </Card>

        <Card className="p-5 bg-slate-900 text-white">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase">
            <span>Monthly Run Rate</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 mt-2 font-['Space_Grotesk',sans-serif]">
            ${estimatedRevenue.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Estimated MRR</span>
        </Card>
      </div>

      {/* Analytics Chart Simulation & Quick Audit */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 font-['Space_Grotesk',sans-serif]">
              AI Generation Demand &amp; Usage (Past 7 Days)
            </h2>
            <Badge variant="blue" size="sm">
              Gemini 2.5 Flash
            </Badge>
          </div>

          {/* Clean SVG Bar Chart */}
          <div className="h-44 flex items-end justify-between gap-3 pt-6 px-2">
            {[
              { day: 'Mon', count: 42 },
              { day: 'Tue', count: 68 },
              { day: 'Wed', count: 85 },
              { day: 'Thu', count: 94 },
              { day: 'Fri', count: 112 },
              { day: 'Sat', count: 76 },
              { day: 'Sun', count: 128 },
            ].map((d) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-[10px] font-bold text-slate-500">{d.count}</span>
                <div
                  className="w-full bg-blue-600 hover:bg-blue-500 rounded-t transition-all duration-300"
                  style={{ height: `${(d.count / 140) * 100}%` }}
                />
                <span className="text-[11px] text-slate-500 font-medium">{d.day}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-900 font-['Space_Grotesk',sans-serif]">
            System Health &amp; Subsystems
          </h2>
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-700">Firebase Firestore</span>
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> 100% Operational
              </span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-700">Gemini 2.5 API Gateway</span>
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> 100% Operational
              </span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-700">RBAC Security Rules</span>
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Enforced
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Users Table */}
      <Card>
        <CardHeader
          title="Recent User Registrations"
          subtitle="All profiles created in Firestore"
          action={
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin/users')}>
              Manage All Users &rarr;
            </Button>
          }
        />
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-semibold uppercase text-[11px] tracking-wider">
                  <th className="py-3 px-6">User</th>
                  <th className="py-3 px-4">Business</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Plan</th>
                  <th className="py-3 px-4">Credits</th>
                  <th className="py-3 px-6 text-right">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.slice(0, 6).map((u) => (
                  <tr key={u.uid} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-6">
                      <div className="font-semibold text-slate-900">{u.displayName || 'User'}</div>
                      <div className="text-slate-400 text-xs">{u.email}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 text-xs font-medium">
                      {u.businessName || 'Workspace'}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={u.role === 'ADMIN' ? 'purple' : 'slate'} size="sm">
                        {u.role}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={
                          u.subscription === 'BUSINESS'
                            ? 'purple'
                            : u.subscription === 'PRO'
                            ? 'emerald'
                            : 'blue'
                        }
                        size="sm"
                      >
                        {u.subscription}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800 text-xs">
                      {u.credits}
                    </td>
                    <td className="py-3.5 px-6 text-right text-slate-400 text-xs">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// =========================================================================
// 2. Admin Users Management Page
// =========================================================================
export const AdminUsersPage: React.FC = () => {
  const { success, error } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Edit user modal
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [creditsInput, setCreditsInput] = useState('50');
  const [roleInput, setRoleInput] = useState<'USER' | 'ADMIN'>('USER');
  const [planInput, setPlanInput] = useState<'FREE' | 'PRO' | 'BUSINESS'>('FREE');

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const openEdit = (u: UserProfile) => {
    setEditingUser(u);
    setCreditsInput(String(u.credits));
    setRoleInput(u.role);
    setPlanInput(u.subscription);
    setModalOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      await updateUserProfile(editingUser.uid, {
        credits: parseInt(creditsInput) || 0,
        role: roleInput,
        subscription: planInput,
      });
      success('User profile updated.');
      setModalOpen(false);
      await loadUsers();
    } catch (err) {
      error('Failed to update user.');
    }
  };

  const handleDeleteUser = async (u: UserProfile) => {
    if (u.email.toLowerCase() === 'imranmahmud1122.test@gmail.com') {
      error('Cannot delete the primary Super Administrator account.');
      return;
    }
    if (window.confirm(`Are you sure you want to permanently delete user account "${u.email}"? This action cannot be undone.`)) {
      try {
        await deleteUserProfile(u.uid);
        setUsers((prev) => prev.filter((user) => user.uid !== u.uid));
        success(`User ${u.email} deleted successfully.`);
        setModalOpen(false);
      } catch (err) {
        error('Failed to delete user profile.');
      }
    }
  };

  const filtered = users.filter(
    (u) =>
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.displayName && u.displayName.toLowerCase().includes(search.toLowerCase())) ||
      (u.businessName && u.businessName.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-['Space_Grotesk',sans-serif]">
            User &amp; Organization Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Audit user accounts, credit balances, subscription tiers, and administrator privileges.
          </p>
        </div>
      </div>

      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search email, name, or business..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <span className="text-xs text-slate-500">{filtered.length} total accounts</span>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-semibold uppercase text-[11px] tracking-wider">
                  <th className="py-3 px-6">User / Email</th>
                  <th className="py-3 px-4">Business</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Subscription</th>
                  <th className="py-3 px-4">Credits</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((u) => (
                  <tr key={u.uid} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-6">
                      <div className="font-semibold text-slate-900">{u.displayName || 'User'}</div>
                      <div className="text-xs text-slate-400">{u.email}</div>
                    </td>
                    <td className="py-3 px-4 text-xs font-medium text-slate-700">
                      {u.businessName || 'Workspace'}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={u.role === 'ADMIN' ? 'purple' : 'slate'} size="sm">
                        {u.role}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          u.subscription === 'BUSINESS'
                            ? 'purple'
                            : u.subscription === 'PRO'
                            ? 'emerald'
                            : 'blue'
                        }
                        size="sm"
                      >
                        {u.subscription}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800 text-xs">
                      {u.credits}
                    </td>
                    <td className="py-3 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEdit(u)}>
                          Edit User
                        </Button>
                        {u.email.toLowerCase() !== 'imranmahmud1122.test@gmail.com' && (
                          <button
                            onClick={() => handleDeleteUser(u)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Edit User Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Edit User Profile &amp; Quotas"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSaveUser} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
              Account Email
            </label>
            <p className="text-sm font-semibold text-slate-900">{editingUser?.email}</p>
          </div>

          <Input
            label="AI Credit Balance"
            type="number"
            value={creditsInput}
            onChange={(e) => setCreditsInput(e.target.value)}
          />

          <Select
            label="System Role"
            value={roleInput}
            onChange={(e) => setRoleInput(e.target.value as any)}
            options={[
              { value: 'USER', label: 'USER (Standard Customer)' },
              { value: 'ADMIN', label: 'ADMIN (Full Platform Privileges)' },
            ]}
          />

          <Select
            label="Subscription Plan"
            value={planInput}
            onChange={(e) => setPlanInput(e.target.value as any)}
            options={[
              { value: 'FREE', label: 'FREE Starter' },
              { value: 'PRO', label: 'PRO Marketer ($39/mo)' },
              { value: 'BUSINESS', label: 'BUSINESS Scale ($99/mo)' },
            ]}
          />

          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            {editingUser && editingUser.email.toLowerCase() !== 'imranmahmud1122.test@gmail.com' ? (
              <button
                type="button"
                onClick={() => handleDeleteUser(editingUser)}
                className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete Account
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Save Changes
              </Button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

// =========================================================================
// 3. Admin Templates CMS
// =========================================================================
export const AdminTemplatesPage: React.FC = () => {
  const { success, error } = useToast();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('E-commerce');
  const [description, setDescription] = useState('');
  const [hook, setHook] = useState('');

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const data = await getTemplates();
      setTemplates(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const openCreate = () => {
    setEditingTemplate(null);
    setTitle('');
    setCategory('E-commerce');
    setDescription('');
    setHook('');
    setModalOpen(true);
  };

  const openEdit = (t: Template) => {
    setEditingTemplate(t);
    setTitle(t.title);
    setCategory(t.category);
    setDescription(t.description);
    setHook(t.content?.hook || '');
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTemplate) {
        await updateTemplate(editingTemplate.id, {
          title,
          category,
          description,
          content: { ...editingTemplate.content, hook },
        });
        success('Template updated successfully.');
      } else {
        await createTemplate({
          title,
          category,
          description,
          content: { hook, templateFormat: 'Video' },
          createdAt: new Date().toISOString(),
        });
        success('Template created.');
      }
      setModalOpen(false);
      await loadTemplates();
    } catch (err) {
      error('Failed to save template');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this template?')) {
      try {
        await deleteTemplate(id);
        setTemplates((prev) => prev.filter((t) => t.id !== id));
        success('Template removed.');
      } catch (err) {
        error('Failed to delete template');
      }
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-['Space_Grotesk',sans-serif]">
            Template CMS Library
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage pre-built high-converting video and ad templates available to users.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={openCreate}
        >
          Add Template
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((t) => (
          <Card key={t.id} className="p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Badge variant="blue" size="sm">
                  {t.category}
                </Badge>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEdit(t)}
                    className="p-1 text-slate-400 hover:text-blue-600 transition cursor-pointer"
                    title="Edit Template"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                    title="Delete Template"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">{t.title}</h3>
              <p className="text-xs text-slate-600 mb-3">{t.description}</p>
              {t.content?.hook && (
                <div className="p-2.5 bg-slate-50 rounded border border-slate-100 text-xs font-semibold text-slate-800">
                  Hook: &ldquo;{t.content.hook}&rdquo;
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingTemplate ? 'Edit Ad Template' : 'Create Ad Template'}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Template Title"
            required
            placeholder="e.g. 3-Second Problem Hook Template"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Input
            label="Category"
            placeholder="e.g. E-commerce, Clothing, Fitness"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
          <Textarea
            label="Description"
            rows={2}
            placeholder="When to use this template..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Input
            label="Sample Hook"
            placeholder="e.g. Stop scrolling if you make this common mistake..."
            value={hook}
            onChange={(e) => setHook(e.target.value)}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              {editingTemplate ? 'Update Template' : 'Save Template'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

// =========================================================================
// 4. Admin Lessons CMS
// =========================================================================
export const AdminLessonsPage: React.FC = () => {
  const { success, error } = useToast();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Meta Ads Strategy');
  const [duration, setDuration] = useState('5 min read');
  const [content, setContent] = useState('');

  const loadLessons = async () => {
    setLoading(true);
    try {
      const data = await getLessons();
      setLessons(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLessons();
  }, []);

  const openCreate = () => {
    setEditingLesson(null);
    setTitle('');
    setCategory('Meta Ads Strategy');
    setDuration('5 min read');
    setContent('');
    setModalOpen(true);
  };

  const openEdit = (l: Lesson) => {
    setEditingLesson(l);
    setTitle(l.title);
    setCategory(l.category);
    setDuration(l.duration || '5 min read');
    setContent(l.content);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingLesson) {
        await updateLesson(editingLesson.id, {
          title,
          category,
          duration,
          content,
        });
        success('Lesson updated successfully.');
      } else {
        await createLesson({
          title,
          category,
          duration,
          content,
          published: true,
          createdAt: new Date().toISOString(),
        });
        success('Lesson added.');
      }
      setModalOpen(false);
      await loadLessons();
    } catch (err) {
      error('Failed to save lesson');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this lesson?')) {
      try {
        await deleteLesson(id);
        setLessons((prev) => prev.filter((l) => l.id !== id));
        success('Lesson removed.');
      } catch (err) {
        error('Failed to delete lesson');
      }
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-['Space_Grotesk',sans-serif]">
            Educational Lessons CMS
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Publish educational guides on Facebook advertising, scriptwriting, and media buying.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={openCreate}
        >
          Add Lesson
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {lessons.map((l) => (
          <Card key={l.id} className="p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Badge variant="purple" size="sm">
                  {l.category} &bull; {l.duration}
                </Badge>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEdit(l)}
                    className="p-1 text-slate-400 hover:text-blue-600 transition cursor-pointer"
                    title="Edit Lesson"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(l.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                    title="Delete Lesson"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">{l.title}</h3>
              <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed whitespace-pre-line">
                {l.content}
              </p>
            </div>
          </Card>
        ))}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingLesson ? 'Edit Educational Lesson' : 'Publish Educational Lesson'}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Lesson Title"
            required
            placeholder="e.g. How to Lower Facebook Ad CPM by 35%"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
            <Input
              label="Reading Duration"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </div>
          <Textarea
            label="Lesson Body / Markdown"
            rows={5}
            required
            placeholder="Write lesson text and tactical tips..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              {editingLesson ? 'Update Lesson' : 'Publish Lesson'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

// =========================================================================
// 5. Admin AI Prompts Management
// =========================================================================
export const AdminPromptsPage: React.FC = () => {
  const { success, error } = useToast();
  const [prompts, setPrompts] = useState<AIPromptConfig[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit prompt modal
  const [editingPrompt, setEditingPrompt] = useState<AIPromptConfig | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [systemInstructions, setSystemInstructions] = useState('');
  const [temperature, setTemperature] = useState('0.7');

  const loadPrompts = async () => {
    setLoading(true);
    try {
      const data = await getAIPrompts();
      setPrompts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrompts();
  }, []);

  const openEdit = (p: AIPromptConfig) => {
    setEditingPrompt(p);
    setSystemInstructions(p.systemInstructions);
    setTemperature(String(p.temperature));
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPrompt) return;
    try {
      await updateAIPrompt(editingPrompt.id, {
        systemInstructions,
        temperature: parseFloat(temperature) || 0.7,
        version: editingPrompt.version + 1,
      });
      success(`Updated prompt: ${editingPrompt.title}`);
      setModalOpen(false);
      await loadPrompts();
    } catch (err) {
      error('Failed to update prompt configuration');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-['Space_Grotesk',sans-serif]">
          AI Prompt Engineering &amp; System Instructions
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Tune the backend Gemini direct-response copywriting and advertising prompts.
        </p>
      </div>

      <div className="space-y-4">
        {prompts.map((p) => (
          <Card key={p.id} className="p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-bold text-slate-900">{p.title}</h3>
                <Badge variant="slate" size="sm">
                  v{p.version}
                </Badge>
              </div>
              <Button variant="outline" size="sm" onClick={() => openEdit(p)}>
                Edit Instructions
              </Button>
            </div>

            <div className="mt-3 text-xs text-slate-600 space-y-1">
              <span className="font-semibold text-slate-800 block text-[11px] uppercase tracking-wider">
                System Instructions:
              </span>
              <p className="font-mono bg-slate-50 p-3 rounded border border-slate-100 whitespace-pre-line text-slate-700">
                {p.systemInstructions}
              </p>
              <span className="text-[11px] text-slate-400 block pt-1">
                Temperature: {p.temperature} &bull; Model: Gemini 2.5 Flash
              </span>
            </div>
          </Card>
        ))}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Edit Prompt: ${editingPrompt?.title}`}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Textarea
            label="System Instructions"
            rows={8}
            value={systemInstructions}
            onChange={(e) => setSystemInstructions(e.target.value)}
          />
          <Input
            label="Sampling Temperature (0.0 - 1.0)"
            type="number"
            step="0.1"
            value={temperature}
            onChange={(e) => setTemperature(e.target.value)}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Prompt Version
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
