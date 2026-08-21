-- ============================================================================
-- SPRINT 2B.2 — PRODUCTION SUPABASE SQL MIGRATION (v3.0)
-- Target Database: PostgreSQL 15+ (Supabase)
-- Project: AI Content Studio
-- ============================================================================

-- ============================================================================
-- 1. REUSABLE UTILITY & SECURITY FUNCTIONS
-- ============================================================================

-- 1.1 Trigger function to automatically update `updated_at` timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- 1.2 Non-recursive admin authorization helper
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    FALSE
  );
$$;

-- ============================================================================
-- 2. CORE CATALOG TABLES (Level 1 to 3 Dependencies)
-- ============================================================================

-- 2.1 AI Providers Catalog (Level 1)
CREATE TABLE IF NOT EXISTS public.ai_providers (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.2 AI Models Catalog (Level 2 - Depends on ai_providers)
CREATE TABLE IF NOT EXISTS public.ai_models (
  id VARCHAR(50) PRIMARY KEY,
  provider_id VARCHAR(50) NOT NULL REFERENCES public.ai_providers(id) ON DELETE RESTRICT,
  display_name VARCHAR(100) NOT NULL,
  credit_multiplier NUMERIC(5,2) NOT NULL DEFAULT 1.00 CHECK (credit_multiplier > 0),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2.3 AI Tools Catalog (Level 3 - Depends on ai_models)
CREATE TABLE IF NOT EXISTS public.ai_tools (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  default_model_id VARCHAR(50) NOT NULL REFERENCES public.ai_models(id) ON DELETE RESTRICT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 3. USER IDENTITY & SUBSCRIPTION TABLES (Level 4 Dependencies)
-- ============================================================================

-- 3.1 Profiles (Extends auth.users 1:1)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(150) NOT NULL DEFAULT '',
  avatar_url TEXT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deactivated')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.2 User Settings (1:1 with profiles, references ai_providers)
CREATE TABLE IF NOT EXISTS public.user_settings (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  theme_preference VARCHAR(10) NOT NULL DEFAULT 'light' CHECK (theme_preference IN ('light', 'dark', 'system')),
  default_tone VARCHAR(50) NOT NULL DEFAULT 'Professional',
  default_provider_id VARCHAR(50) NOT NULL DEFAULT 'mock' REFERENCES public.ai_providers(id) ON DELETE RESTRICT,
  email_notifications BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.3 Subscriptions (Stripe billing state)
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_id VARCHAR(50) NOT NULL DEFAULT 'free' CHECK (plan_id IN ('free', 'pro', 'enterprise')),
  status VARCHAR(30) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'trialing', 'past_due', 'canceled', 'unpaid', 'incomplete')),
  billing_interval VARCHAR(20) NOT NULL DEFAULT 'monthly' CHECK (billing_interval IN ('monthly', 'yearly', 'lifetime')),
  stripe_customer_id VARCHAR(100) NULL UNIQUE,
  stripe_subscription_id VARCHAR(100) NULL UNIQUE,
  current_period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  current_period_end TIMESTAMPTZ NULL DEFAULT NULL,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.4 Credit Wallets (Credit Balances & Allowances)
CREATE TABLE IF NOT EXISTS public.credit_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  monthly_credit_allowance INTEGER NOT NULL DEFAULT 5000 CHECK (monthly_credit_allowance >= 0),
  monthly_credits_remaining INTEGER NOT NULL DEFAULT 5000 CHECK (monthly_credits_remaining >= 0),
  topup_credits_remaining INTEGER NOT NULL DEFAULT 0 CHECK (topup_credits_remaining >= 0),
  lifetime_credits_used BIGINT NOT NULL DEFAULT 0 CHECK (lifetime_credits_used >= 0),
  lifetime_words_generated BIGINT NOT NULL DEFAULT 0 CHECK (lifetime_words_generated >= 0),
  last_reset_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3.5 Credit Transactions (Immutable Financial Ledger)
CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  balance_after INTEGER NOT NULL CHECK (balance_after >= 0),
  transaction_type VARCHAR(30) NOT NULL CHECK (transaction_type IN ('monthly_grant', 'topup_purchase', 'generation_usage', 'refund', 'admin_adjustment')),
  reference_id UUID NULL,
  description VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 4. CONTENT GENERATION & USER ARTIFACT TABLES
-- ============================================================================

-- 4.1 Generations (AI Content Output & History)
CREATE TABLE IF NOT EXISTS public.generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tool_id VARCHAR(50) NOT NULL REFERENCES public.ai_tools(id) ON DELETE RESTRICT,
  model_id VARCHAR(50) NOT NULL REFERENCES public.ai_models(id) ON DELETE RESTRICT,
  title VARCHAR(255) NOT NULL DEFAULT 'Untitled Generation',
  input_params JSONB NOT NULL DEFAULT '{}'::jsonb,
  output_text TEXT NOT NULL DEFAULT '',
  word_count INTEGER NOT NULL DEFAULT 0 CHECK (word_count >= 0),
  credits_deducted INTEGER NOT NULL DEFAULT 0 CHECK (credits_deducted >= 0),
  execution_time_ms INTEGER NULL CHECK (execution_time_ms >= 0),
  is_favorite BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ NULL DEFAULT NULL
);

-- 4.2 Saved Prompts (User-Curated Templates)
CREATE TABLE IF NOT EXISTS public.saved_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tool_id VARCHAR(50) NOT NULL REFERENCES public.ai_tools(id) ON DELETE RESTRICT,
  title VARCHAR(150) NOT NULL,
  prompt_inputs JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4.3 User API Keys (Metadata & SHA-256 Hashed Secrets)
CREATE TABLE IF NOT EXISTS public.user_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  key_name VARCHAR(100) NOT NULL DEFAULT 'Secret Key',
  key_prefix VARCHAR(16) NOT NULL,
  key_hash VARCHAR(64) NOT NULL UNIQUE,
  last_used_at TIMESTAMPTZ NULL,
  expires_at TIMESTAMPTZ NULL,
  is_revoked BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4.4 Analytics Events (Product Telemetry - PII Excluded)
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  event_name VARCHAR(100) NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  client_platform VARCHAR(20) NOT NULL DEFAULT 'web' CHECK (client_platform IN ('web', 'mobile', 'api')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 5. PERFORMANCE INDEXES
-- ============================================================================

-- 5.1 Generations Indexes
CREATE INDEX IF NOT EXISTS idx_generations_user_active 
  ON public.generations (user_id, created_at DESC) 
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_generations_user_favorites 
  ON public.generations (user_id, created_at DESC) 
  WHERE deleted_at IS NULL AND is_favorite = TRUE;

CREATE INDEX IF NOT EXISTS idx_generations_tool 
  ON public.generations (tool_id);

-- 5.2 Credit Transactions Indexes
CREATE INDEX IF NOT EXISTS idx_credit_tx_user_created 
  ON public.credit_transactions (user_id, created_at DESC);

-- 5.3 User API Keys Indexes
-- Note: Global uniqueness on key_hash is already enforced by the UNIQUE constraint on table definition.

-- 5.4 Subscriptions Indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer 
  ON public.subscriptions (stripe_customer_id) 
  WHERE stripe_customer_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_sub 
  ON public.subscriptions (stripe_subscription_id) 
  WHERE stripe_subscription_id IS NOT NULL;

-- 5.5 Analytics Events Indexes
CREATE INDEX IF NOT EXISTS idx_analytics_event_name_created 
  ON public.analytics_events (event_name, created_at DESC);

-- ============================================================================
-- 6. AUTOMATED UPDATED_AT TRIGGERS
-- ============================================================================

DROP TRIGGER IF EXISTS tr_profiles_updated_at ON public.profiles;
CREATE TRIGGER tr_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_user_settings_updated_at ON public.user_settings;
CREATE TRIGGER tr_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER tr_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_credit_wallets_updated_at ON public.credit_wallets;
CREATE TRIGGER tr_credit_wallets_updated_at
  BEFORE UPDATE ON public.credit_wallets
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_generations_updated_at ON public.generations;
CREATE TRIGGER tr_generations_updated_at
  BEFORE UPDATE ON public.generations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_saved_prompts_updated_at ON public.saved_prompts;
CREATE TRIGGER tr_saved_prompts_updated_at
  BEFORE UPDATE ON public.saved_prompts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all 12 tables
ALTER TABLE public.ai_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- 7.1 AI Providers Policies
DROP POLICY IF EXISTS "ai_providers_read_policy" ON public.ai_providers;
CREATE POLICY "ai_providers_read_policy" ON public.ai_providers
  FOR SELECT TO authenticated, anon
  USING (is_active = TRUE OR public.is_admin());

DROP POLICY IF EXISTS "ai_providers_admin_mutation_policy" ON public.ai_providers;
CREATE POLICY "ai_providers_admin_mutation_policy" ON public.ai_providers
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 7.2 AI Models Policies
DROP POLICY IF EXISTS "ai_models_read_policy" ON public.ai_models;
CREATE POLICY "ai_models_read_policy" ON public.ai_models
  FOR SELECT TO authenticated, anon
  USING (is_active = TRUE OR public.is_admin());

DROP POLICY IF EXISTS "ai_models_admin_mutation_policy" ON public.ai_models;
CREATE POLICY "ai_models_admin_mutation_policy" ON public.ai_models
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 7.3 AI Tools Policies
DROP POLICY IF EXISTS "ai_tools_read_policy" ON public.ai_tools;
CREATE POLICY "ai_tools_read_policy" ON public.ai_tools
  FOR SELECT TO authenticated, anon
  USING (is_active = TRUE OR public.is_admin());

DROP POLICY IF EXISTS "ai_tools_admin_mutation_policy" ON public.ai_tools;
CREATE POLICY "ai_tools_admin_mutation_policy" ON public.ai_tools
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 7.4 Profiles Policies (Non-Recursive)
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
CREATE POLICY "profiles_select_policy" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
CREATE POLICY "profiles_update_policy" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 7.5 User Settings Policies
DROP POLICY IF EXISTS "user_settings_select_policy" ON public.user_settings;
CREATE POLICY "user_settings_select_policy" ON public.user_settings
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "user_settings_update_policy" ON public.user_settings;
CREATE POLICY "user_settings_update_policy" ON public.user_settings
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 7.6 Subscriptions Policies (Client Read-Only, Service Role Writes)
DROP POLICY IF EXISTS "subscriptions_select_policy" ON public.subscriptions;
CREATE POLICY "subscriptions_select_policy" ON public.subscriptions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

-- 7.7 Credit Wallets Policies (Client Read-Only, Service Role Writes)
DROP POLICY IF EXISTS "credit_wallets_select_policy" ON public.credit_wallets;
CREATE POLICY "credit_wallets_select_policy" ON public.credit_wallets
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

-- 7.8 Credit Transactions Policies (Client Read-Only Ledger, Service Role Writes)
DROP POLICY IF EXISTS "credit_transactions_select_policy" ON public.credit_transactions;
CREATE POLICY "credit_transactions_select_policy" ON public.credit_transactions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

-- 7.9 Generations Policies (Accurate Soft-Delete Semantics)
DROP POLICY IF EXISTS "generations_select_policy" ON public.generations;
CREATE POLICY "generations_select_policy" ON public.generations
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id AND deleted_at IS NULL);

DROP POLICY IF EXISTS "generations_insert_policy" ON public.generations;
CREATE POLICY "generations_insert_policy" ON public.generations
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND deleted_at IS NULL);

DROP POLICY IF EXISTS "generations_update_policy" ON public.generations;
CREATE POLICY "generations_update_policy" ON public.generations
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id AND deleted_at IS NULL)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "generations_delete_policy" ON public.generations;
CREATE POLICY "generations_delete_policy" ON public.generations
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- 7.10 Saved Prompts Policies
DROP POLICY IF EXISTS "saved_prompts_select_policy" ON public.saved_prompts;
CREATE POLICY "saved_prompts_select_policy" ON public.saved_prompts
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "saved_prompts_insert_policy" ON public.saved_prompts;
CREATE POLICY "saved_prompts_insert_policy" ON public.saved_prompts
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "saved_prompts_update_policy" ON public.saved_prompts;
CREATE POLICY "saved_prompts_update_policy" ON public.saved_prompts
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "saved_prompts_delete_policy" ON public.saved_prompts;
CREATE POLICY "saved_prompts_delete_policy" ON public.saved_prompts
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- 7.11 User API Keys Policies & Column-Level Privilege Isolation
-- Revoke all table-level access from PUBLIC and authenticated roles
REVOKE ALL ON public.user_api_keys FROM PUBLIC, authenticated;

-- Grant column-level SELECT on safe metadata fields only (key_hash is strictly protected)
GRANT SELECT (id, user_id, key_name, key_prefix, last_used_at, expires_at, is_revoked, created_at)
  ON public.user_api_keys TO authenticated;

-- Grant column-level UPDATE on safe mutable fields only (id, user_id, key_hash cannot be modified)
GRANT UPDATE (key_name, expires_at, is_revoked)
  ON public.user_api_keys TO authenticated;

-- Grant DELETE so users can remove their own keys
GRANT DELETE ON public.user_api_keys TO authenticated;

-- Row Level Security (RLS) policies
DROP POLICY IF EXISTS "user_api_keys_select_policy" ON public.user_api_keys;
CREATE POLICY "user_api_keys_select_policy" ON public.user_api_keys
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_api_keys_update_policy" ON public.user_api_keys;
CREATE POLICY "user_api_keys_update_policy" ON public.user_api_keys
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_api_keys_delete_policy" ON public.user_api_keys;
CREATE POLICY "user_api_keys_delete_policy" ON public.user_api_keys
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- 7.12 Analytics Events Policies
DROP POLICY IF EXISTS "analytics_events_insert_policy" ON public.analytics_events;
CREATE POLICY "analytics_events_insert_policy" ON public.analytics_events
  FOR INSERT TO authenticated, anon
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "analytics_events_select_policy" ON public.analytics_events;
CREATE POLICY "analytics_events_select_policy" ON public.analytics_events
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

-- ============================================================================
-- 8. AUTH.USERS ONBOARDING TRIGGER
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_email VARCHAR(255);
  v_user_name VARCHAR(150);
  v_avatar_url TEXT;
BEGIN
  -- Extract identity fields safely
  v_user_email := COALESCE(NEW.email, '');
  v_user_name  := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    SPLIT_PART(v_user_email, '@', 1),
    'Content Creator'
  );
  v_avatar_url := NEW.raw_user_meta_data->>'avatar_url';

  -- 1. Create Profile
  INSERT INTO public.profiles (id, email, full_name, avatar_url, status)
  VALUES (NEW.id, v_user_email, v_user_name, v_avatar_url, 'active')
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      full_name = CASE WHEN profiles.full_name = '' THEN EXCLUDED.full_name ELSE profiles.full_name END;

  -- 2. Create Default User Settings
  INSERT INTO public.user_settings (user_id, theme_preference, default_tone, default_provider_id, email_notifications)
  VALUES (NEW.id, 'light', 'Professional', 'mock', TRUE)
  ON CONFLICT (user_id) DO NOTHING;

  -- 3. Create Default Free Subscription (current_period_end is NULL for ongoing free tier)
  INSERT INTO public.subscriptions (user_id, plan_id, status, billing_interval, current_period_start, current_period_end)
  VALUES (NEW.id, 'free', 'active', 'monthly', NOW(), NULL)
  ON CONFLICT (user_id) DO NOTHING;

  -- 4. Initialize Credit Wallet with 5,000 Free Starter Credits
  INSERT INTO public.credit_wallets (
    user_id,
    monthly_credit_allowance,
    monthly_credits_remaining,
    topup_credits_remaining,
    lifetime_credits_used,
    lifetime_words_generated,
    last_reset_at
  )
  VALUES (NEW.id, 5000, 5000, 0, 0, 0, NOW())
  ON CONFLICT (user_id) DO NOTHING;

  -- 5. Record Initial Credit Grant Transaction in Ledger
  INSERT INTO public.credit_transactions (
    user_id,
    amount,
    balance_after,
    transaction_type,
    reference_id,
    description
  )
  VALUES (
    NEW.id,
    5000,
    5000,
    'monthly_grant',
    NULL,
    'Welcome Starter Allowance (5,000 Credits)'
  );

  RETURN NEW;
END;
$$;

-- Attach trigger to auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 9. IDEMPOTENT SEED DATA
-- ============================================================================

-- 9.1 Seed AI Providers (Level 1)
INSERT INTO public.ai_providers (id, name, is_active)
VALUES
  ('mock', 'Mock Stream Simulator', TRUE),
  ('openai', 'OpenAI', TRUE),
  ('anthropic', 'Anthropic', TRUE),
  ('gemini', 'Google Gemini', TRUE)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    is_active = EXCLUDED.is_active;

-- 9.2 Seed AI Models (Level 2)
INSERT INTO public.ai_models (id, provider_id, display_name, credit_multiplier, is_active)
VALUES
  ('mock-model', 'mock', 'Simulated Fast Streamer', 1.00, TRUE),
  ('gpt-4o', 'openai', 'GPT-4o Omnimodel', 1.50, TRUE),
  ('claude-3-5-sonnet', 'anthropic', 'Claude 3.5 Sonnet', 1.50, TRUE),
  ('gemini-1.5-pro', 'gemini', 'Gemini 1.5 Pro', 1.25, TRUE)
ON CONFLICT (id) DO UPDATE
SET provider_id = EXCLUDED.provider_id,
    display_name = EXCLUDED.display_name,
    credit_multiplier = EXCLUDED.credit_multiplier,
    is_active = EXCLUDED.is_active;

-- 9.3 Seed AI Tools (Level 3)
INSERT INTO public.ai_tools (id, name, category, description, default_model_id, is_active)
VALUES
  ('blog-writer', 'Blog Article Writer', 'Writing', 'Generate high-ranking, engaging blog posts complete with headers, intro, and conclusion.', 'mock-model', TRUE),
  ('email-writer', 'Cold Email & Newsletter Writer', 'Email', 'Craft high-converting sales emails, outreach messages, and engaging newsletter campaigns.', 'mock-model', TRUE),
  ('instagram-caption', 'Instagram Caption Generator', 'Social Media', 'Create viral captions with strategic hashtags, emojis, and call-to-actions.', 'mock-model', TRUE),
  ('facebook-ads', 'Facebook & Instagram Ads Copy', 'Marketing', 'Generate high-ROAS primary text, headlines, and descriptions tailored for Meta ads.', 'mock-model', TRUE),
  ('product-description', 'E-Commerce Product Description', 'E-Commerce', 'Write SEO-optimized, bulleted product descriptions that drive Shopify and Amazon sales.', 'mock-model', TRUE)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    default_model_id = EXCLUDED.default_model_id,
    is_active = EXCLUDED.is_active;
