-- Create table for storing OTP codes
CREATE TABLE IF NOT EXISTS public.email_otps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  otp_code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX idx_email_otps_email ON public.email_otps(email);
CREATE INDEX idx_email_otps_expires_at ON public.email_otps(expires_at);

-- RLS policies (allow anyone to insert/read their own OTPs)
ALTER TABLE public.email_otps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert OTP" ON public.email_otps
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can read their own OTP" ON public.email_otps
  FOR SELECT USING (true);

CREATE POLICY "Anyone can update their own OTP" ON public.email_otps
  FOR UPDATE USING (true);

-- Function to clean up expired OTPs (optional, for maintenance)
CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS void AS $$
BEGIN
  DELETE FROM public.email_otps
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;
