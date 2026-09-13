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
  Copy,
  Check,
  Phone,
  ShieldAlert,
  Smartphone,
  Sparkles,
  Filter,
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/FeedbackComponents';
import { BkashPaymentModal } from '../../components/payment/BkashPaymentModal';
import {
  getUserPaymentHistory,
  getUserPendingPayment,
  submitBkashPayment,
  getBkashAccountConfig,
  getPlanConfigs,
  DEFAULT_BKASH_CONFIG,
  BKASH_RECEIVER_NUMBER,
} from '../../services/paymentService';
import { PaymentRecord, SubscriptionTier, BkashAccountConfig, PlanConfig } from '../../types';

export const SubscriptionPage: React.FC = () => {
  const { profile, currentUser, refreshProfile } = useAuth();
  const { navigate } = useRouter();
  const { success, error: toastError, info } = useToast();

  const [paymentHistory, setPaymentHistory] = useState<PaymentRecord[]>([]);
  const [pendingPayment, setPendingPayment] = useState<PaymentRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');

  // bKash Config & Plans
  const [bkashConfig, setBkashConfig] = useState<BkashAccountConfig>(DEFAULT_BKASH_CONFIG);
  const [plans, setPlans] = useState<PlanConfig[]>([]);

  // Manual Upgrade Form States
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'BKASH'>('BKASH');
  const [selectedPlanTier, setSelectedPlanTier] = useState<SubscriptionTier>('PRO');
  const [senderWalletNumber, setSenderWalletNumber] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [paymentNote, setPaymentNote] = useState('');
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [copiedReceiver, setCopiedReceiver] = useState(false);
  const [formError, setFormError] = useState('');

  // Fallback Modal state
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  const loadData = async () => {
    if (!profile?.uid) return;
    setLoading(true);
    try {
      const [history, pending, config, planList] = await Promise.all([
        getUserPaymentHistory(profile.uid),
        getUserPendingPayment(profile.uid),
        getBkashAccountConfig(),
        getPlanConfigs(),
      ]);
      setPaymentHistory(history);
      setPendingPayment(pending);
      setBkashConfig(config);
      setPlans(planList);
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

  const handleCopyReceiver = () => {
    const numberToCopy = bkashConfig.receiverNumber || BKASH_RECEIVER_NUMBER;
    navigator.clipboard.writeText(numberToCopy);
    setCopiedReceiver(true);
    success('bKash receiver number copied to clipboard!');
    setTimeout(() => setCopiedReceiver(false), 2500);
  };

  const selectedPlanConfig =
    plans.find((p) => p.id === selectedPlanTier) ||
    (selectedPlanTier === 'PRO'
      ? { id: 'PRO', name: 'Pro Marketer', price: 1500, monthlyCredits: 350 }
      : { id: 'BUSINESS', name: 'Business Scale', price: 3500, monthlyCredits: 1200 });

  const handleDirectPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (pendingPayment) {
      setFormError('You currently have a payment pending verification. Please wait for approval.');
      return;
    }

    const cleanSender = senderWalletNumber.trim();
    if (!cleanSender) {
      setFormError('Please enter your bKash wallet number (sender number).');
      return;
    }

    const cleanTrx = transactionId.trim().toUpperCase();
    if (!cleanTrx) {
      setFormError('Please enter the bKash Transaction ID (TrxID).');
      return;
    }

    if (cleanTrx.length < 6) {
      setFormError('Transaction ID must be at least 6 alphanumeric characters.');
      return;
    }

    if (!profile?.uid) {
      toastError('You must be logged in to submit a payment.');
      return;
    }

    setSubmittingPayment(true);
    try {
      const record = await submitBkashPayment({
        userId: profile.uid,
        userName: profile.displayName || profile.businessName || 'Marketer',
        userEmail: profile.email || currentUser?.email || '',
        plan: selectedPlanTier,
        amount: selectedPlanConfig.price,
        senderNumber: cleanSender,
        transactionId: cleanTrx,
        paymentNote: paymentNote.trim(),
      });

      setPendingPayment(record);
      setPaymentHistory((prev) => [record, ...prev]);
      setSenderWalletNumber('');
      setTransactionId('');
      setPaymentNote('');
      success('bKash payment submitted! An administrator will verify your transaction shortly.');
      await refreshProfile();
    } catch (err: any) {
      setFormError(err.message || 'Payment submission failed. Please try again.');
      toastError(err.message || 'Payment submission failed.');
    } finally {
      setSubmittingPayment(false);
    }
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

  const activeReceiver = bkashConfig.receiverNumber || BKASH_RECEIVER_NUMBER;

  const filteredPaymentHistory = paymentHistory.filter((item) => {
    if (statusFilter === 'ALL') return true;
    return item.paymentStatus === statusFilter;
  });

  return (
    <div className="space-y-10 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-['Space_Grotesk',sans-serif]">
            Subscription &amp; Billing
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your active plan, upgrade using bKash (BDT ৳), and track manual verification records.
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
                const element = document.getElementById('manual-bkash-payment-section');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                } else {
                  setUpgradeModalOpen(true);
                }
              }}
              rightIcon={<ArrowUpRight className="w-4 h-4" />}
            >
              Upgrade with bKash
            </Button>
          )}
        </div>
      </div>

      {/* Pending Payment Notification Banner */}
      {pendingPayment && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border-2 border-amber-200 text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
              <Clock className="w-5 h-5 text-amber-700 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-amber-950">
                  bKash Payment Under Manual Verification
                </h4>
                <Badge variant="amber" size="sm">
                  PENDING
                </Badge>
              </div>
              <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                We received your payment submission for the <strong>{pendingPayment.plan}</strong> tier
                (Amount: <strong>৳{pendingPayment.amount?.toLocaleString()} BDT</strong>, TrxID:{' '}
                <span className="font-mono font-bold bg-amber-100/80 px-1.5 py-0.5 rounded border border-amber-200">
                  {pendingPayment.transactionId}
                </span>
                {pendingPayment.senderNumber ? `, Sender: ${pendingPayment.senderNumber}` : ''}).
                An administrator is actively verifying this transfer.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Active Plan Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Current Plan Card */}
        <Card className="p-6 border-slate-200 shadow-xs hover:shadow-sm transition">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
            Current Tier
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
              : 'Enterprise tier with priority processing & maximum credits'}
          </p>
        </Card>

        {/* AI Credits Card */}
        <Card className="p-6 border-slate-200 shadow-xs hover:shadow-sm transition">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
            AI Credits Available
          </span>
          <div className="flex items-center gap-2.5 my-2">
            <Zap className="w-7 h-7 text-amber-500 fill-amber-500" />
            <span className="text-3xl font-extrabold text-slate-900 font-['Space_Grotesk',sans-serif]">
              {profile?.credits ?? 0}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Credits are consumed when running video scripts, hook engines, and blueprints.
          </p>
        </Card>

        {/* Renewal / Expiration Card */}
        <Card className="p-6 border-slate-200 shadow-xs hover:shadow-sm transition">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
            Renewal / Expiration
          </span>
          <div className="flex items-center gap-2.5 my-2">
            <Calendar className="w-6 h-6 text-indigo-600" />
            <span className="text-lg font-bold text-slate-900">
              {expirationDate}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Verified directly with live server authentication.
          </p>
        </Card>
      </div>

      {/* Manual bKash Payment & Upgrade Form Section */}
      <div
        id="manual-bkash-payment-section"
        className="bg-white rounded-3xl border-2 border-pink-200/90 shadow-sm overflow-hidden"
      >
        {/* Banner Header */}
        <div className="bg-gradient-to-r from-[#D12053] via-[#E2136E] to-[#B00E52] p-6 sm:p-8 text-white relative">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-xs font-bold uppercase tracking-wider mb-2.5 border border-white/20">
                <Smartphone className="w-3.5 h-3.5" />
                <span>Manual BDT Payment Flow</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-['Space_Grotesk',sans-serif]">
                Upgrade Plan with bKash (BDT ৳)
              </h2>
              <p className="text-xs sm:text-sm text-pink-100 mt-1 max-w-xl">
                Send payment directly from your personal bKash account in Bangladeshi Taka. Provide your wallet number and Transaction ID for instant manual review.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/20 text-right self-start sm:self-auto">
              <span className="text-[11px] uppercase font-bold text-pink-200 block">
                Receiver Account
              </span>
              <span className="text-lg sm:text-xl font-mono font-extrabold text-white block">
                {activeReceiver}
              </span>
              <span className="text-[10px] text-pink-200 font-medium">
                bKash {bkashConfig.accountType}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-8">
          {/* 1. Payment Method Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
              1. Select Payment Method
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* bKash Selection */}
              <div
                onClick={() => setSelectedPaymentMethod('BKASH')}
                className={`cursor-pointer rounded-2xl p-4.5 border-2 transition-all flex items-center justify-between ${
                  selectedPaymentMethod === 'BKASH'
                    ? 'border-[#E2136E] bg-pink-50/50 shadow-xs'
                    : 'border-slate-200 hover:border-pink-300'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-[#E2136E] text-white flex items-center justify-center font-extrabold text-2xl shadow-xs">
                    ৳
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900 text-sm">
                        bKash (MFS)
                      </span>
                      <Badge variant="pink" size="sm">
                        BDT ৳
                      </Badge>
                    </div>
                    <span className="text-xs text-slate-500 block mt-0.5">
                      Send Money / Payment in Bangladeshi Taka
                    </span>
                  </div>
                </div>

                <div className="w-5 h-5 rounded-full border-2 border-[#E2136E] flex items-center justify-center">
                  {selectedPaymentMethod === 'BKASH' && (
                    <div className="w-2.5 h-2.5 rounded-full bg-[#E2136E]" />
                  )}
                </div>
              </div>

              {/* Other methods placeholder */}
              <div className="rounded-2xl p-4.5 border border-slate-200 bg-slate-50/60 opacity-60 flex items-center justify-between cursor-not-allowed">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-slate-300 text-slate-600 flex items-center justify-center font-bold text-sm">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-700 text-sm">
                      International Cards (USD)
                    </span>
                    <span className="text-xs text-slate-400 block mt-0.5">
                      Stripe / Visa / Mastercard (Unavailable)
                    </span>
                  </div>
                </div>
                <Badge variant="slate" size="sm">
                  Inactive
                </Badge>
              </div>
            </div>
          </div>

          {/* 2. Choose Plan Tier */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
              2. Choose Target Tier
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Pro Tier Option */}
              <div
                onClick={() => setSelectedPlanTier('PRO')}
                className={`cursor-pointer rounded-2xl p-5 border-2 transition-all relative ${
                  selectedPlanTier === 'PRO'
                    ? 'border-blue-600 bg-blue-50/40 shadow-xs'
                    : 'border-slate-200 hover:border-blue-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-base">Pro Marketer</span>
                    <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                      Popular
                    </span>
                  </div>
                  <span className="text-xl font-extrabold text-slate-900 font-['Space_Grotesk',sans-serif]">
                    ৳1,500 <span className="text-xs font-normal text-slate-500">BDT/mo</span>
                  </span>
                </div>
                <p className="text-xs text-slate-600 mb-3">
                  350 AI generation credits, Meta Analyzer, 35 saved projects.
                </p>
                <div className="flex items-center gap-2 text-xs font-semibold text-blue-700">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Includes Priority Gemini 2.5 Engine</span>
                </div>
              </div>

              {/* Business Tier Option */}
              <div
                onClick={() => setSelectedPlanTier('BUSINESS')}
                className={`cursor-pointer rounded-2xl p-5 border-2 transition-all relative ${
                  selectedPlanTier === 'BUSINESS'
                    ? 'border-purple-600 bg-purple-50/40 shadow-xs'
                    : 'border-slate-200 hover:border-purple-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-base">Business Scale</span>
                    <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded-full">
                      Max Credits
                    </span>
                  </div>
                  <span className="text-xl font-extrabold text-slate-900 font-['Space_Grotesk',sans-serif]">
                    ৳3,500 <span className="text-xs font-normal text-slate-500">BDT/mo</span>
                  </span>
                </div>
                <p className="text-xs text-slate-600 mb-3">
                  1,200 AI generation credits, Unlimited projects, Full CMS templates.
                </p>
                <div className="flex items-center gap-2 text-xs font-semibold text-purple-700">
                  <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>Includes 24/7 Priority VIP Approval</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Manual Verification Instructions Box */}
          <div className="rounded-2xl bg-gradient-to-br from-pink-50/60 via-white to-rose-50/40 border border-pink-200 p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-pink-100">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#E2136E] text-white flex items-center justify-center font-bold text-sm">
                  ৳
                </div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#E2136E]">
                  bKash Payment Instructions
                </span>
              </div>
              <span className="text-xs font-extrabold text-slate-800 bg-white px-3 py-1 rounded-full border border-pink-200 shadow-2xs">
                Total Due: ৳{selectedPlanConfig.price.toLocaleString()} BDT
              </span>
            </div>

            {/* Receiver Number & Copy Card */}
            <div className="bg-white rounded-xl p-4 border border-pink-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    bKash {bkashConfig.accountType} Account
                  </span>
                  {bkashConfig.accountName && (
                    <span className="text-[10px] text-[#E2136E] font-semibold">
                      ({bkashConfig.accountName})
                    </span>
                  )}
                </div>
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-wider font-mono">
                  {activeReceiver}
                </span>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopyReceiver}
                leftIcon={
                  copiedReceiver ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-slate-600" />
                  )
                }
                className="border-pink-300 text-[#E2136E] hover:bg-pink-50 self-start sm:self-center"
              >
                {copiedReceiver ? 'Copied Number!' : 'Copy Receiver Number'}
              </Button>
            </div>

            {/* Step by step instructions */}
            <div className="space-y-1.5 text-xs text-slate-700 pl-1">
              <span className="font-bold text-slate-900 block mb-1">How to complete your payment:</span>
              <p>1. Open your <strong>bKash app</strong> or dial <strong>*247#</strong>.</p>
              <p>
                2. Select{' '}
                <strong>
                  {bkashConfig.accountType === 'Merchant' ? 'Make Payment / Payment' : bkashConfig.accountType === 'Agent' ? 'Cash In' : 'Send Money'}
                </strong>.
              </p>
              <p>
                3. Send <strong>৳{selectedPlanConfig.price.toLocaleString()} BDT</strong> to{' '}
                <strong className="font-mono text-[#E2136E]">{activeReceiver}</strong>.
              </p>
              <p>4. Confirm transfer with your bKash PIN.</p>
              <p>5. Copy the <strong>Transaction ID (TrxID)</strong> from the confirmation SMS or statement.</p>
              <p>6. Fill in your sender wallet number and TrxID in the verification form below.</p>
            </div>

            {bkashConfig.instructions && bkashConfig.instructions !== DEFAULT_BKASH_CONFIG.instructions && (
              <div className="p-2.5 rounded-lg bg-pink-100/60 border border-pink-200 text-xs text-slate-700">
                <span className="font-semibold text-slate-800">Admin Note: </span>
                {bkashConfig.instructions}
              </div>
            )}

            <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Manual Review Policy:</strong> Accounts are upgraded immediately upon admin verification of the TrxID. Ensure exact TrxID is entered.
              </span>
            </div>
          </div>

          {/* 4. Verification Form */}
          <form onSubmit={handleDirectPaymentSubmit} className="space-y-5">
            {formError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Amount to Pay (BDT ৳)
                </label>
                <input
                  type="text"
                  disabled
                  value={`৳${selectedPlanConfig.price.toLocaleString()} BDT`}
                  className="w-full px-3.5 py-2.5 bg-slate-100 text-slate-700 text-sm font-bold rounded-xl border border-slate-200 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Receiver bKash Number
                </label>
                <input
                  type="text"
                  disabled
                  value={activeReceiver}
                  className="w-full px-3.5 py-2.5 bg-slate-100 text-slate-700 text-sm font-mono font-bold rounded-xl border border-slate-200 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#E2136E]" />
                  Your bKash Wallet Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 017xxxxxxxx or 018xxxxxxxx"
                  value={senderWalletNumber}
                  onChange={(e) => setSenderWalletNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white text-slate-900 text-sm font-mono font-semibold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#E2136E] focus:border-transparent shadow-2xs"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  The mobile number you made the transfer from
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  bKash Transaction ID (TrxID) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 9J28DAK10L"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 bg-white text-slate-900 text-sm font-mono font-bold uppercase tracking-wider rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#E2136E] focus:border-transparent shadow-2xs"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Found in your bKash SMS confirmation or app statement
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Payment Note / Account Reference <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Account name or reference entered during transfer"
                value={paymentNote}
                onChange={(e) => setPaymentNote(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white text-slate-900 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#E2136E] shadow-2xs"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={Boolean(pendingPayment) || submittingPayment}
              loading={submittingPayment}
              className="w-full bg-gradient-to-r from-[#D12053] to-[#E2136E] hover:from-[#ba1748] hover:to-[#cb1063] text-white font-bold py-3.5 text-sm shadow-md"
            >
              {pendingPayment
                ? 'Payment Already Pending Verification'
                : `Submit bKash Payment for Verification (৳${selectedPlanConfig.price.toLocaleString()} BDT)`}
            </Button>
          </form>
        </div>
      </div>

      {/* Payment History Table Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <History className="w-5 h-5 text-slate-700" />
            <h3 className="text-lg font-bold text-slate-900 font-['Space_Grotesk',sans-serif]">
              Payment &amp; Verification History
            </h3>
            <Badge variant="slate" size="sm">
              {filteredPaymentHistory.length} of {paymentHistory.length} {paymentHistory.length === 1 ? 'transaction' : 'transactions'}
            </Badge>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap self-start sm:self-auto">
            {/* Status Filter Dropdown */}
            <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <label htmlFor="status-filter-select" className="text-xs font-bold text-slate-600">Filter:</label>
              <select
                id="status-filter-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="text-xs font-semibold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Statuses ({paymentHistory.length})</option>
                <option value="PENDING">Pending ({paymentHistory.filter(p => p.paymentStatus === 'PENDING').length})</option>
                <option value="APPROVED">Approved ({paymentHistory.filter(p => p.paymentStatus === 'APPROVED').length})</option>
                <option value="REJECTED">Rejected ({paymentHistory.filter(p => p.paymentStatus === 'REJECTED').length})</option>
              </select>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={loadData}
              leftIcon={<RefreshCw className="w-3 h-3" />}
              className="text-slate-600 hover:text-slate-900"
            >
              Reload History
            </Button>
          </div>
        </div>

        <Card className="overflow-hidden border-slate-200 shadow-xs">
          {loading ? (
            <div className="p-10 text-center text-xs text-slate-400 space-y-2">
              <RefreshCw className="w-5 h-5 animate-spin mx-auto text-slate-400" />
              <p>Fetching payment history...</p>
            </div>
          ) : paymentHistory.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">No payment transactions yet</p>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  When you submit a bKash upgrade above, your TrxID and manual approval status will be tracked here in real-time.
                </p>
              </div>
            </div>
          ) : filteredPaymentHistory.length === 0 ? (
            <div className="p-10 text-center space-y-2">
              <Filter className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">No {statusFilter.toLowerCase()} transactions found</p>
              <p className="text-xs text-slate-400">
                Try selecting a different status filter above to view other records.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3.5">Submission Date</th>
                    <th className="px-5 py-3.5">Plan Tier</th>
                    <th className="px-5 py-3.5">Amount (BDT)</th>
                    <th className="px-5 py-3.5">Method</th>
                    <th className="px-5 py-3.5">Sender Wallet</th>
                    <th className="px-5 py-3.5">Transaction ID</th>
                    <th className="px-5 py-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPaymentHistory.map((item) => (
                    <tr key={item.paymentId || item.transactionId} className="hover:bg-slate-50/60 transition">
                      <td className="px-5 py-4 text-slate-600">
                        {new Date(item.submittedAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="px-5 py-4 font-bold text-slate-900">
                        {item.plan}
                      </td>
                      <td className="px-5 py-4 font-bold text-slate-800">
                        ৳{item.amount?.toLocaleString()} BDT
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1.5 font-bold text-[#E2136E] text-xs bg-pink-50 px-2 py-0.5 rounded-full border border-pink-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#E2136E]" />
                          bKash
                        </span>
                      </td>
                      <td className="px-5 py-4 font-mono text-xs text-slate-700">
                        {item.senderNumber || <span className="text-slate-400 font-sans italic">Not specified</span>}
                      </td>
                      <td className="px-5 py-4 font-mono text-xs font-semibold text-slate-900">
                        {item.transactionId}
                      </td>
                      <td className="px-5 py-4">
                        {item.paymentStatus === 'APPROVED' ? (
                          <Badge variant="emerald" size="sm" className="gap-1 font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            APPROVED
                          </Badge>
                        ) : item.paymentStatus === 'REJECTED' ? (
                          <div className="space-y-1">
                            <Badge variant="rose" size="sm" className="gap-1 font-bold">
                              <XCircle className="w-3.5 h-3.5" />
                              REJECTED
                            </Badge>
                            {item.adminNote && (
                              <span className="text-[10px] text-rose-600 block max-w-xs truncate" title={item.adminNote}>
                                Reason: {item.adminNote}
                              </span>
                            )}
                          </div>
                        ) : (
                          <Badge variant="amber" size="sm" className="gap-1 font-bold">
                            <Clock className="w-3.5 h-3.5 animate-pulse" />
                            PENDING VERIFICATION
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

      {/* bKash Modal Fallback */}
      <BkashPaymentModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        initialPlan={selectedPlanTier}
        onSuccess={() => {
          loadData();
          refreshProfile();
        }}
      />
    </div>
  );
};
