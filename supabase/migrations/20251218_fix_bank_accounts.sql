-- Make event_id nullable to allow global bank accounts for a user
DO $$ 
BEGIN
  -- Create table if not exists (similar to previous migration but with nullable event_id)
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'bank_accounts') THEN
    CREATE TABLE public.bank_accounts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      event_id UUID REFERENCES public.events(id) ON DELETE CASCADE, -- Nullable
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
      
      account_holder_name TEXT NOT NULL,
      bank_name TEXT,
      account_number TEXT,
      ifsc_code TEXT,
      account_type TEXT CHECK (account_type IN ('savings', 'current')) DEFAULT 'savings',
      branch_name TEXT,
      
      upi_id TEXT,
      qr_code_url TEXT,
      
      is_verified BOOLEAN DEFAULT false,
      is_primary BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    
    -- Add triggers
    CREATE TRIGGER update_bank_accounts_updated_at
    BEFORE UPDATE ON public.bank_accounts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
    
  ELSE
    -- If table exists, modify columns
    ALTER TABLE public.bank_accounts ALTER COLUMN event_id DROP NOT NULL;
    ALTER TABLE public.bank_accounts ALTER COLUMN bank_name DROP NOT NULL;
    ALTER TABLE public.bank_accounts ALTER COLUMN account_number DROP NOT NULL;
    ALTER TABLE public.bank_accounts ALTER COLUMN ifsc_code DROP NOT NULL;
    
    -- Add columns if missing
    ALTER TABLE public.bank_accounts ADD COLUMN IF NOT EXISTS upi_id TEXT;
    ALTER TABLE public.bank_accounts ADD COLUMN IF NOT EXISTS qr_code_url TEXT;
  END IF;
END $$;

-- Enable RLS
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;

-- Safely recreate policies
DROP POLICY IF EXISTS "Users can view their own bank accounts" ON public.bank_accounts;
CREATE POLICY "Users can view their own bank accounts"
ON public.bank_accounts FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create bank accounts" ON public.bank_accounts;
CREATE POLICY "Users can create bank accounts"
ON public.bank_accounts FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own bank accounts" ON public.bank_accounts;
CREATE POLICY "Users can update their own bank accounts"
ON public.bank_accounts FOR UPDATE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own bank accounts" ON public.bank_accounts;
CREATE POLICY "Users can delete their own bank accounts"
ON public.bank_accounts FOR DELETE
USING (auth.uid() = user_id);
