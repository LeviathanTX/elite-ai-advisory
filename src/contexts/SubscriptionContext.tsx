import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from './AuthContext';
import { SubscriptionTier, SubscriptionLimits, UsageStats } from '../types';

const SUBSCRIPTION_LIMITS: Record<SubscriptionTier, SubscriptionLimits> = {
  founder: {
    ai_advisor_hours: 20,
    document_analyses: 10,
    pitch_practice_sessions: 50,
    custom_advisors: 3,
    api_access: false,
    white_label: false,
  },
  'scale-up': {
    ai_advisor_hours: 50,
    document_analyses: 50,
    pitch_practice_sessions: -1, // unlimited
    custom_advisors: 10,
    api_access: true,
    white_label: false,
  },
  enterprise: {
    ai_advisor_hours: 150,
    document_analyses: -1, // unlimited
    pitch_practice_sessions: -1, // unlimited
    custom_advisors: -1, // unlimited
    api_access: true,
    white_label: true,
  },
};

const SUBSCRIPTION_PRICING = {
  founder: { monthly: 97, yearly: 970 },
  'scale-up': { monthly: 247, yearly: 2470 },
  enterprise: { monthly: 497, yearly: 4970 },
};

interface SubscriptionContextType {
  currentTier: SubscriptionTier;
  limits: SubscriptionLimits;
  usage: UsageStats;
  pricing: typeof SUBSCRIPTION_PRICING;
  loading: boolean;

  // Trial management
  isTrialActive: boolean;
  trialDaysRemaining: number;
  trialEndDate: Date | null;

  // Usage tracking
  incrementUsage: (type: keyof UsageStats, amount?: number) => Promise<boolean>;
  resetUsage: () => Promise<boolean>;

  // Subscription management
  canUseFeature: (feature: keyof SubscriptionLimits) => boolean;
  getRemainingUsage: (feature: keyof UsageStats) => number;
  upgradeTier: (newTier: SubscriptionTier) => Promise<boolean>;

  // Billing
  createCheckoutSession: (
    tier: SubscriptionTier,
    interval: 'monthly' | 'yearly'
  ) => Promise<string | null>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [usage, setUsage] = useState<UsageStats>({
    ai_advisor_hours_used: 0,
    document_analyses_used: 0,
    pitch_practice_sessions_used: 0,
    custom_advisors_created: 0,
  });
  const [loading, setLoading] = useState(false);

  const currentTier = user?.subscription_tier || 'founder';
  const limits = SUBSCRIPTION_LIMITS[currentTier];

  // Calculate trial status
  // Special handling: LeviathanTX@gmail.com never expires
  const isOwnerAccount = user?.email === 'LeviathanTX@gmail.com' || user?.email === 'leviathanTX@gmail.com';
  const isTrialActive = isOwnerAccount ? true : (user?.is_trial_active ?? false);
  const trialEndDate = user?.trial_end_date ? new Date(user.trial_end_date) : null;

  const trialDaysRemaining = React.useMemo(() => {
    // Owner account never expires
    if (isOwnerAccount) return 999;
    if (!trialEndDate) return 0;
    const now = new Date();
    const diffMs = trialEndDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }, [trialEndDate, isOwnerAccount]);

  useEffect(() => {
    if (user) {
      loadUsageStats();
    }
  }, [user]);

  const loadUsageStats = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('usage_stats')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        // If no usage stats exist, create them
        if (error.code === 'PGRST116') {
          const { data: newStats, error: createError } = await supabase
            .from('usage_stats')
            .insert([
              {
                user_id: user.id,
                ...usage,
              },
            ])
            .select()
            .single();

          if (!createError && newStats) {
            setUsage(newStats);
          }
        }
        return;
      }

      setUsage(data);
    } catch (error) {
      console.error('Error loading usage stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const incrementUsage = async (type: keyof UsageStats, amount: number = 1): Promise<boolean> => {
    if (!user) return false;

    try {
      const newUsage = { ...usage, [type]: usage[type] + amount };

      const { error } = await supabase.from('usage_stats').update(newUsage).eq('user_id', user.id);

      if (error) throw error;

      setUsage(newUsage);
      return true;
    } catch (error) {
      console.error('Error incrementing usage:', error);
      return false;
    }
  };

  const resetUsage = async (): Promise<boolean> => {
    if (!user) return false;

    try {
      const resetStats: UsageStats = {
        ai_advisor_hours_used: 0,
        document_analyses_used: 0,
        pitch_practice_sessions_used: 0,
        custom_advisors_created: 0,
      };

      const { error } = await supabase
        .from('usage_stats')
        .update(resetStats)
        .eq('user_id', user.id);

      if (error) throw error;

      setUsage(resetStats);
      return true;
    } catch (error) {
      console.error('Error resetting usage:', error);
      return false;
    }
  };

  const canUseFeature = (feature: keyof SubscriptionLimits): boolean => {
    const limit = limits[feature];

    if (typeof limit === 'boolean') {
      return limit;
    }

    if (limit === -1) {
      return true; // unlimited
    }

    // Map feature to usage stat
    const usageMap: Record<string, keyof UsageStats> = {
      ai_advisor_hours: 'ai_advisor_hours_used',
      document_analyses: 'document_analyses_used',
      pitch_practice_sessions: 'pitch_practice_sessions_used',
      custom_advisors: 'custom_advisors_created',
    };

    const usageKey = usageMap[feature];
    if (!usageKey) return true;

    return usage[usageKey] < limit;
  };

  const getRemainingUsage = (feature: keyof UsageStats): number => {
    const limitMap: Record<keyof UsageStats, keyof SubscriptionLimits> = {
      ai_advisor_hours_used: 'ai_advisor_hours',
      document_analyses_used: 'document_analyses',
      pitch_practice_sessions_used: 'pitch_practice_sessions',
      custom_advisors_created: 'custom_advisors',
    };

    const limitKey = limitMap[feature];
    const limit = limits[limitKey];

    if (typeof limit === 'boolean' || limit === -1) {
      return -1; // unlimited or boolean feature
    }

    return Math.max(0, limit - usage[feature]);
  };

  const upgradeTier = async (newTier: SubscriptionTier): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('users')
        .update({ subscription_tier: newTier })
        .eq('id', user.id);

      if (error) throw error;

      // Update user context would happen automatically via auth state change
      return true;
    } catch (error) {
      console.error('Error upgrading tier:', error);
      return false;
    }
  };

  const createCheckoutSession = async (
    tier: SubscriptionTier,
    interval: 'monthly' | 'yearly'
  ): Promise<string | null> => {
    if (!user) return null;

    try {
      // In production, this would call your backend to create a Stripe checkout session
      // For now, return a mock URL
      const price = SUBSCRIPTION_PRICING[tier][interval];
      const mockCheckoutUrl = `https://checkout.stripe.com/mock?tier=${tier}&interval=${interval}&price=${price}&user=${user.id}`;

      console.log(`Creating checkout session for ${tier} ${interval} - $${price}`);
      return mockCheckoutUrl;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      return null;
    }
  };

  const value = {
    currentTier,
    limits,
    usage,
    pricing: SUBSCRIPTION_PRICING,
    loading,
    isTrialActive,
    trialDaysRemaining,
    trialEndDate,
    incrementUsage,
    resetUsage,
    canUseFeature,
    getRemainingUsage,
    upgradeTier,
    createCheckoutSession,
  };

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>;
};
