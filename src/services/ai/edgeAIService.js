import { supabase, isSupabaseReady } from '../../config/supabaseConfig';
import { env } from '../../config/env';

/**
 * EdgeAIService
 * Handles real-time SSE streaming communication with the Supabase `ai-generate` Edge Function.
 * Guarantees zero AI provider secrets in the browser bundle.
 */
class EdgeAIService {
  constructor() {
    this.client = supabase;
    this.useSupabase = isSupabaseReady && Boolean(this.client);
  }

  /**
   * Streams generation tokens from the Supabase Edge Function.
   * @param {Object} params
   * @param {string} params.toolId
   * @param {Object} params.inputs
   * @param {string} [params.provider]
   * @param {string} [params.modelId]
   * @param {Function} onChunk - Receives accumulated text string on every token.
   * @param {Function} onComplete - Receives final completion metadata { text, wordCount, creditsDeducted, generationId }.
   * @param {AbortSignal} [signal] - Optional abort signal to cancel streaming.
   */
  async generateStream({ toolId, inputs, provider, modelId }, onChunk, onComplete, signal) {
    if (!this.useSupabase) {
      throw new Error('Supabase client is not initialized.');
    }

    const { data: { session }, error: sessionError } = await this.client.auth.getSession();
    if (sessionError || !session?.access_token) {
      throw new Error('Please sign in to generate content.');
    }

    const supabaseUrl = env.supabaseUrl;
    const supabaseAnonKey = env.supabaseAnonKey;
    const edgeFunctionUrl = `${supabaseUrl}/functions/v1/ai-generate`;

    let response;
    try {
      response = await fetch(edgeFunctionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          toolId,
          provider,
          modelId,
          inputs,
        }),
        signal,
      });
    } catch (networkErr) {
      if (signal?.aborted) return null;
      console.error('[AI Edge Gateway Error] Network fetch failed:', networkErr);
      throw new Error(
        'Could not connect to AI generation service. Please check your network connection or verify that the Supabase Edge Function is deployed.'
      );
    }

    if (!response.ok) {
      let errorMessage = 'AI generation is temporarily unavailable. Please try again.';
      try {
        const errorJson = await response.json();
        errorMessage = errorJson.error || errorJson.message || errorMessage;
      } catch (_) {
        if (response.status === 404) {
          errorMessage = 'The AI generation Edge Function (ai-generate) is not deployed to the Supabase project.';
        } else if (response.status === 401) {
          errorMessage = 'Please sign in to generate content.';
        } else if (response.status === 402) {
          errorMessage = "You don't have enough credits for this generation.";
        }
      }
      throw new Error(errorMessage);
    }

    if (!response.body) {
      throw new Error('AI generation returned an empty response stream.');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let accumulatedText = '';
    let buffer = '';
    let completionMeta = null;

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;

          try {
            const data = JSON.parse(trimmed.substring(6));

            if (data.error) {
              throw new Error(data.error);
            }

            if (data.chunk) {
              accumulatedText += data.chunk;
              if (onChunk && !signal?.aborted) {
                onChunk(accumulatedText);
              }
            }

            if (data.done) {
              completionMeta = data;
            }
          } catch (parseErr) {
            if (parseErr.message && !parseErr.message.includes('JSON')) {
              throw parseErr;
            }
          }
        }
      }

      if (onComplete && !signal?.aborted) {
        onComplete({
          text: accumulatedText,
          wordCount: completionMeta?.wordCount || accumulatedText.trim().split(/\s+/).filter(Boolean).length,
          creditsDeducted: completionMeta?.creditsDeducted || 0,
          generationId: completionMeta?.generationId || null,
        });
      }

      return accumulatedText;
    } catch (err) {
      if (signal?.aborted) return null;
      throw err;
    }
  }
}

export const edgeAIService = new EdgeAIService();
