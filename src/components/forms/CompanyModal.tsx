import React, { useEffect, useState } from 'react';
import { Dialog } from '@headlessui/react';
import { X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Input from './Input';
import Button from './Button';

interface CompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingCompany?: {
    id: string;
    razao_social: string;
    nome_fantasia: string;
    cnpj: string;
    ativo: boolean;
    socios: any[];
  };
}

const CompanyModal: React.FC<CompanyModalProps> = ({ isOpen, onClose, onSuccess, editingCompany }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    razao_social: '',
    nome_fantasia: '',
    cnpj: '',
    ativo: true,
    socios: [] as any[]
  });

  useEffect(() => {
    if (editingCompany) {
      setFormData({
        razao_social: editingCompany.razao_social,
        nome_fantasia: editingCompany.nome_fantasia || '',
        cnpj: editingCompany.cnpj || '',
        ativo: editingCompany.ativo,
        socios: editingCompany.socios || []
      });
    }
  }, [editingCompany]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (editingCompany) {
        const { error } = await supabase
          .from('empresas')
          .update(formData)
          .eq('id', editingCompany.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('empresas')
          .insert([formData]);

        if (error) throw error;
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError('Erro ao salvar empresa');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/70" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md bg-[#1e1e1e] rounded-2xl p-6">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-xl font-bold">
              {editingCompany ? 'Editar Empresa' : 'Nova Empresa'}
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Razão Social"
              value={formData.razao_social}
              onChange={(e) => setFormData({ ...formData, razao_social: e.target.value })}
              required
            />

            <Input
              label="Nome Fantasia"
              value={formData.nome_fantasia}
              onChange={(e) => setFormData({ ...formData, nome_fantasia: e.target.value })}
            />

            <Input
              label="CNPJ"
              value={formData.cnpj}
              onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
            />

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Status
              </label>
              <select
                value={formData.ativo.toString()}
                onChange={(e) => setFormData({ ...formData, ativo: e.target.value === 'true' })}
                className="w-full px-4 py-3 bg-[#2b2b2b] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="true">Ativa</option>
                <option value="false">Inativa</option>
              </select>
            </div>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                <p className="text-sm text-red-500 text-center">{error}</p>
              </div>
            )}

            <div className="flex space-x-3">
              <Button
                type="button"
                onClick={onClose}
                className="bg-gray-700 hover:bg-gray-600"
              >
                Cancelar
              </Button>
              <Button type="submit" loading={loading}>
                {editingCompany ? 'Salvar' : 'Criar'}
              </Button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default CompanyModal;