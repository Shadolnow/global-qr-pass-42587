-- Add missing payment columns to tickets table
ALTER TABLE public.tickets 
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS payment_ref_id TEXT,
ADD COLUMN IF NOT EXISTS payment_method TEXT,
ADD COLUMN IF NOT EXISTS checked_in_at TIMESTAMP WITH TIME ZONE;

-- Add index for payment status queries
CREATE INDEX IF NOT EXISTS idx_tickets_payment_status ON public.tickets(payment_status);

-- Add index for payment reference lookups
CREATE INDEX IF NOT EXISTS idx_tickets_payment_ref ON public.tickets(payment_ref_id) WHERE payment_ref_id IS NOT NULL;
