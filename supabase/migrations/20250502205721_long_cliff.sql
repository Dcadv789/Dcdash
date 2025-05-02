/*
  # Adicionar dados de clientes aos lançamentos

  1. Alterações
    - Garantir que a coluna cliente_id existe na tabela lancamentos
    - Adicionar índice para cliente_id para melhorar performance
    
  2. Segurança
    - Mantém a integridade referencial com a tabela clientes
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

-- Inserir alguns dados de teste para clientes se não existirem
DO $$
DECLARE
  empresa_id uuid;
  cliente_id uuid;
BEGIN
  -- Obter uma empresa para associar os clientes
  SELECT id INTO empresa_id FROM empresas LIMIT 1;
  
  IF empresa_id IS NOT NULL THEN
    -- Verificar se já existem lançamentos com cliente_id
    IF NOT EXISTS (SELECT 1 FROM lancamentos WHERE cliente_id IS NOT NULL LIMIT 1) THEN
      -- Obter um cliente existente ou criar um novo
      SELECT id INTO cliente_id FROM clientes WHERE empresa_id = empresa_id LIMIT 1;
      
      IF cliente_id IS NULL THEN
        -- Criar um cliente de teste
        INSERT INTO clientes (razao_social, empresa_id)
        VALUES ('Cliente Teste', empresa_id)
        RETURNING id INTO cliente_id;
      END IF;
      
      -- Atualizar alguns lançamentos de receita para associar ao cliente
      UPDATE lancamentos
      SET cliente_id = cliente_id
      WHERE tipo = 'receita' 
      AND empresa_id = empresa_id
      AND cliente_id IS NULL
      LIMIT 10;
    END IF;
  END IF;
END $$;