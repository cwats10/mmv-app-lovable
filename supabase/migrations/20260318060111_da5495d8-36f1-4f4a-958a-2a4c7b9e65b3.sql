
-- Create timestamp update function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Profiles table (auto-created on signup via trigger)
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  subscription_status TEXT NOT NULL DEFAULT 'inactive',
  stripe_customer_id TEXT,
  referral_code TEXT NOT NULL DEFAULT upper(substr(md5(random()::text), 1, 8)),
  referred_by UUID,
  is_admin BOOLEAN NOT NULL DEFAULT false
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Vaults table
CREATE TABLE public.vaults (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  missionary_name TEXT NOT NULL,
  mission_name TEXT NOT NULL DEFAULT '',
  mission_start DATE,
  mission_end DATE,
  vault_type TEXT NOT NULL DEFAULT 'post' CHECK (vault_type IN ('pre', 'post')),
  submission_token TEXT NOT NULL DEFAULT upper(substr(md5(random()::text), 1, 12)),
  cover_image_url TEXT
);

ALTER TABLE public.vaults ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own vaults"
  ON public.vaults FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can create vaults"
  ON public.vaults FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own vaults"
  ON public.vaults FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own vaults"
  ON public.vaults FOR DELETE
  USING (auth.uid() = owner_id);

-- Anyone can view vaults by submission token (for contribute page)
CREATE POLICY "Anyone can view vaults by submission token"
  ON public.vaults FOR SELECT
  USING (true);

-- Books table
CREATE TABLE public.books (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  vault_id UUID NOT NULL REFERENCES public.vaults(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'collecting' CHECK (status IN ('collecting', 'review', 'purchased', 'printing', 'delivered')),
  design_theme TEXT NOT NULL DEFAULT 'museum_archive_elegant',
  pdf_url TEXT,
  delivery_address JSONB,
  stripe_payment_intent_id TEXT,
  pod_order_id TEXT
);

ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view books for their vaults"
  ON public.books FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.vaults WHERE vaults.id = books.vault_id AND vaults.owner_id = auth.uid()
  ));

CREATE POLICY "Users can create books for their vaults"
  ON public.books FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.vaults WHERE vaults.id = vault_id AND vaults.owner_id = auth.uid()
  ));

CREATE POLICY "Users can update books for their vaults"
  ON public.books FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.vaults WHERE vaults.id = books.vault_id AND vaults.owner_id = auth.uid()
  ));

-- Submissions table
CREATE TABLE public.submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  vault_id UUID NOT NULL REFERENCES public.vaults(id) ON DELETE CASCADE,
  book_id UUID REFERENCES public.books(id),
  contributor_name TEXT NOT NULL,
  relation TEXT NOT NULL,
  message TEXT NOT NULL,
  media_urls TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'))
);

ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vault owners can view submissions"
  ON public.submissions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.vaults WHERE vaults.id = submissions.vault_id AND vaults.owner_id = auth.uid()
  ));

CREATE POLICY "Vault owners can update submissions"
  ON public.submissions FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.vaults WHERE vaults.id = submissions.vault_id AND vaults.owner_id = auth.uid()
  ));

CREATE POLICY "Anyone can submit contributions"
  ON public.submissions FOR INSERT
  WITH CHECK (true);

-- Referrals table
CREATE TABLE public.referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_email TEXT NOT NULL,
  referred_user_id UUID REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'converted', 'rewarded')),
  reward_amount NUMERIC NOT NULL DEFAULT 0
);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own referrals"
  ON public.referrals FOR SELECT
  USING (auth.uid() = referrer_id);

CREATE POLICY "Users can insert referrals"
  ON public.referrals FOR INSERT
  WITH CHECK (true);

-- Admin function
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = _user_id AND is_admin = true
  )
$$;

CREATE POLICY "Admins can view all books"
  ON public.books FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can view all submissions"
  ON public.submissions FOR SELECT
  USING (public.is_admin(auth.uid()));

-- Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('vault-covers', 'vault-covers', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('submission-media', 'submission-media', true);

CREATE POLICY "Anyone can view vault covers"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'vault-covers');

CREATE POLICY "Authenticated users can upload vault covers"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'vault-covers' AND auth.role() = 'authenticated');

CREATE POLICY "Anyone can view submission media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'submission-media');

CREATE POLICY "Anyone can upload submission media"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'submission-media');

-- Enable realtime for submissions
ALTER PUBLICATION supabase_realtime ADD TABLE public.submissions;
