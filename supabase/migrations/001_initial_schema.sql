-- ============================================================
-- MMV — Initial Schema Migration
-- Run in: Supabase Dashboard > SQL Editor
-- ============================================================

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  subscription_status TEXT NOT NULL DEFAULT 'inactive'
    CHECK (subscription_status IN ('active', 'inactive', 'trialing')),
  stripe_customer_id TEXT,
  referral_code TEXT UNIQUE NOT NULL DEFAULT substring(gen_random_uuid()::text, 1, 8),
  referred_by UUID REFERENCES profiles(id),
  is_admin BOOLEAN NOT NULL DEFAULT false
);

-- Auto-create profile row on auth.users INSERT
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, referral_code)
  VALUES (
    NEW.id,
    NEW.email,
    upper(substring(gen_random_uuid()::text, 1, 8))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- ============================================================
-- VAULTS
-- ============================================================
CREATE TABLE IF NOT EXISTS vaults (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  missionary_name TEXT NOT NULL,
  mission_name TEXT NOT NULL DEFAULT '',
  mission_start DATE,
  mission_end DATE,
  vault_type TEXT NOT NULL DEFAULT 'post'
    CHECK (vault_type IN ('pre', 'post')),
  submission_token UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  cover_image_url TEXT
);


-- ============================================================
-- BOOKS (one per vault, enforced by UNIQUE constraint)
-- ============================================================
CREATE TABLE IF NOT EXISTS books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  vault_id UUID NOT NULL UNIQUE REFERENCES vaults(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'collecting'
    CHECK (status IN ('collecting', 'review', 'purchased', 'printing', 'delivered')),
  design_theme TEXT NOT NULL DEFAULT 'museum_archive_elegant',
  pdf_url TEXT,
  delivery_address JSONB,
  stripe_payment_intent_id TEXT,
  pod_order_id TEXT
);


-- ============================================================
-- SUBMISSIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  vault_id UUID NOT NULL REFERENCES vaults(id) ON DELETE CASCADE,
  book_id UUID REFERENCES books(id) ON DELETE SET NULL,
  contributor_name TEXT NOT NULL,
  relation TEXT NOT NULL,
  message TEXT NOT NULL,
  media_urls TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected'))
);


-- ============================================================
-- REFERRALS
-- ============================================================
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  referrer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  referred_email TEXT NOT NULL,
  referred_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'converted', 'rewarded')),
  reward_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00
);


-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vaults ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- PROFILES
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- VAULTS
CREATE POLICY "Owners manage their vaults"
  ON vaults FOR ALL USING (auth.uid() = owner_id);

-- BOOKS
CREATE POLICY "Vault owners manage books"
  ON books FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM vaults
      WHERE vaults.id = books.vault_id
        AND vaults.owner_id = auth.uid()
    )
  );

-- SUBMISSIONS: public INSERT (no auth), owner-only SELECT + UPDATE
CREATE POLICY "Anyone can submit a contribution"
  ON submissions FOR INSERT WITH CHECK (true);

CREATE POLICY "Vault owners can view submissions"
  ON submissions FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM vaults
      WHERE vaults.id = submissions.vault_id
        AND vaults.owner_id = auth.uid()
    )
  );

CREATE POLICY "Vault owners can update submission status"
  ON submissions FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM vaults
      WHERE vaults.id = submissions.vault_id
        AND vaults.owner_id = auth.uid()
    )
  );

-- REFERRALS
CREATE POLICY "Users view their own referrals"
  ON referrals FOR SELECT USING (auth.uid() = referrer_id);
CREATE POLICY "Users insert referrals"
  ON referrals FOR INSERT WITH CHECK (auth.uid() = referrer_id);


-- ============================================================
-- STORAGE BUCKETS
-- (Run separately in Supabase Dashboard > Storage > New Bucket)
-- ============================================================
-- 1. vault-covers    — public: TRUE,  file size: 5MB
-- 2. submission-media — public: FALSE, file size: 20MB
-- 3. book-pdfs        — public: FALSE, file size: 500MB

-- Storage RLS: submission-media INSERT for anon
-- In Supabase Dashboard > Storage > submission-media > Policies:
-- Policy: "Allow anon upload"
--   Operation: INSERT
--   Target roles: anon
--   Expression: true
