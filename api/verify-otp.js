import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ error: 'Email and OTP are required' });
    }

    try {
        // Find the most recent non-verified OTP for this email
        const { data: otpRecords, error: fetchError } = await supabase
            .from('email_otps')
            .select('*')
            .eq('email', email.toLowerCase())
            .eq('verified', false)
            .gte('expires_at', new Date().toISOString())
            .order('created_at', { ascending: false })
            .limit(1);

        if (fetchError) {
            console.error('Database error:', fetchError);
            return res.status(500).json({ error: 'Failed to verify OTP' });
        }

        if (!otpRecords || otpRecords.length === 0) {
            return res.status(400).json({ error: 'No valid OTP found. Please request a new code.' });
        }

        const otpRecord = otpRecords[0];

        // Check if OTP matches
        if (otpRecord.otp_code !== otp) {
            return res.status(400).json({ error: 'Invalid OTP code' });
        }

        // Mark OTP as verified
        const { error: updateError } = await supabase
            .from('email_otps')
            .update({ verified: true })
            .eq('id', otpRecord.id);

        if (updateError) {
            console.error('Update error:', updateError);
            return res.status(500).json({ error: 'Failed to verify OTP' });
        }

        return res.status(200).json({
            success: true,
            message: 'OTP verified successfully'
        });
    } catch (error) {
        console.error('Server error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
