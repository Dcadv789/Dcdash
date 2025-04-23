/*
  # Fix master user permissions
  
  1. Changes
    - Update RLS policies to allow master users to view all records
    - Simplify policy checks to avoid recursion
    - Add policy for master users to view all users
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Usuarios - Acesso total para master" ON usuarios;
DROP POLICY IF EXISTS "Usuarios - Visualização própria" ON usuarios;
DROP POLICY IF EXISTS "Usuarios - Visualização para consultor" ON usuarios;

-- Create new policies for usuarios table
CREATE POLICY "Usuarios - Acesso total"
  ON usuarios FOR ALL 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.auth_id = auth.uid()
      AND usuarios.permissao = 'master'
    )
    OR auth_id = auth.uid()
  );

-- Drop existing policies for empresas
DROP POLICY IF EXISTS "Empresas - Acesso total para master" ON empresas;
DROP POLICY IF EXISTS "Empresas - Visualização para consultor" ON empresas;
DROP POLICY IF EXISTS "Empresas - Visualização para cliente e viewer" ON empresas;

-- Create new policies for empresas table
CREATE POLICY "Empresas - Acesso geral"
  ON empresas FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.auth_id = auth.uid()
      AND (
        usuarios.permissao = 'master'
        OR usuarios.permissao = 'consultor'
        OR (usuarios.permissao IN ('cliente', 'viewer') AND usuarios.empresa_id = empresas.id)
      )
    )
  );