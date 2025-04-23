/*
  # Add auth users relation

  1. Changes
    - Add auth_id column to usuarios table
    - Create trigger to sync auth.users with usuarios table
    - Update RLS policies to use auth.uid()

  2. Security
    - Maintain existing RLS policies
    - Add auth_id validation
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

-- Update existing policies to use auth_id
DROP POLICY IF EXISTS "Master users can manage all users" ON usuarios;
CREATE POLICY "Master users can manage all users"
  ON usuarios
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.auth_id = auth.uid()
      AND usuarios.permissao = 'master'::user_role
    )
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