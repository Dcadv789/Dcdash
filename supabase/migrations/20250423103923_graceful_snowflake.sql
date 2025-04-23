/*
  # Fix usuarios table RLS policies

  1. Security Changes
    - Enable RLS on usuarios table
    - Add policy for master users to manage all users
    - Add policy for consultores to view all users
    - Add policy for viewers to view all users
    - Fix infinite recursion by using auth.jwt() claims instead of querying usuarios table

  2. Changes
    - Drops existing policies if any
    - Creates new policies with proper permissions using JWT claims
*/

-- Enable RLS
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Master users can manage all users" ON usuarios;
DROP POLICY IF EXISTS "Consultores can view all users" ON usuarios;
DROP POLICY IF EXISTS "Viewers can view all users" ON usuarios;

-- Create policy for master users (full access)
CREATE POLICY "Master users can manage all users"
ON usuarios
FOR ALL
TO authenticated
USING (
  auth.jwt() ->> 'role' = 'master'
)
WITH CHECK (
  auth.jwt() ->> 'role' = 'master'
);

-- Create policy for consultores (read-only)
CREATE POLICY "Consultores can view all users"
ON usuarios
FOR SELECT
TO authenticated
USING (
  auth.jwt() ->> 'role' = 'consultor'
);

-- Create policy for viewers (read-only)
CREATE POLICY "Viewers can view all users"
ON usuarios
FOR SELECT
TO authenticated
USING (
  auth.jwt() ->> 'role' = 'viewer'
);