# 🚨 IMMEDIATE FIX: Storage Bucket Setup

## Problem
"Bucket not found" error when creating events because the `event-images` storage bucket doesn't exist in your new Supabase project.

## Solution (2 minutes)

### Step 1: Run SQL Migration ✅

1. Go to your [Supabase SQL Editor](https://supabase.com/dashboard/project/kszyvgqhzguyiibpfpwo/sql/new)
2. Copy & paste the SQL below:

```sql
-- Create storage bucket for event images
INSERT INTO storage.buckets (id, name, public)
VALUES ('event-images', 'event-images', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Allow authenticated users to upload their own images
CREATE POLICY "Users can upload event images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'event-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow authenticated users to update their own images
CREATE POLICY "Users can update their event images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'event-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow authenticated users to delete their own images
CREATE POLICY "Users can delete their event images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'event-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow public read access to all event images
CREATE POLICY "Public can view event images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'event-images');
```

3. Click **Run** (or `Ctrl+Enter`)
4. You should see: **Success. No rows returned**

### Step 2: Verify Storage Bucket ✅

1. In Supabase Dashboard, go to **Storage** (left sidebar)
2. You should now see an **`event-images`** bucket
3. It should be marked as **Public**

### Step 3: Test Event Creation ✅

1. Go back to `http://localhost:8081`
2. Try creating an event again
3. Upload an event image
4. Click **"Create Event"**
5. **It should work now!** ✅

---

## What This Does

- **Creates** the `event-images` storage bucket
- **Allows** authenticated users to upload images (organized by user ID)
- **Allows** public read access (so event images can be displayed publicly)
- **Restricts** users to only manage their own images

---

## Still Getting Errors?

If you still see "Bucket not found":
1. Check the browser console (F12) for specific error messages
2. Verify the bucket was created (Supabase Dashboard → Storage)
3. Try refreshing the page with Ctrl+F5 (hard refresh)

**Once you run the SQL, event creation will work perfectly!** 🚀
