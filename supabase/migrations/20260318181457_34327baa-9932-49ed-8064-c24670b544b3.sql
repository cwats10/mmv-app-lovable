
-- 1. Add manager_token column to vaults
ALTER TABLE public.vaults ADD COLUMN manager_token text UNIQUE DEFAULT encode(gen_random_bytes(12), 'hex');

-- 2. Attach the handle_new_user trigger (function exists but trigger is missing)
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
