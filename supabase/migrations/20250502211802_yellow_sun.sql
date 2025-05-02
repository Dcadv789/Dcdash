-- Atualizar lançamentos para associar clientes
DO $$
DECLARE
  empresa_id uuid;
  cliente_id uuid;
BEGIN
  -- Obter uma empresa para associar os clientes
  SELECT id INTO empresa_id FROM empresas LIMIT 1;
  
  IF empresa_id IS NOT NULL THEN
    -- Atualizar lançamentos existentes para associar aos clientes
    FOR cliente_id IN SELECT id FROM clientes WHERE empresa_id = empresa_id LIMIT 5
    LOOP
      -- Atualizar alguns lançamentos de receita para associar ao cliente
      UPDATE lancamentos
      SET cliente_id = cliente_id
      WHERE tipo = 'receita' 
      AND empresa_id = empresa_id
      AND cliente_id IS NULL
      AND id IN (
        SELECT id FROM lancamentos 
        WHERE tipo = 'receita' 
        AND empresa_id = empresa_id 
        AND cliente_id IS NULL 
        LIMIT 5
      );
    END LOOP;
  END IF;
END $$;