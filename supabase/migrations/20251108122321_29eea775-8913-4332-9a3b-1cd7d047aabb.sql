-- Add fields for event customization
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS gallery_images text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS faq jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS schedule jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS sponsors jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS additional_info text;