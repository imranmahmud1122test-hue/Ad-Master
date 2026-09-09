import React, { useState } from 'react';
import { useRouter } from '../../context/RouterContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  User,
  Building,
  Target,
  Users,
  Settings as SettingsIcon,
  Shield,
  Zap,
  CreditCard,
  Save,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { Input, Select } from '../../components/ui/Input';
import { Badge } from '../../components/ui/FeedbackComponents';
import { updateUserProfile } from '../../services/firestoreService';

export const ProfilePage: React.FC = () => {
  const { profile, refreshProfile } = useAuth();
  const { success, error } = useToast();

  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [businessName, setBusinessName] = useState(profile?.businessName || '');
  const [businessCategory, setBusinessCategory] = useState(
    profile?.businessCategory || 'E-commerce'
  );
  const [marketingGoal, setMarketingGoal] = useState(
    profile?.marketingGoal || 'Sales'
  );
  const [location, setLocation] = useState(
    profile?.targetAudience?.location || 'United States'
  );
  const [ageRange, setAgeRange] = useState(
    profile?.targetAudience?.ageRange || '22 - 45'
  );
  const [gender, setGender] = useState(
    profile?.targetAudience?.gender || 'All'
  );
  const [customerType, setCustomerType] = useState(
    profile?.targetAudience?.customerType || ''
  );
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.uid) return;
    setSaving(true);
    try {
      await updateUserProfile(profile.uid, {
        displayName,
        businessName,
        businessCategory,
        marketingGoal,
        targetAudience: {
          location,
          ageRange,
          gender,
          customerType,
        },
      });
      await refreshProfile();
      success('Profile & business preferences updated!');
    } catch (err) {
      error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-['Space_Grotesk',sans-serif]">
          Profile &amp; Business Profile
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Update your default workspace parameters used to personalize AI generation prompts.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <Card className="p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <User className="w-4 h-4 text-blue-600" />
            <span>Account Details</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Account Email
              </label>
              <input
                type="text"
                disabled
                value={profile?.email || ''}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-slate-100 text-slate-500 text-sm cursor-not-allowed"
              />
            </div>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Building className="w-4 h-4 text-blue-600" />
            <span>Brand Information</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Business Name"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
            />

            <Select
              label="Business Category"
              value={businessCategory}
              onChange={(e) => setBusinessCategory(e.target.value)}
              options={[
                { value: 'E-commerce', label: 'E-commerce' },
                { value: 'Clothing & Apparel', label: 'Clothing & Apparel' },
                { value: 'Restaurant & Food', label: 'Restaurant & Food' },
                { value: 'Education & Coaching', label: 'Education & Coaching' },
                { value: 'Real Estate', label: 'Real Estate' },
                { value: 'Technology & SaaS', label: 'Technology & SaaS' },
                { value: 'Professional Service', label: 'Professional Service' },
                { value: 'Other', label: 'Other' },
              ]}
            />
          </div>

          <Select
            label="Primary Marketing Goal"
            value={marketingGoal}
            onChange={(e) => setMarketingGoal(e.target.value)}
            options={[
              { value: 'Sales', label: 'Sales & Purchases' },
              { value: 'Leads', label: 'Lead Generation' },
              { value: 'Messages', label: 'Inbound Direct Messages' },
              { value: 'Website Traffic', label: 'Website Traffic' },
              { value: 'Engagement', label: 'Engagement & Video Views' },
              { value: 'Brand Awareness', label: 'Brand Awareness' },
            ]}
          />
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            <span>Default Target Audience</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <Input
              label="Age Range"
              value={ageRange}
              onChange={(e) => setAgeRange(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Target Gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              options={[
                { value: 'All', label: 'All' },
                { value: 'Women', label: 'Women' },
                { value: 'Men', label: 'Men' },
              ]}
            />
            <Input
              label="Customer Archetype"
              placeholder="e.g. Busy mothers seeking organic skincare"
              value={customerType}
              onChange={(e) => setCustomerType(e.target.value)}
            />
          </div>
        </Card>

        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={saving}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Save Profile
          </Button>
        </div>
      </form>
    </div>
  );
};

export const SettingsPage: React.FC = () => {
  const { profile } = useAuth();
  const { navigate } = useRouter();
  const { success } = useToast();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-['Space_Grotesk',sans-serif]">
          Workspace Settings
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your subscription tier, billing preferences, and platform security.
        </p>
      </div>

      {/* Subscription Card */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">Current Subscription</h2>
          </div>
          <Badge
            variant={
              profile?.subscription === 'BUSINESS'
                ? 'purple'
                : profile?.subscription === 'PRO'
                ? 'emerald'
                : 'blue'
            }
            size="md"
          >
            {profile?.subscription || 'FREE'} PLAN
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 font-bold uppercase tracking-wider block mb-1">
              Available AI Credits
            </span>
            <span className="text-2xl font-extrabold text-slate-900 flex items-center gap-1.5">
              <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
              {profile?.credits ?? 0}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
            <div>
              <span className="text-slate-400 font-bold uppercase tracking-wider block mb-1">
                Plan Benefits
              </span>
              <p className="text-slate-600">
                {profile?.subscription === 'BUSINESS'
                  ? '1,200 monthly credits & unlimited saved projects'
                  : profile?.subscription === 'PRO'
                  ? '350 monthly credits & performance analyzer'
                  : '50 free starter credits'}
              </p>
            </div>
            <button
              onClick={() => navigate('/pricing')}
              className="text-xs font-bold text-blue-600 hover:underline pt-2 text-left cursor-pointer"
            >
              Change Subscription Tier &rarr;
            </button>
          </div>
        </div>
      </Card>

      {/* Security & Access */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Shield className="w-5 h-5 text-emerald-600" />
          <h2 className="text-base font-bold text-slate-900">Security &amp; Authorization</h2>
        </div>

        <div className="text-xs text-slate-600 space-y-2">
          <p>
            Role Assignment:{' '}
            <strong className="text-slate-900 font-semibold">{profile?.role || 'USER'}</strong>
          </p>
          <p>
            Status:{' '}
            <span className="text-emerald-600 font-semibold">Active &bull; Verified</span>
          </p>
          <p className="text-slate-400 text-[11px]">
            To reset your password, log out and click &ldquo;Forgot password?&rdquo; on the login screen.
          </p>
        </div>
      </Card>
    </div>
  );
};
