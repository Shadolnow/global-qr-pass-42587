-- Fix duplicate RLS policies on events table
-- This migration ensures public users can view all events

-- Drop any existing conflicting policies
DROP POLICY IF EXISTS "Users can view all events" ON public.events;
DROP POLICY IF EXISTS "Anyone can view events" ON public.events;

-- Create a single clear policy for public event viewing
CREATE POLICY "public_events_read"
  ON public.events FOR SELECT
  USING (true);

-- Verify the policy works - this will log in console
COMMENT ON POLICY "public_events_read" ON public.events IS 'Allows anyone (authenticated or not) to view all events';
