-- ============================================================================
-- SPRINT 2D.1.4 — PRODUCTION FOUNDATION: AVATAR STORAGE & METRICS CONSISTENCY
-- Target Database: PostgreSQL 15+ (Supabase)
-- Project: AI Content Studio
-- ============================================================================

-- ============================================================================
-- 1. PROVISION STORAGE BUCKET: avatars (2MB limit, image types, public read)
-- ============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  TRUE,
  2097152, -- 2MB max file size
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
)
ON CONFLICT (id) DO UPDATE
SET public = TRUE,
    file_size_limit = 2097152,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[];

-- Ensure RLS is enabled on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Storage Policy 1: Public Read Access for Avatars
DROP POLICY IF EXISTS "avatars_public_select" ON storage.objects;
CREATE POLICY "avatars_public_select" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'avatars');

-- Storage Policy 2: User-Scoped Upload Access (user can only upload to own folder)
DROP POLICY IF EXISTS "avatars_user_insert" ON storage.objects;
CREATE POLICY "avatars_user_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage Policy 3: User-Scoped Update Access
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

-- Storage Policy 4: User-Scoped Delete Access
DROP POLICY IF EXISTS "avatars_user_delete" ON storage.objects;
CREATE POLICY "avatars_user_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );


-- ============================================================================
-- 2. ENSURE CREDIT WALLET SCHEMA & AUTOMATIC TRIGGER INTEGRITY
-- ============================================================================

-- Ensure atomic deduction trigger exists and runs on generation insert
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

-- Safe update for any existing Free users with untouched legacy allowances
UPDATE public.credit_wallets cw
SET monthly_credit_allowance = 60,
    monthly_credits_remaining = 60
FROM public.subscriptions s
WHERE cw.user_id = s.user_id
  AND s.plan_id = 'free'
  AND cw.lifetime_credits_used = 0
  AND cw.monthly_credit_allowance > 60;
