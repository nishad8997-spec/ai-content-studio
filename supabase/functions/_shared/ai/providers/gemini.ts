// ============================================================================
// Google Gemini Production Streaming Adapter (gemini-3.5-flash-lite)
// ============================================================================

import { AIProviderAdapter, StreamGenerationOptions } from '../types.ts';

export const geminiAdapter: AIProviderAdapter = {
  id: 'gemini',
  name: 'Google Gemini',
  defaultModel: 'gemini-3.5-flash-lite',

  async generateStream(options: StreamGenerationOptions): Promise<ReadableStream<string>> {
    const { model, messages, maxTokens = 2500, apiKey, signal } = options;

    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured in Supabase Edge Function secrets.');
    }

    const targetModel = model || 'gemini-3.5-flash-lite';
    const systemMessage = messages.find(m => m.role === 'system')?.content || '';
    const contents = messages
      .filter(m => m.role !== 'system')
      .map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:streamGenerateContent?alt=sse&key=${apiKey}`;

    const body: Record<string, any> = {
      contents,
      generationConfig: {
        maxOutputTokens: maxTokens,
      }
    };

    if (systemMessage) {
      body.systemInstruction = {
        parts: [{ text: systemMessage }]
      };
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      let parsed = errorText;
      try {
        const json = JSON.parse(errorText);
        parsed = json?.error?.message || errorText;
      } catch (_) {}
      throw new Error(`Gemini API error (${response.status}): ${parsed}`);
    }

    if (!response.body) {
      throw new Error('Gemini returned an empty response stream.');
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
                const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) {
                  controller.enqueue(text);
                }
              } catch (_) {}
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
