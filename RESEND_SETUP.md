# Resend API Key Setup Commands

## Your Resend API Key
```
re_6G9M3K4N_Hxx5GaMXfJDLvnCo5Z4UtDCp
```

## Step 1: Add API Key to Supabase

### Option A: Via Supabase Dashboard (Easiest)
1. Go to https://supabase.com/dashboard
2. Select your project: `kszyvgqhzguyiibpfpwo`
3. Navigate to Project Settings (gear icon) → Edge Functions
4. Scroll to "Secrets" section
5. Click "Add a new secret"
6. Name: `RESEND_API_KEY`
7. Value: `re_6G9M3K4N_Hxx5GaMXfJDLvnCo5Z4UtDCp`
8. Click "Add secret"

### Option B: Via Supabase CLI
```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref kszyvgqhzguyiibpfpwo

# Set the secret
supabase secrets set RESEND_API_KEY=re_6G9M3K4N_Hxx5GaMXfJDLvnCo5Z4UtDCp
```

## Step 2: Deploy the Email Function

```bash
# Deploy the send-ticket-email function
supabase functions deploy send-ticket-email

# Verify deployment
supabase functions list
```

## Step 3: Test the Function

```bash
# Test sending an email
supabase functions invoke send-ticket-email --body '{
  "to": "your-email@example.com",
  "ticketCode": "TEST-12345",
  "attendeeName": "Test User",
  "eventTitle": "Test Event 2024",
  "eventDate": "2024-12-31T20:00:00Z",
  "eventVenue": "Test Venue, City",
  "ticketUrl": "https://eventtix-psi.vercel.app/ticket/test123"
}'
```

## Alternative: Add to .env for Local Testing

Create/edit `.env.local` in project root:
```bash
RESEND_API_KEY=re_6G9M3K4N_Hxx5GaMXfJDLvnCo5Z4UtDCp
```

Then test locally:
```bash
# Start Supabase locally
supabase start

# Serve the function
supabase functions serve send-ticket-email
```

## Verification Checklist

- [ ] API key added to Supabase secrets
- [ ] Function deployed successfully
- [ ] Test email sent
- [ ] Email received in inbox (check spam folder!)
- [ ] Ticket email template looks good

## Expected Result

After setup, every ticket purchase will automatically send an email to the attendee with:
- Ticket code
- Event details
- QR code link
- Beautiful HTML formatting

## Troubleshooting

**If emails don't send:**
1. Check Supabase Edge Function logs
2. Verify API key is correct
3. Check email isn't in spam folder
4. Ensure function is deployed

**If you see "onboarding@resend.dev" as sender:**
- This is Resend's test domain
- Limited to 100 emails/day
- To use your own domain, verify it in Resend dashboard

## Next Steps

Once working, consider:
1. Verify your own domain in Resend
2. Update `from` address in function (line 32)
3. Customize email template
4. Monitor email delivery in Resend dashboard

---

**Status:** Ready to send 3,000 FREE emails per month! 🎉
