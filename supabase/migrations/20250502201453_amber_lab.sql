/*
  # Adicionar tipo de lista nas configurações de dashboard

  1. Alterações
    - Adicionar coluna lista_tipo nas tabelas:
      - vendas_config
      - analise_config
    
  2. Segurança
    - Mantém a estrutura existente
    - Apenas adiciona nova coluna com enum
*/

-- Adicionar coluna lista_tipo nas tabelas de configuração
ALTER TABLE vendas_config
ADD COLUMN lista_tipo lista_tipo;

ALTER TABLE analise_config
ADD COLUMN lista_tipo lista_tipo;

-- Atualizar registros existentes para usar 'categoria' como padrão
UPDATE vendas_config
SET lista_tipo = 'categoria'
WHERE tipo_visualizacao = 'list' AND lista_tipo IS NULL;

UPDATE analise_config
SET lista_tipo = 'categoria'
WHERE tipo_visualizacao = 'list' AND lista_tipo IS NULL;