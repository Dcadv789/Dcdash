import React, { useEffect, useState } from 'react';
import { Dialog } from '@headlessui/react';
import { X, Plus, Trash2 } from 'lucide-react';
import InputMask from 'react-input-mask';
import { supabase } from '../../lib/supabase';
import Input from './Input';
import Button from './Button';

interface Socio {
  nome: string;
  cpf: string;
  participacao: number;
}

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
    socios: Socio[];
    data_contrato: string;
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
    socios: [] as Socio[],
    data_contrato: ''
  });

  useEffect(() => {
    if (editingCompany) {
      setFormData({
        razao_social: editingCompany.razao_social,
        nome_fantasia: editingCompany.nome_fantasia || '',
        cnpj: editingCompany.cnpj || '',
        ativo: editingCompany.ativo,
        socios: editingCompany.socios || [],
        data_contrato: editingCompany.data_contrato || ''
      });
    } else {
      setFormData({
        razao_social: '',
        nome_fantasia: '',
        cnpj: '',
        ativo: true,
        socios: [],
        data_contrato: ''
      });
    }
  }, [editingCompany]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const dataToSend = {
        ...formData,
        cnpj: formData.cnpj.replace(/\D/g, ''),
        socios: formData.socios.map(socio => ({
          ...socio,
          cpf: socio.cpf.replace(/\D/g, '')
        }))
      };

      if (editingCompany) {
        const { error } = await supabase
          .from('empresas')
          .update(dataToSend)
          .eq('id', editingCompany.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('empresas')
          .insert([dataToSend]);

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

  const addSocio = () => {
    setFormData({
      ...formData,
      socios: [...formData.socios, { nome: '', cpf: '', participacao: 0 }]
    });
  };

  const removeSocio = (index: number) => {
    setFormData({
      ...formData,
      socios: formData.socios.filter((_, i) => i !== index)
    });
  };

  const updateSocio = (index: number, field: keyof Socio, value: string | number) => {
    const newSocios = [...formData.socios];
    newSocios[index] = { ...newSocios[index], [field]: value };
    setFormData({ ...formData, socios: newSocios });
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/70" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-2xl bg-[#1e1e1e] rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <Dialog.Title className="text-2xl font-bold text-white">
              {editingCompany ? 'Editar Empresa' : 'Nova Empresa'}
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  CNPJ
                </label>
                <InputMask
                  mask="99.999.999/9999-99"
                  value={formData.cnpj}
                  onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                  className="w-full px-4 py-3 bg-[#2b2b2b] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="00.000.000/0000-00"
                />
              </div>

              <Input
                type="date"
                label="Data do Contrato"
                value={formData.data_contrato}
                onChange={(e) => setFormData({ ...formData, data_contrato: e.target.value })}
              />
            </div>

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

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-300">
                  Sócios
                </label>
                <button
                  type="button"
                  onClick={addSocio}
                  className="text-blue-500 hover:text-blue-400 flex items-center gap-1.5 transition-colors"
                >
                  <Plus size={16} />
                  Adicionar Sócio
                </button>
              </div>

              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                {formData.socios.map((socio, index) => (
                  <div key={index} className="space-y-4 p-4 bg-[#2b2b2b] rounded-xl relative">
                    <button
                      type="button"
                      onClick={() => removeSocio(index)}
                      className="absolute top-3 right-3 text-red-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>

                    <Input
                      label="Nome do Sócio"
                      value={socio.nome}
                      onChange={(e) => updateSocio(index, 'nome', e.target.value)}
                      required
                    />

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-300">
                        CPF
                      </label>
                      <InputMask
                        mask="999.999.999-99"
                        value={socio.cpf}
                        onChange={(e) => updateSocio(index, 'cpf', e.target.value)}
                        className="w-full px-4 py-3 bg-[#2b2b2b] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="000.000.000-00"
                        required
                      />
                    </div>

                    <Input
                      type="number"
                      label="Participação (%)"
                      value={socio.participacao.toString()}
                      onChange={(e) => updateSocio(index, 'participacao', parseFloat(e.target.value))}
                      min="0"
                      max="100"
                      required
                    />
                  </div>
                ))}
              </div>
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