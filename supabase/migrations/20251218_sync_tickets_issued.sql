-- Function to handle ticket status changes and keep counts in sync
CREATE OR REPLACE FUNCTION public.handle_ticket_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_old_active boolean;
  is_new_active boolean;
BEGIN
  -- Define "Active" as counting towards capacity/usage
  -- Active = NULL (legacy), 'paid', 'pending', 'pay_at_venue'
  -- Inactive = 'expired', 'cancelled', 'rejected', 'failed'
  
  is_old_active := (OLD.payment_status IS NULL OR OLD.payment_status NOT IN ('expired', 'cancelled', 'rejected', 'failed'));
  is_new_active := (NEW.payment_status IS NULL OR NEW.payment_status NOT IN ('expired', 'cancelled', 'rejected', 'failed'));

  -- If status changed from Active to Inactive -> Decrement
  IF is_old_active AND NOT is_new_active THEN
    -- Update Event Count
    UPDATE public.events 
    SET tickets_issued = tickets_issued - 1 
    WHERE id = NEW.event_id;

    -- Update Tier Count
    IF NEW.tier_id IS NOT NULL THEN
      UPDATE public.ticket_tiers 
      SET tickets_sold = tickets_sold - 1 
      WHERE id = NEW.tier_id;
    END IF;
  
  -- If status changed from Inactive to Active (e.g. un-cancelling manually) -> Increment
  ELSIF NOT is_old_active AND is_new_active THEN
    -- Update Event Count
    UPDATE public.events 
    SET tickets_issued = tickets_issued + 1 
    WHERE id = NEW.event_id;

    -- Update Tier Count
    IF NEW.tier_id IS NOT NULL THEN
      UPDATE public.ticket_tiers 
      SET tickets_sold = tickets_sold + 1 
      WHERE id = NEW.tier_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Create Trigger for STATUS UPDATES (e.g. Expiration, Cancellation)
DROP TRIGGER IF EXISTS on_ticket_status_change ON public.tickets;
CREATE TRIGGER on_ticket_status_change
  AFTER UPDATE OF payment_status ON public.tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_ticket_status_change();


-- Handle DELETIONS (if tickets are deleted hard from DB)
CREATE OR REPLACE FUNCTION public.handle_ticket_deletion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_old_active boolean;
BEGIN
  is_old_active := (OLD.payment_status IS NULL OR OLD.payment_status NOT IN ('expired', 'cancelled', 'rejected', 'failed'));

  IF is_old_active THEN
    -- Decrement Event Count
    UPDATE public.events 
    SET tickets_issued = tickets_issued - 1 
    WHERE id = OLD.event_id;

    -- Decrement Tier Count
    IF OLD.tier_id IS NOT NULL THEN
      UPDATE public.ticket_tiers 
      SET tickets_sold = tickets_sold - 1 
      WHERE id = OLD.tier_id;
    END IF;
  END IF;

  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS on_ticket_deleted ON public.tickets;
CREATE TRIGGER on_ticket_deleted
  AFTER DELETE ON public.tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_ticket_deletion();
