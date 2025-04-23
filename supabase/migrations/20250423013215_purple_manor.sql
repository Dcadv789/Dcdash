/*
  # Fix empresas table RLS policies

  1. Security Changes
    - Enable RLS on empresas table
    - Add policy for master users to manage all companies
    - Add policy for consultores to view all companies
    - Add policy for viewers to view all companies

  2. Changes
    - Drops existing policies if any
    - Creates new policies with proper permissions
*/

-- Enable RLS
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Master users can manage all companies" ON empresas;
DROP POLICY IF EXISTS "Consultores can view all companies" ON empresas;
DROP POLICY IF EXISTS "Viewers can view all companies" ON empresas;

-- Create policy for master users (full access)
CREATE POLICY "Master users can manage all companies"
ON empresas
FOR ALL
TO authenticated
USING (
  (SELECT permissao FROM usuarios WHERE auth.uid() = id) = 'master'
)
WITH CHECK (
  (SELECT permissao FROM usuarios WHERE auth.uid() = id) = 'master'
);

-- Create policy for consultores (read-only)
CREATE POLICY "Consultores can view all companies"
ON empresas
FOR SELECT
TO authenticated
USING (
  (SELECT permissao FROM usuarios WHERE auth.uid() = id) = 'consultor'
);

-- Create policy for viewers (read-only)
CREATE POLICY "Viewers can view all companies"
ON empresas
FOR SELECT
TO authenticated
USING (
  (SELECT permissao FROM usuarios WHERE auth.uid() = id) = 'viewer'
);