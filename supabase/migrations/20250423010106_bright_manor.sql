/*
  # Add auth users relation and fix RLS policies

  1. Changes
    - Add auth_id column to usuarios table
    - Create trigger to sync auth.users with usuarios table
    - Update RLS policies to use auth.uid() and JWT claims
    - Fix infinite recursion in master users policy

  2. Security
    - Maintain existing RLS policies with improved efficiency
    - Add auth_id validation
    - Use JWT claims for permission checks
*/

-- Add auth_id column to usuarios table
ALTER TABLE usuarios
ADD COLUMN IF NOT EXISTS auth_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.usuarios (auth_id, nome, email, permissao)
  VALUES (new.id, new.raw_user_meta_data->>'nome', new.email, 'viewer');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new auth users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Update master users policy to use JWT claims and avoid recursion
DROP POLICY IF EXISTS "Master users can manage all users" ON usuarios;
CREATE POLICY "Master users can manage all users"
  ON usuarios
  FOR ALL
  TO authenticated
  USING (
    coalesce(
      nullif(current_setting('request.jwt.claim.permissao', true), ''),
      'viewer'::text
    )::user_role = 'master'::user_role
  );

-- Add policy for users to view their own data
DROP POLICY IF EXISTS "Users can view their own data" ON usuarios;
CREATE POLICY "Users can view their own data"
  ON usuarios
  FOR SELECT
  TO authenticated
  USING (
    auth_id = auth.uid()
  );