import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Card from '../components/Card';
import Button from '../components/forms/Button';
import UserModal from '../components/forms/UserModal';

interface Usuario {
  id: string;
  nome: string;
  email: string;
  permissao: 'master' | 'consultor' | 'cliente' | 'viewer';
  empresa_id: string | null;
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

  return (
    <div className="space-y-6">
      <Card>
        <div className="space-y-6">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-gray-300">Gestão de Usuários</h2>
              <p className="text-gray-400">
                Gerencie os usuários do sistema e suas permissões de acesso
              </p>
            </div>
            <Button
              onClick={() => {
                setEditingUser(undefined);
                setIsModalOpen(true);
              }}
              className="!w-auto !px-4 !py-2 !bg-blue-600 hover:!bg-blue-700"
            >
              <Plus size={18} className="mr-2" />
              Novo Usuário
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-gray-800">
                    <th className="pb-3 text-gray-400 font-medium">Nome</th>
                    <th className="pb-3 text-gray-400 font-medium">Email</th>
                    <th className="pb-3 text-gray-400 font-medium">Permissão</th>
                    <th className="pb-3 text-gray-400 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map((usuario) => (
                    <tr key={usuario.id} className="border-b border-gray-800">
                      <td className="py-4">{usuario.nome}</td>
                      <td className="py-4">{usuario.email}</td>
                      <td className="py-4">
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-500">
                          {usuario.permissao}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex space-x-2">
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