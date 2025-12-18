-- Create a trigger function to strictly enforce capacity prevention on INSERT
CREATE OR REPLACE FUNCTION public.enforce_ticket_capacity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_available boolean;
BEGIN
  -- Check Event Capacity
  IF NOT public.check_ticket_availability(NEW.event_id) THEN
    RAISE EXCEPTION 'Event capacity exceeded';
  END IF;

  -- Check Tier Capacity (if tiered)
  IF NEW.tier_id IS NOT NULL THEN
    IF NOT public.check_tier_availability(NEW.tier_id) THEN
      RAISE EXCEPTION 'Tier capacity exceeded';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists to allow idempotent runs
DROP TRIGGER IF EXISTS check_capacity_before_insert ON public.tickets;

-- Create the trigger
CREATE TRIGGER check_capacity_before_insert
  BEFORE INSERT ON public.tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_ticket_capacity();

-- OPTIONAL: Decrement tickets_issued on expiration/cancellation?
-- Currently 'tickets_issued' on events table acts as a lifetime counter.
-- If we want it to reflect active count, we need a trigger on update/delete.
-- For now, we'll leave it as lifetime issued to match the name.
