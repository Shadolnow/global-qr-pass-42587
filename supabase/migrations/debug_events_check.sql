-- Quick check to see if events exist and verify RLS policy
-- Run this in Supabase SQL Editor to debug

-- Check if events exist at all
SELECT id, title, event_date, is_free, user_id, created_at
FROM public.events
ORDER BY created_at DESC
LIMIT 10;

-- Check current RLS policies on events table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'events';

-- Test if anonymous user can read events (should work with public_events_read policy)
SET ROLE anon;
SELECT COUNT(*) as event_count FROM public.events;
SELECT id, title, event_date FROM public.events LIMIT 5;
RESET ROLE;
