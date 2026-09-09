import React, { useEffect, useState } from 'react';
import { useRouter } from '../../context/RouterContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  ArrowLeft,
  Copy,
  Download,
  Trash2,
  Edit2,
  Check,
  FolderOpen,
  Video,
  FileText,
  Layers,
  BarChart3,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/FeedbackComponents';
import { Project } from '../../types';
import {
  getProjectById,
  updateProject,
  deleteProject,
} from '../../services/firestoreService';

export const ProjectDetailPage: React.FC<{ projectId: string }> = ({ projectId }) => {
  const { navigate } = useRouter();
  const { profile } = useAuth();
  const { success, error, info } = useToast();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [summary, setSummary] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);
      try {
        const data = await getProjectById(projectId);
        if (data) {
          setProject(data);
          setName(data.name);
          setSummary(data.summary || '');
        }
      } catch (err) {
        console.error('Error fetching project:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [projectId]);

  const handleSaveEdits = async () => {
    if (!project) return;
    try {
      await updateProject(project.id, { name, summary });
      setProject({ ...project, name, summary });
      setIsEditing(false);
      success('Project updated.');
    } catch (err) {
      error('Failed to update project.');
    }
  };

  const handleDelete = async () => {
    if (!project) return;
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await deleteProject(project.id);
        success('Project deleted.');
        navigate('/projects');
      } catch (err) {
        error('Failed to delete.');
      }
    }
  };

  const handleExport = () => {
    if (!project) return;
    const blob = new Blob([JSON.stringify(project, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    info('Exported project JSON.');
  };

  const handleCopyRaw = () => {
    if (!project) return;
    navigator.clipboard.writeText(JSON.stringify(project.data, null, 2));
    setCopied(true);
    success('Copied project data to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-slate-500">
        Loading project details...
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16 space-y-4">
        <FolderOpen className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">Project Not Found</h2>
        <p className="text-xs text-slate-500">
          This project may have been deleted or you don&apos;t have access to it.
        </p>
        <Button variant="outline" onClick={() => navigate('/projects')}>
          Return to Projects
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <button
          onClick={() => navigate('/projects')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Projects</span>
        </button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyRaw}
            leftIcon={copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          >
            {copied ? 'Copied' : 'Copy'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            leftIcon={<Download className="w-3.5 h-3.5" />}
          >
            Export
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-rose-600 hover:bg-rose-50"
            onClick={handleDelete}
            leftIcon={<Trash2 className="w-3.5 h-3.5" />}
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Project Header Info */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
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
                size="md"
              >
                {project.type.toUpperCase()}
              </Badge>
              <span className="text-xs text-slate-400 font-mono">
                Created: {new Date(project.createdAt).toLocaleString()}
              </span>
            </div>

            {isEditing ? (
              <div className="space-y-3 pt-2">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <textarea
                  rows={2}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Add notes or summary..."
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex gap-2">
                  <Button variant="primary" size="sm" onClick={handleSaveEdits}>
                    Save Changes
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-['Space_Grotesk',sans-serif]">
                    {project.name}
                  </h1>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-1 rounded text-slate-400 hover:text-blue-600 transition cursor-pointer"
                    title="Edit title"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
                {project.summary && (
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {project.summary}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Render Content Based On Project Type */}
      {project.type === 'video' && project.data?.scenes && (
        <div className="space-y-4">
          {project.data.hook && (
            <div className="p-5 rounded-xl bg-amber-500/10 border-2 border-amber-500/30">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700 block mb-1">
                Attention-Grabbing Hook [{project.data.hook.timestamp}]
              </span>
              <p className="text-base font-bold text-slate-900">
                &ldquo;{project.data.hook.text}&rdquo;
              </p>
              {project.data.hook.rationale && (
                <p className="text-xs text-slate-500 italic mt-1">
                  Why this works: {project.data.hook.rationale}
                </p>
              )}
            </div>
          )}

          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Storyboard Scenes ({project.data.scenes.length})
            </h3>
            {project.data.scenes.map((scene: any, i: number) => (
              <div
                key={i}
                className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs font-bold text-blue-700">
                  <span>Scene {scene.sceneNumber || i + 1} &bull; {scene.timestamp}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    Voiceover:
                  </span>
                  <p className="text-sm font-semibold text-slate-900">
                    &ldquo;{scene.voiceover}&rdquo;
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                  <div className="p-2 rounded bg-slate-50 border border-slate-100">
                    <span className="text-[10px] font-bold uppercase text-slate-500 block">
                      On-Screen Text:
                    </span>
                    <span>{scene.onScreenText}</span>
                  </div>
                  <div className="p-2 rounded bg-slate-50 border border-slate-100">
                    <span className="text-[10px] font-bold uppercase text-slate-500 block">
                      Visual Direction:
                    </span>
                    <span className="text-slate-600">{scene.visualDirection}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {project.data.caption && (
            <Card className="p-5 space-y-2">
              <span className="text-xs font-bold uppercase text-slate-400 block">
                Primary Caption:
              </span>
              <p className="text-xs text-slate-800 whitespace-pre-line leading-relaxed">
                {project.data.caption}
              </p>
            </Card>
          )}
        </div>
      )}

      {/* Fallback structured JSON viewer for other types */}
      {project.type !== 'video' && (
        <Card className="p-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            Stored Project Configuration &amp; Data
          </h3>
          <pre className="p-4 rounded-xl bg-slate-900 text-emerald-400 font-mono text-xs overflow-x-auto">
            {JSON.stringify(project.data, null, 2)}
          </pre>
        </Card>
      )}
    </div>
  );
};
