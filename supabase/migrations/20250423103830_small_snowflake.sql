/*
  # Update User Permissions and Visibility

  1. Changes
    - Update handle_new_user function to set default permission to 'master'
    - Drop and recreate RLS policies to ensure proper visibility
    - Add policy for master users to see all users
*/

-- Update the handle_new_user function to set master as default
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.usuarios (auth_id, nome, email, permissao)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'nome', 'Novo Usuário'), new.email, 'master');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing policies
DROP POLICY IF EXISTS "Master users can manage all users" ON usuarios;
DROP POLICY IF EXISTS "Users can view their own data" ON usuarios;

-- Create new policies
CREATE POLICY "Master users can manage all users"
  ON usuarios
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_id = auth.uid()
      AND u.permissao = 'master'
    )
  );

CREATE POLICY "Users can view their own data"
  ON usuarios
  FOR SELECT
  TO authenticated
  USING (
    auth_id = auth.uid()
  );