import { edgeAIService } from './edgeAIService';
import { mockProvider } from './providers/mockProvider';
import { PROVIDER_TYPES } from '../../config/aiProviders';

class AIService {
  constructor() {
    this.activeProviderId = null; // Edge Function uses authoritative centralized tool routing
  }

  setProvider(providerId) {
    this.activeProviderId = providerId;
  }

  getActiveProvider() {
    return this.activeProviderId;
  }

  /**
   * Dispatches generation to the secure server-side Supabase Edge Function.
   * If in explicit local dev mock mode, allows mockProvider.
   * Never silently generates fake content on server failures.
   */
  async generateStream(toolId, inputs, onChunk, onComplete, signal) {
    if (this.activeProviderId === PROVIDER_TYPES.MOCK) {
      return await mockProvider.generateStream(toolId, inputs, onChunk, onComplete, signal);
    }

    try {
      return await edgeAIService.generateStream(
        {
          toolId,
          inputs,
          provider: this.activeProviderId || undefined
        },
        onChunk,
        onComplete,
        signal
      );
    } catch (err) {
      if (signal?.aborted) return null;
      console.error(`AI Generation error via Edge Function:`, err);
      // Surface real server error directly; do NOT silently generate fake content
      throw err;
    }
  }
}

export const aiService = new AIService();
