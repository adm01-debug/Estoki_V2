
-- Attach handle_new_user() to auth.users so profiles + default role
-- are created automatically on sign-up. Function already existed but had
-- no trigger, leaving every new user without profile/role.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
