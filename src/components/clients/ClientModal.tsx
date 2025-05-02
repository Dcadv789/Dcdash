import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Cliente } from '../../types/database';
import { supabase } from '../../lib/supabase';
import { Button } from '../shared/Button';
import { Modal } from '../shared/Modal';
import InputMask from 'react-input-mask';

interface ClientModalProps {
  client?: Cliente;
  selectedEmpresa: string;
  onClose: () => void;
  onSave: () => void;
}

const ClientModal: React.FC<ClientModalProps> = ({
  client,
  selectedEmpresa,
  onClose,
  onSave,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    razao_social: client?.razao_social || '',
    nome_fantasia: client?.nome_fantasia || '',
    cnpj: client?.cnpj || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!selectedEmpresa) {
        throw new Error('Selecione uma empresa');
      }

      const data = {
        razao_social: formData.razao_social,
        nome_fantasia: formData.nome_fantasia || null,
        cnpj: formData.cnpj.replace(/\D/g, '') || null,
        empresa_id: selectedEmpresa,
        ativo: true,
      };

      if (client) {
        const { error } = await supabase
          .from('clientes')
          .update(data)
          .eq('id', client.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('clientes')
          .insert([data]);

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

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Razão Social *
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
          <InputMask
            mask="99.999.999/9999-99"
            value={formData.cnpj}
            onChange={(e) => setFormData(prev => ({ ...prev, cnpj: e.target.value }))}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="00.000.000/0000-00"
          />
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