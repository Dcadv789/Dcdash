/*
  # Enhance Company Information

  1. Changes
    - Rename 'nome' column to 'razao_social'
    - Add new columns for company details
      - nome_fantasia (text)
      - cnpj (text)
      - ativo (boolean)
      - socios (jsonb array)

  2. Security
    - Maintain existing RLS policies
*/

-- Rename nome column to razao_social
ALTER TABLE empresas RENAME COLUMN nome TO razao_social;

-- Add new columns
ALTER TABLE empresas
ADD COLUMN nome_fantasia text,
ADD COLUMN cnpj text UNIQUE,
ADD COLUMN ativo boolean DEFAULT true,
ADD COLUMN socios jsonb[] DEFAULT '{}';

-- Update existing data
UPDATE empresas
SET nome_fantasia = razao_social
WHERE nome_fantasia IS NULL;