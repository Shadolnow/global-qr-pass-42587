import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend('re_AE1BVTHD_7SCeU1rt4EdujFhDFaGfgg33');

// Get Supabase credentials from environment
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    try {
        // Generate 6-digit OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

        // Store OTP in database (expires in 10 minutes)
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

        const { error: dbError } = await supabase
            .from('email_otps')
            .insert({
                email: email.toLowerCase(),
                otp_code: otpCode,
                expires_at: expiresAt,
                verified: false
            });

        if (dbError) {
            console.error('Database error:', dbError);
            return res.status(500).json({ error: 'Failed to generate OTP' });
        }

        // Send OTP via email
        const { data, error } = await resend.emails.send({
            from: 'EventTix <onboarding@resend.dev>',
            to: [email],
            subject: `Your EventTix Verification Code: ${otpCode}`,
            html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #4f46e5; text-align: center;">EventTix</h1>
          <div style="background-color: #f3f4f6; border-radius: 8px; padding: 30px; text-align: center; margin: 20px 0;">
            <h2 style="margin: 0 0 10px 0; color: #111;">Your Verification Code</h2>
            <p style="color: #6b7280; margin: 0 0 20px 0;">Enter this code to claim your ticket:</p>
            <div style="background-color: white; border: 2px dashed #4f46e5; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <p style="font-size: 36px; font-weight: bold; letter-spacing: 8px; margin: 0; color: #4f46e5;">${otpCode}</p>
            </div>
            <p style="color: #6b7280; font-size: 14px; margin: 20px 0 0 0;">This code will expire in 10 minutes.</p>
          </div>
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">
            If you didn't request this code, please ignore this email.
          </p>
        </div>
      `,
        });

        if (error) {
            console.error('Resend error:', error);
            return res.status(400).json({ error: error.message });
        }

        return res.status(200).json({
            message: 'OTP sent successfully',
            emailId: data?.id
        });
    } catch (error) {
        console.error('Server error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
