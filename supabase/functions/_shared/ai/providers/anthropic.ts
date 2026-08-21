// ============================================================================
// Anthropic Claude Streaming Adapter
// ============================================================================

import { AIProviderAdapter, StreamGenerationOptions } from '../types.ts';

export const anthropicAdapter: AIProviderAdapter = {
  id: 'anthropic',
  name: 'Anthropic Claude 3.5 Sonnet',
  defaultModel: 'claude-3-5-sonnet-20240620',

  async generateStream(options: StreamGenerationOptions): Promise<ReadableStream<string>> {
    const { model, messages, temperature = 0.7, maxTokens = 2000, apiKey, signal } = options;

    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY is not configured in Supabase Edge Function secrets.');
    }

    // Anthropic separates system message from messages array
    const systemMessage = messages.find(m => m.role === 'system')?.content || '';
    const userMessages = messages.filter(m => m.role !== 'system');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: model || 'claude-3-5-sonnet-20240620',
        system: systemMessage,
        messages: userMessages,
        max_tokens: maxTokens,
        temperature,
        stream: true,
      }),
      signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      let parsed = errorText;
      try {
        const json = JSON.parse(errorText);
        parsed = json?.error?.message || errorText;
      } catch (_) {
        // Fallback
      }
      throw new Error(`Anthropic API error (${response.status}): ${parsed}`);
    }

    if (!response.body) {
      throw new Error('Anthropic returned an empty response body.');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');

    return new ReadableStream<string>({
      async start(controller) {
        let buffer = '';

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
                const json = JSON.parse(trimmed.substring(6));
                if (json.type === 'content_block_delta' && json.delta?.type === 'text_delta') {
                  controller.enqueue(json.delta.text);
                } else if (json.type === 'message_stop') {
                  controller.close();
                  return;
                }
              } catch (_) {
                // Ignore parse errors
              }
            }
          }

          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });
  },
};
