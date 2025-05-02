/*
  # Adicionar código do cliente

  1. Alterações
    - Adicionar coluna codigo (texto, único)
    - Criar função para gerar código sequencial
    - Criar trigger para gerar código automaticamente
    
  2. Segurança
    - Garantir unicidade do código
    - Gerar código automaticamente na inserção
*/

-- Adicionar coluna codigo
ALTER TABLE clientes
ADD COLUMN codigo text UNIQUE;

-- Criar função para gerar código sequencial
CREATE OR REPLACE FUNCTION generate_client_code()
RETURNS trigger AS $$
DECLARE
  last_code text;
  new_number int;
BEGIN
  -- Get last code
  SELECT codigo INTO last_code
  FROM clientes
  ORDER BY codigo DESC
  LIMIT 1;
  
  -- Calculate new number
  IF last_code IS NULL THEN
    new_number := 1;
  ELSE
    new_number := (regexp_replace(last_code, '\D', '', 'g')::integer) + 1;
  END IF;
  
  -- Generate new code
  NEW.codigo := 'C' || LPAD(new_number::text, 4, '0');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para gerar código automaticamente
CREATE TRIGGER generate_client_code_trigger
  BEFORE INSERT ON clientes
  FOR EACH ROW
  EXECUTE FUNCTION generate_client_code();

-- Criar índice para código
CREATE INDEX IF NOT EXISTS idx_clientes_codigo ON clientes(codigo);