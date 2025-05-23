import React, { useEffect, useState } from 'react';
import { Pencil, Trash2, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';
import UserModal from '../components/forms/UserModal';
import { useNotification } from '../components/notifications/useNotification';

interface Usuario {
  id: string;
  nome: string;
  email: string;
  permissao: 'master' | 'consultor' | 'cliente' | 'viewer';
  empresa_id: string | null;
  cargo: string | null;
  ativo: boolean;
  created_at: string;
  auth_id: string;
}

const Usuarios: React.FC = () => {
  const { notifySuccess, notifyError } = useNotification();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | undefined>();

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const carregarUsuarios = async () => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar usuários:', error);
        notifyError('Não foi possível carregar a lista de usuários');
        return;
      }

      setUsuarios(data || []);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      notifyError('Erro inesperado ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (usuario: Usuario) => {
    setEditingUser(usuario);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return;

    try {
      const { error } = await supabase
        .from('usuarios')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao excluir usuário:', error);
        notifyError('Não foi possível excluir o usuário');
        return;
      }

      notifySuccess('Usuário excluído com sucesso');
      await carregarUsuarios();
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      notifyError('Erro inesperado ao excluir usuário');
    }
  };

  const getStatusColor = (ativo: boolean) => {
    return ativo
      ? 'bg-green-500/10 text-green-500'
      : 'bg-red-500/10 text-red-500';
  };

  const getPermissionColor = (permissao: string) => {
    const colors = {
      master: 'bg-purple-500/10 text-purple-500',
      consultor: 'bg-blue-500/10 text-blue-500',
      cliente: 'bg-green-500/10 text-green-500',
      viewer: 'bg-gray-500/10 text-gray-400'
    };
    return colors[permissao as keyof typeof colors] || colors.viewer;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Users size={28} className="text-gray-400" />
            Gestão de Usuários
          </h2>
          <p className="text-gray-400 mt-1">
            Gerencie os usuários do sistema e suas permissões de acesso
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-800 bg-[#1e1e1e]">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="px-4 py-3 text-left text-sm text-gray-400 font-medium">Nome</th>
                <th className="px-4 py-3 text-left text-sm text-gray-400 font-medium">Email</th>
                <th className="px-4 py-3 text-left text-sm text-gray-400 font-medium">Cargo</th>
                <th className="px-4 py-3 text-left text-sm text-gray-400 font-medium">Permissão</th>
                <th className="px-4 py-3 text-left text-sm text-gray-400 font-medium">Status</th>
                <th className="px-4 py-3 text-right text-sm text-gray-400 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {usuarios.map((usuario) => (
                <tr key={usuario.id} className="hover:bg-black/30">
                  <td className="px-4 py-3 whitespace-nowrap">{usuario.nome}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{usuario.email}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{usuario.cargo || '-'}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${getPermissionColor(usuario.permissao)}`}>
                      {usuario.permissao}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${getStatusColor(usuario.ativo)}`}>
                      {usuario.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleEdit(usuario)}
                        className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(usuario.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <UserModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingUser(undefined);
        }}
        onSuccess={carregarUsuarios}
        editingUser={editingUser}
      />
    </div>
  );
};

export default Usuarios;