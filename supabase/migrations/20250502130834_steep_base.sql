/*
  # Criar tabelas de componentes do tipo card para vendas e análise

  1. Novas Tabelas
    - `vendas_card_components`: Componentes de cards do dashboard de vendas
    - `analise_card_components`: Componentes de cards do dashboard de análise
      
  2. Estrutura (igual ao dashboard_card_components)
    - `id` (uuid, chave primária)
    - `dashboard_id` (uuid, referência à config específica)
    - `categoria_id` (uuid, opcional, referência a categorias)
    - `indicador_id` (uuid, opcional, referência a indicadores)
    - `ordem` (integer)
    - `cor` (text)
*/

-- Criar tabela de componentes de card para vendas
CREATE TABLE IF NOT EXISTS vendas_card_components (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dashboard_id uuid NOT NULL REFERENCES vendas_config(id) ON DELETE CASCADE,
  categoria_id uuid REFERENCES categorias(id) ON DELETE CASCADE,
  indicador_id uuid REFERENCES indicadores(id) ON DELETE CASCADE,
  ordem integer NOT NULL,
  cor text NOT NULL,
  CONSTRAINT check_apenas_um_componente CHECK (
    (CASE WHEN categoria_id IS NOT NULL THEN 1 ELSE 0 END +
     CASE WHEN indicador_id IS NOT NULL THEN 1 ELSE 0 END) = 1
  )
);

-- Criar tabela de componentes de card para análise
CREATE TABLE IF NOT EXISTS analise_card_components (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dashboard_id uuid NOT NULL REFERENCES analise_config(id) ON DELETE CASCADE,
  categoria_id uuid REFERENCES categorias(id) ON DELETE CASCADE,
  indicador_id uuid REFERENCES indicadores(id) ON DELETE CASCADE,
  ordem integer NOT NULL,
  cor text NOT NULL,
  CONSTRAINT check_apenas_um_componente CHECK (
    (CASE WHEN categoria_id IS NOT NULL THEN 1 ELSE 0 END +
     CASE WHEN indicador_id IS NOT NULL THEN 1 ELSE 0 END) = 1
  )
);

-- Habilitar RLS
ALTER TABLE vendas_card_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE analise_card_components ENABLE ROW LEVEL SECURITY;

-- Criar políticas de acesso para vendas_card_components
CREATE POLICY "Usuários autenticados podem ver todos os componentes"
  ON vendas_card_components
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem gerenciar componentes"
  ON vendas_card_components
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Criar políticas de acesso para analise_card_components
CREATE POLICY "Usuários autenticados podem ver todos os componentes"
  ON analise_card_components
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem gerenciar componentes"
  ON analise_card_components
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Criar índices
CREATE INDEX idx_vendas_card_components_dashboard_id 
  ON vendas_card_components(dashboard_id);
CREATE INDEX idx_vendas_card_components_categoria_id 
  ON vendas_card_components(categoria_id);
CREATE INDEX idx_vendas_card_components_indicador_id 
  ON vendas_card_components(indicador_id);

CREATE INDEX idx_analise_card_components_dashboard_id 
  ON analise_card_components(dashboard_id);
CREATE INDEX idx_analise_card_components_categoria_id 
  ON analise_card_components(categoria_id);
CREATE INDEX idx_analise_card_components_indicador_id 
  ON analise_card_components(indicador_id);