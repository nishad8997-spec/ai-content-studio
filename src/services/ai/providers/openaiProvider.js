/**
 * Client stub for OpenAI GPT-4o.
 * Actual execution is handled securely via Supabase Edge Function `ai-generate`.
 */
export const openaiProvider = {
  id: "openai",
  name: "OpenAI GPT-4o",
  model: "gpt-4o"
};
