-- Fix RLS policies for event customization updates
-- Run this in Supabase SQL Editor

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Users can update their events" ON public.events;
DROP POLICY IF EXISTS "Users can view their own events" ON public.events;

-- Recreate with proper permissions
CREATE POLICY "Users can view their own events" 
ON public.events 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Public can view all events"
ON public.events
FOR SELECT
USING (true);

CREATE POLICY "Users can update their own events" 
ON public.events 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Grant necessary permissions
GRANT ALL ON public.events TO authenticated;
GRANT SELECT ON public.events TO anon;

-- Verify success
SELECT 'Event update policies fixed!' as message;
