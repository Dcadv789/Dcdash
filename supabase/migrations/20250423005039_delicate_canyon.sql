/*
  # Fix duplicate user_role type

  This migration drops the existing user_role type before recreating it to fix
  the "type already exists" error.
*/

DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    DROP TYPE user_role;
  END IF;
END $$;