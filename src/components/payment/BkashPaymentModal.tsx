import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useRouter } from '../../context/RouterContext';
import {
  X,
  Copy,
  Check,
  ShieldAlert,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Smartphone,
  Info,
  HelpCircle,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/FeedbackComponents';
import {
  BKASH_RECEIVER_NUMBER,
  getPlanConfigs,
  submitBkashPayment,
  getUserPendingPayment,
} from '../../services/paymentService';
import { SubscriptionTier, PlanConfig, PaymentRecord } from '../../types';

interface BkashPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPlan?: SubscriptionTier;
  onSuccess?: () => void;
}

export const BkashPaymentModal: React.FC<BkashPaymentModalProps> = ({
  isOpen,
  onClose,
  initialPlan = 'PRO',
  onSuccess,
}) => {
  const { profile, currentUser } = useAuth();
  const { success, error: toastError, info } = useToast();
  const { navigate } = useRouter();

  const [selectedTier, setSelectedTier] = useState<SubscriptionTier>(
    initialPlan === 'FREE' ? 'PRO' : initialPlan
  );
  const [plans, setPlans] = useState<PlanConfig[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);

  // Form states
  const [transactionId, setTransactionId] = useState('');
  const [paymentNote, setPaymentNote] = useState('');
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Pending payment check
  const [pendingPayment, setPendingPayment] = useState<PaymentRecord | null>(null);
  const [checkingPending, setCheckingPending] = useState(true);
  const [submittedPayment, setSubmittedPayment] = useState<PaymentRecord | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    let mounted = true;
    async function loadData() {
      setLoadingPlans(true);
      setCheckingPending(true);
      try {
        const loadedPlans = await getPlanConfigs();
        if (mounted) setPlans(loadedPlans);

        if (profile?.uid) {
          const pending = await getUserPendingPayment(profile.uid);
          if (mounted) setPendingPayment(pending);
        }
      } catch (err) {
        console.error('Error initializing payment data:', err);
      } finally {
        if (mounted) {
          setLoadingPlans(false);
          setCheckingPending(false);
        }
      }
    }

    loadData();
    return () => {
      mounted = false;
    };
  }, [isOpen, profile?.uid]);

  if (!isOpen) return null;

  const currentPlanConfig =
    plans.find((p) => p.id === selectedTier) ||
    plans.find((p) => p.id === 'PRO') || {
      id: 'PRO',
      name: 'Pro Marketer',
      price: 1500,
      currency: 'BDT',
      billing: 'Monthly (30 Days)',
      monthlyCredits: 350,
      features: [
        '350 AI generation credits / month',
        'Full Video Script Generator (15s, 30s, 60s)',
        'Meta Ad Performance Diagnostic Analyzer',
        'Full Funnel Facebook Ads Planner',
      ],
    };

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(BKASH_RECEIVER_NUMBER);
    setCopied(true);
    info('bKash number copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    const cleanTrx = transactionId.trim().toUpperCase();
    if (!cleanTrx) {
      setValidationError('Please enter your bKash Transaction ID.');
      return;
    }

    if (cleanTrx.length < 6) {
      setValidationError('Transaction ID must be at least 6 characters (e.g. 9J28DA...).');
      return;
    }

    if (!profile?.uid) {
      toastError('You must be logged in to submit a payment.');
      return;
    }

    setSubmitting(true);
    try {
      const record = await submitBkashPayment({
        userId: profile.uid,
        userName: profile.displayName || profile.businessName || 'Marketer',
        userEmail: profile.email || currentUser?.email || '',
        plan: selectedTier,
        amount: currentPlanConfig.price,
        transactionId: cleanTrx,
        paymentNote: paymentNote.trim(),
      });

      setSubmittedPayment(record);
      setPendingPayment(record);
      success('Payment submitted for manual verification!');
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setValidationError(err.message || 'Payment submission failed. Please try again.');
      toastError(err.message || 'Payment submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with bKash Brand Accent */}
        <div className="bg-gradient-to-r from-[#D12053] to-[#E2136E] text-white p-5 sm:p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white p-1.5 shadow-md shrink-0 flex items-center justify-center">
              <span className="font-extrabold text-sm text-[#E2136E] tracking-tight font-sans">
                bKash
              </span>
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-semibold mb-1">
                <Smartphone className="w-3 h-3" />
                <span>Manual Verification System</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight font-['Space_Grotesk',sans-serif]">
                Upgrade Your Plan
              </h2>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-6 max-h-[80vh] overflow-y-auto space-y-6">
          {/* PENDING PAYMENT STATE (Existing or Newly Submitted) */}
          {(pendingPayment || submittedPayment) ? (
            <div className="space-y-6">
              <div className="p-5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-3">
                <div className="flex items-center gap-2 font-bold text-base text-amber-900">
                  <Clock className="w-5 h-5 text-amber-600 animate-pulse shrink-0" />
                  <span>Payment Verification Pending</span>
                </div>
                <p className="text-xs sm:text-sm text-amber-800 leading-relaxed">
                  Your payment information has been submitted successfully. An administrator will
                  verify your Transaction ID against our bKash statement before activating your plan.
                </p>
              </div>

              {/* Submission Summary Card */}
              <Card className="p-5 border-slate-200 bg-slate-50/70 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Submission Details
                </h4>

                <div className="grid grid-cols-2 gap-4 text-xs sm:text-sm">
                  <div>
                    <span className="text-slate-500 block text-xs">Selected Plan</span>
                    <strong className="text-slate-900 text-base font-extrabold">
                      {(submittedPayment || pendingPayment)?.plan}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-xs">Payment Amount</span>
                    <strong className="text-[#E2136E] text-base font-extrabold">
                      ৳{(submittedPayment || pendingPayment)?.amount.toLocaleString()} BDT
                    </strong>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <span className="text-slate-500 block text-xs">bKash Transaction ID</span>
                    <span className="font-mono font-bold text-slate-800 bg-white px-2.5 py-1 rounded border border-slate-200 inline-block mt-0.5">
                      {(submittedPayment || pendingPayment)?.transactionId}
                    </span>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <span className="text-slate-500 block text-xs">Status</span>
                    <Badge variant="amber" size="sm" className="mt-1">
                      PENDING VERIFICATION
                    </Badge>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500 block text-xs">Submitted Date</span>
                    <span className="text-slate-700">
                      {new Date(
                        (submittedPayment || pendingPayment)?.submittedAt || Date.now()
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
              </Card>

              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-start gap-2.5">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  You can track your payment and subscription status anytime from your{' '}
                  <button
                    onClick={() => {
                      onClose();
                      navigate('/profile/subscription');
                    }}
                    className="font-bold underline text-blue-700 hover:text-blue-900 cursor-pointer"
                  >
                    Subscription &amp; Payment History
                  </button>{' '}
                  page.
                </span>
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="primary" className="w-full" onClick={onClose}>
                  Done
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    onClose();
                    navigate('/profile/subscription');
                  }}
                >
                  View Payment History
                </Button>
              </div>
            </div>
          ) : (
            /* STANDARD PAYMENT INITIATION FORM */
            <div className="space-y-6">
              {/* 1. Plan Selection Tabs */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Select Upgrade Plan
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {['PRO', 'BUSINESS'].map((tier) => {
                    const cfg = plans.find((p) => p.id === tier);
                    const isSelected = selectedTier === tier;
                    const price = cfg?.price ?? (tier === 'BUSINESS' ? 3500 : 1500);

                    return (
                      <button
                        type="button"
                        key={tier}
                        onClick={() => setSelectedTier(tier as SubscriptionTier)}
                        className={`p-3.5 rounded-xl border text-left transition cursor-pointer relative ${
                          isSelected
                            ? 'border-[#E2136E] bg-pink-50/40 ring-2 ring-[#E2136E]/20'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-slate-900">{tier}</span>
                          {tier === 'PRO' && (
                            <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 bg-pink-100 text-[#E2136E] rounded">
                              Most Popular
                            </span>
                          )}
                        </div>
                        <div className="text-xl font-extrabold text-slate-900 mt-1 font-['Space_Grotesk',sans-serif]">
                          ৳{price.toLocaleString()}{' '}
                          <span className="text-[11px] font-normal text-slate-500">BDT</span>
                        </div>
                        <span className="text-[11px] text-slate-500">
                          {cfg?.billing || 'Monthly (30 Days)'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Plan Benefits Card */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-800">
                    Included with {currentPlanConfig.name}:
                  </span>
                  <Badge variant="blue" size="sm">
                    {currentPlanConfig.monthlyCredits || 350} AI Credits
                  </Badge>
                </div>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-600">
                  {currentPlanConfig.features.slice(0, 4).map((f, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 3. bKash Send Money Box */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-pink-50 to-rose-50/60 border border-pink-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#E2136E] text-white flex items-center justify-center font-bold text-xs">
                      ৳
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#E2136E]">
                      Send Money to this bKash Number
                    </span>
                  </div>
                  <span className="text-xs font-extrabold text-slate-800 bg-white px-2.5 py-1 rounded-full border border-pink-200">
                    ৳{currentPlanConfig.price.toLocaleString()} BDT
                  </span>
                </div>

                {/* Receiver Number & Copy Button */}
                <div className="bg-white rounded-xl p-3.5 border border-pink-200 flex items-center justify-between shadow-2xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      bKash Personal / Merchant Receiver
                    </span>
                    <span className="text-lg sm:text-2xl font-extrabold text-slate-900 tracking-wider font-mono">
                      {BKASH_RECEIVER_NUMBER}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCopyNumber}
                    leftIcon={
                      copied ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-slate-600" />
                      )
                    }
                    className="border-pink-300 text-[#E2136E] hover:bg-pink-50"
                  >
                    {copied ? 'Copied!' : 'Copy Number'}
                  </Button>
                </div>

                {/* Step-by-step instructions */}
                <div className="mt-4 space-y-1.5 text-xs text-slate-700">
                  <span className="font-bold text-slate-900 block mb-1">Payment Instructions:</span>
                  <div className="space-y-1 pl-1">
                    <p>1. Open your <strong>bKash app</strong> or dial *247#.</p>
                    <p>2. Choose <strong>Send Money</strong>.</p>
                    <p>
                      3. Send <strong>৳{currentPlanConfig.price.toLocaleString()} BDT</strong> to{' '}
                      <strong className="font-mono">{BKASH_RECEIVER_NUMBER}</strong>.
                    </p>
                    <p>4. Complete the payment with your bKash PIN.</p>
                    <p>5. Copy the <strong>Transaction ID (TrxID)</strong> from the SMS or receipt.</p>
                    <p>6. Enter your Transaction ID below and submit for verification.</p>
                  </div>
                </div>

                <div className="mt-3.5 p-2.5 rounded-lg bg-white/80 border border-amber-300/80 text-[11px] text-amber-900 flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Important Notice:</strong> Access is activated only after manual verification
                    by an administrator. Please ensure the exact Transaction ID is provided.
                  </span>
                </div>
              </div>

              {/* 4. Transaction ID Submission Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {validationError && (
                  <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{validationError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Payment Amount
                    </label>
                    <input
                      type="text"
                      disabled
                      value={`৳${currentPlanConfig.price.toLocaleString()} BDT`}
                      className="w-full px-3.5 py-2.5 bg-slate-100 text-slate-700 text-sm font-semibold rounded-lg border border-slate-200 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      bKash Number
                    </label>
                    <input
                      type="text"
                      disabled
                      value={BKASH_RECEIVER_NUMBER}
                      className="w-full px-3.5 py-2.5 bg-slate-100 text-slate-700 text-sm font-mono font-semibold rounded-lg border border-slate-200 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Transaction ID (TrxID) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 9J28DAK10L"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value.toUpperCase())}
                    className="w-full px-3.5 py-2.5 bg-white text-slate-900 text-sm font-mono uppercase tracking-wider rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#E2136E] focus:border-transparent shadow-2xs"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Found in your bKash confirmation SMS or transaction statement
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Payment Note <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Your bKash sender number or reference name"
                    value={paymentNote}
                    onChange={(e) => setPaymentNote(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white text-slate-900 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#E2136E]"
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full bg-gradient-to-r from-[#D12053] to-[#E2136E] hover:from-[#c2194b] hover:to-[#ce1063] text-white font-bold py-3 text-sm shadow-md"
                  isLoading={submitting}
                >
                  Submit Payment for Verification
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
