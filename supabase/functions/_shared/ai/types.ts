// ============================================================================
// AI Provider Abstraction - Types, Routing & Credit Economics
// ============================================================================

export type SupportedProvider = 'gemini';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GenerationRequestContract {
  toolId: string;
  modelId?: string;
  provider?: SupportedProvider;
  inputs: Record<string, any>;
  parameters?: {
    maxTokens?: number;
    tone?: string;
  };
}

export interface StreamGenerationOptions {
  model: string;
  messages: ChatMessage[];
  maxTokens?: number;
  apiKey: string;
  signal?: AbortSignal;
}

export interface AIProviderAdapter {
  id: SupportedProvider;
  name: string;
  defaultModel: string;
  generateStream(options: StreamGenerationOptions): Promise<ReadableStream<string>>;
}

export interface ToolRoutingDefinition {
  provider: SupportedProvider;
  model: string;
  baseCredits: number;
  description: string;
}

/**
 * Centralized Server-Side Tool Routing Configuration (Google Gemini gemini-3.5-flash-lite)
 * High-volume, low-cost marketing copy generation.
 */
export const TOOL_ROUTING: Record<string, ToolRoutingDefinition> = {
  'blog-writer': {
    provider: 'gemini',
    model: 'gemini-3.5-flash-lite',
    baseCredits: 15,
    description: 'Long-form structured markdown content with SEO headings and takeaways.'
  },
  'email-writer': {
    provider: 'gemini',
    model: 'gemini-3.5-flash-lite',
    baseCredits: 10,
    description: 'Direct-response email outreach and newsletter copywriting.'
  },
  'instagram-caption': {
    provider: 'gemini',
    model: 'gemini-3.5-flash-lite',
    baseCredits: 5,
    description: 'Short-form punchy text with emoji integration, mood matching, and strategic hashtags.'
  },
  'facebook-ads': {
    provider: 'gemini',
    model: 'gemini-3.5-flash-lite',
    baseCredits: 8,
    description: 'Structured Meta ads copywriting with primary text, headlines, descriptions, and CTA framing.'
  },
  'product-description': {
    provider: 'gemini',
    model: 'gemini-3.5-flash-lite',
    baseCredits: 10,
    description: 'E-commerce spec-to-benefit conversion copy optimized for Shopify and Amazon listings.'
  }
};
