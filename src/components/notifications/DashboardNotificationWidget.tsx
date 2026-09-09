import React, { useState } from 'react';
import {
  Bell,
  Sparkles,
  Layers,
  AlertTriangle,
  FolderOpen,
  CheckCheck,
  ExternalLink,
  Zap,
  ArrowRight,
  PlusCircle,
  X,
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { useRouter } from '../../context/RouterContext';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { NotificationType } from '../../types';

export const DashboardNotificationWidget: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, notify } = useNotifications();
  const { navigate } = useRouter();
  const [filter, setFilter] = useState<'all' | 'generation' | 'plan' | 'limit'>('all');
  const [dismissBanner, setDismissBanner] = useState(false);

  // Check for subscription limit warning
  const limitWarning = notifications.find(
    (n) => n.type === 'CREDIT_LIMIT_APPROACHING' && !n.read
  );

  const filtered = notifications.filter((n) => {
    if (filter === 'generation') return n.type === 'GENERATION_COMPLETE';
    if (filter === 'plan') return n.type === 'PLAN_CREATED';
    if (filter === 'limit') return n.type === 'CREDIT_LIMIT_APPROACHING';
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

  const getTypeStyle = (type: NotificationType) => {
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

  // Helper for users to test notifications
  const handleSimulateUpdate = async (type: 'gen' | 'plan' | 'limit') => {
    if (type === 'gen') {
      await notify(
        'GENERATION_COMPLETE',
        'Generation Complete',
        'Your 30s High-Converting Video Ad Script for "Lumina Eco Wear" has finished generating.',
        { link: '/projects', actionLabel: 'View Generated Script' }
      );
    } else if (type === 'plan') {
      await notify(
        'PLAN_CREATED',
        'Plan Created',
        'New Facebook Ads Campaign Strategy "$50/day Advantage+ Scaling" was successfully created.',
        { link: '/ads-planner', actionLabel: 'Inspect Campaign Plan' }
      );
    } else {
      await notify(
        'CREDIT_LIMIT_APPROACHING',
        'Subscription Limit Approaching',
        'You have only 8 AI credits left. Upgrade to Pro for 350 monthly credits to continue generating without pauses.',
        { link: '/pricing', actionLabel: 'Upgrade Subscription' }
      );
    }
  };

  return (
    <div className="space-y-4">
      {/* Critical Subscription Limit Alert Banner */}
      {limitWarning && !dismissBanner && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-950 flex items-center gap-2">
                Subscription Limit Approaching
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900 font-semibold uppercase">
                  Action Required
                </span>
              </h4>
              <p className="text-xs text-amber-900/90 mt-0.5 leading-relaxed">
                {limitWarning.message}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <Button
              variant="primary"
              size="sm"
              className="bg-amber-600 hover:bg-amber-700 text-white border-amber-600 shadow-xs"
              onClick={() => {
                markAsRead(limitWarning.id);
                navigate('/pricing');
              }}
            >
              Upgrade Plan
            </Button>
            <button
              onClick={() => setDismissBanner(true)}
              className="p-1.5 text-amber-700 hover:text-amber-950 rounded-lg transition cursor-pointer"
              title="Dismiss warning"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Updates & Activity Stream Card */}
      <Card>
        <CardHeader
          title="Important Updates & Activity"
          subtitle="Real-time notifications for completed generations, created campaign plans, and account alerts."
          action={
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer transition mr-2"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Mark all read</span>
                </button>
              )}
            </div>
          }
        />

        <CardContent className="p-0">
          {/* Filter Bar & Simulation triggers */}
          <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 rounded-full font-medium transition cursor-pointer ${
                  filter === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                All Updates ({notifications.length})
              </button>
              <button
                onClick={() => setFilter('generation')}
                className={`px-3 py-1 rounded-full font-medium transition cursor-pointer ${
                  filter === 'generation'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                Generation Complete
              </button>
              <button
                onClick={() => setFilter('plan')}
                className={`px-3 py-1 rounded-full font-medium transition cursor-pointer ${
                  filter === 'plan'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                Plan Created
              </button>
              <button
                onClick={() => setFilter('limit')}
                className={`px-3 py-1 rounded-full font-medium transition cursor-pointer ${
                  filter === 'limit'
                    ? 'bg-amber-600 text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                Subscription Limit
              </button>
            </div>

            {/* Quick Simulation Testing Chips */}
            <div className="flex items-center gap-1 text-[11px] text-slate-500">
              <span className="hidden sm:inline">Test alert:</span>
              <button
                onClick={() => handleSimulateUpdate('gen')}
                className="px-2 py-0.5 rounded bg-slate-200/80 hover:bg-emerald-100 hover:text-emerald-800 transition cursor-pointer font-medium"
                title="Simulate Generation Complete"
              >
                + Gen
              </button>
              <button
                onClick={() => handleSimulateUpdate('plan')}
                className="px-2 py-0.5 rounded bg-slate-200/80 hover:bg-indigo-100 hover:text-indigo-800 transition cursor-pointer font-medium"
                title="Simulate Plan Created"
              >
                + Plan
              </button>
              <button
                onClick={() => handleSimulateUpdate('limit')}
                className="px-2 py-0.5 rounded bg-slate-200/80 hover:bg-amber-100 hover:text-amber-800 transition cursor-pointer font-medium"
                title="Simulate Subscription Limit"
              >
                + Limit
              </button>
            </div>
          </div>

          {/* List */}
          <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2">
                  <Bell className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-slate-700">No updates in this filter</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Generate video scripts, plan campaigns, or test alerts to see updates here.
                </p>
              </div>
            ) : (
              filtered.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  className={`p-4 flex items-start justify-between gap-4 transition ${
                    item.read ? 'bg-white hover:bg-slate-50/70' : 'bg-blue-50/30 hover:bg-blue-50/60'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border mt-0.5 ${getTypeStyle(
                        item.type
                      )}`}
                    >
                      {getIcon(item.type)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{item.title}</span>
                        {!item.read && (
                          <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                        )}
                        <span className="text-[10px] text-slate-400">
                          {new Date(item.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.message}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {item.link && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs text-blue-600 border-blue-200 hover:bg-blue-50 h-8"
                        onClick={async () => {
                          await markAsRead(item.id);
                          navigate(item.link!);
                        }}
                      >
                        {item.actionLabel || 'View'}
                        <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
