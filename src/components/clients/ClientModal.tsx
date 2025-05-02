import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Cliente, Empresa } from '../../types/database';
import { supabase } from '../../lib/supabase';
import { Button } from '../shared/Button';
import { Modal } from '../shared/Modal';
import { useAuth } from '../../contexts/AuthContext';

interface ClientModalProps {
  client?: Cliente;
  onClose: () => void;
  onSave: () => void;
}

const ClientModal: React.FC<ClientModalProps> = ({ client, onClose, onSave }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [formData, setFormData] = useState({
    razao_social: client?.razao_social || '',
    nome_fantasia: client?.nome_fantasia || '',
    cnpj: client?.cnpj || '',
    empresa_id: client?.empresa_id || '',
  });

  // Carregar empresas se o usuário for master
  React.useEffect(() => {
    const fetchEmpresas = async () => {
      const { data: userData } = await supabase
        .from('usuarios')
        .select('permissao, empresa_id')
        .eq('auth_id', user?.id)
        .single();

      if (userData?.permissao === 'master') {
        const { data } = await supabase
          .from('empresas')
          .select('*')
          .eq('ativa', true)
          .order('razao_social');
        
        if (data) setEmpresas(data);
      } else if (userData?.empresa_id) {
        setFormData(prev => ({ ...prev, empresa_id: userData.empresa_id }));
      }
    };

    fetchEmpresas();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (client) {
        const { error } = await supabase
          .from('clientes')
          .update({
            razao_social: formData.razao_social,
            nome_fantasia: formData.nome_fantasia || null,
            cnpj: formData.cnpj || null,
          })
          .eq('id', client.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('clientes')
          .insert([{
            razao_social: formData.razao_social,
            nome_fantasia: formData.nome_fantasia || null,
            cnpj: formData.cnpj || null,
            empresa_id: formData.empresa_id,
            ativo: true,
          }]);

        if (error) throw error;
      }

      onSave();
      onClose();
    } catch (err) {
      console.error('Erro ao salvar cliente:', err);
      setError('Não foi possível salvar o cliente');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={client ? 'Editar Cliente' : 'Novo Cliente'}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-300">
            {error}
          </div>
        )}
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Razão Social
            </label>
            <input
              type="text"
              value={formData.razao_social}
              onChange={(e) => setFormData(prev => ({ ...prev, razao_social: e.target.value }))}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Nome Fantasia
            </label>
            <input
              type="text"
              value={formData.nome_fantasia}
              onChange={(e) => setFormData(prev => ({ ...prev, nome_fantasia: e.target.value }))}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              CNPJ
            </label>
            <input
              type="text"
              value={formData.cnpj}
              onChange={(e) => setFormData(prev => ({ ...prev, cnpj: e.target.value }))}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {empresas.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Empresa
              </label>
              <select
                value={formData.empresa_id}
                onChange={(e) => setFormData(prev => ({ ...prev, empresa_id: e.target.value }))}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Selecione uma empresa</option>
                {empresas.map(empresa => (
                  <option key={empresa.id} value={empresa.id}>
                    {empresa.razao_social}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        
        <div className="flex justify-end gap-3 pt-4">
          <Button
            variant="secondary"
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            loading={loading}
          >
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ClientModal;