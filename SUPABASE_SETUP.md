# Supabase Configuration Guide

## 🔴 Issue: "Signup Failed - Network error"

This error occurs when Supabase environment variables are missing or incorrect.

## ✅ Solution: Configure Environment Variables

### Step 1: Locate Your Supabase Credentials

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Click on your project
3. Go to **Settings** → **API**
4. You'll find:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **Anon/Public Key** (long string starting with `eyJ...`)

### Step 2: Update Your .env File

Open the `.env` file in the project root and add/update these variables:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key-here
VITE_PUBLIC_SITE_URL=http://localhost:8080
```

**Example:**
```env
VITE_SUPABASE_URL=https://abcdefgh.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_PUBLIC_SITE_URL=http://localhost:8080
```

### Step 3: Restart the Dev Server

After updating the `.env` file:

1. Stop the current server (Ctrl+C in terminal)
2. Restart: `npm run dev`
3. The changes will be picked up

### Step 4: Verify Connection

1. Open http://localhost:8080/auth
2. Try to sign up or log in
3. If configured correctly, you should no longer see the network error

---

## 🔍 Troubleshooting

### Error Still Appears?

**Check:**
1. ✅ Variable names are exactly: `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`
2. ✅ No extra spaces before/after the `=` sign
3. ✅ No quotes around the values
4. ✅ Server was restarted after changes
5. ✅ You're using the **anon/public** key, not the service role key

### Check Browser Console

1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for errors mentioning:
   - "supabaseUrl is required"
   - "supabaseKey is required"
   - CORS errors

### Database Not Set Up?

If your Supabase database tables don't exist yet:

1. Go to Supabase Dashboard → SQL Editor
2. Run the contents of `SETUP_DATABASE.sql`
3. Run the contents of `SETUP_STORAGE.sql`

---

## 📝 Current .env Status

Your `.env.example` file shows the template. Make sure your actual `.env` file has real values!

**Template (.env.example):**
```env
VITE_PUBLIC_SITE_URL=
```

**Your .env should have:**
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJxxxxx...
VITE_PUBLIC_SITE_URL=http://localhost:8080
```

---

## 🎯 Quick Fix Command

If you need to quickly check what's in your .env (without showing sensitive data):

```powershell
Get-Content .env | ForEach-Object { 
    if ($_ -match '^VITE_') { 
        $parts = $_ -split '=', 2
        "$($parts[0])=<configured>"
    }
}
```

This will show which variables are set without revealing the actual values.

---

*Need help? The error message "Network error. Please check your connection" specifically means the Supabase client can't initialize, which is always due to missing/incorrect environment variables.*
