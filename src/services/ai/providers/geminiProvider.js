/**
 * Client stub for Google Gemini 3.5 Flash-Lite.
 * Actual execution is handled securely via Supabase Edge Function `ai-generate`.
 */
export const geminiProvider = {
  id: "gemini",
  name: "Google Gemini 3.5 Flash-Lite",
  model: "gemini-3.5-flash-lite"
};
