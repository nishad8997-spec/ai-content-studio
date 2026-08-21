import { supabase, isSupabaseReady } from '../../config/supabaseConfig';

/**
 * Database Service Interface
 * Prepared repository pattern for future Supabase client queries (`profiles`, `generations`, `subscriptions`).
 */
class DBService {
  constructor() {
    this.client = supabase;
  }

  isReady() {
    return isSupabaseReady && Boolean(this.client);
  }

  getSupabaseClient() {
    return this.client;
  }

  async fetchGenerations(userId) {
    if (!this.isReady()) {
      return null;
    }
    console.log("Fetching generations from Supabase for user:", userId);
    return [];
  }

  async saveGeneration(userId, generationData) {
    if (!this.isReady()) {
      return null;
    }
    console.log("Saving generation to Supabase:", generationData);
    return { id: `sp_${Date.now()}`, ...generationData };
  }
}

export const dbService = new DBService();
