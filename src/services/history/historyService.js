import { supabase, isSupabaseReady } from '../../config/supabaseConfig';
import { AI_TOOLS } from '../../config/constants';

/**
 * Maps a raw Supabase generations row to the UI Generation model.
 */
function mapGenerationRow(row) {
  if (!row) return null;
  const tool = AI_TOOLS.find(t => t.id === row.tool_id);
  const toolName = tool ? tool.name : (row.tool_id || 'AI Tool');

  return {
    id: row.id,
    toolId: row.tool_id,
    toolName: toolName,
    title: row.title || `${toolName} Output`,
    preview: row.output_text ? (row.output_text.slice(0, 140) + '...') : '',
    content: row.output_text || '',
    wordCount: row.word_count || 0,
    creditsDeducted: row.credits_deducted || 0,
    isFavorite: Boolean(row.is_favorite),
    createdAt: row.created_at || new Date().toISOString()
  };
}

class HistoryService {
  constructor() {
    this.client = supabase;
    this.useSupabase = isSupabaseReady && Boolean(this.client);
  }

  /**
   * Loads all active (non-deleted) generations for the authenticated user.
   */
  async getAll(userId) {
    if (this.useSupabase) {
      try {
        let query = this.client
          .from('generations')
          .select('*')
          .is('deleted_at', null)
          .order('created_at', { ascending: false });

        if (userId) {
          query = query.eq('user_id', userId);
        }

        const { data, error } = await query;

        if (!error && Array.isArray(data)) {
          return data.map(mapGenerationRow);
        }
      } catch (err) {
        console.error("Error fetching generations from Supabase:", err);
      }
      return [];
    }

    // Offline fallback for new users: clean empty list
    return [];
  }

  /**
   * Persists a new generation record to public.generations.
   */
  async addGeneration(newItem, userId) {
    if (this.useSupabase && userId) {
      try {
        const payload = {
          user_id: userId,
          tool_id: newItem.toolId,
          model_id: 'mock-model',
          title: newItem.title || `${newItem.toolName || 'AI Tool'} Result`,
          input_params: newItem.inputs || {},
          output_text: newItem.content || '',
          word_count: newItem.wordCount || 0,
          credits_deducted: newItem.creditsDeducted || newItem.wordCount || 0,
          is_favorite: false
        };

        const { data, error } = await this.client
          .from('generations')
          .insert(payload)
          .select()
          .single();

        if (!error && data) {
          return mapGenerationRow(data);
        }
      } catch (err) {
        console.error("Error saving generation to Supabase:", err);
      }
    }

    // Offline fallback
    return {
      id: `gen_${Date.now()}`,
      createdAt: new Date().toISOString(),
      isFavorite: false,
      ...newItem
    };
  }

  /**
   * Toggles the favorite / bookmark state of a generation.
   */
  async toggleFavorite(id, currentStatus) {
    if (this.useSupabase) {
      try {
        await this.client
          .from('generations')
          .update({ is_favorite: !currentStatus })
          .eq('id', id);
      } catch (err) {
        console.error("Error toggling favorite in Supabase:", err);
      }
    }
  }

  /**
   * Performs soft-delete on a generation (sets deleted_at timestamp).
   */
  async deleteItem(id) {
    if (this.useSupabase) {
      try {
        await this.client
          .from('generations')
          .update({ deleted_at: new Date().toISOString() })
          .eq('id', id);
      } catch (err) {
        console.error("Error soft-deleting generation in Supabase:", err);
      }
    }
  }
}

export const historyService = new HistoryService();
