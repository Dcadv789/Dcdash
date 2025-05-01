/*
  # Criar tabela de componentes do tipo card

  1. Nova Tabela
    - `dashboard_card_components`: Armazena os componentes que compõem um card
      - `id` (uuid, chave primária)
      - `dashboard_id` (uuid, referência ao dashboard_config)
      - `categoria_id` (uuid, opcional, referência a categorias)
      - `indicador_id` (uuid, opcional, referência a indicadores)
      - `ordem` (integer)
      - `cor` (text)
      
  2. Restrições
    - Apenas um dos campos categoria_id ou indicador_id pode estar preenchido
    - Chaves estrangeiras para dashboard_config, categorias e indicadores
*/

CREATE TABLE IF NOT EXISTS dashboard_card_components (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dashboard_id uuid NOT NULL REFERENCES dashboard_config(id) ON DELETE CASCADE,
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
ALTER TABLE dashboard_card_components ENABLE ROW LEVEL SECURITY;

-- Criar políticas de acesso
CREATE POLICY "Usuários autenticados podem ver todos os componentes"
  ON dashboard_card_components
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem gerenciar componentes"
  ON dashboard_card_components
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Criar índices
CREATE INDEX idx_dashboard_card_components_dashboard_id 
  ON dashboard_card_components(dashboard_id);
CREATE INDEX idx_dashboard_card_components_categoria_id 
  ON dashboard_card_components(categoria_id);
CREATE INDEX idx_dashboard_card_components_indicador_id 
  ON dashboard_card_components(indicador_id);