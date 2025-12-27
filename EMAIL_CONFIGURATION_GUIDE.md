# 📧 Email Configuration Guide

## Problem
Signup/verification emails not reaching users' inboxes due to:
- Supabase free tier rate limits
- Emails going to spam
- No custom SMTP configuration

## Quick Fix (Development/Testing)

### Disable Email Verification
**In Supabase Dashboard:**
1. Go to https://supabase.com/dashboard
2. Select your EventTix project
3. Navigate to: **Authentication** → **Providers** → **Email**
4. Find "Confirm email" toggle
5. **Turn it OFF**
6. Click **Save**

✅ Users can now sign up and log in immediately without email verification

**Pros:**
- Instant signup
- No waiting for emails
- Great for testing

**Cons:**
- Less secure (no email ownership verification)
- Only recommended for development or trusted users

## Production Solution: Custom SMTP

For production, set up proper email delivery using a service like:

### Recommended Email Services:
1. **Resend** (Easiest, modern)
   - Free tier: 3,000 emails/month
   - https://resend.com

2. **SendGrid** (Popular)
   - Free tier: 100 emails/day
   - https://sendgrid.com

3. **Mailgun** (Reliable)
   - Free tier: 5,000 emails/month (first 3 months)
   - https://mailgun.com

### Setup with Resend (Recommended):

1. **Sign up at Resend:**
   - Go to https://resend.com
   - Create free account

2. **Get API Key:**
   - Dashboard → API Keys
   - Create new API key
   - Copy it

3. **Configure in Supabase:**
   - Supabase Dashboard → **Settings** → **Authentication**
   - Scroll to **SMTP Settings**
   - Enable "Use custom SMTP"
   - Fill in:
     - **Host:** smtp.resend.com
     - **Port:** 587
     - **Username:** resend
     - **Password:** [Your Resend API key]
     - **Sender email:** noreply@yourdomain.com
     - **Sender name:** EventTix

4. **Verify Domain (Optional but recommended):**
   - In Resend, add your domain
   - Add DNS records they provide
   - Verified emails have much better delivery

5. **Test:**
   - Try signing up with a new email
   - Email should arrive within seconds

## Email Template Customization

You can also customize the email templates in Supabase:
1. **Authentication** → **Email Templates**
2. Edit templates for:
   - Confirm signup
   - Magic Link
   - Password reset
   - Email change

Add your branding, logo, and custom text!

## Troubleshooting

**Still not receiving emails?**

1. **Check spam/junk folder**
2. **Try different email provider** (Gmail, Outlook, etc.)
3. **Check Supabase logs:**
   - Dashboard → Logs → Auth logs
   - Look for email sending errors
4. **Verify SMTP credentials** are correct
5. **Check email rate limits** (Supabase/provider)

**Emails going to spam?**

1. **Set up SPF/DKIM records** (in your DNS)
2. **Use verified domain** (not example.com)
3. **Warm up your sending domain** (start slow)
4. **Improve email content** (remove spammy words)

## Current Status

Your app is using:
- ✅ Supabase built-in auth
- ⚠️ Default Supabase email service (limited)
- ❌ No custom SMTP configured

**Recommended immediate action:**
1. **For testing:** Disable email verification in Supabase
2. **For production:** Set up Resend SMTP (takes 10 minutes)

After setup, emails will be delivered reliably to inbox!
