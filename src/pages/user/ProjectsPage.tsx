import React, { useEffect, useState } from 'react';
import { useRouter } from '../../context/RouterContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  FolderOpen,
  Search,
  Filter,
  Plus,
  Trash2,
  Copy,
  ExternalLink,
  Calendar,
  Video,
  FileText,
  Layers,
  BarChart3,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge, EmptyState } from '../../components/ui/FeedbackComponents';
import { Project } from '../../types';
import {
  getUserProjects,
  deleteProject,
  createProject,
} from '../../services/firestoreService';

export const ProjectsPage: React.FC = () => {
  const { profile } = useAuth();
  const { navigate } = useRouter();
  const { success, error } = useToast();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const loadProjects = async () => {
    if (!profile?.uid) return;
    setLoading(true);
    try {
      const data = await getUserProjects(profile.uid);
      setProjects(data);
    } catch (err) {
      console.error('Failed to load projects:', err);
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

  const handleDuplicate = async (p: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!profile?.uid) return;
    try {
      const copyId = await createProject({
        userId: profile.uid,
        name: `${p.name} (Copy)`,
        type: p.type,
        status: p.status,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        data: p.data,
        summary: p.summary,
      });
      await loadProjects();
      success('Project duplicated!');
    } catch (err) {
      error('Failed to duplicate');
    }
  };

  const filteredProjects = projects.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || p.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="w-4 h-4 text-purple-600" />;
      case 'content':
        return <FileText className="w-4 h-4 text-emerald-600" />;
      case 'campaign':
        return <Layers className="w-4 h-4 text-indigo-600" />;
      case 'analysis':
        return <BarChart3 className="w-4 h-4 text-rose-600" />;
      default:
        return <FolderOpen className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <FolderOpen className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-['Space_Grotesk',sans-serif]">
              Marketing Projects
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Manage your saved video storyboards, copywriting packs, and campaign blueprints.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => navigate('/video-generator')}
        >
          Create New Project
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {['all', 'video', 'content', 'campaign', 'analysis'].map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition cursor-pointer shrink-0 ${
                typeFilter === t
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500">Loading projects...</div>
      ) : filteredProjects.length === 0 ? (
        <Card className="p-10">
          <EmptyState
            icon={<FolderOpen className="w-6 h-6 text-blue-600" />}
            title="No projects match your filter"
            description="Create a new video script or marketing plan to see it saved here."
            actionText="Create Project"
            onAction={() => navigate('/video-generator')}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((p) => (
            <Card
              key={p.id}
              hoverable
              onClick={() => navigate(`/projects/${p.id}`)}
              className="p-5 flex flex-col justify-between cursor-pointer border-slate-200"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                      {getTypeIcon(p.type)}
                    </div>
                    <Badge
                      variant={
                        p.type === 'video'
                          ? 'purple'
                          : p.type === 'campaign'
                          ? 'blue'
                          : p.type === 'analysis'
                          ? 'rose'
                          : 'emerald'
                      }
                      size="sm"
                    >
                      {p.type}
                    </Badge>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {new Date(p.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 line-clamp-1 mb-1.5">
                  {p.name}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {p.summary || 'No description provided.'}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-blue-600 font-semibold inline-flex items-center gap-1">
                  <span>Open</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => handleDuplicate(p, e)}
                    className="p-1 rounded text-slate-400 hover:text-slate-700 transition cursor-pointer"
                    title="Duplicate"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => handleDelete(p.id, e)}
                    className="p-1 rounded text-slate-400 hover:text-rose-600 transition cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
