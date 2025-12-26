-- ============================================
-- MANUAL SQL SCRIPT - COPY TO SUPABASE DASHBOARD
-- ============================================
-- This adds the discount_percent column to events table
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================

-- Step 1: Add the column
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS discount_percent INTEGER DEFAULT 0;

-- Step 2: Add validation constraint
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'discount_percent_range'
    ) THEN
        ALTER TABLE public.events 
        ADD CONSTRAINT discount_percent_range 
        CHECK (discount_percent >= 0 AND discount_percent <= 100);
    END IF;
END $$;

-- Step 3: Add helpful comment
COMMENT ON COLUMN public.events.discount_percent IS 'Global discount percentage applied to all tickets for this event (0-100)';

-- Verify the column was added
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns 
WHERE table_name = 'events' 
AND column_name = 'discount_percent';
