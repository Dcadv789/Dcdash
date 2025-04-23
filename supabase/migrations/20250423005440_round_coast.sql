/*
  # Adicionar chaves estrangeiras
  
  Esta migração restaura as chaves estrangeiras que foram removidas anteriormente
  para garantir a integridade referencial entre as tabelas.
*/

-- Adicionar chaves estrangeiras
ALTER TABLE usuarios
  ADD CONSTRAINT usuarios_empresa_id_fkey 
  FOREIGN KEY (empresa_id) 
  REFERENCES empresas(id);

ALTER TABLE usuarios_empresas
  ADD CONSTRAINT usuarios_empresas_usuario_id_fkey 
  FOREIGN KEY (usuario_id) 
  REFERENCES usuarios(id) 
  ON DELETE CASCADE;

ALTER TABLE usuarios_empresas
  ADD CONSTRAINT usuarios_empresas_empresa_id_fkey 
  FOREIGN KEY (empresa_id) 
  REFERENCES empresas(id) 
  ON DELETE CASCADE;