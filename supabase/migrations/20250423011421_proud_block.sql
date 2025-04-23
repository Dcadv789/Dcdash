/*
  # Adicionar novos campos à tabela de usuários
  
  1. Novos Campos
    - cargo (texto)
    - ativo (booleano)
  
  2. Alterações
    - Adicionados campos para melhor gestão de usuários
    - Valor padrão true para campo ativo
*/

ALTER TABLE usuarios
ADD COLUMN IF NOT EXISTS cargo text,
ADD COLUMN IF NOT EXISTS ativo boolean DEFAULT true;