-- Add payment columns to events table
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS upi_id TEXT,
ADD COLUMN IF NOT EXISTS payment_qr_image_url TEXT;

-- Update RLS if necessary (usually standard update policies cover new columns if they are just 'events' columns)
-- but let's make sure.
-- Existing policies on 'events' usually allow update for owner.
