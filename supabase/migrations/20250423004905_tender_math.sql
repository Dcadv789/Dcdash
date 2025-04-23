/*
  # Sistema de Gerenciamento de Usuários

  1. Novas Tabelas
    - `empresas`
      - `id` (uuid, chave primária)
      - `nome` (texto, único)
      - `created_at` (timestamp)

    - `usuarios`
      - `id` (uuid, chave primária)
      - `nome` (texto)
      - `email` (texto, único)
      - `permissao` (texto: master, consultor, cliente, viewer)
      - `empresa_id` (uuid, FK para empresas)
      - `created_at` (timestamp)

    - `usuarios_empresas`
      - `id` (uuid, chave primária)
      - `usuario_id` (uuid, FK para usuarios)
      - `empresa_id` (uuid, FK para empresas)
      - `created_at` (timestamp)

  2. Segurança
    - RLS habilitado em todas as tabelas
    - Políticas de acesso baseadas nas permissões dos usuários
*/

-- Criar enum para tipos de permissão
CREATE TYPE user_role AS ENUM ('master', 'consultor', 'cliente', 'viewer');

-- Criar tabela de empresas
CREATE TABLE IF NOT EXISTS empresas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Criar tabela de usuários
CREATE TABLE IF NOT EXISTS usuarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  email text UNIQUE NOT NULL,
  permissao user_role NOT NULL,
  empresa_id uuid REFERENCES empresas(id),
  created_at timestamptz DEFAULT now(),
  CONSTRAINT check_empresa_id CHECK (
    (permissao IN ('cliente', 'viewer') AND empresa_id IS NOT NULL) OR
    (permissao = 'master') OR
    (permissao = 'consultor')
  )
);

-- Criar tabela de relacionamento usuários-empresas
CREATE TABLE IF NOT EXISTS usuarios_empresas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid REFERENCES usuarios(id) ON DELETE CASCADE,
  empresa_id uuid REFERENCES empresas(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(usuario_id, empresa_id)
);

-- Habilitar RLS
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios_empresas ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança para empresas
CREATE POLICY "Master users can view all companies"
  ON empresas
  FOR SELECT
  TO authenticated
  USING (
    (SELECT permissao FROM usuarios WHERE id = auth.uid()) = 'master'
  );

CREATE POLICY "Consultants can view associated companies"
  ON empresas
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios_empresas
      WHERE usuario_id = auth.uid()
      AND empresa_id = empresas.id
    )
    AND
    (SELECT permissao FROM usuarios WHERE id = auth.uid()) = 'consultor'
  );

CREATE POLICY "Clients and viewers can view their company"
  ON empresas
  FOR SELECT
  TO authenticated
  USING (
    empresas.id = (SELECT empresa_id FROM usuarios WHERE id = auth.uid())
    AND
    (SELECT permissao FROM usuarios WHERE id = auth.uid()) IN ('cliente', 'viewer')
  );

-- Políticas de segurança para usuários
CREATE POLICY "Master users can manage all users"
  ON usuarios
  FOR ALL
  TO authenticated
  USING (
    (SELECT permissao FROM usuarios WHERE id = auth.uid() LIMIT 1) = 'master'
  );

CREATE POLICY "Users can view their own data"
  ON usuarios
  FOR SELECT
  TO authenticated
  USING (
    id = auth.uid()
  );

CREATE POLICY "Consultants can view users in their associated companies"
  ON usuarios
  FOR SELECT
  TO authenticated
  USING (
    (SELECT permissao FROM usuarios WHERE id = auth.uid()) = 'consultor'
    AND
    EXISTS (
      SELECT 1 FROM usuarios_empresas
      WHERE usuario_id = auth.uid()
      AND empresa_id = usuarios.empresa_id
    )
  );

CREATE POLICY "Clients can view users in their company"
  ON usuarios
  FOR SELECT
  TO authenticated
  USING (
    (SELECT permissao FROM usuarios WHERE id = auth.uid()) IN ('cliente', 'viewer')
    AND
    usuarios.empresa_id = (SELECT empresa_id FROM usuarios WHERE id = auth.uid())
  );

-- Políticas de segurança para usuarios_empresas
CREATE POLICY "Master users can manage all associations"
  ON usuarios_empresas
  FOR ALL
  TO authenticated
  USING (
    (SELECT permissao FROM usuarios WHERE id = auth.uid()) = 'master'
  );

CREATE POLICY "Consultants can view their associations"
  ON usuarios_empresas
  FOR SELECT
  TO authenticated
  USING (
    usuario_id = auth.uid()
    AND
    (SELECT permissao FROM usuarios WHERE id = auth.uid()) = 'consultor'
  );