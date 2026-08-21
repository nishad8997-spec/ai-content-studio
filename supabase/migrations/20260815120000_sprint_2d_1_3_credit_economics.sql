-- ============================================================================
-- SPRINT 2D.1.3 — CREDIT ECONOMICS & REAL WALLET SYNCHRONIZATION MIGRATION
-- Target Database: PostgreSQL 15+ (Supabase)
-- Project: AI Content Studio
-- ============================================================================

-- ============================================================================
-- 1. UPDATE ONBOARDING TRIGGER (60 Free Monthly Credits)
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
BEGIN
  -- Extract identity fields safely (avatar_url is left NULL so user has full control)
  v_user_email := COALESCE(NEW.email, '');
  v_user_name  := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    SPLIT_PART(v_user_email, '@', 1),
    'Content Creator'
  );

  -- 1. Create Profile (avatar_url NULL by default)
  INSERT INTO public.profiles (id, email, full_name, avatar_url, status)
  VALUES (NEW.id, v_user_email, v_user_name, NULL, 'active')
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      full_name = CASE WHEN profiles.full_name = '' THEN EXCLUDED.full_name ELSE profiles.full_name END;

  -- 2. Create Default User Settings
  INSERT INTO public.user_settings (user_id, theme_preference, default_tone, default_provider_id, email_notifications)
  VALUES (NEW.id, 'light', 'Professional', 'mock', TRUE)
  ON CONFLICT (user_id) DO NOTHING;

  -- 3. Create Default Free Subscription
  INSERT INTO public.subscriptions (user_id, plan_id, status, billing_interval, current_period_start, current_period_end)
  VALUES (NEW.id, 'free', 'active', 'monthly', NOW(), NULL)
  ON CONFLICT (user_id) DO NOTHING;

  -- 4. Initialize Credit Wallet with 60 Free Monthly Credits
  INSERT INTO public.credit_wallets (
    user_id,
    monthly_credit_allowance,
    monthly_credits_remaining,
    topup_credits_remaining,
    lifetime_credits_used,
    lifetime_words_generated,
    last_reset_at
  )
  VALUES (NEW.id, 60, 60, 0, 0, 0, NOW())
  ON CONFLICT (user_id) DO NOTHING;

  -- 5. Record Initial Credit Grant Transaction in Ledger (60 Credits)
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
    60,
    60,
    'monthly_grant',
    NULL,
    'Welcome Free Allowance (60 Credits)'
  );

  RETURN NEW;
END;
$$;


-- ============================================================================
-- 2. SAFE, IDEMPOTENT MIGRATION FOR EXISTING FREE USERS
-- ============================================================================

-- A. Unconsumed Free Users (Never used credits): Set to 60 / 60
UPDATE public.credit_wallets cw
SET monthly_credit_allowance = 60,
    monthly_credits_remaining = 60
FROM public.subscriptions s
WHERE cw.user_id = s.user_id
  AND s.plan_id = 'free'
  AND cw.lifetime_credits_used = 0;

-- B. Active Free Users with consumed credits: Safely preserve usage
UPDATE public.credit_wallets cw
SET monthly_credit_allowance = 60,
    monthly_credits_remaining = GREATEST(0, 60 - cw.lifetime_credits_used)
FROM public.subscriptions s
WHERE cw.user_id = s.user_id
  AND s.plan_id = 'free'
  AND cw.lifetime_credits_used > 0
  AND cw.monthly_credit_allowance > 60;


-- ============================================================================
-- 3. AUTOMATIC DATABASE WALLET DEDUCTION TRIGGER ON GENERATION INSERT
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_generation_credit_deduction()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Deduct credits from monthly wallet and update lifetime stats
  UPDATE public.credit_wallets
  SET monthly_credits_remaining = GREATEST(0, monthly_credits_remaining - NEW.credits_deducted),
      lifetime_credits_used = lifetime_credits_used + NEW.credits_deducted,
      lifetime_words_generated = lifetime_words_generated + NEW.word_count,
      updated_at = NOW()
  WHERE user_id = NEW.user_id;

  -- Record credit transaction in ledger
  INSERT INTO public.credit_transactions (
    user_id,
    amount,
    balance_after,
    transaction_type,
    reference_id,
    description
  )
  SELECT 
    NEW.user_id,
    -NEW.credits_deducted,
    cw.monthly_credits_remaining,
    'generation_usage',
    NEW.id,
    'AI Generation: ' || NEW.tool_id
  FROM public.credit_wallets cw
  WHERE cw.user_id = NEW.user_id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_generation_created ON public.generations;
CREATE TRIGGER on_generation_created
  AFTER INSERT ON public.generations
  FOR EACH ROW EXECUTE FUNCTION public.handle_generation_credit_deduction();
