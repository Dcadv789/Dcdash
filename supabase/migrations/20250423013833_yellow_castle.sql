/*
  # Adicionar data do contrato e ajustar sócios

  1. Alterações
    - Adicionar coluna data_contrato
    - Modificar coluna socios para estrutura mais adequada
*/

ALTER TABLE empresas
ADD COLUMN IF NOT EXISTS data_contrato date;

-- Modificar a coluna socios para uma estrutura mais adequada
ALTER TABLE empresas
DROP COLUMN IF EXISTS socios;

ALTER TABLE empresas
ADD COLUMN IF NOT EXISTS socios jsonb[] DEFAULT ARRAY[]::jsonb[];

COMMENT ON COLUMN empresas.socios IS 'Array de sócios com estrutura: {nome: string, cpf: string, participacao: number}';