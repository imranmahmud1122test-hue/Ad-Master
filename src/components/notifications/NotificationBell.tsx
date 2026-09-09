import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  Sparkles,
  Layers,
  AlertTriangle,
  FolderOpen,
  Check,
  CheckCheck,
  Trash2,
  ExternalLink,
  Zap,
  X,
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { useRouter } from '../../context/RouterContext';
import { NotificationItem, NotificationType } from '../../types';

function formatRelativeTime(dateStr: string): string {
  try {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(dateStr).toLocaleDateString();
  } catch {
    return 'Recently';
  }
}

export const NotificationBell: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification, clearAll } =
    useNotifications();
  const { navigate } = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'generation' | 'alerts'>('all');
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const filteredNotifications = notifications.filter((item) => {
    if (activeFilter === 'unread') return !item.read;
    if (activeFilter === 'generation')
      return item.type === 'GENERATION_COMPLETE' || item.type === 'PLAN_CREATED';
    if (activeFilter === 'alerts')
      return item.type === 'CREDIT_LIMIT_APPROACHING' || item.type === 'SYSTEM_ALERT';
    return true;
  });

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'GENERATION_COMPLETE':
        return <Sparkles className="w-4 h-4 text-emerald-600" />;
      case 'PLAN_CREATED':
        return <Layers className="w-4 h-4 text-indigo-600" />;
      case 'CREDIT_LIMIT_APPROACHING':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      case 'PROJECT_SAVED':
        return <FolderOpen className="w-4 h-4 text-blue-600" />;
      default:
        return <Zap className="w-4 h-4 text-slate-600" />;
    }
  };

  const getBadgeColor = (type: NotificationType) => {
    switch (type) {
      case 'GENERATION_COMPLETE':
        return 'bg-emerald-50 border-emerald-200 text-emerald-800';
      case 'PLAN_CREATED':
        return 'bg-indigo-50 border-indigo-200 text-indigo-800';
      case 'CREDIT_LIMIT_APPROACHING':
        return 'bg-amber-50 border-amber-200 text-amber-900';
      case 'PROJECT_SAVED':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-slate-50 border-slate-200 text-slate-800';
    }
  };

  const handleActionClick = async (notif: NotificationItem) => {
    await markAsRead(notif.id);
    if (notif.link) {
      navigate(notif.link);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={popoverRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
        aria-label="View notifications"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-rose-600 rounded-full ring-2 ring-white animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Card */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="p-3.5 bg-slate-50/90 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900 font-['Space_Grotesk',sans-serif]">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-blue-100 text-blue-700">
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 cursor-pointer transition"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Mark all read</span>
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filter Chips */}
          <div className="px-3 py-2 bg-white border-b border-slate-100 flex items-center gap-1 overflow-x-auto text-[11px]">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-2.5 py-1 rounded-full font-medium transition cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setActiveFilter('unread')}
              className={`px-2.5 py-1 rounded-full font-medium transition cursor-pointer ${
                activeFilter === 'unread'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Unread ({unreadCount})
            </button>
            <button
              onClick={() => setActiveFilter('generation')}
              className={`px-2.5 py-1 rounded-full font-medium transition cursor-pointer ${
                activeFilter === 'generation'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Generations
            </button>
            <button
              onClick={() => setActiveFilter('alerts')}
              className={`px-2.5 py-1 rounded-full font-medium transition cursor-pointer ${
                activeFilter === 'alerts'
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Limits & Alerts
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2">
                  <Bell className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-slate-700">No notifications found</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Important generation updates and limit alerts will appear here.
                </p>
              </div>
            ) : (
              filteredNotifications.map((item) => (
                <div
                  key={item.id}
                  className={`p-3.5 transition flex gap-3 group relative ${
                    item.read ? 'bg-white hover:bg-slate-50/80' : 'bg-blue-50/40 hover:bg-blue-50/70'
                  }`}
                >
                  {/* Icon */}
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${getBadgeColor(
                      item.type
                    )}`}
                  >
                    {getIcon(item.type)}
                  </div>

                  {/* Body */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {item.title}
                      </span>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">
                        {formatRelativeTime(item.createdAt)}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-snug line-clamp-2">
                      {item.message}
                    </p>

                    {/* Action button */}
                    {item.link && (
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          onClick={() => handleActionClick(item)}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100/80 px-2 py-0.5 rounded cursor-pointer transition"
                        >
                          <span>{item.actionLabel || 'View Details'}</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Quick item actions */}
                  <div className="flex flex-col items-end justify-between opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={() => removeNotification(item.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded transition cursor-pointer"
                      title="Dismiss notification"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    {!item.read && (
                      <button
                        onClick={() => markAsRead(item.id)}
                        className="p-1 text-slate-400 hover:text-blue-600 rounded transition cursor-pointer"
                        title="Mark as read"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-500">
                {notifications.length} notification{notifications.length !== 1 ? 's' : ''} stored
              </span>
              <button
                onClick={clearAll}
                className="text-[11px] text-slate-500 hover:text-rose-600 font-medium cursor-pointer transition"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
