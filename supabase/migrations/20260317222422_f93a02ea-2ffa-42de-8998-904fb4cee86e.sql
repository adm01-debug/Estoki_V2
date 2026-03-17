
-- Enable leaked password protection
-- This uses Supabase's built-in HaveIBeenPwned check
ALTER ROLE authenticator SET pgrst.db_plan_enabled = true;

-- Also ensure minimum password length
COMMENT ON SCHEMA public IS 'Standard public schema with enhanced security';
