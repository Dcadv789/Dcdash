import React, { useEffect, useState } from 'react';
import { Dialog } from '@headlessui/react';
import { X, User, Building2, Shield } from 'lucide-react';
import Select from 'react-select';
import { supabase } from '../../lib/supabase';
import Button from './Button';
import { useNotification } from '../notifications/useNotification';

interface Empresa {
  id: string;
  razao_social: string;
  nome_fantasia: string;
}

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingUser?: {
    id: string;
    nome: string;
    email: string;
    permissao: string;
    empresa_id: string | null;
    cargo: string | null;
    ativo: boolean;
  };
}

const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, onSuccess, editingUser }) => {
  const { notifySuccess, notifyError } = useNotification();
  const [loading, setLoading] = useState(false);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    permissao: 'viewer',
    empresa_id: '',
    cargo: '',
    ativo: true,
    selectedEmpresas: [] as string[]
  });

  useEffect(() => {
    loadEmpresas();
    if (editingUser) {
      setFormData({
        nome: editingUser.nome,
        email: editingUser.email,
        permissao: editingUser.permissao,
        empresa_id: editingUser.empresa_id || '',
        cargo: editingUser.cargo || '',
        ativo: editingUser.ativo,
        selectedEmpresas: []
      });
      
      if (editingUser.permissao === 'consultor') {
        loadUserEmpresas(editingUser.id);
      }
    } else {
      setFormData({
        nome: '',
        email: '',
        permissao: 'viewer',
        empresa_id: '',
        cargo: '',
        ativo: true,
        selectedEmpresas: []
      });
    }
  }, [editingUser]);

  const loadEmpresas = async () => {
    try {
      const { data, error } = await supabase
        .from('empresas')
        .select('id, razao_social, nome_fantasia')
        .order('razao_social');

      if (error) {
        console.error('Erro ao carregar empresas:', error);
        notifyError('Não foi possível carregar a lista de empresas. Por favor, tente novamente.');
        return;
      }
      
      if (data) setEmpresas(data);
    } catch (err) {
      console.error('Erro ao carregar empresas:', err);
      notifyError('Erro inesperado ao carregar empresas. Por favor, tente novamente.');
    }
  };

  const loadUserEmpresas = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('usuarios_empresas')
        .select('empresa_id')
        .eq('usuario_id', userId);
      
      if (error) {
        console.error('Erro ao carregar empresas do usuário:', error);
        notifyError('Não foi possível carregar as empresas associadas ao usuário.');
        return;
      }
      
      if (data) {
        setFormData(prev => ({
          ...prev,
          selectedEmpresas: data.map(item => item.empresa_id)
        }));
      }
    } catch (err) {
      console.error('Erro ao carregar empresas do usuário:', err);
      notifyError('Erro inesperado ao carregar empresas do usuário.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!editingUser) {
        notifyError('Usuário não encontrado');
        return;
      }

      // Atualizar usuário
      const userData = {
        nome: formData.nome,
        permissao: formData.permissao,
        empresa_id: ['cliente', 'viewer'].includes(formData.permissao) ? formData.empresa_id : null,
        cargo: formData.cargo || null,
        ativo: formData.ativo
      };

      const { error: userError } = await supabase
        .from('usuarios')
        .update(userData)
        .eq('id', editingUser.id);

      if (userError) {
        console.error('Erro ao atualizar usuário:', userError);
        notifyError('Não foi possível atualizar os dados do usuário.');
        return;
      }

      // Atualizar relações de empresas para consultores
      if (formData.permissao === 'consultor') {
        // Remover relações existentes
        const { error: deleteError } = await supabase
          .from('usuarios_empresas')
          .delete()
          .eq('usuario_id', editingUser.id);

        if (deleteError) {
          console.error('Erro ao remover relações existentes:', deleteError);
          notifyError('Erro ao atualizar as empresas associadas ao usuário.');
          return;
        }

        // Adicionar novas relações
        if (formData.selectedEmpresas.length > 0) {
          const relacoes = formData.selectedEmpresas.map(empresaId => ({
            usuario_id: editingUser.id,
            empresa_id: empresaId
          }));

          const { error: insertError } = await supabase
            .from('usuarios_empresas')
            .insert(relacoes);

          if (insertError) {
            console.error('Erro ao inserir novas relações:', insertError);
            notifyError('Erro ao adicionar novas empresas ao usuário.');
            return;
          }
        }
      }

      notifySuccess('Usuário atualizado com sucesso!');
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Erro ao atualizar usuário:', err);
      notifyError('Erro inesperado ao atualizar usuário.');
    } finally {
      setLoading(false);
    }
  };

  const empresasOptions = empresas.map(empresa => ({
    value: empresa.id,
    label: empresa.nome_fantasia || empresa.razao_social
  }));

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/70" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-2xl bg-[#1e1e1e] rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <Dialog.Title className="text-2xl font-bold text-white">
              Editar Usuário
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
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                  <User size={16} className="text-gray-400" />
                  Nome
                </label>
                <input
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full px-4 py-3 bg-[#2b2b2b] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                  <Shield size={16} className="text-gray-400" />
                  Permissão
                </label>
                <select
                  value={formData.permissao}
                  onChange={(e) => setFormData({ ...formData, permissao: e.target.value })}
                  className="w-full px-4 py-3 bg-[#2b2b2b] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="viewer">Viewer</option>
                  <option value="cliente">Cliente</option>
                  <option value="consultor">Consultor</option>
                  <option value="master">Master</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  className="w-full px-4 py-3 bg-[#2b2b2b] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 opacity-50"
                  disabled
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                  <Building2 size={16} className="text-gray-400" />
                  Cargo
                </label>
                <input
                  value={formData.cargo}
                  onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                  className="w-full px-4 py-3 bg-[#2b2b2b] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {['cliente', 'viewer'].includes(formData.permissao) && (
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                  <Building2 size={16} className="text-gray-400" />
                  Empresa
                </label>
                <select
                  value={formData.empresa_id}
                  onChange={(e) => setFormData({ ...formData, empresa_id: e.target.value })}
                  className="w-full px-4 py-3 bg-[#2b2b2b] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Selecione uma empresa</option>
                  {empresas.map(empresa => (
                    <option key={empresa.id} value={empresa.id}>
                      {empresa.nome_fantasia || empresa.razao_social}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {formData.permissao === 'consultor' && (
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                  <Building2 size={16} className="text-gray-400" />
                  Empresas
                </label>
                <Select
                  isMulti
                  options={empresasOptions}
                  value={empresasOptions.filter(option => 
                    formData.selectedEmpresas.includes(option.value)
                  )}
                  className="react-select-container"
                  classNamePrefix="react-select"
                  onChange={(selected) => {
                    setFormData({
                      ...formData,
                      selectedEmpresas: selected.map(option => option.value)
                    });
                  }}
                  styles={{
                    control: (base) => ({
                      ...base,
                      backgroundColor: '#2b2b2b',
                      borderColor: '#4b5563',
                      '&:hover': {
                        borderColor: '#6b7280'
                      }
                    }),
                    menu: (base) => ({
                      ...base,
                      backgroundColor: '#2b2b2b'
                    }),
                    option: (base, state) => ({
                      ...base,
                      backgroundColor: state.isFocused ? '#374151' : '#2b2b2b',
                      color: 'white'
                    }),
                    multiValue: (base) => ({
                      ...base,
                      backgroundColor: '#374151'
                    }),
                    multiValueLabel: (base) => ({
                      ...base,
                      color: 'white'
                    }),
                    multiValueRemove: (base) => ({
                      ...base,
                      color: 'white',
                      ':hover': {
                        backgroundColor: '#4b5563',
                        color: 'white'
                      }
                    })
                  }}
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                Status
              </label>
              <select
                value={formData.ativo.toString()}
                onChange={(e) => setFormData({ ...formData, ativo: e.target.value === 'true' })}
                className="w-full px-4 py-3 bg-[#2b2b2b] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="true">Ativo</option>
                <option value="false">Inativo</option>
              </select>
            </div>

            <div className="flex space-x-3">
              <Button
                type="button"
                onClick={onClose}
                className="bg-gray-700 hover:bg-gray-600"
              >
                Cancelar
              </Button>
              <Button type="submit" loading={loading}>
                Salvar
              </Button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default UserModal;