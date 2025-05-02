/*
  # Corrigir dados de clientes e lançamentos

  1. Alterações
    - Inserir clientes de teste com dados completos
    - Associar lançamentos aos clientes
    - Garantir que existam dados suficientes para visualização
    
  2. Segurança
    - Verifica existência antes de inserir
    - Usa transações para garantir consistência
*/

-- Inserir dados de teste para clientes e lançamentos
DO $$
DECLARE
  empresa_id uuid;
  cliente_id1 uuid;
  cliente_id2 uuid;
  cliente_id3 uuid;
  cliente_id4 uuid;
  cliente_id5 uuid;
BEGIN
  -- Obter uma empresa para associar os clientes
  SELECT id INTO empresa_id FROM empresas LIMIT 1;
  
  IF empresa_id IS NOT NULL THEN
    -- Criar clientes de teste
    INSERT INTO clientes (razao_social, nome_fantasia, cnpj, empresa_id, ativo)
    VALUES 
      ('Cliente Premium A', 'Premium A', '12345678000190', empresa_id, true)
    ON CONFLICT (cnpj) DO UPDATE 
    SET razao_social = 'Cliente Premium A', nome_fantasia = 'Premium A'
    RETURNING id INTO cliente_id1;
    
    INSERT INTO clientes (razao_social, nome_fantasia, cnpj, empresa_id, ativo)
    VALUES 
      ('Cliente Premium B', 'Premium B', '98765432000121', empresa_id, true)
    ON CONFLICT (cnpj) DO UPDATE 
    SET razao_social = 'Cliente Premium B', nome_fantasia = 'Premium B'
    RETURNING id INTO cliente_id2;
    
    INSERT INTO clientes (razao_social, nome_fantasia, cnpj, empresa_id, ativo)
    VALUES 
      ('Cliente Premium C', 'Premium C', '45678912000134', empresa_id, true)
    ON CONFLICT (cnpj) DO UPDATE 
    SET razao_social = 'Cliente Premium C', nome_fantasia = 'Premium C'
    RETURNING id INTO cliente_id3;
    
    INSERT INTO clientes (razao_social, nome_fantasia, cnpj, empresa_id, ativo)
    VALUES 
      ('Cliente Standard A', 'Standard A', '11122233344455', empresa_id, true)
    ON CONFLICT (cnpj) DO UPDATE 
    SET razao_social = 'Cliente Standard A', nome_fantasia = 'Standard A'
    RETURNING id INTO cliente_id4;
    
    INSERT INTO clientes (razao_social, nome_fantasia, cnpj, empresa_id, ativo)
    VALUES 
      ('Cliente Standard B', 'Standard B', '55544433322211', empresa_id, true)
    ON CONFLICT (cnpj) DO UPDATE 
    SET razao_social = 'Cliente Standard B', nome_fantasia = 'Standard B'
    RETURNING id INTO cliente_id5;
    
    -- Inserir lançamentos para os clientes
    -- Cliente Premium A
    INSERT INTO lancamentos (valor, tipo, mes, ano, cliente_id, empresa_id, descricao)
    VALUES 
      (8500.00, 'receita', 1, 2023, cliente_id1, empresa_id, 'Venda Premium A - Jan'),
      (9200.00, 'receita', 2, 2023, cliente_id1, empresa_id, 'Venda Premium A - Fev'),
      (7800.00, 'receita', 3, 2023, cliente_id1, empresa_id, 'Venda Premium A - Mar'),
      (8900.00, 'receita', 4, 2023, cliente_id1, empresa_id, 'Venda Premium A - Abr'),
      (9500.00, 'receita', 5, 2023, cliente_id1, empresa_id, 'Venda Premium A - Mai');
      
    -- Cliente Premium B
    INSERT INTO lancamentos (valor, tipo, mes, ano, cliente_id, empresa_id, descricao)
    VALUES 
      (7200.00, 'receita', 1, 2023, cliente_id2, empresa_id, 'Venda Premium B - Jan'),
      (7800.00, 'receita', 2, 2023, cliente_id2, empresa_id, 'Venda Premium B - Fev'),
      (8100.00, 'receita', 3, 2023, cliente_id2, empresa_id, 'Venda Premium B - Mar'),
      (7500.00, 'receita', 4, 2023, cliente_id2, empresa_id, 'Venda Premium B - Abr'),
      (8300.00, 'receita', 5, 2023, cliente_id2, empresa_id, 'Venda Premium B - Mai');
      
    -- Cliente Premium C
    INSERT INTO lancamentos (valor, tipo, mes, ano, cliente_id, empresa_id, descricao)
    VALUES 
      (6500.00, 'receita', 1, 2023, cliente_id3, empresa_id, 'Venda Premium C - Jan'),
      (6800.00, 'receita', 2, 2023, cliente_id3, empresa_id, 'Venda Premium C - Fev'),
      (7200.00, 'receita', 3, 2023, cliente_id3, empresa_id, 'Venda Premium C - Mar'),
      (6900.00, 'receita', 4, 2023, cliente_id3, empresa_id, 'Venda Premium C - Abr'),
      (7500.00, 'receita', 5, 2023, cliente_id3, empresa_id, 'Venda Premium C - Mai');
      
    -- Cliente Standard A
    INSERT INTO lancamentos (valor, tipo, mes, ano, cliente_id, empresa_id, descricao)
    VALUES 
      (4200.00, 'receita', 1, 2023, cliente_id4, empresa_id, 'Venda Standard A - Jan'),
      (4500.00, 'receita', 2, 2023, cliente_id4, empresa_id, 'Venda Standard A - Fev'),
      (4100.00, 'receita', 3, 2023, cliente_id4, empresa_id, 'Venda Standard A - Mar'),
      (4800.00, 'receita', 4, 2023, cliente_id4, empresa_id, 'Venda Standard A - Abr'),
      (5200.00, 'receita', 5, 2023, cliente_id4, empresa_id, 'Venda Standard A - Mai');
      
    -- Cliente Standard B
    INSERT INTO lancamentos (valor, tipo, mes, ano, cliente_id, empresa_id, descricao)
    VALUES 
      (3800.00, 'receita', 1, 2023, cliente_id5, empresa_id, 'Venda Standard B - Jan'),
      (3500.00, 'receita', 2, 2023, cliente_id5, empresa_id, 'Venda Standard B - Fev'),
      (3900.00, 'receita', 3, 2023, cliente_id5, empresa_id, 'Venda Standard B - Mar'),
      (4100.00, 'receita', 4, 2023, cliente_id5, empresa_id, 'Venda Standard B - Abr'),
      (4300.00, 'receita', 5, 2023, cliente_id5, empresa_id, 'Venda Standard B - Mai');
  END IF;
END $$;