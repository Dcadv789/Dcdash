/*
  # Fix RLS policies to prevent infinite recursion and add missing permissions

  This migration updates the Row Level Security policies to prevent infinite recursion
  while maintaining proper access control, and adds missing INSERT and UPDATE policies.

  1. Changes
    - Modified policies to prevent recursion by moving role checks outside EXISTS clauses
    - Updated other policies to use more efficient checks
    - Added INSERT and UPDATE policies for empresas table
    - Maintained existing enum and table structure

  2. Security
    - Policies continue to enforce proper access control
    - Fixed recursive policy definitions
    - Maintained role-based access control
    - Added proper write permissions for master users
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

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Master users can view all companies" ON empresas;
DROP POLICY IF EXISTS "Consultants can view associated companies" ON empresas;
DROP POLICY IF EXISTS "Clients and viewers can view their company" ON empresas;
DROP POLICY IF EXISTS "Master users can manage all users" ON usuarios;
DROP POLICY IF EXISTS "Master users can manage all associations" ON usuarios_empresas;

-- Recriar as políticas de segurança
CREATE POLICY "Master users can manage all companies"
  ON empresas
  FOR ALL
  TO authenticated
  USING (
    coalesce(
      nullif(current_setting('request.jwt.claim.permissao', true), ''),
      'viewer'
    )::user_role = 'master'::user_role
  );

CREATE POLICY "Consultants can view associated companies"
  ON empresas
  FOR SELECT
  TO authenticated
  USING (
    coalesce(
      nullif(current_setting('request.jwt.claim.permissao', true), ''),
      'viewer'
    )::user_role = 'consultor'::user_role AND 
    EXISTS (
      SELECT 1 FROM usuarios_empresas
      WHERE usuarios_empresas.usuario_id = auth.uid()
      AND usuarios_empresas.empresa_id = empresas.id
    )
  );

CREATE POLICY "Clients and viewers can view their company"
  ON empresas
  FOR SELECT
  TO authenticated
  USING (
    coalesce(
      nullif(current_setting('request.jwt.claim.permissao', true), ''),
      'viewer'
    )::user_role IN ('cliente'::user_role, 'viewer'::user_role) AND
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
      AND usuarios.empresa_id = empresas.id
    )
  );

CREATE POLICY "Master users can manage all users"
  ON usuarios
  FOR ALL
  TO authenticated
  USING (
    coalesce(
      nullif(current_setting('request.jwt.claim.permissao', true), ''),
      'viewer'
    )::user_role = 'master'::user_role
  );

CREATE POLICY "Master users can manage all associations"
  ON usuarios_empresas
  FOR ALL
  TO authenticated
  USING (
    coalesce(
      nullif(current_setting('request.jwt.claim.permissao', true), ''),
      'viewer'
    )::user_role = 'master'::user_role
  );