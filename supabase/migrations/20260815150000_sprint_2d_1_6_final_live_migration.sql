-- ============================================================================
-- SPRINT 2D.1.6 — PRODUCTION DATABASE MIGRATION & ACCOUNTING FINALIZATION
-- Target Database: PostgreSQL 15+ (Supabase)
-- Project: AI Content Studio
-- Execute in: Supabase Dashboard -> SQL Editor -> New Query
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. STORAGE BUCKET PROVISIONING & USER-SCOPED RLS (avatars)
-- ============================================================================

-- A. Insert or update the avatars bucket with 2MB limit and allowed image MIME types
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  TRUE,
  2097152, -- 2MB in bytes
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
)
ON CONFLICT (id) DO UPDATE
SET public = TRUE,
    file_size_limit = 2097152,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[];

-- B. Ensure RLS is enabled on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- C. Storage Policy 1: Public Read Access
DROP POLICY IF EXISTS "avatars_public_select" ON storage.objects;
CREATE POLICY "avatars_public_select" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'avatars');

-- D. Storage Policy 2: User-Scoped Upload Access (avatars/{user_id}/...)
DROP POLICY IF EXISTS "avatars_user_insert" ON storage.objects;
CREATE POLICY "avatars_user_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- E. Storage Policy 3: User-Scoped Update Access
DROP POLICY IF EXISTS "avatars_user_update" ON storage.objects;
CREATE POLICY "avatars_user_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- F. Storage Policy 4: User-Scoped Delete Access
DROP POLICY IF EXISTS "avatars_user_delete" ON storage.objects;
CREATE POLICY "avatars_user_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );


-- ============================================================================
-- 2. ONBOARDING TRIGGER FUNCTION (handle_new_user - 60 Free Monthly Credits)
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
  -- Extract user identity safely
  v_user_email := COALESCE(NEW.email, '');
  v_user_name  := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    SPLIT_PART(v_user_email, '@', 1),
    'Content Creator'
  );

  -- 1. Create Profile record (avatar_url NULL by default)
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

  -- 5. Record Initial Credit Grant in Ledger (60 Credits)
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
-- 3. ATOMIC GENERATION CREDIT DEDUCTION TRIGGER
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_generation_credit_deduction()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_remaining INTEGER;
  v_new_remaining INTEGER;
BEGIN
  -- 1. Validate credit deduction value
  IF NEW.credits_deducted < 0 THEN
    RAISE EXCEPTION 'Negative credit deductions are not permitted: %', NEW.credits_deducted;
  END IF;

  -- 2. Lock and retrieve current wallet state
  SELECT monthly_credits_remaining INTO v_current_remaining
  FROM public.credit_wallets
  WHERE user_id = NEW.user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Credit wallet not found for user: %', NEW.user_id;
  END IF;

  -- 3. Calculate new remaining balance (capped at minimum 0)
  v_new_remaining := GREATEST(0, v_current_remaining - NEW.credits_deducted);

  -- 4. Atomically update wallet counters
  UPDATE public.credit_wallets
  SET monthly_credits_remaining = v_new_remaining,
      lifetime_credits_used = lifetime_credits_used + NEW.credits_deducted,
      lifetime_words_generated = lifetime_words_generated + COALESCE(NEW.word_count, 0),
      updated_at = NOW()
  WHERE user_id = NEW.user_id;

  -- 5. Record usage transaction in ledger
  INSERT INTO public.credit_transactions (
    user_id,
    amount,
    balance_after,
    transaction_type,
    reference_id,
    description
  )
  VALUES (
    NEW.user_id,
    -NEW.credits_deducted,
    v_new_remaining,
    'generation_usage',
    NEW.id,
    'AI Generation: ' || COALESCE(NEW.tool_id, 'tool') || ' (' || COALESCE(NEW.word_count, 0) || ' words)'
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_generation_created ON public.generations;
CREATE TRIGGER on_generation_created
  AFTER INSERT ON public.generations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_generation_credit_deduction();


-- ============================================================================
-- 4. REPAIR & RECONCILE WALLETS FOR FREE PLAN USERS
-- ============================================================================

-- Reconcile historical counters (lifetime_words_generated, lifetime_credits_used)
-- from existing public.generations records, while establishing the clean 60-credit
-- current monthly entitlement (60 / 60) for active Free users.
WITH user_gen_totals AS (
  SELECT 
    user_id,
    COALESCE(SUM(word_count), 0) AS total_words,
    COALESCE(SUM(credits_deducted), 0) AS total_credits
  FROM public.generations
  WHERE deleted_at IS NULL
  GROUP BY user_id
)
UPDATE public.credit_wallets cw
SET 
  monthly_credit_allowance = 60,
  monthly_credits_remaining = 60,
  lifetime_words_generated = COALESCE(ugt.total_words, 0),
  lifetime_credits_used = COALESCE(ugt.total_credits, 0),
  updated_at = NOW()
FROM public.subscriptions s
LEFT JOIN user_gen_totals ugt ON ugt.user_id = s.user_id
WHERE cw.user_id = s.user_id
  AND s.plan_id = 'free';

-- Record an idempotent ledger entry for the 60-credit entitlement
INSERT INTO public.credit_transactions (
  user_id,
  amount,
  balance_after,
  transaction_type,
  reference_id,
  description
)
SELECT 
  cw.user_id,
  60,
  60,
  'monthly_grant',
  NULL,
  'Production Free Allowance Transition (60 Credits)'
FROM public.credit_wallets cw
JOIN public.subscriptions s ON s.user_id = cw.user_id
WHERE s.plan_id = 'free'
  AND NOT EXISTS (
    SELECT 1 FROM public.credit_transactions ct
    WHERE ct.user_id = cw.user_id
      AND ct.description = 'Production Free Allowance Transition (60 Credits)'
  );

COMMIT;
