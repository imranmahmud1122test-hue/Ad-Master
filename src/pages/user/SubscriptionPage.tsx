import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from '../../context/RouterContext';
import { useToast } from '../../context/ToastContext';
import {
  CreditCard,
  Zap,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowUpRight,
  ShieldCheck,
  Calendar,
  History,
  RefreshCw,
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/FeedbackComponents';
import { BkashPaymentModal } from '../../components/payment/BkashPaymentModal';
import {
  getUserPaymentHistory,
  getUserPendingPayment,
} from '../../services/paymentService';
import { PaymentRecord, SubscriptionTier } from '../../types';

export const SubscriptionPage: React.FC = () => {
  const { profile, refreshProfile } = useAuth();
  const { navigate } = useRouter();
  const { info } = useToast();

  const [paymentHistory, setPaymentHistory] = useState<PaymentRecord[]>([]);
  const [pendingPayment, setPendingPayment] = useState<PaymentRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [targetUpgradePlan, setTargetUpgradePlan] = useState<SubscriptionTier>('PRO');

  const loadData = async () => {
    if (!profile?.uid) return;
    setLoading(true);
    try {
      const [history, pending] = await Promise.all([
        getUserPaymentHistory(profile.uid),
        getUserPendingPayment(profile.uid),
      ]);
      setPaymentHistory(history);
      setPendingPayment(pending);
    } catch (err) {
      console.error('Error loading subscription data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [profile?.uid]);

  const handleRefresh = async () => {
    await refreshProfile();
    await loadData();
    info('Subscription details refreshed.');
  };

  const currentPlan = profile?.subscription || 'FREE';
  const planStatus = profile?.subscriptionStatus || 'ACTIVE';
  const expirationDate = profile?.subscriptionExpiresAt
    ? new Date(profile.subscriptionExpiresAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : currentPlan === 'FREE'
    ? 'Lifetime Free Access'
    : '30 Days from Approval';

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-['Space_Grotesk',sans-serif]">
            Subscription &amp; Billing
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your active AdMaster AI plan, credit allowance, and bKash payment history.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh Status
          </Button>

          {currentPlan !== 'BUSINESS' && (
            <Button
              variant="primary"
              size="sm"
              className="bg-gradient-to-r from-[#D12053] to-[#E2136E] hover:from-[#c2194b] hover:to-[#ce1063] text-white shadow-sm"
              onClick={() => {
                setTargetUpgradePlan(currentPlan === 'PRO' ? 'BUSINESS' : 'PRO');
                setUpgradeModalOpen(true);
              }}
              rightIcon={<ArrowUpRight className="w-4 h-4" />}
            >
              Upgrade Plan
            </Button>
          )}
        </div>
      </div>

      {/* Pending Payment Notification Banner */}
      {pendingPayment && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-amber-600 animate-pulse shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-amber-900">
                bKash Payment Verification in Progress
              </h4>
              <p className="text-xs text-amber-800 mt-0.5">
                We received your submission for <strong>{pendingPayment.plan}</strong> (TrxID:{' '}
                <span className="font-mono font-bold">{pendingPayment.transactionId}</span>). An
                administrator is verifying the transaction.
              </p>
            </div>
          </div>
          <Badge variant="amber" size="sm" className="self-start sm:self-center">
            PENDING
          </Badge>
        </div>
      )}

      {/* Active Plan Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Current Plan Card */}
        <Card className="p-6 border-slate-200">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
            Current Plan
          </span>
          <div className="flex items-center gap-2 my-2">
            <span className="text-3xl font-extrabold text-slate-900 font-['Space_Grotesk',sans-serif]">
              {currentPlan}
            </span>
            <Badge
              variant={
                currentPlan === 'BUSINESS'
                  ? 'purple'
                  : currentPlan === 'PRO'
                  ? 'blue'
                  : 'slate'
              }
            >
              {planStatus}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            {currentPlan === 'FREE'
              ? 'Basic ad generation & starter marketing tools'
              : currentPlan === 'PRO'
              ? 'Pro marketing suite with full diagnostic engine'
              : 'Enterprise tier with priority processing'}
          </p>
        </Card>

        {/* AI Credits Card */}
        <Card className="p-6 border-slate-200">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
            AI Credits Available
          </span>
          <div className="flex items-center gap-2 my-2">
            <Zap className="w-7 h-7 text-amber-500 fill-amber-500" />
            <span className="text-3xl font-extrabold text-slate-900 font-['Space_Grotesk',sans-serif]">
              {profile?.credits ?? 0}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Remaining generation tokens for scripts and plans
          </p>
        </Card>

        {/* Renewal / Expiration Card */}
        <Card className="p-6 border-slate-200">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
            Renewal / Expiration
          </span>
          <div className="flex items-center gap-2 my-2">
            <Calendar className="w-6 h-6 text-indigo-600" />
            <span className="text-lg font-bold text-slate-900">
              {expirationDate}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Access status is authenticated directly from server
          </p>
        </Card>
      </div>

      {/* Upgrade CTA Card if on Free */}
      {currentPlan === 'FREE' && (
        <Card className="p-6 sm:p-8 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white border-0 shadow-xl relative overflow-hidden">
          <div className="max-w-xl relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 text-xs font-bold mb-3 border border-pink-500/30">
              <span>bKash Instant Upgrade</span>
            </div>
            <h3 className="text-2xl font-extrabold font-['Space_Grotesk',sans-serif]">
              Unlock More With Pro
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
              Get 350 monthly credits, unlocked Video Script Scenes, full Meta Ads Diagnostic
              Analyzer, and high-conversion hooks.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <Button
                variant="primary"
                className="bg-gradient-to-r from-[#D12053] to-[#E2136E] hover:from-[#c2194b] hover:to-[#ce1063] text-white font-bold px-6 py-2.5 shadow-lg cursor-pointer"
                onClick={() => {
                  setTargetUpgradePlan('PRO');
                  setUpgradeModalOpen(true);
                }}
              >
                Upgrade to Pro (৳1,500 BDT)
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Payment History Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-slate-600" />
            <h3 className="text-lg font-bold text-slate-900 font-['Space_Grotesk',sans-serif]">
              Payment History
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            {paymentHistory.length} {paymentHistory.length === 1 ? 'record' : 'records'}
          </span>
        </div>

        <Card className="overflow-hidden border-slate-200">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">
              Loading payment history...
            </div>
          ) : paymentHistory.length === 0 ? (
            <div className="p-10 text-center space-y-2">
              <CreditCard className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">No payment records found</p>
              <p className="text-xs text-slate-400">
                When you submit a bKash upgrade, your payment records and verification status will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3">Date</th>
                    <th className="px-5 py-3">Plan</th>
                    <th className="px-5 py-3">Amount</th>
                    <th className="px-5 py-3">Method</th>
                    <th className="px-5 py-3">Transaction ID</th>
                    <th className="px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paymentHistory.map((item) => (
                    <tr key={item.paymentId || item.transactionId} className="hover:bg-slate-50/50">
                      <td className="px-5 py-3.5 text-slate-600">
                        {new Date(item.submittedAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-5 py-3.5 font-bold text-slate-900">
                        {item.plan}
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-slate-800">
                        ৳{item.amount?.toLocaleString()} BDT
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1 font-semibold text-[#E2136E]">
                          <span className="w-2 h-2 rounded-full bg-[#E2136E]" />
                          bKash
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-xs text-slate-800">
                        {item.transactionId}
                      </td>
                      <td className="px-5 py-3.5">
                        {item.paymentStatus === 'APPROVED' ? (
                          <Badge variant="emerald" size="sm" className="gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            APPROVED
                          </Badge>
                        ) : item.paymentStatus === 'REJECTED' ? (
                          <div className="space-y-0.5">
                            <Badge variant="rose" size="sm" className="gap-1">
                              <XCircle className="w-3 h-3" />
                              REJECTED
                            </Badge>
                            {item.adminNote && (
                              <span className="text-[10px] text-rose-600 block max-w-xs truncate">
                                {item.adminNote}
                              </span>
                            )}
                          </div>
                        ) : (
                          <Badge variant="amber" size="sm" className="gap-1">
                            <Clock className="w-3 h-3" />
                            PENDING
                          </Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* bKash Modal */}
      <BkashPaymentModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        initialPlan={targetUpgradePlan}
        onSuccess={() => {
          loadData();
          refreshProfile();
        }}
      />
    </div>
  );
};
