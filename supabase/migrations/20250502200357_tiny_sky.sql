/*
  # Adicionar tipo de lista nas configurações de dashboard

  1. Alterações
    - Criar enum para tipos de lista (categoria, cliente)
    - Adicionar coluna lista_tipo nas tabelas:
      - dashboard_config
      - vendas_config
      - analise_config
    
  2. Segurança
    - Mantém a estrutura existente
    - Apenas adiciona nova coluna com enum
*/

-- Criar enum para tipos de lista
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'lista_tipo') THEN
    CREATE TYPE lista_tipo AS ENUM ('categoria', 'cliente');
  END IF;
END$$;

-- Adicionar coluna lista_tipo nas tabelas de configuração
ALTER TABLE dashboard_config
ADD COLUMN lista_tipo lista_tipo;

ALTER TABLE vendas_config
ADD COLUMN lista_tipo lista_tipo;

ALTER TABLE analise_config
ADD COLUMN lista_tipo lista_tipo;

-- Atualizar registros existentes para usar 'categoria' como padrão
-- quando o tipo de visualização for 'list'
UPDATE dashboard_config
SET lista_tipo = 'categoria'
WHERE tipo_visualizacao = 'list' AND lista_tipo IS NULL;

UPDATE vendas_config
SET lista_tipo = 'categoria'
WHERE tipo_visualizacao = 'list' AND lista_tipo IS NULL;

UPDATE analise_config
SET lista_tipo = 'categoria'
WHERE tipo_visualizacao = 'list' AND lista_tipo IS NULL;