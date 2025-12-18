-- Function to expire tickets that are 'pay_at_venue' and older than 24 hours
CREATE OR REPLACE FUNCTION expire_unpaid_tickets()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.tickets
  SET payment_status = 'expired'
  WHERE payment_status = 'pay_at_venue'
  AND created_at < (NOW() - INTERVAL '24 hours');
END;
$$;
