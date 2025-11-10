-- Add admin access to events table
CREATE POLICY "Admins can view all events"
  ON public.events FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all events"
  ON public.events FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete all events"
  ON public.events FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- Add admin access to tickets table  
CREATE POLICY "Admins can update all tickets"
  ON public.tickets FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete all tickets"
  ON public.tickets FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- Update user_roles table to allow viewing own role
CREATE POLICY "Users can view their own role"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Add update policy for admins to change roles
CREATE POLICY "Admins can update roles"
  ON public.user_roles FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));