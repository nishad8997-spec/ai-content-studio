import { supabase, isSupabaseReady } from '../../config/supabaseConfig';
import { AI_TOOLS } from '../../config/constants';

class AnalyticsService {
  constructor() {
    this.client = supabase;
    this.useSupabase = isSupabaseReady && Boolean(this.client);
  }

  /**
   * Computes authoritative dashboard metrics from real Supabase user data.
   */
  async getDashboardMetrics(userId) {
    if (!this.useSupabase || !userId) {
      return {
        totalWordsGenerated: 0,
        monthlyCreditAllowance: 60,
        monthlyCreditsRemaining: 60,
        totalGenerations: 0,
        favoriteGenerations: 0,
        usageByTool: []
      };
    }

    try {
      // 1. Query user's active (non-deleted) generations
      const { data: generations, error: genError } = await this.client
        .from('generations')
        .select('tool_id, word_count, credits_deducted, is_favorite, created_at')
        .eq('user_id', userId)
        .is('deleted_at', null);

      // 2. Query user's subscription and credit wallet in parallel
      const [subRes, walletRes] = await Promise.all([
        this.client.from('subscriptions').select('plan_id').eq('user_id', userId).maybeSingle(),
        this.client.from('credit_wallets').select('monthly_credit_allowance, monthly_credits_remaining, lifetime_words_generated, lifetime_credits_used').eq('user_id', userId).maybeSingle()
      ]);

      const planId = subRes?.data?.plan_id || 'free';
      const wallet = walletRes?.data;
      const items = Array.isArray(generations) ? generations : [];
      const totalGenerations = items.length;
      const computedSumWords = items.reduce((acc, curr) => acc + (curr.word_count || 0), 0);
      const computedCreditsUsed = items.reduce((acc, curr) => acc + (curr.credits_deducted || 0), 0);

      // Words Generated: maximum of database wallet counter and sum of actual generations
      const totalWordsGenerated = Math.max(wallet?.lifetime_words_generated || 0, computedSumWords);
      const favoriteGenerations = items.filter(g => g.is_favorite).length;

      // Group usage by AI Tool
      const toolCounts = {};
      items.forEach(g => {
        toolCounts[g.tool_id] = (toolCounts[g.tool_id] || 0) + 1;
      });

      const usageByTool = Object.entries(toolCounts).map(([toolId, count]) => {
        const toolObj = AI_TOOLS.find(t => t.id === toolId);
        const name = toolObj ? toolObj.name : toolId;
        const percentage = totalGenerations > 0 ? Math.round((count / totalGenerations) * 100) : 0;
        return { name, count, percentage };
      });

      // Authoritative credit allowance & remaining calculations
      let allowance = wallet?.monthly_credit_allowance ?? 60;
      let remaining = wallet?.monthly_credits_remaining ?? 60;

      // Self-healing: if database wallet has legacy 5000 allowance on free plan, normalize to 60 base
      if (planId === 'free' && allowance > 60) {
        allowance = 60;
        remaining = Math.max(0, 60 - Math.max(wallet?.lifetime_credits_used || 0, computedCreditsUsed));
      }

      return {
        totalWordsGenerated,
        monthlyCreditAllowance: allowance,
        monthlyCreditsRemaining: remaining,
        totalGenerations,
        favoriteGenerations,
        usageByTool
      };
    } catch (err) {
      console.error("Error computing dashboard metrics from Supabase:", err);
      return {
        totalWordsGenerated: 0,
        monthlyCreditAllowance: 60,
        monthlyCreditsRemaining: 60,
        totalGenerations: 0,
        favoriteGenerations: 0,
        usageByTool: []
      };
    }
  }
}

export const analyticsService = new AnalyticsService();
