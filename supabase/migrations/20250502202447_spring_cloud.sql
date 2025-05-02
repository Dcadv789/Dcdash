/*
  # Adicionar tipo de lista nas configurações de dashboard

  1. Alterações
    - Garantir que o enum lista_tipo existe
    - Adicionar coluna lista_tipo nas tabelas:
      - vendas_config
      - analise_config
    
  2. Segurança
    - Mantém a estrutura existente
    - Apenas adiciona nova coluna com enum
*/

-- Verificar se o enum lista_tipo existe
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'lista_tipo') THEN
    CREATE TYPE lista_tipo AS ENUM ('categoria', 'cliente');
  END IF;
END$$;

-- Adicionar coluna lista_tipo nas tabelas de configuração
ALTER TABLE vendas_config
ADD COLUMN IF NOT EXISTS lista_tipo lista_tipo;

ALTER TABLE analise_config
ADD COLUMN IF NOT EXISTS lista_tipo lista_tipo;

-- Atualizar registros existentes para usar 'categoria' como padrão
UPDATE vendas_config
SET lista_tipo = 'categoria'
WHERE tipo_visualizacao = 'list' AND lista_tipo IS NULL;

UPDATE analise_config
SET lista_tipo = 'categoria'
WHERE tipo_visualizacao = 'list' AND lista_tipo IS NULL;