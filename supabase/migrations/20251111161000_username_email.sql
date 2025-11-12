-- Create username_email table for username → email resolution
CREATE TABLE IF NOT EXISTS public.username_email (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT username_format CHECK (username ~ '^[A-Za-z0-9_.-]{3,}$')
);

-- Enable RLS
ALTER TABLE public.username_email ENABLE ROW LEVEL SECURITY;

-- Allow public to SELECT so we can resolve username before authentication
CREATE POLICY IF NOT EXISTS "Public can resolve username" ON public.username_email
  FOR SELECT
  TO public
  USING (true);

-- Allow users to INSERT their own mapping
CREATE POLICY IF NOT EXISTS "Users can insert their own username mapping" ON public.username_email
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow users to UPDATE their own mapping
CREATE POLICY IF NOT EXISTS "Users can update their own username mapping" ON public.username_email
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow users to DELETE their own mapping
CREATE POLICY IF NOT EXISTS "Users can delete their own username mapping" ON public.username_email
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_username_email_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_username_email_updated_at ON public.username_email;
CREATE TRIGGER update_username_email_updated_at
  BEFORE UPDATE ON public.username_email
  FOR EACH ROW
  EXECUTE FUNCTION public.update_username_email_updated_at();