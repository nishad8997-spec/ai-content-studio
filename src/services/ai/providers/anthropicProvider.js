/**
 * Client stub for Anthropic Claude 3.5 Sonnet.
 * Actual execution is handled securely via Supabase Edge Function `ai-generate`.
 */
export const anthropicProvider = {
  id: "anthropic",
  name: "Anthropic Claude 3.5 Sonnet",
  model: "claude-3-5-sonnet-20240620"
};
