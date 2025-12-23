# 🔧 UPI Payment Issue - Fix Guide

## Issues Identified

### 1. ❌ Missing Database Columns
**Error:** `Could not find the 'payment_ref_id' column of 'tickets' in the schema cache`

**Fix:** Run this migration in Supabase SQL Editor:

```sql
-- File: supabase/migrations/20251223_add_payment_columns.sql

-- Add missing payment columns to tickets table
ALTER TABLE public.tickets 
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS payment_ref_id TEXT,
ADD COLUMN IF NOT EXISTS payment_method TEXT,
ADD COLUMN IF NOT EXISTS checked_in_at TIMESTAMP WITH TIME ZONE;

-- Add index for payment status queries
CREATE INDEX IF NOT EXISTS idx_tickets_payment_status ON public.tickets(payment_status);

-- Add index for payment reference lookups
CREATE INDEX IF NOT EXISTS idx_tickets_payment_ref ON public.tickets(payment_ref_id) WHERE payment_ref_id IS NOT NULL;
```

---

### 2. ⚠️ Missing Payment Details
**Warning:** "Organizer hasn't provided payment details. Please contact them directly."

**Root Cause:** The event doesn't have UPI payment details configured.

**Fix:** As the event organizer, go to:
1. **Event Dashboard** → Select your event
2. Click **"Payment"** tab (or "Bank Accounts")
3. Fill in your UPI details:
   - Account Holder Name
   - UPI ID (e.g., `yourname@paytm`)
   - QR Code URL (optional - upload your UPI QR code image)
4. Click **"Save Payment Details"**

---

## Step-by-Step Fix

### Step 1: Run SQL Migration ✅

1. Go to **Supabase Dashboard**
2. Click **SQL Editor**
3. Click **New Query**
4. Copy the SQL above
5. Click **Run** (or `Ctrl+Enter`)

### Step 2: Add Payment Details to Event ✅

#### Option A: Via Event Dashboard
```
1. Login as organizer
2. Go to /events
3. Click on your event
4. Click "Payment" tab
5. Enter:
   - Account Holder Name: "Your Name"
   - UPI ID: "yourname@paytm" (or any UPI)
   - QR Code URL: (optional)
6. Save
```

#### Option B: Via SQL (Quick Test)
```sql
-- Insert test bank account for an event
INSERT INTO public.bank_accounts (
  user_id,
  event_id,
  account_holder_name,
  upi_id,
  is_primary
) VALUES (
  'YOUR_USER_ID',  -- Replace with your user ID
  'YOUR_EVENT_ID', -- Replace with event ID
  'Test Organizer',
  'test@paytm',
  true
);
```

---

## Testing After Fix

1. ✅ Run the SQL migration
2. ✅ Add UPI details to your event  
3. 🔄 Refresh the public event page
4. ✅ The warning should disappear
5. ✅ UPI payment details should show:
   - QR Code (if provided)
   - UPI ID to copy
   - "I have made UPI Payment" button

---

## What Happens After Fix

**Before:**
- ⚠️ Warning message shows
- ❌ No payment section
- ❌ Button fails with schema error

**After:**
- ✅ UPI QR code displays (if provided)
- ✅ UPI ID shows for manual payment
- ✅ "I have made UPI Payment" button works
- ✅ Ticket generates with `payment_status: 'pending'`
- ✅ Organizer verifies payment later in dashboard

---

## Verification Checklist

Run these queries in Supabase SQL Editor to verify:

```sql
-- 1. Check if columns exist
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'tickets' 
  AND column_name IN ('payment_status', 'payment_ref_id', 'payment_method');

-- 2. Check if bank account exists for your event
SELECT * FROM public.bank_accounts 
WHERE event_id = 'YOUR_EVENT_ID';  -- Replace with actual event ID

-- 3. Check required migrations are applied
SELECT * FROM supabase_migrations.schema_migrations 
WHERE version LIKE '202512%'
ORDER BY version DESC;
```

---

## Quick Debug Commands

If issues persist:

```sql
-- See all columns in tickets table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'tickets'
ORDER BY ordinal_position;

-- Check RLS policies on bank_accounts
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'bank_accounts';
```

---

**Status:** Migration created ✅  
**File:** `supabase/migrations/20251223_add_payment_columns.sql`  
**Action Required:** Run the SQL migration + Add UPI details to event
