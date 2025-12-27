-- Create a function to get user by email from auth.users
CREATE OR REPLACE FUNCTION public.get_user_by_email(email_input TEXT)
RETURNS TABLE (
  id UUID,
  email TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    u.created_at
  FROM auth.users u
  WHERE u.email = email_input
  LIMIT 1;
END;
$$;
