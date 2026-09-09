import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Lock, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/FeedbackComponents';
import { BkashPaymentModal } from './BkashPaymentModal';

interface PremiumFeatureLockProps {
  featureTitle: string;
  featureDescription: string;
  benefits?: string[];
  requiredTier?: 'PRO' | 'BUSINESS';
}

export const PremiumFeatureLock: React.FC<PremiumFeatureLockProps> = ({
  featureTitle,
  featureDescription,
  benefits = [
    'Unlimited high-converting AI generations',
    'Full video script scenes with visual directions',
    'Advanced Meta Ads ROI & audience diagnostics',
    'Priority AI model processing & fast export',
  ],
  requiredTier = 'PRO',
}) => {
  const { profile } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className="max-w-2xl mx-auto my-8 p-6 sm:p-8 bg-white rounded-2xl border border-slate-200 shadow-sm text-center">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/10 to-pink-500/10 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-200/50">
          <Lock className="w-7 h-7" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold mb-3">
          <span>Current Plan:</span>
          <strong className="text-slate-900">{profile?.subscription || 'FREE'}</strong>
        </div>

        <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight font-['Space_Grotesk',sans-serif]">
          Upgrade to Unlock {featureTitle}
        </h3>

        <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto leading-relaxed">
          {featureDescription}
        </p>

        {/* Benefits Grid */}
        <div className="my-6 p-4 rounded-xl bg-slate-50 border border-slate-200 text-left max-w-lg mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2.5">
            What you unlock with {requiredTier}:
          </span>
          <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
            {benefits.map((b, i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            variant="primary"
            className="w-full sm:w-auto bg-gradient-to-r from-[#D12053] to-[#E2136E] hover:from-[#c2194b] hover:to-[#ce1063] text-white px-6 py-2.5 font-bold shadow-md cursor-pointer"
            onClick={() => setModalOpen(true)}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Upgrade with bKash
          </Button>
        </div>

        <p className="text-[11px] text-slate-400 mt-4">
          Manual bKash payment verification • Receives instant access upon admin review
        </p>
      </div>

      <BkashPaymentModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialPlan={requiredTier}
      />
    </>
  );
};
