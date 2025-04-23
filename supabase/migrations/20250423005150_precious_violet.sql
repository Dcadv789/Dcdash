/*
  # Correção de Dependências

  Esta migração remove as políticas e restrições existentes para permitir
  a recriação das tabelas e tipos sem conflitos.
*/

-- Remover políticas existentes
DROP POLICY IF EXISTS "Master users can view all companies" ON empresas;
DROP POLICY IF EXISTS "Consultants can view associated companies" ON empresas;
DROP POLICY IF EXISTS "Clients and viewers can view their company" ON empresas;
DROP POLICY IF EXISTS "Master users can manage all users" ON usuarios;
DROP POLICY IF EXISTS "Users can view their own data" ON usuarios;
DROP POLICY IF EXISTS "Consultants can view users in their associated companies" ON usuarios;
DROP POLICY IF EXISTS "Clients can view users in their company" ON usuarios;
DROP POLICY IF EXISTS "Master users can manage all associations" ON usuarios_empresas;
DROP POLICY IF EXISTS "Consultants can view their associations" ON usuarios_empresas;

-- Remover restrições de chave estrangeira
ALTER TABLE IF EXISTS usuarios DROP CONSTRAINT IF EXISTS usuarios_empresa_id_fkey;
ALTER TABLE IF EXISTS usuarios_empresas DROP CONSTRAINT IF EXISTS usuarios_empresas_usuario_id_fkey;
ALTER TABLE IF EXISTS usuarios_empresas DROP CONSTRAINT IF EXISTS usuarios_empresas_empresa_id_fkey;

-- Desabilitar RLS temporariamente
ALTER TABLE empresas DISABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios_empresas DISABLE ROW LEVEL SECURITY;