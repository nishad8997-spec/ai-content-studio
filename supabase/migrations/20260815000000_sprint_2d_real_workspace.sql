-- ============================================================================
-- SPRINT 2D.1 — REAL USER WORKSPACE, CREDIT RESET & PRODUCT MIGRATION
-- Target Database: PostgreSQL 15+ (Supabase)
-- Project: AI Content Studio
-- ============================================================================

-- ============================================================================
-- 1. UPDATE SUBSCRIPTION PLAN CONSTRAINT (free, starter, pro, business)
-- ============================================================================

-- Safely migrate any legacy 'enterprise' rows to 'business'
UPDATE public.subscriptions
SET plan_id = 'business'
WHERE plan_id = 'enterprise';

-- Update check constraint on public.subscriptions
ALTER TABLE public.subscriptions
  DROP CONSTRAINT IF EXISTS subscriptions_plan_id_check;

ALTER TABLE public.subscriptions
  ADD CONSTRAINT subscriptions_plan_id_check
  CHECK (plan_id IN ('free', 'starter', 'pro', 'business'));


-- ============================================================================
-- 2. UPDATE ONBOARDING TRIGGER (250 Free Credits Allowance)
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

  -- 4. Initialize Credit Wallet with 250 Free Starter Credits
  INSERT INTO public.credit_wallets (
    user_id,
    monthly_credit_allowance,
    monthly_credits_remaining,
    topup_credits_remaining,
    lifetime_credits_used,
    lifetime_words_generated,
    last_reset_at
  )
  VALUES (NEW.id, 250, 250, 0, 0, 0, NOW())
  ON CONFLICT (user_id) DO NOTHING;

  -- 5. Record Initial Credit Grant Transaction in Ledger (250 Credits)
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
    250,
    250,
    'monthly_grant',
    NULL,
    'Welcome Free Allowance (250 Credits)'
  );

  RETURN NEW;
END;
$$;


-- ============================================================================
-- 3. IDEMPOTENT CREDIT ADJUSTMENT FOR UNCONSUMED FREE USERS
-- ============================================================================

-- Safely adjust existing free users who have unused 5,000 credit allowances to 250 credits
UPDATE public.credit_wallets cw
SET monthly_credit_allowance = 250,
    monthly_credits_remaining = 250
FROM public.subscriptions s
WHERE cw.user_id = s.user_id
  AND s.plan_id = 'free'
  AND cw.monthly_credit_allowance = 5000
  AND cw.lifetime_credits_used = 0;


-- ============================================================================
-- 4. AVATARS STORAGE BUCKET & USER-SCOPED RLS POLICIES
-- ============================================================================

-- Create public avatars bucket if storage schema exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'storage' AND table_name = 'buckets') THEN
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
      'avatars',
      'avatars',
      TRUE,
      2097152, -- 2MB Limit
      ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    )
    ON CONFLICT (id) DO UPDATE
    SET public = TRUE,
        file_size_limit = 2097152,
        allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  END IF;
END $$;

-- Storage RLS Policies for avatars bucket
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'storage' AND table_name = 'objects') THEN
    
    -- Public read policy for avatars
    DROP POLICY IF EXISTS "avatars_public_select_policy" ON storage.objects;
    CREATE POLICY "avatars_public_select_policy" ON storage.objects
      FOR SELECT TO public, authenticated
      USING (bucket_id = 'avatars');

    -- Authenticated user insert policy (user-scoped folder: avatars/{user_id}/...)
    DROP POLICY IF EXISTS "avatars_user_insert_policy" ON storage.objects;
    CREATE POLICY "avatars_user_insert_policy" ON storage.objects
      FOR INSERT TO authenticated
      WITH CHECK (
        bucket_id = 'avatars' AND
        auth.uid()::text = (storage.foldername(name))[1]
      );

    -- Authenticated user update policy
    DROP POLICY IF EXISTS "avatars_user_update_policy" ON storage.objects;
    CREATE POLICY "avatars_user_update_policy" ON storage.objects
      FOR UPDATE TO authenticated
      USING (
        bucket_id = 'avatars' AND
        auth.uid()::text = (storage.foldername(name))[1]
      )
      WITH CHECK (
        bucket_id = 'avatars' AND
        auth.uid()::text = (storage.foldername(name))[1]
      );

    -- Authenticated user delete policy
    DROP POLICY IF EXISTS "avatars_user_delete_policy" ON storage.objects;
    CREATE POLICY "avatars_user_delete_policy" ON storage.objects
      FOR DELETE TO authenticated
      USING (
        bucket_id = 'avatars' AND
        auth.uid()::text = (storage.foldername(name))[1]
      );

  END IF;
END $$;
