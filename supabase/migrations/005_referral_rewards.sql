-- Add reward_balance to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS reward_balance NUMERIC(10,2) NOT NULL DEFAULT 0.00;

-- Atomic function to increment reward balance (SECURITY DEFINER bypasses RLS)
CREATE OR REPLACE FUNCTION increment_reward_balance(uid UUID, delta NUMERIC)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE profiles SET reward_balance = reward_balance + delta WHERE id = uid;
$$;
