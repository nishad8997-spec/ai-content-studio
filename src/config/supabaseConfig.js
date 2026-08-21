import { createClient } from '@supabase/supabase-js';
import { env } from './env';

/**
 * Supabase Singleton Client Configuration
 * Initializes and exports a single, production-ready Supabase client instance.
 * Reads credentials strictly from environment variables:
 *  - VITE_SUPABASE_URL
 *  - VITE_SUPABASE_ANON_KEY
 */

const supabaseUrl = env.supabaseUrl;
const supabaseAnonKey = env.supabaseAnonKey;

export const isSupabaseReady = Boolean(supabaseUrl && supabaseAnonKey);

let supabaseInstance = null;

if (isSupabaseReady) {
  try {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  } catch (error) {
    console.error("Failed to initialize Supabase client:", error.message);
  }
} else {
  console.warn(
    "[AI Content Studio - Supabase Foundation]\n" +
    "Supabase environment variables are missing (VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY).\n" +
    "The application is operating in Mock Mode. Set your keys in .env for Supabase attachment."
  );
}

/**
 * Singleton Supabase client instance.
 * Returns null if Supabase environment variables are not configured.
 */
export const supabase = supabaseInstance;
