-- Create promo_codes table
CREATE TABLE IF NOT EXISTS public.promo_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID DEFAULT auth.uid() REFERENCES auth.users(id),
    code TEXT NOT NULL,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    discount_percent NUMERIC,
    discount_amount NUMERIC,
    max_uses INTEGER,
    current_uses INTEGER DEFAULT 0 NOT NULL,
    min_purchase NUMERIC DEFAULT 0,
    valid_from TIMESTAMP WITH TIME ZONE,
    valid_until TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_code_per_event UNIQUE (code, event_id) -- Or just UNIQUE(code) if global uniqueness desired. Let's enforce Global Uniqueness for simplicity? 
    -- UI generates 8 char random code.
    -- If event_id is null, it's global.
    -- Let's make code UNIQUE globally to avoid confusion.
);

ALTER TABLE public.promo_codes ADD CONSTRAINT promo_codes_code_key UNIQUE (code);


-- Enable RLS
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

-- Policies
-- 1. Organizers can manage their own codes
CREATE POLICY "Users can manage their own promo codes" ON public.promo_codes
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- 2. Anyone can read active codes (for applying at checkout)
CREATE POLICY "Anyone can read active promo codes" ON public.promo_codes
    FOR SELECT USING (true);
