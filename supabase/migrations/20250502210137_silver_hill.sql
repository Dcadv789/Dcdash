/*
  # Adicionar dados de teste para clientes e lançamentos

  1. Alterações
    - Inserir clientes de teste se não existirem
    - Associar lançamentos existentes a clientes
    - Criar novos lançamentos para clientes se necessário
    
  2. Segurança
    - Verifica existência antes de inserir
    - Usa transações para garantir consistência
*/

-- Inserir dados de teste para clientes e lançamentos
DO $$
DECLARE
  empresa_id uuid;
  cliente_id uuid;
  cliente_id2 uuid;
  cliente_id3 uuid;
BEGIN
  -- Obter uma empresa para associar os clientes
  SELECT id INTO empresa_id FROM empresas LIMIT 1;
  
  IF empresa_id IS NOT NULL THEN
    -- Criar clientes de teste se não existirem
    IF NOT EXISTS (SELECT 1 FROM clientes WHERE razao_social = 'Cliente Teste A') THEN
      INSERT INTO clientes (razao_social, nome_fantasia, cnpj, empresa_id)
      VALUES ('Cliente Teste A', 'Cliente A', '12345678000190', empresa_id)
      RETURNING id INTO cliente_id;
    ELSE
      SELECT id INTO cliente_id FROM clientes WHERE razao_social = 'Cliente Teste A';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM clientes WHERE razao_social = 'Cliente Teste B') THEN
      INSERT INTO clientes (razao_social, nome_fantasia, cnpj, empresa_id)
      VALUES ('Cliente Teste B', 'Cliente B', '98765432000121', empresa_id)
      RETURNING id INTO cliente_id2;
    ELSE
      SELECT id INTO cliente_id2 FROM clientes WHERE razao_social = 'Cliente Teste B';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM clientes WHERE razao_social = 'Cliente Teste C') THEN
      INSERT INTO clientes (razao_social, nome_fantasia, cnpj, empresa_id)
      VALUES ('Cliente Teste C', 'Cliente C', '45678912000134', empresa_id)
      RETURNING id INTO cliente_id3;
    ELSE
      SELECT id INTO cliente_id3 FROM clientes WHERE razao_social = 'Cliente Teste C';
    END IF;
    
    -- Atualizar alguns lançamentos existentes para associar aos clientes
    UPDATE lancamentos
    SET cliente_id = cliente_id
    WHERE tipo = 'receita' 
    AND empresa_id = empresa_id
    AND cliente_id IS NULL
    AND id IN (SELECT id FROM lancamentos WHERE tipo = 'receita' AND empresa_id = empresa_id LIMIT 5);
    
    UPDATE lancamentos
    SET cliente_id = cliente_id2
    WHERE tipo = 'receita' 
    AND empresa_id = empresa_id
    AND cliente_id IS NULL
    AND id IN (SELECT id FROM lancamentos WHERE tipo = 'receita' AND empresa_id = empresa_id LIMIT 5);
    
    UPDATE lancamentos
    SET cliente_id = cliente_id3
    WHERE tipo = 'receita' 
    AND empresa_id = empresa_id
    AND cliente_id IS NULL
    AND id IN (SELECT id FROM lancamentos WHERE tipo = 'receita' AND empresa_id = empresa_id LIMIT 5);
    
    -- Inserir novos lançamentos se não houver suficientes
    IF (SELECT COUNT(*) FROM lancamentos WHERE cliente_id IS NOT NULL) < 10 THEN
      -- Inserir lançamentos para o primeiro cliente
      INSERT INTO lancamentos (valor, tipo, mes, ano, cliente_id, empresa_id, descricao)
      VALUES 
        (1500.00, 'receita', 5, 2023, cliente_id, empresa_id, 'Venda para Cliente A'),
        (2500.00, 'receita', 6, 2023, cliente_id, empresa_id, 'Venda para Cliente A'),
        (3500.00, 'receita', 7, 2023, cliente_id, empresa_id, 'Venda para Cliente A'),
        (4500.00, 'receita', 8, 2023, cliente_id, empresa_id, 'Venda para Cliente A'),
        (5500.00, 'receita', 9, 2023, cliente_id, empresa_id, 'Venda para Cliente A');
        
      -- Inserir lançamentos para o segundo cliente
      INSERT INTO lancamentos (valor, tipo, mes, ano, cliente_id, empresa_id, descricao)
      VALUES 
        (2000.00, 'receita', 5, 2023, cliente_id2, empresa_id, 'Venda para Cliente B'),
        (3000.00, 'receita', 6, 2023, cliente_id2, empresa_id, 'Venda para Cliente B'),
        (4000.00, 'receita', 7, 2023, cliente_id2, empresa_id, 'Venda para Cliente B'),
        (5000.00, 'receita', 8, 2023, cliente_id2, empresa_id, 'Venda para Cliente B'),
        (6000.00, 'receita', 9, 2023, cliente_id2, empresa_id, 'Venda para Cliente B');
        
      -- Inserir lançamentos para o terceiro cliente
      INSERT INTO lancamentos (valor, tipo, mes, ano, cliente_id, empresa_id, descricao)
      VALUES 
        (1000.00, 'receita', 5, 2023, cliente_id3, empresa_id, 'Venda para Cliente C'),
        (2000.00, 'receita', 6, 2023, cliente_id3, empresa_id, 'Venda para Cliente C'),
        (3000.00, 'receita', 7, 2023, cliente_id3, empresa_id, 'Venda para Cliente C'),
        (4000.00, 'receita', 8, 2023, cliente_id3, empresa_id, 'Venda para Cliente C'),
        (5000.00, 'receita', 9, 2023, cliente_id3, empresa_id, 'Venda para Cliente C');
    END IF;
  END IF;
END $$;