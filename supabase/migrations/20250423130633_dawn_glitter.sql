/*
  # Reconfigurar permissões do sistema

  1. Alterações
    - Recriar políticas de acesso para todas as tabelas
    - Configurar permissões baseadas em roles usando JWT claims
    - Garantir acesso adequado para cada tipo de usuário

  2. Segurança
    - Habilitar RLS em todas as tabelas
    - Definir políticas específicas por role
    - Garantir isolamento adequado dos dados
    - Evitar recursão nas políticas
*/

-- Habilitar RLS nas tabelas
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios_empresas ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes
DROP POLICY IF EXISTS "Master users can manage all companies" ON empresas;
DROP POLICY IF EXISTS "Consultants can view associated companies" ON empresas;
DROP POLICY IF EXISTS "Clients and viewers can view their company" ON empresas;
DROP POLICY IF EXISTS "Master users can manage all users" ON usuarios;
DROP POLICY IF EXISTS "Users can view their own data" ON usuarios;
DROP POLICY IF EXISTS "Master users can manage all associations" ON usuarios_empresas;

-- Políticas para empresas
CREATE POLICY "Empresas - Acesso total para master"
  ON empresas FOR ALL TO authenticated
  USING ((auth.jwt() ->> 'role')::text = 'master');

CREATE POLICY "Empresas - Visualização para consultor"
  ON empresas FOR SELECT TO authenticated
  USING ((auth.jwt() ->> 'role')::text = 'consultor');

CREATE POLICY "Empresas - Visualização para cliente e viewer"
  ON empresas FOR SELECT TO authenticated
  USING (
    (auth.jwt() ->> 'role')::text IN ('cliente', 'viewer')
    AND (auth.jwt() ->> 'empresa_id')::uuid = id
  );

-- Políticas para usuários
CREATE POLICY "Usuarios - Acesso total para master"
  ON usuarios FOR ALL TO authenticated
  USING ((auth.jwt() ->> 'role')::text = 'master');

CREATE POLICY "Usuarios - Visualização própria"
  ON usuarios FOR SELECT TO authenticated
  USING (auth_id = auth.uid());

CREATE POLICY "Usuarios - Visualização para consultor"
  ON usuarios FOR SELECT TO authenticated
  USING ((auth.jwt() ->> 'role')::text = 'consultor');

-- Políticas para usuarios_empresas
CREATE POLICY "Usuarios Empresas - Acesso total para master"
  ON usuarios_empresas FOR ALL TO authenticated
  USING ((auth.jwt() ->> 'role')::text = 'master');

CREATE POLICY "Usuarios Empresas - Visualização para consultor"
  ON usuarios_empresas FOR SELECT TO authenticated
  USING ((auth.jwt() ->> 'role')::text = 'consultor');