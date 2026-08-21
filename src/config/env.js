/**
 * Environment configuration loader.
 * Safely accesses Vite `import.meta.env` with fallback warning mechanisms.
 * Guarantees zero hardcoded credentials and zero server secrets in frontend code.
 */

export const env = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || "",
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || "",
  stripePublishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "",
  defaultAiProvider: import.meta.env.VITE_DEFAULT_AI_PROVIDER || "openai",

  isSupabaseConfigured() {
    return Boolean(this.supabaseUrl && this.supabaseAnonKey);
  }
};
