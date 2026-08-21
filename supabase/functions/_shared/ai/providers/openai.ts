// ============================================================================
// OpenAI Production Streaming Adapter (GPT-4o & GPT-4o-mini)
// ============================================================================

import { AIProviderAdapter, StreamGenerationOptions } from '../types.ts';

export const openAIAdapter: AIProviderAdapter = {
  id: 'openai',
  name: 'OpenAI',
  defaultModel: 'gpt-4o',

  async generateStream(options: StreamGenerationOptions): Promise<ReadableStream<string>> {
    const { model, messages, temperature = 0.7, maxTokens = 2500, apiKey, signal } = options;

    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not configured in Supabase Edge Function secrets.');
    }

    const targetModel = model || 'gpt-4o';

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: targetModel,
        messages,
        temperature,
        max_tokens: maxTokens,
        stream: true,
      }),
      signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      let parsedMessage = errorText;
      try {
        const errorJson = JSON.parse(errorText);
        parsedMessage = errorJson?.error?.message || errorText;
      } catch (_) {
        // Fallback to raw text
      }
      throw new Error(`OpenAI API error (${response.status}): ${parsedMessage}`);
    }

    if (!response.body) {
      throw new Error('OpenAI returned an empty response stream.');
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
              if (!trimmed || trimmed.startsWith(':')) continue;

              if (trimmed === 'data: [DONE]') {
                controller.close();
                return;
              }

              if (trimmed.startsWith('data: ')) {
                try {
                  const json = JSON.parse(trimmed.substring(6));
                  const delta = json?.choices?.[0]?.delta?.content;
                  if (delta) {
                    controller.enqueue(delta);
                  }
                } catch (_) {
                  // Ignore JSON parse errors on partial chunks
                }
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
