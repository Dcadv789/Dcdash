/*
  # Adicionar colunas na tabela de clientes

  1. Alterações
    - Adicionar coluna nome_fantasia (texto)
    - Adicionar coluna cnpj (texto)
    
  2. Segurança
    - Mantém a estrutura existente
    - Apenas adiciona novas colunas
*/

ALTER TABLE clientes
ADD COLUMN nome_fantasia text,
ADD COLUMN cnpj text;

-- Criar índice para CNPJ
CREATE INDEX IF NOT EXISTS idx_clientes_cnpj ON clientes(cnpj);