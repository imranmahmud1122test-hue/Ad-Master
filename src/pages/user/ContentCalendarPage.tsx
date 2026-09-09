import React, { useEffect, useState } from 'react';
import { useRouter } from '../../context/RouterContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  Calendar as CalendarIcon,
  Plus,
  Trash2,
  Edit,
  Clock,
  Filter,
  CheckCircle2,
  Layers,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Badge, EmptyState } from '../../components/ui/FeedbackComponents';
import { Modal } from '../../components/ui/Modal';
import { Input, Textarea, Select } from '../../components/ui/Input';
import { CalendarItem } from '../../types';
import {
  getUserCalendarItems,
  addCalendarItem,
  updateCalendarItem,
  deleteCalendarItem,
} from '../../services/firestoreService';

export const ContentCalendarPage: React.FC = () => {
  const { profile } = useAuth();
  const { navigate } = useRouter();
  const { success, error } = useToast();

  const [items, setItems] = useState<CalendarItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'month' | 'list'>('month');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CalendarItem | null>(null);
  const [title, setTitle] = useState('');
  const [platform, setPlatform] = useState('Facebook');
  const [contentType, setContentType] = useState('Video');
  const [scheduledDate, setScheduledDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [status, setStatus] = useState<'draft' | 'planned' | 'published'>('planned');
  const [caption, setCaption] = useState('');
  const [notes, setNotes] = useState('');

  // Calendar navigation
  const [currentDate, setCurrentDate] = useState(new Date());

  const loadItems = async () => {
    if (!profile?.uid) return;
    setLoading(true);
    try {
      const data = await getUserCalendarItems(profile.uid);
      setItems(data);
    } catch (err) {
      console.error('Failed to load calendar:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, [profile?.uid]);

  const openAddModal = (dateStr?: string) => {
    setEditingItem(null);
    setTitle('');
    setPlatform('Facebook');
    setContentType('Video');
    setScheduledDate(dateStr || new Date().toISOString().split('T')[0]);
    setStatus('planned');
    setCaption('');
    setNotes('');
    setModalOpen(true);
  };

  const openEditModal = (item: CalendarItem) => {
    setEditingItem(item);
    setTitle(item.title);
    setPlatform(item.platform);
    setContentType(item.contentType);
    setScheduledDate(item.scheduledDate);
    setStatus(item.status);
    setCaption(item.caption || '');
    setNotes(item.notes || '');
    setModalOpen(true);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.uid || !title.trim()) return;

    try {
      if (editingItem) {
        await updateCalendarItem(editingItem.id, {
          title,
          platform,
          contentType,
          scheduledDate,
          status,
          caption,
          notes,
        });
        success('Post updated!');
      } else {
        await addCalendarItem({
          userId: profile.uid,
          title,
          platform,
          contentType,
          date: scheduledDate,
          scheduledDate,
          status,
          caption,
          notes,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        success('Post scheduled on calendar!');
      }
      setModalOpen(false);
      await loadItems();
    } catch (err: any) {
      error('Failed to save calendar post');
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Delete this scheduled item?')) {
      try {
        await deleteCalendarItem(id);
        setItems((prev) => prev.filter((i) => i.id !== id));
        success('Item removed.');
      } catch (err) {
        error('Failed to delete.');
      }
    }
  };

  const handleStatusToggle = async (item: CalendarItem, newStatus: 'Draft' | 'Planned' | 'Published') => {
    try {
      await updateCalendarItem(item.id, { status: newStatus });
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, status: newStatus } : i))
      );
      success(`Status updated to ${newStatus}`);
    } catch (err) {
      error('Failed to update status');
    }
  };

  // Month grid calculation
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-['Space_Grotesk',sans-serif]">
              Content Calendar
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Organize and schedule your weekly social media posting pipeline.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 rounded-md cursor-pointer transition ${
                viewMode === 'month' ? 'bg-white shadow-2xs text-slate-900 font-bold' : 'text-slate-600'
              }`}
            >
              Month View
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-md cursor-pointer transition ${
                viewMode === 'list' ? 'bg-white shadow-2xs text-slate-900 font-bold' : 'text-slate-600'
              }`}
            >
              List View ({items.length})
            </button>
          </div>

          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => openAddModal()}
          >
            Schedule Post
          </Button>
        </div>
      </div>

      {/* Month Navigator (if in month view) */}
      {viewMode === 'month' && (
        <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-slate-900 font-['Space_Grotesk',sans-serif]">
              {monthNames[month]} {year}
            </h2>
            <Badge variant="purple" size="sm">
              {items.filter((i) => i.scheduledDate.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`)).length} Scheduled
            </Badge>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer"
            >
              Today
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* VIEW: MONTH GRID */}
      {viewMode === 'month' ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Day of week headers */}
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/80 text-center py-2.5 text-xs font-bold uppercase tracking-wider text-slate-500">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Calendar Day Cells */}
          <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 min-h-[500px]">
            {/* Empty slots for days before first day of month */}
            {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
              <div key={`empty-${idx}`} className="bg-slate-50/40 p-2 min-h-[100px]" />
            ))}

            {/* Actual days */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(
                dayNum
              ).padStart(2, '0')}`;
              const dayItems = items.filter((i) => i.scheduledDate === dateStr);
              const isToday =
                new Date().toISOString().split('T')[0] === dateStr;

              return (
                <div
                  key={dayNum}
                  onClick={() => openAddModal(dateStr)}
                  className={`p-2 min-h-[100px] hover:bg-blue-50/30 transition cursor-pointer flex flex-col justify-between ${
                    isToday ? 'bg-blue-50/40' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center ${
                        isToday
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-700'
                      }`}
                    >
                      {dayNum}
                    </span>
                    {dayItems.length > 0 && (
                      <span className="text-[10px] font-semibold text-slate-400">
                        {dayItems.length}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 overflow-y-auto max-h-[80px]">
                    {dayItems.map((item) => (
                      <div
                        key={item.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModal(item);
                        }}
                        className={`p-1.5 rounded text-[11px] font-medium border truncate flex items-center justify-between ${
                          item.status === 'published'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : item.status === 'planned'
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                        title={item.title}
                      >
                        <span className="truncate">{item.title}</span>
                        <span className="w-1.5 h-1.5 rounded-full shrink-0 ml-1 bg-current" />
                      </div>
                    ))}
                  </div>

                  <div className="text-[10px] text-slate-300 hover:text-slate-500 text-right pt-1">
                    + Add
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* VIEW: LIST */
        <Card>
          <CardContent className="p-0">
            {items.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  icon={<CalendarIcon className="w-6 h-6 text-purple-600" />}
                  title="No scheduled posts"
                  description="Start scheduling your social content to maintain posting consistency."
                  actionText="Schedule Post"
                  onAction={() => openAddModal()}
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-semibold uppercase text-[11px] tracking-wider">
                      <th className="py-3 px-6">Date</th>
                      <th className="py-3 px-4">Title</th>
                      <th className="py-3 px-4">Platform</th>
                      <th className="py-3 px-4">Format</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {items.map((item) => (
                      <tr
                        key={item.id}
                        onClick={() => openEditModal(item)}
                        className="hover:bg-slate-50 transition cursor-pointer"
                      >
                        <td className="py-3 px-6 font-mono text-xs text-slate-600">
                          {item.scheduledDate}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          {item.title}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="blue" size="sm">
                            {item.platform}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-slate-600 text-xs">
                          {item.contentType}
                        </td>
                        <td className="py-3 px-4">
                          <select
                            value={item.status}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) =>
                              handleStatusToggle(
                                item,
                                e.target.value as 'Draft' | 'Planned' | 'Published'
                              )
                            }
                            className={`text-xs px-2 py-1 rounded border font-semibold cursor-pointer ${
                              item.status === 'Published'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : item.status === 'Planned'
                                ? 'bg-blue-50 text-blue-800 border-blue-300'
                                : 'bg-slate-100 text-slate-700 border-slate-300'
                            }`}
                          >
                            <option value="Draft">Draft</option>
                            <option value="Planned">Planned</option>
                            <option value="Published">Published</option>
                          </select>
                        </td>
                        <td className="py-3 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditModal(item);
                              }}
                              className="p-1 rounded text-slate-400 hover:text-blue-600"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => handleDelete(item.id, e)}
                              className="p-1 rounded text-slate-400 hover:text-rose-600"
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
            )}
          </CardContent>
        </Card>
      )}

      {/* SCHEDULE POST MODAL */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingItem ? 'Edit Scheduled Post' : 'Schedule New Post'}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSaveItem} className="space-y-4">
          <Input
            label="Post Title / Concept"
            required
            placeholder="e.g. Summer Flask Launch Video"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Platform"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              options={[
                { value: 'Facebook', label: 'Facebook' },
                { value: 'Instagram', label: 'Instagram' },
                { value: 'TikTok', label: 'TikTok' },
                { value: 'YouTube', label: 'YouTube' },
              ]}
            />

            <Select
              label="Content Format"
              value={contentType}
              onChange={(e) => setContentType(e.target.value)}
              options={[
                { value: 'Video', label: 'Video (15-60s)' },
                { value: 'Reel/Short', label: 'Vertical Reel / Short' },
                { value: 'Single Image', label: 'Single Image Post' },
                { value: 'Carousel', label: 'Carousel' },
                { value: 'Story', label: 'Story' },
              ]}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Scheduled Date"
              type="date"
              required
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
            />

            <Select
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              options={[
                { value: 'draft', label: 'Draft' },
                { value: 'planned', label: 'Planned' },
                { value: 'published', label: 'Published' },
              ]}
            />
          </div>

          <Textarea
            label="Draft Caption / Copy"
            rows={3}
            placeholder="Paste your caption or copy draft here..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
          />

          <Input
            label="Production Notes / Creator Link"
            placeholder="e.g. Needs b-roll footage of runner in park"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              {editingItem ? 'Save Changes' : 'Schedule Item'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
