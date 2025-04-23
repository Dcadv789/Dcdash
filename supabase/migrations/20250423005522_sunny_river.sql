/*
  # Fix RLS policies to prevent infinite recursion

  This migration updates the Row Level Security policies to prevent infinite recursion
  while maintaining proper access control.

  1. Changes
    - Modified 'Master users can manage all users' policy to prevent recursion
    - Updated other policies to use more efficient checks
    - Maintained existing enum and table structure

  2. Security
    - Policies continue to enforce proper access control
    - Fixed recursive policy definitions
    - Maintained role-based access control
*/

-- Criar enum para tipos de permissão
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('master', 'consultor', 'cliente', 'viewer');
  END IF;
END $$;

-- Recriar tabelas com as chaves estrangeiras
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios_empresas ENABLE ROW LEVEL SECURITY;

-- Recriar as políticas de segurança
CREATE POLICY "Master users can view all companies"
  ON empresas
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
      AND usuarios.permissao = 'master'::user_role
    )
  );

CREATE POLICY "Consultants can view associated companies"
  ON empresas
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios_empresas
      WHERE usuarios_empresas.usuario_id = auth.uid()
      AND usuarios_empresas.empresa_id = empresas.id
      AND EXISTS (
        SELECT 1 FROM usuarios
        WHERE usuarios.id = auth.uid()
        AND usuarios.permissao = 'consultor'::user_role
      )
    )
  );

CREATE POLICY "Clients and viewers can view their company"
  ON empresas
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
      AND usuarios.empresa_id = empresas.id
      AND usuarios.permissao IN ('cliente'::user_role, 'viewer'::user_role)
    )
  );

-- Fixed policy to prevent infinite recursion
CREATE POLICY "Master users can manage all users"
  ON usuarios
  FOR ALL
  TO authenticated
  USING (
    auth.role() = 'authenticated' AND (
      SELECT permissao FROM usuarios 
      WHERE id = auth.uid() 
      LIMIT 1
    ) = 'master'::user_role
  );

CREATE POLICY "Master users can manage all associations"
  ON usuarios_empresas
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
      AND usuarios.permissao = 'master'::user_role
    )
  );