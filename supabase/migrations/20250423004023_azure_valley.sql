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
CREATE POLICY "Usuários master podem ver todas as empresas"
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

CREATE POLICY "Consultores podem ver empresas associadas"
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

CREATE POLICY "Clientes e viewers podem ver sua empresa"
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

-- Políticas de segurança para usuários
CREATE POLICY "Usuários master podem gerenciar todos os usuários"
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

-- Políticas de segurança para usuários_empresas
CREATE POLICY "Usuários master podem gerenciar todas as associações"
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