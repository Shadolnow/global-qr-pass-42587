-- Fix capacity checking to ignore expired/cancelled tickets
-- This replaces the reliance on 'tickets_issued' counter which doesn't decrement

CREATE OR REPLACE FUNCTION public.check_ticket_availability(event_id_input uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_capacity int;
  v_sold int;
BEGIN
  -- Get event capacity
  SELECT capacity INTO v_capacity FROM public.events WHERE id = event_id_input;
  
  -- If unlimited
  IF v_capacity IS NULL THEN
    RETURN true;
  END IF;

  -- Count valid tickets
  -- We exclude 'expired', 'cancelled', 'rejected', 'failed'
  -- We INCLUDE 'paid', 'pending', 'pay_at_venue' (and NULL which defaults to paid in older records)
  SELECT count(*) INTO v_sold
  FROM public.tickets
  WHERE event_id = event_id_input
  AND (payment_status IS NULL OR payment_status NOT IN ('expired', 'cancelled', 'rejected', 'failed'));

  RETURN v_sold < v_capacity;
END;
$$;

-- Fix Tier availability as well
CREATE OR REPLACE FUNCTION public.check_tier_availability(tier_id_input uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_capacity int;
  v_sold int;
  v_event_id uuid;
  v_event_available boolean;
BEGIN
  -- Get tier info
  SELECT capacity, event_id INTO v_capacity, v_event_id 
  FROM public.ticket_tiers 
  WHERE id = tier_id_input AND is_active = true;

  -- If tier not found/inactive
  IF v_event_id IS NULL THEN
    RETURN false;
  END IF;

  -- 1. Check Event Level Capacity First (Parent Constraint)
  IF NOT public.check_ticket_availability(v_event_id) THEN
    RETURN false;
  END IF;

  -- 2. Check Tier Level
  IF v_capacity IS NULL THEN
    RETURN true;
  END IF;

  SELECT count(*) INTO v_sold
  FROM public.tickets
  WHERE tier_id = tier_id_input
  AND (payment_status IS NULL OR payment_status NOT IN ('expired', 'cancelled', 'rejected', 'failed'));

  RETURN v_sold < v_capacity;
END;
$$;

-- Grant execution again just in case
GRANT EXECUTE ON FUNCTION public.check_ticket_availability(uuid) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.check_tier_availability(uuid) TO authenticated, anon;
