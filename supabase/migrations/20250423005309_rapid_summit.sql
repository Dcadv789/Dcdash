/*
  # Recriar estrutura do banco de dados

  Esta migração recria as tabelas e políticas na ordem correta,
  após a remoção das dependências anteriores.
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
      AND usuarios.permissao = 'master'
    )
  );

CREATE POLICY "Consultants can view associated companies"
  ON empresas
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios_empresas
      JOIN usuarios ON usuarios.id = usuarios_empresas.usuario_id
      WHERE usuarios.id = auth.uid()
      AND usuarios.permissao = 'consultor'
      AND usuarios_empresas.empresa_id = empresas.id
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
      AND usuarios.permissao IN ('cliente', 'viewer')
    )
  );

CREATE POLICY "Master users can manage all users"
  ON usuarios
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.id = auth.uid()
      AND u.permissao = 'master'
    )
  );

CREATE POLICY "Master users can manage all associations"
  ON usuarios_empresas
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
      AND usuarios.permissao = 'master'
    )
  );