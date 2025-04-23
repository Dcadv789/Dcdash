/*
  # Fix usuarios table policies to show all users
  
  1. Changes
    - Drop existing policies
    - Create new policies that properly check user permissions
    - Fix the issue where users can't see all records
    
  2. Security
    - Maintain proper access control
    - Use direct permission checks from usuarios table
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Master users can manage all users" ON usuarios;
DROP POLICY IF EXISTS "Consultores can view all users" ON usuarios;
DROP POLICY IF EXISTS "Viewers can view all users" ON usuarios;
DROP POLICY IF EXISTS "Users can view their own data" ON usuarios;

-- Create new policies
CREATE POLICY "Master users can manage all users"
ON usuarios
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM usuarios
    WHERE auth_id = auth.uid()
    AND permissao = 'master'
  )
);

CREATE POLICY "Users can view all users"
ON usuarios
FOR SELECT
TO authenticated
USING (true);