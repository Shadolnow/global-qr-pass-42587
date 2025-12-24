# Email Function Troubleshooting Guide

## Issue: Emails Not Sending

The Edge Function is deployed but emails aren't being sent. Here's how to debug:

## Step 1: Check Browser Console

When you create a ticket:
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for line: `Email sending results: [...]`
4. Check for any errors

## Step 2: Check Supabase Invocations

1. Go to: https://supabase.com/dashboard/project/kszyvgqhzguyiibpfpwo/functions/send-ticket-email
2. Click "Invocations" tab
3. You should see attempts listed
4. Click on any invocation to see:
   - Request body (the email data)
   - Response (success or error)
   - Logs (any console output)

## Step 3: Common Issues

### Issue A: RESEND_API_KEY Not Set
**Fix:**
1. Go to Edge Functions → Secrets
2. Verify `RESEND_API_KEY` exists
3. Value should be: `re_6G9M3K4N_Hxx5GaMXfJDLvnCo5Z4UtDCp`

### Issue B: CORS Error
**Symptom:** Browser console shows CORS error
**Fix:** Already handled in function code

### Issue C: Function Not Being Called
**Check:** Browser console should show "Email sending results"
**If missing:** Code might need redeployment

## Step 4: Test Function Directly

Test the function manually in Supabase:

1. Go to function page
2. Click "Test" button (top right)
3. Use this test payload:

```json
{
  "to": "your-email@example.com",
  "ticketCode": "TEST-12345",
  "attendeeName": "Test User",
  "eventTitle": "Test Event",
  "eventDate": "2024-12-31T20:00:00Z",
  "eventVenue": "Test Venue",
  "ticketUrl": "https://eventtix-psi.vercel.app/ticket/test"
}
```

4. Click "Invoke function"
5. Check response and your email

## Step 5: Enable Detailed Logging

I can add more detailed logging to help debug. Would you like me to:
1. Add console.log statements to track email sending
2. Show toast notifications for email status
3. Add error handling to show what's failing

## Quick Fix: Add Logging

Let me add better error handling and logging so we can see exactly what's happening.

---

**Next Steps:**
1. Check Supabase Invocations tab
2. Look for errors in console
3. Test function directly
4. Let me know what you see and I'll fix it!
