import { supabase, isSupabaseReady } from '../../config/supabaseConfig';

/**
 * Authoritative Plan Definitions for AI Content Studio
 * Single source of truth for pricing, credit allowances, and features.
 */
export const PLANS = {
  free: {
    id: 'free',
    name: 'Free',
    badge: 'FREE',
    priceMonthly: 0,
    priceYearly: 0,
    monthlyCredits: 60,
    description: 'Explore AI copywriting with 60 free monthly credits.',
    features: [
      '60 monthly credits for all tools',
      'Access to all 5 AI copywriting tools',
      'Standard generation speed',
      'Persistent history and bookmarks',
      'Single user workspace'
    ],
    popular: false,
    cta: 'Current Plan'
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    badge: 'FOR CREATORS',
    priceMonthly: 5,
    priceYearly: 4,
    monthlyCredits: 600,
    description: 'For creators who need more room to create content consistently.',
    features: [
      '600 monthly credits',
      'Access to all 5 AI copywriting tools',
      'Fast streaming generation',
      'Unlimited history & favorites',
      'Brand tone customization'
    ],
    popular: false,
    cta: 'Upgrade to Starter'
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    badge: 'MOST POPULAR',
    priceMonthly: 19,
    priceYearly: 15,
    monthlyCredits: 2500,
    description: 'For professionals producing content consistently across multiple channels.',
    features: [
      '2,500 monthly credits',
      'Priority high-speed generation queue',
      'Advanced brand tone presets',
      'Unlimited history & favorites',
      'Priority customer support'
    ],
    popular: true,
    cta: 'Upgrade to Pro'
  },
  business: {
    id: 'business',
    name: 'Business',
    badge: 'FOR TEAMS',
    priceMonthly: 49,
    priceYearly: 39,
    monthlyCredits: 7500,
    description: 'For teams and high-volume workflows requiring maximum throughput.',
    features: [
      '7,500 monthly credits',
      'Ultra-fast generation queue',
      'Custom brand presets',
      'Dedicated support queue',
      'Early access to new models'
    ],
    popular: false,
    cta: 'Upgrade to Business'
  }
};

class BillingService {
  constructor() {
    this.client = supabase;
    this.useSupabase = isSupabaseReady && Boolean(this.client);
  }

  /**
   * Returns list of all active plans.
   */
  getPlans() {
    return Object.values(PLANS);
  }

  /**
   * Returns details for a specific plan by ID.
   */
  getPlan(planId) {
    return PLANS[planId] || PLANS.free;
  }

  /**
   * Fetches the user's real subscription record from Supabase.
   */
  async getUserSubscription(userId) {
    if (!this.useSupabase || !userId) {
      return { plan_id: 'free', status: 'active', billing_interval: 'monthly' };
    }

    try {
      const { data, error } = await this.client
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (!error && data) {
        return data;
      }
    } catch (e) {
      // Fallback
    }

    return { plan_id: 'free', status: 'active', billing_interval: 'monthly' };
  }

  /**
   * Fetches the user's real credit wallet record from Supabase with self-healing normalization.
   */
  async getUserWallet(userId) {
    if (!this.useSupabase || !userId) {
      return {
        monthly_credit_allowance: 60,
        monthly_credits_remaining: 60,
        topup_credits_remaining: 0,
        lifetime_credits_used: 0,
        lifetime_words_generated: 0
      };
    }

    try {
      const [walletRes, subRes, genRes] = await Promise.all([
        this.client.from('credit_wallets').select('*').eq('user_id', userId).maybeSingle(),
        this.client.from('subscriptions').select('plan_id').eq('user_id', userId).maybeSingle(),
        this.client.from('generations').select('credits_deducted, word_count').eq('user_id', userId).is('deleted_at', null)
      ]);

      const wallet = walletRes?.data;
      const planId = subRes?.data?.plan_id || 'free';
      const gens = Array.isArray(genRes?.data) ? genRes.data : [];
      const computedCreditsUsed = gens.reduce((sum, g) => sum + (g.credits_deducted || 0), 0);
      const computedWords = gens.reduce((sum, g) => sum + (g.word_count || 0), 0);

      if (wallet) {
        let allowance = wallet.monthly_credit_allowance;
        let remaining = wallet.monthly_credits_remaining;
        const lifetimeWords = Math.max(wallet.lifetime_words_generated || 0, computedWords);
        const lifetimeCredits = Math.max(wallet.lifetime_credits_used || 0, computedCreditsUsed);

        // Reconcile legacy free tier 5000 balance
        if (planId === 'free' && allowance > 60) {
          allowance = 60;
          remaining = Math.max(0, 60 - lifetimeCredits);
        }

        return {
          ...wallet,
          monthly_credit_allowance: allowance,
          monthly_credits_remaining: remaining,
          lifetime_credits_used: lifetimeCredits,
          lifetime_words_generated: lifetimeWords
        };
      }
    } catch (e) {
      // Fallback
    }

    return {
      monthly_credit_allowance: 60,
      monthly_credits_remaining: 60,
      topup_credits_remaining: 0,
      lifetime_credits_used: 0,
      lifetime_words_generated: 0
    };
  }

  /**
   * Consolidated subscription and credit wallet status for the user.
   */
  async getSubscriptionDetails(userId) {
    const [sub, wallet] = await Promise.all([
      this.getUserSubscription(userId),
      this.getUserWallet(userId)
    ]);

    const planMeta = this.getPlan(sub.plan_id);

    return {
      planId: sub.plan_id || 'free',
      planName: planMeta.name,
      status: sub.status ? sub.status.charAt(0).toUpperCase() + sub.status.slice(1) : 'Active',
      billingCycle: sub.billing_interval ? sub.billing_interval.charAt(0).toUpperCase() + sub.billing_interval.slice(1) : 'Monthly',
      nextBillingDate: sub.current_period_end || null,
      amount: `$${planMeta.priceMonthly}.00 / month`,
      monthlyCreditAllowance: wallet.monthly_credit_allowance ?? 60,
      monthlyCreditsRemaining: wallet.monthly_credits_remaining ?? 60,
      topupCreditsRemaining: wallet.topup_credits_remaining ?? 0,
      lifetimeCreditsUsed: wallet.lifetime_credits_used ?? 0,
      lifetimeWordsGenerated: wallet.lifetime_words_generated ?? 0,
      planMeta
    };
  }

  async upgradePlan(planId) {
    // Note: Stripe billing checkout will be implemented in future sprint
    await new Promise(resolve => setTimeout(resolve, 300));
    return { 
      success: false, 
      planId, 
      message: `Plan checkout for ${planId.toUpperCase()} is coming soon.` 
    };
  }
}

export const billingService = new BillingService();
