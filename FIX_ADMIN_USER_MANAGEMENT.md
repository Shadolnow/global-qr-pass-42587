# 🛠️ Fix Admin User Management - Add dfasonfe@gmail.com

## Problem
The Admin Dashboard's "All Users" list is empty because the `profiles` table is missing the `email` column.

## Solution - Run SQL in Supabase Dashboard

### Step 1: Open Supabase SQL Editor
1. Go to https://supabase.com/dashboard
2. Select your EventTix project
3. Click **SQL Editor** in the left sidebar
4. Click **+ New query**

### Step 2: Run This SQL

Copy and paste this entire SQL block:

```sql
-- Add email column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email TEXT;

-- Update the handle_new_user function to include email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, account_type, company_name, plan_type)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'account_type', 'individual'),
    NEW.raw_user_meta_data->>'company_name',
    COALESCE(NEW.raw_user_meta_data->>'plan_type', 'free')
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Backfill existing profiles with emails from auth.users
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.user_id = u.id
AND p.email IS NULL;
```

### Step 3: Click "Run" or press Ctrl+Enter

You should see: "Success. No rows returned"

### Step 4: Verify in Admin Dashboard

1. Go back to your app: https://your-app.vercel.app/admin
2. Refresh the page
3. You should now see **dfasonfe@gmail.com** in the "All Users" list
4. You can now select their role (admin/moderator/user) from the dropdown

## How to Add the User as Admin

Once dfasonfe@gmail.com appears in the list:
1. Find their row in the "All Users" table
2. In the "Role" column, click the dropdown
3. Select **"admin"**
4. Done! They now have admin access

## What This Fix Does

- ✅ Adds `email` column to `profiles` table
- ✅ Updates the signup trigger to include email in new profiles
- ✅ Backfills email for all existing users (including dfasonfe@gmail.com)
- ✅ Makes the Admin Dashboard "All Users" list work properly

After running this SQL, all new signups will automatically get a profile with their email, and you can manage roles easily!
