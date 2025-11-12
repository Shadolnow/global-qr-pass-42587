-- Grant admin role to user with email 'shamsud.ahmed@gmail.com'
-- Also ensure username mapping (username: 'shamsud') exists/updates

DO $$
DECLARE
  uid UUID;
BEGIN
  SELECT id INTO uid FROM auth.users WHERE email = 'shamsud.ahmed@gmail.com';

  IF uid IS NOT NULL THEN
    -- Assign admin role (idempotent)
    INSERT INTO public.user_roles (user_id, role)
    VALUES (uid, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;

    -- Ensure username → email mapping (idempotent)
    INSERT INTO public.username_email (user_id, username, email)
    VALUES (uid, 'shamsud', 'shamsud.ahmed@gmail.com')
    ON CONFLICT (username) DO UPDATE
      SET email = EXCLUDED.email,
          user_id = EXCLUDED.user_id;
  END IF;
END $$;