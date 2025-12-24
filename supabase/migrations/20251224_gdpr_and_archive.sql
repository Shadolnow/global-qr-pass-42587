-- Past Events Auto-Archive & GDPR Compliance

-- Part 1: Add archived status to events
ALTER TABLE events ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;
ALTER TABLE events ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;

-- Part 2: GDPR Data Deletion Request Table
CREATE TABLE IF NOT EXISTS data_deletion_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')) DEFAULT 'pending',
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  data_export_url TEXT,
  deletion_scheduled_for TIMESTAMPTZ,
  notes TEXT
);

-- Part 3: User Data Export Table
CREATE TABLE IF NOT EXISTS user_data_exports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  export_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
  downloaded BOOLEAN DEFAULT false
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_events_archived ON events(is_archived, archived_at);
CREATE INDEX IF NOT EXISTS idx_deletion_requests_status ON data_deletion_requests(status);
CREATE INDEX IF NOT EXISTS idx_deletion_requests_user ON data_deletion_requests(user_id);

-- Part 4: Function to auto-archive past events
CREATE OR REPLACE FUNCTION auto_archive_past_events()
RETURNS INTEGER AS $$
DECLARE
  archived_count INTEGER;
BEGIN
  -- Archive events that ended more than 30 days ago
  WITH archived AS (
    UPDATE events
    SET 
      is_archived = true,
      archived_at = NOW()
    WHERE 
      event_date < (NOW() - INTERVAL '30 days')
      AND is_archived = false
      AND deleted_at IS NULL
    RETURNING id
  )
  SELECT COUNT(*) INTO archived_count FROM archived;
  
  -- Log the archival
  INSERT INTO audit_logs (action, table_name, new_data)
  VALUES ('AUTO_ARCHIVE_EVENTS', 'events', jsonb_build_object('count', archived_count));
  
  RETURN archived_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Part 5: Function to export user data (GDPR)
CREATE OR REPLACE FUNCTION export_user_data(target_user_id UUID)
RETURNS UUID AS $$
DECLARE
  export_id UUID;
  user_data JSONB;
BEGIN
  -- Collect all user data
  SELECT jsonb_build_object(
    'user_profile', (SELECT to_jsonb(u.*) FROM auth.users u WHERE u.id = target_user_id),
    'events', (SELECT jsonb_agg(e.*) FROM events e WHERE e.user_id = target_user_id),
    'tickets', (SELECT jsonb_agg(t.*) FROM tickets t WHERE t.user_id = target_user_id),
    'comments', (SELECT jsonb_agg(c.*) FROM event_comments c WHERE c.user_id = target_user_id),
    'reactions', (SELECT jsonb_agg(r.*) FROM event_reactions r WHERE r.user_id = target_user_id)
  ) INTO user_data;
  
  -- Store the export
  INSERT INTO user_data_exports (user_id, export_data)
  VALUES (target_user_id, user_data)
  RETURNING id INTO export_id;
  
  RETURN export_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Part 6: Function to request data deletion (GDPR)
CREATE OR REPLACE FUNCTION request_data_deletion(requester_email TEXT)
RETURNS UUID AS $$
DECLARE
  request_id UUID;
  target_user_id UUID;
BEGIN
  -- Find user by email
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = requester_email;
  
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;
  
  -- Create deletion request
  INSERT INTO data_deletion_requests (
    user_id,
    email,
    deletion_scheduled_for
  )
  VALUES (
    target_user_id,
    requester_email,
    NOW() + INTERVAL '30 days' -- 30-day grace period
  )
  RETURNING id INTO request_id;
  
  -- Export user data first
  PERFORM export_user_data(target_user_id);
  
  -- Log the request
  INSERT INTO audit_logs (user_id, action, table_name, record_id)
  VALUES (target_user_id, 'DATA_DELETION_REQUESTED', 'data_deletion_requests', request_id);
  
  RETURN request_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Part 7: Function to process data deletion
CREATE OR REPLACE FUNCTION process_data_deletion(request_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  request_record RECORD;
BEGIN
  -- Get the deletion request
  SELECT * INTO request_record
  FROM data_deletion_requests
  WHERE id = request_id
  AND status = 'pending'
  AND deletion_scheduled_for <= NOW();
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Update status to processing
  UPDATE data_deletion_requests
  SET status = 'processing'
  WHERE id = request_id;
  
  -- Delete user data (cascading will handle related records)
  -- Note: This is permanent and irreversible
  DELETE FROM event_comments WHERE user_id = request_record.user_id;
  DELETE FROM event_reactions WHERE user_id = request_record.user_id;
  DELETE FROM tickets WHERE user_id = request_record.user_id;
  DELETE FROM events WHERE user_id = request_record.user_id;
  
  -- Mark as completed
  UPDATE data_deletion_requests
  SET 
    status = 'completed',
    completed_at = NOW()
  WHERE id = request_id;
  
  -- Log completion
  INSERT INTO audit_logs (user_id, action, table_name, record_id)
  VALUES (request_record.user_id, 'DATA_DELETED', 'data_deletion_requests', request_id);
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Part 8: RLS Policies
ALTER TABLE data_deletion_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_data_exports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own deletion requests"
  ON data_deletion_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create deletion requests"
  ON data_deletion_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own data exports"
  ON user_data_exports FOR SELECT
  USING (auth.uid() = user_id);

-- Comments
COMMENT ON FUNCTION auto_archive_past_events IS 'Automatically archives events older than 30 days - run daily';
COMMENT ON FUNCTION export_user_data IS 'Exports all user data for GDPR compliance';
COMMENT ON FUNCTION request_data_deletion IS 'Creates a data deletion request with 30-day grace period';
COMMENT ON FUNCTION process_data_deletion IS 'Permanently deletes user data after grace period - run daily';
