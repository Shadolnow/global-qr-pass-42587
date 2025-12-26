-- Add discount percentage to events table
-- Simple ALTER TABLE statement

ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS discount_percent INTEGER DEFAULT 0;

-- Add check constraint
ALTER TABLE public.events 
ADD CONSTRAINT discount_percent_range 
CHECK (discount_percent >= 0 AND discount_percent <= 100);

-- Add comment
COMMENT ON COLUMN public.events.discount_percent IS 'Global discount percentage applied to all tickets for this event (0-100)';
