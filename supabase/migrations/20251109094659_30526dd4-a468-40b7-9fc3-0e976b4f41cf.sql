-- Add categories and capacity management to events table
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS category text DEFAULT 'general',
ADD COLUMN IF NOT EXISTS capacity integer,
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';

-- Create index for better search performance
CREATE INDEX IF NOT EXISTS idx_events_search ON public.events USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '') || ' ' || venue));
CREATE INDEX IF NOT EXISTS idx_events_category ON public.events(category);
CREATE INDEX IF NOT EXISTS idx_events_date ON public.events(event_date);

-- Add check constraint for capacity
ALTER TABLE public.events 
ADD CONSTRAINT check_capacity_positive CHECK (capacity IS NULL OR capacity > 0);

-- Create a function to check ticket availability
CREATE OR REPLACE FUNCTION public.check_ticket_availability(event_id_input uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    CASE 
      WHEN e.capacity IS NULL THEN true
      ELSE e.tickets_issued < e.capacity
    END
  FROM public.events e
  WHERE e.id = event_id_input;
$$;

-- Add RLS policy for the new function
GRANT EXECUTE ON FUNCTION public.check_ticket_availability TO authenticated, anon;