/*
  # Adicionar cliente_id na tabela de lançamentos

  1. Alterações
    - Garantir que a coluna cliente_id existe na tabela lancamentos
    - Adicionar índice para melhorar performance de consultas
    
  2. Segurança
    - Mantém a estrutura existente
    - Apenas garante que a coluna existe
*/

-- Verificar se a coluna cliente_id existe e adicioná-la se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'lancamentos' AND column_name = 'cliente_id'
  ) THEN
    ALTER TABLE lancamentos
    ADD COLUMN cliente_id uuid REFERENCES clientes(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Criar índice para cliente_id se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'lancamentos' AND indexname = 'idx_lancamentos_cliente_id'
  ) THEN
    CREATE INDEX idx_lancamentos_cliente_id ON lancamentos(cliente_id);
  END IF;
END $$;