import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Card from '../components/Card';
import UserModal from '../components/forms/UserModal';

interface Usuario {
  id: string;
  nome: string;
  email: string;
  permissao: 'master' | 'consultor' | 'cliente' | 'viewer';
  empresa_id: string | null;
  cargo: string | null;
  ativo: boolean;
  created_at: string;
}

const Usuarios: React.FC = () => {
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

      if (error) throw error;
      setUsuarios(data || []);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
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

      if (error) throw error;
      await carregarUsuarios();
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
    }
  };

  const getStatusColor = (ativo: boolean) => {
    return ativo
      ? 'bg-green-500/10 text-green-500'
      : 'bg-red-500/10 text-red-500';
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-300">Gestão de Usuários</h2>
              <p className="text-gray-400 mt-1">
                Gerencie os usuários do sistema e suas permissões de acesso
              </p>
            </div>
            <button
              onClick={() => {
                setEditingUser(undefined);
                setIsModalOpen(true);
              }}
              className="px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl flex items-center gap-2 text-sm font-medium transition-colors"
            >
              <Plus size={18} />
              Novo Usuário
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-800">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#2b2b2b]">
                    <th className="px-6 py-4 text-left text-sm text-gray-400 font-medium">Nome</th>
                    <th className="px-6 py-4 text-left text-sm text-gray-400 font-medium">Email</th>
                    <th className="px-6 py-4 text-left text-sm text-gray-400 font-medium">Cargo</th>
                    <th className="px-6 py-4 text-left text-sm text-gray-400 font-medium">Permissão</th>
                    <th className="px-6 py-4 text-left text-sm text-gray-400 font-medium">Status</th>
                    <th className="px-6 py-4 text-right text-sm text-gray-400 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {usuarios.map((usuario) => (
                    <tr key={usuario.id} className="hover:bg-[#2b2b2b]/50">
                      <td className="px-6 py-4 whitespace-nowrap">{usuario.nome}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{usuario.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{usuario.cargo || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-500">
                          {usuario.permissao}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(usuario.ativo)}`}>
                          {usuario.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleEdit(usuario)}
                            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(usuario.id)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
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
        </div>
      </Card>

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