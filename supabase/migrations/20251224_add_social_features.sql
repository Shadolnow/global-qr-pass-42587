-- Social Features Database Schema
-- Part 1: Attendee Networking

-- Attendee profiles for networking
CREATE TABLE IF NOT EXISTS event_attendees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  display_name TEXT NOT NULL,
  bio TEXT,
  profile_photo_url TEXT,
  linkedin_url TEXT,
  twitter_handle TEXT,
  show_in_directory BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Connections between attendees
CREATE TABLE IF NOT EXISTS attendee_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_id UUID REFERENCES event_attendees(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES event_attendees(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'accepted', 'declined')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(requester_id, receiver_id)
);

-- Part 2: Photo Gallery

-- Event photos
CREATE TABLE IF NOT EXISTS event_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  uploaded_by UUID REFERENCES event_attendees(id),
  photo_url TEXT NOT NULL,
  caption TEXT,
  is_approved BOOLEAN DEFAULT false,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Photo likes
CREATE TABLE IF NOT EXISTS photo_likes (
  photo_id UUID REFERENCES event_photos(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (photo_id, user_id)
);

-- Part 3: Comments & Reactions

-- Event comments
CREATE TABLE IF NOT EXISTS event_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  attendee_id UUID REFERENCES event_attendees(id),
  content TEXT NOT NULL,
  parent_id UUID REFERENCES event_comments(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Event reactions
CREATE TABLE IF NOT EXISTS event_reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  reaction_type TEXT CHECK (reaction_type IN ('like', 'love', 'fire', 'party')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_id, reaction_type)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_event_attendees_event ON event_attendees(event_id);
CREATE INDEX IF NOT EXISTS idx_event_photos_event ON event_photos(event_id);
CREATE INDEX IF NOT EXISTS idx_event_photos_approved ON event_photos(is_approved);
CREATE INDEX IF NOT EXISTS idx_event_comments_event ON event_comments(event_id);
CREATE INDEX IF NOT EXISTS idx_event_reactions_event ON event_reactions(event_id);

-- RLS Policies

-- Event Attendees: Public can read if show_in_directory
ALTER TABLE event_attendees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public attendees"
  ON event_attendees FOR SELECT
  USING (show_in_directory = true);

CREATE POLICY "Users can insert their own attendee profile"
  ON event_attendees FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own attendee profile"
  ON event_attendees FOR UPDATE
  USING (auth.uid() = user_id);

-- Event Photos: Public can read approved photos
ALTER TABLE event_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved photos"
  ON event_photos FOR SELECT
  USING (is_approved = true);

CREATE POLICY "Attendees can upload photos"
  ON event_photos FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM event_attendees
    WHERE event_attendees.id = event_photos.uploaded_by
    AND event_attendees.user_id = auth.uid()
  ));

-- Photo Likes: Anyone can read, authenticated users can like
ALTER TABLE photo_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view photo likes"
  ON photo_likes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can like photos"
  ON photo_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike photos"
  ON photo_likes FOR DELETE
  USING (auth.uid() = user_id);

-- Comments: Public can read, authenticated can write
ALTER TABLE event_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read comments"
  ON event_comments FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can comment"
  ON event_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
  ON event_comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON event_comments FOR DELETE
  USING (auth.uid() = user_id);

-- Reactions: Public can read, authenticated can react
ALTER TABLE event_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read reactions"
  ON event_reactions FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can react"
  ON event_reactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their reactions"
  ON event_reactions FOR DELETE
  USING (auth.uid() = user_id);

-- Functions

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for comments
CREATE TRIGGER update_event_comments_updated_at
  BEFORE UPDATE ON event_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to increment photo likes
CREATE OR REPLACE FUNCTION increment_photo_likes()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE event_photos
  SET likes_count = likes_count + 1
  WHERE id = NEW.photo_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_photo_like
  AFTER INSERT ON photo_likes
  FOR EACH ROW
  EXECUTE FUNCTION increment_photo_likes();

-- Function to decrement photo likes
CREATE OR REPLACE FUNCTION decrement_photo_likes()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE event_photos
  SET likes_count = likes_count - 1
  WHERE id = OLD.photo_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_photo_unlike
  AFTER DELETE ON photo_likes
  FOR EACH ROW
  EXECUTE FUNCTION decrement_photo_likes();
