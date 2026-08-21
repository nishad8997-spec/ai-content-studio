// ============================================================================
// Multi-Provider Registry & Dispatcher (OpenAI + Gemini)
// Ready for future modular adapters (e.g. DeepSeek)
// ============================================================================

import { AIProviderAdapter, SupportedProvider, StreamGenerationOptions } from './types.ts';
import { openAIAdapter } from './providers/openai.ts';
import { geminiAdapter } from './providers/gemini.ts';

const ADAPTERS: Record<SupportedProvider, AIProviderAdapter> = {
  openai: openAIAdapter,
  gemini: geminiAdapter,
};

export function getProviderAdapter(providerId: SupportedProvider = 'openai'): AIProviderAdapter {
  const adapter = ADAPTERS[providerId];
  if (!adapter) {
    throw new Error(`Unsupported AI provider: "${providerId}". Active supported providers are: openai, gemini.`);
  }
  return adapter;
}

export async function generateStreamWithProvider(
  providerId: SupportedProvider,
  options: StreamGenerationOptions
): Promise<ReadableStream<string>> {
  const adapter = getProviderAdapter(providerId);
  return await adapter.generateStream(options);
}
