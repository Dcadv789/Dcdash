/*
  # Sistema de manutenção para evitar pausa do projeto

  1. Nova Tabela
    - `keep_alive_logs`: Armazena registros das consultas de manutenção
      - `id` (uuid, chave primária)
      - `timestamp` (timestamptz, quando a consulta foi executada)
      - `success` (boolean, se a consulta foi bem-sucedida)
      - `details` (text, detalhes adicionais ou mensagens de erro)
      
  2. Segurança
    - RLS habilitado
    - Políticas básicas para usuários autenticados
*/

-- Criar tabela de logs para o sistema keep-alive
CREATE TABLE IF NOT EXISTS keep_alive_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp timestamptz DEFAULT now(),
  success boolean NOT NULL,
  details text
);

-- Habilitar RLS
ALTER TABLE keep_alive_logs ENABLE ROW LEVEL SECURITY;

-- Criar políticas de acesso
CREATE POLICY "Usuários autenticados podem ver todos os logs"
  ON keep_alive_logs
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários autenticados podem inserir logs"
  ON keep_alive_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Criar índice para melhorar performance de consultas
CREATE INDEX idx_keep_alive_logs_timestamp ON keep_alive_logs(timestamp);

-- Criar função para registrar uma consulta de manutenção
CREATE OR REPLACE FUNCTION register_keep_alive()
RETURNS integer AS $$
BEGIN
  INSERT INTO keep_alive_logs (success, details)
  VALUES (true, 'Consulta de manutenção executada com sucesso');
  
  RETURN 0;
END;
$$ LANGUAGE plpgsql;